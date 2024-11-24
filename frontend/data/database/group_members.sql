-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-11-24 23:29:45
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `guru`
--

-- --------------------------------------------------------

--
-- 資料表結構 `group_members`
--

CREATE TABLE `group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(5) NOT NULL,
  `member_id` int(6) UNSIGNED NOT NULL,
  `join_time` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'accepted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `group_members`
--

INSERT INTO `group_members` (`id`, `group_id`, `member_id`, `join_time`, `status`) VALUES
(32, 14, 440, '2024-11-20 13:02:51', 'accepted'),
(35, 15, 440, '2024-11-20 15:49:34', 'accepted'),
(36, 16, 440, '2024-11-21 10:24:16', 'accepted'),
(37, 17, 440, '2024-11-21 10:36:40', 'accepted'),
(40, 18, 440, '2024-11-21 10:56:02', 'accepted'),
(49, 21, 441, '2024-11-23 15:37:38', 'accepted'),
(50, 21, 440, '2024-11-23 15:39:47', 'accepted'),
(52, 22, 441, '2024-11-24 18:01:51', 'accepted'),
(53, 23, 449, '2024-11-24 18:06:23', 'accepted'),
(54, 22, 449, '2024-11-24 18:09:05', 'accepted'),
(56, 23, 441, '2024-11-24 18:09:50', 'accepted'),
(58, 24, 450, '2024-11-24 18:19:38', 'accepted'),
(59, 24, 449, '2024-11-24 18:20:21', 'accepted'),
(61, 25, 451, '2024-11-24 18:42:14', 'accepted'),
(62, 25, 450, '2024-11-24 18:43:08', 'accepted'),
(64, 25, 452, '2024-11-24 18:45:36', 'accepted'),
(66, 26, 452, '2024-11-24 18:48:55', 'accepted'),
(67, 26, 451, '2024-11-24 18:50:35', 'accepted'),
(69, 27, 452, '2024-11-24 22:52:12', 'accepted'),
(70, 27, 451, '2024-11-24 22:52:49', 'accepted'),
(72, 28, 453, '2024-11-24 22:55:36', 'accepted'),
(73, 28, 454, '2024-11-24 22:59:28', 'accepted'),
(75, 28, 451, '2024-11-24 22:59:30', 'accepted'),
(77, 29, 454, '2024-11-24 23:01:13', 'accepted'),
(78, 29, 453, '2024-11-24 23:01:52', 'accepted'),
(80, 29, 455, '2024-11-24 23:04:11', 'accepted'),
(82, 30, 455, '2024-11-24 23:05:58', 'accepted'),
(83, 30, 454, '2024-11-24 23:06:30', 'accepted'),
(85, 31, 457, '2024-11-24 23:10:13', 'accepted'),
(86, 32, 456, '2024-11-24 23:11:31', 'accepted'),
(87, 31, 456, '2024-11-24 23:12:28', 'accepted'),
(89, 32, 457, '2024-11-24 23:12:31', 'accepted');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_member` (`group_id`,`member_id`),
  ADD KEY `group_members_user_fk` (`member_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
