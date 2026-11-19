import fs from "node:fs";
const data = JSON.parse(fs.readFileSync("coahuila-source.json"));
const polygons = (f) =>
  f.geometry.type === "Polygon"
    ? [f.geometry.coordinates]
    : f.geometry.coordinates;
const points = data.features.flatMap((f) => polygons(f).flat(1)).flat();
const west = Math.min(...points.map((p) => p[0])),
  east = Math.max(...points.map((p) => p[0]));
const north = Math.max(...points.map((p) => p[1])),
  south = Math.min(...points.map((p) => p[1]));
const xy = ([lon, lat]) => [
  Math.round(150 + ((lon - west) / (east - west)) * 420),
  Math.round(14 + ((north - lat) / (north - south)) * 496),
];
const paths = data.features
  .map(
    (f, i) =>
      '<path fill="' +
      ["#c9dfc9", "#d8e7d3", "#c1d9c3", "#d0e4ce"][i % 4] +
      '" d="' +
      polygons(f)
        .flatMap((p) =>
          p.map(
            (r) =>
              "M" +
              r
                .filter((_, j) => j % 3 === 0)
                .map((x) => xy(x).join(","))
                .join("L") +
              "Z",
          ),
        )
        .join("") +
      '"/>',
  )
  .join("");
fs.writeFileSync(
  "public/coahuila.svg",
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 14 420 496"><g stroke="#93b29c" stroke-width="0.9" fill-rule="evenodd">' +
    paths +
    "</g></svg>",
);
const towns = [
  [-101.59, 27.03],
  [-101.55, 27.06],
  [-101.42, 26.91],
  [-101.45, 26.93],
  [-101.72, 27.0],
  [-101.8, 27.05],
  [-102.07, 26.99],
  [-101.28, 27.18],
  [-101.27, 27.23],
  [-101.43, 26.79],
  [-101.47, 25.38],
  [-100.98, 25.43],
];
fs.writeFileSync("locations.json", JSON.stringify(towns.map(xy)));
