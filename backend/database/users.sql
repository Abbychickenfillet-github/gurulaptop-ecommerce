-- PostgreSQL users table schema
-- 使用 PostgreSQL 語法，將 MySQL 的資料型別轉換為 PostgreSQL 相對應的資料型別
-- 注意：PostgreSQL 中沒有 UNSIGNED，預設整數為正整數
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY, -- PostgreSQL 中 UNSIGNED 不支援，預設正整數使用 INTEGER
  level SMALLINT NOT NULL DEFAULT 0, -- 對應 tinyint(2)
  password VARCHAR NOT NULL,
  name VARCHAR(30),
  phone VARCHAR(30),
  email VARCHAR(30) NOT NULL,
  valid BOOLEAN NOT NULL DEFAULT TRUE, -- 使用 boolean 替代 tinyint(1)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gender VARCHAR(10),
  country VARCHAR(30) NOT NULL,
  city VARCHAR(30) NOT NULL,
  district VARCHAR(30) NOT NULL,
  road_name VARCHAR(30) NOT NULL,
  detailed_address VARCHAR(30) NOT NULL,
  image_path TEXT NOT NULL, -- PostgreSQL 沒有 longtext，使用 text
  remarks VARCHAR(150),
  birthdate DATE,
  google_uid SMALLINT, -- int(2) 對應 smallint
  iat VARCHAR(50),
  exp VARCHAR(50)
);

INSERT INTO users (
  user_id, level, password, name, phone, email, valid, created_at, gender, country, city, district, road_name, detailed_address, image_path, remarks, birthdate, google_uid, iat, exp
) VALUES (
  1, 0, '$2a$10$kuGvOL4FF1YWE3Y.r53uWeyHEPou8URsAd.BIkgNqrXmGhHWDuvi.', 'John Doe', '+886987654321', 'john@example.com', TRUE, CURRENT_TIMESTAMP, 'Male', 'Taiwan', 'Taipei', 'Daan', 'Xiaonan', 'No.123', '/images/profile1.jpg', 'Test user', '1990-01-01', 12345, '1731661684', '1731661684'
);