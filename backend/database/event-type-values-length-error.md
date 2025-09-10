# PostgreSQL VALUES 列表長度不一致錯誤 (`VALUES lists must all be the same length`)

## 問題描述
在修復 NOT NULL 約束錯誤後，PostgreSQL 報告了 `ERROR: VALUES lists must all be the same length` 錯誤，特別是在 Zeabur 部署時。

## 錯誤現象
```
ERROR: VALUES lists must all be the same length
LINE 54: (53, '麻雀一番街秋楓盃', '雀魂麻將', 'Steam', '比賽人數上限...
^
SQL state: 42601
Character: 27264
```

## 根本原因
在移除 `created_at` 欄位後，某些 INSERT 語句的 VALUES 列表仍然包含額外的時間戳記值，導致列表長度不一致。

**具體問題:**
- 大部分 VALUES 列表有 17 個值（正確）
- 第 75-78 行的 VALUES 列表有 18 個值（多了一個時間戳記）

## 解決方案
**移除多餘的時間戳記值:**

**修改前:**
```sql
(53, '麻雀一番街秋楓盃', '雀魂麻將', 'Steam', ..., '2024-11-24 23:20:49', 1),
(54, '另一個活動', ..., '2024-11-24 23:20:49', 1),
(55, '第三個活動', ..., '2024-11-24 23:20:49', 1),
(56, '第四個活動', ..., '2024-11-24 23:20:49', 1),
```

**修改後:**
```sql
(53, '麻雀一番街秋楓盃', '雀魂麻將', 'Steam', ..., 1),
(54, '另一個活動', ..., 1),
(55, '第三個活動', ..., 1),
(56, '第四個活動', ..., 1),
```

## 修復步驟
1. 檢查所有 INSERT 語句的欄位數量
2. 確保每個 VALUES 列表的長度都相同
3. 移除多餘的時間戳記值 `'2024-11-24 23:20:49'`

## 影響範圍
- `backend/database/event_type.sql` 第 75-78 行
- 影響 Zeabur 部署的成功執行

## 預防措施
1. 在修改 INSERT 語句時，確保所有 VALUES 列表長度一致
2. 使用 SQL 編輯器的語法檢查功能
3. 在部署前先在本地環境測試 SQL 語句

## 相關檔案
- `backend/database/event_type.sql`
- `backend/database/event_schema_api_comparison.md`
