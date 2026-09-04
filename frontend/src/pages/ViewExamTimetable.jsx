import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import jsPDF from 'jspdf';

// Roman numeral converter for semesters
function getRomanSemester(num) {
    const map = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
    return map[num] || String(num);
}

// Format 24h time to 12h (e.g. '09:30:00' -> '09:30 AM')
function formatTime12(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.toString().split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    return `${hStr}:${m} ${ampm}`;
}

export default function ViewExamTimetable() {
    const navigate = useNavigate();
    const timetableRef = useRef(null);

    const [timetableData, setTimetableData] = useState([]);
    const [headerInfo, setHeaderInfo] = useState({
        title: 'End Semester Examination Time Table',
        date_range: '',
        days_range: '',
        institute_name: 'PDPM-IIITDM Jabalpur',
        academic_year: 'AY 2025-26',
        semester_label: 'Even Semester'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Available courses for 'Add Entry' modal
    const [availableCourses, setAvailableCourses] = useState([]);
    // Add Entry modal state
    const [addModal, setAddModal] = useState(null); // { exam_slot_id, exam_date, exam_type, slot_label }
    const [addSearch, setAddSearch] = useState('');
    const [addSelected, setAddSelected] = useState(null); // selected course object
    const [addInstructor, setAddInstructor] = useState('');
    const [isAddSaving, setIsAddSaving] = useState(false);

    const userRole = localStorage.getItem('userRole');

    // Personal vs Full View Filters
    const [viewType, setViewType] = useState(() => {
        if (userRole === 'student') return 'STUDENT';
        if (userRole === 'faculty') return 'FACULTY';
        return 'FULL';
    });
    const [filterProgramId, setFilterProgramId] = useState('');
    const [filterSemesterId, setFilterSemesterId] = useState('');
    const [filterFacultyCode, setFilterFacultyCode] = useState('');

    // Fetch exam timetable data
    const fetchExamData = async (draftMode = false) => {
        setLoading(true);
        setError('');
        try {
            const res = await examService.getExamTimetable(draftMode);
            setTimetableData(res.data.entries || []);
            setHeaderInfo(res.data.header || {});
            setEditMode(draftMode);
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Failed to fetch exam timetable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamData(false);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (editMode) {
                e.preventDefault();
                e.returnValue = "You have unsaved exam timetable changes. Leaving the page will save/discard your changes depending on your action.";
                return e.returnValue;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [editMode]);

    const handleBack = async () => {
        if (editMode) {
            const confirmSave = window.confirm("You are leaving edit mode. Click OK to Publish changes, or Cancel to Discard draft.");
            if (confirmSave) {
                await handleSaveLive();
            } else {
                await handleCancelEdit();
            }
        }
        const role = localStorage.getItem('userRole');
        if (role === 'student') navigate('/student-manage');
        else if (role === 'faculty') navigate('/faculty-manage');
        else navigate('/manage', { state: { activeCategory: 'EXAMINATIONS' } });
    };

    // Session Management Handlers
    const handleStartEdit = async () => {
        setIsSaving(true);
        try {
            await examService.startExamEditSession();
            await fetchExamData(true);
            // Fetch available courses for the add-entry modal
            try {
                const r = await examService.getAvailableCourses();
                setAvailableCourses(r.data.courses || []);
            } catch (_) { /* non-fatal */ }
        } catch (err) {
            alert('Failed to start edit session: ' + (err?.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveLive = async () => {
        if (!window.confirm('Are you sure you want to publish these exam timetable changes live?')) return;
        setIsSaving(true);
        try {
            await examService.saveExamEditSession();
            await fetchExamData(false);
            alert('Exam Timetable published successfully!');
        } catch (err) {
            alert('Failed to save exam timetable: ' + (err?.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = async () => {
        if (!window.confirm('Discard all unsaved exam timetable changes?')) return;
        setIsSaving(true);
        try {
            await examService.cancelExamEditSession();
            await fetchExamData(false);
        } catch (err) {
            alert('Failed to cancel edit: ' + (err?.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEntry = async (examId, extraParams = {}) => {
        if (!window.confirm('Delete this exam entry?')) return;
        try {
            await examService.deleteExamEntry(examId, editMode, extraParams);
            await fetchExamData(editMode);
        } catch (err) {
            alert('Failed to delete entry: ' + (err?.response?.data?.error || err.message));
        }
    };

    const handleAddEntry = async () => {
        if (!addSelected || !addModal) return;
        setIsAddSaving(true);
        try {
            await examService.addExamEntry({
                exam_slot_id: addModal.exam_slot_id,
                exam_date: addModal.exam_date,
                exam_type: addModal.exam_type || 'END_SEM',
                course_id: addSelected.course_id,
                course_code: addSelected.course_code,
                program_id: addSelected.program_id,
                semester_id: addSelected.semester_id,
                instructor_names: addInstructor || addSelected.instructor_names || 'TBA',
                is_open_elective: addSelected.is_open_elective || 0
            }, true);
            setAddModal(null);
            setAddSelected(null);
            setAddSearch('');
            setAddInstructor('');
            await fetchExamData(true);
        } catch (err) {
            alert('Failed to add entry: ' + (err?.response?.data?.error || err.message));
        } finally {
            setIsAddSaving(false);
        }
    };

    const handleClearTimetable = async () => {
        if (!window.confirm('⚠️ Are you sure you want to delete the entire examination timetable? This action cannot be undone.')) return;
        setIsSaving(true);
        try {
            await examService.clearExamTimetable();
            await fetchExamData(false);
            alert('Exam Timetable deleted successfully.');
        } catch (err) {
            alert('Failed to delete timetable: ' + (err?.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };


    // PDF Export Handler
    const exportPDF = () => {
        if (!processedDays.length) return;
        setIsExporting(true);

        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const PW = pdf.internal.pageSize.getWidth();   // 297mm
            const PH = pdf.internal.pageSize.getHeight();  // 210mm
            const MARGIN = 10;
            const COL_DATE = 28;
            const COL_TIME = 38;
            const COL_CODE = 52;
            const COL_INST = PW - MARGIN * 2 - COL_DATE - COL_TIME - COL_CODE;
            const ROW_H = 7;
            const HDR_H = 6;

            let firstPage = true;

            processedDays.forEach((dayData) => {
                dayData.slots.forEach((slot) => {
                    if (!firstPage) pdf.addPage();
                    firstPage = false;

                    let y = MARGIN;

                    // Page top header
                    pdf.setFillColor(30, 58, 138);           // dark blue
                    pdf.rect(MARGIN, y, PW - MARGIN * 2, 8, 'F');
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(10);
                    pdf.setTextColor(255, 255, 255);
                    const titleLine = `${headerInfo.title || 'Examination Timetable'}  |  ${headerInfo.date_range || ''}  ${headerInfo.days_range || ''}`;
                    pdf.text(titleLine, PW / 2, y + 5.5, { align: 'center' });
                    y += 9;

                    // Institute sub-header
                    pdf.setFillColor(254, 249, 195);         // yellow
                    pdf.rect(MARGIN, y, PW - MARGIN * 2, 7, 'F');
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFontSize(9);
                    const subLine = `${headerInfo.institute_name || ''}   |   ${headerInfo.academic_year || ''}  ${headerInfo.semester_label || ''}`;
                    pdf.text(subLine, PW / 2, y + 4.8, { align: 'center' });
                    y += 8;

                    // Day + Slot banner
                    pdf.setFillColor(249, 115, 22);          // orange
                    pdf.rect(MARGIN, y, PW - MARGIN * 2, 7, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(10);
                    const isMorning = (slot.start_time || '').slice(0, 2) < '12';
                    const sessionLabel = isMorning ? 'MORNING SESSION' : 'AFTERNOON SESSION';
                    const timeStr = `${formatTime12(slot.start_time)} – ${formatTime12(slot.end_time)}`;
                    pdf.text(`${dayData.dayLabel}  |  ${dayData.formattedDate}  |  ${sessionLabel}  (${timeStr})`, PW / 2, y + 4.8, { align: 'center' });
                    y += 8;

                    // Column header row
                    pdf.setFillColor(226, 232, 240);
                    pdf.rect(MARGIN, y, PW - MARGIN * 2, HDR_H, 'F');
                    pdf.setDrawColor(0, 0, 0);
                    pdf.rect(MARGIN, y, PW - MARGIN * 2, HDR_H);   // outer border
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8);

                    let cx = MARGIN;
                    const drawColHeader = (label, w) => {
                        pdf.text(label, cx + w / 2, y + 4, { align: 'center' });
                        pdf.line(cx + w, y, cx + w, y + HDR_H);
                        cx += w;
                    };
                    drawColHeader('Date', COL_DATE);
                    drawColHeader('Time', COL_TIME);
                    drawColHeader('Course Code', COL_CODE);
                    pdf.text('Instructor', cx + COL_INST / 2, y + 4, { align: 'center' });
                    y += HDR_H;

                    //  Data rows
                    const totalSlotRows = slot.semGroups.reduce((a, g) => a + 1 + g.courses.length, 0);
                    let dateDrawn = false;
                    let dateStartY = y;

                    slot.semGroups.forEach((group) => {
                        // Check page overflow
                        const groupH = HDR_H + group.courses.length * ROW_H;
                        if (y + groupH > PH - MARGIN) {
                            // draw date and time cells for current page portion before overflow
                            if (!dateDrawn) {
                                const portionH = y - dateStartY;
                                // Date cell
                                pdf.setFillColor(125, 211, 252);
                                pdf.rect(MARGIN, dateStartY, COL_DATE, portionH, 'F');
                                pdf.setDrawColor(0, 0, 0);
                                pdf.rect(MARGIN, dateStartY, COL_DATE, portionH);
                                pdf.setFont('helvetica', 'bold');
                                pdf.setFontSize(8);
                                pdf.setTextColor(0, 0, 0);
                                pdf.text(dayData.formattedDate, MARGIN + COL_DATE / 2, dateStartY + portionH / 2 + 1, { align: 'center' });
                                // Time cell
                                const slotBgOvf = isMorning ? [187, 247, 208] : [191, 219, 254];
                                pdf.setFillColor(...slotBgOvf);
                                pdf.rect(MARGIN + COL_DATE, dateStartY, COL_TIME, portionH, 'F');
                                pdf.rect(MARGIN + COL_DATE, dateStartY, COL_TIME, portionH);
                                pdf.setFont('helvetica', 'bold');
                                pdf.setFontSize(7.5);
                                pdf.text(timeStr, MARGIN + COL_DATE + COL_TIME / 2, dateStartY + portionH / 2 + 1, { align: 'center' });
                                dateDrawn = true;
                            }
                            pdf.addPage();
                            y = MARGIN;
                            dateStartY = y;
                            dateDrawn = false;
                            // Repeat compact banner on continuation page
                            pdf.setFillColor(249, 115, 22);
                            pdf.rect(MARGIN, y, PW - MARGIN * 2, 6, 'F');
                            pdf.setTextColor(255, 255, 255);
                            pdf.setFontSize(9);
                            pdf.text(`${dayData.dayLabel}  •  ${dayData.formattedDate}  •  ${sessionLabel} (continued)`, PW / 2, y + 4.2, { align: 'center' });
                            y += 7;
                            dateStartY = y;
                        }

                        // Semester group header row (cyan)
                        pdf.setFillColor(34, 211, 238);
                        pdf.rect(MARGIN + COL_DATE + COL_TIME, y, COL_CODE + COL_INST, HDR_H, 'F');
                        pdf.setDrawColor(0, 0, 0);
                        pdf.rect(MARGIN, y, PW - MARGIN * 2, HDR_H);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(8);
                        pdf.setTextColor(0, 0, 0);
                        const gx = MARGIN + COL_DATE + COL_TIME;
                        pdf.text(group.headerText, gx + (COL_CODE + COL_INST) / 2, y + 4, { align: 'center' });
                        // vertical dividers
                        pdf.line(MARGIN + COL_DATE, y, MARGIN + COL_DATE, y + HDR_H);
                        pdf.line(MARGIN + COL_DATE + COL_TIME, y, MARGIN + COL_DATE + COL_TIME, y + HDR_H);
                        pdf.line(MARGIN + COL_DATE + COL_TIME + COL_CODE, y, MARGIN + COL_DATE + COL_TIME + COL_CODE, y + HDR_H);
                        y += HDR_H;

                        // Course rows — fill only the Course Code + Instructor columns
                        group.courses.forEach((course) => {
                            const rx = MARGIN + COL_DATE + COL_TIME;
                            const rightW = COL_CODE + COL_INST;
                            // White fill only in right columns
                            pdf.setFillColor(255, 255, 255);
                            pdf.rect(rx, y, rightW, ROW_H, 'F');
                            // Row border (full width, no fill)
                            pdf.setDrawColor(203, 213, 225);
                            pdf.rect(MARGIN, y, PW - MARGIN * 2, ROW_H);
                            pdf.setFont('helvetica', 'bold');
                            pdf.setFontSize(8);
                            pdf.setTextColor(0, 0, 0);
                            pdf.text(course.course_code || '', rx + COL_CODE / 2, y + 4.5, { align: 'center' });
                            pdf.setFont('helvetica', 'normal');
                            pdf.text(course.instructor_names || 'TBA', rx + COL_CODE + 3, y + 4.5);
                            // vertical dividers
                            pdf.setDrawColor(0, 0, 0);
                            pdf.line(MARGIN + COL_DATE, y, MARGIN + COL_DATE, y + ROW_H);
                            pdf.line(MARGIN + COL_DATE + COL_TIME, y, MARGIN + COL_DATE + COL_TIME, y + ROW_H);
                            pdf.line(MARGIN + COL_DATE + COL_TIME + COL_CODE, y, MARGIN + COL_DATE + COL_TIME + COL_CODE, y + ROW_H);
                            y += ROW_H;
                        });
                    });

                    // Draw merged Date cell spanning all data rows on this page
                    if (!dateDrawn) {
                        const dateCellH = y - dateStartY;
                        pdf.setFillColor(125, 211, 252);
                        pdf.rect(MARGIN, dateStartY, COL_DATE, dateCellH, 'F');
                        pdf.setDrawColor(0, 0, 0);
                        pdf.rect(MARGIN, dateStartY, COL_DATE, dateCellH);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(9);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(dayData.formattedDate, MARGIN + COL_DATE / 2, dateStartY + dateCellH / 2 + 1, { align: 'center' });

                        // Draw Time cell spanning full slot rows
                        const slotBg = isMorning ? [187, 247, 208] : [191, 219, 254];
                        pdf.setFillColor(...slotBg);
                        pdf.rect(MARGIN + COL_DATE, dateStartY, COL_TIME, dateCellH, 'F');
                        pdf.rect(MARGIN + COL_DATE, dateStartY, COL_TIME, dateCellH);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(7.5);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(timeStr, MARGIN + COL_DATE + COL_TIME / 2, dateStartY + dateCellH / 2 + 1, { align: 'center' });
                    }
                });
            });

            const fileName = `Exam_Timetable_${(headerInfo.academic_year || 'TT').replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);
        } catch (err) {
            console.error('Export PDF error:', err);
            alert('Failed to export PDF: ' + err.message);
        } finally {
            setIsExporting(false);
        }
    };


    // Filtered entries according to view mode (Full vs Student Personal vs Faculty Personal)
    const activeEntries = React.useMemo(() => {
        if (viewType === 'FULL') return timetableData;
        if (viewType === 'STUDENT') {
            return timetableData.filter(e => {
                if (filterProgramId && String(e.program_id) !== String(filterProgramId)) return false;
                if (filterSemesterId && String(e.semester_id) !== String(filterSemesterId)) return false;
                return true;
            });
        }
        if (viewType === 'FACULTY') {
            if (!filterFacultyCode) return timetableData;
            const code = filterFacultyCode.toLowerCase().trim();
            return timetableData.filter(e => (e.instructor_names || '').toLowerCase().includes(code));
        }
        return timetableData;
    }, [timetableData, viewType, filterProgramId, filterSemesterId, filterFacultyCode]);

    // Derived lists for dropdown filters (filtered by program if selected to prevent duplicates)
    const programList = React.useMemo(() => {
        const map = new Map();
        timetableData.forEach(e => {
            if (e.program_id && e.program_name) map.set(String(e.program_id), e.program_name);
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [timetableData]);

    const semesterList = React.useMemo(() => {
        const filtered = filterProgramId
            ? timetableData.filter(e => String(e.program_id) === String(filterProgramId))
            : timetableData;
        const map = new Map();
        filtered.forEach(e => {
            if (e.semester_id && e.semester_number) {
                map.set(String(e.semester_id), { id: String(e.semester_id), num: e.semester_number });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.num - b.num);
    }, [timetableData, filterProgramId]);

    const facultyList = React.useMemo(() => {
        const set = new Set();
        timetableData.forEach(e => {
            if (e.instructor_names) {
                e.instructor_names.split('+').forEach(f => {
                    const trimmed = f.trim();
                    if (trimmed && trimmed !== 'TBA') set.add(trimmed);
                });
            }
        });
        return Array.from(set).sort();
    }, [timetableData]);

    // Process and Group Timetable Entries by Day & Slot
    const processedDays = React.useMemo(() => {
        if (!activeEntries.length) return [];

        const getRawDateStr = (dateVal) => {
            if (!dateVal) return '';
            if (typeof dateVal === 'string') return dateVal.split('T')[0];
            return new Date(dateVal).toISOString().split('T')[0];
        };

        // 1. Unique Exam Dates sorted ascending
        const uniqueDates = [...new Set(activeEntries.map(e => getRawDateStr(e.exam_date)))].sort();

        return uniqueDates.map((dateStr, dayIdx) => {
            const dayNumStr = `DAY ${(dayIdx + 1).toString().padStart(2, '0')}`;
            const parts = dateStr.split('-');
            const formattedDate = parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : dateStr;

            const dayEntries = activeEntries.filter(e => getRawDateStr(e.exam_date) === dateStr);

            // Group by Slot (start_time & end_time)
            const slotMap = new Map();
            dayEntries.forEach(entry => {
                const sKey = `${entry.start_time}_${entry.end_time}_${entry.slot_name}`;
                if (!slotMap.has(sKey)) {
                    slotMap.set(sKey, {
                        slot_id: entry.exam_slot_id,
                        start_time: entry.start_time,
                        end_time: entry.end_time,
                        slot_name: entry.slot_name,
                        entries: []
                    });
                }
                slotMap.get(sKey).entries.push(entry);
            });

            const sortedSlots = Array.from(slotMap.values()).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

            return {
                dayLabel: dayNumStr,
                formattedDate,
                dateStr,
                slots: sortedSlots.map(slot => {
                    // Group entries by (program_name + semester_number)
                    const groupMap = new Map();

                    slot.entries.forEach(ent => {
                        const semLabel = ent.semester_number
                            ? `${getRomanSemester(ent.semester_number)} Semester`
                            : 'Unknown Semester';
                        const progLabel = ent.program_name || '';

                        // Build header: always include program name, e.g. "BTech V Semester", "BDes V Semester"
                        let headerText = semLabel;
                        if (progLabel && !semLabel.includes(progLabel)) {
                            headerText = `${progLabel} ${semLabel}`;
                        }

                        // Key by program_id + semester_id to keep programs separate even if same label
                        const groupKey = `${ent.program_id || progLabel}||${ent.semester_id || ent.semester_number}`;

                        if (!groupMap.has(groupKey)) {
                            groupMap.set(groupKey, { headerText, courses: [] });
                        }

                        // Deduplicate course_code within the same group
                        const group = groupMap.get(groupKey);
                        if (!group.courses.some(c => c.course_code === ent.course_code)) {
                            group.courses.push(ent);
                        }
                    });

                    // Sort groups: BTech first, then alphabetically
                    const semGroups = Array.from(groupMap.values()).sort((a, b) => {
                        if (a.headerText.startsWith('I ') || a.headerText.startsWith('II ') ||
                            a.headerText.startsWith('III ') || a.headerText.startsWith('IV ') ||
                            a.headerText.startsWith('V ') || a.headerText.startsWith('VI ') ||
                            a.headerText.startsWith('VII ') || a.headerText.startsWith('VIII ')) return -1;
                        if (b.headerText.startsWith('I ') || b.headerText.startsWith('II ') ||
                            b.headerText.startsWith('III ') || b.headerText.startsWith('IV ') ||
                            b.headerText.startsWith('V ') || b.headerText.startsWith('VI ') ||
                            b.headerText.startsWith('VII ') || b.headerText.startsWith('VIII ')) return 1;
                        return a.headerText.localeCompare(b.headerText);
                    });

                    return {
                        ...slot,
                        semGroups
                    };
                })
            };
        });
    }, [activeEntries]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            {/* Top Toolbar Navigation */}
            <div style={{ maxWidth: '1100px', margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '14px 24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', gap: '20px' }}>
                <button
                    onClick={handleBack}
                    style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', flexShrink: 0 }}
                >
                    ← Back
                </button>

                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', textAlign: 'center', flex: 1 }}>
                    Examination Timetable Portal
                </h2>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                    {localStorage.getItem('userRole') !== 'student' && localStorage.getItem('userRole') !== 'faculty' && (!editMode ? (
                        <button
                            onClick={handleStartEdit}
                            disabled={isSaving}
                            style={{ padding: '10px 18px', backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}
                        >
                            ✏️ Edit Mode
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSaveLive}
                                disabled={isSaving}
                                style={{ padding: '10px 18px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}
                            >
                                Publish Live
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                style={{ padding: '10px 18px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}
                            >
                                Discard Draft
                            </button>
                        </>
                    ))}

                    {!editMode && (
                        <button
                            onClick={exportPDF}
                            disabled={isExporting || !timetableData.length}
                            style={{ padding: '10px 18px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}
                        >
                            {isExporting ? 'Exporting PDF...' : 'Export PDF'}
                        </button>
                    )}

                    {timetableData.length > 0 && !editMode && localStorage.getItem('userRole') !== 'student' && localStorage.getItem('userRole') !== 'faculty' && (
                        <button
                            onClick={handleClearTimetable}
                            disabled={isSaving}
                            title="Delete the entire exam timetable"
                            style={{ padding: '10px 18px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            🗑️ Delete Timetable
                        </button>
                    )}
                </div>
            </div>

            {/* View Mode & Filter Controls */}
            <div style={{ maxWidth: '1100px', margin: '0 auto 20px', backgroundColor: '#ffffff', padding: '14px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>

                {/* Admin Mode Switcher */}
                {userRole === 'admin' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            VIEW MODE:
                        </span>
                        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                            <button
                                onClick={() => setViewType('FULL')}
                                style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', backgroundColor: viewType === 'FULL' ? '#2563eb' : 'transparent', color: viewType === 'FULL' ? '#ffffff' : '#64748b', transition: '0.2s' }}
                            >
                                Full Timetable
                            </button>
                            <button
                                onClick={() => setViewType('STUDENT')}
                                style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', backgroundColor: viewType === 'STUDENT' ? '#2563eb' : 'transparent', color: viewType === 'STUDENT' ? '#ffffff' : '#64748b', transition: '0.2s' }}
                            >
                                Student / Program View
                            </button>
                            <button
                                onClick={() => setViewType('FACULTY')}
                                style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', backgroundColor: viewType === 'FACULTY' ? '#2563eb' : 'transparent', color: viewType === 'FACULTY' ? '#ffffff' : '#64748b', transition: '0.2s' }}
                            >
                                Faculty Personal View
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>
                            {userRole === 'student' ? 'Student Schedule Filter' : 'Faculty Schedule Filter'}
                        </span>
                    </div>
                )}

                {/* Filter Controls for Student View */}
                {viewType === 'STUDENT' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <select
                            value={filterProgramId}
                            onChange={e => {
                                setFilterProgramId(e.target.value);
                                setFilterSemesterId('');
                            }}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600', backgroundColor: '#ffffff', color: '#0f172a', cursor: 'pointer' }}
                        >
                            <option value="">All Programs</option>
                            {programList.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>

                        <select
                            value={filterSemesterId}
                            onChange={e => setFilterSemesterId(e.target.value)}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600', backgroundColor: '#ffffff', color: '#0f172a', cursor: 'pointer' }}
                        >
                            <option value="">All Semesters</option>
                            {semesterList.map(s => (
                                <option key={s.id} value={s.id}>Semester {s.num}</option>
                            ))}
                        </select>

                        {(filterProgramId || filterSemesterId) && (
                            <button
                                onClick={() => { setFilterProgramId(''); setFilterSemesterId(''); }}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Filter Controls for Faculty View */}
                {viewType === 'FACULTY' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                            value={filterFacultyCode}
                            onChange={e => setFilterFacultyCode(e.target.value)}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600', backgroundColor: '#ffffff', color: '#0f172a', cursor: 'pointer' }}
                        >
                            <option value="">Select Faculty Code</option>
                            {facultyList.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                        {filterFacultyCode && (
                            <button
                                onClick={() => setFilterFacultyCode('')}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Clean Professional Edit Mode Notice Strip */}
            {editMode && (
                <div style={{
                    maxWidth: '1100px',
                    margin: '0 auto 20px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #ea580c',
                    borderTop: '1px solid #e2e8f0',
                    borderRight: '1px solid #e2e8f0',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                            DRAFT MODE
                        </span>
                        <span style={{ color: '#334155', fontWeight: '600', fontSize: '0.88rem' }}>
                            You are currently editing a working draft of the exam timetable. Changes will not be visible publicly until published.
                        </span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{ maxWidth: '1100px', margin: '0 auto 20px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '14px 20px', borderRadius: '12px', color: '#991b1b', fontWeight: '600' }}>
                    {error}
                </div>
            )}

            {/* Loading Indicator */}
            {loading ? (
                <div style={{ maxWidth: '1100px', margin: '60px auto', textAlign: 'center', color: '#64748b', fontSize: '1.1rem', fontWeight: '600' }}>
                    Loading Exam Timetable...
                </div>
            ) : !timetableData.length ? (
                <div style={{ maxWidth: '1100px', margin: '60px auto', textAlign: 'center', backgroundColor: '#ffffff', padding: '60px', borderRadius: '20px', color: '#64748b' }}>
                    <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '10px' }}>No Exam Timetable Scheduled Yet</h3>
                    <p style={{ margin: '0 0 20px' }}>Go to Admin Config &gt; EXAMINATIONS &gt; EXAM TIMESLOTS and click <strong>Generate Examinations Timetable</strong>.</p>
                    <button
                        onClick={() => navigate('/manage')}
                        style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Go to Admin Config
                    </button>
                </div>
            ) : (
                /* Main Printable Timetable Container */
                <div ref={timetableRef} style={{ maxWidth: '1100px', margin: '0 auto', backgroundColor: '#ffffff', border: '2px solid #000000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

                    {/* Top Main Banner Header */}
                    <div style={{ borderBottom: '2px solid #000000', backgroundColor: '#ffffff' }}>
                        {/* Title Bar */}
                        <div style={{ borderBottom: '1px solid #000000', padding: '8px 16px', textAlign: 'center', fontWeight: '700', fontSize: '1.05rem', color: '#1e3a8a' }}>
                            {headerInfo.title}: {headerInfo.date_range} <span style={{ color: '#dc2626' }}>{headerInfo.days_range}</span>
                        </div>
                        {/* Sub-Header Bar */}
                        <div style={{ backgroundColor: '#fef9c3', padding: '10px 16px', textAlign: 'center', fontWeight: '800', color: '#000000', fontSize: '1rem', lineHeight: '1.4' }}>
                            <div>{headerInfo.institute_name}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>
                                {headerInfo.academic_year} {headerInfo.semester_label}
                            </div>
                        </div>
                    </div>

                    {/* Render Each Day */}
                    {processedDays.map((dayData) => {
                        return (
                            <div key={dayData.dayLabel} style={{ borderBottom: '2px solid #000000' }}>
                                {/* DAY BANNER */}
                                <div style={{ backgroundColor: '#f97316', color: '#ffffff', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem', padding: '6px 12px', letterSpacing: '2px', borderBottom: '1px solid #000000' }}>
                                    {dayData.dayLabel}
                                </div>

                                {/* Table Layout for Slots under this Day */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #000000', fontSize: '0.85rem', fontWeight: '800' }}>
                                            <th style={{ width: '16%', padding: '6px', borderRight: '1px solid #000000', textAlign: 'center' }}>Date</th>
                                            <th style={{ width: '22%', padding: '6px', borderRight: '1px solid #000000', textAlign: 'center' }}>Time</th>
                                            <th style={{ width: '32%', padding: '6px', borderRight: '1px solid #000000', textAlign: 'center' }}>Course Code</th>
                                            <th style={{ width: '30%', padding: '6px', textAlign: 'center' }}>Instructor Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dayData.slots.map((slot, sIdx) => {
                                            const timeRangeStr = `${formatTime12(slot.start_time)} - ${formatTime12(slot.end_time)}`;
                                            const isMorning = (slot.start_time || '').startsWith('08') || (slot.start_time || '').startsWith('09');
                                            const slotBgColor = isMorning ? '#bbf7d0' : '#bfdbfe';

                                            // Count total rows in slot = semGroups.length (headers) + total courses
                                            const totalSlotRows = slot.semGroups.reduce((acc, g) => acc + 1 + g.courses.length, 0);

                                            // Count total rows for entire day for Date cell rowSpan
                                            const totalDayRows = dayData.slots.reduce((acc, s) => acc + s.semGroups.reduce((a, g) => a + 1 + g.courses.length, 0), 0);

                                            const rows = [];
                                            slot.semGroups.forEach((group, gIdx) => {
                                                const isFirstRowOfDay = (sIdx === 0 && gIdx === 0);
                                                const isFirstRowOfSlot = (gIdx === 0);

                                                // Semester header row
                                                rows.push(
                                                    <tr key={`header_${sIdx}_${gIdx}`} style={{ borderBottom: '1px solid #000000', fontSize: '0.85rem' }}>
                                                        {isFirstRowOfDay && (
                                                            <td
                                                                rowSpan={totalDayRows}
                                                                style={{ backgroundColor: '#7dd3fc', textAlign: 'center', fontWeight: '900', fontSize: '1rem', color: '#000000', borderRight: '1px solid #000000', padding: '12px', verticalAlign: 'middle' }}
                                                            >
                                                                {dayData.formattedDate}
                                                            </td>
                                                        )}
                                                        {isFirstRowOfSlot && (
                                                            <td
                                                                rowSpan={totalSlotRows}
                                                                style={{ backgroundColor: slotBgColor, textAlign: 'center', fontWeight: '800', fontSize: '0.9rem', color: '#000000', borderRight: '1px solid #000000', padding: '8px', verticalAlign: 'middle' }}
                                                            >
                                                                <div>{timeRangeStr}</div>
                                                                {editMode && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setAddModal({
                                                                                exam_slot_id: slot.slot_id,
                                                                                exam_date: dayData.dateStr,
                                                                                slot_label: `${dayData.formattedDate} (${timeRangeStr})`,
                                                                                exam_type: slot.entries[0]?.slot_exam_type || 'END_SEM'
                                                                            });
                                                                            setAddSelected(null);
                                                                            setAddSearch('');
                                                                            setAddInstructor('');
                                                                        }}
                                                                        style={{
                                                                            marginTop: '8px',
                                                                            backgroundColor: '#16a34a',
                                                                            color: '#ffffff',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            padding: '4px 10px',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '700',
                                                                            cursor: 'pointer',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px'
                                                                        }}
                                                                        title="Add an unscheduled course to this slot"
                                                                    >
                                                                        + Add Course
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )}
                                                        <td
                                                            colSpan={2}
                                                            style={{ backgroundColor: '#22d3ee', textAlign: 'center', fontWeight: '900', fontSize: '0.9rem', color: '#000000', padding: '5px 12px', borderLeft: '1px solid #000000' }}
                                                        >
                                                            {group.headerText}
                                                        </td>
                                                    </tr>
                                                );

                                                // Course rows under this semester group
                                                group.courses.forEach((courseItem, cIdx) => {
                                                    rows.push(
                                                        <tr key={courseItem.exam_id || `course_${sIdx}_${gIdx}_${cIdx}`} style={{ borderBottom: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                                                            <td style={{ textAlign: 'center', fontWeight: '800', color: '#000000', borderRight: '1px solid #000000', borderLeft: '1px solid #000000', padding: '6px 12px' }}>
                                                                {courseItem.course_code}
                                                            </td>
                                                            <td style={{ textAlign: 'center', fontWeight: '700', color: '#000000', padding: '6px 12px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span>{courseItem.instructor_names || 'TBA'}</span>
                                                                    {editMode && (
                                                                        <button
                                                                            onClick={() => handleDeleteEntry(courseItem.exam_id, {
                                                                                course_code: courseItem.course_code,
                                                                                program_id: courseItem.program_id,
                                                                                semester_id: courseItem.semester_id,
                                                                                exam_slot_id: courseItem.exam_slot_id
                                                                            })}
                                                                            title="Remove this exam entry"
                                                                            style={{
                                                                                backgroundColor: '#ef4444',
                                                                                color: '#ffffff',
                                                                                border: 'none',
                                                                                borderRadius: '5px',
                                                                                padding: '2px 7px',
                                                                                fontSize: '0.72rem',
                                                                                fontWeight: '700',
                                                                                cursor: 'pointer',
                                                                                marginLeft: '10px',
                                                                                opacity: 0.85,
                                                                                flexShrink: 0
                                                                            }}
                                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; }}
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            });
                                            return rows;
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}

                </div>
            )}

            {/* Add Course Modal */}
            {addModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        maxWidth: '520px',
                        width: '100%',
                        padding: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                                + Add Course to Slot
                            </h3>
                            <button
                                onClick={() => setAddModal(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>
                            Slot: <span style={{ color: '#0284c7' }}>{addModal.slot_label}</span>
                        </div>

                        {/* Filter unscheduled courses strictly by course_code + program_id + semester_id */}
                        {(() => {
                            const scheduledKeys = new Set(timetableData.map(e => `${e.course_code}_${e.program_id}_${e.semester_id}`));
                            const unscheduled = availableCourses.filter(c => !scheduledKeys.has(`${c.course_code}_${c.program_id}_${c.semester_id}`));

                            const filtered = unscheduled.filter(c => {
                                const q = addSearch.toLowerCase().trim();
                                if (!q) return true;
                                return (c.course_code || '').toLowerCase().includes(q) ||
                                    (c.course_name || '').toLowerCase().includes(q) ||
                                    (c.program_name || '').toLowerCase().includes(q);
                            });

                            if (unscheduled.length === 0) {
                                return (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#16a34a', fontWeight: '700', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                                        ✅ All available courses are already scheduled in the timetable!
                                    </div>
                                );
                            }

                            return (
                                <div>
                                    <div style={{ marginBottom: '14px' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                                            SELECT UNSCHEDULED COURSE ({unscheduled.length} remaining)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search course code or name..."
                                            value={addSearch}
                                            onChange={e => setAddSearch(e.target.value)}
                                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '10px' }}
                                        />
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                            {filtered.length === 0 ? (
                                                <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                    No unscheduled course matches "{addSearch}"
                                                </div>
                                            ) : (
                                                filtered.map(c => {
                                                    const isSel = addSelected && addSelected.course_id === c.course_id && addSelected.program_id === c.program_id && addSelected.semester_id === c.semester_id;
                                                    return (
                                                        <div
                                                            key={`${c.course_id}_${c.program_id}_${c.semester_id}`}
                                                            onClick={() => {
                                                                setAddSelected(c);
                                                                setAddInstructor(c.instructor_names || 'TBA');
                                                            }}
                                                            style={{
                                                                padding: '10px 14px',
                                                                cursor: 'pointer',
                                                                backgroundColor: isSel ? '#e0f2fe' : '#ffffff',
                                                                borderBottom: '1px solid #f1f5f9',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <div>
                                                                <span style={{ fontWeight: '800', color: '#0f172a', marginRight: '8px' }}>{c.course_code}</span>
                                                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{c.course_name}</span>
                                                            </div>
                                                            <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#3b82f6' }}>
                                                                {c.program_name} Sem {c.semester_number}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {addSelected && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                                                INSTRUCTOR NAME(S)
                                            </label>
                                            <input
                                                type="text"
                                                value={addInstructor}
                                                onChange={e => setAddInstructor(e.target.value)}
                                                placeholder="e.g. AKK, SNS, TBA"
                                                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                        <button
                                            onClick={() => setAddModal(null)}
                                            style={{ padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddEntry}
                                            disabled={!addSelected || isAddSaving}
                                            style={{
                                                padding: '9px 20px',
                                                backgroundColor: addSelected ? '#16a34a' : '#94a3b8',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '700',
                                                cursor: addSelected ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {isAddSaving ? 'Adding...' : 'Add to Timetable'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}