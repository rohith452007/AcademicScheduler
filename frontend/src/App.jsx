import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Manage from './pages/Manage';
import ViewMasterTimetable from './pages/ViewMasterTimetable';
import FacultyTimetable from './pages/FacultyTimetable';
import FacultyManage from './pages/FacultyManage';
import StudentTimetable from './pages/StudentTimetable';
import StudentManage from './pages/StudentManage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RegisterInstitute from './pages/RegisterInstitute';
import './style.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/faculty-manage" element={<FacultyManage />} />
        <Route path="/student-manage" element={<StudentManage />} />
        <Route path="/master-timetable" element={<ViewMasterTimetable />} />
        <Route path="/faculty-timetable" element={<FacultyTimetable />} />
        <Route path="/student-timetable" element={<StudentTimetable />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register-institute" element={<RegisterInstitute />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
