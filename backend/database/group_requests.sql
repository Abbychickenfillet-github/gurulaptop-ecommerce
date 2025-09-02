---## PostgreSQL 轉換

-- 建立自定義的 ENUM 類型
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE group_requests (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    sender_id INT NOT NULL,
    creator_id INT NOT NULL,
    game_id VARCHAR(255) DEFAULT NULL,
    description TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO group_requests (group_id, sender_id, creator_id, game_id, description, status, created_at, updated_at) VALUES
(1, 441, 440, '123', '123123', 'accepted', '2024-11-18 07:07:12+00', '2024-11-18 07:07:31+00'),
(2, 441, 440, '13213', '123123', 'accepted', '2024-11-18 07:08:17+00', '2024-11-18 07:08:36+00'),
(3, 441, 440, 'aaaaa', 'aaaaa', 'accepted', '2024-11-18 08:00:16+00', '2024-11-18 08:00:30+00');