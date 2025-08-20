-- 這是從 MySQL 轉換到 PostgreSQL 的 event_status_type.sql 腳本。

-- 建立 event_status_type 資料表
CREATE TABLE IF NOT EXISTS event_status_type (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(20) NOT NULL
);

-- 為了方便查詢，可以為 status_name 建立索引
CREATE INDEX IF NOT EXISTS idx_event_status_type_status_name ON event_status_type (status_name);
