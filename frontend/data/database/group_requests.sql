-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-11-24 23:29:49
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
-- 資料表結構 `group_requests`
--

CREATE TABLE `group_requests` (
  `id` int(11) NOT NULL,
  `group_id` int(5) NOT NULL,
  `sender_id` int(6) UNSIGNED NOT NULL,
  `creator_id` int(6) UNSIGNED NOT NULL,
  `game_id` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `group_requests`
--

INSERT INTO `group_requests` (`id`, `group_id`, `sender_id`, `creator_id`, `game_id`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 441, 440, '123', '123123', 'accepted', '2024-11-18 07:07:12', '2024-11-18 07:07:31'),
(2, 2, 441, 440, '13213', '123123', 'accepted', '2024-11-18 07:08:17', '2024-11-18 07:08:36'),
(3, 3, 441, 440, 'aaaaa', 'aaaaa', 'accepted', '2024-11-18 08:00:16', '2024-11-18 08:00:30'),
(4, 4, 441, 440, 'aaa', 'aaaaaaa', 'accepted', '2024-11-18 14:16:54', '2024-11-18 14:17:10'),
(5, 7, 441, 440, '123', '123', 'accepted', '2024-11-19 06:32:15', '2024-11-19 06:32:55'),
(6, 8, 441, 440, '13', '123', 'accepted', '2024-11-19 07:55:47', '2024-11-19 07:56:40'),
(7, 9, 441, 440, '123123', '123123', 'accepted', '2024-11-19 14:06:47', '2024-11-19 14:21:38'),
(8, 10, 441, 440, 'aa', '你好 我真的很想打這個比賽 請問可以++嗎', 'accepted', '2024-11-19 14:28:50', '2024-11-19 14:46:47'),
(9, 11, 441, 440, '123123', '123123', 'accepted', '2024-11-19 14:47:48', '2024-11-19 15:05:25'),
(10, 12, 441, 440, 'ㄉˇ', 'ㄉˇ', 'rejected', '2024-11-19 15:27:09', '2024-11-19 15:27:48'),
(11, 11, 441, 440, 'aa', '123', 'accepted', '2024-11-20 04:57:14', '2024-11-20 04:57:24'),
(12, 13, 441, 440, '132', '123', 'accepted', '2024-11-20 04:59:40', '2024-11-20 04:59:55'),
(13, 14, 441, 440, 'ㄉˇ', 'ㄉˇ', 'accepted', '2024-11-20 05:03:02', '2024-11-20 05:03:09'),
(14, 17, 441, 440, '123', '123', 'accepted', '2024-11-21 02:39:56', '2024-11-21 02:40:17'),
(15, 18, 441, 440, 'ㄉˇ', '123', 'accepted', '2024-11-21 02:56:32', '2024-11-21 02:56:49'),
(16, 19, 441, 443, '123', '123', 'accepted', '2024-11-21 05:17:30', '2024-11-21 05:17:49'),
(17, 20, 441, 440, '123', '123', 'accepted', '2024-11-21 09:01:46', '2024-11-21 09:02:15'),
(18, 21, 440, 441, '小土豆', '我是一顆小土豆', 'accepted', '2024-11-23 07:38:05', '2024-11-23 07:39:47'),
(19, 22, 449, 441, '圖奇', '++一起去玩', 'accepted', '2024-11-24 10:08:52', '2024-11-24 10:09:05'),
(20, 23, 441, 449, '龍', '超凡2 ++', 'accepted', '2024-11-24 10:09:42', '2024-11-24 10:09:50'),
(21, 24, 449, 450, '圖奇', '可以++嘛!', 'accepted', '2024-11-24 10:20:06', '2024-11-24 10:20:21'),
(22, 25, 450, 451, '安', '++想要一起玩', 'accepted', '2024-11-24 10:43:01', '2024-11-24 10:43:08'),
(23, 25, 452, 451, '阿奇', '++輕鬆玩', 'accepted', '2024-11-24 10:45:21', '2024-11-24 10:45:36'),
(24, 26, 451, 452, '努努', '打決鬥 ++', 'accepted', '2024-11-24 10:50:25', '2024-11-24 10:50:35'),
(25, 27, 451, 452, '努努', '++', 'accepted', '2024-11-24 14:52:38', '2024-11-24 14:52:49'),
(26, 25, 453, 451, '聒聒', '可以++嗎', 'pending', '2024-11-24 14:54:17', '2024-11-24 14:54:17'),
(27, 28, 451, 453, '努努', '玩3年 ++', 'accepted', '2024-11-24 14:56:27', '2024-11-24 14:59:30'),
(28, 28, 454, 453, '小猴', '嘎嘎頂 會噴火', 'accepted', '2024-11-24 14:59:15', '2024-11-24 14:59:28'),
(29, 29, 453, 454, '聒聒', '我也想跳', 'accepted', '2024-11-24 15:01:35', '2024-11-24 15:01:52'),
(30, 29, 455, 454, '龜龜', '我也想參加 !', 'accepted', '2024-11-24 15:04:05', '2024-11-24 15:04:11'),
(31, 30, 454, 455, '小猴', '蛋仔蛋仔!', 'accepted', '2024-11-24 15:06:14', '2024-11-24 15:06:30'),
(32, 32, 457, 456, '皮卡', '皮卡跳', 'accepted', '2024-11-24 15:12:03', '2024-11-24 15:12:31'),
(33, 31, 456, 457, '活龍', '槍法嘎嘎頂 ++', 'accepted', '2024-11-24 15:12:21', '2024-11-24 15:12:28');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `group_requests`
--
ALTER TABLE `group_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_requests_sender_fk` (`sender_id`),
  ADD KEY `group_requests_creator_fk` (`creator_id`),
  ADD KEY `idx_group_sender` (`group_id`,`sender_id`),
  ADD KEY `idx_status_created` (`status`,`created_at`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `group_requests`
--
ALTER TABLE `group_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
