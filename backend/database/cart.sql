-- 這是從 MySQL 轉換到 PostgreSQL 的 cart.sql 腳本。

-- 如果資料庫不存在，請先在 pgAdmin 或 psql 中手動建立：
-- CREATE DATABASE project_db;
-- 然後再連接到該資料庫執行此腳本。

-- 建立 cart 資料表
-- PostgreSQL 不支援 AUTO_INCREMENT，改用 SERIAL。
-- TINYINT(4) 轉換為 SMALLINT。
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    valid SMALLINT NOT NULL DEFAULT 1
);

-- 為了方便查詢，可以為 user_id 和 product_id 建立索引
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart (product_id);

-- 如果你有舊的資料需要匯入，可以將它們轉換為 INSERT 語句。
-- 例如：
-- INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 101, 1);
-- INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 102, 2);