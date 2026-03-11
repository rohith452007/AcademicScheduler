import api from './api';

const adminService = {
    // Programs
    createProgram: async (data) => await api.post('/admin/program', data),
    getPrograms: async () => await api.get('/admin/program'),

    // Years
    createYear: async (data) => await api.post('/admin/year', data),
    getYears: async () => await api.get('/admin/year'),

    // Semesters
    createSemester: async (data) => await api.post('/admin/semester', data),
    getSemesters: async () => await api.get('/admin/semester'),

    // Branches
    createBranch: async (data) => await api.post('/admin/branch', data),
    getBranches: async () => await api.get('/admin/branch'),

    // Sections
    createSection: async (data) => await api.post('/admin/section', data),
    getSections: async () => await api.get('/admin/section'),

    // Subsections
    createSubsection: async (data) => await api.post('/admin/subsection', data),
    getSubsections: async () => await api.get('/admin/subsection'),

    // Faculty
    createFaculty: async (data) => await api.post('/admin/faculty', data),
    getFaculty: async () => await api.get('/admin/faculty'),

    // Rooms
    createRoom: async (data) => await api.post('/admin/room', data),
    getRooms: async () => await api.get('/admin/room'),

    // Courses
    createCourse: async (data) => await api.post('/admin/course', data),
    getCourses: async () => await api.get('/admin/course'),

    // Faculty Assignment
    assignFaculty: async (data) => await api.post('/admin/faculty-course', data),
    getFacultyCourses: async () => await api.get('/admin/faculty-course'),

    // Course Branch Assignment
    assignCourseBranch: async (data) => await api.post('/admin/course-branch', data),
    getBranchCourses: async () => await api.get('/admin/course-branch'),
};

export default adminService;
