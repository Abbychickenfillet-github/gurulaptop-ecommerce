-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-11-20 13:58:18
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
-- 資料表結構 `group`
--

CREATE TABLE `group` (
  `group_id` int(5) NOT NULL,
  `group_name` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `creator_id` int(6) UNSIGNED NOT NULL,
  `max_members` int(11) NOT NULL,
  `group_img` varchar(255) NOT NULL,
  `creat_time` datetime NOT NULL DEFAULT current_timestamp(),
  `group_time` datetime DEFAULT NULL,
  `event_id` int(5) DEFAULT NULL,
  `chat_room_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `group`
--
ALTER TABLE `group`
  ADD PRIMARY KEY (`group_id`),
  ADD KEY `group_creator_fk` (`creator_id`),
  ADD KEY `group_event_fk` (`event_id`),
  ADD KEY `chat_room_id` (`chat_room_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `group`
--
ALTER TABLE `group`
  MODIFY `group_id` int(5) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
