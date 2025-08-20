-- PostgreSQL Conversion
-- Note: PostgreSQL does not support the backtick (`) for identifiers.
-- The table name 'group' is a reserved keyword in SQL, so it must be enclosed in double quotes.

CREATE TABLE "group" (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    creator_id INT NOT NULL,
    max_members INT NOT NULL,
    group_img VARCHAR(255) NOT NULL,
    creat_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    event_id INT DEFAULT NULL,
    chat_room_id INT DEFAULT NULL
);

INSERT INTO "group" (
    group_name,
    description,
    creator_id,
    max_members,
    group_img,
    creat_time,
    group_time,
    event_id,
    chat_room_id
) VALUES
('123', '123', 440, 5, '/uploads/groups/group-1732002907145-752440747.png', '2024-11-19 15:55:07+00', '2024-11-20 15:54:00+00', 5, 8),
('123123', '123123', 440, 5, '', '2024-11-19 22:06:25+00', '2024-11-20 22:06:00+00', NULL, 9),
('APEX - INTOVOID娛樂賽揪團', '123', 440, 5, '', '2024-11-19 22:28:12+00', '2024-11-22 22:28:00+00', 1, 10),
('APEX - INTOVOID娛樂賽揪團', '13213', 440, 5, '/uploads/groups/group-1732027657723-373466139.png', '2024-11-19 22:47:37+00', '2024-11-22 22:47:00+00', 1, 11),
('APEX - INTOVOID娛樂賽揪團', '123', 440, 3, '', '2024-11-19 23:26:58+00', '2024-11-20 23:26:00+00', 1, 12),
('APEX - INTOVOID娛樂賽揪團', '123', 440, 5, '', '2024-11-20 12:59:29+00', '2024-11-22 12:59:00+00', 1, 13),
('APEX - INTOVOID娛樂賽揪團', '123', 440, 6, '', '2024-11-20 13:02:51+00', '2024-11-22 13:02:00+00', 1, 14),
('英雄聯盟政大杯', '123123123', 440, 4, '', '2024-11-20 15:49:34+00', '2024-11-21 17:48:00+00', NULL, 15),
('123', '123', 440, 6, '', '2024-11-21 10:24:16+00', '2024-11-22 10:22:00+00', 13, 16),
('鳳凰盃個人競速賽 - 晉級決賽復活賽揪團', '13123', 440, 4, '', '2024-11-21 10:36:40+00', '2024-11-29 10:36:00+00', 21, 17),
('2023 北大盃 複賽揪團', '123', 440, 5, '', '2024-11-21 10:56:02+00', '2024-11-23 10:55:00+00', 25, 18),
('鳳凰盃個人競速賽 - 晉級決賽復活賽揪團', '12', 443, 6, '', '2024-11-21 13:15:57+00', '2024-11-22 16:15:00+00', 21, 19),
('APEX - INTOVOID娛樂賽揪團', '123', 440, 3, '', '2024-11-21 17:00:52+00', '2024-11-22 17:00:00+00', 1, 20),
('漫威：瞬戰超能', '123', 441, 4, '/uploads/groups/group-1732347458927-919803309.jpg', '2024-11-23 15:37:38+00', '2024-11-25 19:37:00+00', 45, 21),
('TFT', '雖然是個人比賽 但想找個伴一起參加', 441, 2, '/uploads/groups/group-1732442511315-161883718.png', '2024-11-24 18:01:51+00', '2024-11-30 20:00:00+00', 13, 22),
('劍指冠軍', '超凡以上 感恩', 449, 5, '/uploads/groups/group-1732442783131-269453367.png', '2024-11-24 18:06:23+00', '2024-11-30 21:00:00+00', 25, 23),
('uuuuuu', '有沒有人要一起去邀請賽玩~', 450, 2, '/uploads/groups/group-1732443578559-695587024.png', '2024-11-24 18:19:38+00', '2024-11-24 20:00:00+00', 49, 24),
('APEX娛樂賽 找人', '娛樂賽 找人開心打  不氣氛 !', 451, 6, '/uploads/groups/group-1732444934594-777154587.png', '2024-11-24 18:42:14+00', '2024-11-30 22:00:00+00', 1, 25),
('123木頭人', '找人輕鬆玩', 452, 6, '/uploads/groups/group-1732445335702-83319233.png', '2024-11-24 18:48:55+00', '2024-12-18 21:00:00+00', 9, 26),
('TFT 比賽', '一起玩~', 452, 3, '/uploads/groups/group-1732459932610-102074121.png', '2024-11-24 22:52:12+00', '2024-11-30 22:51:00+00', 29, 27),
('鳳凰盃競速賽', '一起比賽!', 453, 3, '/uploads/groups/group-1732460136900-370525994.png', '2024-11-24 22:55:36+00', '2024-12-02 22:54:00+00', 21, 28),
('Just Dance 舞力全開', '一起跳', 454, 3, '/uploads/groups/group-1732460473061-364484680.png', '2024-11-24 23:01:13+00', '2024-12-07 22:59:00+00', 5, 29),
('蛋仔', '跟龜龜一起參加蛋仔派對', 455, 2, '/uploads/groups/group-1732460758458-471424995.png', '2024-11-24 23:05:58+00', '2024-12-02 23:00:00+00', 37, 30),
('APEX', '一起打 !', 457, 4, '/uploads/groups/group-1732461013550-783421269.png', '2024-11-24 23:10:13+00', '2024-12-03 23:09:00+00', 1, 31),
('跟著小活龍跳', '跳起來 !', 456, 4, '/uploads/groups/group-1732461091482-417991979.png', '2024-11-24 23:11:31+00', '2024-12-03 23:10:00+00', 5, 32);

-- PostgreSQL does not need separate ALTER TABLE statements for primary keys and auto-increment.
-- The PRIMARY KEY and SERIAL keywords handle this during table creation.

-- The original file contains foreign key constraints, which are not included in the above DDL.
-- You would need to add them separately if the other tables exist.
--
-- Example of adding foreign keys:
-- ALTER TABLE "group" ADD CONSTRAINT group_creator_fk FOREIGN KEY (creator_id) REFERENCES users(user_id);
-- ALTER TABLE "group" ADD CONSTRAINT group_event_fk FOREIGN KEY (event_id) REFERENCES events(event_id);
-- ALTER TABLE "group" ADD CONSTRAINT group_chat_room_id_fk FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(chat_room_id);