-- PostgreSQL users table schema
-- 使用 PostgreSQL 語法，將 MySQL 的資料型別轉換為 PostgreSQL 相對應的資料型別
-- 注意：PostgreSQL 中沒有 UNSIGNED，預設整數為正整數
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY, -- PostgreSQL 中 UNSIGNED 不支援，預設正整數使用 INTEGER
  level SMALLINT NOT NULL DEFAULT 0, -- 對應 tinyint(2)
  password TEXT NOT NULL,
  name VARCHAR(30),
  phone VARCHAR(30),
  email VARCHAR(30) NOT NULL,
  valid BOOLEAN NOT NULL DEFAULT TRUE, -- 使用 boolean 替代 tinyint(1)
  created_at TIMESTAMP NOT NULL,
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
