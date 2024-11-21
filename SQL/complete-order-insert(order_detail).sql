INSERT INTO `order_list` 
(`user_id`, `order_id`, `order_amount`, `address`, `already_pay`, `create_time`) 
SELECT 
    u.user_id,
    CONCAT(
        'ORD',
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
            '%Y%m%d'
        ),
        LPAD(ROW_NUMBER() OVER (PARTITION BY u.user_id ORDER BY RAND()), 3, '0')
    ) as order_id,
    CASE 
        WHEN u.level = 4 THEN FLOOR(80000 + RAND() * 50000)  -- 鑽石會員 (100000+)
        WHEN u.level = 3 THEN FLOOR(50000 + RAND() * 30000)  -- 金牌會員 (70000-99999)
        WHEN u.level = 2 THEN FLOOR(30000 + RAND() * 20000)  -- 銀牌會員 (40000-69999)
        WHEN u.level = 1 THEN FLOOR(15000 + RAND() * 15000)  -- 銅牌會員 (20000-39999)
        WHEN u.level = 0 THEN FLOOR(5000 + RAND() * 15000)   -- 一般會員 (0-19999)
        ELSE FLOOR(5000 + RAND() * 15000)                    -- 預設情況
    END as order_amount,
    CONCAT(u.city, u.district, u.road_name, u.detailed_address) as address,
    1 as already_pay,
    DATE_SUB(
        DATE_SUB(
            DATE_SUB(NOW(), 
                INTERVAL FLOOR(RAND() * 365) DAY),
            INTERVAL FLOOR(RAND() * 24) HOUR),
        INTERVAL FLOOR(RAND() * 60) MINUTE
    ) as create_time
FROM users u
CROSS JOIN (
    SELECT 1 as n 
    UNION SELECT 2 
    UNION SELECT 3
) numbers
WHERE u.user_id BETWEEN 1 AND 447 
AND RAND() < 0.7  -- 70% 機率生成訂單
ORDER BY u.user_id, RAND();
