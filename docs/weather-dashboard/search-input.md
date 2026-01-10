### 1️⃣ 使用 Nominatim 第三方 API 搜尋

* API 範例：

```text
https://nominatim.openstreetmap.org/search?q=Taipei&format=json&limit=5
```

* 功能：

  * 文字搜尋 → 候選地名 + lat/lon
  * JSON 回傳中 **必存欄位**：

    * `osm_type` / `osm_id`
    * `name`
    * `class` / `type`
    * `lat` / `lon`
    * `source`（標記 Nominatim）

---

### 2️⃣ 回傳值存入資料庫

* 使用 Prisma `Place` model
* **必存欄位**：

| JSON 欄位  | Prisma 欄位 |
| -------- | --------- |
| osm_id   | osmId     |
| osm_type | osmType   |
| name     | name      |
| class    | class     |
| type     | type      |
| lat      | lat       |
| lon      | lon       |
| source   | source    |

---

### 3️⃣ 搜尋流程

1. 使用者輸入文字 → **先查 DB**
2. **DB 有結果** → 顯示結果
3. **DB 無結果** → 不自動查 Nominatim
4. 顯示一個「查詢更多」按鈕
5. 使用者點擊按鈕 → 呼叫 Nominatim API → 顯示候選結果
6. 使用者確認 → **存入 DB**（只存必存欄位）

---

### 4️⃣ 儲存策略

* **不馬上存入 DB**
* 只有使用者確認後才寫入 DB
* 保持 DB 精簡、清爽

---

### 5️⃣ Prisma Schema (精簡版)

```prisma
model Place {
  id        BigInt   @id @default(autoincrement()) // DB 自增主鍵
  osmType   String   // node / way / relation
  osmId     BigInt   // OSM 原始 ID
  name      String   // 簡單名稱
  class     String   // 類別，例如 boundary / amenity
  type      String   // 細分類，例如 administrative / cafe
  lat       Float    // 中心點經度
  lon       Float    // 中心點緯度
  source    String   // 來源，例如 "Nominatim"

  @@map("places")
  @@index([osmType, osmId], name: "idx_osm")
  @@index([name], name: "idx_name")
}
```

---

### 6️⃣ MVP 搜尋 / 儲存流程總結

1. 使用者輸入文字 → 查 DB
2. DB 有結果 → 顯示
3. DB 無結果 → 顯示「查詢更多」按鈕
4. 點擊按鈕 → 呼叫 Nominatim
5. 顯示結果 → 使用者確認
6. 存入 DB → **只存必存欄位**
 