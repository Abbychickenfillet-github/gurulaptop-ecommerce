-- 2.PostgreSQL order_list 表
-- ========================================
CREATE TABLE order_list (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    order_amount INTEGER NOT NULL,
    payment_method SMALLINT NOT NULL,
    coupon_id INTEGER DEFAULT NULL,
    receiver VARCHAR(200) DEFAULT NULL,
    phone VARCHAR(200) NOT NULL,
    address VARCHAR(100) DEFAULT NULL,
    already_pay INTEGER NOT NULL DEFAULT 0,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 插入資料
INSERT INTO order_list (id, user_id, order_id, order_amount, payment_method, coupon_id, receiver, phone, address, already_pay, create_time) VALUES
(1, 2, '3438b1a3-5df1-4cd0-bcf3-d331c909b517', 25900, 0, 0, 'test', '0987654321', '台灣台北市中正區八德路１段1號', 1, '2024-11-18 11:41:13'),
(2, 2, 'b507128a-1902-42f9-8852-c06a4132bad1', 18900, 0, 0, 'test', '0987654321', '台灣台北市中正區八德路１段1號', 0, '2024-11-18 11:54:32');

-- 重置 SERIAL 序列
SELECT setval('order_list_id_seq', 3);
