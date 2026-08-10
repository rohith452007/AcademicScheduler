const db = require('../config/db');

// Academic Structure Management

// Programs
exports.getPrograms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM program WHERE institute_id = ?', [req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProgram = async (req, res) => {
    try {
        const { program_name } = req.body;
        const [existing] = await db.query('SELECT * FROM program WHERE program_name = ? AND institute_id = ?', [program_name, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Program already exists' });

        await db.query('INSERT INTO program (program_name, institute_id) VALUES (?, ?)', [program_name, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { program_name } = req.body;
        console.log(`[UPDATE] Program ID: ${id}`, { program_name });

        const [existing] = await db.query('SELECT * FROM program WHERE program_name = ? AND program_id != ? AND institute_id = ?', [program_name, id, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Another program with this name already exists' });

        await db.query('UPDATE program SET program_name = ? WHERE program_id = ? AND institute_id = ?', [program_name, id, req.user.institute_id]);
        res.json({ success: true, message: 'Updated successfully' });
    } catch (err) {
        console.error('Update Program Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProgram = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DELETE] Program ID: ${id}`);
        const [result] = await db.query('DELETE FROM program WHERE program_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Program not found or already deleted' });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Program Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Years
exports.getYears = async (req, res) => {
    try {
        const { program_id } = req.query;

        let query = 'SELECT y.*, p.program_name FROM year y LEFT JOIN program p ON y.program_id = p.program_id WHERE y.institute_id = ?';
        const params = [req.user.institute_id];

        if (program_id) {
            query += ' AND y.program_id = ?';
            params.push(program_id);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createYear = async (req, res) => {
    try {
        const { year_name, program_id } = req.body;
        const [existing] = await db.query('SELECT * FROM year WHERE year_name = ? AND program_id = ? AND institute_id = ?', [year_name, program_id, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Year already exists for this program' });

        await db.query('INSERT INTO year (year_name, program_id, institute_id) VALUES (?, ?, ?)', [year_name, program_id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateYear = async (req, res) => {
    try {
        const { id } = req.params;
        const { year_name, program_id } = req.body;
        await db.query('UPDATE year SET year_name = ?, program_id = ? WHERE year_id = ? AND institute_id = ?', [year_name, program_id, id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteYear = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM year WHERE year_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Semesters
exports.getSemesters = async (req, res) => {
    try {
        const { program_id, year_id, year } = req.query;

        let query = `
            SELECT s.semester_id, s.semester_number, s.year_id, 
                   COALESCE(s.program_id, y.program_id) as program_id,
                   y.year_name, p.program_name 
            FROM semester s 
            LEFT JOIN year y ON s.year_id = y.year_id
            LEFT JOIN program p ON p.program_id = COALESCE(s.program_id, y.program_id)
            WHERE s.institute_id = ?
        `;
        const params = [req.user.institute_id];

        if (program_id) {
            query += ' AND COALESCE(s.program_id, y.program_id) = ?';
            params.push(program_id);
        }

        const targetYear = year_id || year;
        if (targetYear) {
            query += ' AND s.year_id = ?';
            params.push(targetYear);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSemester = async (req, res) => {
    try {
        const { semester_number, year_id, program_id } = req.body;
        const [existing] = await db.query('SELECT * FROM semester WHERE semester_number = ? AND program_id = ? AND institute_id = ?', [semester_number, program_id, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Semester already exists for this program' });

        await db.query('INSERT INTO semester (semester_number, year_id, program_id, institute_id) VALUES (?, ?, ?, ?)', [semester_number, year_id, program_id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const { semester_number, year_id, program_id } = req.body;
        await db.query('UPDATE semester SET semester_number = ?, year_id = ?, program_id = ? WHERE semester_id = ? AND institute_id = ?', [semester_number, year_id, program_id, id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteSemester = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM semester WHERE semester_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Branches
exports.getBranches = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT b.*, p.program_name FROM branch b LEFT JOIN program p ON b.program_id = p.program_id WHERE b.institute_id = ?', [req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createBranch = async (req, res) => {
    try {
        const { branch_name, program_id } = req.body;
        const [existing] = await db.query('SELECT * FROM branch WHERE branch_name = ? AND program_id = ? AND institute_id = ?', [branch_name, program_id, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Branch already exists for this program' });

        await db.query('INSERT INTO branch (branch_name, program_id, institute_id) VALUES (?, ?, ?)', [branch_name, program_id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_name, program_id } = req.body;
        await db.query('UPDATE branch SET branch_name = ?, program_id = ? WHERE branch_id = ? AND institute_id = ?', [branch_name, program_id, id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM branch WHERE branch_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Class and Section Management

// Sections
exports.getSections = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, b.program_id, b.branch_name, sem.semester_number, p.program_name
            FROM section s 
            LEFT JOIN branch b ON s.branch_id = b.branch_id
            LEFT JOIN semester sem ON s.semester_id = sem.semester_id
            LEFT JOIN program p ON b.program_id = p.program_id
            WHERE s.institute_id = ?
        `, [req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSection = async (req, res) => {
    try {
        const { section_name, branch_id, semester_id } = req.body;
        const [existing] = await db.query('SELECT * FROM section WHERE section_name = ? AND branch_id = ? AND semester_id = ? AND institute_id = ?', [section_name, branch_id, semester_id, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Section already exists for this branch and semester' });

        await db.query('INSERT INTO section (section_name, branch_id, semester_id, institute_id) VALUES (?, ?, ?, ?)', [section_name, branch_id, semester_id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { section_name, branch_id, semester_id } = req.body;
        console.log(`[UPDATE] Section ID: ${id}`, { section_name, branch_id, semester_id });
        await db.query('UPDATE section SET section_name = ?, branch_id = ?, semester_id = ? WHERE section_id = ? AND institute_id = ?', [section_name, branch_id, semester_id, id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Update Section Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DELETE] Section ID: ${id}`);
        const [result] = await db.query('DELETE FROM section WHERE section_id = ? AND institute_id = ?', [id, req.user.institute_id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found' });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Section Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Subsections
exports.getSubsections = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sub.*, s.branch_id, s.semester_id, b.program_id, s.section_name, b.branch_name, sem.semester_number, p.program_name
            FROM subsection sub 
            LEFT JOIN section s ON sub.section_id = s.section_id
            LEFT JOIN branch b ON s.branch_id = b.branch_id
            LEFT JOIN semester sem ON s.semester_id = sem.semester_id
            LEFT JOIN program p ON b.program_id = p.program_id
            WHERE sub.institute_id = ?
        `, [req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSubsection = async (req, res) => {
    try {
        const { subsection_name, section_id, subsection_capacity } = req.body;

        const [existing] = await db.query(
            'SELECT * FROM subsection WHERE subsection_name = ? AND section_id = ? AND institute_id = ?',
            [subsection_name, section_id, req.user.institute_id]
        );

        if (existing.length > 0)
            return res.status(400).json({ error: 'Subsection already exists for this section' });

        await db.query(
            `INSERT INTO subsection (subsection_name, section_id, subsection_capacity, institute_id)
             VALUES (?, ?, ?, ?)`,
            [subsection_name, section_id, subsection_capacity, req.user.institute_id]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSubsection = async (req, res) => {
    try {
        const { id } = req.params;
        const { subsection_name, section_id, subsection_capacity } = req.body;
        console.log(`[UPDATE] Subsection ID: ${id}`, { subsection_name, section_id });
        await db.query('UPDATE subsection SET subsection_name = ?, section_id = ?, subsection_capacity = ? WHERE subsection_id = ? AND institute_id = ?', [subsection_name, section_id, subsection_capacity, id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Update Subsection Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSubsection = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DELETE] Subsection ID: ${id}`);
        const [result] = await db.query('DELETE FROM subsection WHERE subsection_id = ? AND institute_id = ?', [id, req.user.institute_id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Subsection not found' });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Subsection Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Resource Management (Faculty & Rooms)

// Faculty
exports.getFaculty = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM faculty WHERE institute_id = ?', [req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createFaculty = async (req, res) => {
    try {
        const { faculty_id, faculty_name, faculty_short, email } = req.body;

        const [existing] = await db.query('SELECT * FROM faculty WHERE (faculty_id = ? OR email = ?) AND institute_id = ?', [faculty_id, email, req.user.institute_id]);
        if (existing.length > 0) {
            if (existing[0].faculty_id === faculty_id) return res.status(400).json({ error: 'Faculty ID already exists' });
            if (existing[0].email === email) return res.status(400).json({ error: 'Email already exists' });
        }

        // Insert into faculty table
        await db.query(
            "INSERT INTO faculty (faculty_id, faculty_name, faculty_short, email, institute_id) VALUES (?, ?, ?, ?, ?)",
            [faculty_id, faculty_name, faculty_short, email, req.user.institute_id]
        );

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { faculty_name, faculty_short, email } = req.body;

        // Update faculty table
        await db.query('UPDATE faculty SET faculty_name = ?, faculty_short = ?, email = ? WHERE faculty_id = ? AND institute_id = ?', [faculty_name, faculty_short, email, id, req.user.institute_id]);

        await db.query('UPDATE users SET email = ? WHERE username = ? AND role = ? AND institute_id = ?', [email, id, 'faculty', req.user.institute_id]);

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete from faculty table
        await db.query('DELETE FROM faculty WHERE faculty_id = ? AND institute_id = ?', [id, req.user.institute_id]);

        // Delete from users table
        await db.query('DELETE FROM users WHERE username = ? AND role = ? AND institute_id = ?', [id, 'faculty', req.user.institute_id]);

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Rooms
exports.getRooms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rooms WHERE institute_id = ?', [req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRoom = async (req, res) => {
    try {
        const { room_name, capacity, room_type } = req.body;

        const [existing] = await db.query('SELECT * FROM rooms WHERE room_name = ? AND institute_id = ?', [room_name, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Room Name already exists' });

        await db.query('INSERT INTO rooms (room_name, capacity, room_type, institute_id) VALUES (?, ?, ?, ?)', [room_name, capacity, room_type, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_name, capacity, room_type } = req.body;
        await db.query('UPDATE rooms SET room_name = ?, capacity = ?, room_type = ? WHERE room_id = ? AND institute_id = ?', [room_name, capacity, room_type, id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM rooms WHERE room_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Course and Curriculum Management

exports.getCourses = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*, 
                p.program_name,
                (SELECT COUNT(*) FROM course_components cc WHERE cc.course_id = c.course_id AND cc.component_type = 'THEORY' AND cc.institute_id = ?) as theory_hours,
                (SELECT COUNT(*) FROM course_components cc WHERE cc.course_id = c.course_id AND cc.component_type = 'LAB' AND cc.institute_id = ?) as lab_hours,
                (SELECT COUNT(*) FROM course_components cc WHERE cc.course_id = c.course_id AND cc.component_type = 'TUTORIAL' AND cc.institute_id = ?) as tutorial_hours
            FROM courses c
            LEFT JOIN program p ON c.program_id = p.program_id
            WHERE c.institute_id = ?
            ORDER BY p.program_name, c.semester_number, c.course_code
        `;
        const [rows] = await db.query(query, [req.user.institute_id, req.user.institute_id, req.user.institute_id, req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCourse = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const {
            course_code, course_name, branch_id, program_id,
            semester_number, is_open_elective, open_elective_number,
            lab_group_type, semester_id,
            components
        } = req.body;

        // Check if course already exists IN THIS PROGRAM
        const [existing] = await connection.query(
            'SELECT * FROM courses WHERE course_code = ? AND program_id = ? AND institute_id = ?',
            [course_code, program_id, req.user.institute_id]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Course Code already exists' });
        }

        // Insert Main Course
        const [courseResult] = await connection.query(
            'INSERT INTO courses (course_code, course_name, semester_number, program_id, is_open_elective, open_elective_number, semester_id, institute_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [course_code, course_name, semester_number, program_id, is_open_elective || 0, open_elective_number || null, semester_id, req.user.institute_id]
        );

        if (branch_id) {
            const [secs] = await connection.query(
                'SELECT section_id FROM section WHERE branch_id = ? AND institute_id = ?',
                [branch_id, req.user.institute_id]
            );
            for (const sec of secs) {
                await connection.query(
                    'INSERT INTO course_section (course_code, section_id, course_id, institute_id) VALUES (?, ?, ?, ?)',
                    [course_code, sec.section_id, courseResult.insertId, req.user.institute_id]
                );
            }
        }

        if (components) {
            const typeGroupMap = {
                THEORY: 'COMBINED',
                TUTORIAL: 'COMBINED',
                LAB: lab_group_type || 'COMBINED'
            };

            for (const type of ['THEORY', 'LAB', 'TUTORIAL']) {
                const count = components[type] || 0;
                const groupType = typeGroupMap[type];

                for (let i = 0; i < count; i++) {
                    await connection.query(
                        'INSERT INTO course_components (course_code, component_type, course_id, lab_group_type, institute_id) VALUES (?, ?, ?, ?, ?)',
                        [course_code, type, courseResult.insertId, groupType, req.user.institute_id]
                    );
                }
            }
        }

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

exports.updateCourse = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { course_code, course_name, program_id, semester_number, semester_id, is_open_elective, open_elective_number, lab_group_type, components } = req.body;

        await connection.query(
            'UPDATE courses SET course_code = ?, course_name = ?, program_id = ?, semester_number = ?, semester_id = ?, is_open_elective = ?, open_elective_number = ? WHERE course_id = ? AND institute_id = ?',
            [course_code, course_name, program_id, semester_number, semester_id, is_open_elective || 0, open_elective_number || null, id, req.user.institute_id]
        );

        if (components) {
            const types = ['THEORY', 'LAB', 'TUTORIAL'];
            const typeGroupMap = { THEORY: 'COMBINED', TUTORIAL: 'COMBINED', LAB: lab_group_type || 'COMBINED' };

            for (const type of types) {
                const targetCount = components[type] || 0;
                const [existing] = await connection.query('SELECT component_id FROM course_components WHERE course_id = ? AND component_type = ? AND institute_id = ?', [id, type, req.user.institute_id]);
                const currentCount = existing.length;

                if (targetCount > currentCount) {
                    for (let i = 0; i < (targetCount - currentCount); i++) {
                        await connection.query('INSERT INTO course_components (course_code, component_type, course_id, lab_group_type, institute_id) VALUES (?, ?, ?, ?, ?)', [course_code, type, id, typeGroupMap[type], req.user.institute_id]);
                    }
                } else if (targetCount < currentCount) {
                    const toDelete = existing.slice(0, currentCount - targetCount).map(e => e.component_id);
                    await connection.query('DELETE FROM course_components WHERE component_id IN (?) AND institute_id = ?', [toDelete, req.user.institute_id]);
                }

                await connection.query('UPDATE course_components SET course_code = ?, lab_group_type = ? WHERE course_id = ? AND component_type = ? AND institute_id = ?', [course_code, typeGroupMap[type], id, type, req.user.institute_id]);
            }
        }

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

exports.deleteCourse = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        await connection.query('DELETE FROM course_components WHERE course_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        await connection.query('DELETE FROM course_section WHERE course_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        await connection.query('DELETE FROM faculty_allocation WHERE course_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        await connection.query('DELETE FROM courses WHERE course_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// Assign Faculty to Course 
exports.assignFaculty = async (req, res) => {
    try {
        const { faculty_id, course_id, branch_id, section_id } = req.body;

        if (!faculty_id || !course_id || !branch_id || !section_id) {
            return res.status(400).json({ error: 'Missing required fields: faculty, course, branch, and section' });
        }

        const [existing] = await db.query(
            'SELECT * FROM faculty_allocation WHERE faculty_id = ? AND course_id = ? AND branch_id = ? AND section_id = ? AND institute_id = ?',
            [faculty_id, course_id, branch_id, section_id, req.user.institute_id]
        );
        if (existing.length > 0) return res.status(400).json({ error: 'This assignment already exists' });

        await db.query(
            'INSERT INTO faculty_allocation (faculty_id, course_id, branch_id, section_id, institute_id) VALUES (?, ?, ?, ?, ?)',
            [faculty_id, course_id, branch_id, section_id, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateFacultyAllocation = async (req, res) => {
    try {
        const { old_faculty_id, old_course_id, old_branch_id, old_section_id, faculty_id, course_id, branch_id, section_id } = req.body;

        console.log('[UPDATE] Faculty Allocation:', { old_faculty_id, faculty_id });

        await db.query(
            `UPDATE faculty_allocation 
             SET faculty_id = ?, course_id = ?, branch_id = ?, section_id = ? 
             WHERE faculty_id = ? AND course_id = ? AND branch_id = ? AND section_id = ? AND institute_id = ?`,
            [faculty_id, course_id, branch_id, section_id, old_faculty_id, old_course_id, old_branch_id, old_section_id, req.user.institute_id]
        );

        if (old_faculty_id && old_faculty_id !== faculty_id) {
            const targetCourseId = course_id || old_course_id;
            const targetSecId = section_id || old_section_id;

            await db.query(
                `UPDATE master_timetable 
                 SET faculty_id = ? 
                 WHERE faculty_id = ? AND (course_id = ? OR course_code = (SELECT course_code FROM courses WHERE course_id = ? LIMIT 1)) AND section_id = ? AND institute_id = ?`,
                [faculty_id, old_faculty_id, targetCourseId, targetCourseId, targetSecId, req.user.institute_id]
            );
            await db.query(
                `UPDATE master_timetable_draft 
                 SET faculty_id = ? 
                 WHERE faculty_id = ? AND (course_id = ? OR course_code = (SELECT course_code FROM courses WHERE course_id = ? LIMIT 1)) AND section_id = ? AND institute_id = ?`,
                [faculty_id, old_faculty_id, targetCourseId, targetCourseId, targetSecId, req.user.institute_id]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Update Faculty Allocation Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFacultyAllocation = async (req, res) => {
    try {
        const { faculty_id, course_id, branch_id, section_id } = req.query;
        console.log('[DELETE] Faculty Allocation:', { faculty_id, course_id, branch_id, section_id });

        if (!faculty_id || !course_id) return res.status(400).json({ error: 'Missing identifying fields for deletion' });

        const [result] = await db.query(
            'DELETE FROM faculty_allocation WHERE faculty_id = ? AND course_id = ? AND branch_id = ? AND section_id = ? AND institute_id = ?',
            [faculty_id, course_id, branch_id, section_id, req.user.institute_id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Allocation not found or already deleted' });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Faculty Allocation Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Update Course Components 
exports.updateCourseComponents = async (req, res) => {
    const { course_code, components } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [[courseRow]] = await connection.query(
            'SELECT course_id FROM courses WHERE course_code = ? AND institute_id = ? LIMIT 1',
            [course_code, req.user.institute_id]
        );
        const course_id = courseRow?.course_id || null;

        // 1. Clear existing components
        await connection.query('DELETE FROM course_components WHERE course_code = ? AND institute_id = ?', [course_code, req.user.institute_id]);

        // 2. Insert new components
        const types = ['THEORY', 'LAB', 'TUTORIAL'];
        for (const type of types) {
            const count = components[type] || 0;
            for (let i = 0; i < count; i++) {
                await connection.query(
                    'INSERT INTO course_components (course_code, component_type, course_id, institute_id) VALUES (?, ?, ?, ?)',
                    [course_code, type, course_id, req.user.institute_id]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Components updated successfully' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

exports.getBranchCourses = async (req, res) => {
    try {
        const query = `
            SELECT cs.*, s.branch_id, s.semester_id, c.course_name, s.section_name, b.branch_name, p.program_name, p.program_id as target_program_id
            FROM course_section cs
            JOIN courses c ON cs.course_id = c.course_id AND c.institute_id = cs.institute_id
            JOIN section s ON cs.section_id = s.section_id AND s.institute_id = cs.institute_id
            JOIN branch b ON s.branch_id = b.branch_id AND b.institute_id = cs.institute_id
            JOIN program p ON b.program_id = p.program_id AND p.institute_id = cs.institute_id
            WHERE cs.institute_id = ?
        `;
        const [rows] = await db.query(query, [req.user.institute_id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.assignCourseBranch = async (req, res) => {
    try {
        const { section_id, course_code, course_capacity, section_lab_group_type, section_is_open_elective, section_open_elective_number } = req.body;
        const [existing] = await db.query('SELECT * FROM course_section WHERE section_id = ? AND course_code = ? AND institute_id = ?', [section_id, course_code, req.user.institute_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Course already assigned to this section' });

        const [[secRow]] = await db.query(`
            SELECT s.branch_id, b.program_id 
            FROM section s 
            JOIN branch b ON s.branch_id = b.branch_id AND b.institute_id = s.institute_id
            WHERE s.section_id = ? AND s.institute_id = ?`, [section_id, req.user.institute_id]);
        const program_id = secRow?.program_id || null;

        const [courseRows] = await db.query(
            'SELECT course_id FROM courses WHERE course_code = ? AND program_id = ? AND institute_id = ? LIMIT 1',
            [course_code, program_id, req.user.institute_id]
        );

        let course_id = courseRows.length > 0 ? courseRows[0].course_id : null;
        if (!course_id) {
            const [fallback] = await db.query('SELECT course_id FROM courses WHERE course_code = ? AND institute_id = ? LIMIT 1', [course_code, req.user.institute_id]);
            course_id = fallback.length > 0 ? fallback[0].course_id : null;
        }

        await db.query(
            'INSERT INTO course_section (section_id, course_code, course_capacity, course_id, section_lab_group_type, section_is_open_elective, section_open_elective_number, institute_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [section_id, course_code, course_capacity || null, course_id, section_lab_group_type || 'COMBINED', section_is_open_elective !== undefined ? section_is_open_elective : null, section_open_elective_number || null, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateCourseBranch = async (req, res) => {
    try {
        const { old_section_id, old_course_code, section_id, course_code, course_capacity, course_id, section_lab_group_type, section_is_open_elective, section_open_elective_number } = req.body;

        console.log(`[UPDATE] Course Section:`, { old_section_id, old_course_code });

        await db.query(
            'UPDATE course_section SET section_id = ?, course_code = ?, course_capacity = ?, course_id = ?, section_lab_group_type = ?, section_is_open_elective = ?, section_open_elective_number = ? WHERE section_id = ? AND course_code = ? AND institute_id = ?',
            [section_id, course_code, course_capacity, course_id, section_lab_group_type || 'COMBINED', section_is_open_elective !== undefined ? section_is_open_elective : null, section_open_elective_number || null, old_section_id, old_course_code, req.user.institute_id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Update Course Section Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCourseBranch = async (req, res) => {
    try {
        const { section_id, course_code } = req.query;
        console.log(`[DELETE] Course Section:`, { section_id, course_code });

        if (!section_id || !course_code) return res.status(400).json({ error: 'Missing identifying fields' });

        const [result] = await db.query('DELETE FROM course_section WHERE section_id = ? AND course_code = ? AND institute_id = ?', [section_id, course_code, req.user.institute_id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Course Branch link not found' });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Course Branch Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getFacultyCourses = async (req, res) => {
    try {
        const query = `
            SELECT 
                fa.*, 
                f.faculty_name, f.faculty_short,
                c.course_name, c.course_code,
                b.branch_name,
                s.section_name,
                p.program_name, p.program_id as target_program_id,
                sem.semester_id as target_semester_id, sem.semester_number
            FROM faculty_allocation fa
            JOIN faculty f ON fa.faculty_id = f.faculty_id AND f.institute_id = fa.institute_id
            JOIN courses c ON fa.course_id = c.course_id AND c.institute_id = fa.institute_id
            JOIN branch b ON fa.branch_id = b.branch_id AND b.institute_id = fa.institute_id
            JOIN section s ON fa.section_id = s.section_id AND s.institute_id = fa.institute_id
            JOIN program p ON b.program_id = p.program_id AND p.institute_id = fa.institute_id
            JOIN semester sem ON s.semester_id = sem.semester_id AND sem.institute_id = fa.institute_id
            WHERE fa.institute_id = ?
            ORDER BY p.program_name, b.branch_name, s.section_name
        `;

        const [rows] = await db.query(query, [req.user.institute_id]);
        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Course Components
exports.getCourseComponents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM course_components WHERE institute_id = ?', [req.user.institute_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Time Slots
exports.getTimeSlots = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM time_slots WHERE institute_id = ? ORDER BY slot_order',
            [req.user.institute_id]
        );
        res.json(rows);
    } catch (err) {
        console.error("getTimeSlots error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.createTimeSlot = async (req, res) => {
    try {
        const { day, start_time, end_time, slot_order, is_break } = req.body;
        if (!day || !start_time || !end_time || slot_order === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check for duplicates (day, start_time, end_time, institute_id)
        const [existingTime] = await db.query(
            'SELECT * FROM time_slots WHERE day = ? AND start_time = ? AND end_time = ? AND institute_id = ?',
            [day, start_time, end_time, req.user.institute_id]
        );
        if (existingTime.length > 0) {
            return res.status(400).json({ error: 'Timeslot with same day and times already exists' });
        }

        // Check for slot order duplicates (day, slot_order, institute_id)
        const [existingOrder] = await db.query(
            'SELECT * FROM time_slots WHERE day = ? AND slot_order = ? AND institute_id = ?',
            [day, slot_order, req.user.institute_id]
        );
        if (existingOrder.length > 0) {
            return res.status(400).json({ error: 'Timeslot with same day and slot order already exists' });
        }

        await db.query(
            'INSERT INTO time_slots (day, start_time, end_time, slot_order, is_break, institute_id) VALUES (?, ?, ?, ?, ?, ?)',
            [day, start_time, end_time, slot_order, is_break ? 1 : 0, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("createTimeSlot error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { day, start_time, end_time, slot_order, is_break } = req.body;
        if (!day || !start_time || !end_time || slot_order === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check for duplicate day + times excluding this timeslot_id
        const [existingTime] = await db.query(
            'SELECT * FROM time_slots WHERE day = ? AND start_time = ? AND end_time = ? AND institute_id = ? AND timeslot_id != ?',
            [day, start_time, end_time, req.user.institute_id, id]
        );
        if (existingTime.length > 0) {
            return res.status(400).json({ error: 'Timeslot with same day and times already exists' });
        }

        // Check for duplicate day + slot_order excluding this timeslot_id
        const [existingOrder] = await db.query(
            'SELECT * FROM time_slots WHERE day = ? AND slot_order = ? AND institute_id = ? AND timeslot_id != ?',
            [day, slot_order, req.user.institute_id, id]
        );
        if (existingOrder.length > 0) {
            return res.status(400).json({ error: 'Timeslot with same day and slot order already exists' });
        }

        await db.query(
            'UPDATE time_slots SET day = ?, start_time = ?, end_time = ?, slot_order = ?, is_break = ? WHERE timeslot_id = ? AND institute_id = ?',
            [day, start_time, end_time, slot_order, is_break ? 1 : 0, id, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("updateTimeSlot error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if timeslot is used in allocations
        const [usedInMaster] = await db.query(
            'SELECT * FROM master_timetable WHERE timeslot_id = ? AND institute_id = ? LIMIT 1',
            [id, req.user.institute_id]
        );
        const [usedInDraft] = await db.query(
            'SELECT * FROM master_timetable_draft WHERE timeslot_id = ? AND institute_id = ? LIMIT 1',
            [id, req.user.institute_id]
        );

        if (usedInMaster.length > 0 || usedInDraft.length > 0) {
            return res.status(400).json({ error: 'Timeslot is currently being used in timetables and cannot be deleted' });
        }

        await db.query(
            'DELETE FROM time_slots WHERE timeslot_id = ? AND institute_id = ?',
            [id, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("deleteTimeSlot error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Users management
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id, username, role, email FROM users WHERE institute_id = ?', [req.user.institute_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, role, email } = req.body;

        if (!password || password.trim() === '') {
            return res.status(400).json({ error: 'Password is required' });
        }

        const [existing] = await db.query('SELECT * FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)', [username, email]);
        if (existing.length > 0) {
            if (existing[0].username === username) return res.status(400).json({ error: 'Username already exists' });
            if (existing[0].email === email) return res.status(400).json({ error: 'Email already exists' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync(password.trim(), 10);

        await db.query(
            'INSERT INTO users (username, password, role, email, institute_id) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, role, email, req.user.institute_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role, email } = req.body;

        if (password && password.trim() !== '') {
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync(password.trim(), 10);
            await db.query(
                'UPDATE users SET username = ?, password = ?, role = ?, email = ? WHERE user_id = ? AND institute_id = ?',
                [username, hashedPassword, role, email, id, req.user.institute_id]
            );
        } else {
            await db.query(
                'UPDATE users SET username = ?, role = ?, email = ? WHERE user_id = ? AND institute_id = ?',
                [username, role, email, id, req.user.institute_id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM users WHERE user_id = ? AND institute_id = ?', [id, req.user.institute_id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lab Room Preferences

exports.getLabRoomPreferences = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT lrp.id, lrp.course_id, lrp.branch_id, lrp.room_id,
                    r.room_name, r.room_type, r.capacity
             FROM lab_room_preference lrp
             JOIN rooms   r ON lrp.room_id   = r.room_id   AND r.institute_id = lrp.institute_id
             WHERE lrp.institute_id = ?`,
            [req.user.institute_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setLabRoomPreference = async (req, res) => {
    try {
        const { course_id, room_id, branch_id } = req.body;
        if (!course_id || !room_id) return res.status(400).json({ error: 'course_id and room_id are required' });

        // Find the course details
        const [[course]] = await db.query(
            'SELECT course_code, is_open_elective, semester_id FROM courses WHERE course_id = ? AND institute_id = ?',
            [course_id, req.user.institute_id]
        );
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Verify the room constraints: check capacity and course capacity
        const [[roomRow]] = await db.query(
            'SELECT capacity, room_name FROM rooms WHERE room_id = ? AND institute_id = ?',
            [room_id, req.user.institute_id]
        );
        if (!roomRow) return res.status(404).json({ error: 'Selected room not found' });

        // Get course capacity from course_section
        const [[capRow]] = await db.query(
            `SELECT MAX(cs.course_capacity) as max_cap 
             FROM course_section cs 
             WHERE cs.course_id = ? AND cs.institute_id = ?`,
            [course_id, req.user.institute_id]
        );
        let reqCap = capRow?.max_cap || 30;

        // Check if the course actually has a LAB component
        const [[compRow]] = await db.query(
            `SELECT lab_group_type FROM course_components 
             WHERE course_id = ? AND component_type = 'LAB' AND institute_id = ? LIMIT 1`,
            [course_id, req.user.institute_id]
        );

        let isSplit = false;
        if (compRow) {
            if (branch_id) {
                const [[cbRow]] = await db.query(
                    `SELECT section_lab_group_type FROM course_section 
                     WHERE course_id = ? AND section_id IN (SELECT section_id FROM section WHERE branch_id = ? AND institute_id = ?) AND institute_id = ? LIMIT 1`,
                    [course_id, branch_id, req.user.institute_id, req.user.institute_id]
                );
                isSplit = cbRow?.section_lab_group_type === 'SPLIT' ||
                    (cbRow?.section_lab_group_type !== 'COMBINED' && compRow.lab_group_type === 'SPLIT');
            } else {
                isSplit = compRow.lab_group_type === 'SPLIT';
            }
        }

        if (isSplit && course.semester_id) {
            // Split lab: check subsection capacity for this semester instead of full course capacity
            const [[subCapRow]] = await db.query(
                `SELECT MAX(sub.subsection_capacity) as max_sub_cap 
                 FROM subsection sub
                 JOIN section sec ON sub.section_id = sec.section_id AND sec.institute_id = sub.institute_id
                 WHERE sec.semester_id = ? AND sub.institute_id = ?`,
                [course.semester_id, req.user.institute_id]
            );
            if (subCapRow && subCapRow.max_sub_cap) {
                reqCap = subCapRow.max_sub_cap;
            }
        }

        if (roomRow.capacity < reqCap) {
            return res.status(400).json({
                error: `Room ${roomRow.room_name} capacity (${roomRow.capacity}) is less than required course capacity (${reqCap})`
            });
        }

        if (course.is_open_elective === 1) {
            const [relatedCourses] = await db.query(
                'SELECT course_id FROM courses WHERE course_code = ? AND is_open_elective = 1 AND institute_id = ?',
                [course.course_code, req.user.institute_id]
            );
            for (const rc of relatedCourses) {
                await db.query(
                    `INSERT INTO lab_room_preference (course_id, branch_id, room_id, institute_id)
                     VALUES (?, NULL, ?, ?)
                     ON DUPLICATE KEY UPDATE room_id = VALUES(room_id)`,
                    [rc.course_id, room_id, req.user.institute_id]
                );
            }
        } else {
            const branchIdVal = branch_id || null;
            await db.query(
                `INSERT INTO lab_room_preference (course_id, branch_id, room_id, institute_id)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE room_id = VALUES(room_id)`,
                [course_id, branchIdVal, room_id, req.user.institute_id]
            );
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteLabRoomPreference = async (req, res) => {
    try {
        const { course_id } = req.params;
        const { branch_id } = req.query;

        // Find the course details
        const [[course]] = await db.query(
            'SELECT course_code, is_open_elective FROM courses WHERE course_id = ? AND institute_id = ?',
            [course_id, req.user.institute_id]
        );
        if (!course) return res.status(404).json({ error: 'Course not found' });

        if (course.is_open_elective === 1) {
            const [relatedCourses] = await db.query(
                'SELECT course_id FROM courses WHERE course_code = ? AND is_open_elective = 1 AND institute_id = ?',
                [course.course_code, req.user.institute_id]
            );
            const ids = relatedCourses.map(rc => rc.course_id);
            if (ids.length > 0) {
                await db.query(
                    'DELETE FROM lab_room_preference WHERE course_id IN (?) AND institute_id = ?',
                    [ids, req.user.institute_id]
                );
            }
        } else {
            const branchIdVal = branch_id || null;
            if (branchIdVal) {
                await db.query(
                    'DELETE FROM lab_room_preference WHERE course_id = ? AND (branch_id = ? OR branch_id IS NULL) AND institute_id = ?',
                    [course_id, branchIdVal, req.user.institute_id]
                );
            } else {
                await db.query(
                    'DELETE FROM lab_room_preference WHERE course_id = ? AND institute_id = ?',
                    [course_id, req.user.institute_id]
                );
            }
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};