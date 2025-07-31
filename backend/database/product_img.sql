-- 5.PostgreSQL product_img 表
-- ========================================
CREATE TABLE product_img (
    img_id SERIAL PRIMARY KEY,
    img_product_id INTEGER NOT NULL,
    product_img_path VARCHAR(255) NOT NULL
);

-- 插入前幾筆資料作為示例
INSERT INTO product_img (img_id, img_product_id, product_img_path) VALUES
(1, 275, 'XPS 14_1731661661.png'),
(2, 274, 'XPS 14_1731661684.png'),
(3, 273, 'XPS 16_1731661713.png'),
(4, 272, 'XPS 16_1731661772.png');

-- 重置 SERIAL 序列
SELECT setval('product_img_img_id_seq', 278);