# SQL 查詢語法問答集

**建立時間**: 2025年9月10日  
**目的**: 整理 SQL 查詢中的常見語法問題與解答

## 📋 目錄

- [[#g.* 語法解釋]]
- [[#SELECT * vs g.* 差異]]
- [[#COUNT DISTINCT 聚合函數]]
- [[#JOIN 關聯查詢]]
- [[#GROUP BY 限制]]

---

## 🔍 `g.*` 語法解釋

### 問題
> `g.*` 是什麼意思？

### 答案

**基本含義**：
- `g` 是資料表的**別名 (alias)**
- `.*` 表示選取該資料表的**所有欄位**
- `g.*` = 選取別名為 `g` 的資料表的所有欄位

**實際效果**：
```sql
SELECT g.*, u.name as creator_name
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id
```

`g.*` 會選取 `"group"` 表的所有欄位：
- `g.group_id`
- `g.group_name` 
- `g.creator_id`
- `g.max_members`
- `g.group_img`
- `g.creat_time`
- `g.event_id`
- 等等...

**為什麼使用別名**：
1. **簡化語法** - 避免重複寫表名
2. **避免衝突** - 多表 JOIN 時避免欄位名稱衝突
3. **提高可讀性** - 清楚知道欄位來自哪個表

---

## ❓ `SELECT *` vs `g.*` 差異

### 問題
> 為什麼不用 `SELECT *` 就好？

### 答案

**`SELECT *` 的問題**：

1. **多表 JOIN 時會產生衝突**
```sql
-- 錯誤：多個表都有相同欄位名稱
SELECT * 
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id
-- 結果：可能有多個 id, name, created_at 等欄位，造成混淆
```

2. **PostgreSQL GROUP BY 限制**
```sql
-- 錯誤：SELECT * 無法滿足 GROUP BY 要求
SELECT * 
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id
GROUP BY g.group_id, u.name  -- ❌ 錯誤：SELECT * 包含太多欄位
```

3. **欄位名稱衝突**
```sql
-- 如果兩個表都有 id 欄位
SELECT * 
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id
-- 結果：會有兩個 id 欄位，不知道哪個是哪個
```

**`g.*` 的優點**：

1. **明確指定資料表** - 只選取特定表的欄位
2. **滿足 GROUP BY 要求** - 更容易滿足 PostgreSQL 的嚴格要求
3. **避免欄位名稱衝突** - 清楚知道每個欄位來自哪個表

**最佳實踐**：
```sql
-- 最推薦：明確列出需要的欄位
SELECT g.group_id, g.group_name, g.creator_id, g.max_members,
       u.name as creator_name

-- 次選：使用表別名 + .*
SELECT g.*, u.name as creator_name

-- 不推薦：在多表 JOIN 時使用
SELECT *
```

---

## 🔢 `COUNT(DISTINCT gm.member_id) as member_count` 解釋

### 問題
> `COUNT(DISTINCT gm.member_id) as member_count` 是什麼意思？

### 答案

**語法分解**：
- `COUNT()` - 聚合函數，計算數量
- `DISTINCT` - 去重複，只計算不重複的值
- `gm.member_id` - 來自 `group_members` 表的 `member_id` 欄位
- `as member_count` - 將結果命名為 `member_count`

**實際意義**：
- 計算每個群組中**不重複的成員數量**
- 例如：如果群組有 3 個成員，結果就是 `member_count: 3`

**為什麼用 `DISTINCT`**：
```sql
-- 假設 group_members 表有重複記錄
group_id | member_id
---------|----------
1        | 101
1        | 102  
1        | 101    -- 重複記錄
1        | 103

-- 使用 COUNT(member_id) → 結果：4（包含重複）
-- 使用 COUNT(DISTINCT member_id) → 結果：3（去重複）
```

**實際應用**：
```sql
SELECT g.group_id, g.group_name,
       COUNT(DISTINCT gm.member_id) as member_count
FROM "group" g
LEFT JOIN group_members gm ON g.group_id = gm.group_id
GROUP BY g.group_id, g.group_name
```

**結果範例**：
```json
{
  "group_id": 1,
  "group_name": "APEX 高手群",
  "member_count": 5
}
```

---

## 🎯 `e.event_name` 解釋

### 問題
> `e.event_name` 是什麼意思？

### 答案

**語法分解**：
- `e` - `event_type` 表的別名
- `event_name` - 活動名稱欄位

**實際意義**：
- 選取與群組關聯的活動名稱
- 例如：`event_name: "決勝冬季盃S5 複賽"`

**關聯邏輯**：
```sql
LEFT JOIN event_type e ON g.event_id = e.event_id
-- 透過 g.event_id = e.event_id 建立關聯
```

**完整查詢效果**：
```sql
SELECT g.*, u.name as creator_name, 
       COUNT(DISTINCT gm.member_id) as member_count,  -- 群組成員數量
       e.event_name                                   -- 關聯的活動名稱
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id        -- 取得群組創建者姓名
LEFT JOIN group_members gm ON g.group_id = gm.group_id  -- 取得群組成員
LEFT JOIN event_type e ON g.event_id = e.event_id    -- 取得關聯活動
GROUP BY g.group_id, u.name, e.event_name
ORDER BY g.creat_time DESC
```

**結果範例**：
```json
{
  "group_id": 1,
  "group_name": "APEX 高手群",
  "creator_name": "張三",
  "member_count": 5,
  "event_name": "決勝冬季盃S5 複賽"
}
```

---

## 🏗️ JOIN 關聯查詢

### LEFT JOIN 的作用

**基本語法**：
```sql
LEFT JOIN table_name alias ON condition
```

**實際範例**：
```sql
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id
LEFT JOIN group_members gm ON g.group_id = gm.group_id
LEFT JOIN event_type e ON g.event_id = e.event_id
```

**LEFT JOIN 特點**：
- 保留左表（"group"）的所有記錄
- 右表沒有匹配的記錄時，右表欄位顯示 `NULL`
- 適合需要顯示所有群組，即使沒有關聯資料的情況

---

## 📊 GROUP BY 限制

### PostgreSQL GROUP BY 規則

**基本規則**：
- 所有非聚合函數的欄位都必須在 `GROUP BY` 中
- 聚合函數（如 `COUNT`, `SUM`, `AVG`）不需要在 `GROUP BY` 中

**實際範例**：
```sql
SELECT g.group_id, g.group_name, u.name,
       COUNT(DISTINCT gm.member_id) as member_count
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id
LEFT JOIN group_members gm ON g.group_id = gm.group_id
GROUP BY g.group_id, g.group_name, u.name  -- 所有非聚合欄位都必須在這裡
```

**錯誤範例**：
```sql
-- ❌ 錯誤：g.group_name 不在 GROUP BY 中
SELECT g.group_id, g.group_name, u.name,
       COUNT(DISTINCT gm.member_id) as member_count
FROM "group" g
LEFT JOIN users u ON g.creator_id = u.user_id
GROUP BY g.group_id, u.name  -- 缺少 g.group_name
```

---

## 🔗 相關連結

- [[group-events-distinct-orderby-error]] - PostgreSQL DISTINCT ORDER BY 錯誤
- [[sql-parsing-order-obsidian]] - SQL 語法樹解析順序
- [[event-schema-api-comparison]] - 資料庫與 API 比較
- [[CURSOR_PERSONAL_MEMO]] - 個人備忘錄

---

**標籤**: #SQL #PostgreSQL #JOIN #GROUP-BY #COUNT #DISTINCT #Alias #Database
