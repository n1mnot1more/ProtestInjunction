<script>
import { base } from "$app/paths";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { onMount } from "svelte";

let hitCanvas;
let wardHitCanvas;

let hitContext;
let wardHitContext;

let hitPath;
let wardHitPath;

const colorToLad = new Map();
const colorToWard = new Map();

let canvas;
let hoverCanvas;

let context;
let hoverContext;

let path;
let hoverPath;

let wards;
let lads;
let engwal;

let hovered = $state(null);
let hoveredWard = $state(null);

/* tooltip position */
let tooltipX = $state(0);
let tooltipY = $state(0);

let width;
let height;
let dpr;

let projection;

let mode = $state("area");

/* -----------------------------
   MODE
----------------------------- */
function updateModeFromScroll() {
  const el = document.getElementById("stories");
  if (!el) return;

  const top = el.getBoundingClientRect().top;

  mode = top < window.innerHeight * 0.65
    ? "injunctions"
    : "area";

  requestAnimationFrame(drawBaseMap);
}

/* -----------------------------
   SCALE
----------------------------- */
const areaScale = d3.scaleThreshold()
  .domain([0.0001, 5, 20, 100, 300, 500, 1300])
  .range([
    "#0a061b",
    "#61187a",
    "#b0349a",
    "#e04d79",
    "#fd842b",
    "#fec083",
    "#fcfd4f"
  ]);

const injScale = d3.scaleThreshold()
  .domain([1, 3, 6, 10, 15, 20, 25, 34])
  .range([
    "#0a061b",
    "#2a0a3a",
    "#61187a",
    "#96308d",
    "#d3477d",
    "#fd842b",
    "#fcfd4f",
    "#fff07a"
  ]);

function getWardValue(feature) {
  if (mode === "injunctions") {
    const v = +feature.properties.injunction_names;
    return Number.isFinite(v) ? v : 0;
  }

  const v = +feature.properties.covered_area_ha;
  return Number.isFinite(v) ? v : 0;
}

/* -----------------------------
   BASE MAP
----------------------------- */
function drawBaseMap() {

  context.clearRect(0, 0, width, height);

  for (const feature of wards.features) {

    context.beginPath();
    path(feature);

    context.fillStyle =
      mode === "injunctions"
        ? injScale(getWardValue(feature))
        : areaScale(getWardValue(feature));

    context.fill();
  }

  context.beginPath();
  path(engwal);
  context.strokeStyle = "#262235";
  context.lineWidth = 2;
  context.stroke();
}


/* -----------------------------
   HOVER
----------------------------- */

function getFeatureAtPoint(x, y, ctx, colorMap) {
  const radius = 2.5 ;
  const size = radius * 2 + 1;

  const px = Math.round(x * dpr);
  const py = Math.round(y * dpr);

  const data = ctx.getImageData(
    px - radius,
    py - radius,
    size,
    size
  ).data;

  const counts = new Map();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r === 0 && g === 0 && b === 0) continue;

    const key = `${r},${g},${b}`;

    const feature = colorMap.get(key);

    if (!feature) continue;

    counts.set(
      feature,
      (counts.get(feature) || 0) + 1
    );
  }

  if (!counts.size) return null;

  let best = null;
  let bestCount = 0;

  for (const [feature, count] of counts) {
    if (count > bestCount) {
      best = feature;
      bestCount = count;
    }
  }

  return best;
}
 

function buildLadHitMap() {
  lads.features.forEach((feature, i) => {
    const r = (i + 1) & 255;
    const g = ((i + 1) >> 8) & 255;
    const b = ((i + 1) >> 16) & 255;

    const color = `rgb(${r},${g},${b})`;

    colorToLad.set(`${r},${g},${b}`, feature);

    hitContext.beginPath();
    hitPath(feature);
    hitContext.fillStyle = color;
    hitContext.fill();
  });
}

function buildWardHitMap() {
  wards.features.forEach((feature, i) => {
    const r = (i + 1) & 255;
    const g = ((i + 1) >> 8) & 255;
    const b = ((i + 1) >> 16) & 255;

    const color = `rgb(${r},${g},${b})`;

    colorToWard.set(`${r},${g},${b}`, feature);

    wardHitContext.beginPath();
    wardHitPath(feature);
    wardHitContext.fillStyle = color;
    wardHitContext.fill();
  });
}

function drawHover() {

  hoverContext.clearRect(0, 0, width, height);

  if (hoveredWard) {
    hoverContext.beginPath();
    hoverPath(hoveredWard);

    hoverContext.strokeStyle = "#fff";
    hoverContext.lineWidth = 0.6;
    hoverContext.globalAlpha = 0.9;
    hoverContext.stroke();
  }

  if (hovered) {
    hoverContext.beginPath();
    hoverPath(hovered);

    hoverContext.strokeStyle = "#fff";
    hoverContext.lineWidth = 1.2;
    hoverContext.globalAlpha = 1;
    hoverContext.stroke();
  }

  hoverContext.globalAlpha = 1;
}

/* -----------------------------
   INIT
----------------------------- */
onMount(async () => {


  const mobile = window.innerWidth < 900;

  width = mobile ? window.innerWidth : window.innerWidth * 0.6;
  height = mobile
    ? window.innerHeight
    : window.innerHeight - 72;

  dpr = window.devicePixelRatio || 1;

  const topo = await d3.json(`${base}/wards.topo.json`);
  wards = topojson.feature(
    topo,
    topo.objects[Object.keys(topo.objects)[0]]
  );

  const ladTopo = await d3.json(`${base}/lads.topo.json`);
  lads = topojson.feature(
    ladTopo,
    ladTopo.objects[Object.keys(ladTopo.objects)[0]]
  );

  const engwalTopo = await d3.json(`${base}/engwal.topo.json`);
  engwal = topojson.feature(
    engwalTopo,
    engwalTopo.objects[Object.keys(engwalTopo.objects)[0]]
  );


projection = d3.geoIdentity()
  .reflectY(true)
  .fitExtent(
    [[15, 15], [width - 15, height - 15]],
    wards
  );

canvas.width = width * dpr;
canvas.height = height * dpr;

hoverCanvas.width = width * dpr;
hoverCanvas.height = height * dpr;

context = canvas.getContext("2d");
hoverContext = hoverCanvas.getContext("2d");

context.setTransform(dpr, 0, 0, dpr, 0, 0);
hoverContext.setTransform(dpr, 0, 0, dpr, 0, 0);

path = d3.geoPath(projection, context);
hoverPath = d3.geoPath(projection, hoverContext);

/* HIT CANVASES */

hitCanvas.width = width * dpr;
hitCanvas.height = height * dpr;

wardHitCanvas.width = width * dpr;
wardHitCanvas.height = height * dpr;

hitContext = hitCanvas.getContext("2d");
wardHitContext = wardHitCanvas.getContext("2d");

hitContext.setTransform(dpr, 0, 0, dpr, 0, 0);
wardHitContext.setTransform(dpr, 0, 0, dpr, 0, 0);

hitContext.clearRect(0, 0, width, height);
wardHitContext.clearRect(0, 0, width, height);

colorToLad.clear();
colorToWard.clear();

hitPath = d3.geoPath(projection, hitContext);
wardHitPath = d3.geoPath(projection, wardHitContext);

buildLadHitMap();
buildWardHitMap();

drawBaseMap();

window.addEventListener("scroll", updateModeFromScroll);

canvas.addEventListener("mousemove", (e) => {

  const rect = canvas.getBoundingClientRect();

  const x =
    ((e.clientX - rect.left) / rect.width) * width;

  const y =
    ((e.clientY - rect.top) / rect.height) * height;

  tooltipX = e.clientX - rect.left;
  tooltipY = e.clientY - rect.top;

  hoveredWard = getFeatureAtPoint(
    x,
    y,
    wardHitContext,
    colorToWard
  );

  hovered = getFeatureAtPoint(
    x,
    y,
    hitContext,
    colorToLad
  );

  requestAnimationFrame(drawHover);
});

  canvas.addEventListener("mouseleave", () => {
    hovered = null;
    hoveredWard = null;
    requestAnimationFrame(drawHover);
  });

  canvas.style.cursor = "crosshair";
});
</script>

<div class="map-wrap">
  <canvas bind:this={canvas} class="base" />
  <canvas bind:this={hoverCanvas} class="hover" />
<canvas bind:this={hitCanvas} style="display:none;" />
<canvas bind:this={wardHitCanvas} style="display:none;" />

  {#if hoveredWard}
    <div
      class="tooltip"
      style="left:{tooltipX + 20}px; top:{tooltipY - 10}px;"
    >
      <div>{hoveredWard.properties.WARD_Name}</div>

      <div>
        in {hovered?.properties?.["LAD Name"] ?? "Unknown LAD"}
      </div>

<div>
  {mode === "injunctions"
    ? `${+hoveredWard.properties.injunction_names || 0} injuncted areas`
    : `${Math.max(0, +hoveredWard.properties.covered_area_ha || 0)} hectares injuncted`
  }
</div>
    </div>
  {/if}
</div>

<style>
.map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.base {
  z-index: 1;
}

.hover {
  z-index: 2;
  pointer-events: none;
}

.tooltip {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  color: #fff;
  font-size: 0.9rem;
  white-space: nowrap;
}
</style>