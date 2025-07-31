-- 6.PostgreSQL purchase_order 表
-- ========================================
CREATE TABLE purchase_order (
    id VARCHAR(255) PRIMARY KEY, -- UUID
    user_id INTEGER NOT NULL,
    amount INTEGER DEFAULT NULL,
    transaction_id VARCHAR(255) DEFAULT NULL,
    payment VARCHAR(255) DEFAULT NULL, -- LINE Pay, 信用卡, ATM
    shipping VARCHAR(255) DEFAULT NULL, -- 7-11, Family Mart, Hi-Life, OK Mart, 郵局, 宅配
    status VARCHAR(255) DEFAULT NULL, -- pending, paid, fail, cancel, error
    order_info TEXT DEFAULT NULL, -- send to line pay
    reservation TEXT DEFAULT NULL, -- get from line pay
    confirm TEXT DEFAULT NULL, -- confirm from line pay
    return_code VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);