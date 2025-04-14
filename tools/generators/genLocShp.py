import fiona
import argparse
import math
import random

# parse arguments
parser = argparse.ArgumentParser(description="Generate shapefile (point or polygon)")
parser.add_argument("-l", "--locations", type=int, help="Number of locations", default=4)
parser.add_argument("-g", "--polygon", action='store_true', help="Polygon vs point shapefile")
parser.add_argument("-a", "--attributes", action='store_true', help="Random attributes")
args = parser.parse_args()

numPoints = math.ceil(math.sqrt(args.locations))
numPoints2 = numPoints ** 2
geomType = "Polygon" if args.polygon else "Point"
print("Generating", numPoints2, "locations of type ", geomType)

# define schema
schemaPoly = {
    "type":"Feature",
    "geometry": "Polygon",
    "properties": [
        ("Location_Name", "str"),
    ]
}
 
schemaPoint = {
    "geometry": "Point",
    "properties": [
        ("Location_Name", "str"),
        ("Analysis_Radius", "str"),
        ("Analysis_Area", "str"),
    ]
}

if args.attributes:
    schemaPoly["properties"] += [("Attr bC 1", "str")]
    schemaPoint["properties"] += [("Attr bC 1", "str")]

# open a fiona object
shpFile = fiona.open(
    "./%ss.shp" % geomType.lower(),
    mode="w",
    driver="ESRI Shapefile",
    schema=schemaPoly if args.polygon else schemaPoint,
    crs="EPSG:4326",
)

# save record and close shapefile
def genLoc(locName, lat, lon):
    baseObj = {
        "type":"Feature",
        "properties": {
            "Location_Name": locName
        },
        "geometry": {
            "type": geomType,
        },
    }
    if args.polygon:
        baseObj["geometry"]["coordinates"] = [[
            (lon - .01, lat - .01),
            (lon - .01, lat + .01),
            (lon + .01, lat + .01),
            (lon + .01, lat - .01),
            (lon - .01, lat - .01),
        ]]
    else:
        baseObj["geometry"]["coordinates"] = [lon, lat]
        baseObj["properties"]["Analysis_Radius"] = .1
        baseObj["properties"]["Analysis_Area"] = 0
    if args.attributes:
        baseObj["properties"]["Attr bC 1"] = 'A' + ''.join(random.choices('0123456789', k=3))
    return baseObj

startLat = -13.0
startLon = 14.0

def genAllLocs():
    allLocs = []
    for x in range (0, numPoints):
        for y in range (0, numPoints):
            locName = "Loc %d %d" % (x, y)
            lat = startLat + y * 0.036
            lon = startLon + x * 0.036
            locObj = genLoc(locName, lat, lon)
            allLocs += [locObj]
    return allLocs

allLocs = genAllLocs()
# print(allLocs)
shpFile.writerecords(allLocs)

# close fiona object
shpFile.close()

print("files generated")
