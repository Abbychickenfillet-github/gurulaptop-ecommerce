-- 由於 PostgreSQL 沒有像 MySQL 的 "USE" 指令，
-- 你需要在 psql 或 pgAdmin 中先選擇或建立名為 'project_db' 的資料庫，
-- 然後再執行此腳本。
-- 例如，在 psql 中：
-- CREATE DATABASE project_db;
-- \c project_db

-- 建立 blogoverview 資料表
-- 注意：PostgreSQL 不支援 INT(5) 這種長度限制，只需要 INT
CREATE TABLE IF NOT EXISTS blogoverview (
    blog_id SERIAL PRIMARY KEY,
    user_id VARCHAR(10),
    blog_type VARCHAR(20) NOT NULL,
    blog_title VARCHAR(500) NOT NULL,
    blog_content TEXT NOT NULL,
    blog_created_date TIMESTAMP NOT NULL,
    blog_brand VARCHAR(10) NOT NULL,
    blog_brand_model VARCHAR(50),
    blog_image VARCHAR(100),
    blog_views VARCHAR(10),
    blog_keyword TEXT NOT NULL,
    blog_valid_value INT NOT NULL, -- 注意：PostgreSQL 不支援 INT(4)，只需要 INT
    blog_url TEXT NOT NULL
);

-- 插入資料到 blogoverview 資料表
-- INSERT INTO 語句在 PostgreSQL 中可以直接使用，不需要修改。
-- 然而，在插入 SERIAL 類型的欄位（如 blog_id）時，
-- 最好不要手動指定它的值，讓資料庫自動處理。
-- 這裡我們把 blog_id 移除，讓它自動生成。
INSERT INTO blogoverview(
    user_id,
    blog_type,
    blog_title,
    blog_content,
    blog_created_date,
    blog_brand,
    blog_brand_model,
    blog_image,
    blog_views,
    blog_keyword,
    blog_valid_value,
    blog_url
) VALUES
    ('1', '開箱文',
        'RTX4070電競筆電開箱分享與使用體驗',
        '最近入手了一台RTX4070電競筆電，散熱效果令人驚艷。機身採用全金屬設計，質感非常好，鍵盤手感也很棒。',
        '2024-03-21 10:30:00',
        'MSI',
        'Stealth 16',
        '/blog-images/61.png',
        '1',
        '電競筆電,開箱,MSI',
        1,
        ''),

    ('1', '開箱文',
        '輕薄商務筆電開箱實測',
        '購買了這款輕薄商務筆電，重量很輕，方便攜帶。效能足夠應付日常辦公需求。',
        '2024-03-15 09:15:00',
        'Lenovo',
        'ThinkPad X1 Carbon',
        '/blog-images/62.png',
        '1',
        '商務筆電,輕薄,Lenovo',
        1,
        ''),

    ('1', '技術分享',
        '如何優化筆電電池壽命',
        '分享幾個優化筆電電池壽命的小技巧，包括調整電源設定、校準電池等，希望能幫助到大家。',
        '2024-03-10 14:00:00',
        'Acer',
        'Swift 3',
        '/blog-images/63.png',
        '1',
        '電池,優化,技巧',
        1,
        ''),

    ('1', '購買心得',
        'MacBook Air M2 購買心得',
        '蘋果的M2晶片效能非常強大，運行起來非常流暢，而且電池續航力超級久，非常適合文書工作者。',
        '2024-02-28 17:45:00',
        'Apple',
        'MacBook Air',
        '/blog-images/64.png',
        '1',
        'MacBook,M2,心得',
        1,
        ''),

    ('1', '開箱文',
        '二合一變形筆電開箱',
        '入手新款變形筆電，可以靈活切換多種使用模式，工作娛樂兩相宜。',
        '2024-02-12 11:35:00',
        'DELL',
        'Inspiron 14',
        '/blog-images/65.png',
        '1',
        '變形筆電',
        1,
        ''),

    ('1', '疑難雜症',
        '筆電燒機測試諮詢',
        '想要進行筆電燒機測試，但不知道該用什麼軟體比較好，希望能得到建議。',
        '2024-01-08 10:20:00',
        'Acer',
        'Predator Triton',
        '/blog-images/66.png',
        '1',
        '燒機測試',
        1,
        ''),

    ('1', '購買心得',
        '平價電競筆電體驗',
        '購入一台入門級電競筆電，性價比很高，一般遊戲都能順暢運行。',
        '2024-02-20 16:15:00',
        'GIGABYTE',
        'G5 GE',
        '/blog-images/67.png',
        '1',
        '平價電競',
        1,
        '');
