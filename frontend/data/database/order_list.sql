-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-11-18 04:54:56
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
-- 資料庫： `project_db`
--

-- --------------------------------------------------------

--
-- 資料表結構 `order_list`
--

CREATE TABLE `order_list` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `order_amount` int(11) NOT NULL,
  `payment_method` tinyint(30) NOT NULL,
  `coupon_id` int(11) DEFAULT NULL,
  `receiver` varchar(200) DEFAULT NULL,
  `phone` varchar(200) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `already_pay` int(11) NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `order_list`
--

INSERT INTO `order_list` (`id`, `user_id`, `order_id`, `order_amount`, `payment_method`, `coupon_id`, `receiver`, `phone`, `address`, `already_pay`, `create_time`) VALUES
(1, 2, '3438b1a3-5df1-4cd0-bcf3-d331c909b517', 25900, 0, 0, 'test', '0987654321', '台灣台北市中正區八德路１段1號', 1, '2024-11-18 11:41:13'),
(2, 2, 'b507128a-1902-42f9-8852-c06a4132bad1', 18900, 0, 0, 'test', '0987654321', '台灣台北市中正區八德路１段1號', 0, '2024-11-18 11:54:32');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `order_list`
--
ALTER TABLE `order_list`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_list`
--
ALTER TABLE `order_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
