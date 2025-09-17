# 疏忽與問題記錄 + Nav-center 佈局問題

## 1. Express.json() 參數設定解釋

### 問題背景
用戶詢問 `express.json()` 中參數設定的原因：

```javascript
app.use(express.json({ 
  limit: '20mb' , // 限制請求體的大小為20MB
  strict: true,         // 只接受 array 和 object
  type: 'application/json'  // 只處理這種 Content-Type
}))
```

### 參數設定原因

#### 1. `limit: '20mb'` - 請求體大小限制
**原因：**
- **防止攻擊**：避免惡意用戶發送超大請求體導致服務器內存溢出
- **資源保護**：限制單個請求的數據量，保護服務器資源
- **性能優化**：避免處理過大的 JSON 數據影響性能

**實際場景：**
```javascript
// 用戶上傳大量數據時
const largeData = {
  images: [...], // 大量圖片數據
  documents: [...], // 大量文檔
  // 如果沒有 limit，可能導致服務器崩潰
}
```

#### 2. `strict: true` - 嚴格模式
**原因：**
- **數據安全**：只接受有效的 JSON 格式（array 或 object）
- **防止錯誤**：避免解析無效的 JSON 字符串
- **類型安全**：確保 `req.body` 是預期的數據類型

**對比：**
```javascript
// strict: true (推薦)
JSON.parse('{"name": "John"}') // ✅ 有效
JSON.parse('"invalid"')        // ❌ 拋出錯誤

// strict: false (不推薦)
JSON.parse('"invalid"')        // ✅ 返回字符串，但可能造成邏輯錯誤
```

#### 3. `type: 'application/json'` - Content-Type 限制
**原因：**
- **安全防護**：只處理明確標記為 JSON 的請求
- **避免混淆**：防止其他格式的數據被誤解析為 JSON
- **標準化**：遵循 HTTP 標準，只處理正確的 Content-Type

**實際效果：**
```javascript
// ✅ 會被處理
fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password })
})

// ❌ 不會被處理
fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain'
  },
  body: 'some text'
})
```

## 2. 疏忽與錯誤記錄

### 疏忽 1：重複的 express.json() 設定
**問題：** 在 `app.js` 中有兩個 `express.json()` 設定
```javascript
// 第一個（簡化版）
app.use(express.json()) // 中間件2

// 第二個（詳細配置版）
app.use(express.json({ 
  limit: '20mb',
  strict: true,
  type: 'application/json'
}))
```

**解決：** 移除重複設定，只保留配置完整的版本

### 疏忽 2：誤以為 express.json() 被刪除
**問題：** 用戶擔心 `express.json()` 被刪除會影響登入功能
**實際：** `express.json()` 一直存在，只是有重複設定

### 疏忽 3：Hydration 錯誤與後端配置混淆
**問題：** 用戶遇到 Next.js Hydration 錯誤，以為與後端 `express.json()` 有關
**實際：** Hydration 錯誤是前端問題，與後端配置無關

## 3. Hydration 錯誤說明

### 錯誤類型
```
Runtime Error
Hydration failed because the initial UI does not match what was rendered on the server.
```

### 原因
1. **服務器端和客戶端渲染不一致**
2. **動態內容在服務器端和客戶端不同**
3. **時間相關的內容（如 `new Date()`）**
4. **條件渲染邏輯問題**

### 解決方案
```javascript
// 使用 useEffect 處理客戶端專用邏輯
useEffect(() => {
  // 只在客戶端執行的代碼
}, [])

// 使用動態導入避免 SSR
import dynamic from 'next/dynamic'
const ClientOnlyComponent = dynamic(() => import('./Component'), {
  ssr: false
})

// 檢查是否在客戶端
if (typeof window !== 'undefined') {
  // 客戶端專用代碼
}
```

## 4. Nav-center 佈局問題

### 問題描述
用戶發現 nav-center 有兩列，希望電腦版保持原本的間距。

### 可能的原因
1. **CSS 樣式被覆蓋**
2. **響應式設計問題**
3. **之前的重構影響了佈局**

### 需要檢查的地方
1. **CSS 文件**：檢查 `.nav-center` 的樣式設定
2. **響應式斷點**：確認媒體查詢設定
3. **Flexbox 設定**：檢查容器的 flex 屬性

### 問題根源與修復
**真正問題根源：** 桌面版還在使用 `nav-center-right` 容器，導致導航選項和登入/註冊按鈕擠在一起

**發現過程：**
1. 手機版 (122-208行)：正確的結構
2. 桌面版 (210-284行)：錯誤地使用了 `nav-center-right` 容器

**最終正確修復方案：** 移除 `nav-center-right` 容器，直接使用 `nav-center` 和 `nav-right`

```javascript
/* 錯誤的桌面版結構（導致擠在一起） */
<div className="nav-container">
  <div className="nav-left">
    {/* Logo */}
  </div>
  <div className="nav-center-right">  // ← 問題在這裡！
    <div className="nav-center">
      {/* 導航選項 */}
    </div>
    <div className="nav-right">
      {/* 登入/註冊按鈕 */}
    </div>
  </div>
</div>

/* 正確的桌面版結構（左中右分佈） */
<div className="nav-container">
  <div className="nav-left">
    {/* Logo */}
  </div>
  <div className="nav-center">        // ← 直接使用，沒有額外容器
    {/* 導航選項 */}
  </div>
  <div className="nav-right">         // ← 直接使用，沒有額外容器
    {/* 登入/註冊按鈕 */}
  </div>
</div>
```

**CSS 設定保持不變：**
```css
.nav-container {
  display: grid;
  grid-template-columns: auto 1fr auto; /* 左中右三列 */
  align-items: center;
}

.nav-left {
  justify-self: start;        /* Logo 靠左 */
}

.nav-center {
  justify-self: center;       /* 導航選項真正居中 */
  display: flex;
  gap: 3rem;
}

.nav-right {
  justify-self: end;          /* 登入/註冊按鈕靠右 */
  display: flex;
  align-items: center;
  gap: 1rem;
}
```

**修復結果：**
- ✅ Logo 在左側（`justify-self: start`）
- ✅ 導航選項真正居中（`justify-self: center`）
- ✅ 登入/註冊按鈕在右側（`justify-self: end`）
- ✅ 所有元素垂直對齊（`align-items: center`）
- ✅ 真正的左中右分佈，不會擠在一起
- ✅ 中間列自動調整寬度（`1fr`）

## 5. Git 提交問題

### 問題
用戶擔心之前的改動被覆蓋並已經提交到 Git。

### 解決方案
```bash
# 檢查最近的提交
git log --oneline -5

# 檢查當前狀態
git status

# 如果需要回滾
git reset --soft HEAD~1  # 回滾最後一次提交，保留更改
git reset --hard HEAD~1  # 完全回滾最後一次提交

# 重新提交
git add .
git commit -m "fix: 修復 nav-center 佈局問題"
git push origin main
```

## 總結

### Express.json() 設定
- ✅ **安全性**：防止攻擊和資源濫用
- ✅ **穩定性**：確保數據格式正確
- ✅ **性能**：限制請求大小
- ✅ **標準化**：遵循 HTTP 標準

### 需要解決的問題
1. **Nav-center 佈局**：檢查 CSS 樣式設定
2. **Hydration 錯誤**：在前端代碼中解決
3. **Git 狀態**：確認提交狀態並修復佈局問題

---

*記錄時間：2024年12月19日*
*討論主題：Express 配置、疏忽記錄與佈局問題*
