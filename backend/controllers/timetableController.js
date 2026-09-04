const db = require('../config/db');

const tbl = (req) => (req.query && req.query.draft === 'true') ? 'master_timetable_draft' : 'master_timetable';

// Keeps track of which slots are already taken
function makeSlot() {
    return {
        faculty: new Set(), room: new Set(),
        section: new Set(), sectionPartial: new Set(), subsection: new Set(),
        sectionCourse: {}, // Tracks course code and count per section
        facultyCourse: {}, // Tracks course per faculty
        roomCourse: {}    // Tracks course per room
    };
}

// Checks if we can fit a class in this slot without conflicts
function isFree(occ, tsId, facId, roomId, subId, secId, courseCode, oeNum) {
    const s = occ[tsId];
    if (!s) return true;

    if (facId && s.faculty.has(facId)) {
        const fc = s.facultyCourse[facId];
        if (!oeNum || !fc || fc.code !== courseCode || Number(fc.oeNum) !== Number(oeNum)) {
            return false;
        }
    }
    if (roomId && s.room.has(roomId)) {
        const rc = s.roomCourse[roomId];
        if (!oeNum || !rc || rc.code !== courseCode || Number(rc.oeNum) !== Number(oeNum)) {
            return false;
        }
    }
    if (subId && s.subsection.has(subId)) return false;
    if (secId) {
        if (s.section.has(secId) || s.sectionPartial.has(secId)) {
            // Let different electives share the same vertical slot if they're in the same group
            if (oeNum && s.sectionCourse[secId] && Number(s.sectionCourse[secId].oeNum) === Number(oeNum)) {
                return true;
            }
            return false;
        }
    }

    return true;
}

// Books this slot so nothing else can overlap it
function lockSlot(occ, wl, tsId, facId, roomId, subId, secId, courseCode, oeNum) {
    if (!occ[tsId]) occ[tsId] = makeSlot();
    const s = occ[tsId];
    if (facId) {
        s.faculty.add(facId);
        wl[facId] = (wl[facId] || 0) + 1;
        if (courseCode) s.facultyCourse[facId] = { code: courseCode, oeNum };
    }
    if (roomId) {
        s.room.add(roomId);
        if (courseCode) s.roomCourse[roomId] = { code: courseCode, oeNum };
    }
    if (subId) s.subsection.add(subId);
    if (secId) {
        (subId ? s.sectionPartial : s.section).add(secId);
        if (courseCode) {
            if (!s.sectionCourse[secId]) s.sectionCourse[secId] = { code: courseCode, count: 0, oeNum };
            s.sectionCourse[secId].count++;
        }
    }
}

// Free up the slot 
function unlockSlot(occ, wl, tsId, facId, roomId, subId, secId, courseCode) {
    const s = occ[tsId];
    if (!s) return;
    if (facId) {
        s.faculty.delete(facId);
        if (wl[facId] > 0) wl[facId]--;
        delete s.facultyCourse[facId];
    }
    if (roomId) {
        s.room.delete(roomId);
        delete s.roomCourse[roomId];
    }
    if (subId) s.subsection.delete(subId);
    if (secId) {
        (subId ? s.sectionPartial : s.section).delete(secId);
        if (courseCode && s.sectionCourse[secId]) {
            s.sectionCourse[secId].count--;
            if (s.sectionCourse[secId].count <= 0) delete s.sectionCourse[secId];
        }
    }
}

// Shuffle the array so we don't always pick the same order
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Skip the lunch break slot
function isSchedulable(ts) {
    return !ts.is_break;
}

// Make sure lab slots are actually back-to-back
function isValidBlock(block) {
    if (!block.length) return false;

    if (block.some(s => !isSchedulable(s))) return false;

    for (let i = 0; i < block.length - 1; i++) {
        if (block[i + 1].slot_order !== block[i].slot_order + 1) return false;
    }

    return true;
}

// Find valid windows for lab sessions (consecutive slots)
function getValidBlocks(daySlots, blockLen) {
    const len = Math.min(blockLen, 3);
    const blocks = [];

    // Group slots into consecutive non-break blocks
    let currentBlock = [];
    const sortedSlots = [...daySlots].sort((a, b) => a.slot_order - b.slot_order);

    for (const ts of sortedSlots) {
        if (ts.is_break) {
            if (currentBlock.length > 0) {
                collectBlocks(currentBlock);
                currentBlock = [];
            }
        } else {
            currentBlock.push(ts);
        }
    }
    if (currentBlock.length > 0) {
        collectBlocks(currentBlock);
    }

    function collectBlocks(slots) {
        for (let i = 0; i <= slots.length - len; i++) {
            const sub = slots.slice(i, i + len);
            if (isValidBlock(sub)) {
                blocks.push(sub);
            }
        }
    }

    return blocks;
}

// Check everything: faculty, rooms, and if the section is already busy
async function validate(conn, {
    master_id, section_id, subsection_id,
    course_code, faculty_id, room_id, timeslot_id, component_type
}, institute_id) {
    const excl = master_id ? ' AND master_id != ?' : '';
    const ep = master_id ? [master_id] : [];

    const [[tsRow]] = await conn.query(
        'SELECT day, start_time, end_time, is_break FROM time_slots WHERE timeslot_id=? AND institute_id=?',
        [timeslot_id, institute_id]
    );

    if (!tsRow) {
        return { ok: false, error: 'Invalid timeslot' };
    }

    if (tsRow.is_break) {
        return { ok: false, error: 'Cannot schedule in break slot' };
    }

    const [[courseRow]] = await conn.query(
        'SELECT course_id FROM courses WHERE course_code=? AND institute_id=? LIMIT 1', [course_code, institute_id]);
    if (!courseRow) return { ok: false, error: 'Invalid course_code' };

    const [[fa]] = await conn.query(
        `SELECT 1 FROM faculty_allocation
         WHERE faculty_id=? AND course_id=? AND section_id=? AND institute_id=?`,
        [faculty_id, courseRow.course_id, section_id, institute_id]);
    if (!fa) return { ok: false, error: 'Faculty not allocated to this course/section' };

    const [[rm]] = await conn.query(
        'SELECT room_type FROM rooms WHERE room_id=? AND institute_id=?', [room_id, institute_id]);
    if (!rm) return { ok: false, error: 'Invalid room' };
    if (component_type === 'LAB' && rm.room_type !== 'LAB')
        return { ok: false, error: 'LAB must use a LAB room' };
    if ((component_type === 'THEORY' || component_type === 'TUTORIAL') && rm.room_type !== 'CLASSROOM')
        return { ok: false, error: 'THEORY/TUTORIAL must use a CLASSROOM' };

    const [[fClash]] = await conn.query(
        `SELECT 1 FROM master_timetable WHERE faculty_id=? AND timeslot_id=? AND institute_id=?${excl}`,
        [faculty_id, timeslot_id, institute_id, ...ep]);
    if (fClash) return { ok: false, error: 'Faculty clash' };

    const [[rClash]] = await conn.query(
        `SELECT 1 FROM master_timetable WHERE room_id=? AND timeslot_id=? AND institute_id=?${excl}`,
        [room_id, timeslot_id, institute_id, ...ep]);
    if (rClash) return { ok: false, error: 'Room clash' };

    if (!subsection_id) {
        // Section-level entry: block if the slot already has ANY entry for this section
        // (section-level or subsection-level — can't add a section-wide class when subsections are active)
        const [[sc]] = await conn.query(
            `SELECT 1 FROM master_timetable
             WHERE section_id=? AND timeslot_id=? AND institute_id=?${excl}`,
            [section_id, timeslot_id, institute_id, ...ep]);
        if (sc) return { ok: false, error: 'Section already busy in this slot' };
    } else {
        // Subsection-level entry:
        // Rule A: Block if the section has a SECTION-LEVEL (non-subsection) entry in this slot
        const [[secLevelEntry]] = await conn.query(
            `SELECT 1 FROM master_timetable
             WHERE section_id=? AND timeslot_id=? AND subsection_id IS NULL AND institute_id=?${excl}`,
            [section_id, timeslot_id, institute_id, ...ep]);
        if (secLevelEntry) return { ok: false, error: 'This section has a section-wide class in this slot. Cannot add a subsection here.' };

        // Rule B: Block if this EXACT subsection is already busy in this slot
        // (different subsections of the same section are allowed to share a slot)
        const [[subC]] = await conn.query(
            `SELECT 1 FROM master_timetable WHERE subsection_id=? AND timeslot_id=? AND institute_id=?${excl}`,
            [subsection_id, timeslot_id, institute_id, ...ep]);
        if (subC) return { ok: false, error: 'This subsection is already busy in this slot.' };
    }

    return { ok: true, day: tsRow.day };
}

function isCourseOEForSection(course, sectionId, courseSections) {
    if (!course) return false;
    const cs = courseSections.find(r => r.course_code === course.course_code && Number(r.section_id) === Number(sectionId));
    if (cs && cs.section_is_open_elective !== null) {
        return cs.section_is_open_elective === 1;
    }
    if (course.is_open_elective === 1) return true;
    return courseSections.some(r => r.course_code === course.course_code && (r.section_is_open_elective === 1 || r.is_open_elective === 1));
}

function getOENumberForSection(course, sectionId, courseSections) {
    if (!course) return null;
    const cs = courseSections.find(r => r.course_code === course.course_code && Number(r.section_id) === Number(sectionId));
    if (cs && cs.section_is_open_elective !== null) {
        return cs.section_is_open_elective === 1 ? (cs.section_open_elective_number ?? course.open_elective_number) : null;
    }
    const anyCs = courseSections.find(r => r.course_code === course.course_code && (r.section_open_elective_number || r.open_elective_number));
    return course.open_elective_number ?? anyCs?.section_open_elective_number ?? anyCs?.open_elective_number ?? null;
}

// Helper to look up branch and program details for a section
async function getDenorm(conn, section_id, timeslot_id, institute_id) {
    const [[si]] = await conn.query(
        `SELECT s.branch_id, s.semester_id, sem.program_id
         FROM section s JOIN semester sem ON s.semester_id=sem.semester_id
         WHERE s.section_id=? AND s.institute_id=? AND sem.institute_id=?`, [section_id, institute_id, institute_id]);
    const [[ti]] = await conn.query(
        'SELECT day FROM time_slots WHERE timeslot_id=? AND institute_id=?', [timeslot_id, institute_id]);
    if (!si || !ti) return null;
    return { ...si, day: ti.day };
}


exports.addTimetableEntry = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { section_id, subsection_id, course_id, course_code,
            faculty_id, room_id, timeslot_id, component_type } = req.body;
        const v = await validate(conn, {
            section_id, subsection_id, course_code,
            faculty_id, room_id, timeslot_id, component_type
        }, req.user.institute_id);
        if (!v.ok) { await conn.rollback(); return res.status(400).json({ error: v.error }); }
        const dn = await getDenorm(conn, section_id, timeslot_id, req.user.institute_id);
        if (!dn) { await conn.rollback(); return res.status(400).json({ error: 'Invalid section/timeslot' }); }
        const [r] = await conn.query(
            `INSERT INTO master_timetable
             (day,timeslot_id,program_id,branch_id,semester_id,
              section_id,subsection_id,course_id,course_code,faculty_id,room_id,component_type,institute_id)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [v.day, timeslot_id, dn.program_id, dn.branch_id, dn.semester_id,
                section_id, subsection_id || null, course_id, course_code, faculty_id, room_id, component_type, req.user.institute_id]);
        await conn.commit();
        res.json({ success: true, master_id: r.insertId });
    } catch (e) { await conn.rollback(); res.status(500).json({ error: e.message }); }
    finally { conn.release(); }
};

exports.updateMasterEntry = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.params;
        const { section_id, subsection_id, course_id, course_code,
            faculty_id, room_id, timeslot_id, component_type } = req.body;
        const v = await validate(conn, {
            master_id: id, section_id, subsection_id,
            course_code, faculty_id, room_id, timeslot_id, component_type
        }, req.user.institute_id);
        if (!v.ok) { await conn.rollback(); return res.status(400).json({ error: v.error }); }
        const dn = await getDenorm(conn, section_id, timeslot_id, req.user.institute_id);
        if (!dn) { await conn.rollback(); return res.status(400).json({ error: 'Invalid section/timeslot' }); }
        const [r] = await conn.query(
            `UPDATE master_timetable
             SET day=?,timeslot_id=?,program_id=?,branch_id=?,semester_id=?,
                 section_id=?,subsection_id=?,course_id=?,course_code=?,faculty_id=?,
                 room_id=?,component_type=?
             WHERE master_id=? AND institute_id=?`,
            [v.day, timeslot_id, dn.program_id, dn.branch_id, dn.semester_id,
                section_id, subsection_id || null, course_id, course_code, faculty_id, room_id, component_type, id, req.user.institute_id]);
        if (!r.affectedRows) { await conn.rollback(); return res.status(404).json({ error: 'Entry not found' }); }
        await conn.commit();
        res.json({ success: true });
    } catch (e) { await conn.rollback(); res.status(500).json({ error: e.message }); }
    finally { conn.release(); }
};

exports.deleteMasterEntry = async (req, res) => {
    try {
        const [r] = await db.query(`DELETE FROM ${tbl(req)} WHERE master_id=? AND institute_id=?`, [req.params.id, req.user.institute_id]);
        if (!r.affectedRows) return res.status(404).json({ error: 'Entry not found' });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.clearMasterTimetable = async (req, res) => {
    try {
        // Require explicit confirmation to prevent accidental deletion
        if (req.body?.confirm !== true) {
            return res.status(400).json({ error: 'Must send { confirm: true } to delete the master timetable.' });
        }
        await db.query(`DELETE FROM ${tbl(req)} WHERE institute_id=?`, [req.user.institute_id]);
        res.json({ success: true, message: 'Master timetable cleared' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.startEditSession = async (req, res) => {
    try {
        await db.query('DELETE FROM master_timetable_draft WHERE institute_id = ?', [req.user.institute_id]);
        await db.query('INSERT INTO master_timetable_draft SELECT * FROM master_timetable WHERE institute_id = ?', [req.user.institute_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.saveEditSession = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const [draftRows] = await conn.query('SELECT 1 FROM master_timetable_draft WHERE institute_id = ? LIMIT 1', [req.user.institute_id]);
        if (!draftRows.length) { conn.release(); return res.status(400).json({ error: 'No active edit session' }); }

        await conn.beginTransaction();
        await conn.query('DELETE FROM master_timetable WHERE institute_id = ?', [req.user.institute_id]);
        await conn.query('INSERT INTO master_timetable SELECT * FROM master_timetable_draft WHERE institute_id = ?', [req.user.institute_id]);
        await conn.query('DELETE FROM master_timetable_draft WHERE institute_id = ?', [req.user.institute_id]);
        await conn.commit();
        res.json({ success: true });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
};

exports.cancelEditSession = async (req, res) => {
    try {
        await db.query('DELETE FROM master_timetable_draft WHERE institute_id = ?', [req.user.institute_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getTimetableBySection = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT mt.*,
                    c.course_name, 
                    IFNULL(cs.section_is_open_elective, c.is_open_elective) AS is_open_elective,
                    IFNULL(cs.section_open_elective_number, c.open_elective_number) AS open_elective_number,
                    f.faculty_name, f.faculty_short,
                    r.room_name,
                    sub.subsection_name,
                    ts.day, ts.start_time, ts.end_time, ts.slot_order,
                    cc.lab_group_type
             FROM master_timetable mt
             JOIN courses    c   ON mt.course_code   = c.course_code AND c.institute_id = mt.institute_id
             LEFT JOIN course_section cs ON cs.course_code = c.course_code AND cs.section_id = mt.section_id AND cs.institute_id = mt.institute_id
             JOIN faculty    f   ON mt.faculty_id    = f.faculty_id AND f.institute_id = mt.institute_id
             JOIN rooms      r   ON mt.room_id       = r.room_id AND r.institute_id = mt.institute_id
             JOIN time_slots ts  ON mt.timeslot_id   = ts.timeslot_id AND ts.institute_id = mt.institute_id
             LEFT JOIN subsection sub ON mt.subsection_id = sub.subsection_id AND sub.institute_id = mt.institute_id
             LEFT JOIN course_components cc
                    ON cc.course_code=mt.course_code AND cc.component_type=mt.component_type AND cc.institute_id = mt.institute_id
             WHERE mt.section_id=? AND mt.institute_id=?
             ORDER BY FIELD(ts.day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'),
                      ts.slot_order`,
            [req.params.section_id, req.user.institute_id]);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getMasterTimetable = async (req, res) => {
    try {
        const { program_id, year_id, semester_id } = req.query;
        let q = `
            SELECT mt.*,
                   c.course_name, 
                   IFNULL(cs.section_is_open_elective, c.is_open_elective) AS is_open_elective,
                   IFNULL(cs.section_open_elective_number, c.open_elective_number) AS open_elective_number,
                   f.faculty_short,
                   r.room_name,
                   sub.subsection_name,
                   sec.section_name,
                   b.branch_name,
                   sem.semester_number,
                   ts.day, ts.start_time, ts.end_time, ts.slot_order,
                   cc.lab_group_type
            FROM ${tbl(req)} mt
            JOIN courses    c   ON (mt.course_id = c.course_id OR (mt.course_id IS NULL AND mt.course_code = c.course_code AND mt.program_id = c.program_id)) AND c.institute_id = mt.institute_id
            LEFT JOIN course_section cs ON cs.course_code = c.course_code AND cs.section_id = mt.section_id AND cs.institute_id = mt.institute_id
            JOIN faculty    f   ON mt.faculty_id   = f.faculty_id AND f.institute_id = mt.institute_id
            JOIN rooms      r   ON mt.room_id      = r.room_id AND r.institute_id = mt.institute_id
            JOIN time_slots ts  ON mt.timeslot_id  = ts.timeslot_id AND ts.institute_id = mt.institute_id
            JOIN section    sec ON mt.section_id   = sec.section_id AND sec.institute_id = mt.institute_id
            JOIN branch     b   ON mt.branch_id    = b.branch_id AND b.institute_id = mt.institute_id
            JOIN semester   sem ON mt.semester_id  = sem.semester_id AND sem.institute_id = mt.institute_id
            LEFT JOIN subsection sub ON mt.subsection_id = sub.subsection_id AND sub.institute_id = mt.institute_id
            LEFT JOIN course_components cc
                   ON (cc.course_id=mt.course_id OR (mt.course_id IS NULL AND cc.course_code=mt.course_code)) AND cc.component_type=mt.component_type AND cc.institute_id = mt.institute_id
            WHERE mt.institute_id=?`;
        const p = [req.user.institute_id];
        if (program_id) { q += ' AND mt.program_id=?'; p.push(program_id); }
        if (year_id) { q += ' AND sem.year_id=?'; p.push(year_id); }
        if (semester_id) { q += ' AND mt.semester_id=?'; p.push(semester_id); }
        q += ` GROUP BY mt.master_id
               ORDER BY FIELD(ts.day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'),
                        ts.slot_order`;
        const [rows] = await db.query(q, p);
        res.json({ master_entries: rows });
    } catch (e) {
        console.error('[GET_TT] Error:', e.message);
        res.status(500).json({ error: e.message });
    }
};

exports.generateMasterTimetable = async (req, res) => {
    console.error('[GEN] Starting Master Timetable Generation...');
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[{ cnt }]] = await conn.query('SELECT COUNT(*) AS cnt FROM master_timetable WHERE institute_id = ?', [req.user.institute_id]);
        if (cnt > 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Timetable already exists. Delete it first.' });
        }

        const [semesters] = await conn.query('SELECT * FROM semester WHERE institute_id = ?', [req.user.institute_id]);
        const [allSections] = await conn.query(`
            SELECT s.*, sem.program_id, sem.semester_number
            FROM section s JOIN semester sem ON s.semester_id=sem.semester_id
            WHERE s.institute_id = ? AND sem.institute_id = ?`, [req.user.institute_id, req.user.institute_id]);
        const [allCourses] = await conn.query('SELECT * FROM courses WHERE institute_id = ?', [req.user.institute_id]);
        const [courseSections] = await conn.query('SELECT * FROM course_section WHERE institute_id = ?', [req.user.institute_id]);
        const [courseComponents] = await conn.query('SELECT * FROM course_components WHERE institute_id = ?', [req.user.institute_id]);
        const [facultyAllocations] = await conn.query(`
            SELECT fa.faculty_id, fa.course_id, fa.branch_id, fa.section_id,
                   c.course_code
            FROM faculty_allocation fa
            JOIN courses c ON fa.course_id = c.course_id AND c.institute_id = fa.institute_id
            WHERE fa.institute_id = ?`, [req.user.institute_id]);
        const [timeSlots] = await conn.query(`
            SELECT * FROM time_slots
            WHERE institute_id = ?
            ORDER BY FIELD(day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'),
                     slot_order`, [req.user.institute_id]);
        const [allRooms] = await conn.query('SELECT * FROM rooms WHERE institute_id = ?', [req.user.institute_id]);
        const [allSubsections] = await conn.query('SELECT * FROM subsection WHERE institute_id = ?', [req.user.institute_id]);

        // Fetch admin-set lab room preferences: course_id, branch_id → room_id
        const [labRoomPrefRows] = await conn.query(
            'SELECT course_id, branch_id, room_id FROM lab_room_preference WHERE institute_id = ?',
            [req.user.institute_id]
        );
        const labRoomPrefs = {};
        for (const row of labRoomPrefRows) {
            const key = row.branch_id ? `${row.course_id}_${row.branch_id}` : String(row.course_id);
            labRoomPrefs[key] = row.room_id;
        }


        const [programs] = await conn.query('SELECT * FROM program WHERE institute_id = ?', [req.user.institute_id]);
        const btechId = programs.find(p => {
            const n = p.program_name.toUpperCase();
            return n.includes('BTECH') || n.includes('B.TECH');
        })?.program_id;
        const bdesId = programs.find(p => {
            const n = p.program_name.toUpperCase();
            return n.includes('BDES') || n.includes('B.DES');
        })?.program_id;

        // Link each course to the program it belongs to
        const courseCodeProgs = {};
        allCourses.forEach(c => {
            const sem = semesters.find(s => Number(s.semester_id) === Number(c.semester_id));
            if (sem) {
                if (!courseCodeProgs[c.course_code]) courseCodeProgs[c.course_code] = new Set();
                courseCodeProgs[c.course_code].add(sem.program_id);
            }
        });

        const courseCodeUsage = {};
        for (const [code, progSet] of Object.entries(courseCodeProgs)) {
            const hasBTech = btechId && progSet.has(btechId);
            const hasBDes = bdesId && progSet.has(bdesId);
            courseCodeUsage[code] = (hasBTech && hasBDes) ? progSet.size : 1;
        }

        const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

        const slotsByDay = {};
        for (const d of DAYS) slotsByDay[d] = timeSlots.filter(ts => ts.day === d);

        // Skip breaks
        const schedulableByDay = {};
        for (const d of DAYS) schedulableByDay[d] = slotsByDay[d].filter(isSchedulable);

        const occ = {};  // Occupation map
        const wl = {};

        // Final list of rows to push to the database
        const inserts = [];

        function commitEntry(day, tsId, progId, branchId, semId,
            secId, subId, courseId, courseCode, facId, roomId, compType) {
            inserts.push([day, tsId, progId, branchId, semId,
                secId, subId || null, courseId, courseCode, facId, roomId, compType, req.user.institute_id]);

            const courseObj = allCourses.find(c => c.course_id === courseId);
            const rawOeNum = courseObj?.is_open_elective === 1 ? courseObj.open_elective_number : null;
            const oeKey = rawOeNum ? (compType === 'LAB' ? rawOeNum + '_LAB' : rawOeNum + '_THEORY') : null;

            lockSlot(occ, wl, tsId, facId, roomId, subId || null, secId, courseCode, oeKey);
        }

        function getFacultyForSection(courseId, sectionId) {
            return facultyAllocations.filter(fa =>
                Number(fa.course_id) === Number(courseId) && fa.section_id === sectionId
            );
        }

        function getFacultyForCourse(courseId) {
            const seen = new Set();
            return facultyAllocations.filter(fa => {
                if (Number(fa.course_id) !== Number(courseId) || seen.has(fa.faculty_id)) return false;
                seen.add(fa.faculty_id);
                return true;
            });
        }

        function findClassroom(cap, tsId, secId, courseCode, oeNum, excludeRoomIds = new Set()) {
            return allRooms
                .filter(r =>
                    r.room_type === 'CLASSROOM' &&
                    r.capacity >= cap &&
                    !excludeRoomIds.has(r.room_id) &&
                    isFree(occ, tsId, null, r.room_id, null, secId, courseCode, oeNum)
                )
                .sort((a, b) => a.capacity - b.capacity)[0] || null;
        }

        function findLabRoom(cap, block, subId, secId, courseCode, oeNum, usedRoomIds = new Set(), courseId = null, branchId = null) {
            // Find preferred room using branch-specific preference first, falling back to global course preference
            let prefRoomId = null;
            if (courseId) {
                if (branchId && labRoomPrefs[`${courseId}_${branchId}`]) {
                    prefRoomId = labRoomPrefs[`${courseId}_${branchId}`];
                } else if (labRoomPrefs[String(courseId)]) {
                    prefRoomId = labRoomPrefs[String(courseId)];
                }
            }

            if (prefRoomId) {
                const prefRoom = allRooms.find(r => r.room_id === prefRoomId);
                if (
                    prefRoom &&
                    prefRoom.capacity >= cap &&
                    !usedRoomIds.has(prefRoom.room_id) &&
                    block.every(ts =>
                        isFree(occ, ts.timeslot_id, null, prefRoom.room_id, subId || null, secId, courseCode, oeNum)
                    )
                ) {
                    return prefRoom; // Use the admin-specified room
                }
                return null; // Preferred room not available or capacity too small → do not fall back to other rooms
            }

            // Default: pick any free lab room (smallest capacity that fits)(Best Fit)
            return allRooms
                .filter(r =>
                    r.room_type === 'LAB' &&
                    r.capacity >= cap &&
                    !usedRoomIds.has(r.room_id) &&
                    block.every(ts =>
                        isFree(occ, ts.timeslot_id, null, r.room_id, subId || null, secId, courseCode, oeNum)
                    )
                )
                .sort((a, b) => a.capacity - b.capacity)[0] || null;
        }

        // Open Elective Scheduling (Global approach) 
        // Group ALL OE courses by open_elective_number across ALL programs/semesters.

        // Build global OE map: oeNumber → all course entries across programs (respecting branch level overrides)
        const globalOEMap = {};
        for (const c of allCourses) {
            const css = courseSections.filter(cs => cs.course_code === c.course_code);
            const oeNumsForCourse = new Set();
            for (const cs of css) {
                const isOE = cs.section_is_open_elective !== null ? (cs.section_is_open_elective === 1) : (c.is_open_elective === 1);
                if (isOE) {
                    const num = cs.section_is_open_elective !== null && cs.section_is_open_elective === 1
                        ? (cs.section_open_elective_number ?? c.open_elective_number)
                        : c.open_elective_number;
                    if (num) oeNumsForCourse.add(num);
                }
            }
            if (css.length === 0 && c.is_open_elective && c.open_elective_number) {
                oeNumsForCourse.add(c.open_elective_number);
            }
            for (const num of oeNumsForCourse) {
                (globalOEMap[num] ??= []).push(c);
            }
        }

        const globalOEGroups = [];
        for (const [oeNumber, courses] of Object.entries(globalOEMap)) {
            const variantsByCode = new Map(); // course_code → [course entries from each program]
            for (const c of courses) {
                if (!variantsByCode.has(c.course_code)) variantsByCode.set(c.course_code, []);
                variantsByCode.get(c.course_code).push(c);
            }

            const group = [];
            for (const [courseCode, variants] of variantsByCode) {
                const rep = variants.find(v => getFacultyForCourse(v.course_id).length > 0) || variants[0];
                if (getFacultyForCourse(rep.course_id).length > 0) {
                    group.push({ courseCode, representative: rep, allVariants: variants });
                }
            }

            if (group.length > 0) {
                globalOEGroups.push({ oeNum: oeNumber, group });
            }
        }
        globalOEGroups.sort((a, b) => b.group.length - a.group.length);
        console.error(`[DEBUG OE] globalOEGroups total=${globalOEGroups.length}`);

        // Theory OE Scheduling
        for (const { oeNum, group } of globalOEGroups) {
            console.error(`[DEBUG OE] Processing oeNum=${oeNum} courseCount=${group.length}`);
            const oeUsedDays = new Set();

            // Max theory hours across all representatives in this group
            let theoryHours = 0;
            for (const { courseCode, representative } of group) {
                const comps = courseComponents.filter(
                    cc => Number(cc.course_id) === Number(representative.course_id) && cc.component_type === 'THEORY'
                );
                console.log(`[DEBUG OE] course=${courseCode} theoryComps=${comps.length}`);
                if (comps.length > theoryHours) theoryHours = comps.length;
            }
            if (theoryHours === 0) continue;
            console.log(`[OE GROUP] oeNum=${oeNum} finalTheory=${theoryHours}`);

            const oeEligibleSecs = allSections.filter(sec =>
                group.some(({ allVariants }) => {
                    const v = allVariants.find(variant => Number(variant.program_id) === Number(sec.program_id));
                    if (!v) return false;
                    return courseSections.some(cs =>
                        cs.course_code === v.course_code &&
                        Number(cs.section_id) === Number(sec.section_id) &&
                        (cs.section_is_open_elective !== null ? cs.section_is_open_elective === 1 : v.is_open_elective === 1) &&
                        Number(cs.section_is_open_elective !== null && cs.section_is_open_elective === 1 ? (cs.section_open_elective_number ?? v.open_elective_number) : v.open_elective_number) === Number(oeNum)
                    );
                })
            );

            for (let h = 0; h < theoryHours; h++) {
                let placed = false;

                oeLoop:
                for (const day of shuffle(DAYS)) {
                    if (oeUsedDays.has(day)) continue;

                    let skipReasons = { facBusy: 0, roomsFull: 0, secBusy: 0 };

                    for (const ts of schedulableByDay[day]) {

                        // All eligible sections must be free at this timeslot
                        const allFree = oeEligibleSecs.every(sec =>
                            isFree(occ, ts.timeslot_id, null, null, null, sec.section_id, null, oeNum + '_THEORY')
                        );
                        if (!allFree) { skipReasons.secBusy++; continue; }

                        const assignments = [];
                        let feasible = true;
                        const assignedRoomsInGroup = new Set();

                        for (const { courseCode, representative } of group) {
                            const courseTheoryComps = courseComponents.filter(
                                cc => Number(cc.course_id) === Number(representative.course_id) && cc.component_type === 'THEORY'
                            );
                            if (h >= courseTheoryComps.length) continue;

                            const fac = getFacultyForCourse(representative.course_id).find(fa =>
                                isFree(occ, ts.timeslot_id, fa.faculty_id, null, null, null, courseCode, oeNum + '_THEORY')
                            );
                            if (!fac) { feasible = false; skipReasons.facBusy++; break; }

                            // Capacity: use the largest course_capacity across all variants
                            const cap = (() => {
                                const csRows = courseSections.filter(cs =>
                                    group.flatMap(g => g.allVariants).some(v => Number(cs.course_id) === Number(v.course_id))
                                );
                                const maxCap = csRows.reduce((m, cs) => Math.max(m, cs.course_capacity || 0), 0);
                                return maxCap || 60;
                            })();

                            const room = findClassroom(cap, ts.timeslot_id, null, courseCode, oeNum + '_THEORY', assignedRoomsInGroup);
                            if (!room) { feasible = false; skipReasons.roomsFull++; break; }

                            assignedRoomsInGroup.add(room.room_id);
                            assignments.push({ courseCode, representative, fac, room });
                        }

                        if (!feasible) continue;

                        // Commit to each eligible section, but only for courses whose branch_id matches
                        for (const sec of oeEligibleSecs) {
                            for (const { courseCode, fac, room } of assignments) {
                                const { allVariants } = group.find(g => g.courseCode === courseCode);

                                const v = allVariants.find(variant => Number(variant.program_id) === Number(sec.program_id));
                                const isSectionRegistered = v && courseSections.some(cs =>
                                    cs.course_code === v.course_code &&
                                    Number(cs.section_id) === Number(sec.section_id) &&
                                    (cs.section_is_open_elective !== null ? cs.section_is_open_elective === 1 : v.is_open_elective === 1) &&
                                    Number(cs.section_is_open_elective !== null && cs.section_is_open_elective === 1 ? (cs.section_open_elective_number ?? v.open_elective_number) : v.open_elective_number) === Number(oeNum)
                                );
                                if (!isSectionRegistered) continue;

                                const actualCourse = allVariants.find(v => Number(v.program_id) === Number(sec.program_id))
                                    || allVariants[0];

                                commitEntry(
                                    ts.day, ts.timeslot_id,
                                    sec.program_id, sec.branch_id, sec.semester_id,
                                    sec.section_id, null,
                                    actualCourse.course_id, courseCode, fac.faculty_id, room.room_id,
                                    'THEORY'
                                );
                            }
                        }

                        oeUsedDays.add(day);
                        placed = true;
                        break oeLoop;
                    }

                    if (!placed)
                        console.warn(`[OE] oeNum=${oeNum} h=${h + 1}: unplaced. Reasons: RoomsFull=${skipReasons.roomsFull}, FacBusy=${skipReasons.facBusy}, SecBusy=${skipReasons.secBusy}`);
                }
            }
        }

        // OE Lab Scheduling
        for (const { oeNum, group } of globalOEGroups) {

            // Find entries in this group that have LAB components
            const labGroup = [];
            const courseLabHours = {};
            for (const { courseCode, representative, allVariants } of group) {
                const labComps = courseComponents.filter(
                    cc => Number(cc.course_id) === Number(representative.course_id) && cc.component_type === 'LAB'
                );
                if (labComps.length > 0) {
                    labGroup.push({ courseCode, representative, allVariants });
                    courseLabHours[representative.course_id] = labComps.length;
                }
            }
            if (labGroup.length === 0) continue;

            const labHours = Math.max(...Object.values(courseLabHours));
            console.log(`[OE LAB GROUP] oeNum=${oeNum} finalLab=${labHours}`);

            let labHoursLeft = labHours;
            const oeUsedDays = new Set();
            const scheduledHours = {};
            for (const { representative } of labGroup) {
                scheduledHours[representative.course_id] = 0;
            }

            // Eligible sections for lab OE
            const oeLabEligibleSecs = allSections.filter(sec =>
                labGroup.some(({ allVariants }) => {
                    const v = allVariants.find(variant => Number(variant.program_id) === Number(sec.program_id));
                    if (!v) return false;
                    return courseSections.some(cs =>
                        cs.course_code === v.course_code &&
                        Number(cs.section_id) === Number(sec.section_id) &&
                        (cs.section_is_open_elective !== null ? cs.section_is_open_elective === 1 : v.is_open_elective === 1) &&
                        Number(cs.section_is_open_elective !== null && cs.section_is_open_elective === 1 ? (cs.section_open_elective_number ?? v.open_elective_number) : v.open_elective_number) === Number(oeNum)
                    );
                })
            );

            while (labHoursLeft > 0) {
                const blockLen = Math.min(labHoursLeft, 3);
                let placed = false;

                labDayLoop:
                for (const day of shuffle(DAYS)) {
                    if (oeUsedDays.has(day)) continue;

                    const validBlocks = getValidBlocks(slotsByDay[day], blockLen);

                    for (const block of validBlocks) {
                        // All eligible sections must be free for the entire block
                        const allFree = oeLabEligibleSecs.every(sec =>
                            block.every(ts =>
                                isFree(occ, ts.timeslot_id, null, null, null, sec.section_id, null, oeNum + '_LAB')
                            )
                        );
                        if (!allFree) continue;

                        const assignments = [];
                        let feasible = true;
                        const assignedRoomsInGroup = new Set();

                        for (const { courseCode, representative } of labGroup) {
                            const activeTs = block.filter((ts, idx) =>
                                scheduledHours[representative.course_id] + idx < courseLabHours[representative.course_id]
                            );
                            if (activeTs.length === 0) continue;

                            const fac = getFacultyForCourse(representative.course_id).find(fa =>
                                activeTs.every(ts =>
                                    isFree(occ, ts.timeslot_id, fa.faculty_id, null, null, null, courseCode, oeNum + '_LAB')
                                )
                            );
                            if (!fac) { feasible = false; break; }

                            const cap = (() => {
                                const csRows = courseSections.filter(cs =>
                                    labGroup.flatMap(g => g.allVariants).some(v => Number(cs.course_id) === Number(v.course_id))
                                );
                                const maxCap = csRows.reduce((m, cs) => Math.max(m, cs.course_capacity || 0), 0);
                                return maxCap || 30;
                            })();

                            const room = findLabRoom(
                                cap, activeTs, null, null, courseCode, oeNum + '_LAB', assignedRoomsInGroup, representative.course_id
                            );
                            if (!room) { feasible = false; break; }

                            assignedRoomsInGroup.add(room.room_id);
                            assignments.push({ courseCode, representative, allVariants: labGroup.find(g => g.courseCode === courseCode).allVariants, fac, room, activeTs });
                        }

                        if (!feasible) continue;

                        for (const { courseCode, representative, allVariants, fac, room, activeTs } of assignments) {
                            for (const ts of activeTs) {
                                for (const sec of oeLabEligibleSecs) {
                                    // Only commit if this section is registered for the variant matching its program and it matches the current OE group number
                                    const v = allVariants.find(variant => Number(variant.program_id) === Number(sec.program_id));
                                    const isSectionRegistered = v && courseSections.some(cs =>
                                        cs.course_code === v.course_code &&
                                        Number(cs.section_id) === Number(sec.section_id) &&
                                        (cs.section_is_open_elective !== null ? cs.section_is_open_elective === 1 : v.is_open_elective === 1) &&
                                        Number(cs.section_is_open_elective !== null && cs.section_is_open_elective === 1 ? (cs.section_open_elective_number ?? v.open_elective_number) : v.open_elective_number) === Number(oeNum)
                                    );
                                    if (!isSectionRegistered) continue;

                                    const actualCourse = allVariants.find(v => Number(v.program_id) === Number(sec.program_id))
                                        || allVariants[0];

                                    commitEntry(
                                        ts.day, ts.timeslot_id,
                                        sec.program_id, sec.branch_id, sec.semester_id,
                                        sec.section_id, null,
                                        actualCourse.course_id, courseCode, fac.faculty_id, room.room_id,
                                        'LAB'
                                    );
                                }
                            }
                            scheduledHours[representative.course_id] += activeTs.length;
                        }

                        oeUsedDays.add(day);
                        placed = true;
                        labHoursLeft -= blockLen;
                        break labDayLoop;
                    }
                }

                if (!placed) {
                    console.warn(`[OE LAB] oeNum=${oeNum} ${blockLen}hr block: unplaced.`);
                    break;
                }
            }
        }

        for (const sem of semesters) {
            const semSecs = allSections.filter(s => s.semester_id === sem.semester_id);
            if (!semSecs.length) continue;

            semSecs.sort((a, b) => {
                const h = sec => allCourses
                    .filter(c =>
                        !isCourseOEForSection(c, sec.section_id, courseSections) && c.semester_id === sem.semester_id &&
                        courseSections.some(cs =>
                            cs.course_code === c.course_code && cs.section_id === sec.section_id)
                    )
                    .reduce((sum, c) => {
                        const usage = courseCodeUsage[c.course_code] || 1;
                        const allComps = courseComponents.filter(cc => Number(cc.course_id) === Number(c.course_id));
                        return sum + allComps.length;
                    }, 0);
                return h(b) - h(a);
            });

            // Give priority to B.Des and sections that have strict lab requirements
            const prioritizedSecs = [...semSecs].sort((a, b) => {
                const isADes = a.section_name.includes('DS') || a.section_name.includes('F');
                const isBDes = b.section_name.includes('DS') || b.section_name.includes('F');
                if (isADes && !isBDes) return -1;
                if (!isADes && isBDes) return 1;
                return 0;
            });

            for (const section of prioritizedSecs) {
                const secSubs = allSubsections.filter(s => Number(s.section_id) === Number(section.section_id));

                const sectionCourses = allCourses.filter(c =>
                    !isCourseOEForSection(c, section.section_id, courseSections) && Number(c.semester_id) === Number(sem.semester_id) &&
                    courseSections.some(cs =>
                        cs.course_code === c.course_code && Number(cs.section_id) === Number(section.section_id))
                );
                if (!sectionCourses.length) continue;

                const dayLoad = Object.fromEntries(DAYS.map(d => [d, 0]));
                const courseDay = {};

                // Handle lab scheduling (needs consecutive blocks)

                for (const course of sectionCourses) {
                    const allLabComps = courseComponents.filter(
                        cc => Number(cc.course_id) === Number(course.course_id) && cc.component_type === 'LAB'
                    );

                    const targetHours = allLabComps.length;

                    if (targetHours === 0) continue;

                    const cbRow = courseSections.find(cs =>
                        cs.course_code === course.course_code && Number(cs.section_id) === Number(section.section_id));

                    const totalLabHours = targetHours;
                    const labRows = allLabComps.slice(0, targetHours);
                    const isSplit = cbRow?.section_lab_group_type === 'SPLIT' || (cbRow?.section_lab_group_type !== 'COMBINED' && labRows[0].lab_group_type === 'SPLIT');
                    const targets = (isSplit && secSubs.length)
                        ? secSubs
                        : [{ subsection_id: null, subsection_capacity: null }];

                    const facPool = getFacultyForSection(course.course_id, section.section_id);
                    if (!facPool.length) {
                        console.warn(`[LAB] No faculty: ${course.course_code} sec=${section.section_id}`);
                        continue;
                    }

                    for (const target of targets) {
                        let labHoursLeft = totalLabHours;

                        let reqCap;
                        if (target.subsection_id) {
                            reqCap = target.subsection_capacity || 30;
                        } else if (secSubs.length) {
                            reqCap = secSubs.reduce((s, x) => s + (x.subsection_capacity || 0), 0);
                        } else {
                            reqCap = cbRow?.course_capacity || 30;
                        }

                        while (labHoursLeft > 0) {
                            const blockLen = Math.min(labHoursLeft, 3);
                            let placed = false;

                            labDayLoop:
                            for (const day of shuffle(DAYS)) {
                                const dayTrackKey = `${course.course_code}_${day}_${target.subsection_id || 'ALL'}`;
                                if (courseDay[dayTrackKey]) continue;

                                const validBlocks = getValidBlocks(slotsByDay[day], blockLen);

                                blockLoop:
                                for (const block of validBlocks) {
                                    const fac = facPool.find(fa =>
                                        block.every(ts =>
                                            isFree(occ, ts.timeslot_id, fa.faculty_id, null, target.subsection_id || null, section.section_id, course.course_code, false)
                                        )
                                    );
                                    if (!fac) continue blockLoop;

                                    const room = findLabRoom(
                                        reqCap, block,
                                        target.subsection_id || null,
                                        section.section_id,
                                        course.course_code,
                                        false,
                                        new Set(),
                                        course.course_id,
                                        section.branch_id
                                    );
                                    if (!room) continue blockLoop;

                                    for (const ts of block) {
                                        commitEntry(
                                            ts.day, ts.timeslot_id,
                                            sem.program_id, section.branch_id, sem.semester_id,
                                            section.section_id,
                                            target.subsection_id || null,
                                            course.course_id, course.course_code, fac.faculty_id, room.room_id, 'LAB'
                                        );
                                        dayLoad[day]++;
                                    }

                                    courseDay[dayTrackKey] = true;
                                    placed = true;
                                    labHoursLeft -= blockLen;
                                    break labDayLoop;
                                }
                            }

                            if (!placed) {
                                console.warn(`[LAB] Unplaced ${blockLen}hr: ${course.course_code} sec=${section.section_name} sub=${target.subsection_id || 'ALL'}`);
                                break;
                            }
                        }
                    }
                }

                // Handle theory and tutorial tasks (single slots)

                const theoryTasks = [];
                for (const course of sectionCourses) {
                    const cbRow = courseSections.find(cs =>
                        cs.course_code === course.course_code && Number(cs.section_id) === Number(section.section_id));
                    const cap = cbRow?.course_capacity || 0;

                    const allComps = courseComponents.filter(cc =>
                        Number(cc.course_id) === Number(course.course_id) && cc.component_type !== 'LAB'
                    );
                    const targetCount = allComps.length;
                    const compsToSchedule = allComps;

                    for (const comp of compsToSchedule)
                        theoryTasks.push({ course, compType: comp.component_type, cap });
                }

                theoryTasks.sort((a, b) => {
                    const aUsage = courseCodeUsage[a.course.course_code] || 1;
                    const bUsage = courseCodeUsage[b.course.course_code] || 1;
                    const aAll = courseComponents.filter(cc => cc.course_id === a.course.course_id).length;
                    const bAll = courseComponents.filter(cc => cc.course_id === b.course.course_id).length;
                    const aCount = aAll;
                    const bCount = bAll;
                    return bCount - aCount;
                });

                for (const { course, compType, cap } of theoryTasks) {
                    const facPool = getFacultyForSection(course.course_id, section.section_id);
                    if (!facPool.length) {
                        console.warn(`[THEORY] No faculty: ${course.course_code} sec=${section.section_id}`);
                        continue;
                    }

                    let placed = false;
                    const dayOrder = [...DAYS].sort(
                        (a, b) => (dayLoad[a] || 0) - (dayLoad[b] || 0)
                    );

                    let skipReasons = { facBusy: 0, roomBusy: 0, secBusy: 0 };

                    theoryLoop:
                    for (const day of dayOrder) {
                        if ((dayLoad[day] || 0) >= 8) continue;
                        if (courseDay[`${course.course_code}_${day}`]) continue;

                        for (const ts of shuffle(schedulableByDay[day])) {
                            if (!isFree(occ, ts.timeslot_id, null, null, null, section.section_id, course.course_code, false)) {
                                skipReasons.secBusy++;
                                continue;
                            }

                            const fac = facPool.find(fa =>
                                isFree(occ, ts.timeslot_id, fa.faculty_id, null, null, section.section_id, course.course_code, false)
                            );
                            if (!fac) {
                                skipReasons.facBusy++;
                                continue;
                            }

                            const room = findClassroom(cap, ts.timeslot_id, section.section_id, course.course_code, false);
                            if (!room) {
                                skipReasons.roomBusy++;
                                continue;
                            }

                            commitEntry(ts.day, ts.timeslot_id,
                                sem.program_id, section.branch_id, sem.semester_id,
                                section.section_id, null,
                                course.course_id, course.course_code, fac.faculty_id, room.room_id, compType);
                            dayLoad[day]++;
                            courseDay[`${course.course_code}_${day}`] = true;
                            placed = true;
                            break theoryLoop;
                        }
                    }

                    // If the first pass didn't work, try every possible remaining slot
                    if (!placed) {
                        relaxLoop:
                        for (const day of shuffle(DAYS)) {
                            if ((dayLoad[day] || 0) >= 8) continue;

                            // Don't put the same course twice on the same day
                            if (courseDay[`${course.course_code}_${day}`]) continue;

                            for (const ts of shuffle(schedulableByDay[day])) {
                                if (!isFree(occ, ts.timeslot_id, null, null, null, section.section_id, course.course_code, false)) continue;

                                const fac = facPool.find(fa =>
                                    isFree(occ, ts.timeslot_id, fa.faculty_id, null, null, section.section_id, course.course_code, false)
                                );
                                if (!fac) continue;

                                const room = findClassroom(cap, ts.timeslot_id, section.section_id, course.course_code, false);
                                if (!room) continue;

                                commitEntry(ts.day, ts.timeslot_id,
                                    sem.program_id, section.branch_id, sem.semester_id,
                                    section.section_id, null,
                                    course.course_id, course.course_code, fac.faculty_id, room.room_id, compType);
                                dayLoad[day]++;
                                courseDay[`${course.course_code}_${day}`] = true;
                                placed = true;
                                break relaxLoop;
                            }
                        }
                    }

                    if (!placed)
                        console.warn(`[THEORY] Unplaced: ${course.course_code}/${compType} for section ${section.section_name} (Rooms/Faculty/Section slots filled)`);
                }

                // Try to fix days that have zero classes to balance things out

                for (const emptyDay of DAYS) {
                    if (dayLoad[emptyDay] > 0) continue;

                    const candidate = inserts.find(row =>
                        row[5] === section.section_id &&
                        row[11] === 'THEORY' &&
                        row[6] === null &&
                        !isCourseOEForSection(allCourses.find(c => c.course_id === row[7]), section.section_id, courseSections)
                    );
                    if (!candidate) continue;

                    const [oldDay, oldTsId, , , , , , courseId, courseCode, facId, roomId] = candidate;
                    if (courseDay[`${courseCode}_${emptyDay}`]) continue;

                    const courseObj = allCourses.find(c => c.course_id === courseId);
                    const oeNum = getOENumberForSection(courseObj, section.section_id, courseSections);

                    const newTs = schedulableByDay[emptyDay].find(ts =>
                        isFree(occ, ts.timeslot_id, facId, roomId, null, section.section_id, courseCode, oeNum)
                    );
                    if (!newTs) continue;

                    unlockSlot(occ, wl, oldTsId, facId, roomId, null, section.section_id, courseCode);
                    dayLoad[oldDay] = Math.max(0, dayLoad[oldDay] - 1);
                    delete courseDay[`${courseCode}_${oldDay}`];

                    candidate[0] = newTs.day;
                    candidate[1] = newTs.timeslot_id;

                    lockSlot(occ, wl, newTs.timeslot_id, facId, roomId, null, section.section_id, courseCode, oeNum);
                    dayLoad[emptyDay]++;
                    courseDay[`${courseCode}_${emptyDay}`] = true;
                }
            }
        }

        if (inserts.length === 0) {
            await conn.rollback();
            return res.status(400).json({
                error: 'No timetable entries could be generated. Please make sure your institute has timeslots, courses, sections, faculty allocations, and rooms configured before generating.'
            });
        }

        await conn.query(
            `INSERT INTO master_timetable
             (day,timeslot_id,program_id,branch_id,semester_id,
              section_id,subsection_id,course_id,course_code,faculty_id,room_id,component_type,institute_id)
             VALUES ?`,
            [inserts]
        );

        await conn.commit();

        const summary = {};
        for (const row of inserts) {
            const k = `sem${row[4]}_sec${row[5]}`;
            summary[k] = (summary[k] || 0) + 1;
        }
        console.log('[GEN] Summary:', summary);

        res.json({ success: true, total_entries: inserts.length, summary });

    } catch (e) {
        await conn.rollback();
        console.error('[GEN] Fatal:', e.message);
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
};

exports.addManualEntry = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { course_id, section_id, timeslot_id, component_type, room_id, subsection_id } = req.body;
        if (!course_id || !section_id || !timeslot_id || !component_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get basic details for this section
        const [[secInfo]] = await conn.query(`
            SELECT s.section_id, s.branch_id, s.semester_id, s.section_name,
                   sem.program_id, sem.semester_number
            FROM section s JOIN semester sem ON s.semester_id = sem.semester_id
            WHERE s.section_id = ? AND s.institute_id = ? AND sem.institute_id = ?`, [section_id, req.user.institute_id, req.user.institute_id]);
        if (!secInfo) { await conn.rollback(); return res.status(400).json({ error: 'Section not found' }); }

        // Get course details
        const [[courseInfo]] = await conn.query('SELECT * FROM courses WHERE course_id = ? AND institute_id = ?', [course_id, req.user.institute_id]);
        if (!courseInfo) { await conn.rollback(); return res.status(400).json({ error: 'Course not found' }); }
        const course_code = courseInfo.course_code;

        // Load all courses and section course details for overrides
        const [allCourses] = await conn.query('SELECT * FROM courses WHERE institute_id = ?', [req.user.institute_id]);
        const [courseSections] = await conn.query('SELECT * FROM course_section WHERE institute_id = ?', [req.user.institute_id]);
        const courseBranches = courseSections;
        const isOE = isCourseOEForSection(courseInfo, secInfo.section_id, courseSections);
        const oeNum = getOENumberForSection(courseInfo, secInfo.section_id, courseSections);

        // Check if course is registered for this section, or if it's an Open Elective
        if (!isOE) {
            const [[courseSecCheck]] = await conn.query(
                'SELECT 1 FROM course_section WHERE course_code = ? AND section_id = ? AND institute_id = ?',
                [course_code, section_id, req.user.institute_id]
            );
            if (!courseSecCheck) {
                await conn.rollback();
                return res.status(400).json({ error: 'This course is not assigned to this section in Course Section Assignment.' });
            }
        }

        // Get timeslot details
        const [[tsInfo]] = await conn.query('SELECT * FROM time_slots WHERE timeslot_id = ? AND institute_id = ?', [timeslot_id, req.user.institute_id]);
        if (!tsInfo) { await conn.rollback(); return res.status(400).json({ error: 'Timeslot not found' }); }
        if (tsInfo.is_break) {
            await conn.rollback(); return res.status(400).json({ error: 'Cannot schedule in break slot' });
        }

        // Check how many hours this course actually needs
        const [allComponents] = await conn.query(
            'SELECT * FROM course_components WHERE course_id = ? AND component_type = ? AND institute_id = ?',
            [course_id, component_type, req.user.institute_id]);
        if (allComponents.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: `No ${component_type} component defined for course ${course_code}` });
        }
        const maxHours = allComponents.length;

        // See how many hours are already booked (handles split groups too)
        let usedQ = `SELECT COUNT(*) as usedHours FROM ${tbl(req)} WHERE course_id = ? AND section_id = ? AND component_type = ? AND institute_id = ?`;
        let usedP = [course_id, section_id, component_type, req.user.institute_id];
        if (subsection_id) {
            usedQ += ' AND subsection_id = ?';
            usedP.push(subsection_id);
        } else {
            usedQ += ' AND subsection_id IS NULL';
        }
        const [[{ usedHours }]] = await conn.query(usedQ, usedP);

        if (usedHours >= maxHours) {
            await conn.rollback();
            const scope = subsection_id ? `subsection ${subsection_id}` : "section";
            return res.status(400).json({
                error: `Limit Reached: This ${scope} already has ${usedHours}/${maxHours} hours of ${component_type} scheduled for this course.`
            });
        }

        let targetSections = [secInfo];
        if (isOE) {
            const [assignedSecRows] = await conn.query(`
                SELECT s.section_id, s.branch_id, s.semester_id, sem.program_id 
                FROM course_section cs
                JOIN section s ON cs.section_id = s.section_id AND s.institute_id = cs.institute_id
                JOIN semester sem ON s.semester_id = sem.semester_id AND sem.institute_id = s.institute_id
                WHERE cs.course_code = ? AND sem.program_id = ? AND cs.institute_id = ?`,
                [course_code, secInfo.program_id, req.user.institute_id]);
            if (assignedSecRows.length > 0) {
                targetSections = assignedSecRows;
            }
        }

        // Find the faculty assigned to this course
        let facQ = `
            SELECT fa.faculty_id, f.faculty_name, f.faculty_short
            FROM faculty_allocation fa
            JOIN faculty f ON fa.faculty_id = f.faculty_id AND f.institute_id = fa.institute_id
            WHERE fa.course_id = ? AND fa.institute_id = ?`;
        let facP = [courseInfo.course_id, req.user.institute_id];
        if (!isOE) {
            facQ += ' AND fa.section_id = ?';
            facP.push(section_id);
        }
        const [facAllocations] = await conn.query(facQ, facP);
        if (facAllocations.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'No faculty allocated to this course' });
        }

        // Handle room capacity checks
        const [[cbRow]] = await conn.query(
            'SELECT course_capacity FROM course_section WHERE course_id = ? AND institute_id = ? ORDER BY (section_id = ?) DESC LIMIT 1',
            [course_id, req.user.institute_id, secInfo.section_id]);

        let reqCap = cbRow?.course_capacity || 60;
        if (subsection_id) {
            const [[subRow]] = await conn.query('SELECT subsection_capacity FROM subsection WHERE subsection_id = ? AND institute_id = ?', [subsection_id, req.user.institute_id]);
            if (subRow) reqCap = subRow.subsection_capacity;
        }

        if (component_type === 'THEORY' || component_type === 'TUTORIAL') {
            // Check if the section is already in a class
            for (const tSec of targetSections) {
                const [allExistingClasses] = await conn.query(`
                    SELECT m.*, c.is_open_elective, c.open_elective_number 
                    FROM ${tbl(req)} m
                    JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                    WHERE m.section_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                    [tSec.section_id, timeslot_id, req.user.institute_id]);

                // If adding a subsection entry, only conflict on:
                // (a) section-level entries (subsection_id IS NULL), or
                // (b) entries for this exact subsection.
                // A different subsection in the same slot is allowed.
                const existingClasses = subsection_id
                    ? allExistingClasses.filter(e => e.subsection_id == null || Number(e.subsection_id) === Number(subsection_id))
                    : allExistingClasses;

                if (existingClasses.length > 0) {
                    const newCourseOENum = getOENumberForSection(courseInfo, tSec.section_id, courseSections);
                    const isSameOE = isOE &&
                        existingClasses.every(e => {
                            const eCourse = allCourses.find(ac => ac.course_code === e.course_code && ac.program_id === e.program_id);
                            if (!isCourseOEForSection(eCourse, tSec.section_id, courseSections)) return false;
                            const eOENum = getOENumberForSection(eCourse, tSec.section_id, courseSections);
                            return String(eOENum ?? '') === String(newCourseOENum ?? '');
                        });

                    if (!isSameOE) {
                        await conn.rollback();
                        const existingOeNum = getOENumberForSection(
                            allCourses.find(ac => ac.course_code === existingClasses[0].course_code && ac.program_id === existingClasses[0].program_id),
                            tSec.section_id,
                            courseSections
                        );
                        if (isOE && existingClasses.every(e => isCourseOEForSection(allCourses.find(ac => ac.course_code === e.course_code && ac.program_id === e.program_id), tSec.section_id, courseSections))) {
                            return res.status(400).json({
                                error: `Cannot add ${course_code} (OE-${newCourseOENum || '?'}) to OE-${existingOeNum || '?'} block.`
                            });
                        }
                        return res.status(400).json({ error: `Section ${tSec.section_id} already busy in this slot (Strict One Class per Section Rule).` });
                    }
                }
            }

            // Find a faculty member who isn't busy (or shares the same course)
            let freeFac = null;
            let existingClassForFac = null;
            for (const fac of facAllocations) {
                const [fbRows] = await conn.query(
                    `SELECT m.*, c.is_open_elective, c.course_code 
                     FROM ${tbl(req)} m
                     JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                     WHERE m.faculty_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                    [fac.faculty_id, timeslot_id, req.user.institute_id]);

                const isFreeOrShared = fbRows.length === 0 || fbRows.every(e => e.course_code === course_code);

                if (isFreeOrShared) {
                    freeFac = fac;
                    if (fbRows.length > 0) {
                        existingClassForFac = fbRows[0];
                    }
                    break;
                }
            }
            if (!freeFac) { await conn.rollback(); return res.status(400).json({ error: 'All allocated faculty are busy in this slot' }); }

            // Pick a room that fits and is available
            let room = null;
            if (existingClassForFac) {
                if (room_id && Number(room_id) !== Number(existingClassForFac.room_id)) {
                    const [[existingRoom]] = await conn.query(`SELECT room_name FROM rooms WHERE room_id = ? AND institute_id = ?`, [existingClassForFac.room_id, req.user.institute_id]);
                    await conn.rollback();
                    return res.status(400).json({ error: `This course is already scheduled in room ${existingRoom?.room_name || existingClassForFac.room_id} for this slot.` });
                }
                const [[rb]] = await conn.query(
                    `SELECT * FROM rooms WHERE room_id = ? AND institute_id = ?`, [existingClassForFac.room_id, req.user.institute_id]);
                room = rb;
            } else if (room_id) {
                // If room is specified, verify it's free
                const [[rb]] = await conn.query(
                    `SELECT * FROM rooms WHERE room_id = ? AND institute_id = ?`, [room_id, req.user.institute_id]);
                if (!rb) { await conn.rollback(); return res.status(400).json({ error: 'Selected room not found' }); }

                // Capacity Check
                if (rb.capacity < reqCap) {
                    await conn.rollback();
                    return res.status(400).json({ error: `Room ${rb.room_name} capacity (${rb.capacity}) is less than required (${reqCap})` });
                }

                const [busyRows] = await conn.query(
                    `SELECT m.*, c.is_open_elective, c.course_code 
                     FROM ${tbl(req)} m
                     JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                     WHERE m.room_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                    [room_id, timeslot_id, req.user.institute_id]);

                const isRoomFreeOrShared = busyRows.length === 0 || busyRows.every(e => e.course_code === course_code);
                if (!isRoomFreeOrShared) { await conn.rollback(); return res.status(400).json({ error: `Selected room ${rb.room_name} is already busy in this slot` }); }

                room = rb;
            } else {
                // If no room was picked, find the best fit automatically
                const [rooms] = await conn.query(`
                    SELECT * FROM rooms WHERE room_type = 'CLASSROOM' AND capacity >= ? AND institute_id = ?
                    AND room_id NOT IN (SELECT room_id FROM ${tbl(req)} WHERE timeslot_id = ? AND institute_id = ?)
                    ORDER BY capacity ASC LIMIT 1`, [reqCap, req.user.institute_id, timeslot_id, req.user.institute_id]);
                if (!rooms.length) { await conn.rollback(); return res.status(400).json({ error: 'Cannot place: no available classroom with sufficient capacity' }); }
                room = rooms[0];
            }

            for (const tSec of targetSections) {
                await conn.query(`
                    INSERT INTO ${tbl(req)}
                    (day,timeslot_id,program_id,branch_id,semester_id,section_id,subsection_id,course_id,course_code,faculty_id,room_id,component_type,institute_id)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [tsInfo.day, timeslot_id, tSec.program_id, tSec.branch_id, tSec.semester_id,
                    tSec.section_id, subsection_id || null, course_id, course_code, freeFac.faculty_id, room.room_id, component_type, req.user.institute_id]);
            }

            await conn.commit();
            return res.json({ success: true, message: `${component_type} added for ${targetSections.length} section(s): ${course_code} → ${room.room_name} by ${freeFac.faculty_short}` });

        } else if (component_type === 'LAB') {
            const remainingHours = maxHours - usedHours;
            const blockLen = Math.min(remainingHours, 3);

            // Get every slot for the chosen day
            const [daySlots] = await conn.query(
                'SELECT * FROM time_slots WHERE day = ? AND institute_id = ? ORDER BY slot_order', [tsInfo.day, req.user.institute_id]);
            const blockPool = daySlots.filter(s => !s.is_break);

            const clickedIdx = blockPool.findIndex(s => s.timeslot_id === parseInt(timeslot_id));
            if (clickedIdx === -1) { await conn.rollback(); return res.status(400).json({ error: 'Invalid slot' }); }

            if (clickedIdx + blockLen > blockPool.length) {
                await conn.rollback();
                return res.status(400).json({
                    error: `Not enough consecutive slots: need ${blockLen}, only ${blockPool.length - clickedIdx} available in this block`
                });
            }

            const labBlock = blockPool.slice(clickedIdx, clickedIdx + blockLen);

            // Check if the slots are consecutive
            for (let i = 0; i < labBlock.length - 1; i++) {
                if (labBlock[i + 1].slot_order !== labBlock[i].slot_order + 1) {
                    await conn.rollback(); return res.status(400).json({ error: 'Slots are not consecutive (cannot cross break slots)' });
                }
            }

            // Check if the section is free for the entire lab window
            for (const slot of labBlock) {
                for (const tSec of targetSections) {
                    const [allExistingClasses] = await conn.query(`
                        SELECT m.*, c.is_open_elective, c.open_elective_number 
                        FROM ${tbl(req)} m
                        JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                        WHERE m.section_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                        [tSec.section_id, slot.timeslot_id, req.user.institute_id]);

                    // If adding a subsection lab, only conflict on:
                    // (a) section-level entries (subsection_id IS NULL), or
                    // (b) entries for this exact subsection.
                    // A different subsection in the same slot is allowed.
                    const existingClasses = subsection_id
                        ? allExistingClasses.filter(e => e.subsection_id == null || Number(e.subsection_id) === Number(subsection_id))
                        : allExistingClasses;

                    if (existingClasses.length > 0) {
                        const newCourseOENum = getOENumberForSection(courseInfo, tSec.section_id, courseSections);
                        const isSameOE = isOE &&
                            existingClasses.every(e => {
                                const eCourse = allCourses.find(ac => ac.course_code === e.course_code && ac.program_id === e.program_id);
                                if (!isCourseOEForSection(eCourse, tSec.section_id, courseSections)) return false;
                                const eOENum = getOENumberForSection(eCourse, tSec.section_id, courseSections);
                                return String(eOENum ?? '') === String(newCourseOENum ?? '');
                            });

                        if (!isSameOE) {
                            await conn.rollback();
                            const existingOeNum = getOENumberForSection(
                                allCourses.find(ac => ac.course_code === existingClasses[0].course_code && ac.program_id === existingClasses[0].program_id),
                                tSec.section_id,
                                courseSections
                            );
                            if (isOE && existingClasses.every(e => isCourseOEForSection(allCourses.find(ac => ac.course_code === e.course_code && ac.program_id === e.program_id), tSec.section_id, courseSections))) {
                                return res.status(400).json({
                                    error: `Cannot add ${course_code} (OE-${newCourseOENum || '?'}) to OE-${existingOeNum || '?'} block.`
                                });
                            }
                            return res.status(400).json({ error: `Section ${tSec.section_id} already busy at ${String(slot.start_time).slice(0, 5)} (Strict One Class per Section Rule).` });
                        }
                    }
                }
            }

            // Check if faculty is free for the whole lab block (or shares the same course/component)
            let freeFac = null;
            let existingClassForFac = null;
            for (const fac of facAllocations) {
                let isBusy = false;
                let firstFbRow = null;
                for (const slot of labBlock) {
                    const [fbRows] = await conn.query(
                        `SELECT m.*, c.is_open_elective, c.course_code 
                         FROM ${tbl(req)} m
                         JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                         WHERE m.faculty_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                        [fac.faculty_id, slot.timeslot_id, req.user.institute_id]);

                    const isSlotFreeOrShared = fbRows.length === 0 || fbRows.every(e => e.course_code === course_code);
                    if (!isSlotFreeOrShared) { isBusy = true; break; }
                    if (fbRows.length > 0 && !firstFbRow) {
                        firstFbRow = fbRows[0];
                    }
                }
                if (!isBusy) {
                    freeFac = fac;
                    existingClassForFac = firstFbRow;
                    break;
                }
            }
            if (!freeFac) { await conn.rollback(); return res.status(400).json({ error: 'Faculty busy across required lab slots' }); }

            let freeRoom = null;
            if (existingClassForFac) {
                if (room_id && Number(room_id) !== Number(existingClassForFac.room_id)) {
                    const [[existingRoom]] = await conn.query(`SELECT room_name FROM rooms WHERE room_id = ? AND institute_id = ?`, [existingClassForFac.room_id, req.user.institute_id]);
                    await conn.rollback();
                    return res.status(400).json({ error: `This course is already scheduled in room ${existingRoom?.room_name || existingClassForFac.room_id} for this slot.` });
                }
                const [[rb]] = await conn.query(
                    `SELECT * FROM rooms WHERE room_id = ? AND institute_id = ?`, [existingClassForFac.room_id, req.user.institute_id]);
                freeRoom = rb;
            } else if (room_id) {
                // If room is specified, verify it's free for the entire block
                const [[rb]] = await conn.query(`SELECT * FROM rooms WHERE room_id = ? AND institute_id = ?`, [room_id, req.user.institute_id]);
                if (!rb) { await conn.rollback(); return res.status(400).json({ error: 'Selected lab room not found' }); }

                // Capacity Check
                if (rb.capacity < reqCap) {
                    await conn.rollback();
                    return res.status(400).json({ error: `Lab Room ${rb.room_name} capacity (${rb.capacity}) is less than required (${reqCap})` });
                }

                let isBusy = false;
                for (const slot of labBlock) {
                    const [busyRows] = await conn.query(
                        `SELECT m.*, c.is_open_elective, c.course_code 
                         FROM ${tbl(req)} m
                         JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                         WHERE m.room_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                        [room_id, slot.timeslot_id, req.user.institute_id]);

                    const isRoomSlotFreeOrShared = busyRows.length === 0 || busyRows.every(e => e.course_code === course_code);
                    if (!isRoomSlotFreeOrShared) { isBusy = true; break; }
                }
                if (isBusy) { await conn.rollback(); return res.status(400).json({ error: `Selected lab ${rb.room_name} is busy in one of the required slots` }); }

                freeRoom = rb;
            } else {
                // Check for admin preferred room first
                const [prefRows] = await conn.query(
                    'SELECT room_id FROM lab_room_preference WHERE course_id = ? AND (branch_id = ? OR branch_id IS NULL) AND institute_id = ? ORDER BY branch_id DESC LIMIT 1',
                    [course_id, secInfo.branch_id, req.user.institute_id]
                );

                if (prefRows.length > 0) {
                    const prefRoomId = prefRows[0].room_id;
                    const [[pRoom]] = await conn.query('SELECT * FROM rooms WHERE room_id = ? AND institute_id = ?', [prefRoomId, req.user.institute_id]);
                    if (pRoom && pRoom.capacity >= reqCap) {
                        let isBusy = false;
                        for (const slot of labBlock) {
                            const [busyRows] = await conn.query(
                                `SELECT m.*, c.is_open_elective, c.course_code 
                                 FROM ${tbl(req)} m
                                 JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                                 WHERE m.room_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                                [pRoom.room_id, slot.timeslot_id, req.user.institute_id]);

                            const isRoomSlotFreeOrShared = busyRows.length === 0 || busyRows.every(e => e.course_code === course_code);
                            if (!isRoomSlotFreeOrShared) { isBusy = true; break; }
                        }
                        if (!isBusy) {
                            freeRoom = pRoom;
                        }
                    }
                }

                if (!freeRoom) {
                    const [labRooms] = await conn.query(
                        'SELECT * FROM rooms WHERE room_type = ? AND capacity >= ? AND institute_id = ? ORDER BY capacity ASC',
                        ['LAB', reqCap, req.user.institute_id]);
                    for (const room of labRooms) {
                        let isBusy = false;
                        for (const slot of labBlock) {
                            const [busyRows] = await conn.query(
                                `SELECT m.*, c.is_open_elective, c.course_code 
                                 FROM ${tbl(req)} m
                                 JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                                 WHERE m.room_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                                [room.room_id, slot.timeslot_id, req.user.institute_id]);

                            const isRoomSlotFreeOrShared = busyRows.length === 0 || busyRows.every(e => e.course_code === course_code);
                            if (!isRoomSlotFreeOrShared) { isBusy = true; break; }
                        }
                        if (!isBusy) { freeRoom = room; break; }
                    }
                }
                if (!freeRoom) { await conn.rollback(); return res.status(400).json({ error: 'Cannot place: no available lab room with sufficient capacity' }); }
            }

            for (const slot of labBlock) {
                for (const tSec of targetSections) {
                    await conn.query(`
                        INSERT INTO ${tbl(req)}
                        (day,timeslot_id,program_id,branch_id,semester_id,section_id,subsection_id,course_id,course_code,faculty_id,room_id,component_type,institute_id)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                        [tsInfo.day, slot.timeslot_id, tSec.program_id, tSec.branch_id, tSec.semester_id,
                        tSec.section_id, subsection_id || null, course_id, course_code, freeFac.faculty_id, freeRoom.room_id, 'LAB', req.user.institute_id]);
                }
            }

            await conn.commit();
            return res.json({ success: true, message: `LAB (${blockLen} slots) added for ${targetSections.length} section(s): ${course_code} → ${freeRoom.room_name} by ${freeFac.faculty_short}` });

        } else {
            await conn.rollback();
            return res.status(400).json({ error: 'component_type must be THEORY, TUTORIAL, or LAB' });
        }
    } catch (e) {
        await conn.rollback();
        console.error('Manual entry error:', e);
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
};