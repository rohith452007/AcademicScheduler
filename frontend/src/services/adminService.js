import api from './api';

const adminService = {
    // Programs
    createProgram: async (data) => await api.post('/admin/program', data),
    getPrograms: async () => await api.get('/admin/program'),
    updateProgram: async (id, data) => await api.put(`/admin/program/${id}`, data),
    deleteProgram: async (id) => await api.delete(`/admin/program/${id}`),

    // Years
    createYear: async (data) => await api.post('/admin/year', data),
    getYears: async (params) => await api.get('/admin/year', { params }),
    updateYear: async (id, data) => await api.put(`/admin/year/${id}`, data),
    deleteYear: async (id) => await api.delete(`/admin/year/${id}`),

    // Semesters
    createSemester: async (data) => await api.post('/admin/semester', data),
    getSemesters: async (params) => await api.get('/admin/semester', { params }),
    updateSemester: async (id, data) => await api.put(`/admin/semester/${id}`, data),
    deleteSemester: async (id) => await api.delete(`/admin/semester/${id}`),

    // Branches
    createBranch: async (data) => await api.post('/admin/branch', data),
    getBranches: async () => await api.get('/admin/branch'),
    updateBranch: async (id, data) => await api.put(`/admin/branch/${id}`, data),
    deleteBranch: async (id) => await api.delete(`/admin/branch/${id}`),

    // Sections
    createSection: async (data) => await api.post('/admin/section', data),
    getSections: async () => await api.get('/admin/section'),
    updateSection: async (id, data) => await api.put(`/admin/section/${id}`, data),
    deleteSection: async (id) => await api.delete(`/admin/section/${id}`),

    // Subsections
    createSubsection: async (data) => await api.post('/admin/subsection', data),
    getSubsections: async () => await api.get('/admin/subsection'),
    updateSubsection: async (id, data) => await api.put(`/admin/subsection/${id}`, data),
    deleteSubsection: async (id) => await api.delete(`/admin/subsection/${id}`),

    // Faculty
    createFaculty: async (data) => await api.post('/admin/faculty', data),
    getFaculty: async () => await api.get('/admin/faculty'),
    updateFaculty: async (id, data) => await api.put(`/admin/faculty/${id}`, data),
    deleteFaculty: async (id) => await api.delete(`/admin/faculty/${id}`),

    // Rooms
    createRoom: async (data) => await api.post('/admin/room', data),
    getRooms: async () => await api.get('/admin/room'),
    updateRoom: async (id, data) => await api.put(`/admin/room/${id}`, data),
    deleteRoom: async (id) => await api.delete(`/admin/room/${id}`),

    // Courses
    createCourse: async (data) => await api.post('/admin/course', data),
    getCourses: async () => await api.get('/admin/course'),
    updateCourse: async (id, data) => await api.put(`/admin/course/${id}`, data),
    deleteCourse: async (id) => await api.delete(`/admin/course/${id}`),

    // Faculty Assignment
    assignFaculty: async (data) => await api.post('/admin/faculty-course', data),
    getFacultyCourses: async () => await api.get('/admin/faculty-course'),
    updateFacultyAllocation: async (data) => await api.put('/admin/faculty-course', data),
    deleteFacultyAllocation: async (params) => await api.delete('/admin/faculty-course', { params }),

    // Course Branch Assignment
    assignCourseBranch: async (data) => await api.post('/admin/course-branch', data),
    getBranchCourses: async () => await api.get('/admin/course-branch'),
    updateCourseBranch: async (data) => await api.put('/admin/course-branch', data),
    deleteCourseBranch: async (params) => await api.delete('/admin/course-branch', { params }),

    // Timetable
    getAllTimetables: async (params) => await api.get('/admin/timetable', { params }),
    getTimeSlots: async () => await api.get('/admin/timeslot'),
    createTimeSlot: async (data) => await api.post('/admin/timeslot', data),
    updateTimeSlot: async (id, data) => await api.put(`/admin/timeslot/${id}`, data),
    deleteTimeSlot: async (id) => await api.delete(`/admin/timeslot/${id}`),
    addManualEntry: async (data, draft = false) => await api.post(`/admin/master-timetable/manual${draft ? '?draft=true' : ''}`, data),
    deleteMasterEntry: async (id, draft = false) => await api.delete(`/admin/master-timetable/${id}${draft ? '?draft=true' : ''}`),
    startEditSession: async () => await api.post('/admin/master-timetable/session/start'),
    saveEditSession: async () => await api.post('/admin/master-timetable/session/save'),
    cancelEditSession: async () => await api.post('/admin/master-timetable/session/cancel'),
    getMasterTimetable: async (params, draft = false) => await api.get(`/admin/master-timetable${draft ? '?draft=true' : ''}`, { params }),
    getCourseComponents: async () => await api.get('/admin/course-component'),
    clearMasterTimetable: async () => await api.delete('/admin/clear-master', { data: { confirm: true } }),

    // Users
    createUser: async (data) => await api.post('/admin/user', data),
    getUsers: async () => await api.get('/admin/user'),
    updateUser: async (id, data) => await api.put(`/admin/user/${id}`, data),
    deleteUser: async (id) => await api.delete(`/admin/user/${id}`),

    // Lab Room Preferences
    getLabRoomPreferences: async () => await api.get('/admin/lab-room-pref'),
    setLabRoomPreference: async (data) => await api.post('/admin/lab-room-pref', data),
    deleteLabRoomPreference: async (courseId, branchId = null) => await api.delete(`/admin/lab-room-pref/${courseId}${branchId ? `?branch_id=${branchId}` : ''}`),
};

export default adminService;

