-- 這是從 MySQL 轉換到 PostgreSQL 的 coupon_user.sql 腳本。

-- 建立 coupon_user 資料表
CREATE TABLE IF NOT EXISTS coupon_user (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    coupon_id INT NOT NULL,
    valid SMALLINT DEFAULT 1
);

-- 為 valid 欄位新增註解
COMMENT ON COLUMN coupon_user.valid IS '1=有效, 0=無效';

-- 為了方便查詢，可以為 user_id 和 coupon_id 建立索引
CREATE INDEX IF NOT EXISTS idx_coupon_user_user_id ON coupon_user (user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_user_coupon_id ON coupon_user (coupon_id);

INSERT INTO coupon_user (id, user_id, coupon_id, valid) VALUES
(1, 101, 1, 1),
(2, 102, 10, 1),
(3, 103, 21, 0),
(4, 104, 15, 1),
(5, 105, 14, 0);