const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Academic Structure
router.get('/program', adminController.getPrograms);
router.post('/program', adminController.createProgram);

router.get('/year', adminController.getYears);
router.post('/year', adminController.createYear);

router.get('/semester', adminController.getSemesters);
router.post('/semester', adminController.createSemester);

router.get('/branch', adminController.getBranches);
router.post('/branch', adminController.createBranch);

// Class Management
router.get('/section', adminController.getSections);
router.post('/section', adminController.createSection);

router.get('/subsection', adminController.getSubsections);
router.post('/subsection', adminController.createSubsection);

// Resource Management
router.get('/faculty', adminController.getFaculty);
router.post('/faculty', adminController.createFaculty);

router.get('/room', adminController.getRooms);
router.post('/room', adminController.createRoom);

// Course Management
router.get('/course', adminController.getCourses);
router.post('/course', adminController.createCourse);

router.get('/course-branch', adminController.getBranchCourses);
router.post('/course-branch', adminController.assignCourseBranch);

router.get('/faculty-course', adminController.getFacultyCourses);
router.post('/faculty-course', adminController.assignFaculty);

module.exports = router;
