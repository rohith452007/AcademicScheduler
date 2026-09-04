import api from './api';

const examService = {
    // Timeslots
    getExamTimeslots: async () => await api.get('/exam/timeslots'),
    createExamTimeslot: async (data) => await api.post('/exam/timeslots', data),
    updateExamTimeslot: async (id, data) => await api.put(`/exam/timeslots/${id}`, data),
    deleteExamTimeslot: async (id) => await api.delete(`/exam/timeslots/${id}`),

    // Backlog Courses
    getBacklogCourses: async () => await api.get('/exam/backlog-courses'),
    createBacklogCourse: async (data) => await api.post('/exam/backlog-courses', data),
    deleteBacklogCourse: async (id) => await api.delete(`/exam/backlog-courses/${id}`),

    // Slot Preferences
    getExamSlotPreferences: async () => await api.get('/exam/slot-preferences'),
    saveExamSlotPreference: async (data) => await api.post('/exam/slot-preferences', data),

    // Timetable Generation & Retrieval
    generateExamTimetable: async () => await api.post('/exam/generate'),
    getExamTimetable: async (draft = false) => await api.get(`/exam/timetable${draft ? '?draft=true' : ''}`),

    // Draft & Edit Sessions
    startExamEditSession: async () => await api.post('/exam/session/start'),
    saveExamEditSession: async () => await api.post('/exam/session/save'),
    cancelExamEditSession: async () => await api.post('/exam/session/cancel'),
    deleteExamEntry: async (id, draft = false, extraParams = {}) => {
        const params = new URLSearchParams();
        if (draft) params.append('draft', 'true');
        if (extraParams.course_code) params.append('course_code', extraParams.course_code);
        if (extraParams.program_id) params.append('program_id', extraParams.program_id);
        if (extraParams.semester_id) params.append('semester_id', extraParams.semester_id);
        if (extraParams.exam_slot_id) params.append('exam_slot_id', extraParams.exam_slot_id);
        const qStr = params.toString() ? `?${params.toString()}` : '';
        return await api.delete(`/exam/entry/${id}${qStr}`);
    },
    addExamEntry: async (data, draft = true) => await api.post(`/exam/entry${draft ? '?draft=true' : ''}`, data),
    getAvailableCourses: async () => await api.get('/exam/available-courses'),
    clearExamTimetable: async () => await api.delete('/exam/clear-all')
};

export default examService;

