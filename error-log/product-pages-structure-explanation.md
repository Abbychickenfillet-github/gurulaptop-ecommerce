# Product Pages 結構說明

**建立時間**: 2025年9月10日  
**目的**: 解釋 `pages/product` 目錄下各檔案的作用和設計理念

## 📁 檔案結構

```
frontend/pages/product/
├── index.js      # 產品首頁（重定向頁面）
├── list.js       # 產品列表頁面
├── [pid].js      # 產品詳情頁面（動態路由）
└── compare.js    # 產品比較頁面
```

## 📄 各檔案詳細說明

### 1. `index.js` - 產品首頁（重定向頁面）

**作用**: 當用戶訪問 `/product` 時，自動重定向到 `/product/list`

**程式碼**:
```javascript
import { useRouter } from 'next/router'

// 只作導向到 product/list
export default function ProductIndex() {
  const router = useRouter()

  // 確認window(瀏覽器)開始運作
  if (typeof window !== 'undefined') {
    router.push('/product/list')
  }

  return <></>
}
```

**為什麼這麼簡略**:
- **SEO 考量**: 保持 URL 結構清晰（`/product` → `/product/list`）
- **用戶體驗**: 避免重複內容，統一產品列表的 URL
- **維護性**: 如果未來要改變產品首頁的邏輯，只需要修改重定向
- **Next.js 慣例**: `index.js` 通常作為該路由的入口點

**為什麼不直接把 list 的內容貼到 index.js**:
1. **URL 語義化**: `/product/list` 比 `/product` 更明確表達這是列表頁面
2. **未來擴展性**: 可能需要在 `/product` 顯示不同的內容（如推薦產品、分類導航等）
3. **程式碼組織**: 保持檔案職責單一，`index.js` 負責路由，`list.js` 負責列表邏輯
4. **SEO 優化**: 搜尋引擎更容易理解頁面內容

### 2. `list.js` - 產品列表頁面

**作用**: 顯示所有產品的列表，包含篩選、搜尋、分頁功能

**URL**: `/product/list`

**主要功能**:
- 產品網格/列表顯示
- 品牌、價格、規格篩選
- 搜尋功能
- 分頁導航
- 排序選項

**樣式**: 使用 `product.module.scss` (CSS Modules)

### 3. `[pid].js` - 產品詳情頁面（動態路由）

**作用**: 顯示單一產品的詳細資訊

**URL**: `/product/123`（其中 123 是產品 ID）

**主要功能**:
- 產品圖片輪播
- 產品詳細規格
- 價格和購買選項
- 相關產品推薦
- 產品比較功能

**樣式**: 使用 `product-lease.module.scss` (CSS Modules)

**動態路由說明**:
- `[pid]` 是 Next.js 的動態路由語法
- `pid` 是參數名稱，可以通過 `router.query.pid` 取得
- 支援任何產品 ID，如 `/product/275`、`/product/abc123` 等

### 4. `compare.js` - 產品比較頁面

**作用**: 讓用戶比較多個產品的規格

**URL**: `/product/compare`

**主要功能**:
- 多產品並排比較
- 規格對照表
- 價格比較
- 優缺點分析

## 🔄 頁面流程

```
用戶訪問 /product
        ↓
    index.js 重定向
        ↓
    /product/list
        ↓
    用戶點擊產品
        ↓
    /product/[pid]
        ↓
    用戶選擇比較
        ↓
    /product/compare
```

## 🎯 設計理念

### 1. **單一職責原則**
每個檔案負責一個特定功能，便於維護和測試。

### 2. **URL 語義化**
- `/product` - 產品入口
- `/product/list` - 產品列表
- `/product/123` - 特定產品
- `/product/compare` - 產品比較

### 3. **用戶體驗優化**
- 自動重定向避免 404 錯誤
- 清晰的導航結構
- 一致的頁面佈局

### 4. **SEO 友善**
- 有意義的 URL 結構
- 每個頁面都有明確的內容定位
- 支援動態路由的產品頁面

## 📱 響應式設計

所有產品頁面都支援響應式設計：
- **桌面版**: 完整功能，多欄佈局
- **平板版**: 適配中等螢幕，調整間距
- **手機版**: 單欄佈局，優化觸控操作

## 🔧 技術特點

- **Next.js 動態路由**: 支援無限產品頁面
- **CSS Modules**: 避免樣式衝突
- **React Hooks**: 現代化狀態管理
- **圖片優化**: Next.js Image 組件
- **SEO 優化**: 動態 meta 標籤

## 📊 效能考量

- **程式碼分割**: 每個頁面獨立載入
- **圖片懶載入**: 提升載入速度
- **快取策略**: 優化重複訪問
- **Bundle 優化**: 最小化 JavaScript 大小

**建立人員**: AI Assistant  
**建立時間**: 2025年9月10日
