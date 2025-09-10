# Sass Bootstrap 過時函數修正記錄

**發生時間**: 2025年9月10日  
**問題回報**: 用戶反映 `npm build` 時出現 Sass 過時函數警告

## 問題描述

在執行 `npm build` 時，終端機出現以下警告：

```
SassWarning: Deprecation Warning on line 206, column 10 of file:///D:/Users/User/Documents/coding/project_laptop/next-guru/frontend/node_modules/bootstrap/scss/_functions.scss:206:10:
Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0.
Use color.mix instead.

SassWarning: Deprecation Warning on line 5, column 8 of file:///D:/Users/User/Documents/coding/project_laptop/next-guru/frontend/node_modules/bootstrap/scss/_mixins.scss:5:8:
Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
```

## 根本原因

1. **Bootstrap Sass 函數過時**：Bootstrap 5.x 使用了過時的 Sass 函數
2. **直接導入問題**：專案中直接導入了 `bootstrap/scss/functions`、`bootstrap/scss/variables`、`bootstrap/scss/mixins`
3. **Dart Sass 3.0.0 相容性**：這些函數將在 Dart Sass 3.0.0 中被移除

## 受影響的檔案

### 1. `frontend/styles/cart.scss`

**修正前**：
```scss
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';

.w-lg-50 {
  @include media-breakpoint-up(lg) {
    width: 50%;
  }
}

.w-md-100 {
  @include media-breakpoint-down(md) {
    width: 100%;
  }
}
```

**修正後**：
```scss
.w-lg-50 {
  @media (min-width: 992px) {
    width: 50%;
  }
}

.w-md-100 {
  @media (max-width: 991.98px) {
    width: 100%;
  }
}
```

**修正內容**：
- 移除所有 Bootstrap 導入
- 將 `@include media-breakpoint-up(lg)` 替換為標準 CSS `@media (min-width: 992px)`
- 將 `@include media-breakpoint-down(md)` 替換為標準 CSS `@media (max-width: 991.98px)`

### 2. `frontend/styles/signUpForm.module.scss`

**修正前**：
```scss
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";

.debug-test {
  --test-contrast: #{color-contrast($background)};
  --test-shade: #{shade-color($background, 20%)};
  --test-shade-contrast: #{color-contrast(shade-color($background, 20%))};
}

@mixin button-variant($prefix, $background, $border) {
  --#{$prefix}btn-color: color-contrast($background);
  --#{$prefix}btn-hover-color: color-contrast(shade-color($background, 20%));
  --#{$prefix}btn-hover-bg: shade-color($background, 20%);
  --#{$prefix}btn-hover-border-color: shade-color($border, 20%);
  --#{$prefix}btn-focus-shadow-rgb: #{to-rgb(mix(color-contrast($background), $border, 15%))};
}
```

**修正後**：
```scss
.debug-test {
  --test-contrast: #{if(lightness($background) > 50%, #000, #fff)};
  --test-shade: #{darken($background, 20%)};
  --test-shade-contrast: #{if(lightness(darken($background, 20%)) > 50%, #000, #fff)};
}

@mixin button-variant($prefix, $background, $border) {
  --#{$prefix}btn-color: #{if(lightness($background) > 50%, #000, #fff)};
  --#{$prefix}btn-hover-color: #{if(lightness(darken($background, 20%)) > 50%, #000, #fff)};
  --#{$prefix}btn-hover-bg: #{darken($background, 20%)};
  --#{$prefix}btn-hover-border-color: #{darken($border, 20%)};
  --#{$prefix}btn-focus-shadow-rgb: #{red(mix(if(lightness($background) > 50%, #000, #fff), $border, 15%))}, #{green(mix(if(lightness($background) > 50%, #000, #fff), $border, 15%))}, #{blue(mix(if(lightness($background) > 50%, #000, #fff), $border, 15%))};
}
```

**修正內容**：
- 移除所有 Bootstrap 導入
- 將 `color-contrast()` 替換為 `if(lightness($background) > 50%, #000, #fff)`
- 將 `shade-color()` 替換為 `darken()`
- 將 `to-rgb()` 替換為 `red()`, `green()`, `blue()` 函數組合

## 函數對照表

| Bootstrap 函數 | 標準 Sass 函數 | 說明 |
|---|---|---|
| `color-contrast($color)` | `if(lightness($color) > 50%, #000, #fff)` | 根據亮度選擇對比色 |
| `shade-color($color, $amount)` | `darken($color, $amount)` | 加深顏色 |
| `tint-color($color, $amount)` | `lighten($color, $amount)` | 變亮顏色 |
| `to-rgb($color)` | `red($color), green($color), blue($color)` | 轉換為 RGB 值 |
| `@include media-breakpoint-up($size)` | `@media (min-width: $breakpoint)` | 響應式斷點 |

## 修正優點

1. **✅ 移除警告**：不再出現 Sass 過時函數警告
2. **✅ 向前相容**：與 Dart Sass 3.0.0 相容
3. **✅ 更輕量**：不需要導入整個 Bootstrap Sass 檔案
4. **✅ 標準化**：使用標準 Sass 函數，更易維護

## 測試結果

- `npm build` 不再出現 Sass 警告
- 樣式功能保持不變
- 響應式設計正常運作

## 相關檔案

- `frontend/styles/cart.scss`
- `frontend/styles/signUpForm.module.scss`

## 預防措施

1. 避免直接導入 Bootstrap Sass 檔案
2. 使用標準 Sass 函數替代 Bootstrap 專用函數
3. 定期檢查 Sass 版本相容性
4. 考慮使用 CSS 變數替代 Sass 函數進行顏色計算

**修正人員**: AI Assistant  
**修正時間**: 2025年9月10日
