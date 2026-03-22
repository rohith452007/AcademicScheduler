-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 22, 2026 at 08:31 PM
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
(3, 'ME', 1),
(4, 'SM', 1),
(5, 'DS', 2);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `semester_number` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `is_open_elective` tinyint(1) DEFAULT 0,
  `open_elective_number` int(11) DEFAULT NULL
) ;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_code`, `course_name`, `semester_number`, `semester_id`, `is_open_elective`, `open_elective_number`) VALUES
(1, 'ES1001', 'Engineering Sciences I', 1, 1, 0, NULL),
(2, 'ES1002', 'Engineering Sciences Lab', 1, 1, 0, NULL),
(3, 'ES1003', 'Engineering Sciences III', 1, 1, 0, NULL),
(4, 'HS1001', 'Technical Communication', 1, 1, 0, NULL),
(5, 'NS1001', 'Natural Sciences I', 1, 1, 0, NULL),
(6, 'EC1001', 'Introduction to Electronics', 1, 1, 0, NULL),
(7, 'IT1001', 'Programming in C', 1, 1, 0, NULL),
(8, 'IT1002', 'Programming in Python', 1, 1, 0, NULL),
(9, 'DS1001', 'Design Foundations', 1, 5, 0, NULL),
(10, 'DS1002', 'Visual Design Basics', 1, 5, 0, NULL),
(11, 'DS1003', 'Design Drawing', 1, 5, 0, NULL),
(12, 'DS1004', 'Representation Techniques', 1, 5, 0, NULL),
(13, 'DS1005', 'Design Communication', 1, 5, 0, NULL),
(14, 'CS2006', 'Theory of Computation', 3, 2, 0, NULL),
(15, 'CS2007', 'Computer Networks', 3, 2, 0, NULL),
(16, 'CS2008', 'Operating Systems', 3, 2, 0, NULL),
(17, 'CS2009', 'Design & Analysis of Algorithms', 3, 2, 0, NULL),
(18, 'EC2005', 'Digital Signal Processing', 3, 2, 0, NULL),
(19, 'EC2006', 'Control Systems', 3, 2, 0, NULL),
(20, 'EC207a', 'VLSI Design', 3, 2, 0, NULL),
(21, 'EC207b', 'Embedded Systems', 3, 2, 0, NULL),
(22, 'EC2008', 'Microprocessors', 3, 2, 0, NULL),
(23, 'ME2005', 'Fluid Mechanics', 3, 2, 0, NULL),
(24, 'ME2006', 'Thermodynamics', 3, 2, 0, NULL),
(25, 'ME2007', 'Strength of Materials', 3, 2, 0, NULL),
(26, 'ME2008', 'Manufacturing Processes', 3, 2, 0, NULL),
(27, 'ME2002', 'Engineering Drawing', 3, 2, 0, NULL),
(28, 'SM2005', 'Smart Manufacturing I', 3, 2, 0, NULL),
(29, 'SM2006', 'Automation & Control', 3, 2, 0, NULL),
(30, 'SM2007', 'Industrial Engineering', 3, 2, 0, NULL),
(31, 'SM2008', 'Robotics Fundamentals', 3, 2, 0, NULL),
(32, 'DS2009', 'Design Prototyping', 3, 2, 0, NULL),
(33, 'DS2011', 'Design Lab I', 3, 2, 0, NULL),
(34, 'DS2012', 'Design Studio Project', 3, 2, 0, NULL),
(35, 'DS1007', 'Design Methods', 3, 2, 0, NULL),
(36, 'DS1008', 'Product Design Studio', 3, 2, 0, NULL),
(37, 'NS1003a', 'Natural Sciences Lab A', 3, 2, 0, NULL),
(38, 'NS1003b', 'Natural Sciences Lab B', 3, 2, 0, NULL),
(39, 'NS1004', 'Natural Sciences IV', 3, 2, 0, NULL),
(40, 'HS1002', 'Language & Communication', 3, 2, 0, NULL),
(41, 'OE2C03', 'Machine Learning', 3, 2, 1, 1),
(42, 'OE2C10', 'Deep Learning', 3, 2, 1, 1),
(43, 'OE2E03', 'RF & Microwave Engineering', 3, 2, 1, 1),
(44, 'OE2E04', 'Power Electronics', 3, 2, 1, 1),
(45, 'OE2E05', 'Internet of Things', 3, 2, 1, 1),
(46, 'OE2D05', 'UX Design', 3, 2, 1, 1),
(47, 'OE2D06', 'Visual Communication', 3, 2, 1, 1),
(48, 'OE2M06', 'Mechatronics', 3, 2, 1, 1),
(49, 'OE2S09', 'Supply Chain Management', 3, 2, 1, 1),
(50, 'OE2N05', 'Nano-Technology Basics', 3, 2, 1, 1),
(51, 'OE2C09', 'Computer Vision', 3, 2, 1, 1),
(52, 'CS3001', 'Machine Learning', 5, 3, 0, NULL),
(53, 'CS3002', 'Database Systems', 5, 3, 0, NULL),
(54, 'CS3003', 'Software Engineering', 5, 3, 0, NULL),
(55, 'CS3004', 'Artificial Intelligence', 5, 3, 0, NULL),
(56, 'CS3005', 'Computer Graphics', 5, 3, 0, NULL),
(57, 'EC3001', 'Digital Communications', 5, 3, 0, NULL),
(58, 'EC3002', 'RF Circuit Design', 5, 3, 0, NULL),
(59, 'EC3003', 'Advanced VLSI', 5, 3, 0, NULL),
(60, 'EC3004', 'Wireless Communications', 5, 3, 0, NULL),
(61, 'ME3001', 'Heat Transfer', 5, 3, 0, NULL),
(62, 'ME3002', 'Theory of Machines', 5, 3, 0, NULL),
(63, 'ME3003', 'Design of Machine Elements', 5, 3, 0, NULL),
(64, 'ME3004', 'Industrial Automation', 5, 3, 0, NULL),
(65, 'SM3001', 'Advanced Manufacturing', 5, 3, 0, NULL),
(66, 'SM3002', 'Quality Engineering', 5, 3, 0, NULL),
(67, 'SM3003', 'Smart Sensors & Actuators', 5, 3, 0, NULL),
(68, 'OE3C38', 'Advanced Algorithms', 5, 3, 1, 1),
(69, 'OE3E09', 'Digital Image Processing', 5, 3, 1, 1),
(70, 'OE3D20', 'Interaction Design', 5, 3, 1, 1),
(71, 'OE3M35', 'Advanced Robotics', 5, 3, 1, 1),
(72, 'OE3C37', 'Compiler Design', 5, 3, 1, 2),
(73, 'OE3E30', 'Wireless Sensor Networks', 5, 3, 1, 2),
(74, 'OE3D06', 'Sustainable Design', 5, 3, 1, 2),
(75, 'OE3M34', 'Finite Element Analysis', 5, 3, 1, 2),
(76, 'OE3M36', 'Tribology', 5, 3, 1, 2),
(77, 'OE3C41', 'Distributed Systems', 5, 3, 1, 3),
(78, 'OE3E35', 'MEMS & Nano-Electronics', 5, 3, 1, 3),
(79, 'OE3M37', 'Additive Manufacturing', 5, 3, 1, 3),
(80, 'OE3N37', 'Nano-Materials', 5, 3, 1, 3),
(81, 'OE3D21', 'Design Studio III', 5, 3, 1, 3),
(82, 'CS8009', 'Advanced Topics in AI', 7, 4, 0, NULL),
(83, 'CS8010', 'Deep Neural Networks', 7, 4, 0, NULL),
(84, 'CS8011', 'Natural Language Processing', 7, 4, 0, NULL),
(85, 'CS8015', 'Computer Vision Systems', 7, 4, 0, NULL),
(86, 'CS8027', 'Cloud Computing', 7, 4, 0, NULL),
(87, 'CS8033', 'Cyber Security', 7, 4, 0, NULL),
(88, 'CS8034', 'Blockchain Technology', 7, 4, 0, NULL),
(89, 'CS8035', 'Big Data Analytics', 7, 4, 0, NULL),
(90, 'CS8038', 'Reinforcement Learning', 7, 4, 0, NULL),
(91, 'CS8039', 'Knowledge Graphs', 7, 4, 0, NULL),
(92, 'EC8008', 'Advanced VLSI Design', 7, 4, 0, NULL),
(93, 'EC8021', 'Antenna Design', 7, 4, 0, NULL),
(94, 'EC8023', 'Power Systems', 7, 4, 0, NULL),
(95, 'EC8025', 'Photonics', 7, 4, 0, NULL),
(96, 'EC5009', 'RF & Microwave Circuits', 7, 4, 0, NULL),
(97, 'EC5010', 'Optical Fiber Communication', 7, 4, 0, NULL),
(98, 'EC5011', 'Advanced Signal Processing', 7, 4, 0, NULL),
(99, 'ME8007', 'Advanced Fluid Mechanics', 7, 4, 0, NULL),
(100, 'ME8011', 'Computational Fluid Dynamics', 7, 4, 0, NULL),
(101, 'ME8014', 'Tribology & Lubrication', 7, 4, 0, NULL),
(102, 'ME8018', 'FEM in Engineering', 7, 4, 0, NULL),
(103, 'ME8019', 'Micro-Manufacturing', 7, 4, 0, NULL),
(104, 'ME8021', 'Additive Manufacturing', 7, 4, 0, NULL),
(105, 'ME8025', 'Smart Manufacturing Systems', 7, 4, 0, NULL),
(106, 'ME5D02', 'Product Design & Development', 7, 4, 0, NULL),
(107, 'OE4L01', 'Design Elective I', 7, 4, 1, 1),
(108, 'OE4L02', 'Design Elective II', 7, 4, 1, 1),
(109, 'OE4M27', 'Manufacturing Elective', 7, 4, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `course_branch`
--

CREATE TABLE `course_branch` (
  `course_code` varchar(20) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `course_capacity` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_branch`
--

INSERT INTO `course_branch` (`course_code`, `branch_id`, `course_capacity`, `course_id`) VALUES
('CS2006', 1, 150, 14),
('CS2007', 1, 150, 15),
('CS2008', 1, 150, 16),
('CS2009', 1, 150, 17),
('CS3001', 1, 150, 52),
('CS3002', 1, 150, 53),
('CS3003', 1, 150, 54),
('CS3004', 1, 150, 55),
('CS3005', 1, 150, 56),
('CS8009', 1, 40, 82),
('CS8010', 1, 40, 83),
('CS8011', 1, 40, 84),
('CS8015', 1, 40, 85),
('CS8027', 1, 40, 86),
('CS8033', 1, 40, 87),
('CS8034', 1, 40, 88),
('CS8035', 1, 40, 89),
('CS8038', 1, 40, 90),
('CS8039', 1, 40, 91),
('DS1001', 5, 66, 9),
('DS1002', 5, 66, 10),
('DS1003', 5, 66, 11),
('DS1004', 5, 66, 12),
('DS1005', 5, 66, 13),
('DS1007', 5, 66, 35),
('DS1008', 5, 66, 36),
('DS2009', 5, 66, 32),
('DS2011', 5, 66, 33),
('DS2012', 5, 66, 34),
('EC1001', 2, 150, 6),
('EC2005', 2, 150, 18),
('EC2006', 2, 150, 19),
('EC2008', 2, 150, 22),
('EC207a', 2, 150, 20),
('EC207b', 2, 150, 21),
('EC3001', 2, 150, 57),
('EC3002', 2, 150, 58),
('EC3003', 2, 150, 59),
('EC3004', 2, 150, 60),
('EC5009', 2, 40, 96),
('EC5010', 2, 40, 97),
('EC5011', 2, 40, 98),
('EC8008', 2, 40, 92),
('EC8021', 2, 40, 93),
('EC8023', 2, 40, 94),
('EC8025', 2, 40, 95),
('ES1002', 2, 75, 2),
('ES1003', 1, 150, 3),
('ES1003', 2, 150, 3),
('ES1003', 3, 150, 3),
('ES1003', 4, 150, 3),
('HS1001', 1, 150, 4),
('HS1001', 2, 150, 4),
('HS1001', 3, 150, 4),
('HS1001', 4, 150, 4),
('HS1002', 1, 150, 40),
('HS1002', 2, 150, 40),
('HS1002', 3, 150, 40),
('HS1002', 4, 150, 40),
('IT1001', 1, 150, 7),
('IT1002', 1, 150, 8),
('ME2002', 3, 70, 27),
('ME2002', 5, 66, 27),
('ME2005', 3, 70, 23),
('ME2006', 3, 70, 24),
('ME2007', 3, 70, 25),
('ME2008', 3, 70, 26),
('ME3001', 3, 70, 61),
('ME3002', 3, 70, 62),
('ME3003', 3, 70, 63),
('ME3004', 3, 70, 64),
('ME5D02', 3, 40, 106),
('ME8007', 3, 40, 99),
('ME8011', 3, 40, 100),
('ME8014', 3, 40, 101),
('ME8018', 3, 40, 102),
('ME8019', 3, 40, 103),
('ME8021', 3, 40, 104),
('ME8025', 3, 40, 105),
('NS1003a', 1, 75, 37),
('NS1003a', 2, 75, 37),
('NS1003a', 3, 75, 37),
('NS1003a', 4, 75, 37),
('NS1003b', 1, 75, 38),
('NS1003b', 2, 75, 38),
('NS1003b', 3, 75, 38),
('NS1003b', 4, 75, 38),
('NS1004', 1, 150, 39),
('NS1004', 2, 150, 39),
('NS1004', 3, 150, 39),
('NS1004', 4, 150, 39),
('OE2C03', 1, 40, 41),
('OE2C03', 2, 40, 41),
('OE2C03', 3, 40, 41),
('OE2C03', 4, 40, 41),
('OE2C09', 1, 40, 51),
('OE2C09', 2, 40, 51),
('OE2C09', 3, 40, 51),
('OE2C09', 4, 40, 51),
('OE2C10', 1, 40, 42),
('OE2C10', 2, 40, 42),
('OE2C10', 3, 40, 42),
('OE2C10', 4, 40, 42),
('OE2D05', 1, 40, 46),
('OE2D05', 2, 40, 46),
('OE2D05', 3, 40, 46),
('OE2D05', 4, 40, 46),
('OE2D06', 1, 40, 47),
('OE2D06', 2, 40, 47),
('OE2D06', 3, 40, 47),
('OE2D06', 4, 40, 47),
('OE2E03', 1, 40, 43),
('OE2E03', 2, 40, 43),
('OE2E03', 3, 40, 43),
('OE2E03', 4, 40, 43),
('OE2E04', 1, 40, 44),
('OE2E04', 2, 40, 44),
('OE2E04', 3, 40, 44),
('OE2E04', 4, 40, 44),
('OE2E05', 1, 40, 45),
('OE2E05', 2, 40, 45),
('OE2E05', 3, 40, 45),
('OE2E05', 4, 40, 45),
('OE2M06', 1, 40, 48),
('OE2M06', 2, 40, 48),
('OE2M06', 3, 40, 48),
('OE2M06', 4, 40, 48),
('OE2N05', 1, 40, 50),
('OE2N05', 2, 40, 50),
('OE2N05', 3, 40, 50),
('OE2N05', 4, 40, 50),
('OE2S09', 1, 40, 49),
('OE2S09', 2, 40, 49),
('OE2S09', 3, 40, 49),
('OE2S09', 4, 40, 49),
('OE3C37', 1, 40, 72),
('OE3C37', 2, 40, 72),
('OE3C37', 3, 40, 72),
('OE3C37', 4, 40, 72),
('OE3C38', 1, 40, 68),
('OE3C38', 2, 40, 68),
('OE3C38', 3, 40, 68),
('OE3C38', 4, 40, 68),
('OE3C41', 1, 40, 77),
('OE3C41', 2, 40, 77),
('OE3C41', 3, 40, 77),
('OE3C41', 4, 40, 77),
('OE3D06', 1, 40, 74),
('OE3D06', 2, 40, 74),
('OE3D06', 3, 40, 74),
('OE3D06', 4, 40, 74),
('OE3D20', 1, 40, 70),
('OE3D20', 2, 40, 70),
('OE3D20', 3, 40, 70),
('OE3D20', 4, 40, 70),
('OE3E09', 1, 40, 69),
('OE3E09', 2, 40, 69),
('OE3E09', 3, 40, 69),
('OE3E09', 4, 40, 69),
('OE3E30', 1, 40, 73),
('OE3E30', 2, 40, 73),
('OE3E30', 3, 40, 73),
('OE3E30', 4, 40, 73),
('OE3E35', 1, 40, 78),
('OE3E35', 2, 40, 78),
('OE3E35', 3, 40, 78),
('OE3E35', 4, 40, 78),
('OE3M34', 1, 40, 75),
('OE3M34', 2, 40, 75),
('OE3M34', 3, 40, 75),
('OE3M34', 4, 40, 75),
('OE3M35', 1, 40, 71),
('OE3M35', 2, 40, 71),
('OE3M35', 3, 40, 71),
('OE3M35', 4, 40, 71),
('OE3M36', 1, 40, 76),
('OE3M36', 2, 40, 76),
('OE3M36', 3, 40, 76),
('OE3M36', 4, 40, 76),
('OE3M37', 1, 40, 79),
('OE3M37', 2, 40, 79),
('OE3M37', 3, 40, 79),
('OE3M37', 4, 40, 79),
('OE3N37', 1, 40, 80),
('OE3N37', 2, 40, 80),
('OE3N37', 3, 40, 80),
('OE3N37', 4, 40, 80),
('SM2005', 4, 50, 28),
('SM2006', 4, 50, 29),
('SM2007', 4, 50, 30),
('SM2008', 4, 50, 31),
('SM3001', 4, 50, 65),
('SM3002', 4, 50, 66),
('SM3003', 4, 50, 67);

-- --------------------------------------------------------

--
-- Table structure for table `course_components`
--

CREATE TABLE `course_components` (
  `component_id` int(11) NOT NULL,
  `course_code` varchar(20) DEFAULT NULL,
  `component_type` enum('THEORY','TUTORIAL','LAB') NOT NULL,
  `lab_group_type` enum('COMBINED','SPLIT') DEFAULT 'COMBINED',
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_components`
--

INSERT INTO `course_components` (`component_id`, `course_code`, `component_type`, `lab_group_type`, `course_id`) VALUES
(1, 'ES1003', 'THEORY', 'COMBINED', 3),
(2, 'ES1003', 'THEORY', 'COMBINED', 3),
(3, 'ES1003', 'THEORY', 'COMBINED', 3),
(4, 'ES1002', 'LAB', 'SPLIT', 2),
(5, 'ES1002', 'LAB', 'SPLIT', 2),
(6, 'EC1001', 'THEORY', 'COMBINED', 6),
(7, 'EC1001', 'THEORY', 'COMBINED', 6),
(8, 'EC1001', 'THEORY', 'COMBINED', 6),
(9, 'IT1001', 'THEORY', 'COMBINED', 7),
(10, 'IT1001', 'THEORY', 'COMBINED', 7),
(11, 'IT1001', 'THEORY', 'COMBINED', 7),
(12, 'IT1001', 'LAB', 'COMBINED', 7),
(13, 'IT1001', 'LAB', 'COMBINED', 7),
(14, 'IT1002', 'THEORY', 'COMBINED', 8),
(15, 'IT1002', 'THEORY', 'COMBINED', 8),
(16, 'IT1002', 'THEORY', 'COMBINED', 8),
(17, 'IT1002', 'LAB', 'COMBINED', 8),
(18, 'IT1002', 'LAB', 'COMBINED', 8),
(19, 'HS1001', 'THEORY', 'COMBINED', 4),
(20, 'HS1001', 'THEORY', 'COMBINED', 4),
(21, 'DS1001', 'THEORY', 'COMBINED', 9),
(22, 'DS1001', 'THEORY', 'COMBINED', 9),
(23, 'DS1001', 'THEORY', 'COMBINED', 9),
(24, 'DS1002', 'THEORY', 'COMBINED', 10),
(25, 'DS1002', 'THEORY', 'COMBINED', 10),
(26, 'DS1002', 'THEORY', 'COMBINED', 10),
(27, 'DS1003', 'THEORY', 'COMBINED', 11),
(28, 'DS1003', 'THEORY', 'COMBINED', 11),
(29, 'DS1003', 'LAB', 'COMBINED', 11),
(30, 'DS1003', 'LAB', 'COMBINED', 11),
(31, 'DS1004', 'THEORY', 'COMBINED', 12),
(32, 'DS1004', 'THEORY', 'COMBINED', 12),
(33, 'DS1004', 'THEORY', 'COMBINED', 12),
(34, 'DS1005', 'THEORY', 'COMBINED', 13),
(35, 'DS1005', 'THEORY', 'COMBINED', 13),
(36, 'DS1005', 'LAB', 'SPLIT', 13),
(37, 'DS1005', 'LAB', 'SPLIT', 13),
(38, 'CS2006', 'THEORY', 'COMBINED', 14),
(39, 'CS2006', 'THEORY', 'COMBINED', 14),
(40, 'CS2006', 'THEORY', 'COMBINED', 14),
(41, 'CS2006', 'TUTORIAL', 'COMBINED', 14),
(42, 'CS2007', 'THEORY', 'COMBINED', 15),
(43, 'CS2007', 'THEORY', 'COMBINED', 15),
(44, 'CS2007', 'THEORY', 'COMBINED', 15),
(45, 'CS2007', 'TUTORIAL', 'COMBINED', 15),
(46, 'CS2008', 'THEORY', 'COMBINED', 16),
(47, 'CS2008', 'THEORY', 'COMBINED', 16),
(48, 'CS2008', 'THEORY', 'COMBINED', 16),
(49, 'CS2008', 'TUTORIAL', 'COMBINED', 16),
(50, 'CS2008', 'LAB', 'SPLIT', 16),
(51, 'CS2008', 'LAB', 'SPLIT', 16),
(52, 'CS2009', 'THEORY', 'COMBINED', 17),
(53, 'CS2009', 'THEORY', 'COMBINED', 17),
(54, 'CS2009', 'THEORY', 'COMBINED', 17),
(55, 'CS2009', 'TUTORIAL', 'COMBINED', 17),
(56, 'CS2009', 'LAB', 'SPLIT', 17),
(57, 'CS2009', 'LAB', 'SPLIT', 17),
(58, 'EC2005', 'THEORY', 'COMBINED', 18),
(59, 'EC2005', 'THEORY', 'COMBINED', 18),
(60, 'EC2005', 'THEORY', 'COMBINED', 18),
(61, 'EC2005', 'LAB', 'SPLIT', 18),
(62, 'EC2005', 'LAB', 'SPLIT', 18),
(63, 'EC2006', 'THEORY', 'COMBINED', 19),
(64, 'EC2006', 'THEORY', 'COMBINED', 19),
(65, 'EC2006', 'THEORY', 'COMBINED', 19),
(66, 'EC2006', 'LAB', 'SPLIT', 19),
(67, 'EC2006', 'LAB', 'SPLIT', 19),
(68, 'EC207a', 'THEORY', 'COMBINED', 20),
(69, 'EC207a', 'THEORY', 'COMBINED', 20),
(70, 'EC207a', 'THEORY', 'COMBINED', 20),
(71, 'EC207b', 'THEORY', 'COMBINED', 21),
(72, 'EC207b', 'THEORY', 'COMBINED', 21),
(73, 'EC207b', 'THEORY', 'COMBINED', 21),
(74, 'EC2008', 'THEORY', 'COMBINED', 22),
(75, 'EC2008', 'THEORY', 'COMBINED', 22),
(76, 'EC2008', 'THEORY', 'COMBINED', 22),
(77, 'EC2008', 'LAB', 'SPLIT', 22),
(78, 'EC2008', 'LAB', 'SPLIT', 22),
(79, 'ME2005', 'THEORY', 'COMBINED', 23),
(80, 'ME2005', 'THEORY', 'COMBINED', 23),
(81, 'ME2005', 'THEORY', 'COMBINED', 23),
(82, 'ME2006', 'THEORY', 'COMBINED', 24),
(83, 'ME2006', 'THEORY', 'COMBINED', 24),
(84, 'ME2006', 'THEORY', 'COMBINED', 24),
(85, 'ME2006', 'LAB', 'SPLIT', 24),
(86, 'ME2006', 'LAB', 'SPLIT', 24),
(87, 'ME2007', 'THEORY', 'COMBINED', 25),
(88, 'ME2007', 'THEORY', 'COMBINED', 25),
(89, 'ME2007', 'THEORY', 'COMBINED', 25),
(90, 'ME2007', 'LAB', 'SPLIT', 25),
(91, 'ME2007', 'LAB', 'SPLIT', 25),
(92, 'ME2008', 'THEORY', 'COMBINED', 26),
(93, 'ME2008', 'THEORY', 'COMBINED', 26),
(94, 'ME2008', 'THEORY', 'COMBINED', 26),
(95, 'ME2008', 'LAB', 'SPLIT', 26),
(96, 'ME2008', 'LAB', 'SPLIT', 26),
(97, 'ME2002', 'THEORY', 'COMBINED', 27),
(98, 'ME2002', 'THEORY', 'COMBINED', 27),
(99, 'ME2002', 'LAB', 'SPLIT', 27),
(100, 'ME2002', 'LAB', 'SPLIT', 27),
(101, 'SM2005', 'THEORY', 'COMBINED', 28),
(102, 'SM2005', 'THEORY', 'COMBINED', 28),
(103, 'SM2005', 'THEORY', 'COMBINED', 28),
(104, 'SM2006', 'THEORY', 'COMBINED', 29),
(105, 'SM2006', 'THEORY', 'COMBINED', 29),
(106, 'SM2006', 'THEORY', 'COMBINED', 29),
(107, 'SM2006', 'TUTORIAL', 'COMBINED', 29),
(108, 'SM2006', 'LAB', 'COMBINED', 29),
(109, 'SM2006', 'LAB', 'COMBINED', 29),
(110, 'SM2007', 'THEORY', 'COMBINED', 30),
(111, 'SM2007', 'THEORY', 'COMBINED', 30),
(112, 'SM2007', 'THEORY', 'COMBINED', 30),
(113, 'SM2007', 'LAB', 'COMBINED', 30),
(114, 'SM2007', 'LAB', 'COMBINED', 30),
(115, 'SM2008', 'THEORY', 'COMBINED', 31),
(116, 'SM2008', 'THEORY', 'COMBINED', 31),
(117, 'SM2008', 'THEORY', 'COMBINED', 31),
(118, 'SM2008', 'LAB', 'COMBINED', 31),
(119, 'SM2008', 'LAB', 'COMBINED', 31),
(120, 'DS2009', 'THEORY', 'COMBINED', 32),
(121, 'DS2009', 'THEORY', 'COMBINED', 32),
(122, 'DS2009', 'LAB', 'COMBINED', 32),
(123, 'DS2009', 'LAB', 'COMBINED', 32),
(124, 'DS2011', 'THEORY', 'COMBINED', 33),
(125, 'DS2011', 'LAB', 'COMBINED', 33),
(126, 'DS2011', 'LAB', 'COMBINED', 33),
(127, 'DS2012', 'THEORY', 'COMBINED', 34),
(128, 'DS2012', 'LAB', 'COMBINED', 34),
(129, 'DS2012', 'LAB', 'COMBINED', 34),
(130, 'DS2012', 'LAB', 'COMBINED', 34),
(131, 'DS1007', 'THEORY', 'COMBINED', 35),
(132, 'DS1007', 'THEORY', 'COMBINED', 35),
(133, 'DS1007', 'LAB', 'COMBINED', 35),
(134, 'DS1007', 'LAB', 'COMBINED', 35),
(135, 'DS1008', 'THEORY', 'COMBINED', 36),
(136, 'DS1008', 'THEORY', 'COMBINED', 36),
(137, 'NS1003a', 'THEORY', 'COMBINED', 37),
(138, 'NS1003a', 'LAB', 'SPLIT', 37),
(139, 'NS1003a', 'LAB', 'SPLIT', 37),
(140, 'NS1003b', 'THEORY', 'COMBINED', 38),
(141, 'NS1003b', 'LAB', 'SPLIT', 38),
(142, 'NS1003b', 'LAB', 'SPLIT', 38),
(143, 'NS1004', 'THEORY', 'COMBINED', 39),
(144, 'NS1004', 'THEORY', 'COMBINED', 39),
(145, 'NS1004', 'THEORY', 'COMBINED', 39),
(146, 'NS1004', 'TUTORIAL', 'COMBINED', 39),
(147, 'HS1002', 'THEORY', 'COMBINED', 40),
(148, 'HS1002', 'THEORY', 'COMBINED', 40),
(149, 'HS1002', 'THEORY', 'COMBINED', 40),
(150, 'OE2C03', 'THEORY', 'COMBINED', 41),
(151, 'OE2C03', 'THEORY', 'COMBINED', 41),
(152, 'OE2C10', 'THEORY', 'COMBINED', 42),
(153, 'OE2C10', 'THEORY', 'COMBINED', 42),
(154, 'OE2E03', 'THEORY', 'COMBINED', 43),
(155, 'OE2E03', 'THEORY', 'COMBINED', 43),
(156, 'OE2E04', 'THEORY', 'COMBINED', 44),
(157, 'OE2E04', 'THEORY', 'COMBINED', 44),
(158, 'OE2E05', 'THEORY', 'COMBINED', 45),
(159, 'OE2E05', 'THEORY', 'COMBINED', 45),
(160, 'OE2D05', 'THEORY', 'COMBINED', 46),
(161, 'OE2D05', 'THEORY', 'COMBINED', 46),
(162, 'OE2D06', 'THEORY', 'COMBINED', 47),
(163, 'OE2D06', 'THEORY', 'COMBINED', 47),
(164, 'OE2M06', 'THEORY', 'COMBINED', 48),
(165, 'OE2M06', 'THEORY', 'COMBINED', 48),
(166, 'OE2S09', 'THEORY', 'COMBINED', 49),
(167, 'OE2S09', 'THEORY', 'COMBINED', 49),
(168, 'OE2N05', 'THEORY', 'COMBINED', 50),
(169, 'OE2N05', 'THEORY', 'COMBINED', 50),
(170, 'OE2C09', 'THEORY', 'COMBINED', 51),
(171, 'OE2C09', 'THEORY', 'COMBINED', 51),
(172, 'CS3001', 'THEORY', 'COMBINED', 52),
(173, 'CS3001', 'THEORY', 'COMBINED', 52),
(174, 'CS3001', 'THEORY', 'COMBINED', 52),
(175, 'CS3001', 'LAB', 'SPLIT', 52),
(176, 'CS3001', 'LAB', 'SPLIT', 52),
(177, 'CS3002', 'THEORY', 'COMBINED', 53),
(178, 'CS3002', 'THEORY', 'COMBINED', 53),
(179, 'CS3002', 'THEORY', 'COMBINED', 53),
(180, 'CS3002', 'LAB', 'SPLIT', 53),
(181, 'CS3002', 'LAB', 'SPLIT', 53),
(182, 'CS3003', 'THEORY', 'COMBINED', 54),
(183, 'CS3003', 'THEORY', 'COMBINED', 54),
(184, 'CS3003', 'THEORY', 'COMBINED', 54),
(185, 'CS3004', 'THEORY', 'COMBINED', 55),
(186, 'CS3004', 'THEORY', 'COMBINED', 55),
(187, 'CS3004', 'THEORY', 'COMBINED', 55),
(188, 'CS3004', 'LAB', 'SPLIT', 55),
(189, 'CS3004', 'LAB', 'SPLIT', 55),
(190, 'CS3005', 'THEORY', 'COMBINED', 56),
(191, 'CS3005', 'THEORY', 'COMBINED', 56),
(192, 'CS3005', 'THEORY', 'COMBINED', 56),
(193, 'EC3001', 'THEORY', 'COMBINED', 57),
(194, 'EC3001', 'THEORY', 'COMBINED', 57),
(195, 'EC3001', 'THEORY', 'COMBINED', 57),
(196, 'EC3001', 'LAB', 'SPLIT', 57),
(197, 'EC3001', 'LAB', 'SPLIT', 57),
(198, 'EC3002', 'THEORY', 'COMBINED', 58),
(199, 'EC3002', 'THEORY', 'COMBINED', 58),
(200, 'EC3002', 'THEORY', 'COMBINED', 58),
(201, 'EC3003', 'THEORY', 'COMBINED', 59),
(202, 'EC3003', 'THEORY', 'COMBINED', 59),
(203, 'EC3003', 'THEORY', 'COMBINED', 59),
(204, 'EC3003', 'LAB', 'SPLIT', 59),
(205, 'EC3003', 'LAB', 'SPLIT', 59),
(206, 'EC3004', 'THEORY', 'COMBINED', 60),
(207, 'EC3004', 'THEORY', 'COMBINED', 60),
(208, 'EC3004', 'THEORY', 'COMBINED', 60),
(209, 'ME3001', 'THEORY', 'COMBINED', 61),
(210, 'ME3001', 'THEORY', 'COMBINED', 61),
(211, 'ME3001', 'THEORY', 'COMBINED', 61),
(212, 'ME3002', 'THEORY', 'COMBINED', 62),
(213, 'ME3002', 'THEORY', 'COMBINED', 62),
(214, 'ME3002', 'THEORY', 'COMBINED', 62),
(215, 'ME3002', 'LAB', 'SPLIT', 62),
(216, 'ME3002', 'LAB', 'SPLIT', 62),
(217, 'ME3003', 'THEORY', 'COMBINED', 63),
(218, 'ME3003', 'THEORY', 'COMBINED', 63),
(219, 'ME3003', 'THEORY', 'COMBINED', 63),
(220, 'ME3004', 'THEORY', 'COMBINED', 64),
(221, 'ME3004', 'THEORY', 'COMBINED', 64),
(222, 'ME3004', 'THEORY', 'COMBINED', 64),
(223, 'ME3004', 'LAB', 'COMBINED', 64),
(224, 'ME3004', 'LAB', 'COMBINED', 64),
(225, 'SM3001', 'THEORY', 'COMBINED', 65),
(226, 'SM3001', 'THEORY', 'COMBINED', 65),
(227, 'SM3001', 'THEORY', 'COMBINED', 65),
(228, 'SM3002', 'THEORY', 'COMBINED', 66),
(229, 'SM3002', 'THEORY', 'COMBINED', 66),
(230, 'SM3002', 'THEORY', 'COMBINED', 66),
(231, 'SM3003', 'THEORY', 'COMBINED', 67),
(232, 'SM3003', 'THEORY', 'COMBINED', 67),
(233, 'SM3003', 'THEORY', 'COMBINED', 67),
(234, 'SM3003', 'LAB', 'COMBINED', 67),
(235, 'SM3003', 'LAB', 'COMBINED', 67),
(236, 'OE3C38', 'THEORY', 'COMBINED', 68),
(237, 'OE3C38', 'THEORY', 'COMBINED', 68),
(238, 'OE3E09', 'THEORY', 'COMBINED', 69),
(239, 'OE3E09', 'THEORY', 'COMBINED', 69),
(240, 'OE3D20', 'THEORY', 'COMBINED', 70),
(241, 'OE3D20', 'THEORY', 'COMBINED', 70),
(242, 'OE3M35', 'THEORY', 'COMBINED', 71),
(243, 'OE3M35', 'THEORY', 'COMBINED', 71),
(244, 'OE3C37', 'THEORY', 'COMBINED', 72),
(245, 'OE3C37', 'THEORY', 'COMBINED', 72),
(246, 'OE3E30', 'THEORY', 'COMBINED', 73),
(247, 'OE3E30', 'THEORY', 'COMBINED', 73),
(248, 'OE3D06', 'THEORY', 'COMBINED', 74),
(249, 'OE3D06', 'THEORY', 'COMBINED', 74),
(250, 'OE3M34', 'THEORY', 'COMBINED', 75),
(251, 'OE3M34', 'THEORY', 'COMBINED', 75),
(252, 'OE3M36', 'THEORY', 'COMBINED', 76),
(253, 'OE3M36', 'THEORY', 'COMBINED', 76),
(254, 'OE3C41', 'THEORY', 'COMBINED', 77),
(255, 'OE3C41', 'THEORY', 'COMBINED', 77),
(256, 'OE3E35', 'THEORY', 'COMBINED', 78),
(257, 'OE3E35', 'THEORY', 'COMBINED', 78),
(258, 'OE3M37', 'THEORY', 'COMBINED', 79),
(259, 'OE3M37', 'THEORY', 'COMBINED', 79),
(260, 'OE3N37', 'THEORY', 'COMBINED', 80),
(261, 'OE3N37', 'THEORY', 'COMBINED', 80),
(262, 'CS8009', 'THEORY', 'COMBINED', 82),
(263, 'CS8009', 'THEORY', 'COMBINED', 82),
(264, 'CS8009', 'THEORY', 'COMBINED', 82),
(265, 'CS8009', 'LAB', 'SPLIT', 82),
(266, 'CS8009', 'LAB', 'SPLIT', 82),
(267, 'CS8010', 'THEORY', 'COMBINED', 83),
(268, 'CS8010', 'THEORY', 'COMBINED', 83),
(269, 'CS8010', 'THEORY', 'COMBINED', 83),
(270, 'CS8010', 'LAB', 'SPLIT', 83),
(271, 'CS8010', 'LAB', 'SPLIT', 83),
(272, 'CS8011', 'THEORY', 'COMBINED', 84),
(273, 'CS8011', 'THEORY', 'COMBINED', 84),
(274, 'CS8011', 'THEORY', 'COMBINED', 84),
(275, 'CS8015', 'THEORY', 'COMBINED', 85),
(276, 'CS8015', 'THEORY', 'COMBINED', 85),
(277, 'CS8015', 'THEORY', 'COMBINED', 85),
(278, 'CS8015', 'LAB', 'SPLIT', 85),
(279, 'CS8015', 'LAB', 'SPLIT', 85),
(280, 'CS8027', 'THEORY', 'COMBINED', 86),
(281, 'CS8027', 'THEORY', 'COMBINED', 86),
(282, 'CS8027', 'THEORY', 'COMBINED', 86),
(283, 'CS8033', 'THEORY', 'COMBINED', 87),
(284, 'CS8033', 'THEORY', 'COMBINED', 87),
(285, 'CS8033', 'THEORY', 'COMBINED', 87),
(286, 'CS8034', 'THEORY', 'COMBINED', 88),
(287, 'CS8034', 'THEORY', 'COMBINED', 88),
(288, 'CS8034', 'THEORY', 'COMBINED', 88),
(289, 'CS8034', 'LAB', 'SPLIT', 88),
(290, 'CS8034', 'LAB', 'SPLIT', 88),
(291, 'CS8035', 'THEORY', 'COMBINED', 89),
(292, 'CS8035', 'THEORY', 'COMBINED', 89),
(293, 'CS8035', 'THEORY', 'COMBINED', 89),
(294, 'CS8035', 'LAB', 'SPLIT', 89),
(295, 'CS8035', 'LAB', 'SPLIT', 89),
(296, 'CS8038', 'THEORY', 'COMBINED', 90),
(297, 'CS8038', 'THEORY', 'COMBINED', 90),
(298, 'CS8038', 'THEORY', 'COMBINED', 90),
(299, 'CS8039', 'THEORY', 'COMBINED', 91),
(300, 'CS8039', 'THEORY', 'COMBINED', 91),
(301, 'CS8039', 'THEORY', 'COMBINED', 91),
(302, 'CS8039', 'LAB', 'SPLIT', 91),
(303, 'CS8039', 'LAB', 'SPLIT', 91),
(304, 'EC8008', 'THEORY', 'COMBINED', 92),
(305, 'EC8008', 'THEORY', 'COMBINED', 92),
(306, 'EC8008', 'THEORY', 'COMBINED', 92),
(307, 'EC8021', 'THEORY', 'COMBINED', 93),
(308, 'EC8021', 'THEORY', 'COMBINED', 93),
(309, 'EC8021', 'THEORY', 'COMBINED', 93),
(310, 'EC8023', 'THEORY', 'COMBINED', 94),
(311, 'EC8023', 'THEORY', 'COMBINED', 94),
(312, 'EC8023', 'THEORY', 'COMBINED', 94),
(313, 'EC8025', 'THEORY', 'COMBINED', 95),
(314, 'EC8025', 'THEORY', 'COMBINED', 95),
(315, 'EC8025', 'THEORY', 'COMBINED', 95),
(316, 'EC5009', 'THEORY', 'COMBINED', 96),
(317, 'EC5009', 'THEORY', 'COMBINED', 96),
(318, 'EC5009', 'THEORY', 'COMBINED', 96),
(319, 'EC5010', 'THEORY', 'COMBINED', 97),
(320, 'EC5010', 'THEORY', 'COMBINED', 97),
(321, 'EC5010', 'THEORY', 'COMBINED', 97),
(322, 'EC5011', 'THEORY', 'COMBINED', 98),
(323, 'EC5011', 'THEORY', 'COMBINED', 98),
(324, 'EC5011', 'THEORY', 'COMBINED', 98),
(325, 'ME8007', 'THEORY', 'COMBINED', 99),
(326, 'ME8007', 'THEORY', 'COMBINED', 99),
(327, 'ME8007', 'THEORY', 'COMBINED', 99),
(328, 'ME8011', 'THEORY', 'COMBINED', 100),
(329, 'ME8011', 'THEORY', 'COMBINED', 100),
(330, 'ME8011', 'THEORY', 'COMBINED', 100),
(331, 'ME8011', 'LAB', 'COMBINED', 100),
(332, 'ME8011', 'LAB', 'COMBINED', 100),
(333, 'ME8014', 'THEORY', 'COMBINED', 101),
(334, 'ME8014', 'THEORY', 'COMBINED', 101),
(335, 'ME8014', 'THEORY', 'COMBINED', 101),
(336, 'ME8018', 'THEORY', 'COMBINED', 102),
(337, 'ME8018', 'THEORY', 'COMBINED', 102),
(338, 'ME8018', 'THEORY', 'COMBINED', 102),
(339, 'ME8019', 'THEORY', 'COMBINED', 103),
(340, 'ME8019', 'THEORY', 'COMBINED', 103),
(341, 'ME8019', 'THEORY', 'COMBINED', 103),
(342, 'ME8019', 'LAB', 'COMBINED', 103),
(343, 'ME8019', 'LAB', 'COMBINED', 103),
(344, 'ME8021', 'THEORY', 'COMBINED', 104),
(345, 'ME8021', 'THEORY', 'COMBINED', 104),
(346, 'ME8021', 'THEORY', 'COMBINED', 104),
(347, 'ME8025', 'THEORY', 'COMBINED', 105),
(348, 'ME8025', 'THEORY', 'COMBINED', 105),
(349, 'ME8025', 'THEORY', 'COMBINED', 105),
(350, 'ME5D02', 'THEORY', 'COMBINED', 106),
(351, 'ME5D02', 'THEORY', 'COMBINED', 106),
(352, 'ME5D02', 'THEORY', 'COMBINED', 106);

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
('P101', 'Akshay Kumar Pandey', 'AKP', 'akp@iiitdmj.ac.in', 18),
('P102', 'Aparajita Ojha', 'AO', 'ao@iiitdmj.ac.in', 20),
('P103', 'Ayan Seal', 'AS', 'as@iiitdmj.ac.in', 18),
('P104', 'Pritee Khanna', 'PK', 'pk@iiitdmj.ac.in', 18),
('P105', 'Sraban Kumar Mohanty', 'SKM', 'skm@iiitdmj.ac.in', 20),
('P106', 'Ranjeet Kumar Ranjan', 'RKR', 'rkr@iiitdmj.ac.in', 20),
('P107', 'Siddharth Nath Sinha', 'SNS', 'sns@iiitdmj.ac.in', 18),
('P108', 'Shyam Murthy', 'ShM', 'shm@iiitdmj.ac.in', 18),
('P109', 'Sunil Kumar Chauhan', 'SKC', 'skc@iiitdmj.ac.in', 18),
('P110', 'Sunil Kumar Tripathi', 'SKT', 'skt@iiitdmj.ac.in', 18),
('P111', 'Manoranjan Satpathy', 'MS', 'ms@iiitdmj.ac.in', 18),
('P112', 'Phalguni Mukherjee', 'PM', 'pm@iiitdmj.ac.in', 18),
('P113', 'Nidhi Agarwal', 'NA', 'na@iiitdmj.ac.in', 18),
('P114', 'Neeraj Dhiman', 'ND', 'nd@iiitdmj.ac.in', 18),
('P115', 'Prashant Kumar Pattnaik', 'PKP', 'pkp@iiitdmj.ac.in', 20),
('P116', 'Kapil Dev', 'KD', 'kd@iiitdmj.ac.in', 18),
('P117', 'Tapas Kumar', 'TK', 'tk@iiitdmj.ac.in', 18),
('P118', 'Tejinder Pal Singh', 'TC', 'tc@iiitdmj.ac.in', 18),
('P119', 'Jayanta Kumar Tripathi', 'JKT', 'jkt@iiitdmj.ac.in', 18),
('P120', 'Tarun Singh Gora', 'TSG', 'tsg@iiitdmj.ac.in', 18),
('P121', 'Ravi Prakash', 'RP', 'rp@iiitdmj.ac.in', 18),
('P122', 'Anuj Mohan', 'AM', 'am@iiitdmj.ac.in', 18),
('P123', 'Kapil Patel', 'KP', 'kp@iiitdmj.ac.in', 18),
('P124', 'Sanjay Arora', 'SA', 'sa@iiitdmj.ac.in', 18),
('P125', 'Sandeep Prakash', 'SP', 'sp@iiitdmj.ac.in', 18),
('P126', 'Ankit Bansal', 'AB', 'ab@iiitdmj.ac.in', 18),
('P127', 'Madan Kumar Bhatt', 'MKB', 'mkb@iiitdmj.ac.in', 16),
('P128', 'Deepak Pal Singh', 'DPS', 'dps@iiitdmj.ac.in', 18),
('P129', 'Avinash Sharma', 'AV', 'av@iiitdmj.ac.in', 16),
('P130', 'Manoj Arora', 'MA', 'ma@iiitdmj.ac.in', 18),
('P131', 'Dhruba Mahapatra', 'DM', 'dm@iiitdmj.ac.in', 16),
('P132', 'Piyush Rai', 'PR', 'pr@iiitdmj.ac.in', 18),
('P133', 'Ajay Gupta', 'AG', 'ag@iiitdmj.ac.in', 18),
('P134', 'Amit Srivastava', 'AdS', 'ads@iiitdmj.ac.in', 16),
('P135', 'Sandeep Kumar Soni', 'SKS', 'sks@iiitdmj.ac.in', 18),
('P136', 'Manoj Zade', 'MZA', 'mza@iiitdmj.ac.in', 18),
('P137', 'Shankar Mohan', 'SM2', 'sm2@iiitdmj.ac.in', 18),
('P138', 'Mukesh Kumar Thakur', 'MKT', 'mkt@iiitdmj.ac.in', 18),
('P139', 'Hari Singh Nain', 'HSN', 'hsn@iiitdmj.ac.in', 16),
('P140', 'Sandeep D Pandey', 'SDP', 'sdp@iiitdmj.ac.in', 18),
('P141', 'Arjun Singh Rathore', 'ARR', 'arr@iiitdmj.ac.in', 18),
('P142', 'Pradeep Tripathi', 'PT', 'pt@iiitdmj.ac.in', 18),
('P143', 'Vinay Kumar Gupta', 'VKG', 'vkg@iiitdmj.ac.in', 18),
('P144', 'Deepak Singh', 'DS', 'ds@iiitdmj.ac.in', 16),
('P145', 'Asish Priyadarshi', 'ASP', 'asp@iiitdmj.ac.in', 18),
('P146', 'Sanjay Kumar Jain', 'SKJ', 'skj@iiitdmj.ac.in', 18),
('P147', 'Manish Kumar Prasad', 'MKP', 'mkp@iiitdmj.ac.in', 18),
('P148', 'Anil Kumar', 'AK', 'ak@iiitdmj.ac.in', 16),
('P149', 'Ashok Kumar Mohanty', 'AKK', 'akk@iiitdmj.ac.in', 16),
('P150', 'Yashvardhan Singh', 'YSK', 'ysk@iiitdmj.ac.in', 16),
('P151', 'Naresh Kumar Jain', 'NRJ', 'nrj@iiitdmj.ac.in', 16),
('P152', 'Bharat Gupta', 'BG', 'bg@iiitdmj.ac.in', 18),
('P153', 'Lalit Kumar Balani', 'LKB', 'lkb@iiitdmj.ac.in', 16),
('P154', 'SSL Faculty', 'SSL', 'ssl@iiitdmj.ac.in', 16),
('P155', 'JAMF Faculty', 'JAMF', 'jamf@iiitdmj.ac.in', 16),
('P156', 'ACM Faculty', 'ACM', 'acm@iiitdmj.ac.in', 16),
('P157', 'Chhavi Dhiman', 'CD', 'cd@iiitdmj.ac.in', 16),
('P158', 'NKM Faculty', 'NKM', 'nkm@iiitdmj.ac.in', 16),
('P159', 'Vivek Farma', 'VF', 'vf@iiitdmj.ac.in', 16),
('P160', 'Dhananjay Singh', 'DS3', 'ds3@iiitdmj.ac.in', 16),
('P161', 'Pankaj Narang', 'PNK', 'pnk@iiitdmj.ac.in', 16),
('P162', 'Manish Dixit Bhatt', 'MDB', 'mdb@iiitdmj.ac.in', 16),
('P163', 'Bikram Mondal', 'BM', 'bm@iiitdmj.ac.in', 16),
('P164', 'Deepak Kumar Vishwakarma', 'DKV', 'dkv@iiitdmj.ac.in', 16),
('P165', 'Suresh Kumar Gupta', 'SGM', 'sgm@iiitdmj.ac.in', 16);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_branch`
--

CREATE TABLE `faculty_branch` (
  `faculty_id` varchar(20) NOT NULL,
  `branch_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_branch`
--

INSERT INTO `faculty_branch` (`faculty_id`, `branch_id`) VALUES
('P101', 1),
('P101', 2),
('P101', 3),
('P101', 4),
('P102', 1),
('P103', 1),
('P104', 1),
('P105', 1),
('P106', 1),
('P107', 2),
('P108', 1),
('P109', 1),
('P110', 2),
('P111', 4),
('P112', 4),
('P113', 1),
('P114', 1),
('P115', 2),
('P116', 2),
('P117', 2),
('P118', 3),
('P119', 3),
('P120', 4),
('P121', 3),
('P122', 3),
('P123', 4),
('P124', 4),
('P125', 5),
('P126', 5),
('P127', 1),
('P128', 2),
('P130', 5),
('P131', 5),
('P132', 2),
('P134', 1),
('P135', 3),
('P136', 3),
('P137', 4),
('P138', 3),
('P139', 3),
('P140', 3),
('P141', 4),
('P142', 3),
('P143', 3),
('P144', 1),
('P145', 1),
('P146', 2),
('P147', 1),
('P147', 2),
('P147', 3),
('P147', 4),
('P149', 1),
('P149', 2),
('P150', 1),
('P150', 2),
('P151', 1),
('P151', 2),
('P152', 1),
('P152', 2),
('P153', 1),
('P153', 2),
('P154', 1),
('P154', 2),
('P155', 1),
('P155', 3),
('P155', 4),
('P156', 1),
('P156', 2),
('P159', 5),
('P161', 2),
('P162', 2),
('P163', 2),
('P164', 1),
('P164', 2);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_course`
--

CREATE TABLE `faculty_course` (
  `faculty_id` varchar(20) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_course`
--

INSERT INTO `faculty_course` (`faculty_id`, `course_code`, `course_id`) VALUES
('P110', 'ES1002', 2),
('P117', 'ES1002', 2),
('P101', 'ES1003', 3),
('P109', 'ES1003', 3),
('P110', 'ES1003', 3),
('P111', 'ES1003', 3),
('P112', 'ES1003', 3),
('P115', 'EC1001', 6),
('P138', 'DS1005', 13),
('P141', 'DS1005', 13),
('P113', 'CS2006', 14),
('P108', 'CS2007', 15),
('P114', 'CS2008', 16),
('P106', 'CS2009', 17),
('P107', 'EC2005', 18),
('P115', 'EC2006', 19),
('P146', 'EC207a', 20),
('P110', 'EC207b', 21),
('P116', 'EC2008', 22),
('P119', 'ME2005', 23),
('P117', 'ME2006', 24),
('P121', 'ME2007', 25),
('P118', 'ME2008', 26),
('P142', 'ME2002', 27),
('P123', 'SM2005', 28),
('P122', 'SM2006', 29),
('P124', 'SM2007', 30),
('P115', 'SM2008', 31),
('P112', 'DS2009', 32),
('P126', 'DS2011', 33),
('P120', 'DS2012', 34),
('P125', 'DS1007', 35),
('P112', 'DS1008', 36),
('P147', 'NS1003a', 37),
('P154', 'NS1003a', 37),
('P152', 'NS1003b', 38),
('P153', 'NS1003b', 38),
('P149', 'NS1004', 39),
('P150', 'NS1004', 39),
('P151', 'NS1004', 39),
('P156', 'NS1004', 39),
('P130', 'HS1002', 40),
('P155', 'HS1002', 40),
('P103', 'OE2C03', 41),
('P102', 'OE2C10', 42),
('P132', 'OE2E03', 43),
('P129', 'OE2E04', 44),
('P107', 'OE2E05', 45),
('P159', 'OE2D05', 46),
('P159', 'OE2D06', 47),
('P143', 'OE2M06', 48),
('P157', 'OE2S09', 49),
('P158', 'OE2N05', 50),
('P144', 'OE2C09', 51),
('P102', 'CS3001', 52),
('P105', 'CS3002', 53),
('P103', 'CS3003', 54),
('P104', 'CS3004', 55),
('P108', 'CS3005', 56),
('P128', 'EC3001', 57),
('P132', 'EC3002', 58),
('P116', 'EC3003', 59),
('P107', 'EC3004', 60),
('P121', 'ME3001', 61),
('P138', 'ME3002', 62),
('P135', 'ME3003', 63),
('P140', 'ME3004', 64),
('P141', 'SM3001', 65),
('P122', 'SM3002', 66),
('P137', 'SM3003', 67),
('P127', 'OE3C38', 68),
('P128', 'OE3E09', 69),
('P159', 'OE3D20', 70),
('P141', 'OE3M35', 71),
('P127', 'OE3C37', 72),
('P164', 'OE3E30', 73),
('P130', 'OE3D06', 74),
('P109', 'OE3M34', 75),
('P142', 'OE3M36', 76),
('P145', 'OE3C41', 77),
('P129', 'OE3E35', 78),
('P121', 'OE3M37', 79),
('P131', 'OE3N37', 80),
('P102', 'CS8009', 82),
('P144', 'CS8009', 82),
('P144', 'CS8010', 83),
('P103', 'CS8011', 84),
('P104', 'CS8015', 85),
('P145', 'CS8027', 86),
('P102', 'CS8033', 87),
('P104', 'CS8033', 87),
('P105', 'CS8034', 88),
('P102', 'CS8035', 89),
('P105', 'CS8038', 90),
('P133', 'CS8039', 91),
('P146', 'EC8008', 92),
('P162', 'EC8021', 93),
('P117', 'EC8023', 94),
('P148', 'EC8025', 95),
('P128', 'EC5009', 96),
('P132', 'EC5010', 97),
('P116', 'EC5011', 98),
('P137', 'ME8007', 99),
('P135', 'ME8011', 100),
('P111', 'ME8014', 101),
('P136', 'ME8018', 102),
('P111', 'ME8019', 103),
('P140', 'ME8021', 104),
('P138', 'ME8025', 105),
('P140', 'ME5D02', 106);

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

--
-- Dumping data for table `master_timetable`
--

INSERT INTO `master_timetable` (`master_id`, `day`, `timeslot_id`, `program_id`, `branch_id`, `semester_id`, `section_id`, `subsection_id`, `course_code`, `faculty_id`, `room_id`, `component_type`) VALUES
(859, 'WEDNESDAY', 17, 1, 1, 3, 11, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(860, 'WEDNESDAY', 17, 1, 1, 3, 11, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(861, 'WEDNESDAY', 17, 1, 1, 3, 11, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(862, 'WEDNESDAY', 17, 1, 1, 3, 11, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(863, 'WEDNESDAY', 17, 1, 1, 3, 12, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(864, 'WEDNESDAY', 17, 1, 1, 3, 12, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(865, 'WEDNESDAY', 17, 1, 1, 3, 12, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(866, 'WEDNESDAY', 17, 1, 1, 3, 12, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(867, 'WEDNESDAY', 17, 1, 2, 3, 13, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(868, 'WEDNESDAY', 17, 1, 2, 3, 13, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(869, 'WEDNESDAY', 17, 1, 2, 3, 13, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(870, 'WEDNESDAY', 17, 1, 2, 3, 13, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(871, 'WEDNESDAY', 17, 1, 3, 3, 14, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(872, 'WEDNESDAY', 17, 1, 3, 3, 14, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(873, 'WEDNESDAY', 17, 1, 3, 3, 14, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(874, 'WEDNESDAY', 17, 1, 3, 3, 14, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(875, 'WEDNESDAY', 17, 1, 4, 3, 15, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(876, 'WEDNESDAY', 17, 1, 4, 3, 15, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(877, 'WEDNESDAY', 17, 1, 4, 3, 15, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(878, 'WEDNESDAY', 17, 1, 4, 3, 15, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(879, 'MONDAY', 1, 1, 1, 3, 11, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(880, 'MONDAY', 1, 1, 1, 3, 11, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(881, 'MONDAY', 1, 1, 1, 3, 11, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(882, 'MONDAY', 1, 1, 1, 3, 11, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(883, 'MONDAY', 1, 1, 1, 3, 12, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(884, 'MONDAY', 1, 1, 1, 3, 12, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(885, 'MONDAY', 1, 1, 1, 3, 12, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(886, 'MONDAY', 1, 1, 1, 3, 12, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(887, 'MONDAY', 1, 1, 2, 3, 13, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(888, 'MONDAY', 1, 1, 2, 3, 13, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(889, 'MONDAY', 1, 1, 2, 3, 13, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(890, 'MONDAY', 1, 1, 2, 3, 13, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(891, 'MONDAY', 1, 1, 3, 3, 14, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(892, 'MONDAY', 1, 1, 3, 3, 14, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(893, 'MONDAY', 1, 1, 3, 3, 14, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(894, 'MONDAY', 1, 1, 3, 3, 14, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(895, 'MONDAY', 1, 1, 4, 3, 15, NULL, 'OE3C38', 'P127', 11, 'THEORY'),
(896, 'MONDAY', 1, 1, 4, 3, 15, NULL, 'OE3E09', 'P128', 12, 'THEORY'),
(897, 'MONDAY', 1, 1, 4, 3, 15, NULL, 'OE3D20', 'P159', 13, 'THEORY'),
(898, 'MONDAY', 1, 1, 4, 3, 15, NULL, 'OE3M35', 'P141', 14, 'THEORY'),
(899, 'FRIDAY', 33, 1, 1, 3, 11, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(900, 'FRIDAY', 33, 1, 1, 3, 11, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(901, 'FRIDAY', 33, 1, 1, 3, 11, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(902, 'FRIDAY', 33, 1, 1, 3, 11, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(903, 'FRIDAY', 33, 1, 1, 3, 11, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(904, 'FRIDAY', 33, 1, 1, 3, 12, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(905, 'FRIDAY', 33, 1, 1, 3, 12, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(906, 'FRIDAY', 33, 1, 1, 3, 12, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(907, 'FRIDAY', 33, 1, 1, 3, 12, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(908, 'FRIDAY', 33, 1, 1, 3, 12, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(909, 'FRIDAY', 33, 1, 2, 3, 13, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(910, 'FRIDAY', 33, 1, 2, 3, 13, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(911, 'FRIDAY', 33, 1, 2, 3, 13, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(912, 'FRIDAY', 33, 1, 2, 3, 13, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(913, 'FRIDAY', 33, 1, 2, 3, 13, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(914, 'FRIDAY', 33, 1, 3, 3, 14, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(915, 'FRIDAY', 33, 1, 3, 3, 14, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(916, 'FRIDAY', 33, 1, 3, 3, 14, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(917, 'FRIDAY', 33, 1, 3, 3, 14, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(918, 'FRIDAY', 33, 1, 3, 3, 14, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(919, 'FRIDAY', 33, 1, 4, 3, 15, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(920, 'FRIDAY', 33, 1, 4, 3, 15, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(921, 'FRIDAY', 33, 1, 4, 3, 15, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(922, 'FRIDAY', 33, 1, 4, 3, 15, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(923, 'FRIDAY', 33, 1, 4, 3, 15, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(924, 'FRIDAY', 34, 1, 1, 3, 11, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(925, 'FRIDAY', 34, 1, 1, 3, 11, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(926, 'FRIDAY', 34, 1, 1, 3, 11, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(927, 'FRIDAY', 34, 1, 1, 3, 11, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(928, 'FRIDAY', 34, 1, 1, 3, 11, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(929, 'FRIDAY', 34, 1, 1, 3, 12, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(930, 'FRIDAY', 34, 1, 1, 3, 12, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(931, 'FRIDAY', 34, 1, 1, 3, 12, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(932, 'FRIDAY', 34, 1, 1, 3, 12, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(933, 'FRIDAY', 34, 1, 1, 3, 12, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(934, 'FRIDAY', 34, 1, 2, 3, 13, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(935, 'FRIDAY', 34, 1, 2, 3, 13, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(936, 'FRIDAY', 34, 1, 2, 3, 13, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(937, 'FRIDAY', 34, 1, 2, 3, 13, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(938, 'FRIDAY', 34, 1, 2, 3, 13, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(939, 'FRIDAY', 34, 1, 3, 3, 14, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(940, 'FRIDAY', 34, 1, 3, 3, 14, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(941, 'FRIDAY', 34, 1, 3, 3, 14, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(942, 'FRIDAY', 34, 1, 3, 3, 14, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(943, 'FRIDAY', 34, 1, 3, 3, 14, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(944, 'FRIDAY', 34, 1, 4, 3, 15, NULL, 'OE3C37', 'P127', 11, 'THEORY'),
(945, 'FRIDAY', 34, 1, 4, 3, 15, NULL, 'OE3E30', 'P164', 12, 'THEORY'),
(946, 'FRIDAY', 34, 1, 4, 3, 15, NULL, 'OE3D06', 'P130', 13, 'THEORY'),
(947, 'FRIDAY', 34, 1, 4, 3, 15, NULL, 'OE3M34', 'P109', 14, 'THEORY'),
(948, 'FRIDAY', 34, 1, 4, 3, 15, NULL, 'OE3M36', 'P142', 15, 'THEORY'),
(949, 'FRIDAY', 33, 1, 1, 1, 1, NULL, 'ES1003', 'P101', 28, 'THEORY'),
(950, 'TUESDAY', 9, 1, 1, 1, 1, NULL, 'ES1003', 'P101', 28, 'THEORY'),
(951, 'WEDNESDAY', 17, 1, 1, 1, 1, NULL, 'ES1003', 'P101', 28, 'THEORY'),
(952, 'FRIDAY', 34, 1, 1, 1, 2, NULL, 'ES1003', 'P101', 28, 'THEORY'),
(953, 'TUESDAY', 9, 1, 1, 1, 2, NULL, 'ES1003', 'P109', 29, 'THEORY'),
(954, 'WEDNESDAY', 17, 1, 1, 1, 2, NULL, 'ES1003', 'P109', 29, 'THEORY'),
(955, 'THURSDAY', 25, 1, 2, 1, 3, NULL, 'ES1002', 'P110', 9, 'LAB'),
(956, 'THURSDAY', 26, 1, 2, 1, 3, NULL, 'ES1002', 'P110', 9, 'LAB'),
(957, 'MONDAY', 1, 1, 2, 1, 3, NULL, 'ES1003', 'P101', 28, 'THEORY'),
(958, 'TUESDAY', 9, 1, 2, 1, 3, NULL, 'ES1003', 'P110', 22, 'THEORY'),
(959, 'WEDNESDAY', 17, 1, 2, 1, 3, NULL, 'ES1003', 'P110', 22, 'THEORY'),
(960, 'FRIDAY', 33, 1, 2, 1, 3, NULL, 'EC1001', 'P115', 29, 'THEORY'),
(961, 'MONDAY', 2, 1, 2, 1, 3, NULL, 'EC1001', 'P115', 28, 'THEORY'),
(962, 'TUESDAY', 10, 1, 2, 1, 3, NULL, 'EC1001', 'P115', 28, 'THEORY'),
(963, 'FRIDAY', 35, 1, 3, 1, 4, NULL, 'ES1003', 'P109', 29, 'THEORY'),
(964, 'TUESDAY', 9, 1, 3, 1, 4, NULL, 'ES1003', 'P111', 23, 'THEORY'),
(965, 'WEDNESDAY', 17, 1, 3, 1, 4, NULL, 'ES1003', 'P111', 23, 'THEORY'),
(966, 'FRIDAY', 36, 1, 4, 1, 5, NULL, 'ES1003', 'P109', 29, 'THEORY'),
(967, 'TUESDAY', 9, 1, 4, 1, 5, NULL, 'ES1003', 'P112', 24, 'THEORY'),
(968, 'WEDNESDAY', 17, 1, 4, 1, 5, NULL, 'ES1003', 'P112', 24, 'THEORY'),
(969, 'TUESDAY', 9, 1, 3, 2, 9, NULL, 'ME2006', 'P117', 2, 'LAB'),
(970, 'TUESDAY', 10, 1, 3, 2, 9, NULL, 'ME2006', 'P117', 2, 'LAB'),
(971, 'TUESDAY', 11, 1, 3, 2, 9, NULL, 'ME2007', 'P121', 2, 'LAB'),
(972, 'TUESDAY', 12, 1, 3, 2, 9, NULL, 'ME2007', 'P121', 2, 'LAB'),
(973, 'THURSDAY', 25, 1, 3, 2, 9, NULL, 'ME2008', 'P118', 2, 'LAB'),
(974, 'THURSDAY', 26, 1, 3, 2, 9, NULL, 'ME2008', 'P118', 2, 'LAB'),
(975, 'THURSDAY', 27, 1, 3, 2, 9, NULL, 'ME2002', 'P142', 2, 'LAB'),
(976, 'THURSDAY', 28, 1, 3, 2, 9, NULL, 'ME2002', 'P142', 2, 'LAB'),
(977, 'MONDAY', 1, 1, 3, 2, 9, NULL, 'NS1003a', 'P147', 9, 'LAB'),
(978, 'MONDAY', 2, 1, 3, 2, 9, NULL, 'NS1003a', 'P147', 9, 'LAB'),
(979, 'MONDAY', 3, 1, 3, 2, 9, NULL, 'NS1003b', 'P152', 9, 'LAB'),
(980, 'MONDAY', 4, 1, 3, 2, 9, NULL, 'NS1003b', 'P152', 9, 'LAB'),
(981, 'WEDNESDAY', 17, 1, 3, 2, 9, NULL, 'ME2006', 'P117', 15, 'THEORY'),
(982, 'FRIDAY', 33, 1, 3, 2, 9, NULL, 'ME2006', 'P117', 16, 'THEORY'),
(983, 'MONDAY', 5, 1, 3, 2, 9, NULL, 'ME2006', 'P117', 11, 'THEORY'),
(984, 'WEDNESDAY', 18, 1, 3, 2, 9, NULL, 'ME2007', 'P121', 11, 'THEORY'),
(985, 'FRIDAY', 34, 1, 3, 2, 9, NULL, 'ME2007', 'P121', 16, 'THEORY'),
(986, 'TUESDAY', 13, 1, 3, 2, 9, NULL, 'ME2007', 'P121', 11, 'THEORY'),
(987, 'WEDNESDAY', 19, 1, 3, 2, 9, NULL, 'ME2008', 'P118', 11, 'THEORY'),
(988, 'FRIDAY', 35, 1, 3, 2, 9, NULL, 'ME2008', 'P118', 11, 'THEORY'),
(989, 'THURSDAY', 29, 1, 3, 2, 9, NULL, 'ME2008', 'P118', 11, 'THEORY'),
(990, 'WEDNESDAY', 20, 1, 3, 2, 9, NULL, 'ME2002', 'P142', 11, 'THEORY'),
(991, 'FRIDAY', 36, 1, 3, 2, 9, NULL, 'ME2002', 'P142', 11, 'THEORY'),
(992, 'WEDNESDAY', 21, 1, 3, 2, 9, NULL, 'NS1004', 'P149', 28, 'THEORY'),
(993, 'FRIDAY', 37, 1, 3, 2, 9, NULL, 'NS1004', 'P149', 28, 'THEORY'),
(994, 'MONDAY', 6, 1, 3, 2, 9, NULL, 'NS1004', 'P149', 28, 'THEORY'),
(995, 'TUESDAY', 14, 1, 3, 2, 9, NULL, 'ME2005', 'P119', 11, 'THEORY'),
(996, 'WEDNESDAY', 22, 1, 3, 2, 9, NULL, 'ME2005', 'P119', 11, 'THEORY'),
(997, 'THURSDAY', 30, 1, 3, 2, 9, NULL, 'ME2005', 'P119', 11, 'THEORY'),
(998, 'FRIDAY', 38, 1, 3, 2, 9, NULL, 'NS1003a', 'P147', 11, 'THEORY'),
(999, 'MONDAY', 1, 1, 2, 2, 8, NULL, 'EC2005', 'P107', 29, 'THEORY'),
(1000, 'TUESDAY', 9, 1, 2, 2, 8, NULL, 'EC2005', 'P107', 25, 'THEORY'),
(1001, 'WEDNESDAY', 17, 1, 2, 2, 8, NULL, 'EC2005', 'P107', 25, 'THEORY'),
(1002, 'THURSDAY', 25, 1, 2, 2, 8, NULL, 'EC2006', 'P115', 28, 'THEORY'),
(1003, 'FRIDAY', 34, 1, 2, 2, 8, NULL, 'EC2006', 'P115', 29, 'THEORY'),
(1004, 'MONDAY', 3, 1, 2, 2, 8, NULL, 'EC2006', 'P115', 28, 'THEORY'),
(1005, 'TUESDAY', 10, 1, 2, 2, 8, NULL, 'EC2008', 'P116', 29, 'THEORY'),
(1006, 'WEDNESDAY', 18, 1, 2, 2, 8, NULL, 'EC2008', 'P116', 28, 'THEORY'),
(1007, 'THURSDAY', 26, 1, 2, 2, 8, NULL, 'EC2008', 'P116', 28, 'THEORY'),
(1008, 'FRIDAY', 33, 1, 2, 2, 8, NULL, 'NS1004', 'P149', 22, 'THEORY'),
(1009, 'MONDAY', 2, 1, 2, 2, 8, NULL, 'NS1004', 'P149', 29, 'THEORY'),
(1010, 'TUESDAY', 11, 1, 2, 2, 8, NULL, 'NS1004', 'P149', 28, 'THEORY'),
(1011, 'WEDNESDAY', 19, 1, 2, 2, 8, NULL, 'EC207a', 'P146', 28, 'THEORY'),
(1012, 'THURSDAY', 27, 1, 2, 2, 8, NULL, 'EC207a', 'P146', 28, 'THEORY'),
(1013, 'FRIDAY', 35, 1, 2, 2, 8, NULL, 'EC207a', 'P146', 28, 'THEORY'),
(1014, 'MONDAY', 4, 1, 2, 2, 8, NULL, 'EC207b', 'P110', 28, 'THEORY'),
(1015, 'TUESDAY', 12, 1, 2, 2, 8, NULL, 'EC207b', 'P110', 28, 'THEORY'),
(1016, 'WEDNESDAY', 20, 1, 2, 2, 8, NULL, 'EC207b', 'P110', 28, 'THEORY'),
(1017, 'THURSDAY', 28, 1, 2, 2, 8, NULL, 'NS1003a', 'P147', 11, 'THEORY'),
(1018, 'FRIDAY', 36, 1, 2, 2, 8, NULL, 'NS1003b', 'P152', 12, 'THEORY'),
(1019, 'MONDAY', 5, 1, 2, 2, 8, NULL, 'HS1002', 'P130', 28, 'THEORY'),
(1020, 'TUESDAY', 13, 1, 2, 2, 8, NULL, 'HS1002', 'P130', 28, 'THEORY'),
(1021, 'WEDNESDAY', 21, 1, 2, 2, 8, NULL, 'HS1002', 'P130', 29, 'THEORY'),
(1022, 'THURSDAY', 29, 1, 2, 2, 8, NULL, 'NS1004', 'P149', 28, 'TUTORIAL'),
(1023, 'MONDAY', 1, 1, 1, 2, 6, NULL, 'CS2008', 'P114', 22, 'THEORY'),
(1024, 'TUESDAY', 9, 1, 1, 2, 6, NULL, 'CS2008', 'P114', 21, 'THEORY'),
(1025, 'WEDNESDAY', 17, 1, 1, 2, 6, NULL, 'CS2008', 'P114', 21, 'THEORY'),
(1026, 'THURSDAY', 25, 1, 1, 2, 6, NULL, 'CS2009', 'P106', 29, 'THEORY'),
(1027, 'FRIDAY', 33, 1, 1, 2, 6, NULL, 'CS2009', 'P106', 23, 'THEORY'),
(1028, 'MONDAY', 2, 1, 1, 2, 6, NULL, 'CS2009', 'P106', 22, 'THEORY'),
(1029, 'TUESDAY', 10, 1, 1, 2, 6, NULL, 'CS2006', 'P113', 22, 'THEORY'),
(1030, 'WEDNESDAY', 18, 1, 1, 2, 6, NULL, 'CS2006', 'P113', 29, 'THEORY'),
(1031, 'THURSDAY', 26, 1, 1, 2, 6, NULL, 'CS2006', 'P113', 29, 'THEORY'),
(1032, 'FRIDAY', 34, 1, 1, 2, 6, NULL, 'CS2007', 'P108', 22, 'THEORY'),
(1033, 'MONDAY', 3, 1, 1, 2, 6, NULL, 'CS2007', 'P108', 29, 'THEORY'),
(1034, 'TUESDAY', 11, 1, 1, 2, 6, NULL, 'CS2007', 'P108', 29, 'THEORY'),
(1035, 'WEDNESDAY', 19, 1, 1, 2, 6, NULL, 'NS1004', 'P149', 29, 'THEORY'),
(1036, 'THURSDAY', 27, 1, 1, 2, 6, NULL, 'NS1004', 'P149', 29, 'THEORY'),
(1037, 'FRIDAY', 35, 1, 1, 2, 6, NULL, 'NS1004', 'P149', 22, 'THEORY'),
(1038, 'MONDAY', 4, 1, 1, 2, 6, NULL, 'NS1003a', 'P147', 11, 'THEORY'),
(1039, 'TUESDAY', 12, 1, 1, 2, 6, NULL, 'NS1003b', 'P152', 11, 'THEORY'),
(1040, 'WEDNESDAY', 20, 1, 1, 2, 6, NULL, 'HS1002', 'P130', 29, 'THEORY'),
(1041, 'THURSDAY', 28, 1, 1, 2, 6, NULL, 'HS1002', 'P130', 28, 'THEORY'),
(1042, 'FRIDAY', 36, 1, 1, 2, 6, NULL, 'HS1002', 'P130', 28, 'THEORY'),
(1043, 'THURSDAY', 29, 1, 1, 2, 6, NULL, 'CS2008', 'P114', 29, 'TUTORIAL'),
(1044, 'TUESDAY', 13, 1, 1, 2, 6, NULL, 'CS2009', 'P106', 29, 'TUTORIAL'),
(1045, 'MONDAY', 5, 1, 1, 2, 6, NULL, 'CS2006', 'P113', 29, 'TUTORIAL'),
(1046, 'WEDNESDAY', 21, 1, 1, 2, 6, NULL, 'CS2007', 'P108', 22, 'TUTORIAL'),
(1047, 'MONDAY', 6, 1, 1, 2, 6, NULL, 'NS1004', 'P150', 29, 'TUTORIAL'),
(1048, 'MONDAY', 2, 1, 1, 2, 7, NULL, 'CS2008', 'P114', 23, 'THEORY'),
(1049, 'TUESDAY', 10, 1, 1, 2, 7, NULL, 'CS2008', 'P114', 23, 'THEORY'),
(1050, 'WEDNESDAY', 18, 1, 1, 2, 7, NULL, 'CS2008', 'P114', 22, 'THEORY'),
(1051, 'THURSDAY', 26, 1, 1, 2, 7, NULL, 'CS2009', 'P106', 22, 'THEORY'),
(1052, 'FRIDAY', 34, 1, 1, 2, 7, NULL, 'CS2009', 'P106', 23, 'THEORY'),
(1053, 'MONDAY', 1, 1, 1, 2, 7, NULL, 'CS2009', 'P106', 23, 'THEORY'),
(1054, 'TUESDAY', 9, 1, 1, 2, 7, NULL, 'CS2006', 'P113', 27, 'THEORY'),
(1055, 'WEDNESDAY', 17, 1, 1, 2, 7, NULL, 'CS2006', 'P113', 27, 'THEORY'),
(1056, 'THURSDAY', 25, 1, 1, 2, 7, NULL, 'CS2006', 'P113', 22, 'THEORY'),
(1057, 'FRIDAY', 33, 1, 1, 2, 7, NULL, 'CS2007', 'P108', 24, 'THEORY'),
(1058, 'MONDAY', 4, 1, 1, 2, 7, NULL, 'CS2007', 'P108', 29, 'THEORY'),
(1059, 'TUESDAY', 12, 1, 1, 2, 7, NULL, 'CS2007', 'P108', 29, 'THEORY'),
(1060, 'WEDNESDAY', 19, 1, 1, 2, 7, NULL, 'NS1004', 'P150', 22, 'THEORY'),
(1061, 'THURSDAY', 27, 1, 1, 2, 7, NULL, 'NS1004', 'P150', 22, 'THEORY'),
(1062, 'FRIDAY', 35, 1, 1, 2, 7, NULL, 'NS1004', 'P150', 23, 'THEORY'),
(1063, 'MONDAY', 3, 1, 1, 2, 7, NULL, 'NS1003a', 'P147', 11, 'THEORY'),
(1064, 'TUESDAY', 11, 1, 1, 2, 7, NULL, 'NS1003b', 'P152', 11, 'THEORY'),
(1065, 'WEDNESDAY', 20, 1, 1, 2, 7, NULL, 'HS1002', 'P155', 22, 'THEORY'),
(1066, 'THURSDAY', 28, 1, 1, 2, 7, NULL, 'HS1002', 'P155', 29, 'THEORY'),
(1067, 'FRIDAY', 36, 1, 1, 2, 7, NULL, 'HS1002', 'P155', 22, 'THEORY'),
(1068, 'THURSDAY', 30, 1, 1, 2, 7, NULL, 'CS2008', 'P114', 28, 'TUTORIAL'),
(1069, 'TUESDAY', 14, 1, 1, 2, 7, NULL, 'CS2009', 'P106', 28, 'TUTORIAL'),
(1070, 'MONDAY', 6, 1, 1, 2, 7, NULL, 'CS2006', 'P113', 22, 'TUTORIAL'),
(1071, 'WEDNESDAY', 22, 1, 1, 2, 7, NULL, 'CS2007', 'P108', 28, 'TUTORIAL'),
(1072, 'MONDAY', 5, 1, 1, 2, 7, NULL, 'NS1004', 'P149', 22, 'TUTORIAL'),
(1073, 'FRIDAY', 33, 1, 4, 2, 10, NULL, 'SM2006', 'P122', 1, 'LAB'),
(1074, 'FRIDAY', 34, 1, 4, 2, 10, NULL, 'SM2006', 'P122', 1, 'LAB'),
(1075, 'WEDNESDAY', 17, 1, 4, 2, 10, NULL, 'SM2007', 'P124', 1, 'LAB'),
(1076, 'WEDNESDAY', 18, 1, 4, 2, 10, NULL, 'SM2007', 'P124', 1, 'LAB'),
(1077, 'MONDAY', 4, 1, 4, 2, 10, NULL, 'SM2008', 'P115', 1, 'LAB'),
(1078, 'MONDAY', 5, 1, 4, 2, 10, NULL, 'SM2008', 'P115', 1, 'LAB'),
(1079, 'FRIDAY', 35, 1, 4, 2, 10, NULL, 'NS1003a', 'P147', 9, 'LAB'),
(1080, 'FRIDAY', 36, 1, 4, 2, 10, NULL, 'NS1003a', 'P147', 9, 'LAB'),
(1081, 'MONDAY', 6, 1, 4, 2, 10, NULL, 'NS1003b', 'P152', 9, 'LAB'),
(1082, 'MONDAY', 7, 1, 4, 2, 10, NULL, 'NS1003b', 'P152', 9, 'LAB'),
(1083, 'TUESDAY', 9, 1, 4, 2, 10, NULL, 'SM2006', 'P122', 11, 'THEORY'),
(1084, 'THURSDAY', 25, 1, 4, 2, 10, NULL, 'SM2006', 'P122', 11, 'THEORY'),
(1085, 'WEDNESDAY', 19, 1, 4, 2, 10, NULL, 'SM2006', 'P122', 12, 'THEORY'),
(1086, 'TUESDAY', 10, 1, 4, 2, 10, NULL, 'SM2007', 'P124', 11, 'THEORY'),
(1087, 'THURSDAY', 26, 1, 4, 2, 10, NULL, 'SM2007', 'P124', 11, 'THEORY'),
(1088, 'WEDNESDAY', 20, 1, 4, 2, 10, NULL, 'SM2007', 'P124', 12, 'THEORY'),
(1089, 'TUESDAY', 11, 1, 4, 2, 10, NULL, 'SM2008', 'P115', 12, 'THEORY'),
(1090, 'THURSDAY', 27, 1, 4, 2, 10, NULL, 'SM2008', 'P115', 11, 'THEORY'),
(1091, 'MONDAY', 1, 1, 4, 2, 10, NULL, 'SM2008', 'P115', 15, 'THEORY'),
(1092, 'TUESDAY', 12, 1, 4, 2, 10, NULL, 'NS1004', 'P149', 22, 'THEORY'),
(1093, 'THURSDAY', 28, 1, 4, 2, 10, NULL, 'NS1004', 'P149', 22, 'THEORY'),
(1094, 'WEDNESDAY', 21, 1, 4, 2, 10, NULL, 'NS1004', 'P150', 23, 'THEORY'),
(1095, 'TUESDAY', 13, 1, 4, 2, 10, NULL, 'SM2005', 'P123', 12, 'THEORY'),
(1096, 'THURSDAY', 29, 1, 4, 2, 10, NULL, 'SM2005', 'P123', 12, 'THEORY'),
(1097, 'FRIDAY', 37, 1, 4, 2, 10, NULL, 'SM2005', 'P123', 11, 'THEORY'),
(1098, 'MONDAY', 2, 1, 4, 2, 10, NULL, 'NS1003a', 'P154', 11, 'THEORY'),
(1099, 'TUESDAY', 14, 1, 4, 2, 10, NULL, 'NS1003b', 'P152', 12, 'THEORY'),
(1100, 'WEDNESDAY', 22, 1, 4, 2, 10, NULL, 'HS1002', 'P130', 29, 'THEORY'),
(1101, 'THURSDAY', 30, 1, 4, 2, 10, NULL, 'HS1002', 'P130', 29, 'THEORY'),
(1102, 'FRIDAY', 38, 1, 4, 2, 10, NULL, 'HS1002', 'P155', 28, 'THEORY'),
(1103, 'MONDAY', 2, 1, 1, 3, 11, NULL, 'CS3001', 'P102', 24, 'THEORY'),
(1104, 'TUESDAY', 9, 1, 1, 3, 11, NULL, 'CS3001', 'P102', 30, 'THEORY'),
(1105, 'WEDNESDAY', 18, 1, 1, 3, 11, NULL, 'CS3001', 'P102', 23, 'THEORY'),
(1106, 'THURSDAY', 25, 1, 1, 3, 11, NULL, 'CS3002', 'P105', 23, 'THEORY'),
(1107, 'FRIDAY', 35, 1, 1, 3, 11, NULL, 'CS3002', 'P105', 24, 'THEORY'),
(1108, 'MONDAY', 3, 1, 1, 3, 11, NULL, 'CS3002', 'P105', 22, 'THEORY'),
(1109, 'TUESDAY', 10, 1, 1, 3, 11, NULL, 'CS3004', 'P104', 24, 'THEORY'),
(1110, 'WEDNESDAY', 19, 1, 1, 3, 11, NULL, 'CS3004', 'P104', 23, 'THEORY'),
(1111, 'THURSDAY', 26, 1, 1, 3, 11, NULL, 'CS3004', 'P104', 23, 'THEORY'),
(1112, 'FRIDAY', 36, 1, 1, 3, 11, NULL, 'CS3003', 'P103', 23, 'THEORY'),
(1113, 'MONDAY', 4, 1, 1, 3, 11, NULL, 'CS3003', 'P103', 22, 'THEORY'),
(1114, 'TUESDAY', 11, 1, 1, 3, 11, NULL, 'CS3003', 'P103', 22, 'THEORY'),
(1115, 'WEDNESDAY', 20, 1, 1, 3, 11, NULL, 'CS3005', 'P108', 23, 'THEORY'),
(1116, 'THURSDAY', 27, 1, 1, 3, 11, NULL, 'CS3005', 'P108', 23, 'THEORY'),
(1117, 'FRIDAY', 37, 1, 1, 3, 11, NULL, 'CS3005', 'P108', 29, 'THEORY'),
(1118, 'MONDAY', 3, 1, 1, 3, 12, NULL, 'CS3001', 'P102', 23, 'THEORY'),
(1119, 'TUESDAY', 10, 1, 1, 3, 12, NULL, 'CS3001', 'P102', 25, 'THEORY'),
(1120, 'WEDNESDAY', 19, 1, 1, 3, 12, NULL, 'CS3001', 'P102', 24, 'THEORY'),
(1121, 'THURSDAY', 26, 1, 1, 3, 12, NULL, 'CS3002', 'P105', 24, 'THEORY'),
(1122, 'FRIDAY', 36, 1, 1, 3, 12, NULL, 'CS3002', 'P105', 24, 'THEORY'),
(1123, 'MONDAY', 2, 1, 1, 3, 12, NULL, 'CS3002', 'P105', 25, 'THEORY'),
(1124, 'TUESDAY', 11, 1, 1, 3, 12, NULL, 'CS3004', 'P104', 23, 'THEORY'),
(1125, 'WEDNESDAY', 18, 1, 1, 3, 12, NULL, 'CS3004', 'P104', 24, 'THEORY'),
(1126, 'THURSDAY', 25, 1, 1, 3, 12, NULL, 'CS3004', 'P104', 24, 'THEORY'),
(1127, 'FRIDAY', 35, 1, 1, 3, 12, NULL, 'CS3003', 'P103', 25, 'THEORY'),
(1128, 'MONDAY', 5, 1, 1, 3, 12, NULL, 'CS3003', 'P103', 23, 'THEORY'),
(1129, 'TUESDAY', 12, 1, 1, 3, 12, NULL, 'CS3003', 'P103', 23, 'THEORY'),
(1130, 'WEDNESDAY', 23, 1, 1, 3, 12, NULL, 'CS3005', 'P108', 28, 'THEORY'),
(1131, 'THURSDAY', 28, 1, 1, 3, 12, NULL, 'CS3005', 'P108', 23, 'THEORY'),
(1132, 'FRIDAY', 38, 1, 1, 3, 12, NULL, 'CS3005', 'P108', 29, 'THEORY'),
(1133, 'MONDAY', 2, 1, 2, 3, 13, NULL, 'EC3001', 'P128', 21, 'THEORY'),
(1134, 'TUESDAY', 10, 1, 2, 3, 13, NULL, 'EC3001', 'P128', 21, 'THEORY'),
(1135, 'WEDNESDAY', 18, 1, 2, 3, 13, NULL, 'EC3001', 'P128', 25, 'THEORY'),
(1136, 'THURSDAY', 25, 1, 2, 3, 13, NULL, 'EC3003', 'P116', 25, 'THEORY'),
(1137, 'FRIDAY', 35, 1, 2, 3, 13, NULL, 'EC3003', 'P116', 21, 'THEORY'),
(1138, 'MONDAY', 3, 1, 2, 3, 13, NULL, 'EC3003', 'P116', 24, 'THEORY'),
(1139, 'TUESDAY', 11, 1, 2, 3, 13, NULL, 'EC3002', 'P132', 24, 'THEORY'),
(1140, 'WEDNESDAY', 19, 1, 2, 3, 13, NULL, 'EC3002', 'P132', 25, 'THEORY'),
(1141, 'THURSDAY', 26, 1, 2, 3, 13, NULL, 'EC3002', 'P132', 25, 'THEORY'),
(1142, 'FRIDAY', 36, 1, 2, 3, 13, NULL, 'EC3004', 'P107', 25, 'THEORY'),
(1143, 'MONDAY', 4, 1, 2, 3, 13, NULL, 'EC3004', 'P107', 23, 'THEORY'),
(1144, 'TUESDAY', 12, 1, 2, 3, 13, NULL, 'EC3004', 'P107', 24, 'THEORY'),
(1145, 'MONDAY', 2, 1, 3, 3, 14, NULL, 'ME3002', 'P138', 2, 'LAB'),
(1146, 'MONDAY', 3, 1, 3, 3, 14, NULL, 'ME3002', 'P138', 2, 'LAB'),
(1147, 'MONDAY', 4, 1, 3, 3, 14, NULL, 'ME3004', 'P140', 2, 'LAB'),
(1148, 'MONDAY', 5, 1, 3, 3, 14, NULL, 'ME3004', 'P140', 2, 'LAB'),
(1149, 'TUESDAY', 9, 1, 3, 3, 14, NULL, 'ME3002', 'P138', 12, 'THEORY'),
(1150, 'WEDNESDAY', 18, 1, 3, 3, 14, NULL, 'ME3002', 'P138', 12, 'THEORY'),
(1151, 'THURSDAY', 25, 1, 3, 3, 14, NULL, 'ME3002', 'P138', 12, 'THEORY'),
(1152, 'FRIDAY', 35, 1, 3, 3, 14, NULL, 'ME3004', 'P140', 12, 'THEORY'),
(1153, 'TUESDAY', 10, 1, 3, 3, 14, NULL, 'ME3004', 'P140', 12, 'THEORY'),
(1154, 'WEDNESDAY', 19, 1, 3, 3, 14, NULL, 'ME3004', 'P140', 13, 'THEORY'),
(1155, 'THURSDAY', 26, 1, 3, 3, 14, NULL, 'ME3001', 'P121', 12, 'THEORY'),
(1156, 'FRIDAY', 36, 1, 3, 3, 14, NULL, 'ME3001', 'P121', 13, 'THEORY'),
(1157, 'TUESDAY', 14, 1, 3, 3, 14, NULL, 'ME3001', 'P121', 13, 'THEORY'),
(1158, 'WEDNESDAY', 20, 1, 3, 3, 14, NULL, 'ME3003', 'P135', 13, 'THEORY'),
(1159, 'THURSDAY', 27, 1, 3, 3, 14, NULL, 'ME3003', 'P135', 12, 'THEORY'),
(1160, 'FRIDAY', 37, 1, 3, 3, 14, NULL, 'ME3003', 'P135', 12, 'THEORY'),
(1161, 'WEDNESDAY', 18, 1, 4, 3, 15, NULL, 'SM3003', 'P137', 8, 'LAB'),
(1162, 'WEDNESDAY', 19, 1, 4, 3, 15, NULL, 'SM3003', 'P137', 8, 'LAB'),
(1163, 'MONDAY', 2, 1, 4, 3, 15, NULL, 'SM3003', 'P137', 12, 'THEORY'),
(1164, 'TUESDAY', 9, 1, 4, 3, 15, NULL, 'SM3003', 'P137', 13, 'THEORY'),
(1165, 'THURSDAY', 25, 1, 4, 3, 15, NULL, 'SM3003', 'P137', 13, 'THEORY'),
(1166, 'FRIDAY', 35, 1, 4, 3, 15, NULL, 'SM3001', 'P141', 13, 'THEORY'),
(1167, 'MONDAY', 3, 1, 4, 3, 15, NULL, 'SM3001', 'P141', 12, 'THEORY'),
(1168, 'TUESDAY', 10, 1, 4, 3, 15, NULL, 'SM3001', 'P141', 13, 'THEORY'),
(1169, 'THURSDAY', 26, 1, 4, 3, 15, NULL, 'SM3002', 'P122', 13, 'THEORY'),
(1170, 'FRIDAY', 36, 1, 4, 3, 15, NULL, 'SM3002', 'P122', 14, 'THEORY'),
(1171, 'MONDAY', 4, 1, 4, 3, 15, NULL, 'SM3002', 'P122', 12, 'THEORY'),
(1172, 'MONDAY', 1, 1, 1, 4, 16, NULL, 'CS8009', 'P102', 16, 'THEORY'),
(1173, 'TUESDAY', 9, 1, 1, 4, 16, NULL, 'CS8009', 'P144', 14, 'THEORY'),
(1174, 'WEDNESDAY', 17, 1, 1, 4, 16, NULL, 'CS8009', 'P102', 16, 'THEORY'),
(1175, 'THURSDAY', 25, 1, 1, 4, 16, NULL, 'CS8010', 'P144', 14, 'THEORY'),
(1176, 'FRIDAY', 33, 1, 1, 4, 16, NULL, 'CS8010', 'P144', 17, 'THEORY'),
(1177, 'MONDAY', 2, 1, 1, 4, 16, NULL, 'CS8010', 'P144', 13, 'THEORY'),
(1178, 'TUESDAY', 12, 1, 1, 4, 16, NULL, 'CS8015', 'P104', 12, 'THEORY'),
(1179, 'WEDNESDAY', 20, 1, 1, 4, 16, NULL, 'CS8015', 'P104', 14, 'THEORY'),
(1180, 'THURSDAY', 27, 1, 1, 4, 16, NULL, 'CS8015', 'P104', 13, 'THEORY'),
(1181, 'FRIDAY', 34, 1, 1, 4, 16, NULL, 'CS8034', 'P105', 17, 'THEORY'),
(1182, 'MONDAY', 4, 1, 1, 4, 16, NULL, 'CS8034', 'P105', 13, 'THEORY'),
(1183, 'TUESDAY', 10, 1, 1, 4, 16, NULL, 'CS8034', 'P105', 14, 'THEORY'),
(1184, 'WEDNESDAY', 21, 1, 1, 4, 16, NULL, 'CS8035', 'P102', 11, 'THEORY'),
(1185, 'THURSDAY', 26, 1, 1, 4, 16, NULL, 'CS8035', 'P102', 14, 'THEORY'),
(1186, 'FRIDAY', 35, 1, 1, 4, 16, NULL, 'CS8035', 'P102', 14, 'THEORY'),
(1187, 'MONDAY', 3, 1, 1, 4, 16, NULL, 'CS8039', 'P133', 13, 'THEORY'),
(1188, 'TUESDAY', 11, 1, 1, 4, 16, NULL, 'CS8039', 'P133', 13, 'THEORY'),
(1189, 'WEDNESDAY', 18, 1, 1, 4, 16, NULL, 'CS8039', 'P133', 13, 'THEORY'),
(1190, 'THURSDAY', 28, 1, 1, 4, 16, NULL, 'CS8011', 'P103', 12, 'THEORY'),
(1191, 'FRIDAY', 37, 1, 1, 4, 16, NULL, 'CS8011', 'P103', 13, 'THEORY'),
(1192, 'MONDAY', 6, 1, 1, 4, 16, NULL, 'CS8011', 'P103', 11, 'THEORY'),
(1193, 'TUESDAY', 13, 1, 1, 4, 16, NULL, 'CS8027', 'P145', 13, 'THEORY'),
(1194, 'WEDNESDAY', 19, 1, 1, 4, 16, NULL, 'CS8027', 'P145', 14, 'THEORY'),
(1195, 'THURSDAY', 29, 1, 1, 4, 16, NULL, 'CS8027', 'P145', 13, 'THEORY'),
(1196, 'FRIDAY', 36, 1, 1, 4, 16, NULL, 'CS8033', 'P102', 15, 'THEORY'),
(1197, 'MONDAY', 5, 1, 1, 4, 16, NULL, 'CS8033', 'P102', 12, 'THEORY'),
(1198, 'TUESDAY', 14, 1, 1, 4, 16, NULL, 'CS8033', 'P102', 14, 'THEORY'),
(1199, 'WEDNESDAY', 22, 1, 1, 4, 16, NULL, 'CS8038', 'P105', 12, 'THEORY'),
(1200, 'THURSDAY', 30, 1, 1, 4, 16, NULL, 'CS8038', 'P105', 12, 'THEORY'),
(1201, 'FRIDAY', 38, 1, 1, 4, 16, NULL, 'CS8038', 'P105', 12, 'THEORY'),
(1202, 'MONDAY', 1, 1, 1, 4, 17, NULL, 'CS8009', 'P144', 17, 'THEORY'),
(1203, 'TUESDAY', 10, 1, 1, 4, 17, NULL, 'CS8009', 'P144', 15, 'THEORY'),
(1204, 'WEDNESDAY', 17, 1, 1, 4, 17, NULL, 'CS8009', 'P144', 17, 'THEORY'),
(1205, 'THURSDAY', 26, 1, 1, 4, 17, NULL, 'CS8010', 'P144', 15, 'THEORY'),
(1206, 'FRIDAY', 34, 1, 1, 4, 17, NULL, 'CS8010', 'P144', 18, 'THEORY'),
(1207, 'MONDAY', 3, 1, 1, 4, 17, NULL, 'CS8010', 'P144', 14, 'THEORY'),
(1208, 'TUESDAY', 9, 1, 1, 4, 17, NULL, 'CS8015', 'P104', 15, 'THEORY'),
(1209, 'WEDNESDAY', 21, 1, 1, 4, 17, NULL, 'CS8015', 'P104', 12, 'THEORY'),
(1210, 'THURSDAY', 28, 1, 1, 4, 17, NULL, 'CS8015', 'P104', 13, 'THEORY'),
(1211, 'FRIDAY', 33, 1, 1, 4, 17, NULL, 'CS8034', 'P105', 18, 'THEORY'),
(1212, 'MONDAY', 5, 1, 1, 4, 17, NULL, 'CS8034', 'P105', 13, 'THEORY'),
(1213, 'TUESDAY', 11, 1, 1, 4, 17, NULL, 'CS8034', 'P105', 14, 'THEORY'),
(1214, 'WEDNESDAY', 20, 1, 1, 4, 17, NULL, 'CS8035', 'P102', 15, 'THEORY'),
(1215, 'THURSDAY', 25, 1, 1, 4, 17, NULL, 'CS8035', 'P102', 15, 'THEORY'),
(1216, 'FRIDAY', 37, 1, 1, 4, 17, NULL, 'CS8035', 'P102', 14, 'THEORY'),
(1217, 'MONDAY', 2, 1, 1, 4, 17, NULL, 'CS8039', 'P133', 14, 'THEORY'),
(1218, 'TUESDAY', 12, 1, 1, 4, 17, NULL, 'CS8039', 'P133', 13, 'THEORY'),
(1219, 'WEDNESDAY', 19, 1, 1, 4, 17, NULL, 'CS8039', 'P133', 15, 'THEORY'),
(1220, 'THURSDAY', 27, 1, 1, 4, 17, NULL, 'CS8011', 'P103', 14, 'THEORY'),
(1221, 'FRIDAY', 38, 1, 1, 4, 17, NULL, 'CS8011', 'P103', 13, 'THEORY'),
(1222, 'MONDAY', 7, 1, 1, 4, 17, NULL, 'CS8011', 'P103', 11, 'THEORY'),
(1223, 'TUESDAY', 14, 1, 1, 4, 17, NULL, 'CS8027', 'P145', 15, 'THEORY'),
(1224, 'WEDNESDAY', 18, 1, 1, 4, 17, NULL, 'CS8027', 'P145', 14, 'THEORY'),
(1225, 'THURSDAY', 30, 1, 1, 4, 17, NULL, 'CS8027', 'P145', 13, 'THEORY'),
(1226, 'FRIDAY', 35, 1, 1, 4, 17, NULL, 'CS8033', 'P104', 15, 'THEORY'),
(1227, 'MONDAY', 4, 1, 1, 4, 17, NULL, 'CS8033', 'P102', 14, 'THEORY'),
(1228, 'TUESDAY', 13, 1, 1, 4, 17, NULL, 'CS8033', 'P102', 14, 'THEORY'),
(1229, 'WEDNESDAY', 23, 1, 1, 4, 17, NULL, 'CS8038', 'P105', 11, 'THEORY'),
(1230, 'THURSDAY', 29, 1, 1, 4, 17, NULL, 'CS8038', 'P105', 14, 'THEORY'),
(1231, 'FRIDAY', 39, 1, 1, 4, 17, NULL, 'CS8038', 'P105', 11, 'THEORY'),
(1232, 'FRIDAY', 33, 1, 3, 4, 19, NULL, 'ME8011', 'P135', 7, 'LAB'),
(1233, 'FRIDAY', 34, 1, 3, 4, 19, NULL, 'ME8011', 'P135', 7, 'LAB'),
(1234, 'MONDAY', 1, 1, 3, 4, 19, NULL, 'ME8019', 'P111', 7, 'LAB'),
(1235, 'MONDAY', 2, 1, 3, 4, 19, NULL, 'ME8019', 'P111', 7, 'LAB'),
(1236, 'TUESDAY', 9, 1, 3, 4, 19, NULL, 'ME8011', 'P135', 16, 'THEORY'),
(1237, 'WEDNESDAY', 17, 1, 3, 4, 19, NULL, 'ME8011', 'P135', 18, 'THEORY'),
(1238, 'THURSDAY', 25, 1, 3, 4, 19, NULL, 'ME8011', 'P135', 16, 'THEORY'),
(1239, 'TUESDAY', 10, 1, 3, 4, 19, NULL, 'ME8019', 'P111', 16, 'THEORY'),
(1240, 'WEDNESDAY', 18, 1, 3, 4, 19, NULL, 'ME8019', 'P111', 15, 'THEORY'),
(1241, 'THURSDAY', 26, 1, 3, 4, 19, NULL, 'ME8019', 'P111', 16, 'THEORY'),
(1242, 'MONDAY', 3, 1, 3, 4, 19, NULL, 'ME8007', 'P137', 15, 'THEORY'),
(1243, 'TUESDAY', 11, 1, 3, 4, 19, NULL, 'ME8007', 'P137', 15, 'THEORY'),
(1244, 'WEDNESDAY', 20, 1, 3, 4, 19, NULL, 'ME8007', 'P137', 16, 'THEORY'),
(1245, 'THURSDAY', 27, 1, 3, 4, 19, NULL, 'ME8014', 'P111', 15, 'THEORY'),
(1246, 'FRIDAY', 35, 1, 3, 4, 19, NULL, 'ME8014', 'P111', 16, 'THEORY'),
(1247, 'MONDAY', 4, 1, 3, 4, 19, NULL, 'ME8014', 'P111', 15, 'THEORY'),
(1248, 'TUESDAY', 12, 1, 3, 4, 19, NULL, 'ME8018', 'P136', 14, 'THEORY'),
(1249, 'WEDNESDAY', 19, 1, 3, 4, 19, NULL, 'ME8018', 'P136', 16, 'THEORY'),
(1250, 'THURSDAY', 28, 1, 3, 4, 19, NULL, 'ME8018', 'P136', 14, 'THEORY'),
(1251, 'FRIDAY', 36, 1, 3, 4, 19, NULL, 'ME8021', 'P140', 16, 'THEORY'),
(1252, 'MONDAY', 6, 1, 3, 4, 19, NULL, 'ME8021', 'P140', 12, 'THEORY'),
(1253, 'TUESDAY', 13, 1, 3, 4, 19, NULL, 'ME8021', 'P140', 15, 'THEORY'),
(1254, 'WEDNESDAY', 21, 1, 3, 4, 19, NULL, 'ME8025', 'P138', 13, 'THEORY'),
(1255, 'THURSDAY', 29, 1, 3, 4, 19, NULL, 'ME8025', 'P138', 15, 'THEORY'),
(1256, 'FRIDAY', 37, 1, 3, 4, 19, NULL, 'ME8025', 'P138', 15, 'THEORY'),
(1257, 'MONDAY', 7, 1, 3, 4, 19, NULL, 'ME5D02', 'P140', 12, 'THEORY'),
(1258, 'TUESDAY', 14, 1, 3, 4, 19, NULL, 'ME5D02', 'P140', 16, 'THEORY'),
(1259, 'WEDNESDAY', 22, 1, 3, 4, 19, NULL, 'ME5D02', 'P140', 13, 'THEORY'),
(1260, 'MONDAY', 1, 1, 2, 4, 18, NULL, 'EC8008', 'P146', 18, 'THEORY'),
(1261, 'TUESDAY', 9, 1, 2, 4, 18, NULL, 'EC8008', 'P146', 17, 'THEORY'),
(1262, 'WEDNESDAY', 17, 1, 2, 4, 18, NULL, 'EC8008', 'P146', 19, 'THEORY'),
(1263, 'THURSDAY', 25, 1, 2, 4, 18, NULL, 'EC8021', 'P162', 17, 'THEORY'),
(1264, 'FRIDAY', 33, 1, 2, 4, 18, NULL, 'EC8021', 'P162', 19, 'THEORY'),
(1265, 'MONDAY', 2, 1, 2, 4, 18, NULL, 'EC8021', 'P162', 15, 'THEORY'),
(1266, 'TUESDAY', 11, 1, 2, 4, 18, NULL, 'EC8023', 'P117', 16, 'THEORY'),
(1267, 'WEDNESDAY', 18, 1, 2, 4, 18, NULL, 'EC8023', 'P117', 16, 'THEORY'),
(1268, 'THURSDAY', 26, 1, 2, 4, 18, NULL, 'EC8023', 'P117', 17, 'THEORY'),
(1269, 'FRIDAY', 34, 1, 2, 4, 18, NULL, 'EC8025', 'P148', 19, 'THEORY'),
(1270, 'MONDAY', 3, 1, 2, 4, 18, NULL, 'EC8025', 'P148', 16, 'THEORY'),
(1271, 'TUESDAY', 10, 1, 2, 4, 18, NULL, 'EC8025', 'P148', 17, 'THEORY'),
(1272, 'WEDNESDAY', 19, 1, 2, 4, 18, NULL, 'EC5009', 'P128', 17, 'THEORY'),
(1273, 'THURSDAY', 27, 1, 2, 4, 18, NULL, 'EC5009', 'P128', 16, 'THEORY'),
(1274, 'FRIDAY', 35, 1, 2, 4, 18, NULL, 'EC5009', 'P128', 17, 'THEORY'),
(1275, 'MONDAY', 4, 1, 2, 4, 18, NULL, 'EC5010', 'P132', 16, 'THEORY'),
(1276, 'TUESDAY', 12, 1, 2, 4, 18, NULL, 'EC5010', 'P132', 15, 'THEORY'),
(1277, 'WEDNESDAY', 20, 1, 2, 4, 18, NULL, 'EC5010', 'P132', 17, 'THEORY'),
(1278, 'THURSDAY', 28, 1, 2, 4, 18, NULL, 'EC5011', 'P116', 15, 'THEORY'),
(1279, 'FRIDAY', 36, 1, 2, 4, 18, NULL, 'EC5011', 'P116', 17, 'THEORY'),
(1280, 'MONDAY', 5, 1, 2, 4, 18, NULL, 'EC5011', 'P116', 14, 'THEORY'),
(1281, 'MONDAY', 4, 2, 5, 5, 21, 19, 'DS1005', 'P138', 7, 'LAB'),
(1282, 'MONDAY', 5, 2, 5, 5, 21, 19, 'DS1005', 'P138', 7, 'LAB'),
(1283, 'MONDAY', 4, 2, 5, 5, 21, 20, 'DS1005', 'P141', 10, 'LAB'),
(1284, 'MONDAY', 5, 2, 5, 5, 21, 20, 'DS1005', 'P141', 10, 'LAB'),
(1285, 'FRIDAY', 36, 2, 5, 5, 21, NULL, 'DS1005', 'P141', 18, 'THEORY'),
(1286, 'WEDNESDAY', 17, 2, 5, 5, 21, NULL, 'DS1005', 'P138', 20, 'THEORY');

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
(2, 'BDes'),
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
(1, 'ECE Lab 1', 63, 'LAB'),
(2, 'ECE Lab 2', 71, 'LAB'),
(3, 'CC GF Lab', 72, 'LAB'),
(4, 'CC 2F Lab', 72, 'LAB'),
(5, 'CC 3F Lab', 72, 'LAB'),
(6, 'CC FF Lab', 72, 'LAB'),
(7, 'Mechatronics Lab', 40, 'LAB'),
(8, 'Control Lab', 63, 'LAB'),
(9, 'Design Studio', 100, 'LAB'),
(10, 'VLSI Lab', 40, 'LAB'),
(11, 'CR101', 81, 'CLASSROOM'),
(12, 'CR102', 81, 'CLASSROOM'),
(13, 'CR103', 81, 'CLASSROOM'),
(14, 'CR104', 81, 'CLASSROOM'),
(15, 'CR107', 90, 'CLASSROOM'),
(16, 'CR108', 90, 'CLASSROOM'),
(17, 'CR109', 90, 'CLASSROOM'),
(18, 'CR201', 90, 'CLASSROOM'),
(19, 'CR202', 90, 'CLASSROOM'),
(20, 'CR208', 90, 'CLASSROOM'),
(21, 'L102', 252, 'CLASSROOM'),
(22, 'L104', 240, 'CLASSROOM'),
(23, 'L105', 240, 'CLASSROOM'),
(24, 'L106', 240, 'CLASSROOM'),
(25, 'L107', 240, 'CLASSROOM'),
(26, 'L201', 140, 'CLASSROOM'),
(27, 'L202', 252, 'CLASSROOM'),
(28, 'L206', 200, 'CLASSROOM'),
(29, 'L207', 200, 'CLASSROOM'),
(30, 'Auditorium', 600, 'CLASSROOM');

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
(1, 'CSE-A', 1, 1),
(6, 'CSE-A', 1, 2),
(11, 'CSE-A', 1, 3),
(16, 'CSE-A', 1, 4),
(2, 'CSE-B', 1, 1),
(7, 'CSE-B', 1, 2),
(12, 'CSE-B', 1, 3),
(17, 'CSE-B', 1, 4),
(21, 'DS-F', 5, 5),
(3, 'ECE-C', 2, 1),
(8, 'ECE-C', 2, 2),
(13, 'ECE-C', 2, 3),
(18, 'ECE-C', 2, 4),
(4, 'ME-E', 3, 1),
(9, 'ME-E', 3, 2),
(14, 'ME-E', 3, 3),
(19, 'ME-E', 3, 4),
(5, 'SM-D', 4, 1),
(10, 'SM-D', 4, 2),
(15, 'SM-D', 4, 3),
(20, 'SM-D', 4, 4);

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
(1, 1, 1, 1),
(2, 3, 2, 1),
(3, 5, 3, 1),
(4, 7, 4, 1),
(5, 1, 5, 2);

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

--
-- Dumping data for table `subsection`
--

INSERT INTO `subsection` (`subsection_id`, `subsection_name`, `section_id`, `subsection_capacity`) VALUES
(1, 'CSE-A1', 6, 75),
(2, 'CSE-A2', 6, 75),
(3, 'CSE-B1', 7, 75),
(4, 'CSE-B2', 7, 75),
(5, 'ECE-C1', 8, 75),
(6, 'ECE-C2', 8, 75),
(7, 'CSE-A1', 11, 75),
(8, 'CSE-A2', 11, 75),
(9, 'CSE-B1', 12, 75),
(10, 'CSE-B2', 12, 75),
(11, 'ECE-C1', 13, 75),
(12, 'ECE-C2', 13, 75),
(13, 'CSE-A1', 16, 75),
(14, 'CSE-A2', 16, 75),
(15, 'CSE-B1', 17, 75),
(16, 'CSE-B2', 17, 75),
(17, 'ECE-C1', 18, 75),
(18, 'ECE-C2', 18, 75),
(19, 'DS-F1', 21, 33),
(20, 'DS-F2', 21, 33);

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
  `component_type` enum('THEORY','TUTORIAL','LAB') NOT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'MONDAY', '09:00:00', '10:00:00', 1),
(2, 'MONDAY', '10:00:00', '11:00:00', 2),
(3, 'MONDAY', '11:00:00', '12:00:00', 3),
(4, 'MONDAY', '12:00:00', '13:00:00', 4),
(5, 'MONDAY', '14:00:00', '15:00:00', 5),
(6, 'MONDAY', '15:00:00', '16:00:00', 6),
(7, 'MONDAY', '16:00:00', '17:00:00', 7),
(8, 'MONDAY', '17:00:00', '18:00:00', 8),
(9, 'TUESDAY', '09:00:00', '10:00:00', 1),
(10, 'TUESDAY', '10:00:00', '11:00:00', 2),
(11, 'TUESDAY', '11:00:00', '12:00:00', 3),
(12, 'TUESDAY', '12:00:00', '13:00:00', 4),
(13, 'TUESDAY', '14:00:00', '15:00:00', 5),
(14, 'TUESDAY', '15:00:00', '16:00:00', 6),
(15, 'TUESDAY', '16:00:00', '17:00:00', 7),
(16, 'TUESDAY', '17:00:00', '18:00:00', 8),
(17, 'WEDNESDAY', '09:00:00', '10:00:00', 1),
(18, 'WEDNESDAY', '10:00:00', '11:00:00', 2),
(19, 'WEDNESDAY', '11:00:00', '12:00:00', 3),
(20, 'WEDNESDAY', '12:00:00', '13:00:00', 4),
(21, 'WEDNESDAY', '14:00:00', '15:00:00', 5),
(22, 'WEDNESDAY', '15:00:00', '16:00:00', 6),
(23, 'WEDNESDAY', '16:00:00', '17:00:00', 7),
(24, 'WEDNESDAY', '17:00:00', '18:00:00', 8),
(25, 'THURSDAY', '09:00:00', '10:00:00', 1),
(26, 'THURSDAY', '10:00:00', '11:00:00', 2),
(27, 'THURSDAY', '11:00:00', '12:00:00', 3),
(28, 'THURSDAY', '12:00:00', '13:00:00', 4),
(29, 'THURSDAY', '14:00:00', '15:00:00', 5),
(30, 'THURSDAY', '15:00:00', '16:00:00', 6),
(31, 'THURSDAY', '16:00:00', '17:00:00', 7),
(32, 'THURSDAY', '17:00:00', '18:00:00', 8),
(33, 'FRIDAY', '09:00:00', '10:00:00', 1),
(34, 'FRIDAY', '10:00:00', '11:00:00', 2),
(35, 'FRIDAY', '11:00:00', '12:00:00', 3),
(36, 'FRIDAY', '12:00:00', '13:00:00', 4),
(37, 'FRIDAY', '14:00:00', '15:00:00', 5),
(38, 'FRIDAY', '15:00:00', '16:00:00', 6),
(39, 'FRIDAY', '16:00:00', '17:00:00', 7),
(40, 'FRIDAY', '17:00:00', '18:00:00', 8);

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
(1, 'admin', 'admin123', 'admin');

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
(4, '4th Year', 1),
(5, '1st Year', 2),
(6, '2nd Year', 2),
(7, '3rd Year', 2),
(8, '4th Year', 2);

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
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `course_code` (`course_code`,`semester_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `course_branch`
--
ALTER TABLE `course_branch`
  ADD PRIMARY KEY (`course_code`,`branch_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_components`
--
ALTER TABLE `course_components`
  ADD PRIMARY KEY (`component_id`),
  ADD KEY `course_code` (`course_code`),
  ADD KEY `course_id` (`course_id`);

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
  ADD KEY `course_code` (`course_code`),
  ADD KEY `course_id` (`course_id`);

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
  ADD KEY `idx_fk_room` (`room_id`),
  ADD KEY `course_id` (`course_id`);

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
  MODIFY `branch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_components`
--
ALTER TABLE `course_components`
  MODIFY `component_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=353;

--
-- AUTO_INCREMENT for table `master_timetable`
--
ALTER TABLE `master_timetable`
  MODIFY `master_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1287;

--
-- AUTO_INCREMENT for table `program`
--
ALTER TABLE `program`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `section`
--
ALTER TABLE `section`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `semester`
--
ALTER TABLE `semester`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subsection`
--
ALTER TABLE `subsection`
  MODIFY `subsection_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `timetable`
--
ALTER TABLE `timetable`
  MODIFY `timetable_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_slots`
--
ALTER TABLE `time_slots`
  MODIFY `timeslot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `year`
--
ALTER TABLE `year`
  MODIFY `year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  ADD CONSTRAINT `course_branch_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_branch_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`);

--
-- Constraints for table `course_components`
--
ALTER TABLE `course_components`
  ADD CONSTRAINT `course_components_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`);

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
  ADD CONSTRAINT `faculty_course_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`);

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
  ADD CONSTRAINT `timetable_ibfk_4` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_5` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_6` FOREIGN KEY (`timeslot_id`) REFERENCES `time_slots` (`timeslot_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_7` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`);

--
-- Constraints for table `year`
--
ALTER TABLE `year`
  ADD CONSTRAINT `year_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
