import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ countryCode: string; cityCode: string }> }
) {
  try {
    const { countryCode, cityCode } = await params;

    const city = await prisma.city.findFirst({
      where: {
        code: cityCode.toUpperCase(),
        country: {
          code: countryCode.toUpperCase(),
        },
      },
      include: {
        coordinates: true,
        country: true,
      },
    });

    if (!city || !city.coordinates) {
      return NextResponse.json(
        { error: 'City or coordinates not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cityCode: city.code,
      cityName: city.name,
      countryCode: city.country.code,
      countryName: city.country.name,
      latitude: city.coordinates.latitude,
      longitude: city.coordinates.longitude,
    });
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coordinates' },
      { status: 500 }
    );
  }
}
