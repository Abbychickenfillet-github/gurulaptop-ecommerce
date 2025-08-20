-- 這是從 MySQL 轉換到 PostgreSQL 的 chat_room_members.sql 腳本。

-- 建立 chat_room_members 資料表
CREATE TABLE IF NOT EXISTS chat_room_members (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 為了方便查詢，可以為 room_id 和 user_id 建立索引
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON chat_room_members (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON chat_room_members (user_id);

-- 插入資料到 chat_room_members 資料表
INSERT INTO chat_room_members (room_id, user_id, joined_at) VALUES
(22, 449, '2024-11-24 18:09:05'),
(23, 441, '2024-11-24 18:09:50'),
(24, 450, '2024-11-24 18:19:38'),
(24, 449, '2024-11-24 18:20:21'),
(25, 451, '2024-11-24 18:42:14'),
(25, 450, '2024-11-24 18:43:08'),
(25, 452, '2024-11-24 18:45:36'),
(26, 452, '2024-11-24 18:48:55'),
(26, 451, '2024-11-24 18:50:35'),
(27, 452, '2024-11-24 22:52:12'),
(27, 451, '2024-11-24 22:52:49'),
(28, 453, '2024-11-24 22:59:28'),
(28, 452, '2024-11-24 22:59:30'),
(29, 454, '2024-11-24 23:01:52'),
(29, 455, '2024-11-24 23:04:11'),
(30, 455, '2024-11-24 23:10:49'),
(30, 454, '2024-11-24 23:11:39');