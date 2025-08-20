-- 這是從 MySQL 轉換到 PostgreSQL 的 chat_messages.sql 腳本。

-- 建立 chat_messages 資料表
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 為了方便查詢，可以為 room_id 和 sender_id 建立索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages (sender_id);

-- 如果你有舊的資料需要匯入，可以將它們轉換為 INSERT 語句。
-- 注意：由於 message 欄位中包含 JSON 格式的字串，
-- 這裡的 VALUES 語句需要特別注意引號的處理。
INSERT INTO chat_messages (room_id, sender_id, message, is_private, is_system, created_at) VALUES
(25, 450, '{"type":"system","content":"使用者 噴火龍 已加入群組"}', FALSE, TRUE, '2024-11-24 18:50:35'),
(27, 452, '{"type":"system","content":"使用者 努努 已加入群組"}', FALSE, TRUE, '2024-11-24 22:52:49'),
(28, 453, '{"type":"system","content":"使用者 噴火龍 已加入群組"}', FALSE, TRUE, '2024-11-24 22:59:28'),
(28, 453, '{"type":"system","content":"使用者 努努 已加入群組"}', FALSE, TRUE, '2024-11-24 22:59:30'),
(29, 454, '{"type":"system","content":"使用者 阿拉瓜瓜 已加入群組"}', FALSE, TRUE, '2024-11-24 23:01:52'),
(29, 454, '{"type":"system","content":"使用者 傑尼龜 已加入群組"}', FALSE, TRUE, '2024-11-24 23:04:11'),
(30, 455, '{"type":"system","content":"使用者 噴火龍 已加入群組"}', FALSE, TRUE, '2024-11-24 23:10:49');
