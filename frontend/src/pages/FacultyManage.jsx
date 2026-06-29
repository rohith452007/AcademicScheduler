import React from 'react';
import { useNavigate } from 'react-router-dom';

function FacultyManage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // wipe the login session
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "100-screen", fontFamily: "sans-serif", padding: 0, margin: 0 }}>

            <header style={{
                backgroundColor: "#ffffff",
                borderBottom: "2px solid #f3f4f6",
                padding: "20px 48px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 50,
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#2563eb", margin: 0, textTransform: "uppercase", letterSpacing: "-0.025em" }}>Faculty Core</h1>
                    <p style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: "4px" }}>Smart Timetable Access System</p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        padding: "10px 32px",
                        borderRadius: "12px",
                        fontWeight: "900",
                        fontSize: "14px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    Logout
                </button>
            </header>

            <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 32px" }}>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>


                    <div
                        onClick={() => navigate('/faculty-timetable')}
                        style={{
                            background: "linear-gradient(135deg, #2563eb 0%, #4338ca 100%)",
                            padding: "48px",
                            borderRadius: "32px",
                            cursor: "pointer",
                            boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
                            transition: "transform 0.3s ease",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", marginBottom: "16px", textTransform: "uppercase" }}>Personalized View</h2>
                        <p style={{ color: "#dbeafe", fontSize: "16px", fontWeight: "500", opacity: 0.9, lineHeight: "1.6" }}>
                            Access your dedicated schedule. Filter by short name and see your specific classes across all sections.
                        </p>
                        <div style={{ marginTop: "40px", display: "flex", alignItems: "center", gap: "12px", color: "white", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>
                            <span>Access Portal →</span>
                        </div>
                    </div>


                    <div
                        onClick={() => navigate('/master-timetable')}
                        style={{
                            background: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
                            padding: "48px",
                            borderRadius: "32px",
                            cursor: "pointer",
                            boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
                            transition: "transform 0.3s ease",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", marginBottom: "16px", textTransform: "uppercase" }}>Master Timetable</h2>
                        <p style={{ color: "#ecfdf5", fontSize: "16px", fontWeight: "500", opacity: 0.9, lineHeight: "1.6" }}>
                            View the full institutional timetable. Explore all semesters, sections, and courses in a single master grid.
                        </p>
                        <div style={{ marginTop: "40px", display: "flex", alignItems: "center", gap: "12px", color: "white", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>
                            <span>View Full Grid →</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: "64px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #f3f4f6",
                    padding: "32px",
                    borderRadius: "24px",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <div style={{ backgroundColor: "#eff6ff", padding: "16px", borderRadius: "16px", fontSize: "24px" }}>ℹ️</div>
                        <div>
                            <h3 style={{ fontWeight: "900", color: "#111827", textTransform: "uppercase", fontSize: "14px", margin: 0, letterSpacing: "0.1em" }}>Read-Only Access</h3>
                            <p style={{ color: "#9ca3af", fontSize: "14px", fontWeight: "500", marginTop: "4px", margin: 0 }}>You are currently logged in with faculty permissions. Scheduling management is restricted to admins.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default FacultyManage;
