import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { useNavigate } from 'react-router-dom';

function Manage() {
    const [view, setView] = useState('dashboard');
    const [activeCategory, setActiveCategory] = useState('ACADEMIC'); // ACADEMIC | CLASSES | RESOURCES | COURSES | LAB_ROOMS
    const [labRoomPrefs, setLabRoomPrefs] = useState({});
    const [labCourses, setLabCourses] = useState([]);     // lab courses with lab_hours > 0
    const [labRoomMsg, setLabRoomMsg] = useState('');

    // Search and filter states for Lab Room Assignments
    const [labSearch, setLabSearch] = useState('');
    const [labFilterProgram, setLabFilterProgram] = useState('');
    const [labFilterBranch, setLabFilterBranch] = useState('');
    const [labFilterPref, setLabFilterPref] = useState('ALL');

    // Derived filtered lab courses
    const filteredLabCourses = labCourses.filter(course => {
        const query = labSearch.toLowerCase().trim();
        const matchesSearch = !query ||
            course.course_code.toLowerCase().includes(query) ||
            course.course_name.toLowerCase().includes(query);

        const matchesProgram = !labFilterProgram ||
            (course.programs && course.programs.includes(labFilterProgram));

        const matchesBranch = !labFilterBranch ||
            course.branch_name === labFilterBranch;

        const representativeId = course.course_ids[0];
        const prefKey = course.branch_id ? `${representativeId}_${course.branch_id}` : String(representativeId);
        const hasPref = !!labRoomPrefs[prefKey];

        const matchesPref = labFilterPref === 'ALL' ||
            (labFilterPref === 'HAS_PREF' && hasPref) ||
            (labFilterPref === 'NO_PREF' && !hasPref);

        return matchesSearch && matchesProgram && matchesBranch && matchesPref;
    });

    // local cache for all academic data fetched from the server
    const [data, setData] = useState({
        program: [], year: [], semester: [], branch: [],
        section: [], subsection: [],
        faculty: [], room: [],
        course: [], 'faculty-course': [],
        user: [], timeslot: []
    });

    const [showModal, setShowModal] = useState(null);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerms, setSearchTerms] = useState({});
    const [activeProgramTab, setActiveProgramTab] = useState('all');
    const [modalSearch, setModalSearch] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();

    // groups related resources for the sidebar navigation
    const categories = {
        'ACADEMIC': { title: 'ACADEMIC STRUCTURE', resources: ['program', 'year', 'semester', 'branch'] },
        'CLASSES': { title: 'CLASSES & SECTIONS', resources: ['section', 'subsection'] },
        'RESOURCES': { title: 'RESOURCES (FACULTY/ROOMS)', resources: ['faculty', 'room'] },
        'COURSES': { title: 'COURSES & CURRICULUM', resources: ['course', 'course-branch', 'faculty-course'] },
        'TIMESLOTS': { title: 'TIMESLOTS', resources: ['timeslot'] },
        'USERS': { title: 'USERS', resources: ['user'] },
        'LAB_ROOMS': { title: 'LAB ROOM PREFS', resources: [] }
    };

    // defines which database fields to display in each resource table
    const resourceColumns = {
        'program': ['program_id', 'program_name'],
        'year': ['year_id', 'year_name', 'program_name'],
        'semester': ['semester_id', 'semester_number', 'year_name', 'program_name'],
        'branch': ['branch_id', 'branch_name', 'program_name'],
        'section': ['section_id', 'section_name', 'branch_name', 'semester_number', 'program_name'],
        'subsection': ['subsection_id', 'subsection_name', 'subsection_capacity', 'section_name', 'branch_name', 'semester_number', 'program_name'],
        'faculty': ['faculty_id', 'faculty_name', 'faculty_short', 'email'],
        'room': ['room_id', 'room_name', 'room_type', 'capacity'],
        'course': ['program_name', 'course_code', 'course_name', 'semester_number', 'theory_hours', 'lab_hours', 'tutorial_hours'],
        'course-branch': ['program_name', 'branch_name', 'course_name', 'course_code', 'branch_lab_group_type'],
        'faculty-course': ['program_name', 'branch_name', 'section_name', 'course_code', 'faculty_name'],
        'timeslot': ['timeslot_id', 'day', 'start_time', 'end_time', 'slot_order', 'is_break'],
        'user': ['user_id', 'username', 'role', 'email']
    };    // Fetch lab room preferences and all lab courses when LAB_ROOMS tab is active
    useEffect(() => {
        if (activeCategory !== 'LAB_ROOMS') return;
        const fetchLabData = async () => {
            try {
                const [prefsRes, coursesRes, roomsRes, branchCoursesRes] = await Promise.all([
                    adminService.getLabRoomPreferences(),
                    adminService.getCourses(),
                    adminService.getRooms(),
                    adminService.getBranchCourses()
                ]);

                const prefsMap = {};
                (prefsRes.data || []).forEach(p => {
                    const key = p.branch_id ? `${p.course_id}_${p.branch_id}` : String(p.course_id);
                    prefsMap[key] = String(p.room_id);
                });
                setLabRoomPrefs(prefsMap);

                // Group OE courses globally, but keep regular courses branch-specific
                const rawCourses = (coursesRes.data || []).filter(c => Number(c.lab_hours) > 0);
                const branchCourses = branchCoursesRes.data || [];
                const groupedList = [];
                const addedOEs = new Set();

                rawCourses.forEach(c => {
                    if (c.is_open_elective === 1) {
                        if (!addedOEs.has(c.course_code)) {
                            addedOEs.add(c.course_code);
                            const related = rawCourses.filter(rc => rc.course_code === c.course_code && rc.is_open_elective === 1);
                            groupedList.push({
                                course_code: c.course_code,
                                course_name: c.course_name,
                                lab_hours: c.lab_hours,
                                is_open_elective: 1,
                                course_ids: related.map(rc => rc.course_id),
                                branch_id: null,
                                branch_name: null,
                                programs: Array.from(new Set(related.map(rc => rc.program_name))).sort()
                            });
                        }
                    } else {
                        // Regular course: list per branch assignment
                        const cbAssignments = branchCourses.filter(bc => bc.course_id === c.course_id);
                        if (cbAssignments.length > 0) {
                            cbAssignments.forEach(cb => {
                                groupedList.push({
                                    course_code: c.course_code,
                                    course_name: c.course_name,
                                    lab_hours: c.lab_hours,
                                    is_open_elective: 0,
                                    course_ids: [c.course_id],
                                    branch_id: cb.branch_id,
                                    branch_name: cb.branch_name,
                                    programs: [cb.program_name]
                                });
                            });
                        } else {
                            groupedList.push({
                                course_code: c.course_code,
                                course_name: c.course_name,
                                lab_hours: c.lab_hours,
                                is_open_elective: 0,
                                course_ids: [c.course_id],
                                branch_id: null,
                                branch_name: null,
                                programs: [c.program_name]
                            });
                        }
                    }
                });

                groupedList.sort((a, b) => {
                    const cmp = a.course_code.localeCompare(b.course_code);
                    if (cmp !== 0) return cmp;
                    return (a.branch_name || "").localeCompare(b.branch_name || "");
                });
                setLabCourses(groupedList);
                setData(prev => ({ ...prev, room: roomsRes.data || [] }));
            } catch (e) {
                console.error('Failed to fetch lab room data', e);
            }
        };
        fetchLabData();
    }, [activeCategory]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        if (!token) {
            navigate('/login');
            return;
        }
        if (role !== 'admin') {
            if (role === 'faculty') navigate('/faculty-manage');
            else navigate('/master-timetable');
            return;
        }
        if (view === 'resources') {
            fetchCategoryData();
        }
    }, [activeCategory, view]);


    const fetchCategoryData = async () => {
        try {
            let resourcesToFetch = [...categories[activeCategory].resources];

            if (activeCategory === 'CLASSES') {
                resourcesToFetch.push('program', 'branch', 'semester', 'year');
            }
            if (activeCategory === 'COURSES') {
                resourcesToFetch.push('program', 'branch', 'faculty', 'semester', 'section');
            }

            resourcesToFetch = [...new Set(resourcesToFetch)];

            const newData = { ...data };

            await Promise.all(resourcesToFetch.map(async (r) => {
                let res;
                switch (r) {
                    case 'program': res = await adminService.getPrograms(); break;
                    case 'year': res = await adminService.getYears(); break;
                    case 'semester': res = await adminService.getSemesters(); break;
                    case 'branch': res = await adminService.getBranches(); break;
                    case 'section': res = await adminService.getSections(); break;
                    case 'subsection': res = await adminService.getSubsections(); break;
                    case 'faculty': res = await adminService.getFaculty(); break;
                    case 'room': res = await adminService.getRooms(); break;
                    case 'course': res = await adminService.getCourses(); break;
                    case 'course-branch': res = await adminService.getBranchCourses(); break;
                    case 'faculty-course': res = await adminService.getFacultyCourses(); break;
                    case 'timeslot': res = await adminService.getTimeSlots(); break;
                    case 'user': res = await adminService.getUsers(); break;
                    default: res = { data: [] };
                }
                newData[r] = Array.isArray(res.data) ? res.data : [];
            }));

            setData(newData);
        } catch (err) {
            console.error(err);
            if (err && err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage('');
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                switch (showModal) {
                    case 'program': await adminService.updateProgram(editId, formData); break;
                    case 'year': await adminService.updateYear(editId, formData); break;
                    case 'semester': await adminService.updateSemester(editId, formData); break;
                    case 'branch': await adminService.updateBranch(editId, formData); break;
                    case 'section': await adminService.updateSection(editId, formData); break;
                    case 'subsection': await adminService.updateSubsection(editId, formData); break;
                    case 'faculty': await adminService.updateFaculty(editId, formData); break;
                    case 'room': await adminService.updateRoom(editId, formData); break;
                    case 'faculty-course':
                        await adminService.updateFacultyAllocation({
                            ...formData,
                            old_faculty_id: editId.faculty_id,
                            old_course_id: editId.course_id,
                            old_branch_id: editId.branch_id,
                            old_section_id: editId.section_id
                        });
                        break;
                    case 'course-branch':
                        await adminService.updateCourseBranch({
                            ...formData,
                            old_branch_id: editId.branch_id,
                            old_course_code: editId.course_code
                        });
                        break;
                    case 'course':
                        await adminService.updateCourse(editId, {
                            course_name: formData.course_name,
                            course_code: formData.course_code,
                            semester_number: formData.semester_number,
                            semester_id: formData.semester_id,
                            program_id: formData.program_id,
                            is_open_elective: formData.is_open_elective ? 1 : 0,
                            open_elective_number: formData.is_open_elective ? formData.open_elective_number : null,
                            lab_group_type: formData.lab_group_type || "COMBINED",
                            components: {
                                THEORY: parseInt(formData.theory_hours || 0),
                                LAB: parseInt(formData.lab_hours || 0),
                                TUTORIAL: parseInt(formData.tutorial_hours || 0)
                            }
                        });
                        break;
                    case 'user':
                        await adminService.updateUser(editId, formData);
                        break;
                    case 'timeslot':
                        await adminService.updateTimeSlot(editId, formData);
                        break;
                }
                setMessage('Updated successfully!');
            } else {
                switch (showModal) {
                    case 'program': await adminService.createProgram(formData); break;
                    case 'year': await adminService.createYear(formData); break;
                    case 'semester': await adminService.createSemester(formData); break;
                    case 'branch': await adminService.createBranch(formData); break;
                    case 'section': await adminService.createSection(formData); break;
                    case 'subsection':
                        await adminService.createSubsection({
                            subsection_name: formData.subsection_name,
                            subsection_capacity: formData.subsection_capacity,
                            section_id: formData.section_id
                        });
                        break;
                    case 'faculty': await adminService.createFaculty(formData); break;
                    case 'room': await adminService.createRoom(formData); break;
                    case 'faculty-course': await adminService.assignFaculty(formData); break;
                    case 'course-branch':
                        await adminService.assignCourseBranch({
                            branch_id: formData.branch_id,
                            course_code: formData.course_code,
                            course_capacity: parseInt(formData.course_capacity || 0)
                        });
                        break;
                    case 'course':
                        await adminService.createCourse({
                            course_name: formData.course_name,
                            course_code: formData.course_code,
                            semester_number: formData.semester_number,
                            semester_id: formData.semester_id,
                            program_id: formData.program_id,
                            is_open_elective: formData.is_open_elective ? 1 : 0,
                            open_elective_number: formData.is_open_elective ? formData.open_elective_number : null,
                            lab_group_type: formData.lab_group_type || "COMBINED",
                            components: {
                                THEORY: parseInt(formData.theory_hours || 0),
                                LAB: parseInt(formData.lab_hours || 0),
                                TUTORIAL: parseInt(formData.tutorial_hours || 0)
                            }
                        });
                        break;
                    case 'user':
                        await adminService.createUser(formData);
                        break;
                    case 'timeslot':
                        await adminService.createTimeSlot(formData);
                        break;
                }
                setMessage('Added successfully!');
            }
            setIsEditing(false);
            setEditId(null);
            setFormData({});
            setShowModal(null);
            fetchCategoryData();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Error processing request.';
            alert("Error: " + errMsg);
            setMessage(errMsg);
        }
    };

    const handleEdit = (item, type) => {
        let id;
        switch (type) {
            case 'program': id = item.program_id; break;
            case 'year': id = item.year_id; break;
            case 'semester': id = item.semester_id; break;
            case 'branch': id = item.branch_id; break;
            case 'section': id = item.section_id; break;
            case 'subsection': id = item.subsection_id; break;
            case 'faculty': id = item.faculty_id; break;
            case 'room': id = item.room_id; break;
            case 'course': id = item.course_id; break;
            case 'user': id = item.user_id; break;
            case 'timeslot': id = item.timeslot_id; break;
            case 'course-branch':
                id = { branch_id: item.branch_id, course_code: item.course_code };
                break;
            case 'faculty-course':
                id = {
                    faculty_id: item.faculty_id,
                    course_id: item.course_id,
                    branch_id: item.branch_id,
                    section_id: item.section_id
                };
                break;
        }
        setFormData({
            ...item,
            program_id: item.target_program_id || item.program_id,
            semester_id: item.target_semester_id || item.semester_id
        });
        setEditId(id);
        setIsEditing(true);
        setShowModal(type);
        setModalSearch({});
        setMessage('');
    };

    const handleDelete = async (item, type) => {
        let id;
        let name;
        switch (type) {
            case 'program': id = item.program_id; name = item.program_name; break;
            case 'year': id = item.year_id; name = item.year_name; break;
            case 'semester': id = item.semester_id; name = `Semester ${item.semester_number}`; break;
            case 'branch': id = item.branch_id; name = item.branch_name; break;
            case 'section': id = item.section_id; name = item.section_name; break;
            case 'subsection': id = item.subsection_id; name = item.subsection_name; break;
            case 'faculty': id = item.faculty_id; name = item.faculty_name; break;
            case 'room': id = item.room_id; name = item.room_name; break;
            case 'course': id = item.course_id; name = item.course_code; break;
            case 'user': id = item.user_id; name = item.username; break;
            case 'timeslot': id = item.timeslot_id; name = `${item.day} (${item.start_time}-${item.end_time})`; break;
            case 'course-branch':
                id = { branch_id: item.branch_id, course_code: item.course_code };
                name = `${item.course_code} in ${item.branch_name}`;
                break;
            case 'faculty-course':
                id = {
                    faculty_id: item.faculty_id,
                    course_id: item.course_id,
                    branch_id: item.branch_id,
                    section_id: item.section_id
                };
                name = `${item.faculty_name} for ${item.course_code}`;
                break;
        }

        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                switch (type) {
                    case 'program': await adminService.deleteProgram(id); break;
                    case 'year': await adminService.deleteYear(id); break;
                    case 'semester': await adminService.deleteSemester(id); break;
                    case 'branch': await adminService.deleteBranch(id); break;
                    case 'section': await adminService.deleteSection(id); break;
                    case 'subsection': await adminService.deleteSubsection(id); break;
                    case 'faculty': await adminService.deleteFaculty(id); break;
                    case 'room': await adminService.deleteRoom(id); break;
                    case 'course': await adminService.deleteCourse(id); break;
                    case 'course-branch': await adminService.deleteCourseBranch(id); break;
                    case 'faculty-course': await adminService.deleteFacultyAllocation(id); break;
                    case 'user': await adminService.deleteUser(id); break;
                    case 'timeslot': await adminService.deleteTimeSlot(id); break;
                }
                setMessage('Deleted successfully!');
                fetchCategoryData();
            } catch (err) {
                console.error('Delete error:', err);
                const errMsg = err.response?.data?.error || 'Error deleting record.';
                alert("Delete Failed: " + errMsg);
                setMessage(errMsg);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleGenerateMasterTimetable = async () => {

        try {

            setIsGenerating(true);

            const token = localStorage.getItem('token');

            const res = await fetch('http://localhost:5001/api/admin/generate-master', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {

                alert(`Success: ${data.message || 'Timetable is generated'}`);

            } else {

                alert(`Error: ${data.error}`);

            }

        } catch (err) {

            console.error(err);
            alert('Failed to generate master timetable.');

        } finally {

            setIsGenerating(false);

        }

    };

    const handleViewMasterTimetable = () => {
        navigate('/master-timetable');
    };

    const renderModalForm = () => {
        if (!showModal) return null;

        let content;
        switch (showModal) {
            case 'program':
                content = (
                    <>
                        <label>Program Name:</label> <input name="program_name" value={formData.program_name || ''} placeholder="E.g. B.Tech" onChange={handleInputChange} required />
                    </>
                ); break;
            case 'year':
                content = (
                    <>
                        <label>Year Name:</label> <input name="year_name" value={formData.year_name || ''} placeholder="E.g. 1st Year" onChange={handleInputChange} required />
                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select name="program_id" value={formData.program_id || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(prog => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || (prog.program_name || "").toLowerCase().includes(term);
                            }).map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>
                    </>
                ); break;
            case 'semester':
                content = (
                    <>
                        <label>Semester Number:</label> <input name="semester_number" value={formData.semester_number || ''} type="number" onChange={handleInputChange} required />

                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select
                            name="program_id"
                            value={formData.program_id || ''}
                            onChange={(e) => {
                                handleInputChange(e);
                                setFormData(prev => ({ ...prev, program_id: e.target.value, year_id: '' }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(prog => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || prog.program_name.toLowerCase().includes(term);
                            }).map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Filter Year:</label>
                        <input
                            placeholder="Find year..."
                            value={modalSearch.year || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, year: e.target.value }))}
                        />
                        <select
                            name="year_id"
                            value={formData.year_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Year</option>
                            {data.year && data.year
                                .filter(y => y.program_id == formData.program_id)
                                .filter(y => {
                                    const term = (modalSearch.year || "").toLowerCase();
                                    return !term || (y.year_name || "").toLowerCase().includes(term);
                                })
                                .map(y => (
                                    <option key={y.year_id} value={y.year_id}>
                                        {y.year_name}
                                    </option>
                                ))
                            }
                        </select>
                    </>
                ); break;
            case 'branch':
                content = (
                    <>
                        <label>Branch Name:</label> <input name="branch_name" value={formData.branch_name || ''} onChange={handleInputChange} required />
                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select name="program_id" value={formData.program_id || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(prog => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || (prog.program_name || "").toLowerCase().includes(term);
                            }).map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>
                    </>
                ); break;
            case 'section':
                content = (
                    <>
                        <label>Section Name:</label> <input name="section_name" value={formData.section_name || ''} onChange={handleInputChange} required />

                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select
                            name="program_id"
                            value={formData.program_id || ''}
                            onChange={(e) => {
                                const pid = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    program_id: pid,
                                    branch_id: '',
                                    semester_id: ''
                                }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(prog => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || prog.program_name.toLowerCase().includes(term);
                            }).map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Filter Branch:</label>
                        <input
                            placeholder="Find branch..."
                            value={modalSearch.branch || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, branch: e.target.value }))}
                        />
                        <select
                            name="branch_id"
                            value={formData.branch_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Branch</option>
                            {data.branch && data.branch
                                .filter(b => b.program_id == formData.program_id)
                                .filter(b => {
                                    const term = (modalSearch.branch || "").toLowerCase();
                                    return !term || (b.branch_name || "").toLowerCase().includes(term);
                                })
                                .map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        {b.branch_name}
                                    </option>
                                ))
                            }
                        </select>

                        <label>Filter Semester:</label>
                        <input
                            placeholder="Find semester..."
                            value={modalSearch.semester || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, semester: e.target.value }))}
                        />
                        <select
                            name="semester_id"
                            value={formData.semester_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Semester</option>
                            {data.semester && data.semester
                                .filter(s => s.program_id == formData.program_id)
                                .filter(s => {
                                    const term = (modalSearch.semester || "").toLowerCase();
                                    return !term || (s.semester_number || "").toString().toLowerCase().includes(term);
                                })
                                .map(s => (
                                    <option key={s.semester_id} value={s.semester_id}>
                                        Sem {s.semester_number} ({s.year_name})
                                    </option>
                                ))
                            }
                        </select>
                    </>
                ); break;
            case 'subsection':
                content = (
                    <>
                        <label>Subsection Name:</label>
                        <input name="subsection_name" value={formData.subsection_name || ''} onChange={handleInputChange} required />

                        <label>Capacity:</label>
                        <input
                            name="subsection_capacity"
                            type="number"
                            value={formData.subsection_capacity || ''}
                            onChange={handleInputChange}
                            required
                        />

                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select
                            name="program_id"
                            value={formData.program_id || ''}
                            onChange={(e) => {
                                const pid = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    program_id: pid,
                                    branch_id: '',
                                    semester_id: '',
                                    section_id: ''
                                }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(prog => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || (prog.program_name || "").toLowerCase().includes(term);
                            }).map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Filter Branch:</label>
                        <input
                            placeholder="Find branch..."
                            value={modalSearch.branch || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, branch: e.target.value }))}
                        />
                        <select
                            name="branch_id"
                            value={formData.branch_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Branch</option>
                            {data.branch && data.branch
                                .filter(b => b.program_id == formData.program_id)
                                .filter(b => {
                                    const term = (modalSearch.branch || "").toLowerCase();
                                    return !term || (b.branch_name || "").toLowerCase().includes(term);
                                })
                                .map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        {b.branch_name}
                                    </option>
                                ))
                            }
                        </select>

                        <label>Filter Semester:</label>
                        <input
                            placeholder="Find semester..."
                            value={modalSearch.semester || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, semester: e.target.value }))}
                        />
                        <select
                            name="semester_id"
                            value={formData.semester_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Semester</option>
                            {data.semester && data.semester
                                .filter(s => s.program_id == formData.program_id)
                                .filter(s => {
                                    const term = (modalSearch.semester || "").toLowerCase();
                                    return !term || (s.semester_number || "").toString().toLowerCase().includes(term);
                                })
                                .map(s => (
                                    <option key={s.semester_id} value={s.semester_id}>
                                        Sem {s.semester_number} ({s.year_name})
                                    </option>
                                ))
                            }
                        </select>

                        <label>Filter Section:</label>
                        <input
                            placeholder="Find section..."
                            value={modalSearch.section || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, section: e.target.value }))}
                        />
                        <select
                            name="section_id"
                            value={formData.section_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.branch_id || !formData.semester_id}
                        >
                            <option value="">Select Section</option>
                            {data.section && data.section
                                .filter(sec => sec.branch_id == formData.branch_id && sec.semester_id == formData.semester_id)
                                .filter(sec => {
                                    const term = (modalSearch.section || "").toLowerCase();
                                    return !term || (sec.section_name || "").toLowerCase().includes(term);
                                })
                                .map(sec => (
                                    <option key={sec.section_id} value={sec.section_id}>
                                        {sec.section_name}
                                    </option>
                                ))
                            }
                        </select>
                    </>
                ); break;
            case 'faculty':
                content = (
                    <>
                        <label>Faculty ID:</label> <input name="faculty_id" value={formData.faculty_id || ''} onChange={handleInputChange} required disabled={isEditing} />
                        <label>Name:</label> <input name="faculty_name" value={formData.faculty_name || ''} onChange={handleInputChange} required />
                        <label>Short Name:</label> <input name="faculty_short" value={formData.faculty_short || ''} onChange={handleInputChange} />
                        <label>Email:</label> <input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required />
                        {!isEditing && (
                            <>
                                <label>Login Password:</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password || ''}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Set initial login password"
                                />
                            </>
                        )}
                        {isEditing && (
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 10px', fontStyle: 'italic' }}>
                                ℹ️ To change this faculty member's login password, go to the <strong>Users</strong> tab.
                            </p>
                        )}
                    </>
                ); break;
            case 'room':
                content = (
                    <>
                        <label>Room Name/No:</label> <input name="room_name" value={formData.room_name || ''} onChange={handleInputChange} required />
                        <label>Type:</label>
                        <select name="room_type" value={formData.room_type || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Type</option>
                            <option value="CLASSROOM">CLASSROOM</option>
                            <option value="LAB">LAB</option>
                        </select>
                        <label>Capacity:</label> <input name="capacity" type="number" value={formData.capacity || ''} onChange={handleInputChange} required />
                    </>
                ); break;
            case 'user':
                content = (
                    <>
                        <label>Username:</label>
                        <input
                            name="username"
                            value={formData.username || ''}
                            onChange={handleInputChange}
                            required
                            disabled={isEditing}
                            placeholder="Enter username"
                        />
                        <label>Password:</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password || ''}
                            onChange={handleInputChange}
                            required={!isEditing}
                            placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
                        />
                        <label>Role:</label>
                        <select
                            name="role"
                            value={formData.role || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Role</option>
                            <option value="admin">admin</option>
                            <option value="faculty">faculty</option>
                            <option value="student">student</option>
                        </select>
                        <label>Email:</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter email address"
                        />
                    </>
                ); break;
            case 'timeslot':
                content = (
                    <>
                        <label>Day:</label>
                        <select name="day" value={formData.day || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Day</option>
                            <option value="MONDAY">MONDAY</option>
                            <option value="TUESDAY">TUESDAY</option>
                            <option value="WEDNESDAY">WEDNESDAY</option>
                            <option value="THURSDAY">THURSDAY</option>
                            <option value="FRIDAY">FRIDAY</option>
                            <option value="SATURDAY">SATURDAY</option>
                        </select>
                        <label>Start Time:</label>
                        <input name="start_time" type="time" value={formData.start_time || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <label>End Time:</label>
                        <input name="end_time" type="time" value={formData.end_time || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <label>Slot Order:</label>
                        <input name="slot_order" type="number" value={formData.slot_order || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <label>Is Break Slot:</label>
                        <select name="is_break" value={formData.is_break !== undefined ? (formData.is_break ? '1' : '0') : '0'} onChange={(e) => setFormData({ ...formData, is_break: e.target.value === '1' })} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </>
                ); break;
            case 'faculty-course':
                content = (
                    <>
                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select
                            name="program_id"
                            value={formData.program_id || ''}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, program_id: e.target.value, branch_id: '', section_id: '', semester_id: '', course_id: '' }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(p => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || (p.program_name || "").toLowerCase().includes(term);
                            }).map(p => (
                                <option key={p.program_id} value={p.program_id}>{p.program_name}</option>
                            ))}
                        </select>

                        <label>Filter Branch:</label>
                        <input
                            placeholder="Find branch..."
                            value={modalSearch.branch || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, branch: e.target.value }))}
                        />
                        <select
                            name="branch_id"
                            value={formData.branch_id || ''}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, branch_id: e.target.value, section_id: '', semester_id: '', course_id: '' }));
                            }}
                            required
                            disabled={!formData.program_id}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Branch</option>
                            {data.branch && data.branch.filter(b => {
                                if (String(b.program_id) !== String(formData.program_id)) return false;
                                const term = (modalSearch.branch || "").toLowerCase();
                                return !term || (b.branch_name || "").toLowerCase().includes(term);
                            }).map(b => (
                                <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                            ))}
                        </select>

                        <label>Filter Semester:</label>
                        <input
                            placeholder="Find semester..."
                            value={modalSearch.semester || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, semester: e.target.value }))}
                        />
                        <select
                            name="semester_id"
                            value={formData.semester_id || ''}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, semester_id: e.target.value, section_id: '', course_id: '' }));
                            }}
                            required
                            disabled={!formData.branch_id}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Semester</option>
                            {data.semester && data.semester.filter(s => {
                                if (String(s.program_id) !== String(formData.program_id)) return false;
                                const term = (modalSearch.semester || "").toLowerCase();
                                return !term || (s.semester_number || "").toString().toLowerCase().includes(term);
                            }).map(s => (
                                <option key={s.semester_id} value={s.semester_id}>Semester {s.semester_number}</option>
                            ))}
                        </select>

                        <label>Filter Section:</label>
                        <input
                            placeholder="Find section..."
                            value={modalSearch.section || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, section: e.target.value }))}
                        />
                        <select
                            name="section_id"
                            value={formData.section_id || ''}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, section_id: e.target.value }));
                            }}
                            required
                            disabled={!formData.semester_id}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Section</option>
                            {data.section && data.section.filter(s => {
                                if (String(s.semester_id) !== String(formData.semester_id) ||
                                    String(s.branch_id) !== String(formData.branch_id)) return false;

                                const term = (modalSearch.section || "").toLowerCase();
                                return !term || (s.section_name || "").toLowerCase().includes(term);
                            }).map(s => (
                                <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
                            ))}
                        </select>

                        <label>Filter Courses:</label>
                        <input
                            placeholder="Find course..."
                            value={modalSearch.course || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, course: e.target.value }))}
                        />
                        <select
                            name="course_id"
                            value={formData.course_id || ''}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, course_id: e.target.value }));
                            }}
                            required
                            disabled={!formData.semester_id}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Course</option>
                            {data.course && (() => {
                                const uniqueMap = new Map();
                                data.course.forEach(c => {
                                    const key = `${c.program_id}-${c.course_code}`;
                                    if (!uniqueMap.has(key)) {
                                        uniqueMap.set(key, c);
                                    }
                                });

                                return Array.from(uniqueMap.values()).filter(c => {
                                    const sem = data.semester.find(s => s.semester_id == formData.semester_id);
                                    if (!sem) return false;

                                    const matchesSem = String(c.semester_number) === String(sem.semester_number) &&
                                        String(c.program_id) === String(sem.program_id);

                                    if (!matchesSem) return false;

                                    const term = (modalSearch.course || "").toLowerCase();
                                    if (!term) return true;
                                    return (c.course_name || "").toLowerCase().includes(term) ||
                                        (c.course_code || "").toLowerCase().includes(term);
                                }).map(c => (
                                    <option key={c.course_id} value={c.course_id}>
                                        {c.course_name} ({c.course_code}) - {c.program_name || 'No Program'}
                                    </option>
                                ));
                            })()}
                        </select>

                        <label>Filter Faculty:</label>
                        <input
                            placeholder="Find faculty..."
                            value={modalSearch.faculty || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, faculty: e.target.value }))}
                        />
                        <select
                            name="faculty_id"
                            value={formData.faculty_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Faculty</option>
                            {data.faculty && data.faculty.filter(f => {
                                const term = (modalSearch.faculty || "").toLowerCase();
                                if (!term) return true;
                                return (f.faculty_name || "").toLowerCase().includes(term) ||
                                    (f.faculty_short || "").toLowerCase().includes(term);
                            }).map(f => (
                                <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name} ({f.faculty_short})</option>
                            ))}
                        </select>
                    </>
                ); break;
            case 'course-branch':
                content = (
                    <>
                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select
                            name="program_id"
                            value={formData.program_id || ''}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, program_id: e.target.value, branch_id: '' }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(p => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || (p.program_name || "").toLowerCase().includes(term);
                            }).map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Filter Branch:</label>
                        <input
                            placeholder="Find branch..."
                            value={modalSearch.branch || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, branch: e.target.value }))}
                        />
                        <select
                            name="branch_id"
                            value={formData.branch_id || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Branch</option>
                            {data.branch && data.branch
                                .filter(b => b.program_id == formData.program_id)
                                .filter(b => {
                                    const term = (modalSearch.branch || "").toLowerCase();
                                    return !term || (b.branch_name || "").toLowerCase().includes(term);
                                })
                                .map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        {b.branch_name}
                                    </option>
                                ))
                            }
                        </select>

                        <label>Filter Course:</label>
                        <input
                            placeholder="Find course..."
                            value={modalSearch.course || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, course: e.target.value }))}
                        />
                        <select
                            name="course_code"
                            value={formData.course_code || ''}
                            onChange={(e) => {
                                const c = data.course.find(course => course.course_code === e.target.value && String(course.program_id) === String(formData.program_id));
                                if (c) {
                                    setFormData(prev => ({ ...prev, course_code: c.course_code, course_id: c.course_id }));
                                } else {
                                    setFormData(prev => ({ ...prev, course_code: e.target.value }));
                                }
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Course</option>
                            {data.course && (() => {
                                const uniqueMap = new Map();
                                data.course.forEach(c => {
                                    const key = `${c.program_id}-${c.course_code}`;
                                    if (!uniqueMap.has(key)) {
                                        uniqueMap.set(key, c);
                                    }
                                });

                                const filteredCourses = Array.from(uniqueMap.values()).filter(c => {
                                    if (formData.program_id && String(c.program_id) !== String(formData.program_id)) return false;

                                    const term = (modalSearch.course || "").toLowerCase();
                                    if (!term) return true;
                                    return (c.course_name || "").toLowerCase().includes(term) ||
                                        (c.course_code || "").toLowerCase().includes(term);
                                });

                                return filteredCourses.map((c, idx) => (
                                    <option key={`${c.course_id}-${idx}`} value={c.course_code}>
                                        {c.course_name} ({c.course_code}) - {c.program_name || 'No Program'}
                                    </option>
                                ));
                            })()}
                        </select>

                        <label>Course Capacity for this Branch:</label>
                        <input
                            name="course_capacity"
                            type="number"
                            min="0"
                            placeholder="E.g., 60"
                            value={formData.course_capacity || ''}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        />

                        <label>Lab Group Type (If Lab Course):</label>
                        <select
                            name="branch_lab_group_type"
                            value={formData.branch_lab_group_type || 'COMBINED'}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="COMBINED">COMBINED (Full branch in same room)</option>
                            <option value="SPLIT">SPLIT (ECE-A1, ECE-A2 in separate blocks)</option>
                        </select>
                    </>
                ); break;
            case 'course':
                content = (
                    <>
                        <label>Filter Program:</label>
                        <input
                            placeholder="Find program..."
                            value={modalSearch.program || ""}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', fontSize: '12px', border: '1px dashed #cbd5e1' }}
                            onChange={(e) => setModalSearch(prev => ({ ...prev, program: e.target.value }))}
                        />
                        <select
                            name="program_id"
                            value={formData.program_id || ''}
                            onChange={(e) => {
                                handleInputChange(e);
                                setFormData(prev => ({ ...prev, semester_id: '', semester_number: '' }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.filter(p => {
                                const term = (modalSearch.program || "").toLowerCase();
                                return !term || (p.program_name || "").toLowerCase().includes(term);
                            }).map(p => (
                                <option key={p.program_id} value={p.program_id}>{p.program_name}</option>
                            ))}
                        </select>

                        <label>Course Name:</label>
                        <input name="course_name" value={formData.course_name || ''} onChange={handleInputChange} required />

                        <label>Course Code:</label>
                        <input name="course_code" value={formData.course_code || ''} onChange={handleInputChange} required />

                        <label>Select Semester:</label>
                        <select
                            name="semester_id"
                            value={formData.semester_id || ''}
                            onChange={(e) => {
                                const sem = (data.semester || []).find(s => String(s.semester_id) === String(e.target.value));
                                if (sem) {
                                    setFormData(prev => ({
                                        ...prev,
                                        semester_id: sem.semester_id,
                                        semester_number: sem.semester_number,
                                        program_id: sem.program_id
                                    }));
                                } else {
                                    setFormData(prev => ({ ...prev, semester_id: '', semester_number: '' }));
                                }
                            }}
                            required
                            disabled={!formData.program_id}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Semester</option>
                            {data.semester && data.semester
                                .filter(s => String(s.program_id) === String(formData.program_id))
                                .map(s => (
                                    <option key={s.semester_id} value={s.semester_id}>
                                        Semester {s.semester_number} ({s.year_name})
                                    </option>
                                ))
                            }
                        </select>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    name="is_open_elective"
                                    checked={!!formData.is_open_elective}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_open_elective: e.target.checked,
                                            open_elective_number: e.target.checked ? formData.open_elective_number : null
                                        })
                                    }
                                    style={{ width: 'auto', marginRight: '10px' }}
                                />
                                Is Open Elective?
                            </label>
                        </div>

                        {formData.is_open_elective && (
                            <>
                                <label>Open Elective Number:</label>
                                <input
                                    name="open_elective_number"
                                    value={formData.open_elective_number || ''}
                                    type="number"
                                    placeholder="E.g. 1"
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                                />
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                            <div>
                                <label>Theory Hrs:</label>
                                <input
                                    name="theory_hours"
                                    type="number"
                                    value={formData.theory_hours || '0'}
                                    min="0"
                                    onChange={handleInputChange}
                                    style={{ width: '80px', padding: '6px' }}
                                />
                            </div>

                            <div>
                                <label>Lab Hrs:</label>
                                <input
                                    name="lab_hours"
                                    type="number"
                                    value={formData.lab_hours || '0'}
                                    min="0"
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setFormData(prev => ({
                                            ...prev,
                                            lab_hours: e.target.value,

                                            lab_group_type: val > 0 ? (prev.lab_group_type || 'COMBINED') : ''
                                        }));
                                    }}
                                    style={{ width: '80px', padding: '6px' }}
                                />
                            </div>

                            {parseInt(formData.lab_hours || 0) > 0 && (
                                <div>
                                    <label>Lab Type: <span style={{ color: 'red' }}>*</span></label>
                                    <select
                                        name="lab_group_type"
                                        value={formData.lab_group_type || 'COMBINED'}
                                        onChange={handleInputChange}
                                        required
                                        style={{ width: '120px', padding: '6px' }}
                                    >
                                        <option value="COMBINED">Combined</option>
                                        <option value="SPLIT">Split</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label>Tutorial Hrs:</label>
                                <input
                                    name="tutorial_hours"
                                    type="number"
                                    value={formData.tutorial_hours || '0'}
                                    min="0"
                                    onChange={handleInputChange}
                                    style={{ width: '80px', padding: '6px' }}
                                />
                            </div>

                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                            ℹ️ Theory &amp; Tutorial are always <strong>Combined</strong>. Lab type is set above.
                        </p>
                    </>
                ); break;
            default: content = <p>Unknown form type</p>;
        }

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '550px', maxWidth: '95%', color: '#1e293b' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '20px', color: '#0f172a' }}>
                        {isEditing ? 'EDIT' : 'ADD NEW'}{' '}
                        {showModal === 'course-branch'
                            ? 'COURSE BRANCH ASSIGNMENT (LAB SPLIT CONFIG)'
                            : showModal === 'faculty-course'
                                ? 'FACULTY COURSE ALLOCATION'
                                : showModal.toUpperCase()}
                    </h3>

                    {message && (
                        <div style={{ padding: '15px', marginBottom: '15px', backgroundColor: message.toLowerCase().includes('success') ? '#dcfce7' : '#fee2e2', color: message.toLowerCase().includes('success') ? '#166534' : '#991b1b', borderRadius: '12px', fontWeight: '600' }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleAddSubmit}>
                        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                            {content}
                        </div>
                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button type="button" onClick={() => { setShowModal(null); setIsEditing(false); setEditId(null); setMessage(''); }} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(37,99,235,0.2)' }}>{isEditing ? 'Update Changes' : 'Save'}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    const stats = {
        courses: new Set(data.course?.map(c => c.course_code)).size || 0,
        unassigned: new Set(data.course?.filter(c => !data['faculty-course']?.some(f => f.course_id === c.course_id)).map(c => c.course_code)).size || 0,
        faculty: data.faculty?.length || 0,
        rooms: data.room?.length || 0
    };

    if (view === 'dashboard') {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px', color: '#1e293b', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#2563eb', letterSpacing: '-1px' }}>
                                ADMIN CORE
                            </h1>
                            <p style={{ color: '#64748b', marginTop: '5px' }}>Smart Timetable Generation System</p>
                        </div>
                        <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>Logout</button>
                    </div>


                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <button
                            onClick={() => setView('resources')}
                            style={{ padding: '60px 40px', borderRadius: '32px', fontSize: '22px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 20px 40px rgba(37,99,235,0.2)' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Manage Academic Data
                            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, marginTop: '12px', letterSpacing: '0.5px' }}>Programs, Sections, Faculty, & Allocations</div>
                        </button>

                        <button
                            onClick={handleGenerateMasterTimetable}
                            disabled={isGenerating}
                            style={{ padding: '60px 40px', borderRadius: '32px', fontSize: '22px', backgroundColor: isGenerating ? '#94a3b8' : '#059669', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', transition: '0.3s', boxShadow: '0 20px 40px rgba(5,150,105,0.15)' }}
                        >
                            {isGenerating ? 'GENERATING...' : 'Generate Master Timetable'}
                            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, marginTop: '12px', letterSpacing: '0.5px' }}>Run the scheduling engine</div>
                        </button>

                        <button
                            onClick={handleViewMasterTimetable}
                            style={{ gridColumn: 'span 2', padding: '30px', borderRadius: '24px', fontSize: '18px', backgroundColor: '#f1f5f9', color: '#1e293b', fontWeight: '700', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        >
                            Master Timetable Visualizer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px', color: '#1e293b', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* main configuration header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px', color: '#0f172a' }}>ADMIN CONFIG</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => setView('dashboard')} style={{ backgroundColor: 'white', color: '#1e293b', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #e2e8f0', cursor: 'pointer' }}>Dashboard</button>
                        <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
                    </div>
                </div>

                {/* top navigation for different management categories */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', background: 'white', padding: '10px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    {Object.keys(categories).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                flex: 1,
                                padding: '18px',
                                border: 'none',
                                borderRadius: '14px',
                                backgroundColor: activeCategory === cat ? '#2563eb' : 'transparent',
                                color: activeCategory === cat ? 'white' : '#64748b',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.85rem'
                            }}
                        >
                            {categories[cat].title}
                        </button>
                    ))}
                </div>

                {/* Lab Room Preferences — custom UI */}
                {activeCategory === 'LAB_ROOMS' && (
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '35px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Lab Room Assignments</h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px' }}>
                                    Optionally assign a preferred room to each lab course. The generator will use this room (any room type is allowed).
                                    If not set, a random lab room is used.
                                </p>
                            </div>
                            {labRoomMsg && (
                                <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: '700' }}>
                                    {labRoomMsg}
                                </span>
                            )}
                        </div>

                        {labCourses.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '500', fontSize: '1.1rem' }}>
                                No lab courses found. Add courses with lab_hours &gt; 0 first.
                            </div>
                        ) : (
                            <>
                                {/* Search and Filters Panel */}
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
                                    <div style={{ flex: '1', minWidth: '240px' }}>
                                        <input
                                            type="text"
                                            placeholder="Search by course code or name..."
                                            value={labSearch}
                                            onChange={(e) => setLabSearch(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px 20px',
                                                borderRadius: '14px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.85rem',
                                                outline: 'none',
                                                background: '#ffffff',
                                                color: '#0f172a',
                                                transition: '0.3s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                        />
                                    </div>

                                    <select
                                        value={labFilterProgram}
                                        onChange={(e) => setLabFilterProgram(e.target.value)}
                                        style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', background: '#ffffff', outline: 'none', cursor: 'pointer', transition: '0.3s' }}
                                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                    >
                                        <option value="">All Programs</option>
                                        {Array.from(new Set(data.program.map(p => p.program_name))).sort().map(prog => (
                                            <option key={prog} value={prog}>{prog}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={labFilterBranch}
                                        onChange={(e) => setLabFilterBranch(e.target.value)}
                                        style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', background: '#ffffff', outline: 'none', cursor: 'pointer', transition: '0.3s' }}
                                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                    >
                                        <option value="">All Branches</option>
                                        {Array.from(new Set(data.branch.map(b => b.branch_name))).sort().map(br => (
                                            <option key={br} value={br}>{br}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={labFilterPref}
                                        onChange={(e) => setLabFilterPref(e.target.value)}
                                        style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', background: '#ffffff', outline: 'none', cursor: 'pointer', transition: '0.3s' }}
                                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                    >
                                        <option value="ALL">All Preferences</option>
                                        <option value="HAS_PREF">Has Assigned Preference</option>
                                        <option value="NO_PREF">No Assigned Preference</option>
                                    </select>

                                    {(labSearch || labFilterProgram || labFilterBranch || labFilterPref !== 'ALL') && (
                                        <button
                                            onClick={() => {
                                                setLabSearch('');
                                                setLabFilterProgram('');
                                                setLabFilterBranch('');
                                                setLabFilterPref('ALL');
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                fontSize: '0.85rem',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                padding: '8px 12px'
                                            }}
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                                </div>

                                {filteredLabCourses.length === 0 ? (
                                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '500', fontSize: '1rem', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>
                                        No lab courses match the current search or filters.
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Course</th>
                                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Lab Hrs</th>
                                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Preferred Room</th>
                                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLabCourses.map((course, idx) => {
                                                const representativeId = course.course_ids[0];
                                                const prefKey = course.branch_id ? `${representativeId}_${course.branch_id}` : String(representativeId);
                                                const prefRoomId = labRoomPrefs[prefKey] || labRoomPrefs[String(representativeId)] || '';
                                                const allRooms = data.room || [];
                                                const prefRoom = allRooms.find(r => String(r.room_id) === String(prefRoomId));
                                                return (
                                                    <tr key={course.is_open_elective ? course.course_code : `${course.course_code}-${course.branch_id}`} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                                        <td style={{ padding: '16px' }}>
                                                            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                {course.course_code}
                                                                {course.programs && course.programs.map(progName => (
                                                                    <span key={progName} style={{ fontSize: '10px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                                                        {progName}
                                                                    </span>
                                                                ))}
                                                                {course.branch_name && (
                                                                    <span style={{ fontSize: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                                                        {course.branch_name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>{course.course_name}</div>
                                                        </td>
                                                        <td style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
                                                            {course.lab_hours}h
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <select
                                                                value={prefRoomId}
                                                                onChange={async (e) => {
                                                                    const newRoomId = e.target.value;
                                                                    if (!newRoomId) return;
                                                                    try {
                                                                        await adminService.setLabRoomPreference({ course_id: representativeId, branch_id: course.branch_id, room_id: newRoomId });

                                                                        setLabRoomPrefs(prev => {
                                                                            const updated = { ...prev };
                                                                            course.course_ids.forEach(id => {
                                                                                const k = course.branch_id ? `${id}_${course.branch_id}` : String(id);
                                                                                updated[k] = String(newRoomId);
                                                                            });
                                                                            return updated;
                                                                        });

                                                                        setLabRoomMsg('✓ Saved');
                                                                        setTimeout(() => setLabRoomMsg(''), 2000);
                                                                    } catch (err) {
                                                                        alert('Failed to save: ' + (err?.response?.data?.error || err.message));
                                                                    }
                                                                }}
                                                                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: '600', background: prefRoomId ? '#eff6ff' : '#ffffff', color: prefRoomId ? '#2563eb' : '#64748b', minWidth: '220px', cursor: 'pointer' }}
                                                            >
                                                                <option value="">— No preference (random lab room) —</option>
                                                                {allRooms
                                                                    .sort((a, b) => a.room_name.localeCompare(b.room_name))
                                                                    .map(r => (
                                                                        <option key={r.room_id} value={r.room_id}>
                                                                            {r.room_name} ({r.room_type}, cap:{r.capacity})
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                            {prefRoom && (
                                                                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: prefRoom.room_type === 'LAB' ? '#16a34a' : '#d97706', fontWeight: '700' }}>
                                                                    {prefRoom.room_type === 'LAB' ? '✓ Lab Room' : '⚠ Theory/Other Room — will be used as lab'}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            {prefRoomId && (
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await adminService.deleteLabRoomPreference(representativeId, course.branch_id);

                                                                            setLabRoomPrefs(prev => {
                                                                                const updated = { ...prev };
                                                                                course.course_ids.forEach(id => {
                                                                                    const k = course.branch_id ? `${id}_${course.branch_id}` : String(id);
                                                                                    delete updated[k];
                                                                                });
                                                                                return updated;
                                                                            });

                                                                            setLabRoomMsg('✓ Removed');
                                                                            setTimeout(() => setLabRoomMsg(''), 2000);
                                                                        } catch (err) {
                                                                            alert('Failed to remove: ' + (err?.response?.data?.error || err.message));
                                                                        }
                                                                    }}
                                                                    style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* the actual data tables for each resource */}
                {activeCategory !== 'LAB_ROOMS' && categories[activeCategory].resources.map(resourceType => {
                    const columns = resourceColumns[resourceType] || [];
                    const rawRows = data[resourceType] || [];
                    const term = (searchTerms[resourceType] || "").toLowerCase();

                    // handles switching between programs for course-specific views
                    let filteredRows = rawRows;
                    if (resourceType === 'course' && activeProgramTab !== 'all') {
                        filteredRows = rawRows.filter(r => r.program_id == activeProgramTab);
                    }

                    filteredRows = filteredRows.filter(row => {
                        if (!term) return true;
                        return columns.some(col => {
                            const val = row[col];
                            return val && val.toString().toLowerCase().includes(term);
                        });
                    });

                    return (
                        <div key={resourceType} style={{ marginBottom: '50px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '35px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

                            {resourceType === 'course' && data.program && (
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', padding: '5px', background: '#f1f5f9', borderRadius: '15px', width: 'fit-content' }}>
                                    <button
                                        onClick={() => setActiveProgramTab('all')}
                                        style={{ padding: '8px 20px', border: 'none', borderRadius: '10px', background: activeProgramTab === 'all' ? 'white' : 'transparent', color: activeProgramTab === 'all' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeProgramTab === 'all' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                                    >
                                        All Programs
                                    </button>
                                    {data.program.map(p => (
                                        <button
                                            key={p.program_id}
                                            onClick={() => setActiveProgramTab(p.program_id)}
                                            style={{ padding: '8px 20px', border: 'none', borderRadius: '10px', background: activeProgramTab == p.program_id ? 'white' : 'transparent', color: activeProgramTab == p.program_id ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeProgramTab == p.program_id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                                        >
                                            {p.program_name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h3 style={{ textTransform: 'uppercase', fontSize: '1.4rem', fontWeight: '900', color: '#2563eb', margin: 0, letterSpacing: '1px' }}>
                                    {resourceType === 'course-branch'
                                        ? 'Course Branch Assignment (Lab Split/Combined Config)'
                                        : resourceType === 'faculty-course'
                                            ? 'Faculty Course Allocation'
                                            : resourceType.replace('-', ' ') + 's'}
                                </h3>

                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            placeholder={resourceType === 'course-branch'
                                                ? 'Quick find assignments...'
                                                : resourceType === 'faculty-course'
                                                    ? 'Quick find allocations...'
                                                    : `Quick find ${resourceType}s...`}
                                            style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '14px', color: '#0f172a', minWidth: '300px', fontSize: '14px', outline: 'none', transition: '0.3s' }}
                                            onChange={(e) => setSearchTerms({ ...searchTerms, [resourceType]: e.target.value })}
                                            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                    <button
                                        onClick={() => { setFormData({}); setShowModal(resourceType); setMessage(''); setModalSearch({}); }}
                                        style={{ backgroundColor: '#2563eb', color: 'white', fontSize: '0.8rem', fontWeight: '900', padding: '12px 25px', borderRadius: '14px', border: 'none', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(37,99,235,0.2)' }}
                                    >
                                        + ADD NEW
                                    </button>
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto', borderRadius: '15px' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
                                    <thead>
                                        <tr>
                                            {columns.map(col => (
                                                <th key={col} style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {col.replace('_', ' ')}
                                                </th>
                                            ))}
                                            <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.length > 0 ? filteredRows.map((row, idx) => (
                                            <tr key={idx} style={{ transition: '0.2s', backgroundColor: idx % 2 === 0 ? '#f8fafc' : 'white' }}>
                                                {columns.map(col => (
                                                    <td key={col} style={{ padding: '20px 15px', fontSize: '0.9rem', color: '#334155', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', wordBreak: 'break-all' }}>
                                                        {col === 'is_break' ? (row[col] ? 'Yes' : 'No') : row[col]}
                                                    </td>
                                                ))}
                                                <td style={{ padding: '20px 15px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleEdit(row, resourceType)}
                                                            title="Edit Record"
                                                            style={{
                                                                background: '#eff6ff', color: '#2563eb', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = 'white'; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                                                        >
                                                            <span style={{ fontSize: '18px' }}>✏️</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(row, resourceType)}
                                                            title="Delete Record"
                                                            style={{
                                                                background: '#fef2f2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                                                        >
                                                            <span style={{ fontSize: '18px' }}>🗑️</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={columns.length + 1} style={{ padding: '60px', color: '#94a3b8', textAlign: 'center', fontWeight: '500', fontSize: '1.1rem' }}>
                                                    No records found matching "{term}".
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
                {activeCategory === 'LAB_ROOMS' && null /* closed above */}
            </div>
            {renderModalForm()}
        </div>
    );
}

export default Manage;