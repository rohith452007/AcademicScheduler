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

export default function ViewMasterTimetable() {
    const navigate = useNavigate();
    const timetableRef = useRef(null);

    // keep track of all the data we need for the grid
    const [allTimeSlots, setAllTimeSlots] = useState([]);
    const [timetableData, setTimetableData] = useState([]);
    const [allSemesters, setAllSemesters] = useState([]);
    const [allSections, setAllSections] = useState([]);
    const [allPrograms, setAllPrograms] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [branchCourses, setBranchCourses] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [allSubsections, setAllSubsections] = useState([]);
    const [allCourseComponents, setAllCourseComponents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [editMode, setEditMode] = useState(false);



    const [popover, setPopover] = useState(null);
    const [mCourse, setMCourse] = useState("");
    const [mRoom, setMRoom] = useState("");
    const [mSubsection, setMSubsection] = useState("");
    const [mType, setMType] = useState("THEORY");
    const [mBusy, setMBusy] = useState(false);
    const [mMsg, setMMsg] = useState("");
    const [mOk, setMOk] = useState(false);

    const fetchData = async (draft = false) => {
        setLoading(true); setError("");
        try {
            const [slotsR, ttR, semR, secR, progR, coursesR, bcR, roomsR, subR, compR] = await Promise.all([
                adminService.getTimeSlots(),
                adminService.getMasterTimetable({}, draft),
                adminService.getSemesters(),
                adminService.getSections(),
                adminService.getPrograms(),
                adminService.getCourses(),
                adminService.getBranchCourses(),
                adminService.getRooms(),
                adminService.getSubsections(),
                adminService.getCourseComponents()
            ]);
            setAllTimeSlots(slotsR.data || []);
            setTimetableData(ttR.data.master_entries || []);
            setAllSemesters(semR.data || []);
            setAllSections(secR.data || []);
            setAllPrograms(progR.data || []);
            setAllCourses(coursesR.data || []);
            setBranchCourses(bcR.data || []);
            setAllRooms(roomsR.data || []);
            setAllSubsections(subR.data || []);
            setAllCourseComponents(compR.data || []);
        } catch (e) {
            console.error(e);
            setError("Failed to load master timetable");
        } finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (editMode) {
                e.preventDefault();
                e.returnValue = "You have unsaved timetable changes. Leaving the page will save/discard your changes depending on your action.";
                return e.returnValue;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [editMode]);

    // function to download the current view as a PDF file
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
            if (pdf) pdf.save(`Timetable_${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (e) { alert("Export failed: " + (e?.message || "error")); }
        finally { setIsExporting(false); }
    };

    const handleDeleteTimetable = async () => {
        if (!window.confirm("Are you sure you want to PERMANENTLY DELETE the entire master timetable? This action cannot be undone.")) return;

        setLoading(true);
        try {
            await adminService.clearMasterTimetable();
            setTimetableData([]);
            alert("Master timetable deleted successfully.");
        } catch (e) {
            alert("Delete failed: " + (e?.response?.data?.error || e.message));
        } finally {
            setLoading(false);
        }
    };

    // open the popup to add a new class at a specific spot on the grid
    const openPopover = (ev, timeslotId, sectionObj, semObj, oeNum = null) => {
        const rect = ev.currentTarget.getBoundingClientRect();
        const CARD_W = 296;
        const CARD_H = 420;

        let px = rect.left + rect.width / 2 - CARD_W / 2;
        px = Math.max(8, Math.min(px, window.innerWidth - CARD_W - 8));

        let py = rect.bottom + 8;
        if (py + CARD_H > window.innerHeight - 8) py = rect.top - CARD_H - 8;
        setPopover({ px, py, timeslotId, sectionObj, semObj, targetOeNum: oeNum });
        setMCourse(""); setMRoom(""); setMSubsection(""); setMType("THEORY"); setMMsg(""); setMOk(false);
    };
    const closePopover = () => { setPopover(null); setMMsg(""); setMOk(false); };

    // Show courses belonging to this section or any Open Elective courses offered in this program and semester
    const popoverCourses = popover
        ? allCourses.filter(c => {
            if (Number(c.program_id) !== Number(popover.semObj.program_id)) return false;
            if (Number(c.semester_id) !== Number(popover.semObj.semester_id)) return false;

            const isAssignedToSection = branchCourses.some(bc =>
                bc.course_code === c.course_code &&
                Number(bc.section_id) === Number(popover.sectionObj.section_id)
            );

            const isOE = Number(c.is_open_elective) === 1 || branchCourses.some(bc =>
                bc.course_code === c.course_code &&
                (Number(bc.section_is_open_elective) === 1 || Number(bc.is_open_elective) === 1)
            );

            const existingOeEntries = timetableData.filter(e =>
                Number(e.timeslot_id) === Number(popover.timeslotId) &&
                Number(e.semester_id) === Number(popover.semObj.semester_id) &&
                Number(e.is_open_elective) === 1
            );
            const targetOeNum = popover.targetOeNum || existingOeEntries[0]?.open_elective_number;

            if (targetOeNum !== undefined && targetOeNum !== null && targetOeNum !== "") {
                if (!isOE) return false;
                const cOeNum = c.open_elective_number ?? branchCourses.find(bc =>
                    bc.course_code === c.course_code && (bc.section_open_elective_number || bc.open_elective_number)
                )?.section_open_elective_number ?? branchCourses.find(bc => bc.course_code === c.course_code)?.open_elective_number;

                if (String(cOeNum ?? '') !== String(targetOeNum)) return false;
                return true;
            }

            if (isAssignedToSection) return true;
            return isOE;
        })
        : [];

    // send the new class entry to the database
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!mCourse) { setMMsg("Please select a course"); return; }
        setMBusy(true); setMMsg(""); setMOk(false);
        try {
            const res = await adminService.addManualEntry({
                course_id: mCourse,
                section_id: popover.sectionObj.section_id,
                timeslot_id: popover.timeslotId,
                component_type: mType,
                room_id: mRoom || null,
                subsection_id: mSubsection || null
            }, editMode);
            setMOk(true);
            setMMsg("✓ " + res.data.message);
            await fetchData(editMode);
            setTimeout(closePopover, 2000);
        } catch (e) {
            setMOk(false);
            setMMsg("✗ " + (e?.response?.data?.error || e.message || "Failed"));
        } finally { setMBusy(false); }
    };

    // remove a class from the grid
    const confirmDelete = async (e, masterIdOrIds, label) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const uniqueIds = [...new Set(Array.isArray(masterIdOrIds) ? masterIdOrIds : [masterIdOrIds])];
        if (!uniqueIds.length) return;

        const ok = window.confirm(`Are you sure you want to delete ${label} from the timetable? This cannot be undone.`);
        if (!ok) return;

        try {
            let deletedCount = 0;
            for (const id of uniqueIds) {
                try {
                    await adminService.deleteMasterEntry(id, editMode);
                    deletedCount++;
                } catch (err) {
                    if (err?.response?.status !== 404) throw err;
                }
            }
            await fetchData(editMode);
            alert(`Success: Deleted entries for ${label}.`);
        } catch (err) {
            alert("Delete failed: " + (err?.response?.data?.error || err.message));
        }
    };

    const toggleEditMode = async () => {
        if (editMode) {
            setEditMode(false);
            closePopover();
            await fetchData(false);
            return;
        }

        setLoading(true);
        try {
            await adminService.startEditSession();
            setEditMode(true);
            await fetchData(true);
        } catch (err) {
            alert("Failed to start edit session: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSession = async () => {
        if (!window.confirm("Are you sure you want to save all changes to the database?")) return;
        setIsSaving(true);
        try {
            await adminService.saveEditSession();
            setEditMode(false);
            closePopover();
            await fetchData(false);
            alert("Changes saved successfully!");
        } catch (err) {
            alert("Failed to save changes: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelSession = async () => {
        if (!window.confirm("Discard all changes?")) return;
        setLoading(true);
        try {
            await adminService.cancelEditSession();
            setEditMode(false);
            closePopover();
            await fetchData(false);
        } catch (err) {
            alert("Failed to cancel session: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = async () => {
        if (editMode) {
            const confirmSave = window.confirm("You are leaving edit mode. Click OK to Save your changes, or Cancel to Discard them.");
            setLoading(true);
            try {
                if (confirmSave) {
                    await adminService.saveEditSession();
                } else {
                    await adminService.cancelEditSession();
                }
                setEditMode(false);
                closePopover();
            } catch (err) {
                console.error("Failed to handle session clean up on exit:", err);
            } finally {
                setLoading(false);
            }
        }
        // navigate(-1) always returns to wherever the user came from —
        // faculty → /faculty-manage, student → /student-manage, admin → /manage
        navigate(-1);
    };

    // build all the table rows for a specific section
    const renderRows = (daySlots, semEntries, sections, electiveSlotIds, theme, semObj) => {
        return sections.map(secObj => {
            const secName = secObj.section_name;
            const cells = [];
            for (let i = 0; i < daySlots.length; i++) {
                const slot = daySlots[i];
                const entry = semEntries.find(e =>
                    e.section_name === secName &&
                    e.timeslot_id === slot.timeslot_id &&
                    e.is_open_elective !== 1
                );

                const isSemesterOeSlot = semEntries.some(e => e.timeslot_id === slot.timeslot_id && e.is_open_elective === 1);
                if (isSemesterOeSlot) {
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
                                        {sectionOes.map((el, idx) => {
                                            const elMasterIds = [];
                                            for (let sIdx = 0; sIdx < span; sIdx++) {
                                                const sId = daySlots[i + sIdx].timeslot_id;
                                                for (let rIdx = 0; rIdx < rowSpanCount; rIdx++) {
                                                    const sObj = sections[secIndex + rIdx];
                                                    semEntries
                                                        .filter(e => e.timeslot_id === sId && e.section_id === sObj.section_id && e.course_code === el.course_code && e.room_id === el.room_id)
                                                        .forEach(e => elMasterIds.push(e.master_id));
                                                }
                                            }

                                            return (
                                                <div key={idx} className="text-[12px] text-gray-900 font-bold leading-tight py-1 relative group/oe">
                                                    {el.course_code}-{el.faculty_short}-{el.room_name}
                                                    {el.component_type === "TUTORIAL" ? " (Tut.)" : ""}

                                                    {editMode && (
                                                        <button onClick={(e) => confirmDelete(e, elMasterIds, `OE ${el.course_code}`)}
                                                            title="Delete"
                                                            className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-[8px] flex items-center justify-center opacity-0 group-hover/oe:opacity-100 transition-opacity">
                                                            🗑
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {editMode && (
                                        <button onClick={(e) => openPopover(e, slot.timeslot_id, secObj, semObj, oeNum)}
                                            className="mt-4 w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-500 text-blue-600 hover:text-white font-bold text-sm flex items-center justify-center mx-auto transition-colors"
                                            title="Add another course to this OE block">
                                            +
                                        </button>
                                    )}
                                </td>
                            );
                        } else {
                            cells.push(null);
                        }
                        i += span - 1;
                        continue;
                    }
                }

                // break
                if (isBreak(slot)) {
                    cells.push(
                        <td key={`brk-${i}`} className="font-bold bg-yellow-50 text-yellow-700 text-[11px] text-center"
                            style={{ border: `1px solid ${theme.border}` }}>BREAK</td>
                    );
                    continue;
                }

                // lab spanning
                if (entry && entry.component_type === "LAB") {
                    let span = 1;
                    const labMasterIds = [entry.master_id];
                    while (true) {
                        const nxt = daySlots[i + span];
                        if (!nxt || isBreak(nxt)) break;
                        const nxtE = semEntries.find(e =>
                            e.section_name === secName && e.timeslot_id === nxt.timeslot_id &&
                            e.course_code === entry.course_code && e.room_id === entry.room_id &&
                            e.subsection_id === entry.subsection_id
                        );
                        if (!nxtE) break;
                        labMasterIds.push(nxtE.master_id);
                        span++;
                    }
                    cells.push(
                        <td key={`lab-${i}`} colSpan={span}
                            className="p-2 bg-green-50 text-green-700 font-semibold text-[11px] text-center relative group"
                            style={{ border: `1px solid ${theme.border}` }}>
                            <div className="whitespace-nowrap overflow-hidden">
                                {entry.course_code}-{entry.subsection_name || secName}-{entry.faculty_short}-{entry.room_name}
                            </div>
                            {editMode && (
                                <button onClick={(e) => confirmDelete(e, labMasterIds, `${entry.course_code} LAB`)}
                                    title="Delete"
                                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    🗑
                                </button>
                            )}
                        </td>
                    );
                    i += span - 1;
                    continue;
                }

                // filled normal cell
                if (entry) {
                    cells.push(
                        <td key={`cell-${i}`} className="p-2 text-gray-700 font-semibold text-center relative group"
                            style={{ border: `1px solid ${theme.border}` }}>
                            <div className="whitespace-nowrap overflow-hidden text-[11px]">
                                {entry.course_code}-{entry.subsection_name || secName}-{entry.faculty_short}-{entry.room_name}
                                {entry.component_type === "TUTORIAL" ? " (Tut.)" : ""}
                            </div>
                            {editMode && (
                                <button onClick={(e) => confirmDelete(e, entry.master_id, entry.course_code)}
                                    title="Delete"
                                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    🗑
                                </button>
                            )}
                        </td>
                    );
                    continue;
                }

                // blank cell
                cells.push(
                    <td key={`empty-${i}`} className="text-center" style={{ border: `1px solid ${theme.border}`, height: 40 }}>
                        {editMode ? (
                            <button
                                onClick={ev => openPopover(ev, slot.timeslot_id, secObj, semObj)}
                                className="w-6 h-6 rounded-full bg-indigo-100 hover:bg-indigo-500 text-indigo-600 hover:text-white font-bold text-base flex items-center justify-center mx-auto transition-colors"
                                title="Add class here">+</button>
                        ) : (
                            <span className="text-gray-200 text-[10px]">---</span>
                        )}
                    </td>
                );
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

    // layout of the whole page
    return (
        <div className="bg-white min-h-screen text-gray-900 font-sans antialiased">

            {/* header bar with back button and admin controls */}
            <header
                style={{
                    height: "80px",
                    backgroundColor: "#ffffff",
                    zIndex: 1000,
                    borderBottom: "2px solid #f3f4f6",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 32px"
                }}
            >
                {/* Back Button (Left aligned) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                    <button onClick={handleBack}
                        style={{ backgroundColor: "#f9fafb", color: "#374151" }}
                        className="hover:bg-gray-100 px-6 py-2 rounded-xl font-bold border border-gray-200 transition-all text-sm shadow-sm whitespace-nowrap">
                        ← Back
                    </button>
                </div>

                {/* MASTER TIMETABLE TITLE (Centered) */}
                <h1
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: "900",
                        color: "#111827",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        pointerEvents: "none"
                    }}
                >
                    Master Timetable
                </h1>

                {/* Right Action Buttons (Right aligned) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                    {!editMode ? (
                        <>
                            {localStorage.getItem('userRole') === 'admin' && (
                                <button
                                    onClick={handleDeleteTimetable}
                                    disabled={loading || !timetableData.length}
                                    style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                                    className="px-5 py-2 rounded-xl font-bold border border-red-200 hover:bg-red-50 transition-all text-sm shadow-sm whitespace-nowrap disabled:opacity-50"
                                >
                                    🗑️ Delete Timetable
                                </button>
                            )}
                            {localStorage.getItem('userRole') === 'admin' && (
                                <button
                                    onClick={toggleEditMode}
                                    style={{ backgroundColor: "#ffffff" }}
                                    className="px-5 py-2 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm shadow-sm whitespace-nowrap"
                                >
                                    ✏️ Edit
                                </button>
                            )}
                            <button onClick={handleExport}
                                disabled={loading || isExporting || !timetableData.length}
                                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                className="px-8 py-2 rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-50 transition-all text-sm whitespace-nowrap">
                                {isExporting ? "Preparing…" : "Export PDF"}
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveSession}
                                disabled={isSaving}
                                style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold shadow-md hover:bg-green-700 transition-all text-sm whitespace-nowrap"
                            >
                                {isSaving ? "Saving..." : "✓ Save & Exit"}
                            </button>
                            <button
                                onClick={handleCancelSession}
                                style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition-all text-sm whitespace-nowrap"
                            >
                                ✕ Discard Changes
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {editMode && (
                <div
                    style={{ top: "80px", zIndex: 900, backgroundColor: "#fffbeb" }}
                    className="fixed left-0 right-0 border-b border-amber-200 py-3 text-center text-amber-900 font-bold text-[10px] shadow-sm uppercase tracking-[0.2em] flex items-center justify-center gap-6"
                >
                    <span className="flex items-center gap-2">✏️ Edit Mode</span>
                    <span className="h-1.5 w-1.5 bg-amber-400 rounded-full"></span>
                    <span><span className="text-blue-600 font-black">+</span> to add class</span>
                    <span className="h-1.5 w-1.5 bg-amber-400 rounded-full"></span>
                    <span>Hover for <span className="text-red-600 font-black">🗑</span></span>
                </div>
            )}


            {/* main grid area */}
            <main className={`${editMode ? "pt-64" : "pt-48"} pb-24 px-4 md:px-12 transition-all`}>
                {loading && (
                    <div className="flex flex-col items-center justify-center mt-32 gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        <p className="text-gray-400 text-sm">Assembling schedules…</p>
                    </div>
                )}
                {allTimeSlots.length > 0 && allSections.length > 0 && (
                    <div className={`timetable-root space-y-20 max-w-[1700px] mx-auto ${loading ? "hidden" : ""}`} ref={timetableRef}>
                        {DAYS.map(day => {
                            const dayEntries = timetableData.filter(e => e.day === day);
                            const daySlots = allTimeSlots.filter(s => s.day === day).sort((a, b) => a.slot_order - b.slot_order);
                            if (!daySlots.length) return null;
                            const semesters = [...allSemesters].sort((a, b) => a.semester_number - b.semester_number);
                            return (
                                <div key={day} className="day-container bg-white p-8 rounded-3xl">
                                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-[0.25em] py-10 mb-8 flex justify-center w-full" style={{ textAlign: "center", display: "block" }}>
                                        {day}
                                    </h2>
                                    {semesters.map((semObj, semIdx) => {
                                        const semId = semObj.semester_id;
                                        const progName = allPrograms.find(p => Number(p.program_id) === Number(semObj.program_id))?.program_name || "";
                                        const theme = SEM_COLORS[semIdx % SEM_COLORS.length];
                                        const semEntries = dayEntries.filter(e =>
                                            Number(e.semester_number) === Number(semObj.semester_number) &&
                                            Number(e.program_id) === Number(semObj.program_id)
                                        );
                                        const sections = allSections
                                            .filter(s => Number(s.semester_id) === Number(semId))
                                            .sort((a, b) => a.section_name.localeCompare(b.section_name));
                                        const electiveSlotIds = [...new Set(
                                            semEntries.filter(e => e.is_open_elective === 1).map(e => e.timeslot_id)
                                        )];
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
                                                            {renderRows(daySlots, semEntries, sections, electiveSlotIds, theme, semObj)}
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


            {popover && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-[250] bg-black/40 backdrop-blur-sm transition-all" onClick={closePopover} />

                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 300,
                            width: "360px",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            backgroundColor: "#ffffff",
                        }}
                        className="rounded-3xl shadow-2xl border border-gray-100 font-sans"
                    >

                        <div style={{ backgroundColor: "#f3f4f6" }} className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h4 className="text-gray-800 font-bold text-sm">Add Class</h4>
                                <p className="text-gray-500 text-[11px]">Section: <strong>{popover.sectionObj.section_name}</strong></p>
                            </div>
                            <button
                                onClick={closePopover}
                                style={{ padding: 0, backgroundColor: 'transparent', color: '#666', border: 'none', width: 24, height: 24 }}
                                className="text-lg font-bold leading-none hover:text-red-500"
                            >✕</button>
                        </div>


                        <form onSubmit={handleAddSubmit} className="p-4 space-y-4">

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Course</label>
                                {popoverCourses.length === 0 ? (
                                    <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                                        No courses found for this section.
                                    </div>
                                ) : (
                                    <select
                                        autoFocus
                                        value={mCourse}
                                        onChange={e => { setMCourse(e.target.value); setMMsg(""); }}
                                        style={{ backgroundColor: "#ffffff" }}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">— Select Course —</option>
                                        {popoverCourses.map(c => (
                                            <option key={c.course_id} value={c.course_id}>
                                                {c.course_code}: {c.course_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>


                            {mType === "LAB" && (() => {
                                const selectedCourseObj = allCourses.find(c => Number(c.course_id) === Number(mCourse));
                                if (!selectedCourseObj) return false;
                                const cbRow = branchCourses.find(bc =>
                                    bc.course_code === selectedCourseObj.course_code &&
                                    Number(bc.section_id) === Number(popover.sectionObj.section_id)
                                );
                                if (cbRow?.section_lab_group_type === 'SPLIT') return true;
                                if (cbRow?.section_lab_group_type === 'COMBINED') return false;
                                return allCourseComponents.some(cc =>
                                    Number(cc.course_id) === Number(mCourse) &&
                                    cc.component_type === 'LAB' &&
                                    cc.lab_group_type === 'SPLIT'
                                );
                            })() && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase text-blue-600">Lab Subsection (Group)</label>
                                        <select
                                            value={mSubsection}
                                            onChange={e => setMSubsection(e.target.value)}
                                            style={{ backgroundColor: "#eff6ff", borderColor: "#3b82f6" }}
                                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">— Select Group —</option>
                                            {allSubsections
                                                .filter(s => Number(s.section_id) === Number(popover.sectionObj.section_id))
                                                .map(s => (
                                                    <option key={s.subsection_id} value={s.subsection_id}>
                                                        {s.subsection_name}
                                                    </option>
                                                ))}
                                        </select>
                                        <p className="text-[9px] text-blue-500 mt-1 font-medium">This course has split labs. Please select a group.</p>
                                    </div>
                                )}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Room (Optional)</label>
                                <select
                                    value={mRoom}
                                    onChange={e => setMRoom(e.target.value)}
                                    style={{ backgroundColor: "#ffffff" }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">— Auto-allot Room —</option>
                                    {allRooms
                                        .sort((a, b) => a.room_name.localeCompare(b.room_name))
                                        .map(r => (
                                            <option key={r.room_id} value={r.room_id}>
                                                {r.room_name} ({r.room_type}, cap:{r.capacity})
                                            </option>
                                        ))}
                                </select>
                                <p className="text-[9px] text-gray-400 mt-1">If not selected, system finds a free room automatically.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Class Type</label>
                                <div className="space-y-2">
                                    {["THEORY", "TUTORIAL", "LAB"].map(t => (
                                        <div key={t}
                                            onClick={() => { setMType(t); setMMsg(""); }}
                                            style={{
                                                backgroundColor: mType === t ? "#f0f7ff" : "#ffffff",
                                                borderColor: mType === t ? "#3b82f6" : "#e5e7eb",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "10px 12px",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                            className="rounded-xl border shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            <input
                                                type="radio"
                                                name="mtype"
                                                value={t}
                                                checked={mType === t}
                                                onChange={() => { }}
                                                style={{ width: "16px", height: "16px", margin: 0, cursor: "pointer" }}
                                            />
                                            <span style={{ fontSize: "12px", fontWeight: "700", color: mType === t ? "#1e40af" : "#4b5563" }}>
                                                {t}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {mMsg && (
                                <div className={`p-3 rounded-xl text-[11px] font-bold text-center animate-pulse ${mOk ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                                    }`}>{mMsg}</div>
                            )}

                            {/* Center Actions */}
                            <div className="flex justify-center gap-3 pt-3">
                                <button type="button" onClick={closePopover}
                                    style={{ backgroundColor: '#ffffff', color: '#6b7280', width: '100px', padding: '10px 0' }}
                                    className="rounded-xl font-bold text-xs border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={mBusy || mOk || !popoverCourses.length}
                                    style={{
                                        backgroundColor: mBusy || mOk || !popoverCourses.length ? '#e5e7eb' : '#2563eb',
                                        color: 'white', width: '120px', padding: '10px 0'
                                    }}
                                    className="rounded-xl font-bold text-xs uppercase shadow-lg shadow-blue-200 active:scale-95 transition-all">
                                    {mBusy ? "Placing..." : "Add Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}


        </div>
    );
}