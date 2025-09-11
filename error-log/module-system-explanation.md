# 🔍 模組系統解析學習筆記

## 1. 實際的模組系統設定

```json
// backend/package.json
{
  "type": "module",  // ← 實際使用 ES Modules (ESM)
  "engines": {
    "node": ">= 16.0"  // ← Node.js 16+ 支援原生 ESM
  }
}
```

## 2. jsconfig.json 的設定

```json
// backend/jsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",  // ← 這是 IDE 的類型檢查設定
    "paths": {
      "#db-helpers/*": ["./db-helpers/*"]
    }
  }
}
```

## 🤔 為什麼會有這個差異？

### jsconfig.json 中的 "module": "commonjs" 的作用：

1. **IDE 類型檢查**：告訴 VS Code/IDE 如何理解模組語法
2. **不是實際執行環境**：這不影響 Node.js 的實際執行
3. **路徑解析**：幫助 IDE 正確解析路徑別名

### 實際執行環境：
- `package.json` 中的 `"type": "module"` 才是真正決定模組系統的設定
- 你的專案實際使用 **ES Modules (ESM)**

## 🤔 為什麼不寫 "ECMAScript" 或 "JavaScript"？

### 原因分析：

1. **TypeScript/JavaScript 編譯器標準**：
   - `jsconfig.json` 是基於 TypeScript 的 `tsconfig.json` 格式
   - TypeScript 編譯器只認識特定的模組系統名稱
   - 支援的值：`"commonjs"`, `"es2015"`, `"es2020"`, `"esnext"`, `"amd"`, `"umd"`, `"system"`

2. **為什麼選擇 "commonjs"**：
   - **相容性最佳**：CommonJS 是最廣泛支援的模組系統
   - **IDE 支援**：VS Code 對 CommonJS 的支援最完整
   - **路徑解析**：CommonJS 的路徑解析邏輯最穩定
   - **不影響實際執行**：這只是 IDE 的提示，不影響 Node.js 執行

3. **不支援的值**：
   - `"ECMAScript"` ❌ - 不是有效的模組系統名稱
   - `"JavaScript"` ❌ - 不是有效的模組系統名稱
   - `"ESM"` ❌ - 不是有效的模組系統名稱（雖然 ESM 是 ECMAScript Modules 的簡稱，但在 jsconfig.json 中不是有效的值）

### 正確的 ESM 設定方式：

如果要讓 IDE 知道你在使用 ESM，應該這樣設定：

```json
{
  "compilerOptions": {
    "module": "es2020",  // 或 "esnext"
    "target": "es2020",
    "moduleResolution": "node"
  }
}
```

## 📋 總結

- **package.json**：決定實際執行環境的模組系統
- **jsconfig.json**：決定 IDE 如何理解和提示程式碼
- **"module": "commonjs"**：讓 IDE 使用最穩定的模組解析邏輯
- **不影響實際執行**：Node.js 仍然使用 ES Modules

## 🔗 相關資源

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [VS Code jsconfig.json](https://code.visualstudio.com/docs/languages/javascript#_javascript-projects-jsconfigjson)

## 📝 映射 (Path Mapping)

### 路徑別名映射原理：

```json
{
  "compilerOptions": {
    "paths": {
      "#services/*": "./services/*"
    }
  }
}
```

### 星號 (*) 的作用：

1. **通配符 (Wildcard)**：
   - `*` 代表「全部」或「任何」
   - 可以匹配任何檔案名稱或路徑

2. **映射規則**：
   - `#services/*` → `./services/*`
   - `*` 部分會被替換為實際的檔案路徑

3. **實際例子**：
   ```javascript
   // 這些 import 語句：
   import { UserService } from '#services/user.js'
   import { AuthService } from '#services/auth.js'
   import { EmailService } from '#services/email/email.js'
   
   // 會被映射為：
   import { UserService } from './services/user.js'
   import { AuthService } from './services/auth.js'
   import { EmailService } from './services/email/email.js'
   ```

4. **映射的好處**：
   - **簡化路徑**：避免使用 `../../../services/user.js`
   - **重構友善**：移動檔案時只需修改映射配置
   - **可讀性**：路徑更清晰易懂
   - **一致性**：整個專案使用相同的路徑別名

### 完整的映射配置範例：

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "##/*": ["./*"],           // 根目錄映射
      "#configs/*": ["./configs/*"],     // 配置檔案
      "#data/*": ["./data/*"],           // 資料檔案
      "#db-helpers/*": ["./db-helpers/*"], // 資料庫輔助函數
      "#middlewares/*": ["./middlewares/*"], // 中間件
      "#services/*": ["./services/*"],     // 服務層
      "#utils/*": ["./utils/*"]           // 工具函數
    }
  }
}
```
