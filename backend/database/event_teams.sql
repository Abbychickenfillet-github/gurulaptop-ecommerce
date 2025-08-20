-- PostgreSQL Schema for event_teams table

CREATE TABLE event_teams (
    team_id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL,
    event_id INT NOT NULL,
    user_id INT NOT NULL, -- 隊長的用戶ID
    team_name VARCHAR(100) NOT NULL,
    captain_info TEXT, -- 隊長資訊 JSON格式
    valid SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for event_teams
CREATE INDEX ON event_teams (registration_id);
CREATE INDEX ON event_teams (event_id);
CREATE INDEX ON event_teams (user_id);