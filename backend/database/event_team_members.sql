-- 這是從 MySQL 轉換到 PostgreSQL 的 event_team_members.sql 腳本。

-- 建立 event_team_members 資料表
CREATE TABLE IF NOT EXISTS event_team_members (
    member_id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    registration_id INT NOT NULL,
    member_name VARCHAR(50) NOT NULL,
    member_game_id VARCHAR(50) NOT NULL,
    valid SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 為 team_id 和 registration_id 建立索引，以加快查詢速度
CREATE INDEX IF NOT EXISTS idx_event_team_members_team_id ON event_team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_event_team_members_registration_id ON event_team_members (registration_id);
