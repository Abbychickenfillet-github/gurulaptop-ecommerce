-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-11-25 14:33:29
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
-- 資料表結構 `event_type`
--

CREATE TABLE `event_type` (
  `event_id` int(5) NOT NULL,
  `event_name` varchar(50) NOT NULL,
  `event_type` varchar(20) NOT NULL,
  `event_platform` varchar(20) NOT NULL,
  `event_content` text NOT NULL,
  `event_rule` text NOT NULL,
  `event_award` text NOT NULL,
  `individual_or_team` enum('個人','團體') NOT NULL DEFAULT '個人' COMMENT '比賽類型：個人或團體賽',
  `event_picture` varchar(255) NOT NULL,
  `apply_start_time` datetime NOT NULL,
  `apply_end_time` datetime NOT NULL,
  `event_start_time` datetime NOT NULL,
  `event_end_time` datetime NOT NULL,
  `maximum_people` int(3) NOT NULL,
  `status_id` int(2) DEFAULT 1,
  `valid` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `current_participants` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `event_type`
--

INSERT INTO `event_type` (`event_id`, `event_name`, `event_type`, `event_platform`, `event_content`, `event_rule`, `event_award`, `individual_or_team`, `event_picture`, `apply_start_time`, `apply_end_time`, `event_start_time`, `event_end_time`, `maximum_people`, `status_id`, `valid`, `created_at`, `current_participants`) VALUES
(1, '對決英豪', 'Valorant', 'PC', '最熱血的電競盛事！專業選手與業餘玩家同台競技，展現你的遊戲技巧！

這是一場不容錯過的激烈對戰！', '1. 需按時完成報到\r\n2. 禁止使用任何外掛或輔助工具\r\n3. 遵守遊戲官方規則\r\n4. 禁止隊伍間共謀行為\r\n5. 直播延遲需設定2分鐘', '冠軍：新台幣30,000元 + 獎盃\r\n亞軍：新台幣15,000元\r\n季軍：新台幣10,000元\r\nMVP：新台幣5,000元', '團體', 'https://d1k8pxxip4mxx2.cloudfront.net/pub/media/t8t/13962/banner_image.png?cf0PXmkEIHXBnOSL_mgr2A==', '2024-11-13 00:00:00', '2024-11-28 00:00:00', '2024-12-28 00:00:00', '2025-01-02 00:00:00', 60, 1, 1, '2024-11-25 00:00:00', 33),
(2, '舞蹈挑戰賽', 'Just Dance', 'Switch', '台灣玩家專屬的遊戲展,在舞台上展現律動,尋找最強舞王', '採最速報名制;需在現場報到參賽', '季軍：新台幣20,000元 + 獎狀', '個人', 'https://d1k8pxxip4mxx2.cloudfront.net/pub/media/t8t/14247/banner_image.jpg?ZmvN1TeWfzH8MtsQXaz8Vw==', '2024-11-25 00:00:00', '2024-12-13 00:00:00', '2025-01-13 00:00:00', '2025-01-14 00:00:00', 32, 1, 1, '2024-11-25 00:00:00', 0),
(3, '冬季盃2023', 'Overwatch 2', 'PC', '娜迪亞主辦的《鬥陣特攻2》冬季盃2023賽事', '採最速報名制;需在現場報到參賽', '亞軍：新台幣30,000元 + 獎牌', '團體', 'https://d1k8pxxip4mxx2.cloudfront.net/pub/media/t8t/14264/banner_image.png?da7E9qoxKweGYEs8BmYqTQ==', '2024-10-24 00:00:00', '2024-11-18 00:00:00', '2024-12-18 00:00:00', '2024-24-19 00:00:00', 16, 1, 1, '2024-11-25 00:00:00', 16),
(4, 'TGS娛樂賽', 'Just Dance', 'Switch', '2023台北國際電玩展上最活力四射的電競盛事', '需在台北電玩展現場參加;遵守舞台表演規則', '季軍：新台幣20,000元 + 獎狀', '團體', 'https://d1k8pxxip4mxx2.cloudfront.net/pub/media/t8t/14411/banner_image.jpg?kWX0IfQKJmyi43oiQAFgDg==', '2024-09-24 00:00:00', '2024-10-14 00:00:00', '2024-11-14 00:00:00', '2024-11-19 00:00:00', 21, 1, 1, '2024-11-25 00:00:00', 21),

-- 繼續添加剩餘的資料，每個都替換 \n 為 \r\n
(5, 'TGS娛樂賽【複賽】', 'Just Dance', 'Switch', '2023台北國際電玩展上最活力四射的電競盛事！\r\n\r\n燃燒你的熱情！燃燒你的靈魂！將你沸騰的能量用熱舞迸射出來！\r\n\r\n來吧！站上這個絢麗的舞台，讓眾人為你的舞技心醉神迷！\r\n\r\n「《Just Dance 舞力全開 2023》TGS娛樂賽」就在「台北國際電玩展」，一起來秀吧！', '1. 使用官方指定設備；2. 禁止使用輔助工具；3. 禁止辱罵他人。', '亞軍：新台幣30,000元 + 獎牌', '團體', 'https://d1k8pxxip4.xx2.cloudfront.net/pub/media/t8t/14411/banner_image.jpg?kWX0IfQKJmyi43oiQAFgDg==', '2024-11-13 00:00:00', '2024-11-28 00:00:00', '2024-12-28 00:00:00', '2024-12-31 00:00:00', 21, 1, 1, '2024-11-25 00:00:00', 10);

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `event_type`
--
ALTER TABLE `event_type`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `status_id` (`status_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `event_type`
--
ALTER TABLE `event_type`
  MODIFY `event_id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `event_type`
--
ALTER TABLE `event_type`
  ADD CONSTRAINT `event_type_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `event_status_type` (`status_id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
