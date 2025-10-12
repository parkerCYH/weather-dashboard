# 從 Mock Data 遷移到 Prisma 的指南

## 快速遷移步驟

### 步驟 1: 更新 imports

**舊代碼 (使用 mock data):**
```typescript
import { getAllCountries, getCitiesByCountry, getCoordinates } from '@/lib/mockCoordinates';
```

**新代碼 (使用 Prisma):**

在 **Server Components** 中:
```typescript
import { getAllCountries, getCitiesByCountry, getCoordinates } from '@/lib/serverApi';
```

在 **Client Components** 中:
```typescript
import { getAllCountries, getCitiesByCountry, getCoordinates } from '@/lib/api';
```

### 步驟 2: 更新函數調用

好消息！函數簽名保持一致，所以不需要修改調用方式：

```typescript
// 這些調用方式完全相同
const countries = await getAllCountries();
const cities = await getCitiesByCountry('CN');
const coords = await getCoordinates('CN', 'BJ');
```

### 步驟 3: 處理非同步操作

**重要變化**: 新的 API 都是真正的非同步函數，需要使用 `await` 或 `.then()`

```typescript
// ✅ 正確 - 使用 await
const countries = await getAllCountries();

// ✅ 正確 - 使用 .then()
getAllCountries().then(countries => {
  console.log(countries);
});

// ❌ 錯誤 - 忘記 await
const countries = getAllCountries(); // 這會得到 Promise，而不是數據
```

## 類型定義對比

### 舊類型 (mockCoordinates.ts)
```typescript
type Country = {
  code: string;
  name: string;
};

type City = {
  code: string;
  name: string;
  countryCode: string;
};

type CityCoordinates = {
  cityCode: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
};
```

### 新類型 (Prisma)
```typescript
// 數據庫模型包含了 ID
type Country = {
  id: number;      // 新增
  code: string;
  name: string;
};

type City = {
  id: number;      // 新增
  code: string;
  name: string;
  countryId: number; // 改變：從 countryCode 變為 countryId
};

type CityCoordinates = {
  cityCode: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  // 結構保持一致，便於遷移
};
```

## 具體文件遷移範例

### 範例 1: LocationForm.tsx

**舊代碼:**
```typescript
import { getAllCountries, getCitiesByCountry } from '@/lib/mockCoordinates';

export function LocationForm() {
  const countries = getAllCountries(); // 同步調用
  
  const handleCountryChange = (countryCode: string) => {
    const cities = getCitiesByCountry(countryCode); // 同步調用
    setCities(cities);
  };
  
  return (/* JSX */);
}
```

**新代碼 (如果是 Server Component):**
```typescript
import { getAllCountries } from '@/lib/serverApi';

export async function LocationForm() {
  const countries = await getAllCountries(); // 非同步調用
  
  // 對於動態數據，建議使用 Client Component
  return (/* JSX */);
}
```

**新代碼 (如果是 Client Component):**
```typescript
'use client';
import { useEffect, useState } from 'react';
import { getAllCountries, getCitiesByCountry } from '@/lib/api';

export function LocationForm() {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  
  useEffect(() => {
    getAllCountries().then(setCountries);
  }, []);
  
  const handleCountryChange = async (countryCode: string) => {
    const cities = await getCitiesByCountry(countryCode);
    setCities(cities);
  };
  
  return (/* JSX */);
}
```

### 範例 2: API Route

**舊代碼:**
```typescript
import { getCoordinates } from '@/lib/mockCoordinates';

export async function GET(request: Request) {
  const coords = getCoordinates('US', 'NYC');
  return Response.json(coords);
}
```

**新代碼:**
```typescript
import { getCoordinates } from '@/lib/serverApi';

export async function GET(request: Request) {
  const coords = await getCoordinates('US', 'NYC'); // 加上 await
  return Response.json(coords);
}
```

## 需要注意的地方

### 1. City 結構的變化

舊的 `City` 類型有 `countryCode`，新的有 `countryId`:

```typescript
// 舊
type City = {
  code: string;
  name: string;
  countryCode: string; // 字串
};

// 新
type City = {
  id: number;
  code: string;
  name: string;
  countryId: number; // 數字
};
```

**解決方案**: 如果需要 countryCode，使用 `getCitiesByCountry()` 時已經知道是哪個國家了。

### 2. 錯誤處理

新的 API 可能會拋出錯誤，建議加上錯誤處理：

```typescript
try {
  const coords = await getCoordinates('US', 'NYC');
  if (!coords) {
    console.error('找不到座標');
  }
} catch (error) {
  console.error('獲取座標失敗:', error);
}
```

### 3. 性能考慮

- **Server Components**: 使用 `@/lib/serverApi` - 直接查詢數據庫，最快
- **Client Components**: 使用 `@/lib/api` - 通過 API Routes，多一層 HTTP 請求
- **API Routes**: 使用 `@/lib/serverApi` 或直接使用 `prisma`

## 檢查清單

遷移完成後，請檢查：

- [ ] 所有從 `@/lib/mockCoordinates` 的 import 都已更新
- [ ] 所有函數調用都加上了 `await` 或 `.then()`
- [ ] Server Components 使用 `@/lib/serverApi`
- [ ] Client Components 使用 `@/lib/api`
- [ ] 如果使用 `City.countryCode`，已改為使用 `City.countryId` 或其他方式
- [ ] 添加了適當的錯誤處理
- [ ] 測試所有功能是否正常運作

## 保留 Mock Data

如果您想保留 mock data 作為後備選項，可以這樣做：

```typescript
import * as prismaApi from '@/lib/serverApi';
import * as mockApi from '@/lib/mockCoordinates';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
const api = USE_MOCK ? mockApi : prismaApi;

// 使用
const countries = await api.getAllCountries();
```

## 需要幫助？

如果在遷移過程中遇到問題：

1. 檢查 Prisma 數據庫是否正常運行: `npx prisma studio`
2. 查看數據是否已填充: 應該看到 5 個國家、10 個城市
3. 檢查 API endpoints 是否可訪問: 
   - http://localhost:3000/api/countries
   - http://localhost:3000/api/countries/CN/cities
   - http://localhost:3000/api/countries/CN/cities/BJ/coordinates
