const db = require('../config/db');


//Validation

const checkValidationRules = async (connection, { timetable_id, section_id, subsection_id, faculty_id, room_id, timeslot_id, component_type }) => {

    const excludeCondition = timetable_id ? ' AND t.timetable_id != ?' : '';
    const params = timetable_id ? [timetable_id] : [];

    const [slotRows] = await connection.query(
        'SELECT day,start_time FROM time_slots WHERE timeslot_id=?',
        [timeslot_id]
    );

    if (!slotRows.length) return { valid: false, error: 'Invalid timeslot' };

    const { day, start_time } = slotRows[0];

    const [facultyClash] = await connection.query(
        `SELECT t.* FROM timetable t
         JOIN time_slots ts ON t.timeslot_id = ts.timeslot_id
         WHERE t.faculty_id=? AND ts.day=? AND ts.start_time=?${excludeCondition}`,
        [faculty_id, day, start_time, ...params]
    );

    if (facultyClash.length)
        return { valid: false, error: 'Faculty clash detected' };

    const [roomClash] = await connection.query(
        `SELECT t.* FROM timetable t
         JOIN time_slots ts ON t.timeslot_id = ts.timeslot_id
         WHERE t.room_id=? AND ts.day=? AND ts.start_time=?${excludeCondition}`,
        [room_id, day, start_time, ...params]
    );

    if (roomClash.length)
        return { valid: false, error: 'Room clash detected' };

    const [sectionClash] = await connection.query(
        `SELECT * FROM timetable WHERE section_id=? AND timeslot_id=?${excludeCondition}`,
        [section_id, timeslot_id, ...params]
    );

    if (sectionClash.length)
        return { valid: false, error: 'Section already busy' };

    return { valid: true };
};



//Add Entry

exports.addTimetableEntry = async (req, res) => {

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        const { section_id, subsection_id, course_code, faculty_id, room_id, timeslot_id, component_type } = req.body;

        const validation = await checkValidationRules(connection, {
            section_id, subsection_id, course_code, faculty_id, room_id, timeslot_id, component_type
        });

        if (!validation.valid) {
            await connection.rollback();
            return res.status(400).json({ error: validation.error });
        }

        const [result] = await connection.query(
            `INSERT INTO timetable
            (section_id,subsection_id,course_code,faculty_id,room_id,timeslot_id,component_type)
            VALUES (?,?,?,?,?,?,?)`,
            [section_id, subsection_id || null, course_code, faculty_id, room_id, timeslot_id, component_type]
        );

        await connection.commit();

        res.json({ success: true, timetable_id: result.insertId });

    } catch (err) {

        await connection.rollback();
        res.status(500).json({ error: err.message });

    } finally {

        connection.release();

    }
};
