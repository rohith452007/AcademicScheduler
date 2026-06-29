const db = require('../config/db');

const tbl = (req) => (req.query && req.query.draft === 'true') ? 'master_timetable_draft' : 'master_timetable';

// keeps track of which slots are already taken
function makeSlot() {
    return {
        faculty: new Set(), room: new Set(),
        section: new Set(), sectionPartial: new Set(), subsection: new Set(),
        sectionCourse: {}, // tracks course code and count per section
        facultyCourse: {}, // tracks course per faculty
        roomCourse: {}    // tracks course per room
    };
}

// check if we can fit a class in this slot without conflicts
function isFree(occ, tsId, facId, roomId, subId, secId, courseCode, oeNum) {
    const s = occ[tsId];
    if (!s) return true;

    if (facId && s.faculty.has(facId)) {
        if (!oeNum || !s.facultyCourse || s.facultyCourse[facId] !== courseCode) {
            return false;
        }
    }
    if (roomId && s.room.has(roomId)) {
        if (!oeNum || !s.roomCourse || s.roomCourse[roomId] !== courseCode) return false;
    }
    if (subId && s.subsection.has(subId)) return false;
    if (secId) {
        if (s.section.has(secId) || s.sectionPartial.has(secId)) {
            // let different electives share the same vertical slot if they're in the same group
            if (oeNum && s.sectionCourse[secId] && s.sectionCourse[secId].oeNum === oeNum) {
                return true;
            }
            return false;
        }
    }

    return true;
}

// book this slot so nothing else can overlap it
function lockSlot(occ, wl, tsId, facId, roomId, subId, secId, courseCode, oeNum) {
    if (!occ[tsId]) occ[tsId] = makeSlot();
    const s = occ[tsId];
    if (facId) {
        s.faculty.add(facId);
        wl[facId] = (wl[facId] || 0) + 1;
        if (courseCode) s.facultyCourse[facId] = courseCode;
    }
    if (roomId) {
        s.room.add(roomId);
        if (courseCode) s.roomCourse[roomId] = courseCode;
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

// free up the slot 
function unlockSlot(occ, wl, tsId, facId, roomId, subId, secId, courseCode) {
    const s = occ[tsId];
    if (!s) return;
    if (facId) { s.faculty.delete(facId); if (wl[facId] > 0) wl[facId]--; }
    if (roomId) s.room.delete(roomId);
    if (subId) s.subsection.delete(subId);
    if (secId) {
        (subId ? s.sectionPartial : s.section).delete(secId);
        if (courseCode && s.sectionCourse[secId]) {
            s.sectionCourse[secId].count--;
            if (s.sectionCourse[secId].count <= 0) delete s.sectionCourse[secId];
        }
    }
}

// mix up the array so we don't always pick the same order
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// skip the lunch break slot
function isSchedulable(ts) {
    return !ts.is_break;
}

// make sure lab slots are actually back-to-back
function isValidBlock(block) {
    if (!block.length) return false;

    if (block.some(s => !isSchedulable(s))) return false;

    for (let i = 0; i < block.length - 1; i++) {
        if (block[i + 1].slot_order !== block[i].slot_order + 1) return false;
    }

    return true;
}

// find valid windows for lab sessions (consecutive slots)
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

// check everything: faculty, rooms, and if the section is already busy
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
        const [[sc]] = await conn.query(
            `SELECT 1 FROM master_timetable
             WHERE section_id=? AND timeslot_id=? AND institute_id=?${excl}`,
            [section_id, timeslot_id, institute_id, ...ep]);
        if (sc) return { ok: false, error: 'Section already busy in this slot' };
    } else {
        const [[otherC]] = await conn.query(
            `SELECT 1 FROM master_timetable
             WHERE section_id=? AND timeslot_id=? AND course_code != ? AND institute_id=?${excl}`,
            [section_id, timeslot_id, course_code, institute_id, ...ep]);
        if (otherC) return { ok: false, error: 'Another course is already booked for this section in this slot' };

        const [[subC]] = await conn.query(
            `SELECT 1 FROM master_timetable WHERE subsection_id=? AND timeslot_id=? AND institute_id=?${excl}`,
            [subsection_id, timeslot_id, institute_id, ...ep]);
        if (subC) return { ok: false, error: 'Subsection already busy in this slot' };
    }

    return { ok: true, day: tsRow.day };
}

// helper to look up branch and program details for a section
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
                    c.course_name, c.is_open_elective, c.open_elective_number,
                    f.faculty_name, f.faculty_short,
                    r.room_name,
                    sub.subsection_name,
                    ts.day, ts.start_time, ts.end_time, ts.slot_order,
                    cc.lab_group_type
             FROM master_timetable mt
             JOIN courses    c   ON mt.course_code   = c.course_code AND c.institute_id = mt.institute_id
             JOIN faculty    f   ON mt.faculty_id    = f.faculty_id AND f.institute_id = mt.institute_id
             JOIN rooms      r   ON mt.room_id       = r.room_id AND r.institute_id = mt.institute_id
             JOIN time_slots ts  ON mt.timeslot_id   = ts.timeslot_id AND ts.institute_id = mt.institute_id
             LEFT JOIN subsection sub ON mt.subsection_id = sub.subsection_id AND sub.institute_id = mt.institute_id
             LEFT JOIN course_components cc
                    ON cc.course_code=mt.course_code AND cc.component_type=mt.component_type AND cc.institute_id = mt.institute_id
             WHERE mt.section_id=? AND mt.institute_id=?
             ORDER BY FIELD(ts.day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'),
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
                   c.course_name, c.is_open_elective, c.open_elective_number,
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
               ORDER BY FIELD(ts.day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'),
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
        const [courseBranches] = await conn.query('SELECT * FROM course_branch WHERE institute_id = ?', [req.user.institute_id]);
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
            ORDER BY FIELD(day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'),
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

        // link each course to the program it belongs to
        const courseCodeProgs = {};
        allCourses.forEach(c => {
            const sem = semesters.find(s => Number(s.semester_id) === Number(c.semester_id));
            if (sem) {
                if (!courseCodeProgs[c.course_code]) courseCodeProgs[c.course_code] = new Set();
                courseCodeProgs[c.course_code].add(sem.program_id);
            }
        });

        // work out if courses are shared between B.Tech and B.Des to avoid double booking faculty
        const courseCodeUsage = {};
        for (const [code, progSet] of Object.entries(courseCodeProgs)) {
            const hasBTech = btechId && progSet.has(btechId);
            const hasBDes = bdesId && progSet.has(bdesId);
            courseCodeUsage[code] = (hasBTech && hasBDes) ? progSet.size : 1;
        }

        const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

        const slotsByDay = {};
        for (const d of DAYS) slotsByDay[d] = timeSlots.filter(ts => ts.day === d);

        // skip breaks
        const schedulableByDay = {};
        for (const d of DAYS) schedulableByDay[d] = slotsByDay[d].filter(isSchedulable);

        const occ = {};  // occupation map
        const wl = {};

        // final list of rows to push to the database
        const inserts = [];

        function commitEntry(day, tsId, progId, branchId, semId,
            secId, subId, courseId, courseCode, facId, roomId, compType) {
            inserts.push([day, tsId, progId, branchId, semId,
                secId, subId || null, courseId, courseCode, facId, roomId, compType, req.user.institute_id]);

            const courseObj = allCourses.find(c => c.course_id === courseId);
            const oeNum = courseObj?.is_open_elective === 1 ? courseObj.open_elective_number : null;

            lockSlot(occ, wl, tsId, facId, roomId, subId || null, secId, courseCode, oeNum);
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

            // Default: pick any free lab room (smallest capacity that fits)
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

        // Open Elective Scheduling

        const semesterNumbers = [...new Set(semesters.map(s => s.semester_number))];

        // group electives by semester
        const semesterOEData = semesterNumbers.map(semNum => {
            const semSecs = allSections.filter(s => Number(s.semester_number) === Number(semNum));
            const semCourses = allCourses.filter(c => {
                if (!c.is_open_elective) return false;
                const cSem = semesters.find(s => Number(s.semester_id) === Number(c.semester_id));
                return cSem && Number(cSem.semester_number) === Number(semNum);
            });
            return { semNum, semSecs, semCourses, totalOE: semCourses.length };
        });

        // sort by most electives first
        semesterOEData.sort((a, b) => b.totalOE - a.totalOE);

        for (const { semNum, semSecs, semCourses } of semesterOEData) {
            if (!semSecs.length || !semCourses.length) continue;

            const oeMap = {};
            // group electives that share the same number
            for (const c of semCourses) {
                if (c.open_elective_number) {
                    (oeMap[c.open_elective_number] ??= []).push(c);
                }
            }

            const oeGroups = [];
            for (const [oeNumber, courses] of Object.entries(oeMap)) {
                // skip duplicate entries
                const uniqueGroupMap = new Map();
                for (const c of courses) uniqueGroupMap.set(c.course_code, c);
                const group = Array.from(uniqueGroupMap.values());

                // Ignore courses with no faculty
                const groupWithFac = group.filter(c => getFacultyForCourse(c.course_id).length > 0);
                if (groupWithFac.length > 0) {
                    oeGroups.push({ oeNum: oeNumber, group: groupWithFac });
                }
            }
            oeGroups.sort((a, b) => b.group.length - a.group.length);
            console.error(`[DEBUG OE] semester=${semNum} totalGroups=${oeGroups.length}`);

            for (const { oeNum, group } of oeGroups) {
                console.error(`[DEBUG OE] Processing group oeNum=${oeNum} courses=${group.length}`);
                // each elective number only gets one vertical slot per day max
                const oeUsedDays = new Set();

                // Find max hours in group
                let theoryHours = 0;
                for (const course of group) {
                    const cCode = String(course.course_code).trim();
                    const allTheoryComps = courseComponents.filter(
                        cc => Number(cc.course_id) === Number(course.course_id) && cc.component_type === 'THEORY'
                    );

                    const hTheory = allTheoryComps.length;
                    console.log(`[DEBUG OE] course=${cCode} theoryComps=${allTheoryComps.length} hTheory=${hTheory}`);

                    if (hTheory > theoryHours) theoryHours = hTheory;
                }

                if (theoryHours === 0) continue;

                console.log(`[OE GROUP] oeNum=${oeNum} semNum=${semNum} finalTheory=${theoryHours}`);


                // start placing the theory slots for these electives
                for (let h = 0; h < theoryHours; h++) {
                    let placed = false;

                    oeLoop:
                    for (const day of shuffle(DAYS)) {
                        if (
                            oeUsedDays.has(`${semNum}_${day}`)
                        ) continue;  // 1 vertical slot per day max for THIS OE number

                        let skipReasons = { facBusy: 0, roomsFull: 0, secBusy: 0 };


                        for (const ts of schedulableByDay[day]) {

                            const allFree = semSecs.every(sec =>
                                isFree(occ, ts.timeslot_id, null, null, null, sec.section_id, null, oeNum)
                            );
                            if (!allFree) {
                                skipReasons.secBusy++;
                                continue;
                            }

                            const assignments = [];
                            let feasible = true;

                            const assignedRoomsInGroup = new Set();
                            for (const course of group) {
                                const courseTheoryComps = courseComponents.filter(
                                    cc => Number(cc.course_id) === Number(course.course_id) && cc.component_type === 'THEORY'
                                );
                                const courseTheoryHours = courseTheoryComps.length;

                                // If this course has already reached its individual theory hours, skip it in this slot
                                if (h >= courseTheoryHours) continue;

                                const fac = getFacultyForCourse(course.course_id).find(fa =>
                                    isFree(occ, ts.timeslot_id, fa.faculty_id, null, null, null, course.course_code, oeNum)
                                );
                                if (!fac) {
                                    feasible = false;
                                    skipReasons.facBusy++;
                                    break;
                                }

                                const cbRow = courseBranches.find(
                                    cb =>
                                        Number(cb.course_id) === Number(course.course_id) &&
                                        semSecs.some(sec => Number(sec.branch_id) === Number(cb.branch_id))
                                );
                                const cap = cbRow?.course_capacity || 60;

                                const room = findClassroom(cap, ts.timeslot_id, null, course.course_code, oeNum, assignedRoomsInGroup);
                                if (!room) {
                                    feasible = false;
                                    skipReasons.roomsFull++;
                                    break;
                                }

                                assignedRoomsInGroup.add(room.room_id);
                                assignments.push({ course, fac, room });
                            }

                            if (!feasible) continue;

                            for (const sec of semSecs) {
                                for (const { course, fac, room } of assignments) {
                                    const actualCourse = semCourses.find(c => c.course_code === course.course_code && c.program_id === sec.program_id) || course;
                                    commitEntry(
                                        ts.day, ts.timeslot_id,
                                        sec.program_id, sec.branch_id, sec.semester_id,
                                        sec.section_id, null,
                                        actualCourse.course_id, course.course_code, fac.faculty_id, room.room_id,
                                        'THEORY'
                                    );
                                }
                            }

                            oeUsedDays.add(`${semNum}_${day}`);
                            placed = true;
                            break oeLoop;
                        }

                        if (!placed)
                            console.warn(`[OE] semNum=${semNum} oeNum=${oeNum} h=${h + 1}: unplaced. Reasons: RoomsFull=${skipReasons.roomsFull}, FacBusy=${skipReasons.facBusy}, SecBusy=${skipReasons.secBusy}`);
                    }
                }
            }
        }

        // Open Elective Lab Scheduling
        for (const { semNum, semSecs, semCourses } of semesterOEData) {
            if (!semSecs.length || !semCourses.length) continue;

            const oeMap = {};
            for (const c of semCourses) {
                if (c.open_elective_number) {
                    (oeMap[c.open_elective_number] ??= []).push(c);
                }
            }

            const oeGroups = [];
            for (const [oeNumber, courses] of Object.entries(oeMap)) {
                const uniqueGroupMap = new Map();
                for (const c of courses) uniqueGroupMap.set(c.course_code, c);
                const group = Array.from(uniqueGroupMap.values());

                const groupWithFac = group.filter(c => getFacultyForCourse(c.course_id).length > 0);
                if (groupWithFac.length > 0) {
                    oeGroups.push({ oeNum: oeNumber, group: groupWithFac });
                }
            }
            oeGroups.sort((a, b) => b.group.length - a.group.length);

            for (const { oeNum, group } of oeGroups) {
                // Find courses in the group that actually have LAB components
                const labCourses = [];
                const courseLabHours = {};
                for (const course of group) {
                    const allLabComps = courseComponents.filter(
                        cc => Number(cc.course_id) === Number(course.course_id) && cc.component_type === 'LAB'
                    );
                    if (allLabComps.length > 0) {
                        labCourses.push(course);
                        courseLabHours[course.course_id] = allLabComps.length;
                    }
                }

                // If no courses in this OE group have a lab, skip the group
                if (labCourses.length === 0) continue;

                // Find max lab hours in group
                const labHours = Math.max(...Object.values(courseLabHours));
                console.log(`[OE LAB GROUP] oeNum=${oeNum} semNum=${semNum} finalLab=${labHours}`);

                let labHoursLeft = labHours;
                const oeUsedDays = new Set();
                const scheduledHours = {};
                for (const course of labCourses) {
                    scheduledHours[course.course_id] = 0;
                }

                while (labHoursLeft > 0) {
                    const blockLen = Math.min(labHoursLeft, 3);
                    let placed = false;

                    labDayLoop:
                    for (const day of shuffle(DAYS)) {
                        if (oeUsedDays.has(`${semNum}_${day}`)) continue;

                        const validBlocks = getValidBlocks(slotsByDay[day], blockLen);

                        blockLoop:
                        for (const block of validBlocks) {
                            // Check if this block is free for all sections in the semester
                            const allFree = semSecs.every(sec =>
                                block.every(ts =>
                                    isFree(occ, ts.timeslot_id, null, null, null, sec.section_id, null, oeNum)
                                )
                            );
                            if (!allFree) continue;

                            const assignments = [];
                            let feasible = true;
                            const assignedRoomsInGroup = new Set();

                            for (const course of labCourses) {
                                // Determine active timeslots in this block for this specific course
                                const activeTs = block.filter((ts, idx) => scheduledHours[course.course_id] + idx < courseLabHours[course.course_id]);
                                if (activeTs.length === 0) continue;

                                const fac = getFacultyForCourse(course.course_id).find(fa =>
                                    activeTs.every(ts =>
                                        isFree(occ, ts.timeslot_id, fa.faculty_id, null, null, null, course.course_code, oeNum)
                                    )
                                );
                                if (!fac) {
                                    feasible = false;
                                    break;
                                }

                                const cbRow = courseBranches.find(
                                    cb =>
                                        Number(cb.course_id) === Number(course.course_id) &&
                                        semSecs.some(sec => Number(sec.branch_id) === Number(cb.branch_id))
                                );
                                const cap = cbRow?.course_capacity || 30;

                                // Find a lab room free during the active timeslots
                                const room = findLabRoom(
                                    cap,
                                    activeTs,
                                    null,
                                    null,
                                    course.course_code,
                                    oeNum,
                                    assignedRoomsInGroup,
                                    course.course_id
                                );

                                if (!room) {
                                    feasible = false;
                                    break;
                                }

                                assignedRoomsInGroup.add(room.room_id);
                                assignments.push({ course, fac, room, activeTs });
                            }

                            if (!feasible) continue;

                            // Commit entries only for active timeslots
                            for (const { course, fac, room, activeTs } of assignments) {
                                for (const ts of activeTs) {
                                    for (const sec of semSecs) {
                                        const actualCourse = semCourses.find(c => c.course_code === course.course_code && c.program_id === sec.program_id) || course;
                                        commitEntry(
                                            ts.day, ts.timeslot_id,
                                            sec.program_id, sec.branch_id, sec.semester_id,
                                            sec.section_id, null,
                                            actualCourse.course_id, course.course_code, fac.faculty_id, room.room_id,
                                            'LAB'
                                        );
                                    }
                                }
                                scheduledHours[course.course_id] += activeTs.length;
                            }

                            oeUsedDays.add(`${semNum}_${day}`);
                            placed = true;
                            labHoursLeft -= blockLen;
                            break labDayLoop;
                        }
                    }

                    if (!placed) {
                        console.warn(`[OE LAB] semNum=${semNum} oeNum=${oeNum} ${blockLen}hr block: unplaced.`);
                        break;
                    }
                }
            }
        }



        for (const sem of semesters) {
            const semSecs = allSections.filter(s => s.semester_id === sem.semester_id);
            if (!semSecs.length) continue;

            // sort sections so the ones with the most classes get first pick of slots
            semSecs.sort((a, b) => {
                const h = sec => allCourses
                    .filter(c =>
                        !c.is_open_elective && c.semester_id === sem.semester_id &&
                        courseBranches.some(cb =>
                            cb.course_code === c.course_code && cb.branch_id === sec.branch_id)
                    )
                    .reduce((sum, c) => {
                        const usage = courseCodeUsage[c.course_code] || 1;
                        const allComps = courseComponents.filter(cc => Number(cc.course_id) === Number(c.course_id));
                        return sum + allComps.length;
                    }, 0);
                return h(b) - h(a);
            });

            // give priority to B.Des and sections that have strict lab requirements
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
                    !c.is_open_elective && Number(c.semester_id) === Number(sem.semester_id) &&
                    courseBranches.some(cb =>
                        Number(cb.course_id) === Number(c.course_id) && Number(cb.branch_id) === Number(section.branch_id))
                );
                if (!sectionCourses.length) continue;

                const dayLoad = Object.fromEntries(DAYS.map(d => [d, 0]));
                const courseDay = {};

                // handle lab scheduling (needs consecutive blocks)

                for (const course of sectionCourses) {
                    const allLabComps = courseComponents.filter(
                        cc => Number(cc.course_id) === Number(course.course_id) && cc.component_type === 'LAB'
                    );

                    const targetHours = allLabComps.length;

                    if (targetHours === 0) continue;

                    const cbRow = courseBranches.find(cb =>
                        cb.course_id === course.course_id && cb.branch_id === section.branch_id);

                    const totalLabHours = targetHours;
                    const labRows = allLabComps.slice(0, targetHours);
                    const isSplit = cbRow?.branch_lab_group_type === 'SPLIT' || (cbRow?.branch_lab_group_type !== 'COMBINED' && labRows[0].lab_group_type === 'SPLIT');
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

                // handle theory and tutorial tasks (single slots)

                const theoryTasks = [];
                for (const course of sectionCourses) {
                    const cbRow = courseBranches.find(cb =>
                        cb.course_id === course.course_id && cb.branch_id === section.branch_id);
                    const cap = cbRow?.course_capacity || 0;

                    const allComps = courseComponents.filter(cc =>
                        Number(cc.course_id) === Number(course.course_id) && cc.component_type !== 'LAB'
                    );
                    // make sure we schedule all the required theory hours
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

                    // if the first pass didn't work, try every possible remaining slot
                    if (!placed) {
                        relaxLoop:
                        for (const day of shuffle(DAYS)) {
                            if ((dayLoad[day] || 0) >= 8) continue;

                            // don't put the same course twice on the same day
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

                // try to fix days that have zero classes to balance things out

                for (const emptyDay of DAYS) {
                    if (dayLoad[emptyDay] > 0) continue;

                    const candidate = inserts.find(row =>
                        row[5] === section.section_id &&
                        row[11] === 'THEORY' &&
                        row[6] === null &&
                        !allCourses.find(c => c.course_id === row[7])?.is_open_elective
                    );
                    if (!candidate) continue;

                    const [oldDay, oldTsId, , , , , , courseId, courseCode, facId, roomId] = candidate;
                    if (courseDay[`${courseCode}_${emptyDay}`]) continue;

                    const courseObj = allCourses.find(c => c.course_id === courseId);
                    const oeNum = courseObj?.is_open_elective === 1 ? courseObj.open_elective_number : null;

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

        // get basic details for this section
        const [[secInfo]] = await conn.query(`
            SELECT s.section_id, s.branch_id, s.semester_id, s.section_name,
                   sem.program_id, sem.semester_number
            FROM section s JOIN semester sem ON s.semester_id = sem.semester_id
            WHERE s.section_id = ? AND s.institute_id = ? AND sem.institute_id = ?`, [section_id, req.user.institute_id, req.user.institute_id]);
        if (!secInfo) { await conn.rollback(); return res.status(400).json({ error: 'Section not found' }); }

        // get course details
        const [[courseInfo]] = await conn.query('SELECT * FROM courses WHERE course_id = ? AND institute_id = ?', [course_id, req.user.institute_id]);
        if (!courseInfo) { await conn.rollback(); return res.status(400).json({ error: 'Course not found' }); }
        const course_code = courseInfo.course_code;

        // get timeslot details
        const [[tsInfo]] = await conn.query('SELECT * FROM time_slots WHERE timeslot_id = ? AND institute_id = ?', [timeslot_id, req.user.institute_id]);
        if (!tsInfo) { await conn.rollback(); return res.status(400).json({ error: 'Timeslot not found' }); }
        if (tsInfo.is_break) {
            await conn.rollback(); return res.status(400).json({ error: 'Cannot schedule in break slot' });
        }

        // check how many hours this course actually needs
        const [allComponents] = await conn.query(
            'SELECT * FROM course_components WHERE course_id = ? AND component_type = ? AND institute_id = ?',
            [course_id, component_type, req.user.institute_id]);
        if (allComponents.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: `No ${component_type} component defined for course ${course_code}` });
        }
        const maxHours = allComponents.length;

        // see how many hours are already booked (handles split groups too)
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
        if (courseInfo.is_open_elective === 1) {
            const [allSecs] = await conn.query(`
                SELECT s.section_id, s.branch_id, s.semester_id, sem.program_id 
                FROM section s 
                JOIN semester sem ON s.semester_id = sem.semester_id 
                WHERE sem.semester_number = ? AND s.institute_id = ? AND sem.institute_id = ?`,
                [secInfo.semester_number, req.user.institute_id, req.user.institute_id]);
            targetSections = allSecs;
        }

        // find the faculty assigned to this course and section
        const [facAllocations] = await conn.query(`
            SELECT fa.faculty_id, f.faculty_name, f.faculty_short
            FROM faculty_allocation fa
            JOIN faculty f ON fa.faculty_id = f.faculty_id AND f.institute_id = fa.institute_id
            WHERE fa.course_id = ? AND fa.section_id = ? AND fa.institute_id = ?`,
            [courseInfo.course_id, section_id, req.user.institute_id]);
        if (facAllocations.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'No faculty allocated to this course for this section' });
        }

        // handle room capacity checks
        const [[cbRow]] = await conn.query(
            'SELECT course_capacity FROM course_branch WHERE course_id = ? AND branch_id = ? AND institute_id = ?',
            [course_id, secInfo.branch_id, req.user.institute_id]);

        let reqCap = cbRow?.course_capacity || 60;
        if (subsection_id) {
            const [[subRow]] = await conn.query('SELECT subsection_capacity FROM subsection WHERE subsection_id = ? AND institute_id = ?', [subsection_id, req.user.institute_id]);
            if (subRow) reqCap = subRow.subsection_capacity;
        }

        if (component_type === 'THEORY' || component_type === 'TUTORIAL') {
            // check if the section is already in a class
            for (const tSec of targetSections) {
                const [existingClasses] = await conn.query(`
                    SELECT m.*, c.is_open_elective, c.open_elective_number 
                    FROM ${tbl(req)} m
                    JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                    WHERE m.section_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                    [tSec.section_id, timeslot_id, req.user.institute_id]);

                if (existingClasses.length > 0) {
                    const isSameOE = courseInfo.is_open_elective === 1 &&
                        existingClasses.every(e => e.open_elective_number === courseInfo.open_elective_number && e.is_open_elective === 1);

                    if (!isSameOE) {
                        await conn.rollback();
                        return res.status(400).json({ error: `Section ${tSec.section_id} already busy in this slot (Strict One Class per Section Rule).` });
                    }
                }
            }

            // find a faculty member who isn't busy
            let freeFac = null;
            for (const fac of facAllocations) {
                const [[fb]] = await conn.query(
                    `SELECT 1 FROM ${tbl(req)} WHERE faculty_id = ? AND timeslot_id = ? AND institute_id = ?`,
                    [fac.faculty_id, timeslot_id, req.user.institute_id]);
                if (!fb) { freeFac = fac; break; }
            }
            if (!freeFac) { await conn.rollback(); return res.status(400).json({ error: 'All allocated faculty are busy in this slot' }); }

            // pick a room that fits and is available
            let room = null;
            if (room_id) {
                // If room is specified, verify it's free
                const [[rb]] = await conn.query(
                    `SELECT * FROM rooms WHERE room_id = ? AND institute_id = ?`, [room_id, req.user.institute_id]);
                if (!rb) { await conn.rollback(); return res.status(400).json({ error: 'Selected room not found' }); }

                // Capacity Check
                if (rb.capacity < reqCap) {
                    await conn.rollback();
                    return res.status(400).json({ error: `Room ${rb.room_name} capacity (${rb.capacity}) is less than required (${reqCap})` });
                }

                const [[busy]] = await conn.query(
                    `SELECT 1 FROM ${tbl(req)} WHERE room_id = ? AND timeslot_id = ? AND institute_id = ?`,
                    [room_id, timeslot_id, req.user.institute_id]);
                if (busy) { await conn.rollback(); return res.status(400).json({ error: `Selected room ${rb.room_name} is already busy in this slot` }); }

                room = rb;
            } else {
                // if no room was picked, find the best fit automatically
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

            // get every slot for the chosen day
            const [daySlots] = await conn.query(
                'SELECT * FROM time_slots WHERE day = ? AND institute_id = ? ORDER BY slot_order', [tsInfo.day, req.user.institute_id]);
            // Filter out breaks to create blockPool
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

            // double check the slots are back-to-back/consecutive
            for (let i = 0; i < labBlock.length - 1; i++) {
                if (labBlock[i + 1].slot_order !== labBlock[i].slot_order + 1) {
                    await conn.rollback(); return res.status(400).json({ error: 'Slots are not consecutive (cannot cross break slots)' });
                }
            }

            // check if the section is free for the entire lab window
            for (const slot of labBlock) {
                for (const tSec of targetSections) {
                    const [existingClasses] = await conn.query(`
                        SELECT m.*, c.is_open_elective, c.open_elective_number 
                        FROM ${tbl(req)} m
                        JOIN courses c ON (m.course_id = c.course_id OR (m.course_id IS NULL AND m.course_code = c.course_code AND m.program_id = c.program_id)) AND c.institute_id = m.institute_id
                        WHERE m.section_id = ? AND m.timeslot_id = ? AND m.institute_id = ?`,
                        [tSec.section_id, slot.timeslot_id, req.user.institute_id]);

                    if (existingClasses.length > 0) {

                        const isSameOE = courseInfo.is_open_elective === 1 &&
                            existingClasses.every(e => e.open_elective_number === courseInfo.open_elective_number && e.is_open_elective === 1);

                        if (!isSameOE) {
                            await conn.rollback();
                            return res.status(400).json({ error: `Section ${tSec.section_id} already busy at ${String(slot.start_time).slice(0, 5)} (Strict One Class per Section Rule).` });
                        }
                    }
                }
            }

            // make sure faculty is free for the whole lab block
            let freeFac = null;
            for (const fac of facAllocations) {
                let isBusy = false;
                for (const slot of labBlock) {
                    const [[fb]] = await conn.query(
                        `SELECT 1 FROM ${tbl(req)} WHERE faculty_id = ? AND timeslot_id = ? AND institute_id = ?`,
                        [fac.faculty_id, slot.timeslot_id, req.user.institute_id]);
                    if (fb) { isBusy = true; break; }
                }
                if (!isBusy) { freeFac = fac; break; }
            }
            if (!freeFac) { await conn.rollback(); return res.status(400).json({ error: 'Faculty busy across required lab slots' }); }

            // find a lab room that works for the whole block
            let freeRoom = null;
            if (room_id) {
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
                    const [[busy]] = await conn.query(
                        `SELECT 1 FROM ${tbl(req)} WHERE room_id = ? AND timeslot_id = ? AND institute_id = ?`,
                        [room_id, slot.timeslot_id, req.user.institute_id]);
                    if (busy) { isBusy = true; break; }
                }
                if (isBusy) { await conn.rollback(); return res.status(400).json({ error: `Selected lab ${rb.room_name} is busy in one of the required slots` }); }

                freeRoom = rb;
            } else {

                const [labRooms] = await conn.query(
                    'SELECT * FROM rooms WHERE room_type = ? AND capacity >= ? AND institute_id = ? ORDER BY capacity ASC',
                    ['LAB', reqCap, req.user.institute_id]);
                for (const room of labRooms) {
                    let isBusy = false;
                    for (const slot of labBlock) {
                        const [[rb]] = await conn.query(
                            `SELECT 1 FROM ${tbl(req)} WHERE room_id = ? AND timeslot_id = ? AND institute_id = ?`,
                            [room.room_id, slot.timeslot_id, req.user.institute_id]);
                        if (rb) { isBusy = true; break; }
                    }
                    if (!isBusy) { freeRoom = room; break; }
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