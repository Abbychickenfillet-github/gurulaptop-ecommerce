-- PostgreSQL product_detail_img 表
CREATE TABLE product_detail_img (
    id SERIAL PRIMARY KEY,
    img_product_id INTEGER NOT NULL,
    product_img_path VARCHAR(255) NOT NULL
);

-- 插入前幾筆資料作為示例
INSERT INTO product_detail_img (id, img_product_id, product_img_path) VALUES
(39, 274, 'XPS 14-0_1731661684_0.png'),
(40, 274, 'XPS 14-1_1731661684_1.png'),
(41, 274, 'XPS 14-2_1731661684_2.png'),
(42, 274, 'XPS 14-3_1731661684_3.png');

-- 重置 SERIAL 序列
SELECT setval('product_detail_img_id_seq', 833);