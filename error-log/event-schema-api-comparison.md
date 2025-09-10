# Event Schema 與 API 比較分析

**建立時間**: 2025年1月2日  
**目的**: 記錄 `event_type.sql` 與 `events.js` API 的差異分析

## 檔案比較
- **資料庫結構**: `backend/database/event_type.sql`
- **API 路由**: `backend/routes/events.js`

## 資料庫欄位與 API 回應對應表

| 資料庫欄位 (event_type.sql) | API 回應欄位 (events.js) | 資料類型 | 說明 |
|---------------------------|------------------------|---------|------|
| `event_id` | `id` | SERIAL PRIMARY KEY | 活動唯一識別碼 |
| `event_name` | `name` | VARCHAR(50) | 活動名稱 |
| `event_type` | `type` | VARCHAR(20) | 活動類型 |
| `event_platform` | `platform` | VARCHAR(20) | 活動平台 |
| `event_content` | `content` | TEXT | 活動內容描述 |
| `event_rule` | `rule` | TEXT | 活動規則 |
| `event_award` | `award` | TEXT | 活動獎勵 |
| `individual_or_team` | `teamType` | VARCHAR(10) | 個人或團體 |
| `event_picture` | `picture` | VARCHAR(255) | 活動圖片URL |
| `apply_start_time` | `applyStartTime` | TIMESTAMP | 報名開始時間 |
| `apply_end_time` | `applyEndTime` | TIMESTAMP | 報名結束時間 |
| `event_start_time` | `eventStartTime` | TIMESTAMP | 活動開始時間 |
| `event_end_time` | `eventEndTime` | TIMESTAMP | 活動結束時間 |
| `maximum_people` | `maxPeople` | INTEGER | 最大參與人數 |
| `status_id` | ❌ 未使用 | INTEGER | 狀態ID（API中未使用） |
| `valid` | ❌ 未使用 | BOOLEAN | 有效性標記（API中未使用） |
| `created_at` | ❌ 未使用 | TIMESTAMP | 建立時間（API中未使用） |
| `current_participants` | `currentParticipants` | INTEGER | 目前參與人數（動態計算） |

## API 額外欄位

| API 欄位 | 資料來源 | 說明 |
|---------|---------|------|
| `status` | 動態計算 | 活動狀態（即將開始報名/報名中/進行中/已結束） |
| `registrationTime` | `event_registration` 表 | 使用者報名時間（僅在用戶報名活動API中） |
| `registrationStatus` | `event_registration` 表 | 使用者報名狀態（僅在用戶報名活動API中） |

## 資料庫約束條件

| 約束條件 | 說明 |
|---------|------|
| `CHECK (individual_or_team IN ('個人', '團體'))` | 限制個人或團體欄位只能為指定值 |
| `NOT NULL` 約束 | 大部分欄位都有 NOT NULL 約束 |
| `DEFAULT` 值 | `individual_or_team` 預設為 '個人'，`valid` 預設為 TRUE，`created_at` 預設為 NOW() |

## PostgreSQL INSERT 回饋格式

### 格式說明
```
INSERT [oid] [count]
```

### 各部分解釋
- **`INSERT`**: 表示執行的操作類型
- **`[oid]`**: Object Identifier，現代 PostgreSQL 版本中通常為 0
- **`[count]`**: 受影響的行數，表示成功插入的記錄數量

### 實際範例
```sql
-- 執行結果: INSERT 0 56
-- 表示: 成功插入 56 筆記錄，OID 為 0（現代 PostgreSQL 標準）
```

### 詳細解析範例
```sql
-- 執行結果:
INSERT 0 56
Query returned successfully in 39 msec.

-- 各部分解釋:
-- 56: 受影響的行數，表示成功插入了 56 筆記錄
-- 為什麼 OID 是 0？
--   • 歷史原因: 在舊版 PostgreSQL 中，OID 用於唯一識別資料庫物件
--   • 現代版本: 從 PostgreSQL 12 開始，預設情況下不再為表分配 OID
--   • 預設值: 當表沒有 OID 時，INSERT 回饋會顯示 0

-- 實際意義：
-- ✅ 成功插入: 56 筆記錄被成功插入到 event_type 表中
-- ✅ 執行時間: 39 毫秒（非常快）
-- ✅ 無錯誤: 所有約束條件都通過了
```

### created_at 欄位自動時間戳記

#### 設計概念
- **欄位定義**: `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- **自動補上**: 當 INSERT 語句中不包含 `created_at` 欄位時，PostgreSQL 會自動使用 `NOW()` 函數填入當前時間
- **避免手動指定**: 不需要在 INSERT 語句中明確提供時間值

#### 最佳實踐
```sql
-- ✅ 推薦: 讓資料庫自動填入時間
INSERT INTO event_type (event_name, event_type, ...) VALUES 
('活動名稱', '活動類型', ...);

-- ❌ 不推薦: 手動指定時間（容易出錯）
INSERT INTO event_type (event_name, event_type, ..., created_at) VALUES 
('活動名稱', '活動類型', ..., '2024-12-01 10:00:00');
```

## API 功能分析

### 1. 主要端點
- `GET /` - 獲取活動列表（支援分頁、篩選、搜尋）
- `GET /filters/types` - 獲取活動類型篩選選項
- `GET /filters/platforms` - 獲取平台篩選選項
- `GET /user/registered` - 獲取使用者報名的活動

### 2. 查詢參數支援
| 參數 | 說明 | 對應資料庫欄位 |
|------|------|---------------|
| `page` | 頁碼 | - |
| `pageSize` | 每頁數量 | - |
| `status` | 活動狀態篩選 | 動態計算 |
| `type` | 活動類型篩選 | `event_type` |
| `platform` | 平台篩選 | `event_platform` |
| `teamType` | 團隊類型篩選 | `individual_or_team` |
| `keyword` | 關鍵字搜尋 | `event_name`, `event_content` |
| `sort` | 排序方式 | `apply_start_time`, `event_start_time` |

### 3. 動態欄位計算
- `current_participants`: 從 `event_registration` 表動態計算
- `event_status`: 根據時間範圍動態計算活動狀態

## 資料一致性檢查

### ✅ 一致的欄位
- 所有主要活動資訊欄位都有對應的 API 回應
- 資料類型轉換正確（如 INTEGER 轉為數字）

### ⚠️ 未使用的資料庫欄位
- `status_id`: 資料庫中有此欄位但 API 未使用
- `valid`: 資料庫中有此欄位但 API 未使用  
- `created_at`: 資料庫中有此欄位但 API 未使用

### 🔍 建議改進
1. **考慮使用 `valid` 欄位**: API 可以加入 `valid` 欄位篩選，只顯示有效的活動
2. **考慮使用 `status_id`**: 如果有多種狀態需求，可以考慮使用此欄位
3. **利用 `created_at` 自動時間戳記**: 資料庫已自動管理建立時間，API 可選擇性回傳此資訊

## 資料庫設計優點
- 欄位命名清晰且一致
- 適當的約束條件確保資料完整性
- 支援多種活動類型和平台
- 自動時間戳記管理（`created_at` 使用 `DEFAULT NOW()`）
- 避免手動時間管理錯誤

## API 設計優點
- 支援豐富的篩選和搜尋功能
- 動態計算活動狀態和參與人數
- 良好的分頁支援
- 清晰的回應格式

---
*此文件建立於: 2025年09月*
*比較檔案: event_type.sql vs events.js*
