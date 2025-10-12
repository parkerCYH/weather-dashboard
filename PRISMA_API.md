# Prisma 數據庫 API 使用指南

## 概述

本專案使用 Prisma ORM 和 SQLite 數據庫來管理國家、城市和座標數據，替代了原本的 mock data。

## 數據庫結構

### Models

1. **Country** (國家)
   - `id`: 主鍵
   - `code`: 國家代碼 (例如: "CN", "US")
   - `name`: 國家名稱
   - `cities`: 關聯的城市

2. **City** (城市)
   - `id`: 主鍵
   - `code`: 城市代碼 (例如: "BJ", "NYC")
   - `name`: 城市名稱
   - `countryId`: 外鍵關聯到國家
   - `coordinates`: 關聯的座標

3. **Coordinates** (座標)
   - `id`: 主鍵
   - `cityId`: 外鍵關聯到城市
   - `latitude`: 緯度
   - `longitude`: 經度

## 可用的 API Endpoints

### 1. 獲取所有國家
```
GET /api/countries
```

回應範例：
```json
[
  { "id": 1, "code": "CN", "name": "China" },
  { "id": 2, "code": "US", "name": "United States" }
]
```

### 2. 獲取特定國家的城市列表
```
GET /api/countries/[countryCode]/cities
```

範例：`GET /api/countries/CN/cities`

回應範例：
```json
[
  { "id": 1, "code": "BJ", "name": "Beijing", "countryId": 1 },
  { "id": 2, "code": "SH", "name": "Shanghai", "countryId": 1 }
]
```

### 3. 獲取城市座標
```
GET /api/countries/[countryCode]/cities/[cityCode]/coordinates
```

範例：`GET /api/countries/CN/cities/BJ/coordinates`

回應範例：
```json
{
  "cityCode": "BJ",
  "cityName": "Beijing",
  "countryCode": "CN",
  "countryName": "China",
  "latitude": 39.9042,
  "longitude": 116.4074
}
```

## 在代碼中使用

### Client Components (使用 API Routes)

```typescript
import { getAllCountries, getCitiesByCountry, getCoordinates } from '@/lib/api';

// 獲取所有國家
const countries = await getAllCountries();

// 獲取中國的城市
const cities = await getCitiesByCountry('CN');

// 獲取北京的座標
const coords = await getCoordinates('CN', 'BJ');
```

### Server Components (直接使用 Prisma)

```typescript
import { getAllCountries, getCitiesByCountry, getCoordinates } from '@/lib/serverApi';

// 在 Server Component 中直接使用，性能更好
const countries = await getAllCountries();
const cities = await getCitiesByCountry('CN');
const coords = await getCoordinates('CN', 'BJ');
```

## Prisma 指令

### 查看數據庫內容
```bash
npx prisma studio
```

### 重新生成 Prisma Client
```bash
npx prisma generate
```

### 創建新的遷移
```bash
npx prisma migrate dev --name your_migration_name
```

### 重置數據庫並重新填充種子數據
```bash
npx prisma migrate reset
```

### 執行種子腳本
```bash
npx prisma db seed
```

## 環境變數

在 `.env.local` 文件中設置：

```env
DATABASE_URL="file:./dev.db"
```

## 注意事項

- SQLite 數據庫文件 (`dev.db`) 已加入 `.gitignore`，不會被提交到 Git
- 在部署到生產環境時，考慮使用 PostgreSQL 或其他生產級數據庫
- Server Components 中使用 `lib/serverApi.ts` 性能更好（直接查詢，無需 HTTP 開銷）
- Client Components 中使用 `lib/api.ts`（通過 API Routes）
