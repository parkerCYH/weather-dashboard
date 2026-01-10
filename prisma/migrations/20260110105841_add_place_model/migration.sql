-- CreateTable
CREATE TABLE "places" (
    "id" BIGSERIAL NOT NULL,
    "osmType" TEXT NOT NULL,
    "osmId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_osm" ON "places"("osmType", "osmId");

-- CreateIndex
CREATE INDEX "idx_name" ON "places"("name");

-- CreateIndex
CREATE UNIQUE INDEX "places_osmType_osmId_key" ON "places"("osmType", "osmId");
