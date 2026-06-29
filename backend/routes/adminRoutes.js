const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const timetableController = require('../controllers/timetableController');


// Academic Structure
router.get('/program', adminController.getPrograms);
router.post('/program', adminController.createProgram);
router.put('/program/:id', adminController.updateProgram);
router.delete('/program/:id', adminController.deleteProgram);

router.get('/year', adminController.getYears);
router.post('/year', adminController.createYear);
router.put('/year/:id', adminController.updateYear);
router.delete('/year/:id', adminController.deleteYear);

router.get('/semester', adminController.getSemesters);
router.post('/semester', adminController.createSemester);
router.put('/semester/:id', adminController.updateSemester);
router.delete('/semester/:id', adminController.deleteSemester);

router.get('/branch', adminController.getBranches);
router.post('/branch', adminController.createBranch);
router.put('/branch/:id', adminController.updateBranch);
router.delete('/branch/:id', adminController.deleteBranch);

// Class Management
router.get('/section', adminController.getSections);
router.post('/section', adminController.createSection);
router.put('/section/:id', adminController.updateSection);
router.delete('/section/:id', adminController.deleteSection);

router.get('/subsection', adminController.getSubsections);
router.post('/subsection', adminController.createSubsection);
router.put('/subsection/:id', adminController.updateSubsection);
router.delete('/subsection/:id', adminController.deleteSubsection);

// Resource Management
router.get('/faculty', adminController.getFaculty);
router.post('/faculty', adminController.createFaculty);
router.put('/faculty/:id', adminController.updateFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);

router.get('/room', adminController.getRooms);
router.post('/room', adminController.createRoom);
router.put('/room/:id', adminController.updateRoom);
router.delete('/room/:id', adminController.deleteRoom);

// Course Management
router.get('/course', adminController.getCourses);
router.post('/course', adminController.createCourse);
router.put('/course/:id', adminController.updateCourse);
router.delete('/course/:id', adminController.deleteCourse);

router.get('/course-branch', adminController.getBranchCourses);
router.post('/course-branch', adminController.assignCourseBranch);
router.put('/course-branch', adminController.updateCourseBranch);
router.delete('/course-branch', adminController.deleteCourseBranch);

router.get('/faculty-course', adminController.getFacultyCourses);
router.post('/faculty-course', adminController.assignFaculty);
router.put('/faculty-course', adminController.updateFacultyAllocation);
router.delete('/faculty-course', adminController.deleteFacultyAllocation);

router.get('/timeslot', adminController.getTimeSlots);
router.post('/timeslot', adminController.createTimeSlot);
router.put('/timeslot/:id', adminController.updateTimeSlot);
router.delete('/timeslot/:id', adminController.deleteTimeSlot);
router.get('/course-component', adminController.getCourseComponents);

// MASTER TIMETABLE
router.post('/master-timetable/session/start', timetableController.startEditSession);
router.post('/master-timetable/session/save', timetableController.saveEditSession);
router.post('/master-timetable/session/cancel', timetableController.cancelEditSession);
router.post('/generate-master', timetableController.generateMasterTimetable);
router.get('/master-timetable', timetableController.getMasterTimetable);
router.post('/master-timetable/manual', timetableController.addManualEntry);
router.put('/master-timetable/:id', timetableController.updateMasterEntry);
router.delete('/master-timetable/:id', timetableController.deleteMasterEntry);
router.delete('/clear-master', timetableController.clearMasterTimetable);

// User Management
router.get('/user', adminController.getUsers);
router.post('/user', adminController.createUser);
router.put('/user/:id', adminController.updateUser);
router.delete('/user/:id', adminController.deleteUser);

// Lab Room Preferences
router.get('/lab-room-pref', adminController.getLabRoomPreferences);
router.post('/lab-room-pref', adminController.setLabRoomPreference);
router.delete('/lab-room-pref/:course_id', adminController.deleteLabRoomPreference);

module.exports = router;
