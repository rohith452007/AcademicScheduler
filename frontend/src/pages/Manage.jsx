import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { useNavigate } from 'react-router-dom';

function Manage() {
    const [view, setView] = useState('dashboard'); // dashboard | resources
    const [activeCategory, setActiveCategory] = useState('ACADEMIC'); // ACADEMIC | CLASSES | RESOURCES | COURSES

    // Store data for all resources
    const [data, setData] = useState({
        program: [], year: [], semester: [], branch: [],
        section: [], subsection: [],
        faculty: [], room: [],
        course: [], 'faculty-course': []
    });

    const [showModal, setShowModal] = useState(null);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Configuration for Categories and their Resources
    const categories = {
        'ACADEMIC': { title: 'ACADEMIC STRUCTURE', resources: ['program', 'year', 'semester', 'branch'] },
        'CLASSES': { title: 'CLASSES & SECTIONS', resources: ['section', 'subsection'] },
        'RESOURCES': { title: 'RESOURCES (FACULTY/ROOMS)', resources: ['faculty', 'room'] },
        'COURSES': { title: 'COURSES & CURRICULUM', resources: ['course', 'course-branch', 'faculty-course'] }
    };

    const resourceColumns = {
        'program': ['program_id', 'program_name'],
        'year': ['year_id', 'year_name', 'program_name'],
        'semester': ['semester_id', 'semester_number', 'year_name', 'program_name'],
        'branch': ['branch_id', 'branch_name', 'program_name'],
        'section': ['section_id', 'section_name', 'branch_name', 'semester_number', 'program_name'],
        'subsection': ['subsection_id', 'subsection_name', 'section_name', 'branch_name', 'semester_number', 'program_name'],
        'faculty': ['faculty_id', 'faculty_name', 'faculty_short', 'email', 'max_hours_per_week'],
        'room': ['room_id', 'room_name', 'room_type', 'capacity'],
        'course': ['course_code', 'course_name', 'semester_number', 'theory_hours', 'lab_hours', 'tutorial_hours'],
        'course-branch': ['program_name', 'branch_name', 'course_name', 'course_code'],
        'faculty-course': ['faculty_name', 'course_name', 'course_code', 'faculty_id']
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        if (view === 'resources') {
            fetchCategoryData();
        }
    }, [activeCategory, view]);

    useEffect(() => {
        console.log('DEBUG DATA STATE:', {
            activeCategory,
            programs: data.program ? data.program.length : 0,
            semesters: data.semester ? data.semester.length : 0,
            semesterSample: data.semester ? data.semester.slice(0, 2) : [],
            subsections: data.subsection ? data.subsection.length : 0,
            subsectionSample: data.subsection ? data.subsection.slice(0, 2) : []
        });
    }, [data, activeCategory]);

    const fetchCategoryData = async () => {
        try {
            let resourcesToFetch = [...categories[activeCategory].resources];

            // Fetch dependencies for dropdowns in specific categories
            if (activeCategory === 'CLASSES') {
                resourcesToFetch.push('program', 'branch', 'semester', 'year');
            }
            if (activeCategory === 'COURSES') {
                resourcesToFetch.push('program', 'branch', 'faculty');
            }

            // Remove duplicates
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
                    default: res = { data: [] };
                }
                newData[r] = Array.isArray(res.data) ? res.data : [];
            }));


            console.log('Fetched Data:', newData);
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
            switch (showModal) {
                case 'program': await adminService.createProgram(formData); break;
                case 'year': await adminService.createYear(formData); break;
                case 'semester': await adminService.createSemester(formData); break;
                case 'branch': await adminService.createBranch(formData); break;
                case 'section': await adminService.createSection(formData); break;
                case 'subsection': await adminService.createSubsection({ subsection_name: formData.subsection_name, section_id: formData.section_id }); break;
                case 'faculty': await adminService.createFaculty(formData); break;
                case 'room': await adminService.createRoom(formData); break;
                case 'faculty-course': await adminService.assignFaculty(formData); break;
                case 'course-branch': await adminService.assignCourseBranch(formData); break;
                case 'course':
                    await adminService.createCourse({
                        course_name: formData.name,
                        course_code: formData.code,
                        semester_number: formData.semester_number,
                        is_open_elective: formData.is_open_elective ? 1 : 0,
                        components: {
                            THEORY: parseInt(formData.theory_hours || 0),
                            LAB: parseInt(formData.lab_hours || 0),
                            TUTORIAL: parseInt(formData.tutorial_hours || 0)
                        }
                    });
                    break;
            }
            setMessage('Added successfully!');
            setFormData({});
            setShowModal(null);
            fetchCategoryData();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Error adding item.';
            setMessage(errMsg);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const renderModalForm = () => {
        if (!showModal) return null;

        let content;
        switch (showModal) {
            case 'program':
                content = (
                    <>
                        <label>Program Name:</label> <input name="program_name" placeholder="E.g. B.Tech" onChange={handleInputChange} required />
                    </>
                ); break;
            case 'year':
                content = (
                    <>
                        <label>Year Name:</label> <input name="year_name" placeholder="E.g. 1st Year" onChange={handleInputChange} required />
                        <label>Program:</label>
                        <select name="program_id" onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Program</option>
                            {data.program && data.program.map(prog => (
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
                        <label>Semester Number:</label> <input name="semester_number" type="number" onChange={handleInputChange} required />

                        <label>Program:</label>
                        <select
                            name="program_id"
                            onChange={(e) => {
                                handleInputChange(e);
                                setFormData(prev => ({ ...prev, program_id: e.target.value, year_id: '' }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Year:</label>
                        <select
                            name="year_id"
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Year</option>
                            {data.year && data.year
                                .filter(y => y.program_id == formData.program_id)
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
                        <label>Branch Name:</label> <input name="branch_name" onChange={handleInputChange} required />
                        <label>Program:</label>
                        <select name="program_id" onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Program</option>
                            {data.program && data.program.map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>
                    </>
                ); break;
            case 'section':
                console.log('DEBUG SECTION: formData.program_id =', formData.program_id);
                console.log('DEBUG SECTION: data.semester sample =', data.semester ? data.semester.slice(0, 3) : 'No Data');
                content = (
                    <>
                        <label>Section Name:</label> <input name="section_name" onChange={handleInputChange} required />

                        <label>Program:</label>
                        <select
                            name="program_id"
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
                            {data.program && data.program.map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Branch:</label>
                        <select
                            name="branch_id"
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Branch</option>
                            {data.branch && data.branch
                                .filter(b => b.program_id == formData.program_id)
                                .map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        {b.branch_name}
                                    </option>
                                ))
                            }
                        </select>

                        <label>Semester:</label>
                        <select
                            name="semester_id"
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Semester</option>
                            {data.semester && data.semester
                                .filter(s => s.program_id == formData.program_id)
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
                        <label>Subsection Name:</label> <input name="subsection_name" onChange={handleInputChange} required />

                        <label>Program:</label>
                        <select
                            name="program_id"
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
                            {data.program && data.program.map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Branch:</label>
                        <select
                            name="branch_id"
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Branch</option>
                            {data.branch && data.branch
                                .filter(b => b.program_id == formData.program_id)
                                .map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        {b.branch_name}
                                    </option>
                                ))
                            }
                        </select>

                        <label>Semester:</label>
                        <select
                            name="semester_id"
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Semester</option>
                            {data.semester && data.semester
                                .filter(s => s.program_id == formData.program_id)
                                .map(s => (
                                    <option key={s.semester_id} value={s.semester_id}>
                                        Sem {s.semester_number} ({s.year_name})
                                    </option>
                                ))
                            }
                        </select>

                        <label>Section:</label>
                        <select
                            name="section_id"
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.branch_id || !formData.semester_id}
                        >
                            <option value="">Select Section</option>
                            {data.section && data.section
                                .filter(sec => sec.branch_id == formData.branch_id && sec.semester_id == formData.semester_id)
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
                        <label>Faculty ID:</label> <input name="faculty_id" onChange={handleInputChange} required />
                        <label>Name:</label> <input name="faculty_name" onChange={handleInputChange} required />
                        <label>Short Name:</label> <input name="faculty_short" onChange={handleInputChange} />
                        <label>Email:</label> <input name="email" type="email" onChange={handleInputChange} required />
                        <label>Max Hours/Week:</label> <input name="max_hours_per_week" type="number" onChange={handleInputChange} />
                    </>
                ); break;
            case 'room':
                content = (
                    <>
                        <label>Room Name/No:</label> <input name="room_name" onChange={handleInputChange} required />
                        <label>Type:</label>
                        <select name="room_type" onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Type</option>
                            <option value="CLASSROOM">CLASSROOM</option>
                            <option value="LAB">LAB</option>
                        </select>
                        <label>Capacity:</label> <input name="capacity" type="number" onChange={handleInputChange} required />
                    </>
                ); break;
            case 'faculty-course':
                content = (
                    <>
                        <label>Faculty:</label>
                        <select name="faculty_id" onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Faculty</option>
                            {data.faculty && data.faculty.map(f => (
                                <option key={f.faculty_id} value={f.faculty_id}>
                                    {f.faculty_name} ({f.faculty_id})
                                </option>
                            ))}
                        </select>

                        <label>Course:</label>
                        <select name="course_code" onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Course</option>
                            {data.course && data.course.map(c => (
                                <option key={c.course_code} value={c.course_code}>
                                    {c.course_name} ({c.course_code})
                                </option>
                            ))}
                        </select>
                    </>
                ); break;
            case 'course-branch':
                content = (
                    <>
                        <label>Program:</label>
                        <select
                            name="program_id"
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, program_id: e.target.value, branch_id: '' }));
                            }}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        >
                            <option value="">Select Program</option>
                            {data.program && data.program.map(prog => (
                                <option key={prog.program_id} value={prog.program_id}>
                                    {prog.program_name}
                                </option>
                            ))}
                        </select>

                        <label>Branch:</label>
                        <select
                            name="branch_id"
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            disabled={!formData.program_id}
                        >
                            <option value="">Select Branch</option>
                            {data.branch && data.branch
                                .filter(b => b.program_id == formData.program_id)
                                .map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        {b.branch_name}
                                    </option>
                                ))
                            }
                        </select>

                        <label>Course:</label>
                        <select name="course_code" onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Course</option>
                            {data.course && data.course.map(c => (
                                <option key={c.course_code} value={c.course_code}>
                                    {c.course_name} ({c.course_code})
                                </option>
                            ))}
                        </select>
                    </>
                ); break;
            case 'course':
                content = (
                    <>
                        <label>Course Name:</label> <input name="name" onChange={handleInputChange} required />
                        <label>Course Code:</label> <input name="code" onChange={handleInputChange} required />
                        <label>Semester Number:</label>
                        <select name="semester_number" onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>

                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <input type="checkbox" name="is_open_elective" onChange={(e) => setFormData({ ...formData, is_open_elective: e.target.checked })} style={{ width: 'auto', marginRight: '10px' }} />
                                Is Open Elective?
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div><label>Theory Hrs:</label><input name="theory_hours" type="number" defaultValue="0" onChange={handleInputChange} /></div>
                            <div><label>Lab Hrs:</label><input name="lab_hours" type="number" defaultValue="0" onChange={handleInputChange} /></div>
                            <div><label>Tutorial Hrs:</label><input name="tutorial_hours" type="number" defaultValue="0" onChange={handleInputChange} /></div>
                        </div>
                    </>
                ); break;
            default: content = <p>Unknown form type</p>;
        }

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
                    <h3>Add New {showModal.toUpperCase()}</h3>

                    {message && (
                        <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: message.toLowerCase().includes('success') ? '#d4edda' : '#f8d7da', color: message.toLowerCase().includes('success') ? '#155724' : '#721c24', borderRadius: '4px' }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleAddSubmit}>
                        {content}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={() => { setShowModal(null); setMessage(''); }} style={{ backgroundColor: '#6c757d' }}>Cancel</button>
                            <button type="submit" style={{ backgroundColor: '#007bff' }}>Save</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    if (view === 'dashboard') {
        return (
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2>Admin Dashboard</h2>
                    <button onClick={handleLogout} style={{ backgroundColor: '#dc3545' }}>Logout</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                    <button onClick={() => setView('resources')} style={{ padding: '40px', fontSize: '20px', backgroundColor: '#007bff' }}>
                        Manage Academic Data <br /><span style={{ fontSize: '0.8em', opacity: 0.8 }}>Programs, Courses, Faculty, Rooms</span>
                    </button>
                    <button disabled style={{ padding: '40px', fontSize: '20px', backgroundColor: '#6c757d', cursor: 'not-allowed' }}>
                        Generate Timetable
                    </button>
                    <button disabled style={{ padding: '40px', fontSize: '20px', backgroundColor: '#6c757d', cursor: 'not-allowed' }}>
                        View Timetables
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Admin Configuration</h2>
                <div>
                    <button onClick={() => setView('dashboard')} style={{ marginRight: '10px', backgroundColor: '#28a745' }}>Dashboard</button>
                    <button onClick={handleLogout} style={{ backgroundColor: '#dc3545' }}>Logout</button>
                </div>
            </div>

            
            <div style={{ borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
                {Object.keys(categories).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '10px 20px',
                            marginRight: '5px',
                            border: 'none',
                            borderBottom: activeCategory === cat ? '3px solid #007bff' : 'none',
                            backgroundColor: 'transparent',
                            color: activeCategory === cat ? '#007bff' : '#333',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            borderRadius: 0
                        }}
                    >
                        {categories[cat].title}
                    </button>
                ))}
            </div>

            <div>
                {categories[activeCategory].resources.map(resourceType => (
                    <div key={resourceType} style={{ marginBottom: '40px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>

                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{resourceType.replace('-', ' ')}s</h3>
                            <button
                                onClick={() => { setFormData({}); setShowModal(resourceType); setMessage(''); }}
                                style={{ fontSize: '0.8em', padding: '8px 16px' }}
                            >
                                ADD {resourceType.toUpperCase().replace('-', ' ')}
                            </button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', color: '#495057' }}>
                                    {resourceColumns[resourceType].map(col => (
                                        <th key={col} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', textTransform: 'capitalize' }}>
                                            {col.replace('_', ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data[resourceType] && data[resourceType].length > 0 ? (
                                    data[resourceType].map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            {resourceColumns[resourceType].map(col => (
                                                <td key={col} style={{ padding: '12px' }}>{row[col]}</td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={resourceColumns[resourceType].length} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                            No data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {renderModalForm()}

        </div>
    );
}

export default Manage;
