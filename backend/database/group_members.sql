-- PostgreSQL Conversion

CREATE TYPE group_member_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    member_id INT NOT NULL,
    join_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status group_member_status NOT NULL DEFAULT 'accepted'
);

INSERT INTO group_members (group_id, member_id, join_time, status) VALUES
(14, 440, '2024-11-20 13:02:51+00', 'accepted'),
(15, 440, '2024-11-20 15:49:34+00', 'accepted'),
(16, 440, '2024-11-21 10:24:16+00', 'accepted'),
(17, 440, '2024-11-21 10:36:40+00', 'accepted'),
(18, 440, '2024-11-21 10:56:02+00', 'accepted'),
(21, 441, '2024-11-23 15:37:38+00', 'accepted'),
(21, 440, '2024-11-23 15:39:47+00', 'accepted'),
(22, 441, '2024-11-24 18:01:51+00', 'accepted'),
(23, 449, '2024-11-24 18:06:23+00', 'accepted'),
(22, 449, '2024-11-24 18:09:05+00', 'accepted'),
(23, 441, '2024-11-24 18:09:50+00', 'accepted'),
(24, 450, '2024-11-24 18:19:38+00', 'accepted'),
(24, 449, '2024-11-24 18:20:21+00', 'accepted'),
(25, 451, '2024-11-24 18:42:14+00', 'accepted'),
(25, 450, '2024-11-24 18:43:08+00', 'accepted'),
(25, 452, '2024-11-24 18:45:36+00', 'accepted'),
(26, 452, '2024-11-24 18:48:55+00', 'accepted'),
(26, 451, '2024-11-24 18:50:35+00', 'accepted'),
(27, 452, '2024-11-24 22:52:12+00', 'accepted'),
(27, 451, '2024-11-24 22:52:49+00', 'accepted'),
(28, 453, '2024-11-24 22:55:36+00', 'accepted'),
(28, 454, '2024-11-24 22:59:28+00', 'accepted'),
(28, 451, '2024-11-24 22:59:30+00', 'accepted'),
(29, 454, '2024-11-24 23:01:13+00', 'accepted'),
(29, 453, '2024-11-24 23:01:52+00', 'accepted'),
(29, 455, '2024-11-24 23:04:11+00', 'accepted'),
(30, 455, '2024-11-24 23:05:58+00', 'accepted'),
(30, 454, '2024-11-24 23:06:30+00', 'accepted'),
(31, 457, '2024-11-24 23:10:13+00', 'accepted'),
(32, 456, '2024-11-24 23:11:31+00', 'accepted'),
(31, 456, '2024-11-24 23:12:28+00', 'accepted'),
(32, 457, '2024-11-24 23:12:31+00', 'accepted');

CREATE UNIQUE INDEX ON group_members (group_id, member_id);

CREATE INDEX ON group_members (member_id);