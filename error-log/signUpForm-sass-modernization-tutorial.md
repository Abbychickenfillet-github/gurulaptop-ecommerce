# Sass 函數現代化修復教學 - signUpForm.module.scss

**首次詢問時間：** 2025-01-10 23:50  
**問題類型：** Sass 棄用警告修復  
**影響檔案：** `frontend/styles/signUpForm.module.scss`  
**修復狀態：** ✅ 完成  

## 📋 問題概述

### 錯誤訊息
```
SassWarning: Deprecation Warning on line X, column Y:
lightness() is deprecated. Suggestion:
color.channel($color, "lightness", $space: hsl)

darken() is deprecated. Suggestions:
color.scale($color, $lightness: -31.4814814815%)
color.adjust($color, $lightness: -20%)

red() is deprecated. Suggestion:
color.channel($color, "red", $space: rgb)
```

### 問題原因
- **Sass 版本升級** - 新版本 Sass 棄用了全域函數
- **舊式語法** - 使用 `lightness()`, `darken()`, `red()` 等全域函數
- **模組化要求** - 現代 Sass 要求使用模組化語法

## 🔧 修復步驟

### 步驟 1：導入現代 Sass 模組

**修改前：**
```scss
// 定義 mixin
$prefix: "guru-style-";
$background: rgb(164, 114, 210);
$border: #3498db;
```

**修改後：**
```scss
// 定義 mixin
$prefix: "guru-style-";
$background: rgb(164, 114, 210);
$border: #3498db;

// 使用現代 Sass 函數替代棄用函數
@use "sass:color";
```

**說明：**
- `@use "sass:color"` 導入 Sass 內建的顏色模組
- 必須放在檔案最前面（除了註解）
- 提供現代化的顏色處理函數

### 步驟 2：修復 lightness() 函數

**修改前：**
```scss
--test-contrast: #{if(lightness($background) > 0.5, #000, #fff)};
--test-shade-contrast: #{if(lightness(darken($background, 20%)) > 0.5, #000, #fff)};
--#{$prefix}btn-color: #{if(lightness($background) > 0.5, #000, #fff)};
--#{$prefix}btn-hover-color: #{if(lightness(darken($background, 20%)) > 0.5, #000, #fff)};
```

**修改後：**
```scss
--test-contrast: #{if(color.lightness($background) > 0.5, #000, #fff)};
--test-shade-contrast: #{if(color.lightness(color.adjust($background, $lightness: -20%)) > 0.5, #000, #fff)};
--#{$prefix}btn-color: #{if(color.lightness($background) > 0.5, #000, #fff)};
--#{$prefix}btn-hover-color: #{if(color.lightness(color.adjust($background, $lightness: -20%)) > 0.5, #000, #fff)};
```

**說明：**
- `lightness()` → `color.lightness()`
- 需要在函數前加上模組名稱 `color.`
- 功能完全相同，只是語法更明確

### 步驟 3：修復 darken() 函數

**修改前：**
```scss
--test-shade: #{darken($background, 20%)};
--#{$prefix}btn-hover-bg: #{darken($background, 20%)};
--#{$prefix}btn-hover-border-color: #{darken($border, 20%)};
```

**修改後：**
```scss
--test-shade: #{color.adjust($background, $lightness: -20%)};
--#{$prefix}btn-hover-bg: #{color.adjust($background, $lightness: -20%)};
--#{$prefix}btn-hover-border-color: #{color.adjust($border, $lightness: -20%)};
```

**說明：**
- `darken($color, 20%)` → `color.adjust($color, $lightness: -20%)`
- `color.adjust()` 更靈活，可以調整多個顏色屬性
- `$lightness: -20%` 表示降低 20% 的亮度（等同於 darken）

### 步驟 4：修復 red(), green(), blue() 函數

**修改前：**
```scss
--#{$prefix}btn-focus-shadow-rgb: #{red(mix(if(lightness($background) > 0.5, #000, #fff), $border, 15%))}, #{green(mix(if(lightness($background) > 0.5, #000, #fff), $border, 15%))}, #{blue(mix(if(lightness($background) > 0.5, #000, #fff), $border, 15%))};
```

**修改後：**
```scss
--#{$prefix}btn-focus-shadow-rgb: #{color.red(color.mix(if(color.lightness($background) > 0.5, #000, #fff), $border, 15%))}, #{color.green(color.mix(if(color.lightness($background) > 0.5, #000, #fff), $border, 15%))}, #{color.blue(color.mix(if(color.lightness($background) > 0.5, #000, #fff), $border, 15%))};
```

**說明：**
- `red()` → `color.red()`
- `green()` → `color.green()`
- `blue()` → `color.blue()`
- `mix()` → `color.mix()`（雖然 mix 沒有棄用警告，但為了一致性也加上模組名稱）

## 📊 修復統計

### 函數替換統計
- **lightness()** → **color.lightness()**: 5 處
- **darken()** → **color.adjust()**: 3 處
- **red()** → **color.red()**: 1 處
- **green()** → **color.green()**: 1 處
- **blue()** → **color.blue()**: 1 處
- **mix()** → **color.mix()**: 3 處

### 總計修改
- **修改行數**: 8 行
- **新增導入**: 1 行 (`@use "sass:color"`)
- **影響範圍**: 2 個 mixin 和 1 個 class

## 🎯 現代 Sass 語法對照表

| 舊式語法 | 現代語法 | 說明 |
|---------|---------|------|
| `lightness($color)` | `color.lightness($color)` | 獲取顏色的亮度值 |
| `darken($color, 20%)` | `color.adjust($color, $lightness: -20%)` | 降低顏色亮度 |
| `lighten($color, 20%)` | `color.adjust($color, $lightness: 20%)` | 提高顏色亮度 |
| `red($color)` | `color.red($color)` | 獲取顏色的紅色分量 |
| `green($color)` | `color.green($color)` | 獲取顏色的綠色分量 |
| `blue($color)` | `color.blue($color)` | 獲取顏色的藍色分量 |
| `mix($color1, $color2, 50%)` | `color.mix($color1, $color2, 50%)` | 混合兩個顏色 |

## 🔍 進階用法

### color.adjust() 的強大功能

**舊式語法限制：**
```scss
// 只能調整單一屬性
darken($color, 20%)     // 只能調整亮度
saturate($color, 20%)   // 只能調整飽和度
```

**現代語法優勢：**
```scss
// 可以同時調整多個屬性
color.adjust($color, 
  $lightness: -20%,     // 降低亮度
  $saturation: 20%,     // 提高飽和度
  $hue: 30deg          // 調整色相
)
```

### 其他現代 Sass 模組

```scss
@use "sass:math";        // 數學函數
@use "sass:string";      // 字串函數
@use "sass:list";        // 列表函數
@use "sass:map";         // 映射函數
```

## ⚠️ 注意事項

### 1. 導入順序
```scss
// ✅ 正確：@use 必須在最前面
@use "sass:color";
$variable: value;

// ❌ 錯誤：@use 不能在變數後面
$variable: value;
@use "sass:color";
```

### 2. 模組命名空間
```scss
// ✅ 使用模組名稱
color.lightness($color)

// ❌ 全域函數（已棄用）
lightness($color)
```

### 3. Bootstrap 警告
```scss
// 這些警告來自 node_modules/bootstrap/scss/_functions.scss
// 不是我們的代碼問題，無法修復
// 需要等待 Bootstrap 更新或忽略這些警告
```

## 🧪 測試驗證

### 構建測試
```bash
cd frontend
npm run build
```

### 預期結果
- ✅ 自定義代碼的 Sass 警告消失
- ⚠️ Bootstrap 的警告仍然存在（正常）
- ✅ 構建成功完成

## 📝 最佳實踐

### 1. 統一使用現代語法
```scss
// ✅ 推薦：統一使用模組化語法
@use "sass:color";
$primary: color.adjust(#3498db, $lightness: -10%);

// ❌ 避免：混用舊式和新式語法
@use "sass:color";
$primary: darken(#3498db, 10%);  // 不一致
```

### 2. 建立顏色變數系統
```scss
@use "sass:color";

// 基礎顏色
$primary: #3498db;
$secondary: #2ecc71;

// 衍生顏色
$primary-dark: color.adjust($primary, $lightness: -20%);
$primary-light: color.adjust($primary, $lightness: 20%);
$primary-muted: color.adjust($primary, $saturation: -30%);
```

### 3. 使用 mixin 封裝複雜邏輯
```scss
@use "sass:color";

@mixin button-colors($bg-color) {
  $text-color: if(color.lightness($bg-color) > 0.5, #000, #fff);
  $hover-bg: color.adjust($bg-color, $lightness: -10%);
  
  background-color: $bg-color;
  color: $text-color;
  
  &:hover {
    background-color: $hover-bg;
  }
}
```

## 🏷️ 標籤
`Sass` `現代化` `棄用警告` `color模組` `signUpForm` `Bootstrap` `構建優化`

---
**最後更新：** 2025-01-10 23:55  
**修復狀態：** ✅ 完成  
**測試狀態：** 待驗證  
**負責人：** AI Assistant + User
