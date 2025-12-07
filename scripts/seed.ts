import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '../generated/prisma/client';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Use Accelerate connection for seeding
const prisma = new PrismaClient({
  accelerateUrl: process.env.PRISMA_POSTGRES_PARKER_SP_ORM_KEY!,
});

async function main() {
  console.log('🌱 開始種子數據...');

  // 清空現有數據
  await prisma.coordinates.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();

  // 創建國家
  const countries = await Promise.all([
    prisma.country.create({ data: { code: 'CN', name: 'China' } }),
    prisma.country.create({ data: { code: 'US', name: 'United States' } }),
    prisma.country.create({ data: { code: 'GB', name: 'United Kingdom' } }),
    prisma.country.create({ data: { code: 'FR', name: 'France' } }),
    prisma.country.create({ data: { code: 'RU', name: 'Russia' } }),
  ]);

  console.log(`✅ 創建了 ${countries.length} 個國家`);

  // 創建城市和座標
  const citiesData = [
    { code: 'BJ', name: 'Beijing', countryCode: 'CN', lat: 39.9042, lon: 116.4074 },
    { code: 'SH', name: 'Shanghai', countryCode: 'CN', lat: 31.2304, lon: 121.4737 },
    { code: 'NYC', name: 'New York', countryCode: 'US', lat: 40.7128, lon: -74.006 },
    { code: 'LA', name: 'Los Angeles', countryCode: 'US', lat: 34.0522, lon: -118.2437 },
    { code: 'LON', name: 'London', countryCode: 'GB', lat: 51.5074, lon: -0.1278 },
    { code: 'MAN', name: 'Manchester', countryCode: 'GB', lat: 53.4808, lon: -2.2426 },
    { code: 'PAR', name: 'Paris', countryCode: 'FR', lat: 48.8566, lon: 2.3522 },
    { code: 'LYO', name: 'Lyon', countryCode: 'FR', lat: 45.764, lon: 4.8357 },
    { code: 'MOW', name: 'Moscow', countryCode: 'RU', lat: 55.7558, lon: 37.6173 },
    { code: 'SPB', name: 'St. Petersburg', countryCode: 'RU', lat: 59.9311, lon: 30.3609 },
  ];

  for (const cityData of citiesData) {
    const country = countries.find((c) => c.code === cityData.countryCode);
    if (!country) continue;

    const city = await prisma.city.create({
      data: {
        code: cityData.code,
        name: cityData.name,
        countryId: country.id,
        coordinates: {
          create: {
            latitude: cityData.lat,
            longitude: cityData.lon,
          },
        },
      },
    });
    console.log(`✅ 創建城市: ${city.name}`);
  }

  console.log('✨ 種子數據完成！');
}

main()
  .catch((e) => {
    console.error('❌ 種子數據失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
