-- PostgreSQL users table schema
-- 使用 PostgreSQL 語法，將 MySQL 的資料型別轉換為 PostgreSQL 相對應的資料型別
-- 注意：PostgreSQL 中沒有 UNSIGNED，預設整數為正整數
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY, -- ✅ 使用 SERIAL 自动递增
  level SMALLINT NOT NULL DEFAULT 0, -- 對應 tinyint(2)
  password VARCHAR(60) NOT NULL, -- ✅ bcrypt hash 固定 60 字符
  name VARCHAR(30),
  phone VARCHAR(30),
  email VARCHAR(30) NOT NULL,
  valid BOOLEAN NOT NULL DEFAULT TRUE, -- 使用 boolean 替代 tinyint(1)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gender VARCHAR(10),
  country VARCHAR(30), -- ✅ 移除 NOT NULL
  city VARCHAR(30), -- ✅ 移除 NOT NULL
  district VARCHAR(30), -- ✅ 移除 NOT NULL
  road_name VARCHAR(30), -- ✅ 移除 NOT NULL
  detailed_address VARCHAR(30), -- ✅ 移除 NOT NULL
  image_path TEXT, -- ✅ 移除 NOT NULL
  remarks VARCHAR(150),
  birthdate DATE,
  google_uid SMALLINT, -- int(2) 對應 smallint
  iat VARCHAR(50),
  exp VARCHAR(50)
);

-- 注意：这个 INSERT 语句需要调整，因为 user_id 现在是自增的
-- INSERT INTO users (
--   level, password, name, phone, email, valid, created_at, gender, country, city, district, road_name, detailed_address, image_path, remarks, birthdate, google_uid, iat, exp
-- ) VALUES (
--   0, '$2a$10$kuGvOL4FF1YWE3Y.r53uWeyHEPou8URsAd.BIkgNqrXmGhHWDuvi.', 'John Doe', '+886987654321', 'john@example.com', TRUE, CURRENT_TIMESTAMP, 'Male', 'Taiwan', 'Taipei', 'Daan', 'Xiaonan', 'No.123', '/signup_login/avatar.svg', 'Test user', '1990-01-01', 12345, '1731661684', '1731661684'
-- );