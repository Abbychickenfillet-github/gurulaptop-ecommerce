# jsconfig.json 和 tsconfig.json 配置說明

## 問題背景

今天遇到 IDE 警告訊息：
> "To enable project-wide JavaScript/TypeScript language features, exclude large folders with source files that you do not work on."

這個警告是因為 IDE 正在掃描整個專案，包括 `node_modules` 等大型目錄，導致語言服務效能下降。

## jsconfig.json 用途

### 主要功能
1. **路徑別名 (Path Mapping)**
   ```json
   "paths": {
     "@/*": ["./*"]
   }
   ```
   - 設定 `@/` 指向專案根目錄
   - 可以用 `@/components/Button` 取代 `../../../components/Button`

2. **基礎路徑 (Base URL)**
   ```json
   "baseUrl": "."
   ```
   - 設定模組解析的基礎路徑
   - 讓 import 路徑更簡潔

3. **排除目錄 (Exclude)**
   ```json
   "exclude": ["node_modules", "dist", ".next", "build"]
   ```
   - 告訴 IDE 不要掃描這些目錄
   - 提升效能，減少不必要的警告

### 實際效果對比

**沒有 jsconfig.json 時：**
```javascript
import Button from '../../../components/Button'
import { api } from '../../../../services/api'
```

**有 jsconfig.json 後：**
```javascript
import Button from '@/components/Button'
import { api } from '@/services/api'
```

## tsconfig.json 用途

### 主要功能
1. **TypeScript 編譯選項**
   - 指定編譯目標版本
   - 設定模組系統
   - 控制嚴格模式

2. **路徑解析**
   - 與 jsconfig.json 類似的路徑別名功能
   - 支援更複雜的型別解析

3. **專案結構管理**
   - 指定包含/排除的檔案
   - 設定輸出目錄

### 範例配置
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## 與 node_modules 的關係

### 為什麼要排除 node_modules？
1. **效能問題**
   - `node_modules` 通常包含數萬個檔案
   - IDE 掃描這些檔案會消耗大量記憶體和 CPU
   - 導致語言服務變慢

2. **不必要的掃描**
   - 第三方套件已經編譯完成
   - 不需要 IDE 進行語法檢查或自動完成
   - 只會增加負擔

3. **專案範圍限制**
   - 我們只需要掃描自己寫的程式碼
   - 第三方套件有各自的型別定義檔案

## 解決方案

### 1. 在 jsconfig.json 中排除大型目錄
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "exclude": [
    "node_modules",
    "dist",
    ".next",
    "build"
  ]
}
```

### 2. 常見需要排除的目錄
- `node_modules` - 第三方套件
- `dist` - 編譯輸出
- `.next` - Next.js 建置輸出
- `build` - 建置輸出
- `coverage` - 測試覆蓋率報告
- `.git` - Git 版本控制檔案

## 其他好處

1. **更好的 IDE 支援**
   - 自動完成更準確
   - 跳轉定義更快速
   - 錯誤檢查更精確

2. **更快的編譯速度**
   - 減少不必要的檔案掃描
   - 提升開發體驗

3. **更清晰的專案結構**
   - 統一的路徑解析規則
   - 更好的程式碼組織

## 總結

`jsconfig.json` 和 `tsconfig.json` 是現代 JavaScript/TypeScript 專案的重要配置檔案，它們不僅提供路徑別名功能，更重要的是透過排除大型目錄來提升 IDE 效能。正確配置這些檔案可以大幅改善開發體驗。
