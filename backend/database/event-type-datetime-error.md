# PostgreSQL 日期時間範圍錯誤 (`date/time field value out of range`)

## 問題描述
在執行 `backend/database/event_type.sql` 檔案時，PostgreSQL 報告了 `ERROR: date/time field value out of range: "0000-00-00 00:00:00"` 錯誤。

## 錯誤現象
```
ERROR: date/time field value out of range: "0000-00-00 00:00:00"
LINE 2: ...28 00:00:00', '2025-01-02 00:00:00', 60, 1, true, '0000-00-0...
^
SQL state: 22008
Character: 745
```

## 根本原因
PostgreSQL 對於 `TIMESTAMP` 類型的欄位有嚴格的日期時間範圍要求。`'0000-00-00 00:00:00'` 在 MySQL 中可能被接受作為零值日期，但在 PostgreSQL 中這是一個無效的日期時間字串，會導致範圍錯誤。

## 解決方案
將 `backend/database/event_type.sql` 中所有 `created_at` 和 `updated_at` 欄位中明確指定為 `'0000-00-00 00:00:00'` 的值替換為 `NULL`。

**修改範例 (以 `created_at` 為例):**
- **修改前**: `..., '2025-01-02 00:00:00', 60, 1, true, '0000-00-00 00:00:00', ...`
- **修改後**: `..., '2025-01-02 00:00:00', 60, 1, true, NULL, ...`

這樣做允許資料庫在沒有有效日期時將其視為空值，或者如果欄位有 `DEFAULT NOW()` 等預設值，則會自動填充。

## 影響範圍
- 所有包含 `'0000-00-00 00:00:00'` 的 INSERT 語句
- 主要影響 `event_type` 表的資料插入

## 預防措施
1. 在 MySQL 到 PostgreSQL 遷移時，檢查所有日期時間欄位
2. 使用 `NULL` 而非無效的日期字串
3. 利用 PostgreSQL 的 `DEFAULT NOW()` 功能自動設定時間戳記

## 相關檔案
- `backend/database/event_type.sql`
- `backend/database/event_schema_api_comparison.md`
