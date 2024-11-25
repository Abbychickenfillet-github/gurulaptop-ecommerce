-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-11-24 23:29:05
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
-- 資料表結構 `chat_room_members`
--

CREATE TABLE `chat_room_members` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `user_id` int(6) UNSIGNED NOT NULL,
  `joined_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `chat_room_members`
--

INSERT INTO `chat_room_members` (`id`, `room_id`, `user_id`, `joined_at`) VALUES
(1, 1, 440, '2024-11-18 15:05:05'),
(2, 1, 441, '2024-11-18 15:07:31'),
(3, 2, 440, '2024-11-18 15:08:08'),
(4, 2, 441, '2024-11-18 15:08:36'),
(5, 3, 440, '2024-11-18 15:59:08'),
(6, 3, 441, '2024-11-18 16:00:30'),
(7, 4, 440, '2024-11-18 22:07:35'),
(8, 4, 441, '2024-11-18 22:17:10'),
(9, 5, 440, '2024-11-19 10:35:53'),
(10, 6, 440, '2024-11-19 11:52:35'),
(11, 7, 440, '2024-11-19 14:30:53'),
(12, 7, 441, '2024-11-19 14:32:45'),
(25, 14, 440, '2024-11-20 13:02:51'),
(27, 15, 440, '2024-11-20 15:49:34'),
(28, 16, 440, '2024-11-21 10:24:16'),
(29, 17, 440, '2024-11-21 10:36:40'),
(31, 18, 440, '2024-11-21 10:56:02'),
(37, 21, 441, '2024-11-23 15:37:38'),
(38, 21, 440, '2024-11-23 15:39:47'),
(39, 22, 441, '2024-11-24 18:01:51'),
(40, 23, 449, '2024-11-24 18:06:23'),
(41, 22, 449, '2024-11-24 18:09:05'),
(42, 23, 441, '2024-11-24 18:09:50'),
(43, 24, 450, '2024-11-24 18:19:38'),
(44, 24, 449, '2024-11-24 18:20:21'),
(45, 25, 451, '2024-11-24 18:42:14'),
(46, 25, 450, '2024-11-24 18:43:08'),
(47, 25, 452, '2024-11-24 18:45:36'),
(48, 26, 452, '2024-11-24 18:48:55'),
(49, 26, 451, '2024-11-24 18:50:35'),
(50, 27, 452, '2024-11-24 22:52:12'),
(51, 27, 451, '2024-11-24 22:52:49'),
(52, 28, 453, '2024-11-24 22:55:36'),
(53, 28, 454, '2024-11-24 22:59:28'),
(54, 28, 451, '2024-11-24 22:59:30'),
(55, 29, 454, '2024-11-24 23:01:13'),
(56, 29, 453, '2024-11-24 23:01:52'),
(57, 29, 455, '2024-11-24 23:04:11'),
(58, 30, 455, '2024-11-24 23:05:58'),
(59, 30, 454, '2024-11-24 23:06:30'),
(60, 31, 457, '2024-11-24 23:10:13'),
(61, 32, 456, '2024-11-24 23:11:31'),
(62, 31, 456, '2024-11-24 23:12:28'),
(63, 32, 457, '2024-11-24 23:12:31');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `chat_room_members`
--
ALTER TABLE `chat_room_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `chat_room_members`
--
ALTER TABLE `chat_room_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
