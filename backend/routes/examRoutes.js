const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// Timeslots
router.get('/timeslots', examController.getExamTimeslots);
router.post('/timeslots', examController.createExamTimeslot);
router.put('/timeslots/:id', examController.updateExamTimeslot);
router.delete('/timeslots/:id', examController.deleteExamTimeslot);

// Backlog Courses
router.get('/backlog-courses', examController.getBacklogCourses);
router.post('/backlog-courses', examController.createBacklogCourse);
router.delete('/backlog-courses/:id', examController.deleteBacklogCourse);

// Slot Preferences
router.get('/slot-preferences', examController.getExamSlotPreferences);
router.post('/slot-preferences', examController.saveExamSlotPreference);

// Exam Timetable Generation & Retrieval
router.post('/generate', examController.generateExamTimetable);
router.get('/timetable', examController.getExamTimetable);

// Draft & Edit Session Management
router.post('/session/start', examController.startExamEditSession);
router.post('/session/save', examController.saveExamEditSession);
router.post('/session/cancel', examController.cancelExamEditSession);
router.delete('/entry/:id', examController.deleteExamEntry);
router.post('/entry', examController.addExamEntry);
router.get('/available-courses', examController.getAvailableCourses);
router.delete('/clear-all', examController.clearExamTimetable);

module.exports = router;