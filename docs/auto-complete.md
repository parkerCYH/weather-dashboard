# Future Ideas / Backlog（城市搜尋與定位系統）

> 目的：
>
> * 把「現在不做、但確定有價值」的想法收斂起來
> * 降低當前 MVP 的認知負擔
> * 未來要做時，可以直接照此文件展開

---

## 一、城市搜尋 Autocomplete（Typeahead Search）

### 🎯 問題要解決

* 使用者不想每次都輸入完整城市名稱
* 同名城市過多，需要在「搜尋階段」就完成消歧義
* 降低第三方 Geocoding API 成本與延遲

### 🧠 核心原則

* UX 簡單（單一輸入框）
* Backend 資料一定要完整（國家 / 行政區 / 座標）
* 只在「必要時」才打第三方 API

---

### 1.1 Autocomplete 整體流程（目標設計）

```
User typing
  ↓ (debounce 300~500ms)
Autocomplete API
  ↓
Local search index
  ↓
不足 → External autocomplete API
  ↓
Merge + Rank
  ↓
Return suggestions
```

### 1.2 API 設計（預期）

#### Autocomplete

```
GET /api/geo/autocomplete?q=tai
```

Response（僅用於顯示）：

```json
[
  {
    "display": "Taipei, Taiwan",
    "city": "Taipei",
    "admin": "Taipei City",
    "country": "TW",
    "source": "local | external"
  }
]
```

#### Resolve（點擊後）

```
POST /api/geo/resolve
```

```json
{
  "city": "Taipei",
  "admin": "Taipei City",
  "country": "TW"
}
```

---

### 1.3 Local Search Index（未來 DB）

用途：

* 專門給 autocomplete 用
* 不保證一定有座標

```sql
geo_search_index
- id
- city_name
- admin_area
- country_code
- display_name
- popularity_score
- created_at
```

---

## 二、Geocoding / Resolve 優化（Lazy Strategy）

### 🎯 問題要解決

* 不常用城市不應該浪費 API 成本
* Autocomplete 不等於需要座標

### 🧠 策略

| 情境              | 行為        |
| --------------- | --------- |
| Autocomplete 出現 | 不查座標      |
| 使用者點擊           | 才 resolve |
| 第一次點擊           | 查第三方 API  |
| 第二次             | DB cache  |

---

### 2.1 Resolve 資料表（未來）

```sql
geo_locations
- id
- city_name
- admin_area
- country_code
- latitude
- longitude
- provider
- provider_place_id
- raw_response
- updated_at
```

---

## 三、第三方 API 使用策略

### 🎯 目標

* 控制成本
* 降低 rate limit 風險
* 保證資料正確性

### 3.1 呼叫條件（預期）

* query.length >= 3
* local results < 5
* 使用者輸入暫停（>300ms）
* 同 query 在短時間內未查過

---

### 3.2 Provider 策略

優先順序：

1. Nominatim (free)
2. OpenCage / PositionStack
3. Google Maps（fallback）

---

## 四、Ranking / Disambiguation（像 iPhone 一樣）

### 🎯 問題

* 同名城市太多
* 使用者不想思考

### 4.1 排序因子（未來）

| 因子       | 說明               |
| -------- | ---------------- |
| 使用者所在國家  | locale / IP      |
| 人口 / 熱門度 | popularity_score |
| 歷史使用     | user click log   |
| 語言匹配     | zh-TW / en       |

---

## 五、使用者行為紀錄（支援未來決策）

### 🎯 為什麼要記錄

* 不靠直覺決定要不要做 autocomplete
* 找出真正熱門城市

### 5.1 Log 資料（未來）

```sql
geo_query_logs
- query
- result_count
- source (local/external)
- clicked_city
- created_at
```

---

## 六、產品決策原則（重要）

### 🚦 什麼時候才做這些功能？

只在以下條件成立時：

* 使用者量上升
* API 成本顯著
* 搜尋行為集中於 autocomplete

否則：

> **保持 MVP，別過度工程化**

---

## 七、刻意不做的事（現在）

* ❌ 全世界城市一次性匯入
* ❌ 複雜 fuzzy search
* ❌ 多語言地名 alias
* ❌ GIS 空間計算

---

## 八、備註

> 這份文件的存在意義：
>
> * 讓未來的自己知道：
>   「這些不是忘了，而是刻意不做」
