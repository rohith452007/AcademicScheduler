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
