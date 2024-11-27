-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-11-24 23:28:52
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
-- 資料表結構 `chat_rooms`
--

CREATE TABLE `chat_rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `creator_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `valid` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `chat_rooms`
--

INSERT INTO `chat_rooms` (`id`, `name`, `creator_id`, `created_at`, `valid`) VALUES
(1, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-18 15:05:05', 1),
(2, '123123123', 440, '2024-11-18 15:08:08', 1),
(3, 'test123', 440, '2024-11-18 15:59:08', 1),
(4, 'The Updraft W3', 440, '2024-11-18 22:07:35', 1),
(5, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-19 10:35:53', 1),
(6, '《Just Dance 舞力全開 20', 440, '2024-11-19 11:52:35', 1),
(7, '123', 440, '2024-11-19 14:30:53', 1),
(8, '123', 440, '2024-11-19 15:55:07', 1),
(9, '123123', 440, '2024-11-19 22:06:25', 1),
(10, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-19 22:28:12', 1),
(11, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-19 22:47:37', 1),
(12, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-19 23:26:58', 1),
(13, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-20 12:59:29', 1),
(14, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-20 13:02:51', 1),
(15, '英雄聯盟政大杯', 440, '2024-11-20 15:49:34', 1),
(16, '!ㄉˇ', 440, '2024-11-21 10:24:16', 1),
(17, '鳳凰盃個人競速賽 - 晉級決賽復活賽揪團', 440, '2024-11-21 10:36:40', 1),
(18, '2023 北大盃 複賽揪團', 440, '2024-11-21 10:56:02', 1),
(19, '鳳凰盃個人競速賽 - 晉級決賽復活賽揪團', 443, '2024-11-21 13:15:57', 1),
(20, 'APEX - INTOVOID娛樂賽揪團', 440, '2024-11-21 17:00:52', 1),
(21, '漫威：瞬戰超能', 441, '2024-11-23 15:37:38', 1),
(22, 'TFT', 441, '2024-11-24 18:01:51', 1),
(23, '劍指冠軍', 449, '2024-11-24 18:06:23', 1),
(24, 'uuuuuu', 450, '2024-11-24 18:19:38', 1),
(25, 'APEX娛樂賽 找人', 451, '2024-11-24 18:42:14', 1),
(26, '123木頭人', 452, '2024-11-24 18:48:55', 1),
(27, 'TFT 比賽', 452, '2024-11-24 22:52:12', 1),
(28, '鳳凰盃競速賽', 453, '2024-11-24 22:55:36', 1),
(29, 'Just Dance 舞力全開', 454, '2024-11-24 23:01:13', 1),
(30, '蛋仔', 455, '2024-11-24 23:05:58', 1),
(31, 'APEX', 457, '2024-11-24 23:10:13', 1),
(32, '跟著小活龍跳', 456, '2024-11-24 23:11:31', 1);

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
