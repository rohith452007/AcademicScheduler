-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 18, 2026 at 07:33 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `timetable_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `branch_id` int(11) NOT NULL,
  `branch_name` varchar(50) NOT NULL,
  `program_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`branch_id`, `branch_name`, `program_id`) VALUES
(1, 'CSE', 1),
(2, 'ECE', 1),
(3, 'ME', 1);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `semester_number` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `is_open_elective` tinyint(1) DEFAULT 0,
  `course_capacity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_code`, `course_name`, `semester_number`, `semester_id`, `is_open_elective`, `course_capacity`) VALUES
('CS2002', 'Computer Organization and Architecture', 3, NULL, 0, 160),
('CS2003', 'Database Management Systems', 3, NULL, 0, 160),
('CS2004', 'Introduction to Data Science', 3, NULL, 0, 160),
('IT2001', 'Data Structure in C', 3, NULL, 0, 160),
('IT2C01', 'IT Workshop I', 3, NULL, 0, 160),
('OE2C02', 'Discrete Structures', 3, NULL, 1, 90),
('OE2C03', 'Operating System', 3, NULL, 1, 100),
('OE2C04', 'Numerical Methods', 3, NULL, 1, 50),
('OE2C05', 'Design Thinking', 3, NULL, 1, 100),
('OE2C06', 'Robotics', 3, NULL, 1, 60);

-- --------------------------------------------------------

--
-- Table structure for table `course_branch`
--

CREATE TABLE `course_branch` (
  `course_code` varchar(20) NOT NULL,
  `branch_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_branch`
--

INSERT INTO `course_branch` (`course_code`, `branch_id`) VALUES
('CS2002', 1),
('CS2003', 1),
('CS2004', 1),
('IT2001', 1),
('IT2C01', 1),
('OE2C02', 1),
('OE2C02', 2),
('OE2C02', 3),
('OE2C03', 1),
('OE2C03', 2),
('OE2C03', 3),
('OE2C04', 1),
('OE2C04', 2),
('OE2C04', 3),
('OE2C05', 1),
('OE2C05', 2),
('OE2C05', 3),
('OE2C06', 1),
('OE2C06', 2),
('OE2C06', 3);

-- --------------------------------------------------------

--
-- Table structure for table `course_components`
--

CREATE TABLE `course_components` (
  `component_id` int(11) NOT NULL,
  `course_code` varchar(20) DEFAULT NULL,
  `component_type` enum('THEORY','TUTORIAL','LAB') NOT NULL,
  `lab_group_type` enum('COMBINED','SPLIT') DEFAULT 'COMBINED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_components`
--

INSERT INTO `course_components` (`component_id`, `course_code`, `component_type`, `lab_group_type`) VALUES
(1, 'OE2C02', 'THEORY', 'COMBINED'),
(2, 'OE2C02', 'THEORY', 'COMBINED'),
(3, 'OE2C02', 'THEORY', 'COMBINED'),
(4, 'CS2004', 'THEORY', 'COMBINED'),
(5, 'CS2004', 'THEORY', 'COMBINED'),
(6, 'CS2004', 'THEORY', 'COMBINED'),
(7, 'CS2004', 'LAB', 'COMBINED'),
(8, 'CS2004', 'LAB', 'COMBINED'),
(9, 'IT2C01', 'LAB', 'COMBINED'),
(10, 'IT2C01', 'LAB', 'COMBINED'),
(11, 'IT2C01', 'LAB', 'COMBINED'),
(12, 'CS2003', 'THEORY', 'COMBINED'),
(13, 'CS2003', 'THEORY', 'COMBINED'),
(14, 'CS2003', 'THEORY', 'COMBINED'),
(15, 'CS2003', 'LAB', 'COMBINED'),
(16, 'CS2003', 'LAB', 'COMBINED'),
(17, 'IT2001', 'THEORY', 'COMBINED'),
(18, 'IT2001', 'THEORY', 'COMBINED'),
(19, 'IT2001', 'THEORY', 'COMBINED'),
(20, 'IT2001', 'LAB', 'SPLIT'),
(21, 'IT2001', 'LAB', 'SPLIT'),
(22, 'CS2002', 'THEORY', 'COMBINED'),
(23, 'CS2002', 'THEORY', 'COMBINED'),
(24, 'CS2002', 'THEORY', 'COMBINED'),
(25, 'CS2002', 'TUTORIAL', 'COMBINED'),
(26, 'OE2C03', 'THEORY', 'COMBINED'),
(27, 'OE2C03', 'THEORY', 'COMBINED'),
(28, 'OE2C03', 'THEORY', 'COMBINED'),
(29, 'OE2C04', 'THEORY', 'COMBINED'),
(30, 'OE2C04', 'THEORY', 'COMBINED'),
(31, 'OE2C04', 'THEORY', 'COMBINED'),
(32, 'OE2C05', 'THEORY', 'COMBINED'),
(33, 'OE2C05', 'THEORY', 'COMBINED'),
(34, 'OE2C05', 'THEORY', 'COMBINED'),
(37, 'OE2C06', 'THEORY', 'COMBINED'),
(38, 'OE2C06', 'THEORY', 'COMBINED'),
(39, 'OE2C06', 'THEORY', 'COMBINED');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` varchar(20) NOT NULL,
  `faculty_name` varchar(100) NOT NULL,
  `faculty_short` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `max_hours_per_week` int(11) DEFAULT 16
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`faculty_id`, `faculty_name`, `faculty_short`, `email`, `max_hours_per_week`) VALUES
('P101', 'Akshay Pandey', 'AP', 'ap@iiitdmj.ac.in', 18),
('P102', 'Aparajita Ojha', 'AO', 'ao@iiitdmj.ac.in', 20),
('P103', 'Ayan Seal', 'AS', 'as@iiitdmj.ac.in', 17),
('P104', 'Pritee Khanna', 'PK', 'pk@iiitdmj.ac.in', 19),
('P105', 'Sraban Kumar Mohanty', 'SKM', 'skm@iiitdmj.ac.in', 20),
('P106', 'Ranjeet Kumar Ranjan', 'RKR', 'rkr@iiitdmj.ac.in', 20),
('P107', 'ASDFGHJ', 'ASD', 'ASD@GMAIL.COM', 16),
('P108', 'ASDFGujmnn', 'ASDFG', 'ASDFG@IIITDMJ.AC.IN', 19),
('P109', 'QWERTUJKI', 'QWE', 'QWE@GMAIL.COM', 16),
('P110', 'QWEDCVBHYUJMYHB', 'QWERT', 'QWERT@IIITDMJ.AC.IN', 19);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_branch`
--

CREATE TABLE `faculty_branch` (
  `faculty_id` varchar(20) NOT NULL,
  `branch_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_course`
--

CREATE TABLE `faculty_course` (
  `faculty_id` varchar(20) NOT NULL,
  `course_code` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_course`
--

INSERT INTO `faculty_course` (`faculty_id`, `course_code`) VALUES
('P101', 'CS2004'),
('P102', 'OE2C02'),
('P103', 'IT2C01'),
('P104', 'CS2003'),
('P105', 'IT2001'),
('P106', 'CS2002'),
('P107', 'OE2C03'),
('P108', 'OE2C04'),
('P109', 'OE2C05'),
('P110', 'OE2C06');

-- --------------------------------------------------------

--
-- Table structure for table `master_timetable`
--

CREATE TABLE `master_timetable` (
  `master_id` int(11) NOT NULL,
  `day` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY') DEFAULT NULL,
  `timeslot_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `subsection_id` int(11) DEFAULT NULL,
  `course_code` varchar(20) DEFAULT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `component_type` enum('THEORY','LAB','TUTORIAL') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `program`
--

CREATE TABLE `program` (
  `program_id` int(11) NOT NULL,
  `program_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program`
--

INSERT INTO `program` (`program_id`, `program_name`) VALUES
(1, 'BTech');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `room_name` varchar(100) DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `room_type` enum('CLASSROOM','LAB') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_name`, `capacity`, `room_type`) VALUES
(17, 'L102', 150, 'CLASSROOM'),
(18, 'L104', 230, 'CLASSROOM'),
(19, 'L105', 230, 'CLASSROOM'),
(20, 'L201', 140, 'CLASSROOM'),
(21, 'L202', 140, 'CLASSROOM'),
(22, 'L206', 180, 'CLASSROOM'),
(23, 'CR101', 70, 'CLASSROOM'),
(24, 'CR102', 70, 'CLASSROOM'),
(25, 'CR103', 70, 'CLASSROOM'),
(26, 'CR201', 70, 'CLASSROOM'),
(27, 'CR202', 70, 'CLASSROOM'),
(28, 'CR203', 70, 'CLASSROOM'),
(29, '2nd Floor Tinkering LAB', 145, 'LAB'),
(30, '3rd Floor Tinkering LAB', 145, 'LAB'),
(31, '2nd Floor Computing LAB', 165, 'LAB'),
(32, '3rd Floor Computing LAB', 165, 'LAB'),
(33, 'L301', 220, 'CLASSROOM'),
(34, 'L302', 220, 'CLASSROOM'),
(35, 'L303', 160, 'CLASSROOM'),
(36, 'L304', 160, 'CLASSROOM'),
(37, 'L305', 150, 'CLASSROOM'),
(38, 'CR301', 80, 'CLASSROOM'),
(39, 'CR302', 80, 'CLASSROOM'),
(40, 'CR303', 70, 'CLASSROOM'),
(41, 'CR304', 70, 'CLASSROOM'),
(42, 'Embedded Systems LAB', 80, 'LAB'),
(43, 'Electronics LAB', 150, 'LAB'),
(44, 'Advanced Computing LAB', 160, 'LAB'),
(45, 'AI & Data Science LAB', 170, 'LAB'),
(46, 'L401', 220, 'CLASSROOM'),
(47, 'L402', 160, 'CLASSROOM'),
(48, 'L403', 150, 'CLASSROOM'),
(49, 'CR401', 80, 'CLASSROOM'),
(50, 'CR402', 70, 'CLASSROOM'),
(51, 'Advanced Electronics LAB', 160, 'LAB'),
(52, 'Robotics LAB', 150, 'LAB'),
(53, 'AI Research LAB', 170, 'LAB');

-- --------------------------------------------------------

--
-- Table structure for table `section`
--

CREATE TABLE `section` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(20) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section`
--

INSERT INTO `section` (`section_id`, `section_name`, `branch_id`, `semester_id`) VALUES
(5, 'CSE-A', 1, 3),
(6, 'CSE-B', 1, 3),
(19, 'ECE-C', 2, 3),
(27, 'ME-D', 3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `semester`
--

CREATE TABLE `semester` (
  `semester_id` int(11) NOT NULL,
  `semester_number` int(11) NOT NULL,
  `year_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semester`
--

INSERT INTO `semester` (`semester_id`, `semester_number`, `year_id`, `program_id`) VALUES
(3, 3, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `subsection`
--

CREATE TABLE `subsection` (
  `subsection_id` int(11) NOT NULL,
  `subsection_name` varchar(20) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subsection_capacity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable`
--

CREATE TABLE `timetable` (
  `timetable_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subsection_id` int(11) DEFAULT NULL,
  `course_code` varchar(20) NOT NULL,
  `faculty_id` varchar(20) NOT NULL,
  `room_id` int(11) NOT NULL,
  `timeslot_id` int(11) NOT NULL,
  `component_type` enum('THEORY','TUTORIAL','LAB') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timetable`
--

INSERT INTO `timetable` (`timetable_id`, `section_id`, `subsection_id`, `course_code`, `faculty_id`, `room_id`, `timeslot_id`, `component_type`) VALUES
(2520, 5, NULL, 'OE2C02', 'P102', 20, 55, 'THEORY'),
(2521, 6, NULL, 'OE2C02', 'P102', 20, 55, 'THEORY'),
(2522, 19, NULL, 'OE2C02', 'P102', 20, 55, 'THEORY'),
(2523, 27, NULL, 'OE2C02', 'P102', 20, 55, 'THEORY'),
(2524, 5, NULL, 'OE2C03', 'P107', 21, 55, 'THEORY'),
(2525, 6, NULL, 'OE2C03', 'P107', 21, 55, 'THEORY'),
(2526, 19, NULL, 'OE2C03', 'P107', 21, 55, 'THEORY'),
(2527, 27, NULL, 'OE2C03', 'P107', 21, 55, 'THEORY'),
(2528, 5, NULL, 'OE2C04', 'P108', 23, 55, 'THEORY'),
(2529, 6, NULL, 'OE2C04', 'P108', 23, 55, 'THEORY'),
(2530, 19, NULL, 'OE2C04', 'P108', 23, 55, 'THEORY'),
(2531, 27, NULL, 'OE2C04', 'P108', 23, 55, 'THEORY'),
(2532, 5, NULL, 'OE2C05', 'P109', 17, 55, 'THEORY'),
(2533, 6, NULL, 'OE2C05', 'P109', 17, 55, 'THEORY'),
(2534, 19, NULL, 'OE2C05', 'P109', 17, 55, 'THEORY'),
(2535, 27, NULL, 'OE2C05', 'P109', 17, 55, 'THEORY'),
(2536, 5, NULL, 'OE2C06', 'P110', 24, 55, 'THEORY'),
(2537, 6, NULL, 'OE2C06', 'P110', 24, 55, 'THEORY'),
(2538, 19, NULL, 'OE2C06', 'P110', 24, 55, 'THEORY'),
(2539, 27, NULL, 'OE2C06', 'P110', 24, 55, 'THEORY'),
(2540, 5, NULL, 'OE2C02', 'P102', 20, 47, 'THEORY'),
(2541, 6, NULL, 'OE2C02', 'P102', 20, 47, 'THEORY'),
(2542, 19, NULL, 'OE2C02', 'P102', 20, 47, 'THEORY'),
(2543, 27, NULL, 'OE2C02', 'P102', 20, 47, 'THEORY'),
(2544, 5, NULL, 'OE2C03', 'P107', 21, 47, 'THEORY'),
(2545, 6, NULL, 'OE2C03', 'P107', 21, 47, 'THEORY'),
(2546, 19, NULL, 'OE2C03', 'P107', 21, 47, 'THEORY'),
(2547, 27, NULL, 'OE2C03', 'P107', 21, 47, 'THEORY'),
(2548, 5, NULL, 'OE2C04', 'P108', 23, 47, 'THEORY'),
(2549, 6, NULL, 'OE2C04', 'P108', 23, 47, 'THEORY'),
(2550, 19, NULL, 'OE2C04', 'P108', 23, 47, 'THEORY'),
(2551, 27, NULL, 'OE2C04', 'P108', 23, 47, 'THEORY'),
(2552, 5, NULL, 'OE2C05', 'P109', 17, 47, 'THEORY'),
(2553, 6, NULL, 'OE2C05', 'P109', 17, 47, 'THEORY'),
(2554, 19, NULL, 'OE2C05', 'P109', 17, 47, 'THEORY'),
(2555, 27, NULL, 'OE2C05', 'P109', 17, 47, 'THEORY'),
(2556, 5, NULL, 'OE2C06', 'P110', 24, 47, 'THEORY'),
(2557, 6, NULL, 'OE2C06', 'P110', 24, 47, 'THEORY'),
(2558, 19, NULL, 'OE2C06', 'P110', 24, 47, 'THEORY'),
(2559, 27, NULL, 'OE2C06', 'P110', 24, 47, 'THEORY'),
(2560, 5, NULL, 'OE2C02', 'P102', 20, 63, 'THEORY'),
(2561, 6, NULL, 'OE2C02', 'P102', 20, 63, 'THEORY'),
(2562, 19, NULL, 'OE2C02', 'P102', 20, 63, 'THEORY'),
(2563, 27, NULL, 'OE2C02', 'P102', 20, 63, 'THEORY'),
(2564, 5, NULL, 'OE2C03', 'P107', 21, 63, 'THEORY'),
(2565, 6, NULL, 'OE2C03', 'P107', 21, 63, 'THEORY'),
(2566, 19, NULL, 'OE2C03', 'P107', 21, 63, 'THEORY'),
(2567, 27, NULL, 'OE2C03', 'P107', 21, 63, 'THEORY'),
(2568, 5, NULL, 'OE2C04', 'P108', 23, 63, 'THEORY'),
(2569, 6, NULL, 'OE2C04', 'P108', 23, 63, 'THEORY'),
(2570, 19, NULL, 'OE2C04', 'P108', 23, 63, 'THEORY'),
(2571, 27, NULL, 'OE2C04', 'P108', 23, 63, 'THEORY'),
(2572, 5, NULL, 'OE2C05', 'P109', 17, 63, 'THEORY'),
(2573, 6, NULL, 'OE2C05', 'P109', 17, 63, 'THEORY'),
(2574, 19, NULL, 'OE2C05', 'P109', 17, 63, 'THEORY'),
(2575, 27, NULL, 'OE2C05', 'P109', 17, 63, 'THEORY'),
(2576, 5, NULL, 'OE2C06', 'P110', 24, 63, 'THEORY'),
(2577, 6, NULL, 'OE2C06', 'P110', 24, 63, 'THEORY'),
(2578, 19, NULL, 'OE2C06', 'P110', 24, 63, 'THEORY'),
(2579, 27, NULL, 'OE2C06', 'P110', 24, 63, 'THEORY'),
(2580, 6, NULL, 'CS2003', 'P104', 44, 56, 'LAB'),
(2581, 6, NULL, 'CS2003', 'P104', 44, 57, 'LAB'),
(2582, 6, NULL, 'CS2004', 'P101', 44, 48, 'LAB'),
(2583, 6, NULL, 'CS2004', 'P101', 44, 49, 'LAB'),
(2584, 6, NULL, 'IT2C01', 'P103', 44, 64, 'LAB'),
(2585, 6, NULL, 'IT2C01', 'P103', 44, 65, 'LAB'),
(2586, 6, NULL, 'IT2C01', 'P103', 44, 66, 'LAB'),
(2587, 6, NULL, 'CS2003', 'P104', 35, 39, 'THEORY'),
(2588, 6, NULL, 'IT2001', 'P105', 35, 31, 'THEORY'),
(2589, 6, NULL, 'CS2004', 'P101', 35, 40, 'THEORY'),
(2590, 6, NULL, 'CS2002', 'P106', 35, 32, 'THEORY'),
(2591, 6, NULL, 'CS2004', 'P101', 35, 58, 'THEORY'),
(2592, 6, NULL, 'CS2003', 'P104', 35, 50, 'THEORY'),
(2593, 6, NULL, 'IT2001', 'P105', 35, 41, 'THEORY'),
(2594, 6, NULL, 'CS2002', 'P106', 35, 59, 'THEORY'),
(2595, 6, NULL, 'CS2004', 'P101', 35, 33, 'THEORY'),
(2596, 6, NULL, 'IT2001', 'P105', 35, 51, 'THEORY'),
(2597, 6, NULL, 'CS2003', 'P104', 35, 67, 'THEORY'),
(2598, 6, NULL, 'CS2002', 'P106', 35, 42, 'THEORY'),
(2599, 6, NULL, 'CS2002', 'P106', 35, 52, 'THEORY'),
(2600, 5, NULL, 'CS2003', 'P104', 44, 59, 'LAB'),
(2601, 5, NULL, 'CS2003', 'P104', 44, 60, 'LAB'),
(2602, 5, NULL, 'CS2004', 'P101', 44, 51, 'LAB'),
(2603, 5, NULL, 'CS2004', 'P101', 44, 52, 'LAB'),
(2604, 5, NULL, 'IT2C01', 'P103', 44, 67, 'LAB'),
(2605, 5, NULL, 'IT2C01', 'P103', 44, 68, 'LAB'),
(2606, 5, NULL, 'IT2C01', 'P103', 44, 69, 'LAB'),
(2607, 5, NULL, 'CS2002', 'P106', 36, 39, 'THEORY'),
(2608, 5, NULL, 'CS2003', 'P104', 36, 31, 'THEORY'),
(2609, 5, NULL, 'CS2004', 'P101', 36, 41, 'THEORY'),
(2610, 5, NULL, 'IT2001', 'P105', 36, 32, 'THEORY'),
(2611, 5, NULL, 'CS2003', 'P104', 36, 58, 'THEORY'),
(2612, 5, NULL, 'CS2002', 'P106', 35, 48, 'THEORY'),
(2613, 5, NULL, 'IT2001', 'P105', 36, 40, 'THEORY'),
(2614, 5, NULL, 'CS2004', 'P101', 35, 34, 'THEORY'),
(2615, 5, NULL, 'IT2001', 'P105', 35, 56, 'THEORY'),
(2616, 5, NULL, 'CS2004', 'P101', 36, 50, 'THEORY'),
(2617, 5, NULL, 'CS2002', 'P106', 35, 64, 'THEORY'),
(2618, 5, NULL, 'CS2003', 'P104', 36, 42, 'THEORY'),
(2619, 5, NULL, 'CS2002', 'P106', 36, 33, 'THEORY');

-- --------------------------------------------------------

--
-- Table structure for table `time_slots`
--

CREATE TABLE `time_slots` (
  `timeslot_id` int(11) NOT NULL,
  `day` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_order` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `time_slots`
--

INSERT INTO `time_slots` (`timeslot_id`, `day`, `start_time`, `end_time`, `slot_order`) VALUES
(31, 'MONDAY', '09:00:00', '10:00:00', 1),
(32, 'MONDAY', '10:00:00', '11:00:00', 2),
(33, 'MONDAY', '11:00:00', '12:00:00', 3),
(34, 'MONDAY', '12:00:00', '13:00:00', 4),
(35, 'MONDAY', '14:00:00', '15:00:00', 5),
(36, 'MONDAY', '15:00:00', '16:00:00', 6),
(37, 'MONDAY', '16:00:00', '17:00:00', 7),
(38, 'MONDAY', '17:00:00', '18:00:00', 8),
(39, 'TUESDAY', '09:00:00', '10:00:00', 1),
(40, 'TUESDAY', '10:00:00', '11:00:00', 2),
(41, 'TUESDAY', '11:00:00', '12:00:00', 3),
(42, 'TUESDAY', '12:00:00', '13:00:00', 4),
(43, 'TUESDAY', '14:00:00', '15:00:00', 5),
(44, 'TUESDAY', '15:00:00', '16:00:00', 6),
(45, 'TUESDAY', '16:00:00', '17:00:00', 7),
(46, 'TUESDAY', '17:00:00', '18:00:00', 8),
(47, 'WEDNESDAY', '09:00:00', '10:00:00', 1),
(48, 'WEDNESDAY', '10:00:00', '11:00:00', 2),
(49, 'WEDNESDAY', '11:00:00', '12:00:00', 3),
(50, 'WEDNESDAY', '12:00:00', '13:00:00', 4),
(51, 'WEDNESDAY', '14:00:00', '15:00:00', 5),
(52, 'WEDNESDAY', '15:00:00', '16:00:00', 6),
(53, 'WEDNESDAY', '16:00:00', '17:00:00', 7),
(54, 'WEDNESDAY', '17:00:00', '18:00:00', 8),
(55, 'THURSDAY', '09:00:00', '10:00:00', 1),
(56, 'THURSDAY', '10:00:00', '11:00:00', 2),
(57, 'THURSDAY', '11:00:00', '12:00:00', 3),
(58, 'THURSDAY', '12:00:00', '13:00:00', 4),
(59, 'THURSDAY', '14:00:00', '15:00:00', 5),
(60, 'THURSDAY', '15:00:00', '16:00:00', 6),
(61, 'THURSDAY', '16:00:00', '17:00:00', 7),
(62, 'THURSDAY', '17:00:00', '18:00:00', 8),
(63, 'FRIDAY', '09:00:00', '10:00:00', 1),
(64, 'FRIDAY', '10:00:00', '11:00:00', 2),
(65, 'FRIDAY', '11:00:00', '12:00:00', 3),
(66, 'FRIDAY', '12:00:00', '13:00:00', 4),
(67, 'FRIDAY', '14:00:00', '15:00:00', 5),
(68, 'FRIDAY', '15:00:00', '16:00:00', 6),
(69, 'FRIDAY', '16:00:00', '17:00:00', 7),
(70, 'FRIDAY', '17:00:00', '18:00:00', 8);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','faculty','student') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `role`) VALUES
(9, 'admin', 'admin123', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `year`
--

CREATE TABLE `year` (
  `year_id` int(11) NOT NULL,
  `year_name` varchar(20) NOT NULL,
  `program_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `year`
--

INSERT INTO `year` (`year_id`, `year_name`, `program_id`) VALUES
(1, '1st Year', 1),
(2, '2nd Year', 1),
(3, '3rd Year', 1),
(4, '4th Year', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branch_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_code`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `course_branch`
--
ALTER TABLE `course_branch`
  ADD PRIMARY KEY (`course_code`,`branch_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `course_components`
--
ALTER TABLE `course_components`
  ADD PRIMARY KEY (`component_id`),
  ADD KEY `course_code` (`course_code`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `faculty_short` (`faculty_short`),
  ADD UNIQUE KEY `faculty_short_2` (`faculty_short`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `faculty_branch`
--
ALTER TABLE `faculty_branch`
  ADD PRIMARY KEY (`faculty_id`,`branch_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `faculty_course`
--
ALTER TABLE `faculty_course`
  ADD PRIMARY KEY (`faculty_id`,`course_code`),
  ADD KEY `course_code` (`course_code`);

--
-- Indexes for table `master_timetable`
--
ALTER TABLE `master_timetable`
  ADD PRIMARY KEY (`master_id`),
  ADD KEY `timeslot_id` (`timeslot_id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `program`
--
ALTER TABLE `program`
  ADD PRIMARY KEY (`program_id`),
  ADD UNIQUE KEY `program_name` (`program_name`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD UNIQUE KEY `room_name` (`room_name`);

--
-- Indexes for table `section`
--
ALTER TABLE `section`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `unique_section` (`section_name`,`branch_id`,`semester_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `semester`
--
ALTER TABLE `semester`
  ADD PRIMARY KEY (`semester_id`),
  ADD KEY `year_id` (`year_id`),
  ADD KEY `fk_semester_program` (`program_id`);

--
-- Indexes for table `subsection`
--
ALTER TABLE `subsection`
  ADD PRIMARY KEY (`subsection_id`),
  ADD UNIQUE KEY `section_id` (`section_id`,`subsection_name`);

--
-- Indexes for table `timetable`
--
ALTER TABLE `timetable`
  ADD PRIMARY KEY (`timetable_id`),
  ADD KEY `subsection_id` (`subsection_id`),
  ADD KEY `course_code` (`course_code`),
  ADD KEY `timeslot_id` (`timeslot_id`),
  ADD KEY `idx_fk_section` (`section_id`),
  ADD KEY `idx_fk_faculty` (`faculty_id`),
  ADD KEY `idx_fk_room` (`room_id`);

--
-- Indexes for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD PRIMARY KEY (`timeslot_id`),
  ADD UNIQUE KEY `day` (`day`,`start_time`,`end_time`),
  ADD UNIQUE KEY `day_2` (`day`,`slot_order`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `year`
--
ALTER TABLE `year`
  ADD PRIMARY KEY (`year_id`),
  ADD KEY `program_id` (`program_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `branch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `course_components`
--
ALTER TABLE `course_components`
  MODIFY `component_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=420;

--
-- AUTO_INCREMENT for table `master_timetable`
--
ALTER TABLE `master_timetable`
  MODIFY `master_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4494;

--
-- AUTO_INCREMENT for table `program`
--
ALTER TABLE `program`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `section`
--
ALTER TABLE `section`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `semester`
--
ALTER TABLE `semester`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `subsection`
--
ALTER TABLE `subsection`
  MODIFY `subsection_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `timetable`
--
ALTER TABLE `timetable`
  MODIFY `timetable_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2620;

--
-- AUTO_INCREMENT for table `time_slots`
--
ALTER TABLE `time_slots`
  MODIFY `timeslot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `year`
--
ALTER TABLE `year`
  MODIFY `year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `branch`
--
ALTER TABLE `branch`
  ADD CONSTRAINT `branch_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`semester_id`) ON DELETE CASCADE;

--
-- Constraints for table `course_branch`
--
ALTER TABLE `course_branch`
  ADD CONSTRAINT `course_branch_ibfk_1` FOREIGN KEY (`course_code`) REFERENCES `courses` (`course_code`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_branch_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE;

--
-- Constraints for table `course_components`
--
ALTER TABLE `course_components`
  ADD CONSTRAINT `course_components_ibfk_1` FOREIGN KEY (`course_code`) REFERENCES `courses` (`course_code`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_branch`
--
ALTER TABLE `faculty_branch`
  ADD CONSTRAINT `faculty_branch_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculty_branch_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_course`
--
ALTER TABLE `faculty_course`
  ADD CONSTRAINT `faculty_course_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculty_course_ibfk_2` FOREIGN KEY (`course_code`) REFERENCES `courses` (`course_code`) ON DELETE CASCADE;

--
-- Constraints for table `master_timetable`
--
ALTER TABLE `master_timetable`
  ADD CONSTRAINT `master_timetable_ibfk_1` FOREIGN KEY (`timeslot_id`) REFERENCES `time_slots` (`timeslot_id`),
  ADD CONSTRAINT `master_timetable_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`),
  ADD CONSTRAINT `master_timetable_ibfk_3` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`),
  ADD CONSTRAINT `master_timetable_ibfk_4` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`semester_id`),
  ADD CONSTRAINT `master_timetable_ibfk_5` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`),
  ADD CONSTRAINT `master_timetable_ibfk_6` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`);

--
-- Constraints for table `section`
--
ALTER TABLE `section`
  ADD CONSTRAINT `section_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `section_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`semester_id`) ON DELETE CASCADE;

--
-- Constraints for table `semester`
--
ALTER TABLE `semester`
  ADD CONSTRAINT `fk_semester_program` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `semester_ibfk_1` FOREIGN KEY (`year_id`) REFERENCES `year` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `subsection`
--
ALTER TABLE `subsection`
  ADD CONSTRAINT `fk_subsection_section` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`) ON DELETE CASCADE;

--
-- Constraints for table `timetable`
--
ALTER TABLE `timetable`
  ADD CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`subsection_id`) REFERENCES `subsection` (`subsection_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`course_code`) REFERENCES `courses` (`course_code`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_4` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_5` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_6` FOREIGN KEY (`timeslot_id`) REFERENCES `time_slots` (`timeslot_id`) ON UPDATE CASCADE;

--
-- Constraints for table `year`
--
ALTER TABLE `year`
  ADD CONSTRAINT `year_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
