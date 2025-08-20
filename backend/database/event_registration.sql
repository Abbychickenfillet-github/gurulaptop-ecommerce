-- PostgreSQL 版的 `event_registration` 資料表

-- 確保資料表存在時先刪除它，方便重新建立
DROP TABLE IF EXISTS event_registration;

-- 建立 `event_registration` 資料表
CREATE TABLE event_registration (
    registration_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registration_type VARCHAR(10) NOT NULL, -- 使用 VARCHAR 代替ENUM
    team_id INTEGER DEFAULT NULL,
    team_name VARCHAR(100) DEFAULT NULL,
    participant_info JSONB DEFAULT NULL, -- 使用 JSONB 來儲存 JSON 資料
    registration_status VARCHAR(20) NOT NULL DEFAULT 'active', -- 使用 VARCHAR 代替ENUM
    registration_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 為常用的欄位建立索引以提升查詢效能
CREATE INDEX idx_event_id ON event_registration (event_id);
CREATE INDEX idx_user_id ON event_registration (user_id);

