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

export default function FacultyTimetable() {
    const navigate = useNavigate();
    const timetableRef = useRef(null);

    // State for timetable data and filters
    const [allFaculty, setAllFaculty] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [allTimeSlots, setAllTimeSlots] = useState([]);
    const [timetableData, setTimetableData] = useState([]);
    const [allSemesters, setAllSemesters] = useState([]);
    const [allSections, setAllSections] = useState([]);
    const [allPrograms, setAllPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState("");
    const [showMaster, setShowMaster] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFaculty = [...allFaculty]
        .filter(f =>
            f.faculty_short.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.faculty_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.faculty_short.localeCompare(b.faculty_short));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true); setError("");
        try {
            const [facR, slotsR, ttR, semR, secR, progR] = await Promise.all([
                adminService.getFaculty(),
                adminService.getTimeSlots(),
                adminService.getMasterTimetable(),
                adminService.getSemesters(),
                adminService.getSections(),
                adminService.getPrograms(),
            ]);
            setAllFaculty(facR.data || []);
            setAllTimeSlots(slotsR.data || []);
            setTimetableData(ttR.data.master_entries || []);
            setAllSemesters(semR.data || []);
            setAllSections(secR.data || []);
            setAllPrograms(progR.data || []);
        } catch (e) {
            console.error(e);
            setError("Failed to load data");
        } finally { setLoading(false); }
    };

    const handleExport = async () => {
        if (!timetableRef.current) return;
        setIsExporting(true);
        try {
            const dayEls = timetableRef.current.querySelectorAll(".day-container");
            if (!dayEls.length) { alert("Nothing to export"); return; }
            let pdf = null;
            for (let i = 0; i < dayEls.length; i++) {
                const canvas = await html2canvas(dayEls[i], { scale: 1.5, useCORS: true, backgroundColor: "#fff", logging: false });
                const img = canvas.toDataURL("image/jpeg", 0.7);
                const wPt = canvas.width * 0.75, hPt = canvas.height * 0.75;
                if (i === 0) pdf = new jsPDF({ orientation: wPt > hPt ? "landscape" : "portrait", unit: "pt", format: [wPt, hPt] });
                else pdf.addPage([wPt, hPt], wPt > hPt ? "landscape" : "portrait");
                pdf.addImage(img, "JPEG", 0, 0, wPt, hPt, undefined, "FAST");
            }
            if (pdf) pdf.save(`Faculty_Schedule_${selectedFaculty || "Master"}.pdf`);
        } catch (e) { alert("Export failed: " + (e?.message || "error")); }
        finally { setIsExporting(false); }
    };

    const renderRows = (daySlots, semEntries, sections, theme, electiveSlotIds) =>
        sections.map(secObj => {
            const secName = secObj.section_name;
            const cells = [];
            for (let i = 0; i < daySlots.length; i++) {
                const slot = daySlots[i];

                if (showMaster && electiveSlotIds.includes(slot.timeslot_id)) {
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

                if (isBreak(slot)) {
                    cells.push(
                        <td key={`brk-${i}`} className="font-bold bg-yellow-50 text-yellow-700 text-[11px] text-center"
                            style={{ border: `1px solid ${theme.border}` }}>BREAK</td>
                    );
                    continue;
                }

                const entry = semEntries.find(e =>
                    e.section_name === secName &&
                    e.timeslot_id === slot.timeslot_id &&
                    (!selectedFaculty || String(e.faculty_id) === String(selectedFaculty))
                );

                if (entry) {
                    const isLab = entry.component_type === "LAB";
                    let span = 1;
                    if (isLab) {
                        while (true) {
                            const nxt = daySlots[i + span];
                            if (!nxt || isBreak(nxt)) break;
                            const nxtE = semEntries.find(e =>
                                e.section_name === secName && e.timeslot_id === nxt.timeslot_id &&
                                e.course_code === entry.course_code && e.room_id === entry.room_id &&
                                e.subsection_id === entry.subsection_id &&
                                (!selectedFaculty || String(e.faculty_id) === String(selectedFaculty))
                            );
                            if (!nxtE) break;
                            span++;
                        }
                    }

                    cells.push(
                        <td key={`cell-${i}`} colSpan={span}
                            className={`p-2 text-center relative group ${isLab ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 font-semibold'}`}
                            style={{ border: `1px solid ${theme.border}` }}>
                            <div className="whitespace-nowrap overflow-hidden text-[11px]">
                                {entry.course_code}-{entry.subsection_name || secName}-{entry.faculty_short}-{entry.room_name}
                                {entry.component_type === "TUTORIAL" ? " (Tut.)" : ""}
                            </div>
                        </td>
                    );
                    i += span - 1;
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

    return (
        <div className="bg-[#f8fafc] min-h-screen text-gray-900 font-sans antialiased">

            <header
                style={{ height: "80px", zIndex: 1000, display: "flex", alignItems: "center", padding: "0 32px", backgroundColor: "#ffffff", borderBottom: "2px solid #f3f4f6" }}
            >
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                    <button onClick={() => navigate("/faculty-manage")}
                        style={{ backgroundColor: "#f9fafb", color: "#374151" }}
                        className="hover:bg-gray-100 px-6 py-2 rounded-xl font-bold border border-gray-200 transition-all text-sm shadow-sm whitespace-nowrap">
                        ← Back
                    </button>
                </div>

                <h1
                    style={{ flex: 1, textAlign: "center", margin: 0, fontSize: "24px", fontWeight: "900", color: "#111827", textTransform: "uppercase", letterSpacing: "0.1em" }}
                >
                    Faculty View
                </h1>

                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                    <button onClick={handleExport}
                        disabled={loading || isExporting || !timetableData.length}
                        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                        className="px-8 py-2 rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-50 transition-all text-sm whitespace-nowrap">
                        {isExporting ? "Preparing…" : "Export PDF"}
                    </button>
                </div>
            </header>

            <main style={{ padding: "40px 32px" }}>
                <div style={{ maxWidth: "1700px", margin: "0 auto 48px auto" }}>

                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
                        <div style={{ backgroundColor: "#f3f4f6", padding: "6px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e5e7eb" }}>
                            <button
                                onClick={() => { setShowMaster(true); setSelectedFaculty(""); }}
                                style={{
                                    padding: "12px 32px", borderRadius: "12px", fontWeight: "900", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.2s",
                                    backgroundColor: showMaster ? "#ffffff" : "transparent",
                                    color: showMaster ? "#2563eb" : "#6b7280",
                                    border: showMaster ? "1px solid #e5e7eb" : "none",
                                    boxShadow: showMaster ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"
                                }}
                            >
                                🌐 Master View
                            </button>
                            <button
                                onClick={() => setShowMaster(false)}
                                style={{
                                    padding: "12px 32px", borderRadius: "12px", fontWeight: "900", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.2s",
                                    backgroundColor: !showMaster ? "#ffffff" : "transparent",
                                    color: !showMaster ? "#2563eb" : "#6b7280",
                                    border: !showMaster ? "1px solid #e5e7eb" : "none",
                                    boxShadow: !showMaster ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"
                                }}
                            >
                                👤 Personalized View
                            </button>
                        </div>
                    </div>

                    {/* Faculty search and selection */}
                    {!showMaster && (
                        <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid #f3f4f6", textAlign: "center" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "900", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "20px" }}>Find Your Name</label>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                {/* Search Bar */}
                                <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
                                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name or short code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: "100%", padding: "12px 20px 12px 44px", borderRadius: "16px", border: "2px solid #f3f4f6",
                                            fontWeight: "600", color: "#374151", backgroundColor: "#ffffff", outline: "none", transition: "all 0.2s"
                                        }}
                                    />
                                </div>

                                {/* Dropdown */}
                                <select
                                    value={selectedFaculty}
                                    onChange={(e) => setSelectedFaculty(e.target.value)}
                                    style={{
                                        width: "100%", maxWidth: "400px", padding: "12px 20px", borderRadius: "16px", border: "2px solid #3b82f6",
                                        fontWeight: "700", color: "#111827", backgroundColor: "#f9fafb", cursor: "pointer", outline: "none"
                                    }}
                                >
                                    <option value="">— {searchTerm ? `Found ${filteredFaculty.length} Results` : "Choose Short Name"} —</option>
                                    {filteredFaculty.map(f => (
                                        <option key={f.faculty_id} value={f.faculty_id}>
                                            {f.faculty_short} ({f.faculty_name})
                                        </option>
                                    ))}
                                    {filteredFaculty.length === 0 && (
                                        <option disabled>No faculty found for "{searchTerm}"</option>
                                    )}
                                </select>
                            </div>

                            {selectedFaculty && (
                                <div style={{ marginTop: "24px", padding: "12px", backgroundColor: "#eff6ff", borderRadius: "16px", display: "inline-block" }}>
                                    <p style={{ color: "#1e40af", fontSize: "14px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                                        Schedule Generated For: <span style={{ color: "#2563eb", fontWeight: "900" }}>{allFaculty.find(f => f.faculty_id === selectedFaculty)?.faculty_name}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Schedule...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center font-bold">
                        {error}
                    </div>
                ) : !showMaster && !selectedFaculty ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100 max-w-[1700px] mx-auto">
                        <div className="text-5xl mb-6 opacity-40">🔎</div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-widest">Select Your Name</h2>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">Click on your short name above to generate your personalized timetable.</p>
                    </div>
                ) : (
                    <div ref={timetableRef} className="space-y-20 max-w-[1700px] mx-auto">
                        {DAYS.map(day => {
                            const daySlots = allTimeSlots.filter(s => s.day === day).sort((a, b) => a.slot_order - b.slot_order);
                            if (!daySlots.length) return null;
                            const dayEntries = timetableData.filter(e => e.day === day);
                            const semesters = [...allSemesters].sort((a, b) => a.semester_number - b.semester_number);

                            const hasClassesThisDay = !selectedFaculty || dayEntries.some(e => String(e.faculty_id) === String(selectedFaculty));
                            if (!hasClassesThisDay) return null;

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
                                            e.semester_number === semObj.semester_number &&
                                            Number(e.program_id) === Number(semObj.program_id)
                                        );
                                        const sections = allSections
                                            .filter(s => s.semester_id === semId)
                                            .sort((a, b) => a.section_name.localeCompare(b.section_name));

                                        const electiveSlotIds = [...new Set(
                                            semEntries.filter(e => e.is_open_elective === 1).map(e => e.timeslot_id)
                                        )];

                                        if (!sections.length) return null;

                                        // Hide semester if faculty has no assigned classes in it
                                        const hasClassesThisSem = !selectedFaculty || semEntries.some(e => String(e.faculty_id) === String(selectedFaculty));
                                        if (!hasClassesThisSem) return null;

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
                                                            {renderRows(daySlots, semEntries, sections, theme, electiveSlotIds)}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
