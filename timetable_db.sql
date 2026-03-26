-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 26, 2026 at 08:31 AM
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
(128, 'NS1001', 'Mathematics-I', 1, 1, 0, NULL),
(129, 'NS1002', 'Engineering Mechanics', 1, 1, 0, NULL),
(130, 'HS1001', 'Effective Communications', 1, 1, 0, NULL),
(131, 'IT1001', 'Introduction to Programming in C', 1, 1, 0, NULL),
(132, 'IT1002', 'Introduction to Programming in Python', 1, 1, 0, NULL),
(133, 'ES1002', 'Fundamentals of Electrical and Electronics Engineering', 1, 1, 0, NULL),
(134, 'DS1005', 'Engineering Graphics', 1, 1, 0, NULL),
(135, 'CS1001', 'Introduction to Profession', 1, 1, 0, NULL),
(136, 'EC1001', 'Introduction to Profession', 1, 1, 0, NULL),
(137, 'ME1001', 'Introduction to Profession', 1, 1, 0, NULL),
(138, 'SM1001', 'Introduction to Profession', 1, 1, 0, NULL),
(139, 'DS1002', 'Design Fundamentals 1', 1, 5, 0, NULL),
(140, 'DS1003', 'Design Drawing', 1, 5, 0, NULL),
(141, 'DS1004', 'Representation Technique', 1, 5, 0, NULL),
(142, 'DS1005', 'Engineering Graphics', 1, 5, 0, NULL),
(143, 'HS1001', 'Effective Communications', 1, 5, 0, NULL),
(144, 'IT1002', 'Introduction to Programming In Python', 1, 5, 0, NULL),
(145, 'DS1001', 'Introduction to Profession', 1, 5, 0, NULL),
(146, 'NS2001', 'Biology for Engineers', 3, 2, 0, NULL),
(147, 'IT2001', 'Data Structure in C', 3, 2, 0, NULL),
(148, 'IT2002', 'Data Structure in Python', 3, 2, 0, NULL),
(149, 'CS2002', 'Computer Organization and Architecture', 3, 2, 0, NULL),
(150, 'EC2002', 'Digital Electronics and Microprocessor Interfacing', 3, 2, 0, NULL),
(151, 'ME2002', 'Manufacturing Process', 3, 2, 0, NULL),
(152, 'SM2002', 'Manufacturing Process', 3, 2, 0, NULL),
(153, 'CS2003', 'Database Management Systems', 3, 2, 0, NULL),
(154, 'EC203A', 'Principle of Analog Communications', 3, 2, 0, NULL),
(155, 'EC203B', 'Network Theory', 3, 2, 0, NULL),
(156, 'ME2003', 'Solid Mechanics', 3, 2, 0, NULL),
(157, 'SM2003', 'Solid Mechanics + Design', 3, 2, 0, NULL),
(158, 'CS2004', 'Introduction to Data Science', 3, 2, 0, NULL),
(159, 'EC204A', 'Electronics Devices and Circuits', 3, 2, 0, NULL),
(160, 'EC204B', 'Instrumentation and Measurement', 3, 2, 0, NULL),
(161, 'ME2004', 'Engineering Thermodynamics', 3, 2, 0, NULL),
(162, 'SM2004', 'Thermodynamics + Heat Transfer', 3, 2, 0, NULL),
(163, 'IT2C01', 'IT Workshop I', 3, 2, 0, NULL),
(164, 'IT2E01', 'IT Workshop I (Matlab)', 3, 2, 0, NULL),
(165, 'IT2M01', 'IT Workshop I (SolidWorks)', 3, 2, 0, NULL),
(166, 'IT2S01', 'IT Workshop I (SolidWorks)', 3, 2, 0, NULL),
(167, 'DS2005', 'Studies in Form', 3, 6, 0, NULL),
(168, 'DS2006', 'Industrial Design 1', 3, 6, 0, NULL),
(169, 'DS2007', 'Communication Design 1', 3, 6, 0, NULL),
(170, 'DS2008', 'Design Project 1', 3, 6, 0, NULL),
(171, 'DS2010', 'Material and Processes', 3, 6, 0, NULL),
(187, 'OE2C02', 'Discrete Structures', 3, 2, 1, 1),
(188, 'OE2E01', 'Introduction to Sensors and Actuators', 3, 2, 1, 1),
(189, 'OE2E03', 'Fundamentals of Signals and Systems', 3, 2, 1, 1),
(190, 'OE2M07', 'Operations Research', 3, 2, 1, 1),
(191, 'OE2D11', 'Design Thinking', 3, 2, 1, 1),
(192, 'OE3N36', 'Probability and Statistics', 3, 2, 1, 1),
(193, 'OE2N12', 'Numerical Methods for Engineers', 3, 2, 1, 1),
(194, 'OE2D14', 'Science and Culture a Comparison', 3, 2, 1, 1),
(195, 'OE2C02', 'Discrete Structures', 3, 6, 1, 1),
(196, 'OE2E01', 'Introduction to Sensors and Actuators', 3, 6, 1, 1),
(197, 'OE2E03', 'Fundamentals of Signals and Systems', 3, 6, 1, 1),
(198, 'OE2M07', 'Operations Research', 3, 6, 1, 1),
(199, 'OE2D11', 'Design Thinking', 3, 6, 1, 1),
(200, 'OE3N36', 'Probability and Statistics', 3, 6, 1, 1),
(201, 'OE2N12', 'Numerical Methods for Engineers', 3, 6, 1, 1),
(202, 'OE2D14', 'Science and Culture a Comparison', 3, 6, 1, 1),
(203, 'HS3004', 'Ecology & Environment Science', 5, 3, 0, NULL),
(204, 'DS3001', 'Engineering Design – Including Design and Fabrication Project', 5, 3, 0, NULL),
(205, 'CS3009', 'Network Security & Cryptography', 5, 3, 0, NULL),
(206, 'EC3009', 'VLSI System Design', 5, 3, 0, NULL),
(207, 'ME3009', 'Design of Mechanical Components', 5, 3, 0, NULL),
(208, 'SM3009', 'Additive and Subtractive Manufacturing Processes', 5, 3, 0, NULL),
(209, 'CS3010', 'Software Engineering', 5, 3, 0, NULL),
(210, 'EC3010', 'Fundamentals of Electromagnetic Theory', 5, 3, 0, NULL),
(211, 'ME3010', 'Industrial Internet of Things', 5, 3, 0, NULL),
(212, 'SM3010', 'Computer Aided Product Development', 5, 3, 0, NULL),
(213, 'CS3011', 'Artificial Intelligence', 5, 3, 0, NULL),
(214, 'EC3011', 'Digital Communications', 5, 3, 0, NULL),
(215, 'ME3011', 'Heat Transfer', 5, 3, 0, NULL),
(216, 'SM3011', 'Industrial Automation', 5, 3, 0, NULL),
(217, 'SM3012', 'Advanced Cyber Physical System', 5, 3, 0, NULL),
(218, 'IT3C01', 'IT Workshop III', 5, 3, 0, NULL),
(219, 'IT3E01', 'IT Workshop III (Tanner Tool, VHDL)', 5, 3, 0, NULL),
(220, 'IT3M01', 'IT Workshop III (CATIA + CAM)', 5, 3, 0, NULL),
(221, 'IT3S01', 'IT Workshop III (CATIA + CAM)', 5, 3, 0, NULL),
(222, 'DS3001', 'Engineering Design – Including Design and Fabrication Project', 5, 7, 0, NULL),
(223, 'DS3009', 'Service Design', 5, 7, 0, NULL),
(224, 'DS3010', 'Sustainable Design', 5, 7, 0, NULL),
(225, 'DS3011', 'Design Management', 5, 7, 0, NULL),
(226, 'DS3012', 'Design Project 3', 5, 7, 0, NULL),
(227, 'CS8028', 'Hardware Security', 5, 3, 1, 3),
(228, 'OE3E40', 'Computation Genomic & Proteomic', 5, 3, 1, 3),
(229, 'OE4E50', 'Detection and Estimation Theory', 5, 3, 1, 3),
(230, 'OE3E25', 'VLSI Design and Materials', 5, 3, 1, 3),
(231, 'OE3M26', 'Computer-Aided Design (CAD)', 5, 3, 1, 3),
(232, 'OE3N38', 'Biophysics', 5, 3, 1, 3),
(233, 'OE3D15', 'Applied Ergonomics', 5, 3, 1, 3),
(234, 'OE3D16', 'Visual Ergonomics', 5, 3, 1, 3),
(235, 'CS8028', 'Hardware Security', 5, 7, 1, 3),
(236, 'OE3E40', 'Computation Genomic & Proteomic', 5, 7, 1, 3),
(237, 'OE4E50', 'Detection and Estimation Theory', 5, 7, 1, 3),
(238, 'OE3E25', 'VLSI Design and Materials', 5, 7, 1, 3),
(239, 'OE3M26', 'Computer-Aided Design (CAD)', 5, 7, 1, 3),
(240, 'OE3N38', 'Biophysics', 5, 7, 1, 3),
(241, 'OE3D15', 'Applied Ergonomics', 5, 7, 1, 3),
(242, 'OE3D16', 'Visual Ergonomics', 5, 7, 1, 3),
(243, 'CS8036', 'Quantum Computing: Foundations, Algorithms and Applications', 7, 4, 1, 7),
(244, 'OE3E33', 'RF and Microwave Engineering', 7, 4, 1, 7),
(245, 'EC5M02', 'Advanced Signal Processing', 7, 4, 1, 7),
(246, 'MT5003', 'Sensors and Actuators', 7, 4, 1, 7),
(247, 'ME5D03', 'Finite Element Methods for Mechanical Engineering', 7, 4, 1, 7),
(248, 'CS8036', 'Quantum Computing: Foundations, Algorithms and Applications', 7, 8, 1, 7),
(249, 'OE3E33', 'RF and Microwave Engineering', 7, 8, 1, 7),
(250, 'EC5M02', 'Advanced Signal Processing', 7, 8, 1, 7),
(251, 'MT5003', 'Sensors and Actuators', 7, 8, 1, 7),
(252, 'ME5D03', 'Finite Element Methods for Mechanical Engineering', 7, 8, 1, 7),
(253, 'CS8031', 'Cyber Security', 7, 4, 1, 8),
(254, 'CS8004', 'Deep Learning and Applications', 7, 4, 1, 8),
(255, 'OE4E25', 'Advance Antenna Theory Design', 7, 4, 1, 8),
(256, 'EC8030', 'CMOS Memory Design', 7, 4, 1, 8),
(257, 'EC5N02', 'Digital VLSI Design', 7, 4, 1, 8),
(258, 'OE4M41', 'Micro and Nano manufacturing', 7, 4, 1, 8),
(259, 'ME5D02', 'Mechanical Vibrations and Condition Monitoring', 7, 4, 1, 8),
(260, 'OE4M35', 'Advanced Manufacturing Processes and Technologies', 7, 4, 1, 8),
(261, 'CS8031', 'Cyber Security', 7, 8, 1, 8),
(262, 'CS8004', 'Deep Learning and Applications', 7, 8, 1, 8),
(263, 'OE4E25', 'Advance Antenna Theory Design', 7, 8, 1, 8),
(264, 'EC8030', 'CMOS Memory Design', 7, 8, 1, 8),
(265, 'EC5N02', 'Digital VLSI Design', 7, 8, 1, 8),
(266, 'OE4M41', 'Micro and Nano manufacturing', 7, 8, 1, 8),
(267, 'ME5D02', 'Mechanical Vibrations and Condition Monitoring', 7, 8, 1, 8),
(268, 'OE4M35', 'Advanced Manufacturing Processes and Technologies', 7, 8, 1, 8),
(269, 'CS8018', 'Web Mining', 7, 4, 1, 9),
(270, 'EC8004', 'Pattern Recognition and Machine Learning', 7, 4, 1, 9),
(271, 'OE4E69', 'Optical Communication', 7, 4, 1, 9),
(272, 'ME8016', 'Biomaterials Science and Engineering', 7, 4, 1, 9),
(273, 'OE4M52', 'Rapid Product Development Technologies', 7, 4, 1, 9),
(274, 'CS8018', 'Web Mining', 7, 8, 1, 9),
(275, 'EC8004', 'Pattern Recognition and Machine Learning', 7, 8, 1, 9),
(276, 'OE4E69', 'Optical Communication', 7, 8, 1, 9),
(277, 'ME8016', 'Biomaterials Science and Engineering', 7, 8, 1, 9),
(278, 'OE4M52', 'Rapid Product Development Technologies', 7, 8, 1, 9),
(279, 'CS8025', 'Fuzzy Sets, Logic and Applications', 7, 4, 1, 10),
(280, 'EC5P03', 'Power Electronics & Drives', 7, 4, 1, 10),
(281, 'EC5M03', 'Time Frequency Analysis', 7, 4, 1, 10),
(282, 'OE4M22', 'Industrial Instrumentation & Metrology', 7, 4, 1, 10),
(283, 'OE4M76', 'Digital Twins in Manufacturing', 7, 4, 1, 10),
(284, 'OE4L73', 'Life Skill Management', 7, 4, 1, 10),
(285, 'NP8002', 'Emerging Electronic Materials', 7, 4, 1, 10),
(286, 'CS8025', 'Fuzzy Sets, Logic and Applications', 7, 8, 1, 10),
(287, 'EC5P03', 'Power Electronics & Drives', 7, 8, 1, 10),
(288, 'EC5M03', 'Time Frequency Analysis', 7, 8, 1, 10),
(289, 'OE4M22', 'Industrial Instrumentation & Metrology', 7, 8, 1, 10),
(290, 'OE4M76', 'Digital Twins in Manufacturing', 7, 8, 1, 10),
(291, 'OE4L73', 'Life Skill Management', 7, 8, 1, 10),
(292, 'NP8002', 'Emerging Electronic Materials', 7, 8, 1, 10),
(293, 'CS8007', 'Social Network Analysis', 7, 4, 1, 11),
(294, 'EC5C01', 'Advanced Digital Communication', 7, 4, 1, 11),
(295, 'EC5N01', 'Physics of Semiconductor Devices', 7, 4, 1, 11),
(296, 'ME8002', 'Design for Experiments', 7, 4, 1, 11),
(297, 'OE4M74', 'AI and ML for Engineering', 7, 4, 1, 11),
(298, 'CS8007', 'Social Network Analysis', 7, 8, 1, 11),
(299, 'EC5C01', 'Advanced Digital Communication', 7, 8, 1, 11),
(300, 'EC5N01', 'Physics of Semiconductor Devices', 7, 8, 1, 11),
(301, 'ME8002', 'Design for Experiments', 7, 8, 1, 11),
(302, 'OE4M74', 'AI and ML for Engineering', 7, 8, 1, 11);

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
('CS1001', 1, 150, 135),
('CS2002', 1, 150, 149),
('CS2003', 1, 150, 153),
('CS2004', 1, 150, 158),
('CS3009', 1, 150, 205),
('CS3010', 1, 150, 209),
('CS3011', 1, 150, 213),
('CS8004', 1, 87, 254),
('CS8004', 2, 87, 254),
('CS8004', 3, 87, 254),
('CS8004', 4, 87, 254),
('CS8004', 5, 87, 254),
('CS8007', 1, 90, 293),
('CS8007', 2, 90, 293),
('CS8007', 3, 90, 293),
('CS8007', 4, 90, 293),
('CS8007', 5, 90, 293),
('CS8018', 1, 90, 269),
('CS8018', 2, 90, 269),
('CS8018', 3, 90, 269),
('CS8018', 4, 90, 269),
('CS8018', 5, 90, 269),
('CS8025', 1, 90, 279),
('CS8025', 2, 90, 279),
('CS8025', 3, 90, 279),
('CS8025', 4, 90, 279),
('CS8025', 5, 90, 279),
('CS8028', 1, 180, 227),
('CS8028', 2, 180, 227),
('CS8028', 3, 180, 227),
('CS8028', 4, 180, 227),
('CS8028', 5, 180, 227),
('CS8031', 1, 180, 253),
('CS8031', 2, 180, 253),
('CS8031', 3, 180, 253),
('CS8031', 4, 180, 253),
('CS8031', 5, 180, 253),
('CS8036', 1, 180, 243),
('CS8036', 2, 180, 243),
('CS8036', 3, 180, 243),
('CS8036', 4, 180, 243),
('CS8036', 5, 180, 243),
('DS1001', 5, 150, 145),
('DS1002', 5, 150, 139),
('DS1003', 5, 150, 140),
('DS1004', 5, 150, 141),
('DS1005', 2, 150, 134),
('DS1005', 3, 70, 134),
('DS1005', 4, 70, 134),
('DS1005', 5, 150, 142),
('DS2005', 5, 50, 167),
('DS2006', 5, 50, 168),
('DS2007', 5, 50, 169),
('DS2008', 5, 50, 170),
('DS2010', 5, 50, 171),
('DS3001', 1, 150, 204),
('DS3001', 2, 150, 204),
('DS3001', 3, 70, 204),
('DS3001', 4, 70, 204),
('DS3001', 5, 70, 204),
('DS3009', 5, 50, 223),
('DS3010', 5, 50, 224),
('DS3011', 5, 50, 225),
('DS3012', 5, 50, 226),
('EC1001', 2, 150, 136),
('EC2002', 2, 150, 150),
('EC203A', 2, 150, 154),
('EC203B', 2, 150, 155),
('EC204A', 2, 150, 159),
('EC204B', 2, 150, 160),
('EC3009', 2, 150, 206),
('EC3010', 2, 150, 210),
('EC3011', 2, 150, 214),
('EC5C01', 1, 90, 294),
('EC5C01', 2, 90, 294),
('EC5C01', 3, 90, 294),
('EC5C01', 4, 90, 294),
('EC5C01', 5, 90, 294),
('EC5M02', 1, 90, 245),
('EC5M02', 2, 90, 245),
('EC5M02', 3, 90, 245),
('EC5M02', 4, 90, 245),
('EC5M02', 5, 90, 245),
('EC5M03', 1, 45, 281),
('EC5M03', 2, 45, 281),
('EC5M03', 3, 45, 281),
('EC5M03', 4, 45, 281),
('EC5M03', 5, 45, 281),
('EC5N01', 1, 90, 295),
('EC5N01', 2, 90, 295),
('EC5N01', 3, 90, 295),
('EC5N01', 4, 90, 295),
('EC5N01', 5, 90, 295),
('EC5N02', 1, 12, 257),
('EC5N02', 2, 12, 257),
('EC5N02', 3, 12, 257),
('EC5N02', 4, 12, 257),
('EC5N02', 5, 12, 257),
('EC5P03', 1, 64, 280),
('EC5P03', 2, 64, 280),
('EC5P03', 3, 64, 280),
('EC5P03', 4, 64, 280),
('EC5P03', 5, 64, 280),
('EC8004', 1, 90, 270),
('EC8004', 2, 90, 270),
('EC8004', 3, 90, 270),
('EC8004', 4, 90, 270),
('EC8004', 5, 90, 270),
('EC8030', 1, 90, 256),
('EC8030', 2, 90, 256),
('EC8030', 3, 90, 256),
('EC8030', 4, 90, 256),
('EC8030', 5, 90, 256),
('ES1002', 1, 150, 133),
('HS1001', 1, 150, 130),
('HS1001', 2, 150, 130),
('HS1001', 3, 70, 130),
('HS1001', 4, 70, 130),
('HS1001', 5, 150, 143),
('HS3004', 1, 150, 203),
('IT1001', 1, 150, 131),
('IT1002', 2, 150, 132),
('IT1002', 3, 70, 132),
('IT1002', 4, 70, 132),
('IT1002', 5, 150, 144),
('IT2001', 1, 150, 147),
('IT2002', 2, 150, 148),
('IT2002', 3, 70, 148),
('IT2002', 4, 70, 148),
('IT2002', 5, 66, 148),
('IT2C01', 1, 150, 163),
('IT2E01', 2, 150, 164),
('IT2M01', 3, 70, 165),
('IT2S01', 4, 70, 166),
('IT3C01', 1, 150, 218),
('IT3E01', 2, 150, 219),
('IT3M01', 3, 70, 220),
('IT3S01', 4, 70, 221),
('ME1001', 3, 70, 137),
('ME2002', 3, 70, 151),
('ME2003', 3, 70, 156),
('ME2004', 3, 70, 161),
('ME3009', 3, 70, 207),
('ME3010', 3, 70, 211),
('ME3011', 3, 70, 215),
('ME5D02', 1, 6, 259),
('ME5D02', 2, 6, 259),
('ME5D02', 3, 6, 259),
('ME5D02', 4, 6, 259),
('ME5D02', 5, 6, 259),
('ME5D03', 1, 40, 247),
('ME5D03', 2, 40, 247),
('ME5D03', 3, 40, 247),
('ME5D03', 4, 40, 247),
('ME5D03', 5, 40, 247),
('ME8002', 1, 90, 296),
('ME8002', 2, 90, 296),
('ME8002', 3, 90, 296),
('ME8002', 4, 90, 296),
('ME8002', 5, 90, 296),
('ME8016', 1, 90, 272),
('ME8016', 2, 90, 272),
('ME8016', 3, 90, 272),
('ME8016', 4, 90, 272),
('ME8016', 5, 90, 272),
('MT5003', 1, 90, 246),
('MT5003', 2, 90, 246),
('MT5003', 3, 90, 246),
('MT5003', 4, 90, 246),
('MT5003', 5, 90, 246),
('NP8002', 1, 90, 285),
('NP8002', 2, 90, 285),
('NP8002', 3, 90, 285),
('NP8002', 4, 90, 285),
('NP8002', 5, 90, 285),
('NS1001', 1, 150, 128),
('NS1001', 2, 150, 128),
('NS1001', 3, 70, 128),
('NS1001', 4, 70, 128),
('NS1002', 1, 150, 129),
('NS1002', 2, 150, 129),
('NS1002', 3, 70, 129),
('NS1002', 4, 70, 129),
('NS2001', 1, 150, 146),
('OE2C02', 1, 90, 187),
('OE2C02', 2, 90, 187),
('OE2C02', 3, 90, 187),
('OE2C02', 4, 90, 187),
('OE2C02', 5, 90, 187),
('OE2D11', 1, 90, 191),
('OE2D11', 2, 90, 191),
('OE2D11', 3, 90, 191),
('OE2D11', 4, 90, 191),
('OE2D11', 5, 90, 191),
('OE2D14', 1, 90, 194),
('OE2D14', 2, 90, 194),
('OE2D14', 3, 90, 194),
('OE2D14', 4, 90, 194),
('OE2D14', 5, 90, 194),
('OE2E01', 1, 75, 188),
('OE2E01', 2, 75, 188),
('OE2E01', 3, 75, 188),
('OE2E01', 4, 75, 188),
('OE2E01', 5, 75, 188),
('OE2E03', 1, 90, 189),
('OE2E03', 2, 90, 189),
('OE2E03', 3, 90, 189),
('OE2E03', 4, 90, 189),
('OE2E03', 5, 90, 189),
('OE2M07', 1, 90, 190),
('OE2M07', 2, 90, 190),
('OE2M07', 3, 90, 190),
('OE2M07', 4, 90, 190),
('OE2M07', 5, 90, 190),
('OE2N12', 1, 14, 193),
('OE2N12', 2, 14, 193),
('OE2N12', 3, 14, 193),
('OE2N12', 4, 14, 193),
('OE2N12', 5, 14, 193),
('OE3D15', 1, 7, 233),
('OE3D15', 2, 7, 233),
('OE3D15', 3, 7, 233),
('OE3D15', 4, 7, 233),
('OE3D15', 5, 7, 233),
('OE3D16', 1, 44, 234),
('OE3D16', 2, 44, 234),
('OE3D16', 3, 44, 234),
('OE3D16', 4, 44, 234),
('OE3D16', 5, 44, 234),
('OE3E25', 1, 51, 230),
('OE3E25', 2, 51, 230),
('OE3E25', 3, 51, 230),
('OE3E25', 4, 51, 230),
('OE3E25', 5, 51, 230),
('OE3E33', 1, 90, 244),
('OE3E33', 2, 90, 244),
('OE3E33', 3, 90, 244),
('OE3E33', 4, 90, 244),
('OE3E33', 5, 90, 244),
('OE3E40', 1, 74, 228),
('OE3E40', 2, 74, 228),
('OE3E40', 3, 74, 228),
('OE3E40', 4, 74, 228),
('OE3E40', 5, 74, 228),
('OE3M26', 1, 57, 231),
('OE3M26', 2, 57, 231),
('OE3M26', 3, 57, 231),
('OE3M26', 4, 57, 231),
('OE3M26', 5, 57, 231),
('OE3N36', 1, 36, 192),
('OE3N36', 2, 36, 192),
('OE3N36', 3, 36, 192),
('OE3N36', 4, 36, 192),
('OE3N36', 5, 36, 192),
('OE3N38', 1, 90, 232),
('OE3N38', 2, 90, 232),
('OE3N38', 3, 90, 232),
('OE3N38', 4, 90, 232),
('OE3N38', 5, 90, 232),
('OE4E25', 1, 35, 255),
('OE4E25', 2, 35, 255),
('OE4E25', 3, 35, 255),
('OE4E25', 4, 35, 255),
('OE4E25', 5, 35, 255),
('OE4E50', 1, 60, 229),
('OE4E50', 2, 60, 229),
('OE4E50', 3, 60, 229),
('OE4E50', 4, 60, 229),
('OE4E50', 5, 60, 229),
('OE4E69', 1, 90, 271),
('OE4E69', 2, 90, 271),
('OE4E69', 3, 90, 271),
('OE4E69', 4, 90, 271),
('OE4E69', 5, 90, 271),
('OE4L73', 1, 90, 284),
('OE4L73', 2, 90, 284),
('OE4L73', 3, 90, 284),
('OE4L73', 4, 90, 284),
('OE4L73', 5, 90, 284),
('OE4M22', 1, 56, 282),
('OE4M22', 2, 56, 282),
('OE4M22', 3, 56, 282),
('OE4M22', 4, 56, 282),
('OE4M22', 5, 56, 282),
('OE4M35', 1, 90, 260),
('OE4M35', 2, 90, 260),
('OE4M35', 3, 90, 260),
('OE4M35', 4, 90, 260),
('OE4M35', 5, 90, 260),
('OE4M41', 1, 34, 258),
('OE4M41', 2, 34, 258),
('OE4M41', 3, 34, 258),
('OE4M41', 4, 34, 258),
('OE4M41', 5, 34, 258),
('OE4M52', 1, 90, 273),
('OE4M52', 2, 90, 273),
('OE4M52', 3, 90, 273),
('OE4M52', 4, 90, 273),
('OE4M52', 5, 90, 273),
('OE4M74', 1, 90, 297),
('OE4M74', 2, 90, 297),
('OE4M74', 3, 90, 297),
('OE4M74', 4, 90, 297),
('OE4M74', 5, 90, 297),
('OE4M76', 1, 90, 283),
('OE4M76', 2, 90, 283),
('OE4M76', 3, 90, 283),
('OE4M76', 4, 90, 283),
('OE4M76', 5, 90, 283),
('SM1001', 4, 70, 138),
('SM2002', 4, 70, 152),
('SM2003', 4, 70, 157),
('SM2004', 4, 70, 162),
('SM3009', 4, 70, 208),
('SM3010', 4, 70, 212),
('SM3011', 4, 70, 216),
('SM3012', 4, 70, 217);

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
(389, 'NS1001', 'THEORY', 'COMBINED', 128),
(390, 'NS1001', 'THEORY', 'COMBINED', 128),
(391, 'NS1001', 'THEORY', 'COMBINED', 128),
(392, 'NS1001', 'TUTORIAL', 'COMBINED', 128),
(393, 'NS1002', 'THEORY', 'COMBINED', 129),
(394, 'NS1002', 'THEORY', 'COMBINED', 129),
(395, 'NS1002', 'TUTORIAL', 'COMBINED', 129),
(396, 'NS1002', 'LAB', 'SPLIT', 129),
(397, 'NS1002', 'LAB', 'SPLIT', 129),
(398, 'HS1001', 'THEORY', 'COMBINED', 130),
(399, 'HS1001', 'TUTORIAL', 'COMBINED', 130),
(400, 'HS1001', 'TUTORIAL', 'COMBINED', 130),
(401, 'IT1001', 'THEORY', 'COMBINED', 131),
(402, 'IT1001', 'THEORY', 'COMBINED', 131),
(403, 'IT1001', 'LAB', 'COMBINED', 131),
(404, 'IT1001', 'LAB', 'COMBINED', 131),
(405, 'IT1001', 'LAB', 'COMBINED', 131),
(406, 'IT1002', 'THEORY', 'COMBINED', 132),
(407, 'IT1002', 'THEORY', 'COMBINED', 132),
(408, 'IT1002', 'LAB', 'COMBINED', 132),
(409, 'IT1002', 'LAB', 'COMBINED', 132),
(410, 'IT1002', 'LAB', 'COMBINED', 132),
(411, 'ES1002', 'THEORY', 'COMBINED', 133),
(412, 'ES1002', 'THEORY', 'COMBINED', 133),
(413, 'ES1002', 'THEORY', 'COMBINED', 133),
(414, 'ES1002', 'LAB', 'SPLIT', 133),
(415, 'ES1002', 'LAB', 'SPLIT', 133),
(416, 'DS1005', 'THEORY', 'COMBINED', 134),
(417, 'DS1005', 'THEORY', 'COMBINED', 134),
(418, 'DS1005', 'LAB', 'COMBINED', 134),
(419, 'DS1005', 'LAB', 'COMBINED', 134),
(420, 'DS1005', 'LAB', 'COMBINED', 134),
(421, 'CS1001', 'THEORY', 'COMBINED', 135),
(422, 'EC1001', 'THEORY', 'COMBINED', 136),
(423, 'ME1001', 'THEORY', 'COMBINED', 137),
(424, 'SM1001', 'THEORY', 'COMBINED', 138),
(452, 'DS1002', 'THEORY', 'COMBINED', 139),
(453, 'DS1002', 'THEORY', 'COMBINED', 139),
(454, 'DS1002', 'LAB', 'COMBINED', 139),
(455, 'DS1002', 'LAB', 'COMBINED', 139),
(456, 'DS1003', 'THEORY', 'COMBINED', 140),
(457, 'DS1003', 'LAB', 'COMBINED', 140),
(458, 'DS1003', 'LAB', 'COMBINED', 140),
(459, 'DS1003', 'LAB', 'COMBINED', 140),
(460, 'DS1004', 'THEORY', 'COMBINED', 141),
(461, 'DS1004', 'THEORY', 'COMBINED', 141),
(462, 'DS1004', 'LAB', 'COMBINED', 141),
(463, 'DS1004', 'LAB', 'COMBINED', 141),
(464, 'DS1005', 'THEORY', 'COMBINED', 142),
(465, 'DS1005', 'THEORY', 'COMBINED', 142),
(466, 'DS1005', 'LAB', 'COMBINED', 142),
(467, 'DS1005', 'LAB', 'COMBINED', 142),
(468, 'DS1005', 'LAB', 'COMBINED', 142),
(469, 'HS1001', 'THEORY', 'COMBINED', 143),
(470, 'HS1001', 'TUTORIAL', 'COMBINED', 143),
(471, 'HS1001', 'TUTORIAL', 'COMBINED', 143),
(472, 'IT1002', 'THEORY', 'COMBINED', 144),
(473, 'IT1002', 'THEORY', 'COMBINED', 144),
(474, 'IT1002', 'LAB', 'COMBINED', 144),
(475, 'IT1002', 'LAB', 'COMBINED', 144),
(476, 'IT1002', 'LAB', 'COMBINED', 144),
(477, 'DS1001', 'THEORY', 'COMBINED', 145),
(483, 'NS2001', 'THEORY', 'COMBINED', 146),
(484, 'NS2001', 'THEORY', 'COMBINED', 146),
(485, 'IT2001', 'THEORY', 'COMBINED', 147),
(486, 'IT2001', 'THEORY', 'COMBINED', 147),
(487, 'IT2001', 'THEORY', 'COMBINED', 147),
(488, 'IT2001', 'LAB', 'COMBINED', 147),
(489, 'IT2001', 'LAB', 'COMBINED', 147),
(490, 'IT2002', 'THEORY', 'COMBINED', 148),
(491, 'IT2002', 'THEORY', 'COMBINED', 148),
(492, 'IT2002', 'THEORY', 'COMBINED', 148),
(493, 'IT2002', 'LAB', 'COMBINED', 148),
(494, 'IT2002', 'LAB', 'COMBINED', 148),
(495, 'CS2002', 'THEORY', 'COMBINED', 149),
(496, 'CS2002', 'THEORY', 'COMBINED', 149),
(497, 'CS2002', 'THEORY', 'COMBINED', 149),
(498, 'CS2002', 'TUTORIAL', 'COMBINED', 149),
(499, 'EC2002', 'THEORY', 'COMBINED', 150),
(500, 'EC2002', 'THEORY', 'COMBINED', 150),
(501, 'EC2002', 'THEORY', 'COMBINED', 150),
(502, 'EC2002', 'LAB', 'COMBINED', 150),
(503, 'EC2002', 'LAB', 'COMBINED', 150),
(504, 'ME2002', 'THEORY', 'COMBINED', 151),
(505, 'ME2002', 'THEORY', 'COMBINED', 151),
(506, 'ME2002', 'THEORY', 'COMBINED', 151),
(507, 'ME2002', 'LAB', 'COMBINED', 151),
(508, 'ME2002', 'LAB', 'COMBINED', 151),
(509, 'SM2002', 'THEORY', 'COMBINED', 152),
(510, 'SM2002', 'THEORY', 'COMBINED', 152),
(511, 'SM2002', 'THEORY', 'COMBINED', 152),
(512, 'SM2002', 'LAB', 'COMBINED', 152),
(513, 'SM2002', 'LAB', 'COMBINED', 152),
(514, 'CS2003', 'THEORY', 'COMBINED', 153),
(515, 'CS2003', 'THEORY', 'COMBINED', 153),
(516, 'CS2003', 'THEORY', 'COMBINED', 153),
(517, 'CS2003', 'LAB', 'COMBINED', 153),
(518, 'CS2003', 'LAB', 'COMBINED', 153),
(519, 'EC203A', 'THEORY', 'COMBINED', 154),
(520, 'EC203A', 'THEORY', 'COMBINED', 154),
(521, 'EC203B', 'THEORY', 'COMBINED', 155),
(522, 'EC203B', 'THEORY', 'COMBINED', 155),
(523, 'ME2003', 'THEORY', 'COMBINED', 156),
(524, 'ME2003', 'THEORY', 'COMBINED', 156),
(525, 'ME2003', 'TUTORIAL', 'COMBINED', 156),
(526, 'ME2003', 'TUTORIAL', 'COMBINED', 156),
(527, 'ME2003', 'LAB', 'COMBINED', 156),
(528, 'ME2003', 'LAB', 'COMBINED', 156),
(529, 'SM2003', 'THEORY', 'COMBINED', 157),
(530, 'SM2003', 'THEORY', 'COMBINED', 157),
(531, 'SM2003', 'THEORY', 'COMBINED', 157),
(532, 'SM2003', 'TUTORIAL', 'COMBINED', 157),
(533, 'SM2003', 'LAB', 'COMBINED', 157),
(534, 'SM2003', 'LAB', 'COMBINED', 157),
(535, 'CS2004', 'THEORY', 'COMBINED', 158),
(536, 'CS2004', 'THEORY', 'COMBINED', 158),
(537, 'CS2004', 'THEORY', 'COMBINED', 158),
(538, 'CS2004', 'LAB', 'COMBINED', 158),
(539, 'CS2004', 'LAB', 'COMBINED', 158),
(540, 'EC204A', 'THEORY', 'COMBINED', 159),
(541, 'EC204A', 'THEORY', 'COMBINED', 159),
(542, 'EC204B', 'THEORY', 'COMBINED', 160),
(543, 'EC204B', 'THEORY', 'COMBINED', 160),
(544, 'ME2004', 'THEORY', 'COMBINED', 161),
(545, 'ME2004', 'THEORY', 'COMBINED', 161),
(546, 'ME2004', 'THEORY', 'COMBINED', 161),
(547, 'ME2004', 'TUTORIAL', 'COMBINED', 161),
(548, 'ME2004', 'TUTORIAL', 'COMBINED', 161),
(549, 'SM2004', 'THEORY', 'COMBINED', 162),
(550, 'SM2004', 'THEORY', 'COMBINED', 162),
(551, 'SM2004', 'THEORY', 'COMBINED', 162),
(552, 'SM2004', 'TUTORIAL', 'COMBINED', 162),
(553, 'IT2C01', 'LAB', 'COMBINED', 163),
(554, 'IT2C01', 'LAB', 'COMBINED', 163),
(555, 'IT2C01', 'LAB', 'COMBINED', 163),
(556, 'IT2E01', 'LAB', 'COMBINED', 164),
(557, 'IT2E01', 'LAB', 'COMBINED', 164),
(558, 'IT2E01', 'LAB', 'COMBINED', 164),
(559, 'IT2M01', 'LAB', 'COMBINED', 165),
(560, 'IT2M01', 'LAB', 'COMBINED', 165),
(561, 'IT2M01', 'LAB', 'COMBINED', 165),
(562, 'IT2S01', 'LAB', 'COMBINED', 166),
(563, 'IT2S01', 'LAB', 'COMBINED', 166),
(564, 'IT2S01', 'LAB', 'COMBINED', 166),
(610, 'DS2005', 'THEORY', 'COMBINED', 167),
(611, 'DS2005', 'THEORY', 'COMBINED', 167),
(612, 'DS2005', 'LAB', 'COMBINED', 167),
(613, 'DS2005', 'LAB', 'COMBINED', 167),
(614, 'DS2006', 'THEORY', 'COMBINED', 168),
(615, 'DS2006', 'THEORY', 'COMBINED', 168),
(616, 'DS2006', 'LAB', 'COMBINED', 168),
(617, 'DS2006', 'LAB', 'COMBINED', 168),
(618, 'DS2007', 'THEORY', 'COMBINED', 169),
(619, 'DS2007', 'THEORY', 'COMBINED', 169),
(620, 'DS2007', 'LAB', 'COMBINED', 169),
(621, 'DS2007', 'LAB', 'COMBINED', 169),
(622, 'DS2008', 'LAB', 'COMBINED', 170),
(623, 'DS2008', 'LAB', 'COMBINED', 170),
(624, 'DS2008', 'LAB', 'COMBINED', 170),
(625, 'DS2008', 'LAB', 'COMBINED', 170),
(626, 'DS2008', 'LAB', 'COMBINED', 170),
(627, 'DS2008', 'LAB', 'COMBINED', 170),
(628, 'DS2010', 'THEORY', 'COMBINED', 171),
(629, 'DS2010', 'THEORY', 'COMBINED', 171),
(630, 'DS2010', 'LAB', 'COMBINED', 171),
(631, 'DS2010', 'LAB', 'COMBINED', 171),
(641, 'OE2C02', 'THEORY', 'COMBINED', 187),
(642, 'OE2C02', 'THEORY', 'COMBINED', 187),
(643, 'OE2C02', 'THEORY', 'COMBINED', 187),
(644, 'OE2E01', 'THEORY', 'COMBINED', 188),
(645, 'OE2E01', 'THEORY', 'COMBINED', 188),
(646, 'OE2E01', 'LAB', 'COMBINED', 188),
(647, 'OE2E01', 'LAB', 'COMBINED', 188),
(648, 'OE2E03', 'THEORY', 'COMBINED', 189),
(649, 'OE2E03', 'THEORY', 'COMBINED', 189),
(650, 'OE2E03', 'THEORY', 'COMBINED', 189),
(651, 'OE2M07', 'THEORY', 'COMBINED', 190),
(652, 'OE2M07', 'THEORY', 'COMBINED', 190),
(653, 'OE2M07', 'THEORY', 'COMBINED', 190),
(654, 'OE2D11', 'THEORY', 'COMBINED', 191),
(655, 'OE2D11', 'THEORY', 'COMBINED', 191),
(656, 'OE2D11', 'THEORY', 'COMBINED', 191),
(657, 'OE3N36', 'THEORY', 'COMBINED', 192),
(658, 'OE3N36', 'THEORY', 'COMBINED', 192),
(659, 'OE3N36', 'THEORY', 'COMBINED', 192),
(660, 'OE2N12', 'THEORY', 'COMBINED', 193),
(661, 'OE2N12', 'THEORY', 'COMBINED', 193),
(662, 'OE2N12', 'THEORY', 'COMBINED', 193),
(663, 'OE2D14', 'THEORY', 'COMBINED', 194),
(664, 'OE2D14', 'THEORY', 'COMBINED', 194),
(665, 'OE2D14', 'THEORY', 'COMBINED', 194),
(672, 'OE2C02', 'THEORY', 'COMBINED', 195),
(673, 'OE2C02', 'THEORY', 'COMBINED', 195),
(674, 'OE2C02', 'THEORY', 'COMBINED', 195),
(675, 'OE2E01', 'THEORY', 'COMBINED', 196),
(676, 'OE2E01', 'THEORY', 'COMBINED', 196),
(677, 'OE2E01', 'LAB', 'COMBINED', 196),
(678, 'OE2E01', 'LAB', 'COMBINED', 196),
(679, 'OE2E03', 'THEORY', 'COMBINED', 197),
(680, 'OE2E03', 'THEORY', 'COMBINED', 197),
(681, 'OE2E03', 'THEORY', 'COMBINED', 197),
(682, 'OE2M07', 'THEORY', 'COMBINED', 198),
(683, 'OE2M07', 'THEORY', 'COMBINED', 198),
(684, 'OE2M07', 'THEORY', 'COMBINED', 198),
(685, 'OE2D11', 'THEORY', 'COMBINED', 199),
(686, 'OE2D11', 'THEORY', 'COMBINED', 199),
(687, 'OE2D11', 'THEORY', 'COMBINED', 199),
(688, 'OE3N36', 'THEORY', 'COMBINED', 200),
(689, 'OE3N36', 'THEORY', 'COMBINED', 200),
(690, 'OE3N36', 'THEORY', 'COMBINED', 200),
(691, 'OE2N12', 'THEORY', 'COMBINED', 201),
(692, 'OE2N12', 'THEORY', 'COMBINED', 201),
(693, 'OE2N12', 'THEORY', 'COMBINED', 201),
(694, 'OE2D14', 'THEORY', 'COMBINED', 202),
(695, 'OE2D14', 'THEORY', 'COMBINED', 202),
(696, 'OE2D14', 'THEORY', 'COMBINED', 202),
(703, 'HS3004', 'THEORY', 'COMBINED', 203),
(704, 'HS3004', 'THEORY', 'COMBINED', 203),
(705, 'DS3001', 'THEORY', 'COMBINED', 204),
(706, 'DS3001', 'THEORY', 'COMBINED', 222),
(707, 'DS3001', 'LAB', 'COMBINED', 204),
(708, 'DS3001', 'LAB', 'COMBINED', 222),
(709, 'DS3001', 'LAB', 'COMBINED', 204),
(710, 'DS3001', 'LAB', 'COMBINED', 222),
(711, 'DS3001', 'LAB', 'COMBINED', 204),
(712, 'DS3001', 'LAB', 'COMBINED', 222),
(713, 'DS3001', 'LAB', 'COMBINED', 204),
(714, 'DS3001', 'LAB', 'COMBINED', 222),
(715, 'DS3001', 'LAB', 'COMBINED', 204),
(716, 'DS3001', 'LAB', 'COMBINED', 222),
(717, 'DS3001', 'LAB', 'COMBINED', 204),
(718, 'DS3001', 'LAB', 'COMBINED', 222),
(719, 'CS3009', 'THEORY', 'COMBINED', 205),
(720, 'CS3009', 'THEORY', 'COMBINED', 205),
(721, 'CS3009', 'THEORY', 'COMBINED', 205),
(722, 'EC3009', 'THEORY', 'COMBINED', 206),
(723, 'EC3009', 'THEORY', 'COMBINED', 206),
(724, 'EC3009', 'THEORY', 'COMBINED', 206),
(725, 'ME3009', 'THEORY', 'COMBINED', 207),
(726, 'ME3009', 'THEORY', 'COMBINED', 207),
(727, 'ME3009', 'THEORY', 'COMBINED', 207),
(728, 'SM3009', 'THEORY', 'COMBINED', 208),
(729, 'SM3009', 'THEORY', 'COMBINED', 208),
(730, 'SM3009', 'LAB', 'COMBINED', 208),
(731, 'SM3009', 'LAB', 'COMBINED', 208),
(732, 'CS3010', 'THEORY', 'COMBINED', 209),
(733, 'CS3010', 'THEORY', 'COMBINED', 209),
(734, 'CS3010', 'THEORY', 'COMBINED', 209),
(735, 'CS3010', 'LAB', 'COMBINED', 209),
(736, 'CS3010', 'LAB', 'COMBINED', 209),
(737, 'EC3010', 'THEORY', 'COMBINED', 210),
(738, 'EC3010', 'THEORY', 'COMBINED', 210),
(739, 'EC3010', 'THEORY', 'COMBINED', 210),
(740, 'ME3010', 'THEORY', 'COMBINED', 211),
(741, 'ME3010', 'THEORY', 'COMBINED', 211),
(742, 'ME3010', 'LAB', 'COMBINED', 211),
(743, 'ME3010', 'LAB', 'COMBINED', 211),
(744, 'SM3010', 'THEORY', 'COMBINED', 212),
(745, 'SM3010', 'THEORY', 'COMBINED', 212),
(746, 'SM3010', 'LAB', 'COMBINED', 212),
(747, 'SM3010', 'LAB', 'COMBINED', 212),
(748, 'CS3011', 'THEORY', 'COMBINED', 213),
(749, 'CS3011', 'THEORY', 'COMBINED', 213),
(750, 'CS3011', 'THEORY', 'COMBINED', 213),
(751, 'EC3011', 'THEORY', 'COMBINED', 214),
(752, 'EC3011', 'THEORY', 'COMBINED', 214),
(753, 'EC3011', 'THEORY', 'COMBINED', 214),
(754, 'ME3011', 'THEORY', 'COMBINED', 215),
(755, 'ME3011', 'THEORY', 'COMBINED', 215),
(756, 'ME3011', 'THEORY', 'COMBINED', 215),
(757, 'ME3011', 'LAB', 'COMBINED', 215),
(758, 'ME3011', 'LAB', 'COMBINED', 215),
(759, 'SM3011', 'THEORY', 'COMBINED', 216),
(760, 'SM3011', 'THEORY', 'COMBINED', 216),
(761, 'SM3011', 'THEORY', 'COMBINED', 216),
(762, 'SM3011', 'LAB', 'COMBINED', 216),
(763, 'SM3011', 'LAB', 'COMBINED', 216),
(764, 'SM3012', 'THEORY', 'COMBINED', 217),
(765, 'SM3012', 'THEORY', 'COMBINED', 217),
(766, 'SM3012', 'LAB', 'COMBINED', 217),
(767, 'SM3012', 'LAB', 'COMBINED', 217),
(768, 'IT3C01', 'LAB', 'COMBINED', 218),
(769, 'IT3E01', 'LAB', 'COMBINED', 219),
(770, 'IT3M01', 'LAB', 'COMBINED', 220),
(771, 'IT3S01', 'LAB', 'COMBINED', 221),
(772, 'IT3C01', 'LAB', 'COMBINED', 218),
(773, 'IT3E01', 'LAB', 'COMBINED', 219),
(774, 'IT3M01', 'LAB', 'COMBINED', 220),
(775, 'IT3S01', 'LAB', 'COMBINED', 221),
(776, 'IT3C01', 'LAB', 'COMBINED', 218),
(777, 'IT3E01', 'LAB', 'COMBINED', 219),
(778, 'IT3M01', 'LAB', 'COMBINED', 220),
(779, 'IT3S01', 'LAB', 'COMBINED', 221),
(780, 'DS3009', 'THEORY', 'COMBINED', 223),
(781, 'DS3009', 'THEORY', 'COMBINED', 223),
(782, 'DS3009', 'LAB', 'COMBINED', 223),
(783, 'DS3009', 'LAB', 'COMBINED', 223),
(784, 'DS3010', 'THEORY', 'COMBINED', 224),
(785, 'DS3010', 'THEORY', 'COMBINED', 224),
(786, 'DS3010', 'LAB', 'COMBINED', 224),
(787, 'DS3010', 'LAB', 'COMBINED', 224),
(788, 'DS3011', 'THEORY', 'COMBINED', 225),
(789, 'DS3011', 'THEORY', 'COMBINED', 225),
(790, 'DS3011', 'LAB', 'COMBINED', 225),
(791, 'DS3011', 'LAB', 'COMBINED', 225),
(792, 'DS3012', 'LAB', 'COMBINED', 226),
(793, 'DS3012', 'LAB', 'COMBINED', 226),
(794, 'DS3012', 'LAB', 'COMBINED', 226),
(795, 'DS3012', 'LAB', 'COMBINED', 226),
(796, 'DS3012', 'LAB', 'COMBINED', 226),
(797, 'DS3012', 'LAB', 'COMBINED', 226),
(830, 'CS8028', 'THEORY', 'COMBINED', 227),
(831, 'CS8028', 'THEORY', 'COMBINED', 235),
(832, 'CS8028', 'THEORY', 'COMBINED', 227),
(833, 'CS8028', 'THEORY', 'COMBINED', 235),
(834, 'CS8028', 'THEORY', 'COMBINED', 227),
(835, 'CS8028', 'THEORY', 'COMBINED', 235),
(836, 'OE3E40', 'THEORY', 'COMBINED', 228),
(837, 'OE3E40', 'THEORY', 'COMBINED', 236),
(838, 'OE3E40', 'THEORY', 'COMBINED', 228),
(839, 'OE3E40', 'THEORY', 'COMBINED', 236),
(840, 'OE3E40', 'THEORY', 'COMBINED', 228),
(841, 'OE3E40', 'THEORY', 'COMBINED', 236),
(842, 'OE4E50', 'THEORY', 'COMBINED', 229),
(843, 'OE4E50', 'THEORY', 'COMBINED', 237),
(844, 'OE4E50', 'THEORY', 'COMBINED', 229),
(845, 'OE4E50', 'THEORY', 'COMBINED', 237),
(846, 'OE4E50', 'THEORY', 'COMBINED', 229),
(847, 'OE4E50', 'THEORY', 'COMBINED', 237),
(848, 'OE3E25', 'THEORY', 'COMBINED', 230),
(849, 'OE3E25', 'THEORY', 'COMBINED', 238),
(850, 'OE3E25', 'THEORY', 'COMBINED', 230),
(851, 'OE3E25', 'THEORY', 'COMBINED', 238),
(852, 'OE3E25', 'THEORY', 'COMBINED', 230),
(853, 'OE3E25', 'THEORY', 'COMBINED', 238),
(854, 'OE3M26', 'THEORY', 'COMBINED', 231),
(855, 'OE3M26', 'THEORY', 'COMBINED', 239),
(856, 'OE3M26', 'THEORY', 'COMBINED', 231),
(857, 'OE3M26', 'THEORY', 'COMBINED', 239),
(858, 'OE3M26', 'THEORY', 'COMBINED', 231),
(859, 'OE3M26', 'THEORY', 'COMBINED', 239),
(860, 'OE3N38', 'THEORY', 'COMBINED', 232),
(861, 'OE3N38', 'THEORY', 'COMBINED', 240),
(862, 'OE3N38', 'THEORY', 'COMBINED', 232),
(863, 'OE3N38', 'THEORY', 'COMBINED', 240),
(864, 'OE3N38', 'THEORY', 'COMBINED', 232),
(865, 'OE3N38', 'THEORY', 'COMBINED', 240),
(866, 'OE3D15', 'THEORY', 'COMBINED', 233),
(867, 'OE3D15', 'THEORY', 'COMBINED', 241),
(868, 'OE3D15', 'THEORY', 'COMBINED', 233),
(869, 'OE3D15', 'THEORY', 'COMBINED', 241),
(870, 'OE3D15', 'THEORY', 'COMBINED', 233),
(871, 'OE3D15', 'THEORY', 'COMBINED', 241),
(872, 'OE3D16', 'THEORY', 'COMBINED', 234),
(873, 'OE3D16', 'THEORY', 'COMBINED', 242),
(874, 'OE3D16', 'THEORY', 'COMBINED', 234),
(875, 'OE3D16', 'THEORY', 'COMBINED', 242),
(876, 'OE3D16', 'THEORY', 'COMBINED', 234),
(877, 'OE3D16', 'THEORY', 'COMBINED', 242),
(893, 'CS8036', 'THEORY', 'COMBINED', 243),
(894, 'CS8036', 'THEORY', 'COMBINED', 248),
(895, 'CS8036', 'THEORY', 'COMBINED', 243),
(896, 'CS8036', 'THEORY', 'COMBINED', 248),
(897, 'CS8036', 'THEORY', 'COMBINED', 243),
(898, 'CS8036', 'THEORY', 'COMBINED', 248),
(899, 'OE3E33', 'THEORY', 'COMBINED', 244),
(900, 'OE3E33', 'THEORY', 'COMBINED', 249),
(901, 'OE3E33', 'THEORY', 'COMBINED', 244),
(902, 'OE3E33', 'THEORY', 'COMBINED', 249),
(903, 'OE3E33', 'THEORY', 'COMBINED', 244),
(904, 'OE3E33', 'THEORY', 'COMBINED', 249),
(905, 'EC5M02', 'THEORY', 'COMBINED', 245),
(906, 'EC5M02', 'THEORY', 'COMBINED', 250),
(907, 'EC5M02', 'THEORY', 'COMBINED', 245),
(908, 'EC5M02', 'THEORY', 'COMBINED', 250),
(909, 'EC5M02', 'THEORY', 'COMBINED', 245),
(910, 'EC5M02', 'THEORY', 'COMBINED', 250),
(911, 'MT5003', 'THEORY', 'COMBINED', 246),
(912, 'MT5003', 'THEORY', 'COMBINED', 251),
(913, 'MT5003', 'THEORY', 'COMBINED', 246),
(914, 'MT5003', 'THEORY', 'COMBINED', 251),
(915, 'MT5003', 'THEORY', 'COMBINED', 246),
(916, 'MT5003', 'THEORY', 'COMBINED', 251),
(917, 'ME5D03', 'THEORY', 'COMBINED', 247),
(918, 'ME5D03', 'THEORY', 'COMBINED', 252),
(919, 'ME5D03', 'THEORY', 'COMBINED', 247),
(920, 'ME5D03', 'THEORY', 'COMBINED', 252),
(921, 'ME5D03', 'THEORY', 'COMBINED', 247),
(922, 'ME5D03', 'THEORY', 'COMBINED', 252),
(924, 'CS8031', 'THEORY', 'COMBINED', 253),
(925, 'CS8031', 'THEORY', 'COMBINED', 261),
(926, 'CS8031', 'THEORY', 'COMBINED', 253),
(927, 'CS8031', 'THEORY', 'COMBINED', 261),
(928, 'CS8031', 'THEORY', 'COMBINED', 253),
(929, 'CS8031', 'THEORY', 'COMBINED', 261),
(930, 'CS8031', 'LAB', 'COMBINED', 253),
(931, 'CS8031', 'LAB', 'COMBINED', 261),
(932, 'CS8031', 'LAB', 'COMBINED', 253),
(933, 'CS8031', 'LAB', 'COMBINED', 261),
(934, 'CS8004', 'THEORY', 'COMBINED', 254),
(935, 'CS8004', 'THEORY', 'COMBINED', 262),
(936, 'EC5N02', 'THEORY', 'COMBINED', 257),
(937, 'EC5N02', 'THEORY', 'COMBINED', 265),
(938, 'EC8030', 'THEORY', 'COMBINED', 256),
(939, 'EC8030', 'THEORY', 'COMBINED', 264),
(940, 'ME5D02', 'THEORY', 'COMBINED', 259),
(941, 'ME5D02', 'THEORY', 'COMBINED', 267),
(942, 'OE4E25', 'THEORY', 'COMBINED', 255),
(943, 'OE4E25', 'THEORY', 'COMBINED', 263),
(944, 'OE4M35', 'THEORY', 'COMBINED', 260),
(945, 'OE4M35', 'THEORY', 'COMBINED', 268),
(946, 'OE4M41', 'THEORY', 'COMBINED', 258),
(947, 'OE4M41', 'THEORY', 'COMBINED', 266),
(948, 'CS8004', 'THEORY', 'COMBINED', 254),
(949, 'CS8004', 'THEORY', 'COMBINED', 262),
(950, 'EC5N02', 'THEORY', 'COMBINED', 257),
(951, 'EC5N02', 'THEORY', 'COMBINED', 265),
(952, 'EC8030', 'THEORY', 'COMBINED', 256),
(953, 'EC8030', 'THEORY', 'COMBINED', 264),
(954, 'ME5D02', 'THEORY', 'COMBINED', 259),
(955, 'ME5D02', 'THEORY', 'COMBINED', 267),
(956, 'OE4E25', 'THEORY', 'COMBINED', 255),
(957, 'OE4E25', 'THEORY', 'COMBINED', 263),
(958, 'OE4M35', 'THEORY', 'COMBINED', 260),
(959, 'OE4M35', 'THEORY', 'COMBINED', 268),
(960, 'OE4M41', 'THEORY', 'COMBINED', 258),
(961, 'OE4M41', 'THEORY', 'COMBINED', 266),
(962, 'CS8004', 'THEORY', 'COMBINED', 254),
(963, 'CS8004', 'THEORY', 'COMBINED', 262),
(964, 'EC5N02', 'THEORY', 'COMBINED', 257),
(965, 'EC5N02', 'THEORY', 'COMBINED', 265),
(966, 'EC8030', 'THEORY', 'COMBINED', 256),
(967, 'EC8030', 'THEORY', 'COMBINED', 264),
(968, 'ME5D02', 'THEORY', 'COMBINED', 259),
(969, 'ME5D02', 'THEORY', 'COMBINED', 267),
(970, 'OE4E25', 'THEORY', 'COMBINED', 255),
(971, 'OE4E25', 'THEORY', 'COMBINED', 263),
(972, 'OE4M35', 'THEORY', 'COMBINED', 260),
(973, 'OE4M35', 'THEORY', 'COMBINED', 268),
(974, 'OE4M41', 'THEORY', 'COMBINED', 258),
(975, 'OE4M41', 'THEORY', 'COMBINED', 266),
(987, 'CS8018', 'THEORY', 'COMBINED', 269),
(988, 'CS8018', 'THEORY', 'COMBINED', 274),
(989, 'EC8004', 'THEORY', 'COMBINED', 270),
(990, 'EC8004', 'THEORY', 'COMBINED', 275),
(991, 'ME8016', 'THEORY', 'COMBINED', 272),
(992, 'ME8016', 'THEORY', 'COMBINED', 277),
(993, 'OE4E69', 'THEORY', 'COMBINED', 271),
(994, 'OE4E69', 'THEORY', 'COMBINED', 276),
(995, 'OE4M52', 'THEORY', 'COMBINED', 273),
(996, 'OE4M52', 'THEORY', 'COMBINED', 278),
(997, 'CS8018', 'THEORY', 'COMBINED', 269),
(998, 'CS8018', 'THEORY', 'COMBINED', 274),
(999, 'EC8004', 'THEORY', 'COMBINED', 270),
(1000, 'EC8004', 'THEORY', 'COMBINED', 275),
(1001, 'ME8016', 'THEORY', 'COMBINED', 272),
(1002, 'ME8016', 'THEORY', 'COMBINED', 277),
(1003, 'OE4E69', 'THEORY', 'COMBINED', 271),
(1004, 'OE4E69', 'THEORY', 'COMBINED', 276),
(1005, 'OE4M52', 'THEORY', 'COMBINED', 273),
(1006, 'OE4M52', 'THEORY', 'COMBINED', 278),
(1007, 'CS8018', 'THEORY', 'COMBINED', 269),
(1008, 'CS8018', 'THEORY', 'COMBINED', 274),
(1009, 'EC8004', 'THEORY', 'COMBINED', 270),
(1010, 'EC8004', 'THEORY', 'COMBINED', 275),
(1011, 'ME8016', 'THEORY', 'COMBINED', 272),
(1012, 'ME8016', 'THEORY', 'COMBINED', 277),
(1013, 'OE4E69', 'THEORY', 'COMBINED', 271),
(1014, 'OE4E69', 'THEORY', 'COMBINED', 276),
(1015, 'OE4M52', 'THEORY', 'COMBINED', 273),
(1016, 'OE4M52', 'THEORY', 'COMBINED', 278),
(1018, 'CS8025', 'THEORY', 'COMBINED', 279),
(1019, 'CS8025', 'THEORY', 'COMBINED', 286),
(1020, 'EC5M03', 'THEORY', 'COMBINED', 281),
(1021, 'EC5M03', 'THEORY', 'COMBINED', 288),
(1022, 'EC5P03', 'THEORY', 'COMBINED', 280),
(1023, 'EC5P03', 'THEORY', 'COMBINED', 287),
(1024, 'NP8002', 'THEORY', 'COMBINED', 285),
(1025, 'NP8002', 'THEORY', 'COMBINED', 292),
(1026, 'OE4L73', 'THEORY', 'COMBINED', 284),
(1027, 'OE4L73', 'THEORY', 'COMBINED', 291),
(1028, 'OE4M22', 'THEORY', 'COMBINED', 282),
(1029, 'OE4M22', 'THEORY', 'COMBINED', 289),
(1030, 'OE4M76', 'THEORY', 'COMBINED', 283),
(1031, 'OE4M76', 'THEORY', 'COMBINED', 290),
(1032, 'CS8025', 'THEORY', 'COMBINED', 279),
(1033, 'CS8025', 'THEORY', 'COMBINED', 286),
(1034, 'EC5M03', 'THEORY', 'COMBINED', 281),
(1035, 'EC5M03', 'THEORY', 'COMBINED', 288),
(1036, 'EC5P03', 'THEORY', 'COMBINED', 280),
(1037, 'EC5P03', 'THEORY', 'COMBINED', 287),
(1038, 'NP8002', 'THEORY', 'COMBINED', 285),
(1039, 'NP8002', 'THEORY', 'COMBINED', 292),
(1040, 'OE4L73', 'THEORY', 'COMBINED', 284),
(1041, 'OE4L73', 'THEORY', 'COMBINED', 291),
(1042, 'OE4M22', 'THEORY', 'COMBINED', 282),
(1043, 'OE4M22', 'THEORY', 'COMBINED', 289),
(1044, 'OE4M76', 'THEORY', 'COMBINED', 283),
(1045, 'OE4M76', 'THEORY', 'COMBINED', 290),
(1046, 'CS8025', 'THEORY', 'COMBINED', 279),
(1047, 'CS8025', 'THEORY', 'COMBINED', 286),
(1048, 'EC5M03', 'THEORY', 'COMBINED', 281),
(1049, 'EC5M03', 'THEORY', 'COMBINED', 288),
(1050, 'EC5P03', 'THEORY', 'COMBINED', 280),
(1051, 'EC5P03', 'THEORY', 'COMBINED', 287),
(1052, 'NP8002', 'THEORY', 'COMBINED', 285),
(1053, 'NP8002', 'THEORY', 'COMBINED', 292),
(1054, 'OE4L73', 'THEORY', 'COMBINED', 284),
(1055, 'OE4L73', 'THEORY', 'COMBINED', 291),
(1056, 'OE4M22', 'THEORY', 'COMBINED', 282),
(1057, 'OE4M22', 'THEORY', 'COMBINED', 289),
(1058, 'OE4M76', 'THEORY', 'COMBINED', 283),
(1059, 'OE4M76', 'THEORY', 'COMBINED', 290),
(1081, 'CS8007', 'THEORY', 'COMBINED', 293),
(1082, 'CS8007', 'THEORY', 'COMBINED', 298),
(1083, 'CS8007', 'THEORY', 'COMBINED', 293),
(1084, 'CS8007', 'THEORY', 'COMBINED', 298),
(1085, 'CS8007', 'LAB', 'COMBINED', 293),
(1086, 'CS8007', 'LAB', 'COMBINED', 298),
(1087, 'CS8007', 'LAB', 'COMBINED', 293),
(1088, 'CS8007', 'LAB', 'COMBINED', 298),
(1089, 'EC5C01', 'THEORY', 'COMBINED', 294),
(1090, 'EC5C01', 'THEORY', 'COMBINED', 299),
(1091, 'EC5C01', 'THEORY', 'COMBINED', 294),
(1092, 'EC5C01', 'THEORY', 'COMBINED', 299),
(1093, 'EC5C01', 'THEORY', 'COMBINED', 294),
(1094, 'EC5C01', 'THEORY', 'COMBINED', 299),
(1095, 'EC5N01', 'THEORY', 'COMBINED', 295),
(1096, 'EC5N01', 'THEORY', 'COMBINED', 300),
(1097, 'EC5N01', 'THEORY', 'COMBINED', 295),
(1098, 'EC5N01', 'THEORY', 'COMBINED', 300),
(1099, 'EC5N01', 'THEORY', 'COMBINED', 295),
(1100, 'EC5N01', 'THEORY', 'COMBINED', 300),
(1101, 'ME8002', 'THEORY', 'COMBINED', 296),
(1102, 'ME8002', 'THEORY', 'COMBINED', 301),
(1103, 'ME8002', 'THEORY', 'COMBINED', 296),
(1104, 'ME8002', 'THEORY', 'COMBINED', 301),
(1105, 'ME8002', 'THEORY', 'COMBINED', 296),
(1106, 'ME8002', 'THEORY', 'COMBINED', 301),
(1107, 'OE4M74', 'THEORY', 'COMBINED', 297),
(1108, 'OE4M74', 'THEORY', 'COMBINED', 302),
(1109, 'OE4M74', 'THEORY', 'COMBINED', 297),
(1110, 'OE4M74', 'THEORY', 'COMBINED', 302),
(1111, 'OE4M74', 'LAB', 'COMBINED', 297),
(1112, 'OE4M74', 'LAB', 'COMBINED', 302),
(1113, 'OE4M74', 'LAB', 'COMBINED', 297),
(1114, 'OE4M74', 'LAB', 'COMBINED', 302);

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` varchar(20) NOT NULL,
  `faculty_name` varchar(100) NOT NULL,
  `faculty_short` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`faculty_id`, `faculty_name`, `faculty_short`, `email`) VALUES
('P101', 'Dr. Avinash Chandra Pandey', 'ACP', 'acp@iiitdmj.ac.in'),
('P102', 'Dr. Atul Gupta', 'AG', 'ag@iiitdmj.ac.in'),
('P103', 'Prof. Aparajita Ojha', 'AO', 'ao@iiitdmj.ac.in'),
('P104', 'Dr. Ayan Seal', 'AS', 'as@iiitdmj.ac.in'),
('P105', 'Dr. Durgesh Singh', 'DS', 'ds@iiitdmj.ac.in'),
('P106', 'Dr. Munesh Singh', 'MSg', 'msg@iiitdmj.ac.in'),
('P107', 'Dr. Neelam Dayal', 'ND', 'nd@iiitdmj.ac.in'),
('P108', 'Dr. Pritee Khanna', 'PK', 'pk@iiitdmj.ac.in'),
('P109', 'Dr. Sraban Kumar Mohanty', 'SKM', 'skm@iiitdmj.ac.in'),
('P110', 'Dr. Vinod Kumar Jain', 'VKJ', 'vkj@iiitdmj.ac.in'),
('P111', 'Dr. Prabir Mukhopadhyay', 'PM', 'pm@iiitdmj.ac.in'),
('P112', 'Dr. Amrita Bhattacharjee', 'AB', 'ab@iiitdmj.ac.in'),
('P113', 'Dr. Sangeeta Pandit', 'SP', 'sp@iiitdmj.ac.in'),
('P114', 'Dr. Tripti Singh', 'TSg', 'tsg@iiitdmj.ac.in'),
('P115', 'Dr. Anil Kumar', 'AK', 'ak@iiitdmj.ac.in'),
('P116', 'Dr. Amit Vishwakarma', 'AV', 'av@iiitdmj.ac.in'),
('P117', 'Dr. Dinesh Kr. Vishwakarma', 'DKV', 'dkv@iiitdmj.ac.in'),
('P118', 'Dr. DIP Prakash Samajdar', 'DPS', 'dps@iiitdmj.ac.in'),
('P119', 'Dr. Koushik Dutta', 'KD', 'kd@iiitdmj.ac.in'),
('P120', 'Dr. Matadeen Bansal', 'MDB', 'mdb@iiitdmj.ac.in'),
('P121', 'Dr. Manoj Singh Parihar', 'MSP', 'msp@iiitdmj.ac.in'),
('P122', 'Dr. Prabin Kumar Padhy', 'PKP', 'pkp@iiitdmj.ac.in'),
('P123', 'Prof. P.N. Kondekar', 'PNK', 'pnk@iiitdmj.ac.in'),
('P124', 'Dr. Pushpa Raikwal', 'PR', 'pr@iiitdmj.ac.in'),
('P125', 'Dr. Pankaj Sharma', 'PS', 'ps@iiitdmj.ac.in'),
('P126', 'Dr. Sachin Kumar Jain', 'SKJ', 'skj@iiitdmj.ac.in'),
('P127', 'Dr. Satish Kumar Tiwari', 'SKT', 'skt@iiitdmj.ac.in'),
('P128', 'Dr. Sanjeev Narayan Sharma', 'SNS', 'sns@iiitdmj.ac.in'),
('P129', 'Dr. Trivesh Kumar', 'TK', 'tk@iiitdmj.ac.in'),
('P130', 'Dr. J Al Muzzamil Fareen', 'JAMF', 'jamf@iiitdmj.ac.in'),
('P131', 'Dr. Mamta Anand', 'MA', 'ma@iiitdmj.ac.in'),
('P132', 'Dr. M Amarnath', 'AM', 'am@iiitdmj.ac.in'),
('P133', 'Dr. Avinash Ravi Raja', 'ARR', 'arr@iiitdmj.ac.in'),
('P134', 'Dr. H Chelladurai', 'CD', 'cd@iiitdmj.ac.in'),
('P135', 'Dr. Himansu Sekhar Nanda', 'HSN', 'hsn@iiitdmj.ac.in'),
('P136', 'Dr. Ponappa K', 'KP', 'kp@iiitdmj.ac.in'),
('P137', 'Dr. Manish Kumar Thakur', 'MKT', 'mkt@iiitdmj.ac.in'),
('P138', 'Dr. Manu Srivastava', 'MS', 'ms@iiitdmj.ac.in'),
('P139', 'Dr. Mohd Zahid Ansari', 'MZA', 'mza@iiitdmj.ac.in'),
('P140', 'Dr. Prashant Kumar Jain', 'PKJ', 'pkj@iiitdmj.ac.in'),
('P141', 'Dr. Parikshit Kundu', 'PSK', 'psk@iiitdmj.ac.in'),
('P142', 'Prof. Puneet Tandon', 'PT', 'pt@iiitdmj.ac.in'),
('P143', 'Dr. Rabindra Prasad', 'RP', 'rp@iiitdmj.ac.in'),
('P144', 'Dr. Sunil Agarwal', 'SA', 'sa@iiitdmj.ac.in'),
('P145', 'Dr. Shiv Dayal Patel', 'SDP', 'sdp@iiitdmj.ac.in'),
('P146', 'Gowthaman S', 'SGM', 'sgd@iiitdmj.ac.in'),
('P147', 'Dr. Sachin Kumar', 'SKS', 'sks@iiitdmj.ac.in'),
('P148', 'Dr. Syam Kumar Chokka', 'SKC', 'skc@iiitdmj.ac.in'),
('P149', 'Dr. Sujoy Mukherjee', 'SM', 'sm@iiitdmj.ac.in'),
('P150', 'Dr. Subir Singh Lamba', 'SSL', 'ssl@iiitdmj.ac.in'),
('P151', 'Dr. Tushar Choudhary', 'TC', 'tc@iiitdmj.ac.in'),
('P152', 'Prof. Tanuja Sheorey', 'TS', 'ts@iiitdmj.ac.in'),
('P153', 'Prof. Vijay Kumar Gupta', 'VKG', 'vkg@iiitdmj.ac.in'),
('P154', 'Dr. Yashpal Singh Katharria', 'YSK', 'ysk@iiitdmj.ac.in'),
('P155', 'Mrs. Aayesha Begam Mansoori', 'ABM', 'abm@iiitdmj.ac.in'),
('P156', 'Mr. Aditya Sharma', 'AdS', 'ads@iiitdmj.ac.in'),
('P157', 'Mr. Anup Kumar Gupta', 'AKG', 'akg@iiitdmj.ac.in'),
('P158', 'Mr. Awadhesh Kumar Singh', 'AKS', 'aks@iiitdmj.ac.in'),
('P159', 'Mr. Alok Kulkarni', 'AIK', 'aik@iiitdmj.ac.in'),
('P160', 'Mr. Anup Bajpai', 'AnB', 'anb@iiitdmj.ac.in'),
('P161', 'Mr. Anupam Shukla', 'AnS', 'ans@iiitdmj.ac.in'),
('P162', 'Mr. Akhilesh Srivastava', 'ASh', 'ash@iiitdmj.ac.in'),
('P163', 'Mrs. Bharti Kewat', 'BK', 'bk@iiitdmj.ac.in'),
('P164', 'Deepak Kumar Patel', 'DKP', 'dkp@iiitdmj.ac.in'),
('P165', 'Dr. Dada Saheb Ramteke', 'DSR', 'dsr@iiitdmj.ac.in'),
('P166', 'Mr. Ghanshyam Meshram', 'GM', 'gm@iiitdmj.ac.in'),
('P167', 'Mahendra Kachhi', 'MK', 'mk@iiitdmj.ac.in'),
('P168', 'Mr. Mayur Sudhakar Mungole', 'MSM', 'msm@iiitdmj.ac.in'),
('P169', 'Mr. Manoj Tigga', 'MT', 'mt@iiitdmj.ac.in'),
('P170', 'Nitin Kumar Namdeo', 'NKN', 'nkn@iiitdmj.ac.in'),
('P171', 'Mrs. Neha Sharma', 'NS', 'ns@iiitdmj.ac.in'),
('P172', 'Mr. Piyush Kumar Usrathe', 'PKU', 'pku@iiitdmj.ac.in'),
('P173', 'Mr. Robinson George Markam', 'RGM', 'rgm@iiitdmj.ac.in'),
('P174', 'Shailendra Kumar Kushwaha', 'SKK', 'skk@iiitdmj.ac.in'),
('P175', 'Mr. Tabish Khan', 'TbK', 'tbk@iiitdmj.ac.in'),
('P176', 'Mr. Varun Dubey', 'VD', 'vd@iiitdmj.ac.in'),
('P177', 'Vibha Dhurvey', 'VDh', 'vdh@iiitdmj.ac.in'),
('P178', 'Lokendra Kumar Balyan', 'LKB', 'lkb@iiitdmj.ac.in'),
('P179', 'Nihar Kumar Mahato', 'NKM', 'nkm@iiitdmj.ac.in'),
('P180', 'Deepmala', 'DM', 'dm@iiitdmj.ac.in'),
('P181', 'Asish K. Kundu', 'AKK', 'akk@iiitdmj.ac.in'),
('P182', 'Amaresh Chandra Mishra', 'ACM', 'acm@iiitdmj.ac.in'),
('P183', 'Rakesh Kumar Sanodiya', 'RKS', 'rks@iiitdmj.ac.in'),
('P184', 'Jitendar Kumar Tiwari', 'JKT', 'jkt@iiitdmj.ac.in'),
('P185', 'Mukesh Kumar Roy', 'MKR', 'mkr@iiitdmj.ac.in'),
('P186', 'Ranjeet Kumar Ranjan', 'RKR', 'rkr@iiitdmj.ac.in'),
('P187', 'Akshay Pandey', 'AP', 'ap@iiitdmj.ac.in'),
('P188', 'Bhupendra Gupta', 'BG', 'bg@iiitdmj.ac.in'),
('P189', 'Manoj Kumar Panda', 'MKP', 'mkp@iiitdmj.ac.in'),
('P190', 'Shivansh Mishra', 'SHM', 'shm@iiitdmj.ac.in'),
('P191', 'Nitish Andola', 'NA', 'na@iiitdmj.ac.in'),
('P192', 'Rakesh Kumar Jaiswal', 'RKJ', 'rkj@iiitdmj.ac.in'),
('P193', 'Ashish Singh Parihar', 'ASP', 'asp@iiitdmj.ac.in'),
('P194', 'Niteesh Jain', 'NJ', 'nj@iiitdmj.ac.in');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_allocation`
--

CREATE TABLE `faculty_allocation` (
  `faculty_id` varchar(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_allocation`
--

INSERT INTO `faculty_allocation` (`faculty_id`, `course_id`, `branch_id`, `section_id`) VALUES
('P101', 269, 1, 16),
('P101', 269, 1, 17),
('P101', 269, 2, 18),
('P101', 269, 3, 19),
('P101', 269, 4, 20),
('P101', 274, 5, 24),
('P101', 293, 1, 16),
('P101', 293, 1, 17),
('P101', 293, 2, 18),
('P101', 293, 3, 19),
('P101', 293, 4, 20),
('P101', 298, 5, 24),
('P102', 209, 1, 11),
('P102', 209, 1, 12),
('P103', 187, 1, 6),
('P103', 187, 1, 7),
('P103', 187, 2, 8),
('P103', 187, 3, 9),
('P103', 187, 4, 10),
('P103', 195, 5, 22),
('P103', 254, 1, 16),
('P103', 254, 1, 17),
('P103', 254, 2, 18),
('P103', 254, 3, 19),
('P103', 254, 4, 20),
('P103', 262, 5, 24),
('P104', 163, 1, 6),
('P104', 163, 1, 7),
('P104', 279, 1, 16),
('P104', 279, 1, 17),
('P104', 279, 2, 18),
('P104', 279, 3, 19),
('P104', 279, 4, 20),
('P104', 286, 5, 24),
('P105', 213, 1, 11),
('P105', 213, 1, 12),
('P107', 253, 1, 16),
('P107', 253, 1, 17),
('P107', 253, 2, 18),
('P107', 253, 3, 19),
('P107', 253, 4, 20),
('P107', 261, 5, 24),
('P108', 153, 1, 6),
('P108', 153, 1, 7),
('P109', 147, 1, 6),
('P109', 147, 1, 7),
('P111', 233, 1, 11),
('P111', 233, 1, 12),
('P111', 233, 2, 13),
('P111', 233, 3, 14),
('P111', 233, 4, 15),
('P111', 234, 1, 11),
('P111', 234, 1, 12),
('P111', 234, 2, 13),
('P111', 234, 3, 14),
('P111', 234, 4, 15),
('P111', 241, 5, 23),
('P111', 242, 5, 23),
('P112', 224, 5, 23),
('P113', 222, 5, 23),
('P113', 223, 5, 23),
('P114', 169, 5, 22),
('P115', 189, 1, 6),
('P115', 189, 1, 7),
('P115', 189, 2, 8),
('P115', 189, 3, 9),
('P115', 189, 4, 10),
('P115', 197, 5, 22),
('P115', 281, 1, 16),
('P115', 281, 1, 17),
('P115', 281, 2, 18),
('P115', 281, 3, 19),
('P115', 281, 4, 20),
('P115', 288, 5, 24),
('P116', 132, 2, 3),
('P116', 270, 1, 16),
('P116', 270, 1, 17),
('P116', 270, 2, 18),
('P116', 270, 3, 19),
('P116', 270, 4, 20),
('P116', 275, 5, 24),
('P117', 244, 1, 16),
('P117', 244, 1, 17),
('P117', 244, 2, 18),
('P117', 244, 3, 19),
('P117', 244, 4, 20),
('P117', 249, 5, 24),
('P117', 271, 1, 16),
('P117', 271, 1, 17),
('P117', 271, 2, 18),
('P117', 271, 3, 19),
('P117', 271, 4, 20),
('P117', 276, 5, 24),
('P118', 206, 2, 13),
('P119', 188, 1, 6),
('P119', 188, 1, 7),
('P119', 188, 2, 8),
('P119', 188, 3, 9),
('P119', 188, 4, 10),
('P119', 196, 5, 22),
('P119', 219, 2, 13),
('P119', 230, 1, 11),
('P119', 230, 1, 12),
('P119', 230, 2, 13),
('P119', 230, 3, 14),
('P119', 230, 4, 15),
('P119', 238, 5, 23),
('P120', 214, 2, 13),
('P120', 294, 1, 16),
('P120', 294, 1, 17),
('P120', 294, 2, 18),
('P120', 294, 3, 19),
('P120', 294, 4, 20),
('P120', 299, 5, 24),
('P122', 133, 1, 1),
('P123', 136, 2, 3),
('P123', 159, 2, 8),
('P123', 295, 1, 16),
('P123', 295, 1, 17),
('P123', 295, 2, 18),
('P123', 295, 3, 19),
('P123', 295, 4, 20),
('P123', 300, 5, 24),
('P124', 133, 1, 2),
('P124', 256, 1, 16),
('P124', 256, 1, 17),
('P124', 256, 2, 18),
('P124', 256, 3, 19),
('P124', 256, 4, 20),
('P124', 264, 5, 24),
('P125', 150, 2, 8),
('P125', 257, 1, 16),
('P125', 257, 1, 17),
('P125', 257, 2, 18),
('P125', 257, 3, 19),
('P125', 257, 4, 20),
('P125', 265, 5, 24),
('P126', 155, 2, 8),
('P126', 280, 1, 16),
('P126', 280, 1, 17),
('P126', 280, 2, 18),
('P126', 280, 3, 19),
('P126', 280, 4, 20),
('P126', 287, 5, 24),
('P127', 154, 2, 8),
('P127', 164, 2, 8),
('P127', 229, 1, 11),
('P127', 229, 1, 12),
('P127', 229, 2, 13),
('P127', 229, 3, 14),
('P127', 229, 4, 15),
('P127', 237, 5, 23),
('P128', 160, 2, 8),
('P128', 228, 1, 11),
('P128', 228, 1, 12),
('P128', 228, 2, 13),
('P128', 228, 3, 14),
('P128', 228, 4, 15),
('P128', 236, 5, 23),
('P128', 245, 1, 16),
('P128', 245, 1, 17),
('P128', 245, 2, 18),
('P128', 245, 3, 19),
('P128', 245, 4, 20),
('P128', 250, 5, 24),
('P129', 210, 2, 13),
('P129', 255, 1, 16),
('P129', 255, 1, 17),
('P129', 255, 2, 18),
('P129', 255, 3, 19),
('P129', 255, 4, 20),
('P129', 263, 5, 24),
('P130', 130, 1, 1),
('P130', 130, 1, 2),
('P130', 284, 1, 16),
('P130', 284, 1, 17),
('P130', 284, 2, 18),
('P130', 284, 3, 19),
('P130', 284, 4, 20),
('P130', 291, 5, 24),
('P131', 130, 2, 3),
('P131', 130, 3, 4),
('P131', 130, 4, 5),
('P131', 143, 5, 21),
('P131', 194, 1, 6),
('P131', 194, 1, 7),
('P131', 194, 2, 8),
('P131', 194, 3, 9),
('P131', 194, 4, 10),
('P131', 202, 5, 22),
('P132', 134, 3, 4),
('P132', 207, 3, 14),
('P133', 212, 4, 15),
('P134', 190, 1, 6),
('P134', 190, 1, 7),
('P134', 190, 2, 8),
('P134', 190, 3, 9),
('P134', 190, 4, 10),
('P134', 198, 5, 22),
('P134', 282, 1, 16),
('P134', 282, 1, 17),
('P134', 282, 2, 18),
('P134', 282, 3, 19),
('P134', 282, 4, 20),
('P134', 289, 5, 24),
('P135', 272, 1, 16),
('P135', 272, 1, 17),
('P135', 272, 2, 18),
('P135', 272, 3, 19),
('P135', 272, 4, 20),
('P135', 277, 5, 24),
('P136', 138, 4, 5),
('P136', 208, 4, 15),
('P136', 273, 1, 16),
('P136', 273, 1, 17),
('P136', 273, 2, 18),
('P136', 273, 3, 19),
('P136', 273, 4, 20),
('P136', 278, 5, 24),
('P137', 132, 4, 5),
('P138', 151, 3, 9),
('P138', 296, 1, 16),
('P138', 296, 1, 17),
('P138', 296, 2, 18),
('P138', 296, 3, 19),
('P138', 296, 4, 20),
('P138', 301, 5, 24),
('P139', 211, 3, 14),
('P139', 246, 1, 16),
('P139', 246, 1, 17),
('P139', 246, 2, 18),
('P139', 246, 3, 19),
('P139', 246, 4, 20),
('P139', 251, 5, 24),
('P141', 161, 3, 9),
('P141', 215, 3, 14),
('P142', 204, 1, 11),
('P142', 204, 1, 12),
('P142', 204, 2, 13),
('P142', 204, 3, 14),
('P142', 204, 4, 15),
('P142', 297, 1, 16),
('P142', 297, 1, 17),
('P142', 297, 2, 18),
('P142', 297, 3, 19),
('P142', 297, 4, 20),
('P142', 302, 5, 24),
('P143', 132, 3, 4),
('P143', 144, 5, 21),
('P143', 260, 1, 16),
('P143', 260, 1, 17),
('P143', 260, 2, 18),
('P143', 260, 3, 19),
('P143', 260, 4, 20),
('P143', 268, 5, 24),
('P144', 217, 4, 15),
('P145', 157, 4, 10),
('P145', 247, 1, 16),
('P145', 247, 1, 17),
('P145', 247, 2, 18),
('P145', 247, 3, 19),
('P145', 247, 4, 20),
('P145', 252, 5, 24),
('P146', 152, 4, 10),
('P146', 258, 1, 16),
('P146', 258, 1, 17),
('P146', 258, 2, 18),
('P146', 258, 3, 19),
('P146', 258, 4, 20),
('P146', 266, 5, 24),
('P147', 142, 5, 21),
('P147', 283, 1, 16),
('P147', 283, 1, 17),
('P147', 283, 2, 18),
('P147', 283, 3, 19),
('P147', 283, 4, 20),
('P147', 290, 5, 24),
('P148', 134, 4, 5),
('P149', 134, 2, 3),
('P149', 259, 1, 16),
('P149', 259, 1, 17),
('P149', 259, 2, 18),
('P149', 259, 3, 19),
('P149', 259, 4, 20),
('P149', 267, 5, 24),
('P150', 128, 4, 5),
('P151', 162, 4, 10),
('P152', 137, 3, 4),
('P152', 216, 4, 15),
('P153', 156, 3, 9),
('P153', 191, 1, 6),
('P153', 191, 1, 7),
('P153', 191, 2, 8),
('P153', 191, 3, 9),
('P153', 191, 4, 10),
('P153', 199, 5, 22),
('P154', 129, 2, 3),
('P156', 131, 1, 2),
('P156', 218, 1, 11),
('P156', 218, 1, 12),
('P165', 165, 3, 9),
('P165', 166, 4, 10),
('P178', 128, 2, 3),
('P179', 128, 3, 4),
('P180', 128, 1, 1),
('P180', 128, 1, 2),
('P181', 129, 4, 5),
('P182', 129, 1, 1),
('P182', 129, 1, 2),
('P183', 131, 1, 1),
('P185', 129, 3, 4),
('P186', 149, 1, 6),
('P186', 149, 1, 7),
('P187', 158, 1, 6),
('P187', 158, 1, 7),
('P188', 192, 1, 6),
('P188', 192, 1, 7),
('P188', 192, 2, 8),
('P188', 192, 3, 9),
('P188', 192, 4, 10),
('P188', 200, 5, 22),
('P189', 193, 1, 6),
('P189', 193, 1, 7),
('P189', 193, 2, 8),
('P189', 193, 3, 9),
('P189', 193, 4, 10),
('P189', 201, 5, 22),
('P190', 205, 1, 11),
('P190', 205, 1, 12),
('P191', 227, 1, 11),
('P191', 227, 1, 12),
('P191', 227, 2, 13),
('P191', 227, 3, 14),
('P191', 227, 4, 15),
('P191', 235, 5, 23),
('P192', 231, 1, 11),
('P192', 231, 1, 12),
('P192', 231, 2, 13),
('P192', 231, 3, 14),
('P192', 231, 4, 15),
('P192', 239, 5, 23),
('P193', 243, 1, 16),
('P193', 243, 1, 17),
('P193', 243, 2, 18),
('P193', 243, 3, 19),
('P193', 243, 4, 20),
('P193', 248, 5, 24),
('P194', 285, 1, 16),
('P194', 285, 1, 17),
('P194', 285, 2, 18),
('P194', 285, 3, 19),
('P194', 285, 4, 20),
('P194', 292, 5, 24);

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
(3, 'Computing Lab GF', 160, 'LAB'),
(4, 'Computing Lab 1F', 160, 'LAB'),
(5, 'Tinkering Lab 2F', 160, 'LAB'),
(6, 'Tinkering Lab 3F', 160, 'LAB'),
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
(30, 'Auditorium', 600, 'CLASSROOM'),
(31, 'Advanced Manufacturing Lab', 40, 'LAB'),
(32, 'Automobile Lab', 40, 'LAB'),
(33, 'Engineering Graphics Lab', 50, 'LAB'),
(34, 'Fluid Mechanics and HMT Lab', 80, 'LAB'),
(35, 'Health Monitoring Lab', 40, 'LAB'),
(36, 'IT Workshop', 50, 'LAB'),
(37, 'Kinematics and Dynamics Lab', 40, 'LAB'),
(38, 'Computational Lab', 40, 'LAB'),
(39, 'Cyber Physical Production System Lab', 40, 'LAB'),
(40, 'Material Characterization Lab', 40, 'LAB'),
(41, 'Machine Dynamics and Vibrations Lab', 40, 'LAB'),
(42, 'Robotics and Mechatronics Lab', 40, 'LAB'),
(43, 'Physics Lab 1', 80, 'LAB'),
(44, 'Physics Lab 2', 80, 'LAB'),
(45, 'ECE Lab 1', 80, 'LAB'),
(46, 'ECE Lab 2', 80, 'LAB'),
(47, 'Control System Lab', 70, 'LAB'),
(48, 'Solid Mechanics Lab', 40, 'LAB'),
(49, 'VLSI Lab', 80, 'LAB'),
(50, 'Power and Control Lab', 80, 'LAB');

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
(22, 'DS-F', 5, 6),
(23, 'DS-F', 5, 7),
(24, 'DS-F', 5, 8),
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
(5, 1, 5, 2),
(6, 3, 6, 2),
(7, 5, 7, 2),
(8, 7, 8, 2);

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
-- Indexes for table `faculty_allocation`
--
ALTER TABLE `faculty_allocation`
  ADD PRIMARY KEY (`faculty_id`,`course_id`,`branch_id`,`section_id`);

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
  MODIFY `component_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1115;

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
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `section`
--
ALTER TABLE `section`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `semester`
--
ALTER TABLE `semester`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
