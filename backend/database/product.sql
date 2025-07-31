-- 3.PostgreSQL product 表
-- ========================================
CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    product_brand VARCHAR(10) NOT NULL,
    list_price INTEGER NOT NULL,
    affordance VARCHAR(10) NOT NULL,
    product_color VARCHAR(10) NOT NULL,
    product_size VARCHAR(10) NOT NULL,
    product_weight REAL NOT NULL,
    product_CPU VARCHAR(100) NOT NULL,
    discrete_display_card VARCHAR(5) NOT NULL,
    product_display_card VARCHAR(100) NOT NULL,
    product_RAM VARCHAR(10) NOT NULL,
    product_hardisk_type VARCHAR(10) NOT NULL,
    product_hardisk_volume VARCHAR(10) NOT NULL,
    product_OS VARCHAR(20) NOT NULL,
    product_wireless VARCHAR(100) NOT NULL,
    product_camera VARCHAR(100) NOT NULL,
    product_keyboard VARCHAR(100) NOT NULL,
    product_cardreader VARCHAR(100) NOT NULL,
    product_power VARCHAR(100) NOT NULL,
    "product_I/O" VARCHAR(500) NOT NULL,
    valid SMALLINT NOT NULL DEFAULT 1
);

-- 註：由於資料量過大，這裡只插入前幾筆作為示例
-- 實際使用時請插入完整的產品資料
INSERT INTO product (product_id, product_name, model, product_brand, list_price, affordance, product_color, product_size, product_weight, product_CPU, discrete_display_card, product_display_card, product_RAM, product_hardisk_type, product_hardisk_volume, product_OS, product_wireless, product_camera, product_keyboard, product_cardreader, product_power, "product_I/O", valid) VALUES
(1, 'ASUS ExpertBook B5', 'B5602CVA-0041A1340P', 'ASUS', 39900, '商務', '黑色', '16吋以上', 1.5, 'Intel® Core™i5-1340P', 'none', 'iris XE', '16GB', 'M.2', '512GB', '', '', '', '', '', '', '1x USB 3.2 Gen 1 Type-A,\r\n1x USB 3.2 Gen 2 Type-A,\r\n2x Thunderbolt™ 4, compliant with USB4, supports display / power delivery,\r\n1x HDMI 2.1,\r\n1x 3.5mm Combo Audio Jack,\r\n1x RJ45 Gigabit Ethernet,\r\nMicro SD card reader', 1),
(2, 'ASUS Vivobook Go 15 OLED ', 'ASUS Vivobook Go 15 OLED (E1504F-0081K7520U)', 'ASUS', 21900, '文書', '黑色', '15.6吋', 1.63, 'Ryzen™ 5 7520U', 'none', 'Radeon™ 610M', '16GB', 'M.2', '512GB', 'Windows 11 Home', 'Wi-Fi 6E(802.11ax) (雙頻) 1*1 + Bluetooth® 5.3', '720p HD 攝影機 視訊鏡頭遮罩', ' 巧克力鍵盤, 1.4mm 鍵程, 觸控板', '', '65W AC 變壓器', '1x USB 2.0 Type-A,\r\n1x USB 3.2 Gen 1 Type-A,\r\n1x USB 3.2 Gen 1 Type-C,\r\n1x HDMI 1.4,\r\n1x 3.5mm 音訊插孔,\r\n1 x DC 輸入', 1);

-- 重置 SERIAL 序列
SELECT setval('product_product_id_seq', 279);
