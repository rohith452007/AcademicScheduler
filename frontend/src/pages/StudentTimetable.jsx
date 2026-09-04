import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SEM_COLORS = [
    { header: '#fef3c7', text: '#92400e', border: '#f59e0b' },
    { header: '#dcfce7', text: '#166534', border: '#10b981' },
    { header: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    { header: '#fee2e2', text: '#991b1b', border: '#ef4444' },
    { header: '#f3e8ff', text: '#6b21a8', border: '#8b5cf6' },
];

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const isBreak = (s) => s && (s.is_break === 1 || s.is_break === true || s.is_break === "1");

export default function StudentTimetable() {
    const navigate = useNavigate();
    const timetableRef = useRef(null);

    // Data states
    const [allTimeSlots, setAllTimeSlots] = useState([]);
    const [timetableData, setTimetableData] = useState([]);
    const [allSemesters, setAllSemesters] = useState([]);
    const [allSections, setAllSections] = useState([]);
    const [allPrograms, setAllPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState("");

    // View filter states
    const [viewMode, setViewMode] = useState("section"); // "master" or "section"
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [slotsR, ttR, semR, secR, progR] = await Promise.all([
                adminService.getTimeSlots(),
                adminService.getMasterTimetable(),
                adminService.getSemesters(),
                adminService.getSections(),
                adminService.getPrograms(),
            ]);
            setAllTimeSlots(slotsR.data || []);
            setTimetableData(ttR.data.master_entries || []);
            setAllSemesters(semR.data || []);
            setAllSections(secR.data || []);
            setAllPrograms(progR.data || []);
        } catch (e) {
            console.error(e);
            setError("Failed to load timetable data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleExport = async () => {
        if (!timetableRef.current) return;
        setIsExporting(true);
        try {
            const dayEls = timetableRef.current.querySelectorAll(".day-container");
            if (!dayEls.length) {
                alert("Nothing to export");
                return;
            }
            let pdf = null;
            for (let i = 0; i < dayEls.length; i++) {
                const canvas = await html2canvas(dayEls[i], {
                    scale: 1.5,
                    useCORS: true,
                    backgroundColor: "#fff",
                    logging: false
                });
                const img = canvas.toDataURL("image/jpeg", 0.7);
                const wPt = canvas.width * 0.75, hPt = canvas.height * 0.75;
                if (i === 0) {
                    pdf = new jsPDF({
                        orientation: wPt > hPt ? "landscape" : "portrait",
                        unit: "pt",
                        format: [wPt, hPt]
                    });
                } else {
                    pdf.addPage([wPt, hPt], wPt > hPt ? "landscape" : "portrait");
                }
                pdf.addImage(img, "JPEG", 0, 0, wPt, hPt, undefined, "FAST");
            }
            if (pdf) {
                const titleLabel = viewMode === "master" ? "Master" : `Section_${selectedSection || "Timetable"}`;
                pdf.save(`Timetable_${titleLabel}_${new Date().toISOString().split("T")[0]}.pdf`);
            }
        } catch (e) {
            alert("Export failed: " + (e?.message || "error"));
        } finally {
            setIsExporting(false);
        }
    };

    // Render table rows for sections (master or selected)
    const renderRows = (daySlots, semEntries, sections, theme) => {
        const electiveSlotIds = [...new Set(
            semEntries.filter(e => e.is_open_elective === 1).map(e => e.timeslot_id)
        )];

        return sections.map(secObj => {
            const secName = secObj.section_name;
            const cells = [];

            for (let i = 0; i < daySlots.length; i++) {
                const slot = daySlots[i];

                // Open Elective slot
                if (electiveSlotIds.includes(slot.timeslot_id)) {
                    const getOesForSectionAndSlot = (secId, sId) => {
                        return [...new Map(
                            semEntries
                                .filter(e => e.timeslot_id === sId && e.section_id === secId && e.is_open_elective === 1)
                                .map(e => [e.course_code + e.room_id + e.component_type, e])
                        ).values()];
                    };

                    const getOeKeyForSection = (secId, sId) => {
                        const list = getOesForSectionAndSlot(secId, sId);
                        return list.map(e => e.course_code).sort().join(',');
                    };

                    const thisOeKey = getOeKeyForSection(secObj.section_id, slot.timeslot_id);
                    const isThisSectionInOe = thisOeKey !== '';

                    if (isThisSectionInOe) {
                        let span = 1;
                        const sectionOes = getOesForSectionAndSlot(secObj.section_id, slot.timeslot_id);
                        const isLabSlot = sectionOes.some(el => el.component_type === "LAB");

                        if (isLabSlot) {
                            while (true) {
                                const nxt = daySlots[i + span];
                                if (!nxt || isBreak(nxt)) break;
                                const nxtOeKey = getOeKeyForSection(secObj.section_id, nxt.timeslot_id);
                                if (nxtOeKey !== thisOeKey) break;
                                span++;
                            }
                        }

                        const secIndex = sections.indexOf(secObj);
                        const isStartOfBlock = secIndex === 0 || getOeKeyForSection(sections[secIndex - 1].section_id, slot.timeslot_id) !== thisOeKey;

                        if (isStartOfBlock) {
                            let rowSpanCount = 1;
                            while (
                                secIndex + rowSpanCount < sections.length &&
                                getOeKeyForSection(sections[secIndex + rowSpanCount].section_id, slot.timeslot_id) === thisOeKey
                            ) {
                                rowSpanCount++;
                            }

                            const oeNum = sectionOes[0]?.open_elective_number || "";
                            cells.push(
                                <td key={`oe-${i}`} rowSpan={rowSpanCount} colSpan={span}
                                    className="p-4 bg-gray-50 text-center relative group align-middle"
                                    style={{ border: `1px solid ${theme.border}` }}>
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="text-gray-900 text-[14px] font-black uppercase mb-2 tracking-widest">
                                            {oeNum ? `OE-${oeNum}` : "OE"}{isLabSlot ? " LAB" : ""}
                                        </div>
                                        {sectionOes.map((el, idx) => (
                                            <div key={idx} className="text-[12px] text-gray-900 font-bold leading-tight py-1">
                                                {el.course_code}-{el.faculty_short}-{el.room_name}
                                                {el.component_type === "TUTORIAL" ? " (Tut.)" : ""}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            );
                        } else {
                            cells.push(null);
                        }
                        i += span - 1;
                        continue;
                    }
                }

                // BREAK slot
                if (isBreak(slot)) {
                    cells.push(
                        <td key={`brk-${i}`} className="font-bold bg-yellow-50 text-yellow-700 text-[11px] text-center"
                            style={{ border: `1px solid ${theme.border}` }}>BREAK</td>
                    );
                    continue;
                }

                // Normal / Lab schedule entry
                const slotEntries = semEntries.filter(e =>
                    e.section_name === secName &&
                    e.timeslot_id === slot.timeslot_id
                );
                const entry = slotEntries[0];

                if (slotEntries.length > 0) {
                    const isLab = entry.component_type === "LAB";
                    if (isLab) {
                        let span = 1;
                        while (true) {
                            const nxt = daySlots[i + span];
                            if (!nxt || isBreak(nxt)) break;
                            const nxtE = semEntries.find(e =>
                                e.section_name === secName &&
                                e.timeslot_id === nxt.timeslot_id &&
                                e.course_code === entry.course_code &&
                                e.room_id === entry.room_id &&
                                e.subsection_id === entry.subsection_id
                            );
                            if (!nxtE) break;
                            span++;
                        }

                        const labSlotEntries = slotEntries.filter(e => e.component_type === "LAB");

                        cells.push(
                            <td key={`cell-${i}`} colSpan={span}
                                className="p-2 bg-green-50 text-green-700 font-semibold text-[11px] text-center relative group"
                                style={{ border: `1px solid ${theme.border}` }}>
                                <div className="flex flex-col gap-1 items-center justify-center">
                                    {labSlotEntries.map((labE, idx) => (
                                        <div key={idx} className={`flex items-center gap-1 ${idx > 0 ? 'border-t border-green-200 pt-1 w-full justify-center' : ''}`}>
                                            <span className="whitespace-nowrap overflow-hidden">
                                                {labE.course_code}-{labE.subsection_name || secName}-{labE.faculty_short}-{labE.room_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </td>
                        );
                        i += span - 1;
                        continue;
                    }

                    // Normal / Tutorial filled cell
                    cells.push(
                        <td key={`cell-${i}`} className="p-2 text-gray-700 font-semibold text-center relative group"
                            style={{ border: `1px solid ${theme.border}` }}>
                            <div className="flex flex-col gap-1 items-center justify-center">
                                {slotEntries.map((e, idx) => (
                                    <div key={idx} className={`flex items-center gap-1 text-[11px] ${idx > 0 ? 'border-t border-gray-200 pt-1 w-full justify-center' : ''}`}>
                                        <span className="whitespace-nowrap overflow-hidden">
                                            {e.course_code}-{e.subsection_name || secName}-{e.faculty_short}-{e.room_name}
                                            {e.component_type === "TUTORIAL" ? " (Tut.)" : ""}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </td>
                    );
                    continue;
                } else {
                    cells.push(
                        <td key={`empty-${i}`} className="text-center" style={{ border: `1px solid ${theme.border}`, height: 40 }}>
                            <span className="text-gray-200 text-[10px]">---</span>
                        </td>
                    );
                }
            }

            return (
                <tr key={secObj.section_id}>
                    <td className="p-3 font-bold text-gray-800 text-[12px] text-center"
                        style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.header + "40" }}>
                        {secName}
                    </td>
                    {cells}
                </tr>
            );
        });
    };

    // Filter semesters based on chosen program
    const availableSemesters = allSemesters
        .filter(s => String(s.program_id) === String(selectedProgram))
        .sort((a, b) => a.semester_number - b.semester_number);

    // Filter section options based on chosen semester
    const availableSections = allSections
        .filter(s => String(s.semester_id) === String(selectedSemester))
        .sort((a, b) => a.section_name.localeCompare(b.section_name));

    return (
        <div className="bg-[#f8fafc] min-h-screen text-gray-900 font-sans antialiased">
            {/* Header bar */}
            <header
                style={{
                    height: "80px",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 32px",
                    backgroundColor: "#ffffff",
                    borderBottom: "2px solid #f3f4f6",
                    position: "sticky",
                    top: 0
                }}
            >
                {/* Back Button (Left aligned) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                    <button
                        onClick={() => navigate("/student-manage")}
                        style={{ backgroundColor: "#f9fafb", color: "#374151" }}
                        className="hover:bg-gray-100 px-6 py-2 rounded-xl font-bold border border-gray-200 transition-all text-sm shadow-sm whitespace-nowrap"
                    >
                        ← Back
                    </button>
                </div>

                {/* Title */}
                <h1
                    style={{
                        flex: 1,
                        textAlign: "center",
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: "900",
                        color: "#111827",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em"
                    }}
                >
                    Student Portal
                </h1>

                {/* PDF Export (Right aligned) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                    <button
                        onClick={handleExport}
                        disabled={loading || isExporting || !timetableData.length || (viewMode === "section" && !selectedSection)}
                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                        className="px-8 py-2 rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-50 transition-all text-sm whitespace-nowrap"
                    >
                        {isExporting ? "Preparing…" : "Export PDF"}
                    </button>
                </div>
            </header>

            <main style={{ padding: "40px 32px" }}>
                <div style={{ maxWidth: "1700px", margin: "0 auto 48px auto" }}>
                    {/* View selector tabs */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
                        <div style={{ backgroundColor: "#f3f4f6", padding: "6px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e5e7eb" }}>
                            <button
                                onClick={() => {
                                    setViewMode("section");
                                }}
                                style={{
                                    padding: "12px 32px",
                                    borderRadius: "12px",
                                    fontWeight: "900",
                                    fontSize: "14px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    transition: "all 0.2s",
                                    backgroundColor: viewMode === "section" ? "#ffffff" : "transparent",
                                    color: viewMode === "section" ? "#2563eb" : "#6b7280",
                                    border: viewMode === "section" ? "1px solid #e5e7eb" : "none",
                                    boxShadow: viewMode === "section" ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"
                                }}
                            >
                                🏫 Section View
                            </button>
                            <button
                                onClick={() => {
                                    setViewMode("master");
                                }}
                                style={{
                                    padding: "12px 32px",
                                    borderRadius: "12px",
                                    fontWeight: "900",
                                    fontSize: "14px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    transition: "all 0.2s",
                                    backgroundColor: viewMode === "master" ? "#ffffff" : "transparent",
                                    color: viewMode === "master" ? "#2563eb" : "#6b7280",
                                    border: viewMode === "master" ? "1px solid #e5e7eb" : "none",
                                    boxShadow: viewMode === "master" ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"
                                }}
                            >
                                🌐 Master View
                            </button>
                        </div>
                    </div>

                    {/* Section filters */}
                    {viewMode === "section" && (
                        <div style={{
                            backgroundColor: "#ffffff",
                            padding: "32px",
                            borderRadius: "24px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #f3f4f6",
                            textAlign: "center",
                            maxWidth: "800px",
                            margin: "0 auto"
                        }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "900", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "20px" }}>
                                Choose Program, Semester & Section
                            </label>

                            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                                {/* Program Select */}
                                <div style={{ minWidth: "200px" }}>
                                    <label style={{ fontSize: "11px", color: "#6b7280", textAlign: "left", marginBottom: "4px" }}>Program</label>
                                    <select
                                        value={selectedProgram}
                                        onChange={(e) => {
                                            setSelectedProgram(e.target.value);
                                            setSelectedSemester("");
                                            setSelectedSection("");
                                        }}
                                        style={{
                                            padding: "12px 20px",
                                            borderRadius: "16px",
                                            border: "2px solid #3b82f6",
                                            fontWeight: "700",
                                            color: "#111827",
                                            backgroundColor: "#f9fafb",
                                            cursor: "pointer",
                                            outline: "none"
                                        }}
                                    >
                                        <option value="">— Select Program —</option>
                                        {[...allPrograms]
                                            .sort((a, b) => a.program_name.localeCompare(b.program_name))
                                            .map(prog => (
                                                <option key={prog.program_id} value={prog.program_id}>
                                                    {prog.program_name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Semester Select */}
                                <div style={{ minWidth: "200px" }}>
                                    <label style={{ fontSize: "11px", color: "#6b7280", textAlign: "left", marginBottom: "4px" }}>Semester</label>
                                    <select
                                        value={selectedSemester}
                                        disabled={!selectedProgram}
                                        onChange={(e) => {
                                            setSelectedSemester(e.target.value);
                                            setSelectedSection("");
                                        }}
                                        style={{
                                            padding: "12px 20px",
                                            borderRadius: "16px",
                                            border: selectedProgram ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                                            fontWeight: "700",
                                            color: selectedProgram ? "#111827" : "#9ca3af",
                                            backgroundColor: "#f9fafb",
                                            cursor: selectedProgram ? "pointer" : "not-allowed",
                                            outline: "none"
                                        }}
                                    >
                                        <option value="">— Select Semester —</option>
                                        {availableSemesters.map(sem => (
                                            <option key={sem.semester_id} value={sem.semester_id}>
                                                Semester {sem.semester_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Section Select */}
                                <div style={{ minWidth: "200px" }}>
                                    <label style={{ fontSize: "11px", color: "#6b7280", textAlign: "left", marginBottom: "4px" }}>Section</label>
                                    <select
                                        value={selectedSection}
                                        disabled={!selectedSemester}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        style={{
                                            padding: "12px 20px",
                                            borderRadius: "16px",
                                            border: selectedSemester ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                                            fontWeight: "700",
                                            color: selectedSemester ? "#111827" : "#9ca3af",
                                            backgroundColor: "#f9fafb",
                                            cursor: selectedSemester ? "pointer" : "not-allowed",
                                            outline: "none"
                                        }}
                                    >
                                        <option value="">— Choose Section —</option>
                                        {availableSections.map(sec => (
                                            <option key={sec.section_id} value={sec.section_id}>
                                                {sec.section_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Timetable...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center font-bold">
                        {error}
                    </div>
                ) : viewMode === "section" && (!selectedProgram || !selectedSemester || !selectedSection) ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100 max-w-[1700px] mx-auto">
                        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-widest">Select Your Class</h2>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">Choose your program, semester and section above to show your customized weekly schedule.</p>
                    </div>
                ) : (
                    <div ref={timetableRef} className="space-y-20 max-w-[1700px] mx-auto">
                        {DAYS.map(day => {
                            const daySlots = allTimeSlots.filter(s => s.day === day).sort((a, b) => a.slot_order - b.slot_order);
                            const dayEntries = timetableData.filter(e => e.day === day);
                            if (!daySlots.length) return null;

                            if (viewMode === "section") {
                                // Filter section mode
                                const semObj = allSemesters.find(s => String(s.semester_id) === String(selectedSemester));
                                if (!semObj) return null;

                                const semId = semObj.semester_id;
                                const progName = allPrograms.find(p => p.program_id === semObj.program_id)?.program_name || "";
                                const theme = SEM_COLORS[0]; // standard theme for section view
                                const semEntries = dayEntries.filter(e =>
                                    Number(e.semester_number) === Number(semObj.semester_number) &&
                                    Number(e.program_id) === Number(semObj.program_id)
                                );
                                const sectionObj = allSections.find(s => String(s.section_id) === String(selectedSection));
                                if (!sectionObj) return null;

                                return (
                                    <div key={day} className="day-container bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-[0.25em] py-10 mb-8 flex justify-center w-full" style={{ textAlign: "center", display: "block" }}>
                                            {day}
                                        </h2>
                                        <div className="mb-8 rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: theme.border }}>
                                            <h3 className="text-xl font-bold py-3 px-6 uppercase tracking-widest flex items-center justify-center w-full"
                                                style={{ backgroundColor: theme.header, color: theme.text, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }}>
                                                {progName} — Semester {semObj.semester_number} ({sectionObj.section_name})
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full table-fixed border-collapse text-center">
                                                    <thead>
                                                        <tr style={{ backgroundColor: theme.header + "80" }}>
                                                            <th className="p-3 w-32 font-bold uppercase text-gray-700 text-[11px]" style={{ border: `1px solid ${theme.border}` }}>Section</th>
                                                            {daySlots.map((sl, si) => (
                                                                <th key={si} className="p-3 w-36 font-bold text-gray-700 text-[11px]" style={{ border: `1px solid ${theme.border}` }}>
                                                                    {isBreak(sl) ? "BREAK" : `${sl.start_time.slice(0, 5)} - ${sl.end_time.slice(0, 5)}`}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {renderRows(daySlots, semEntries, [sectionObj], theme)}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                // Full master view mode
                                const semesters = [...allSemesters].sort((a, b) => a.semester_number - b.semester_number);
                                return (
                                    <div key={day} className="day-container bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-[0.25em] py-10 mb-8 flex justify-center w-full" style={{ textAlign: "center", display: "block" }}>
                                            {day}
                                        </h2>
                                        {semesters.map((semObj, semIdx) => {
                                            const semId = semObj.semester_id;
                                            const progName = allPrograms.find(p => p.program_id === semObj.program_id)?.program_name || "";
                                            const theme = SEM_COLORS[semIdx % SEM_COLORS.length];
                                            const semEntries = dayEntries.filter(e =>
                                                Number(e.semester_number) === Number(semObj.semester_number) &&
                                                Number(e.program_id) === Number(semObj.program_id)
                                            );
                                            const sections = allSections
                                                .filter(s => Number(s.semester_id) === Number(semId))
                                                .sort((a, b) => a.section_name.localeCompare(b.section_name));

                                            if (!sections.length) return null;

                                            return (
                                                <div key={semId} className="mb-16 rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: theme.border }}>
                                                    <h3 className="text-xl font-bold py-3 px-6 uppercase tracking-widest flex items-center justify-center w-full"
                                                        style={{ backgroundColor: theme.header, color: theme.text, borderBottom: `1px solid ${theme.border}`, textAlign: "center" }}>
                                                        {progName} — Semester {semObj.semester_number}
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full table-fixed border-collapse text-center">
                                                            <thead>
                                                                <tr style={{ backgroundColor: theme.header + "80" }}>
                                                                    <th className="p-3 w-32 font-bold uppercase text-gray-700 text-[11px]" style={{ border: `1px solid ${theme.border}` }}>Section</th>
                                                                    {daySlots.map((sl, si) => (
                                                                        <th key={si} className="p-3 w-36 font-bold text-gray-700 text-[11px]" style={{ border: `1px solid ${theme.border}` }}>
                                                                            {isBreak(sl) ? "BREAK" : `${sl.start_time.slice(0, 5)} - ${sl.end_time.slice(0, 5)}`}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {renderRows(daySlots, semEntries, sections, theme)}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}