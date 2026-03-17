import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { PlaceResult } from "@/lib/types/place";

const FAVORITES_LIMIT = 10;

function toPlaceResult(place: {
    id: bigint;
    osmType: string;
    osmId: string;
    name: string;
    class: string;
    type: string;
    lat: number;
    lon: number;
    source: string;
}): PlaceResult {
    return {
        id: place.id.toString(),
        osmType: place.osmType,
        osmId: place.osmId,
        name: place.name,
        class: place.class,
        type: place.type,
        lat: place.lat,
        lon: place.lon,
        source: place.source,
    };
}

// GET /api/favorites
export async function GET() {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.userFavorite.findMany({
        where: { userId: session.user.id },
        include: { place: true },
        orderBy: { createdAt: "asc" },
    });

    const favorites: PlaceResult[] = rows.map((r) => toPlaceResult(r.place));
    return NextResponse.json({ favorites });
}

// POST /api/favorites
export async function POST(request: NextRequest) {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Partial<PlaceResult>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { osmType, osmId, name, class: cls, type, lat, lon, source } = body;

    if (
        !osmType || !osmId || !name || !cls || !type ||
        lat === undefined || lat === null ||
        lon === undefined || lon === null ||
        !source
    ) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check limit before upsert to avoid creating orphaned places
    const currentCount = await prisma.userFavorite.count({
        where: { userId: session.user.id },
    });

    if (currentCount >= FAVORITES_LIMIT) {
        return NextResponse.json(
            { error: `Favorites limit reached (${FAVORITES_LIMIT})` },
            { status: 409 }
        );
    }

    // Upsert the place (create if not exists, return existing if it does)
    const place = await prisma.place.upsert({
        where: { unique_osm: { osmType: osmType!, osmId: String(osmId) } },
        update: {},
        create: {
            osmType: osmType!,
            osmId: String(osmId),
            name: name!,
            class: cls!,
            type: type!,
            lat: lat!,
            lon: lon!,
            source: source!,
        },
    });

    // Create the user→place link (idempotent: skip if already exists)
    await prisma.userFavorite.upsert({
        where: { userId_placeId: { userId: session.user.id, placeId: place.id } },
        update: {},
        create: { userId: session.user.id, placeId: place.id },
    });

    return NextResponse.json({ message: "Added", place: toPlaceResult(place) });
}

// DELETE /api/favorites
export async function DELETE(request: NextRequest) {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { osmType?: string; osmId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { osmType, osmId } = body;
    if (!osmType || !osmId) {
        return NextResponse.json({ error: "Missing osmType or osmId" }, { status: 400 });
    }

    await prisma.userFavorite.deleteMany({
        where: {
            userId: session.user.id,
            place: { osmType, osmId: String(osmId) },
        },
    });

    return NextResponse.json({ message: "Removed" });
}

