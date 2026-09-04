const db = require('../config/db');

// Helper to determine table name based on draft mode or request
const tbl = (isDraft) => (isDraft ? 'exam_timetable_draft' : 'exam_timetable');

// Helper to format Date to ordinal string like '26th April 2026'
function formatOrdinalDate(dateObj) {
    if (!dateObj || isNaN(new Date(dateObj).getTime())) return '';
    const d = new Date(dateObj);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();

    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    else if (day % 10 === 2 && day !== 12) suffix = 'nd';
    else if (day % 10 === 3 && day !== 13) suffix = 'rd';

    return `${day}${suffix} ${month} ${year}`;
}

// Helper to get day name like 'Monday'
function getDayName(dateObj) {
    if (!dateObj || isNaN(new Date(dateObj).getTime())) return '';
    return new Date(dateObj).toLocaleString('en-US', { weekday: 'long' });
}

// Helper to format Time (e.g. '09:30:00' -> '09:30 AM')
function formatTime12(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.toString().split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    return `${hStr}:${m} ${ampm}`;
}

// EXAM TIMESLOTS

exports.getExamTimeslots = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM exam_timeslots WHERE institute_id = ? ORDER BY exam_date, start_time',
            [req.user.institute_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createExamTimeslot = async (req, res) => {
    try {
        const { exam_date, start_time, end_time, exam_type, slot_name } = req.body;
        if (!exam_date || !start_time || !end_time) {
            return res.status(400).json({ error: 'Date, start time, and end time are required' });
        }

        await db.query(
            `INSERT INTO exam_timeslots (exam_date, start_time, end_time, exam_type, slot_name, institute_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [exam_date, start_time, end_time, exam_type || 'END_SEM', slot_name || 'Morning', req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateExamTimeslot = async (req, res) => {
    try {
        const { id } = req.params;
        const { exam_date, start_time, end_time, exam_type, slot_name } = req.body;

        await db.query(
            `UPDATE exam_timeslots 
             SET exam_date = ?, start_time = ?, end_time = ?, exam_type = ?, slot_name = ?
             WHERE exam_slot_id = ? AND institute_id = ?`,
            [exam_date, start_time, end_time, exam_type || 'END_SEM', slot_name || 'Morning', id, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExamTimeslot = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            'DELETE FROM exam_timeslots WHERE exam_slot_id = ? AND institute_id = ?',
            [id, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// BACKLOG COURSES REGISTRATIONS

exports.getBacklogCourses = async (req, res) => {
    try {
        const query = `
            SELECT ebc.*, 
                   p.program_name as student_program_name,
                   b.branch_name as student_branch_name,
                   sem_s.semester_number as student_semester_number,
                   c.course_code, c.course_name,
                   sem_b.semester_number as backlog_semester_number
            FROM exam_backlog_courses ebc
            JOIN program p ON ebc.student_program_id = p.program_id
            JOIN branch b ON ebc.student_branch_id = b.branch_id
            JOIN semester sem_s ON ebc.student_semester_id = sem_s.semester_id
            JOIN courses c ON ebc.course_id = c.course_id
            JOIN semester sem_b ON ebc.backlog_semester_id = sem_b.semester_id
            WHERE ebc.institute_id = ?
        `;
        const [rows] = await db.query(query, [req.user.institute_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createBacklogCourse = async (req, res) => {
    try {
        const { student_program_id, student_semester_id, student_branch_id, course_id, backlog_semester_id } = req.body;
        if (!student_program_id || !student_semester_id || !student_branch_id || !course_id || !backlog_semester_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        await db.query(
            `INSERT INTO exam_backlog_courses 
             (student_program_id, student_semester_id, student_branch_id, course_id, backlog_semester_id, institute_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_program_id, student_semester_id, student_branch_id, course_id, backlog_semester_id, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBacklogCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            'DELETE FROM exam_backlog_courses WHERE id = ? AND institute_id = ?',
            [id, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SLOT PREFERENCES (PROGRAM & SEMESTER)

exports.getExamSlotPreferences = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM exam_slot_preferences WHERE institute_id = ?',
            [req.user.institute_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveExamSlotPreference = async (req, res) => {
    try {
        const { program_id, semester_id, preferred_time_window } = req.body;
        if (!program_id || !semester_id) {
            return res.status(400).json({ error: 'Program and Semester are required' });
        }

        await db.query(
            `INSERT INTO exam_slot_preferences (program_id, semester_id, preferred_time_window, institute_id)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE preferred_time_window = VALUES(preferred_time_window)`,
            [program_id, semester_id, preferred_time_window || 'ANY', req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// EXAM TIMETABLE GENERATION ALGORITHM

exports.generateExamTimetable = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const instId = req.user.institute_id;

        // 1. Fetch available Exam Timeslots
        const [timeslots] = await conn.query(
            'SELECT * FROM exam_timeslots WHERE institute_id = ? ORDER BY exam_date, start_time',
            [instId]
        );

        if (!timeslots.length) {
            await conn.rollback();
            return res.status(400).json({ error: 'No exam timeslots configured. Please add exam timeslots first.' });
        }

        // Determine main exam type (MID_SEM or END_SEM)
        const mainExamType = timeslots[0].exam_type || 'END_SEM';

        // 2. Fetch total CLASSROOM capacity x
        const [rooms] = await conn.query(
            "SELECT room_id, capacity FROM rooms WHERE room_type = 'CLASSROOM' AND institute_id = ?",
            [instId]
        );
        const totalClassroomCap = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
        const slotCapLimit = totalClassroomCap > 0 ? Math.floor(totalClassroomCap / 2) : 10000;

        // 3. Fetch courses that have THEORY or TUTORIAL hours > 0
        const [allCourses] = await conn.query(
            `SELECT c.*, 
                    (SELECT COUNT(*) FROM course_components cc WHERE cc.course_id = c.course_id AND cc.component_type = 'THEORY') as theory_hours,
                    (SELECT COUNT(*) FROM course_components cc WHERE cc.course_id = c.course_id AND cc.component_type = 'TUTORIAL') as tutorial_hours
             FROM courses c
             WHERE c.institute_id = ?`,
            [instId]
        );

        const eligibleCourses = allCourses.filter(c => Number(c.theory_hours) > 0 || Number(c.tutorial_hours) > 0);

        if (!eligibleCourses.length) {
            await conn.rollback();
            return res.status(400).json({ error: 'No courses found with Theory or Tutorial components.' });
        }

        // 4. Fetch section mappings and course capacities
        const [courseSections] = await conn.query(
            `SELECT cs.*, s.branch_id, s.semester_id, s.section_id, b.program_id, s.section_name,
                    COALESCE(cs.section_is_open_elective, c.is_open_elective) AS effective_is_oe
             FROM course_section cs
             JOIN section s ON cs.section_id = s.section_id
             JOIN branch b ON s.branch_id = b.branch_id
             JOIN courses c ON cs.course_id = c.course_id
             WHERE cs.institute_id = ?`,
            [instId]
        );

        // 4b. Fetch all branches per program so common courses (no sections) can block all branches
        const [allBranches] = await conn.query(
            'SELECT branch_id, program_id FROM branch WHERE institute_id = ?',
            [instId]
        );
        const programBranchMap = new Map(); // program_id -> [branch_ids]
        for (const b of allBranches) {
            if (!programBranchMap.has(b.program_id)) programBranchMap.set(b.program_id, []);
            programBranchMap.get(b.program_id).push(b.branch_id);
        }

        // 5. Fetch Faculty Allocations for instructor initials
        const [facAllocations] = await conn.query(
            `SELECT fa.*, f.faculty_short 
             FROM faculty_allocation fa
             JOIN faculty f ON fa.faculty_id = f.faculty_id
             WHERE fa.institute_id = ?`,
            [instId]
        );

        // Helper to format Instructor short names (e.g. 'ND' or 'SSL+MKP+BG+LKB')
        function getInstructorInitials(courseId, courseCode) {
            const allocs = facAllocations.filter(fa => Number(fa.course_id) === Number(courseId));
            if (!allocs.length) return 'TBA';
            const initials = [...new Set(allocs.map(a => a.faculty_short).filter(Boolean))];
            return initials.length ? initials.join('+') : 'TBA';
        }

        // Helper to calculate student capacity for a course
        // Always MAX across all section capacities — all sections write the same paper in the same room setup.
        // For a course that is OE in some sections and mandatory in others, take MAX (not SUM) to avoid double-counting.
        function getCourseStudentCapacity(courseId) {
            const secMatches = courseSections.filter(cs => Number(cs.course_id) === Number(courseId));
            if (!secMatches.length) return 60;
            return secMatches.reduce((max, s) => Math.max(max, s.course_capacity || 0), 0) || 60;
        }

        // 6. Fetch Backlog Courses Registrations
        const [backlogRegs] = await conn.query(
            'SELECT * FROM exam_backlog_courses WHERE institute_id = ?',
            [instId]
        );

        // 7. Fetch Slot Preferences
        const [slotPrefs] = await conn.query(
            'SELECT * FROM exam_slot_preferences WHERE institute_id = ?',
            [instId]
        );

        // 8. Unique Course Item Construction
        // Group courses by course_code so shared courses across programs/semesters are scheduled TOGETHER in 1 slot.
        // Targets now carry section_id and effective_is_oe (per-section OE override).
        const uniqueCourseMap = new Map();

        for (const c of eligibleCourses) {
            const code = c.course_code;

            // Get all section rows for this course_id
            const secRows = courseSections.filter(cs => Number(cs.course_id) === Number(c.course_id));

            // Collect branches
            let courseBranches = secRows.map(cs => cs.branch_id);
            if (courseBranches.length === 0) {
                // No sections → common course for ALL branches of its program
                courseBranches = programBranchMap.get(c.program_id) || [];
            }

            if (!uniqueCourseMap.has(code)) {
                const initials = getInstructorInitials(c.course_id, c.course_code);
                const capacity = getCourseStudentCapacity(c.course_id);
                uniqueCourseMap.set(code, {
                    course_code: code,
                    instructor_names: initials,
                    student_capacity: capacity,
                    _branchSet: new Set(courseBranches),
                    is_open_elective: Number(c.is_open_elective) === 1 ? 1 : 0,
                    open_elective_number: c.open_elective_number,
                    targets: []
                });
            } else {
                courseBranches.forEach(b => uniqueCourseMap.get(code)._branchSet.add(b));
            }

            const item = uniqueCourseMap.get(code);

            if (secRows.length > 0) {
                // One target per SECTION — carries section_id and effective OE status for that section
                for (const sec of secRows) {
                    const alreadyAdded = item.targets.some(
                        t => t.course_id === c.course_id && t.section_id === sec.section_id
                    );
                    if (!alreadyAdded) {
                        item.targets.push({
                            course_id: c.course_id,
                            program_id: c.program_id,
                            semester_id: c.semester_id,
                            semester_number: c.semester_number,
                            section_id: sec.section_id,
                            branch_id: sec.branch_id,
                            effective_is_oe: Number(sec.effective_is_oe) // 0 or 1 per-section
                        });
                    }
                }
            } else {
                // No section rows → use course-level OE flag, no specific section_id
                if (!item.targets.some(t => t.course_id === c.course_id && !t.section_id)) {
                    item.targets.push({
                        course_id: c.course_id,
                        program_id: c.program_id,
                        semester_id: c.semester_id,
                        semester_number: c.semester_number,
                        section_id: null,
                        effective_is_oe: Number(c.is_open_elective)
                    });
                }
            }
        }

        const courseItems = Array.from(uniqueCourseMap.values()).map(item => ({
            ...item,
            branch_ids: [...item._branchSet],
            program_id: item.targets[0].program_id,
            semester_id: item.targets[0].semester_id,
            semester_number: item.targets[0].semester_number
        }));

        //  OE Bundle Construction with Disjoint Cross-Program Merging
        // Step 1: Separate pure mandatory courses from courses having OE targets
        const regularItems = [];
        const initialOEBundles = new Map();

        for (const item of courseItems) {
            const oeTargets = item.targets.filter(t => t.effective_is_oe === 1);
            const nonOETargets = item.targets.filter(t => t.effective_is_oe === 0);

            if (oeTargets.length === 0) {
                // Purely mandatory course
                regularItems.push(item);
            } else {
                // Has OE targets → group into OE bundles by section & OE group number
                for (const t of oeTargets) {
                    const oeNum = item.open_elective_number || 1;
                    const secKey = t.section_id != null ? `sec_${t.section_id}` : `prog_${t.program_id}_sem_${t.semester_id}`;
                    const grpKey = `${secKey}_OE${oeNum}`;

                    if (!initialOEBundles.has(grpKey)) {
                        initialOEBundles.set(grpKey, {
                            courses: new Map(), // course_code -> item
                            targets: new Map(), // targetKey -> targetObj
                            program_id: t.program_id,
                            semester_id: t.semester_id,
                            semester_number: t.semester_number
                        });
                    }
                    const b = initialOEBundles.get(grpKey);
                    b.courses.set(item.course_code, item);
                    b.targets.set(`${t.course_id}_${secKey}`, t);

                    // Include any non-OE targets of this same course code into the bundle targets
                    // so day-tracking locks out mandatory sections on the same day as well
                    for (const nonOET of nonOETargets) {
                        const nonOESecKey = nonOET.section_id != null ? `sec_${nonOET.section_id}` : `prog_${nonOET.program_id}_sem_${nonOET.semester_id}`;
                        b.targets.set(`${nonOET.course_id}_${nonOESecKey}`, nonOET);
                    }
                }
            }
        }

        // Step 2: Merge bundles that share any course code (disjoint set merging)
        // This ensures "Same course code = same slot" across programs (e.g. BTech vs MTech OE sharing)
        const bundleList = Array.from(initialOEBundles.values());
        const mergedBundles = [];

        while (bundleList.length > 0) {
            let current = bundleList.shift();
            let mergedAny = true;

            while (mergedAny) {
                mergedAny = false;
                for (let i = bundleList.length - 1; i >= 0; i--) {
                    const other = bundleList[i];
                    // Check if current and other share any course code
                    const sharesCourse = [...current.courses.keys()].some(code => other.courses.has(code));
                    if (sharesCourse) {
                        // Merge other into current
                        for (const [code, item] of other.courses.entries()) {
                            current.courses.set(code, item);
                        }
                        for (const [tKey, tObj] of other.targets.entries()) {
                            current.targets.set(tKey, tObj);
                        }
                        bundleList.splice(i, 1);
                        mergedAny = true;
                    }
                }
            }
            mergedBundles.push(current);
        }

        // Step 3: Build final schedulable OE bundle units
        const schedulableUnits = [...regularItems];

        for (let idx = 0; idx < mergedBundles.length; idx++) {
            const b = mergedBundles[idx];
            const uniqueCourses = Array.from(b.courses.values());
            const uniqueTargets = Array.from(b.targets.values());
            const bundleCapacity = uniqueCourses.reduce((sum, ci) => sum + ci.student_capacity, 0);

            schedulableUnits.push({
                is_bundle: true,
                bundle_key: `OE_Bundle_${idx + 1}`,
                items: uniqueCourses,
                is_open_elective: 1,
                targets: uniqueTargets,
                student_capacity: bundleCapacity,
                branch_ids: [...new Set(uniqueCourses.flatMap(ci => ci.branch_ids))],
                program_id: b.program_id,
                semester_id: b.semester_id,
                semester_number: b.semester_number
            });
        }

        // 9. Most-Constrained-First (MCV) Priority Ordering
        // Sort units so most-constrained courses are placed first:
        // 1. Backlogs & Multi-backlog cohort dependencies
        // 2. OE Bundles
        // 3. Multi-section coverage
        // 4. Higher Semester Number
        function calculateConstraintScore(unit) {
            let score = 0;
            const unitCourseIds = (unit.is_bundle ? unit.items : [unit]).flatMap(i => (i.targets || []).map(t => t.course_id));
            const matchingBacklogs = backlogRegs.filter(b => unitCourseIds.includes(Number(b.course_id)));
            if (matchingBacklogs.length > 0) {
                score += 1000 + (matchingBacklogs.length * 200);
            }
            if (unit.is_bundle) score += 500;
            const totalSections = (unit.targets || []).length;
            score += totalSections * 10;
            score += (unit.semester_number || 0);
            return score;
        }

        schedulableUnits.sort((a, b) => calculateConstraintScore(b) - calculateConstraintScore(a));

        // 10. Constraint Solver Setup
        const slotTracking = new Map();
        // Section Day Isolation: dateUsed maps dateStr -> Set("sec_39", "sec_40", ...)
        // Guarantees strictly 1 regular exam per section per calendar day.
        const dateUsed = new Map(); // dateStr -> Set(sectionKey)
        // Cohort Day Counts: tracks how many exams a student cohort has on a given date (max 2: 1 Morning + 1 Afternoon)
        const cohortDayCounts = new Map();

        for (const slot of timeslots) {
            slotTracking.set(slot.exam_slot_id, {
                slot: slot,
                assignedUnits: [],
                currentCapacity: 0,
                programSemesters: new Set(),
                branches: new Set(),
                courses: new Set(),
                backlogCourseIds: new Set(),
                studentCohorts: new Set() // Tracks prog_branch_sem for regular and backlog cohorts in slot
            });
        }

        function toLocalDateStr(d) {
            if (!d) return '';
            if (typeof d === 'string') return d.slice(0, 10);
            const date = new Date(d);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const sortedSlotIds = timeslots.map(s => s.exam_slot_id);

        // Helper to check if a unit can be placed in a slot
        function canPlace(unit, slotId, allowCapacityOverflow = false, allowBranchClash = false) {
            const track = slotTracking.get(slotId);
            const slot = track.slot;
            const dateStr = toLocalDateStr(slot.exam_date);

            // Rule 1: Strictly 1 exam per regular section per calendar day
            const usedToday = dateUsed.get(dateStr) || new Set();
            const allTargets = unit.targets || [];
            for (const t of allTargets) {
                const sectionKey = t.section_id != null
                    ? `sec_${t.section_id}`
                    : `prog_${t.program_id}_sem_${t.semester_id}`;
                if (usedToday.has(sectionKey)) return false;
            }

            // Collect all student cohorts participating in this unit (regular and backlog)
            const unitCohorts = new Set();
            for (const t of allTargets) {
                const branchList = unit.branch_ids || (t.branch_id ? [t.branch_id] : []);
                for (const bId of branchList) {
                    unitCohorts.add(`cohort_${t.program_id}_${bId}_${t.semester_id}`);
                }
                const backlogsForCourse = backlogRegs.filter(b => Number(b.course_id) === Number(t.course_id));
                for (const bl of backlogsForCourse) {
                    unitCohorts.add(`cohort_${bl.student_program_id}_${bl.student_branch_id}_${bl.student_semester_id}`);
                }
            }

            // Check max 2 exams per day & 0 clashes in current timeslot for all participating cohorts
            for (const cohortKey of unitCohorts) {
                const currentExamsToday = cohortDayCounts.get(`${dateStr}_${cohortKey}`) || 0;
                if (currentExamsToday >= 2) return false;
                if (track.studentCohorts.has(cohortKey)) return false;
            }

            // Rule 3, 4, 5: Check per-item slot-level constraints
            const unitItems = unit.is_bundle ? unit.items : [unit];
            for (const item of unitItems) {
                // Rule 3: No duplicate course in same slot
                if (track.courses.has(item.course_code)) return false;

                const itemTargets = item.targets || [{ semester_id: item.semester_id, program_id: item.program_id }];

                // Rule 4: No Branch & Semester clash in same slot
                if (!allowBranchClash) {
                    for (const t of itemTargets) {
                        for (const bId of item.branch_ids) {
                            if (track.branches.has(`${bId}_${t.semester_id}`)) return false;
                        }
                    }
                }

                // Regular course check against any backlog courses already in slot
                for (const t of itemTargets) {
                    const backlogStudentsInThisSem = backlogRegs.filter(
                        b => Number(b.student_program_id) === Number(t.program_id) &&
                            Number(b.student_semester_id) === Number(t.semester_id) &&
                            (t.branch_id == null || Number(b.student_branch_id) === Number(t.branch_id))
                    );
                    for (const bl of backlogStudentsInThisSem) {
                        if (track.backlogCourseIds && track.backlogCourseIds.has(bl.course_id)) return false;
                    }
                }
            }

            return true;
        }

        function placeUnit(unit, slotId) {
            const track = slotTracking.get(slotId);
            const slot = track.slot;
            const dateStr = toLocalDateStr(slot.exam_date);

            track.assignedUnits.push(unit);
            track.currentCapacity += unit.student_capacity;

            if (!dateUsed.has(dateStr)) dateUsed.set(dateStr, new Set());
            const usedToday = dateUsed.get(dateStr);

            // Update day tracking per target section
            const allTargets = unit.targets || [];
            for (const t of allTargets) {
                if (t.section_id != null) {
                    usedToday.add(`sec_${t.section_id}`);
                }
            }

            // Collect all unique cohorts in this unit (regular & backlog)
            const unitCohorts = new Set();
            for (const t of allTargets) {
                const branchList = unit.branch_ids || (t.branch_id ? [t.branch_id] : []);
                for (const bId of branchList) {
                    unitCohorts.add(`cohort_${t.program_id}_${bId}_${t.semester_id}`);
                }
                const backlogsForCourse = backlogRegs.filter(b => Number(b.course_id) === Number(t.course_id));
                for (const bl of backlogsForCourse) {
                    unitCohorts.add(`cohort_${bl.student_program_id}_${bl.student_branch_id}_${bl.student_semester_id}`);
                }
            }

            // Increment day count and record slot occupancy once per unique cohort
            for (const cohortKey of unitCohorts) {
                const cnt = cohortDayCounts.get(`${dateStr}_${cohortKey}`) || 0;
                cohortDayCounts.set(`${dateStr}_${cohortKey}`, cnt + 1);
                track.studentCohorts.add(cohortKey);
            }

            // Update slot-level tracking
            const unitItems = unit.is_bundle ? unit.items : [unit];
            for (const item of unitItems) {
                track.courses.add(item.course_code);
                const itemTargets = item.targets || [{ semester_id: item.semester_id, program_id: item.program_id }];
                for (const t of itemTargets) {
                    track.programSemesters.add(`${t.program_id}_${t.semester_id}`);
                    const branchList = item.branch_ids && item.branch_ids.length ? item.branch_ids : (t.branch_id ? [t.branch_id] : []);
                    for (const bId of branchList) {
                        track.branches.add(`${bId}_${t.semester_id}`);
                        track.studentCohorts.add(`cohort_${t.program_id}_${bId}_${t.semester_id}`);
                    }
                    const backlogsForCourse = backlogRegs.filter(b => Number(b.course_id) === Number(t.course_id));
                    if (backlogsForCourse.length > 0) {
                        track.backlogCourseIds.add(t.course_id);
                        for (const bl of backlogsForCourse) {
                            track.studentCohorts.add(`cohort_${bl.student_program_id}_${bl.student_branch_id}_${bl.student_semester_id}`);
                        }
                    }
                }
            }
        }

        function getPreferredSlots(unit) {
            const prefObj = slotPrefs.find(p => Number(p.program_id) === Number(unit.program_id) && Number(p.semester_id) === Number(unit.semester_id));
            const prefWindow = prefObj ? prefObj.preferred_time_window : 'ANY';

            return [...sortedSlotIds].sort((s1, s2) => {
                const t1 = slotTracking.get(s1);
                const t2 = slotTracking.get(s2);
                const p1 = (prefWindow === 'MORNING' && (t1.slot.slot_name || '').toUpperCase().includes('MORNING')) ? -10 :
                    (prefWindow === 'AFTERNOON' && (t1.slot.slot_name || '').toUpperCase().includes('AFTERNOON')) ? -10 : 0;
                const p2 = (prefWindow === 'MORNING' && (t2.slot.slot_name || '').toUpperCase().includes('MORNING')) ? -10 :
                    (prefWindow === 'AFTERNOON' && (t2.slot.slot_name || '').toUpperCase().includes('AFTERNOON')) ? -10 : 0;
                if (p1 !== p2) return p1 - p2;
                return t1.assignedUnits.length - t2.assignedUnits.length;
            });
        }

        const unscheduled = [];

        // PASS 1: All constraints strictly enforced
        for (const unit of schedulableUnits) {
            const slots = getPreferredSlots(unit);
            let placed = false;
            for (const slotId of slots) {
                if (canPlace(unit, slotId, false, false)) {
                    placeUnit(unit, slotId);
                    placed = true;
                    break;
                }
            }
            if (!placed) unscheduled.push(unit);
        }

        // PASS 2: STRICTLY enforce student day isolation, slot isolation & multi-backlog protection
        const stillUnscheduled = [];
        for (const unit of unscheduled) {
            const slots = getPreferredSlots(unit);
            let placed = false;
            for (const slotId of slots) {
                if (canPlace(unit, slotId, true, false)) {
                    placeUnit(unit, slotId);
                    placed = true;
                    break;
                }
            }
            if (!placed) stillUnscheduled.push(unit);
        }

        // PASS 3
        const finalUnscheduled = [];
        for (const unit of stillUnscheduled) {
            const slots = [...sortedSlotIds];
            let placed = false;
            for (const slotId of slots) {
                if (canPlace(unit, slotId, true, true)) {
                    placeUnit(unit, slotId);
                    placed = true;
                    break;
                }
            }
            if (!placed) finalUnscheduled.push(unit);
        }

        if (finalUnscheduled.length > 0) {
            const failedSemesters = [...new Set(finalUnscheduled.flatMap(u => (u.targets || []).map(t => `Sem ${t.semester_number}`)))].join(', ');
            await conn.rollback();
            return res.status(400).json({
                error: `Cannot schedule exam timetable: Semester(s) [${failedSemesters}] have more courses than available exam slots. Please add more exam dates/timeslots.`
            });
        }


        // 10. Clear old draft and main table entries, then insert generated exam schedule
        await conn.query('DELETE FROM exam_timetable_draft WHERE institute_id = ?', [instId]);
        await conn.query('DELETE FROM exam_timetable WHERE institute_id = ?', [instId]);

        const dbInserts = [];
        const mainInserts = [];

        for (const [slotId, track] of slotTracking.entries()) {
            const slot = track.slot;
            for (const unit of track.assignedUnits) {
                const items = unit.is_bundle ? unit.items : [unit];
                for (const item of items) {
                    const targets = item.targets || [{ course_id: item.course_id, program_id: item.program_id, semester_id: item.semester_id }];
                    for (const target of targets) {
                        dbInserts.push([
                            mainExamType,
                            slotId,
                            slot.exam_date,
                            item.course_code,
                            target.course_id,
                            target.program_id,
                            target.semester_id,
                            item.instructor_names,
                            item.is_open_elective,
                            1, // is_draft = 1
                            instId
                        ]);

                        mainInserts.push([
                            mainExamType,
                            slotId,
                            slot.exam_date,
                            item.course_code,
                            target.course_id,
                            target.program_id,
                            target.semester_id,
                            item.instructor_names,
                            item.is_open_elective,
                            0, // is_draft = 0
                            instId
                        ]);
                    }
                }
            }
        }

        if (dbInserts.length > 0) {
            await conn.query(
                `INSERT INTO exam_timetable_draft
                 (exam_type, exam_slot_id, exam_date, course_code, course_id, program_id, semester_id, instructor_names, is_open_elective, is_draft, institute_id)
                 VALUES ?`,
                [dbInserts]
            );

            await conn.query(
                `INSERT INTO exam_timetable
                 (exam_type, exam_slot_id, exam_date, course_code, course_id, program_id, semester_id, instructor_names, is_open_elective, is_draft, institute_id)
                 VALUES ?`,
                [mainInserts]
            );
        }

        await conn.commit();
        res.json({
            success: true,
            message: 'Exam Timetable generated successfully',
            count: dbInserts.length
        });

    } catch (err) {
        await conn.rollback();
        console.error('generateExamTimetable error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

// FETCH EXAM TIMETABLE (DRAFT & PUBLISHED)

exports.getExamTimetable = async (req, res) => {
    try {
        const isDraft = req.query.draft === 'true' || req.query.draft === true;
        const targetTable = tbl(isDraft);
        const instId = req.user.institute_id;

        // Fetch Exam Entries
        let [entries] = await db.query(
            `SELECT e.exam_id, e.exam_type, e.exam_slot_id,
                    DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date,
                    e.course_code, e.course_id, e.program_id, e.semester_id,
                    e.instructor_names, e.is_open_elective, e.is_draft,
                    ts.start_time, ts.end_time, ts.slot_name, ts.exam_type as slot_exam_type,
                    p.program_name, sem.semester_number
             FROM ${targetTable} e
             JOIN exam_timeslots ts ON e.exam_slot_id = ts.exam_slot_id
             JOIN program p ON e.program_id = p.program_id
             JOIN semester sem ON e.semester_id = sem.semester_id
             WHERE e.institute_id = ?
             ORDER BY e.exam_date, ts.start_time, sem.semester_number`,
            [instId]
        );

        // Fallback: If querying published table returns no entries, fallback to draft table
        if (!entries.length && !isDraft) {
            [entries] = await db.query(
                `SELECT e.exam_id, e.exam_type, e.exam_slot_id,
                        DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date,
                        e.course_code, e.course_id, e.program_id, e.semester_id,
                        e.instructor_names, e.is_open_elective, e.is_draft,
                        ts.start_time, ts.end_time, ts.slot_name, ts.exam_type as slot_exam_type,
                        p.program_name, sem.semester_number
                 FROM exam_timetable_draft e
                 JOIN exam_timeslots ts ON e.exam_slot_id = ts.exam_slot_id
                 JOIN program p ON e.program_id = p.program_id
                 JOIN semester sem ON e.semester_id = sem.semester_id
                 WHERE e.institute_id = ?
                 ORDER BY e.exam_date, ts.start_time, sem.semester_number`,
                [instId]
            );
        }

        if (!entries.length) {
            return res.json({
                entries: [],
                header: {
                    title: 'End Semester Examination Time Table',
                    date_range: '',
                    days_range: '',
                    institute_name: 'PDPM-IIITDM Jabalpur',
                    academic_year: 'AY 2025-26',
                    semester_label: 'Even Semester'
                }
            });
        }

        // Calculate Min and Max Exam Dates
        const dateTimes = entries.map(e => new Date(e.exam_date).getTime());
        const minDate = new Date(Math.min(...dateTimes));
        const maxDate = new Date(Math.max(...dateTimes));

        const minDateStr = formatOrdinalDate(minDate);
        const maxDateStr = formatOrdinalDate(maxDate);
        const minDayStr = getDayName(minDate);
        const maxDayStr = getDayName(maxDate);

        // Determine Exam Type (MID_SEM vs END_SEM)
        const firstType = entries[0].slot_exam_type || entries[0].exam_type;
        const examTitle = firstType === 'MID_SEM'
            ? 'Mid Semester Examination Time Table'
            : 'End Semester Examination Time Table';

        // Calculate Academic Year (e.g. April 2026 -> AY 2025-26)
        const yearVal = minDate.getFullYear();
        const monthVal = minDate.getMonth() + 1; // 1-indexed
        let ayStr = 'AY 2025-26';
        if (monthVal <= 7) {
            ayStr = `AY ${yearVal - 1}-${String(yearVal).slice(-2)}`;
        } else {
            ayStr = `AY ${yearVal}-${String(yearVal + 1).slice(-2)}`;
        }

        // Determine Even vs Odd Semester
        const semNums = entries.map(e => Number(e.semester_number));
        const hasEven = semNums.some(s => s % 2 === 0);
        const semLabel = hasEven ? 'Even Semester' : 'Odd Semester';

        res.json({
            entries: entries,
            header: {
                title: examTitle,
                date_range: `${minDateStr} - ${maxDateStr}`,
                days_range: `(${minDayStr}-${maxDayStr})`,
                institute_name: 'PDPM-IIITDM Jabalpur',
                academic_year: ayStr,
                semester_label: semLabel
            }
        });

    } catch (err) {
        console.error('getExamTimetable error:', err);
        res.status(500).json({ error: err.message });
    }
};

// EDIT SESSION & DRAFT MANAGEMENT

exports.startExamEditSession = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const instId = req.user.institute_id;

        await conn.query('DELETE FROM exam_timetable_draft WHERE institute_id = ?', [instId]);
        await conn.query(
            `INSERT INTO exam_timetable_draft 
             (exam_type, exam_slot_id, exam_date, course_code, course_id, program_id, semester_id, instructor_names, is_open_elective, is_draft, institute_id)
             SELECT exam_type, exam_slot_id, exam_date, course_code, course_id, program_id, semester_id, instructor_names, is_open_elective, 1, institute_id
             FROM exam_timetable
             WHERE institute_id = ?`,
            [instId]
        );

        await conn.commit();
        res.json({ success: true, message: 'Edit session started' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

exports.saveExamEditSession = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const instId = req.user.institute_id;

        await conn.query('DELETE FROM exam_timetable WHERE institute_id = ?', [instId]);
        await conn.query(
            `INSERT INTO exam_timetable 
             (exam_type, exam_slot_id, exam_date, course_code, course_id, program_id, semester_id, instructor_names, is_open_elective, is_draft, institute_id)
             SELECT exam_type, exam_slot_id, exam_date, course_code, course_id, program_id, semester_id, instructor_names, is_open_elective, 0, institute_id
             FROM exam_timetable_draft
             WHERE institute_id = ?`,
            [instId]
        );

        await conn.query('DELETE FROM exam_timetable_draft WHERE institute_id = ?', [instId]);

        await conn.commit();
        res.json({ success: true, message: 'Exam timetable changes saved live' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

exports.cancelExamEditSession = async (req, res) => {
    try {
        await db.query('DELETE FROM exam_timetable_draft WHERE institute_id = ?', [req.user.institute_id]);
        res.json({ success: true, message: 'Draft changes discarded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExamEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_code, program_id, semester_id, exam_slot_id } = req.query;
        const isDraft = req.query.draft === 'true' || req.query.draft === true;
        const targetTable = tbl(isDraft);
        const instId = req.user.institute_id;

        if (course_code && program_id && semester_id && exam_slot_id) {
            await db.query(
                `DELETE FROM ${targetTable} 
                 WHERE course_code = ? AND program_id = ? AND semester_id = ? AND exam_slot_id = ? AND institute_id = ?`,
                [course_code, program_id, semester_id, exam_slot_id, instId]
            );
        } else {
            await db.query(`DELETE FROM ${targetTable} WHERE exam_id = ? AND institute_id = ?`, [id, instId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addExamEntry = async (req, res) => {
    try {
        const isDraft = req.query.draft === 'true' || req.query.draft === true;
        const targetTable = tbl(isDraft);
        const instId = req.user.institute_id;
        const { exam_slot_id, exam_date, course_id, course_code, program_id, semester_id, instructor_names, is_open_elective, exam_type } = req.body;

        if (!exam_slot_id || !course_code || !program_id || !semester_id) {
            return res.status(400).json({ error: 'exam_slot_id, course_code, program_id and semester_id are required' });
        }

        await db.query(
            `INSERT INTO ${targetTable}
             (exam_type, exam_slot_id, exam_date, course_code, course_id, program_id, semester_id, instructor_names, is_open_elective, is_draft, institute_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                exam_type || 'END_SEM',
                exam_slot_id,
                exam_date,
                course_code,
                course_id || null,
                program_id,
                semester_id,
                instructor_names || 'TBA',
                is_open_elective || 0,
                isDraft ? 1 : 0,
                instId
            ]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAvailableCourses = async (req, res) => {
    try {
        const instId = req.user.institute_id;
        const [rows] = await db.query(
            `SELECT DISTINCT c.course_id, c.course_code, c.course_name, c.is_open_elective,
                    p.program_id, p.program_name, sem.semester_id, sem.semester_number,
                    GROUP_CONCAT(DISTINCT f.faculty_short ORDER BY f.faculty_short SEPARATOR '+') as instructor_names
             FROM courses c
             JOIN course_section cs ON c.course_id = cs.course_id AND cs.institute_id = ?
             JOIN section s ON cs.section_id = s.section_id
             JOIN branch b ON s.branch_id = b.branch_id
             JOIN program p ON b.program_id = p.program_id
             JOIN semester sem ON s.semester_id = sem.semester_id
             LEFT JOIN faculty_allocation fa ON fa.course_id = c.course_id AND fa.institute_id = ?
             LEFT JOIN faculty f ON fa.faculty_id = f.faculty_id
             WHERE c.institute_id = ?
               AND EXISTS (
                   SELECT 1 FROM course_components cc
                   WHERE cc.course_id = c.course_id AND cc.component_type IN ('THEORY','TUTORIAL')
               )
             GROUP BY c.course_id, p.program_id, sem.semester_id
             ORDER BY p.program_name, sem.semester_number, c.course_code`,
            [instId, instId, instId]
        );
        res.json({ courses: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clearExamTimetable = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const instId = req.user.institute_id;

        await conn.query('DELETE FROM exam_timetable WHERE institute_id = ?', [instId]);
        await conn.query('DELETE FROM exam_timetable_draft WHERE institute_id = ?', [instId]);

        await conn.commit();
        res.json({ success: true, message: 'Exam timetable deleted successfully' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};