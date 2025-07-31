-- PostgreSQL order_detail 表
-- ========================================
CREATE TABLE order_detail (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    product_id INTEGER NOT NULL,
    product_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL
);

-- 插入資料
INSERT INTO order_detail (id, user_id, order_id, product_id, product_price, quantity) VALUES
(1, 2, '3438b1a3-5df1-4cd0-bcf3-d331c909b517', 270, 25900, 1),
(2, 2, 'b507128a-1902-42f9-8852-c06a4132bad1', 254, 18900, 1);

-- 重置 SERIAL 序列
SELECT setval('order_detail_id_seq', 3);
--在PostgreSQL中，SERIAL資料類型自動生成序列值，並使用序列來為每個新行生成唯一的ID。setval('order_detail_id_seq', 3) 的作用是將序列 order_detail_id_seq 的當前值設置為3。這意味著下一次插入新行時，ID將從4開始。