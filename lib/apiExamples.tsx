/**
 * 示範如何使用 Prisma API
 * 這個文件展示了三種不同的使用方式
 */

// 方式 1: 在 Server Components 中使用 (推薦用於 Next.js Server Components)
import * as serverApi from '@/lib/serverApi';

// 方式 2: 在 Client Components 中使用 (通過 API Routes)
import * as clientApi from '@/lib/api';

// 方式 3: 直接使用 Prisma Client (僅限 server-side)
import { prisma } from '@/lib/prisma';

/**
 * 範例 1: Server Component 中使用
 */
export async function ServerComponentExample() {
  // 獲取所有國家
  const countries = await serverApi.getAllCountries();
  console.log('所有國家:', countries);

  // 獲取美國的所有城市
  const usCities = await serverApi.getCitiesByCountry('US');
  console.log('美國城市:', usCities);

  // 獲取紐約的座標
  const nycCoords = await serverApi.getCoordinates('US', 'NYC');
  console.log('紐約座標:', nycCoords);

  return (
    <div>
      <h2>國家列表</h2>
      <ul>
        {countries.map((country) => (
          <li key={country.id}>
            {country.name} ({country.code})
          </li>
        ))}
      </ul>

      {nycCoords && (
        <div>
          <h2>紐約座標</h2>
          <p>緯度: {nycCoords.latitude}</p>
          <p>經度: {nycCoords.longitude}</p>
        </div>
      )}
    </div>
  );
}

/**
 * 範例 2: Client Component 中使用
 * 注意：需要在組件頂部添加 'use client'
 */
// 'use client';
export function ClientComponentExample() {
  const [countries, setCountries] = React.useState([]);

  React.useEffect(() => {
    // 在 Client Component 中使用 API
    clientApi.getAllCountries().then(setCountries);
  }, []);

  return (
    <div>
      <h2>國家列表 (Client-side)</h2>
      <ul>
        {countries.map((country: any) => (
          <li key={country.id}>
            {country.name} ({country.code})
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 範例 3: 在 API Route 中使用 Prisma
 */
export async function GET() {
  // 直接使用 Prisma 查詢
  const countries = await prisma.country.findMany({
    include: {
      cities: {
        include: {
          coordinates: true,
        },
      },
    },
  });

  return Response.json(countries);
}

/**
 * 範例 4: 在 Server Action 中使用
 */
export async function searchCities(searchTerm: string) {
  'use server';

  const cities = await prisma.city.findMany({
    where: {
      name: {
        contains: searchTerm,
      },
    },
    include: {
      country: true,
      coordinates: true,
    },
  });

  return cities;
}

// 如果您需要在現有代碼中使用，只需要：
// 1. 將 import from '@/lib/mockCoordinates' 改為 '@/lib/serverApi' (Server Component)
// 2. 或改為 '@/lib/api' (Client Component)
// 3. API 函數名稱和參數都保持一致，所以可以直接替換！
