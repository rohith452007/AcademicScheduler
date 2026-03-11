const db = require('../config/db');

// Academic Structure

// Programs
exports.getPrograms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM program');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProgram = async (req, res) => {
    try {
        const { program_name } = req.body;
        const [existing] = await db.query('SELECT * FROM program WHERE program_name = ?', [program_name]);
        if (existing.length > 0) return res.status(400).json({ error: 'Program already exists' });

        await db.query('INSERT INTO program (program_name) VALUES (?)', [program_name]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};



// Years
exports.getYears = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT y.*, p.program_name FROM year y LEFT JOIN program p ON y.program_id = p.program_id');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createYear = async (req, res) => {
    try {
        const { year_name, program_id } = req.body;
        const [existing] = await db.query('SELECT * FROM year WHERE year_name = ? AND program_id = ?', [year_name, program_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Year already exists for this program' });

        await db.query('INSERT INTO year (year_name, program_id) VALUES (?, ?)', [year_name, program_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};



// Semesters
exports.getSemesters = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.semester_id, s.semester_number, s.year_id, 
                   COALESCE(s.program_id, y.program_id) as program_id,
                   y.year_name, p.program_name 
            FROM semester s 
            LEFT JOIN year y ON s.year_id = y.year_id
            LEFT JOIN program p ON p.program_id = COALESCE(s.program_id, y.program_id)
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSemester = async (req, res) => {
    try {
        const { semester_number, year_id, program_id } = req.body;
        const [existing] = await db.query('SELECT * FROM semester WHERE semester_number = ? AND program_id = ?', [semester_number, program_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Semester already exists for this program' });

        await db.query('INSERT INTO semester (semester_number, year_id, program_id) VALUES (?, ?, ?)', [semester_number, year_id, program_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Branches
exports.getBranches = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT b.*, p.program_name FROM branch b LEFT JOIN program p ON b.program_id = p.program_id');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createBranch = async (req, res) => {
    try {
        const { branch_name, program_id } = req.body;
        const [existing] = await db.query('SELECT * FROM branch WHERE branch_name = ? AND program_id = ?', [branch_name, program_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Branch already exists for this program' });

        await db.query('INSERT INTO branch (branch_name, program_id) VALUES (?, ?)', [branch_name, program_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Class Management

// Sections
exports.getSections = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, b.branch_name, sem.semester_number, p.program_name
            FROM section s 
            LEFT JOIN branch b ON s.branch_id = b.branch_id
            LEFT JOIN semester sem ON s.semester_id = sem.semester_id
            LEFT JOIN program p ON b.program_id = p.program_id
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSection = async (req, res) => {
    try {
        const { section_name, branch_id, semester_id } = req.body;
        const [existing] = await db.query('SELECT * FROM section WHERE section_name = ? AND branch_id = ? AND semester_id = ?', [section_name, branch_id, semester_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Section already exists for this branch and semester' });

        await db.query('INSERT INTO section (section_name, branch_id, semester_id) VALUES (?, ?, ?)', [section_name, branch_id, semester_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Subsections
exports.getSubsections = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sub.*, s.section_name, b.branch_name, sem.semester_number, p.program_name
            FROM subsection sub 
            LEFT JOIN section s ON sub.section_id = s.section_id
            LEFT JOIN branch b ON s.branch_id = b.branch_id
            LEFT JOIN semester sem ON s.semester_id = sem.semester_id
            LEFT JOIN program p ON b.program_id = p.program_id
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSubsection = async (req, res) => {
    try {
        const { subsection_name, section_id } = req.body;
        const [existing] = await db.query('SELECT * FROM subsection WHERE subsection_name = ? AND section_id = ?', [subsection_name, section_id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Subsection already exists for this section' });

        await db.query('INSERT INTO subsection (subsection_name, section_id) VALUES (?, ?)', [subsection_name, section_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Resource Management

// Faculty
exports.getFaculty = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM faculty');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createFaculty = async (req, res) => {
    try {
        const { faculty_id, faculty_name, faculty_short, email, max_hours_per_week } = req.body;

        const [existing] = await db.query('SELECT * FROM faculty WHERE faculty_id = ? OR email = ?', [faculty_id, email]);
        if (existing.length > 0) {
            if (existing[0].faculty_id === faculty_id) return res.status(400).json({ error: 'Faculty ID already exists' });
            if (existing[0].email === email) return res.status(400).json({ error: 'Email already exists' });
        }


        let maxHours = 16;
        if (max_hours_per_week !== undefined && max_hours_per_week !== '' && max_hours_per_week !== null) {
            maxHours = parseInt(max_hours_per_week, 10);
            if (isNaN(maxHours)) maxHours = 16;
        }

        await db.query(
            "INSERT INTO faculty (faculty_id, faculty_name, faculty_short, email, max_hours_per_week) VALUES (?, ?, ?, ?, ?)",
            [faculty_id, faculty_name, faculty_short, email, maxHours]
        );

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Rooms
exports.getRooms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rooms');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRoom = async (req, res) => {
    try {
        const { room_name, capacity, room_type } = req.body;

        const [existing] = await db.query('SELECT * FROM rooms WHERE room_name = ?', [room_name]);
        if (existing.length > 0) return res.status(400).json({ error: 'Room Name already exists' });

        await db.query('INSERT INTO rooms (room_name, capacity, room_type) VALUES (?, ?, ?)', [room_name, capacity, room_type]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Course Management

exports.getCourses = async (req, res) => {
    try {
        // Fetch courses with their component counts
        const query = `
            SELECT c.*, 
            (SELECT COUNT(*) FROM course_components cc WHERE cc.course_code = c.course_code AND cc.component_type = 'THEORY') as theory_hours,
            (SELECT COUNT(*) FROM course_components cc WHERE cc.course_code = c.course_code AND cc.component_type = 'LAB') as lab_hours,
            (SELECT COUNT(*) FROM course_components cc WHERE cc.course_code = c.course_code AND cc.component_type = 'TUTORIAL') as tutorial_hours
            FROM courses c
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCourse = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { course_code, course_name, semester_number, is_open_elective, components } = req.body;

        const [existing] = await connection.query('SELECT * FROM courses WHERE course_code = ?', [course_code]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Course Code already exists' });
        }

        // Insert Course
        await connection.query('INSERT INTO courses (course_code, course_name, semester_number, is_open_elective) VALUES (?, ?, ?, ?)',
            [course_code, course_name, semester_number, is_open_elective || 0]);

        // Insert Course Branch
        if (branch_id) {
            await connection.query('INSERT INTO course_branch (course_code, branch_id) VALUES (?, ?)', [course_code, branch_id]);
        }

        // Insert Components
        if (components) {
            const types = ['THEORY', 'LAB', 'TUTORIAL'];
            for (const type of types) {
                const count = components[type] || 0;
                for (let i = 0; i < count; i++) {
                    await connection.query('INSERT INTO course_components (course_code, component_type) VALUES (?, ?)', [course_code, type]);
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

// Assign Faculty to Course
exports.assignFaculty = async (req, res) => {
    try {
        const { faculty_id, course_code } = req.body;

        const [existing] = await db.query('SELECT * FROM faculty_course WHERE faculty_id = ? AND course_code = ?', [faculty_id, course_code]);
        if (existing.length > 0) return res.status(400).json({ error: 'Faculty is already assigned to this course' });

        await db.query('INSERT INTO faculty_course (faculty_id, course_code) VALUES (?, ?)', [faculty_id, course_code]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

///// TO BE IMPLEMENTED IN FRONTEND
// Update Course Components 
exports.updateCourseComponents = async (req, res) => {
    const { course_code, components } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Clear existing components
        await connection.query('DELETE FROM course_components WHERE course_code = ?', [course_code]);

        // Insert new components
        const types = ['THEORY', 'LAB', 'TUTORIAL'];
        for (const type of types) {
            const count = components[type] || 0;
            for (let i = 0; i < count; i++) {
                await connection.query('INSERT INTO course_components (course_code, component_type) VALUES (?, ?)', [course_code, type]);
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
            SELECT cb.*, c.course_name, b.branch_name, p.program_name 
            FROM course_branch cb
            JOIN courses c ON cb.course_code = c.course_code
            JOIN branch b ON cb.branch_id = b.branch_id
            JOIN program p ON b.program_id = p.program_id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.assignCourseBranch = async (req, res) => {
    try {
        const { branch_id, course_code } = req.body;
        const [existing] = await db.query('SELECT * FROM course_branch WHERE branch_id = ? AND course_code = ?', [branch_id, course_code]);
        if (existing.length > 0) return res.status(400).json({ error: 'Course already assigned to this branch' });

        await db.query('INSERT INTO course_branch (branch_id, course_code) VALUES (?, ?)', [branch_id, course_code]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getFacultyCourses = async (req, res) => {
    try {
        const query = `
            SELECT fc.*, f.faculty_name, c.course_name 
            FROM faculty_course fc
            JOIN faculty f ON fc.faculty_id = f.faculty_id
            JOIN courses c ON fc.course_code = c.course_code
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
