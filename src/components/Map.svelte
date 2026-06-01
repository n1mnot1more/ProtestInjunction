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

let transitioning = $state(false);
let opacity = $state(1);

/* tooltip position */
let tooltipX = $state(0);
let tooltipY = $state(0);

let width;
let height;
let dpr;

let projection;

let mode = $state("area");

let geography = $state("ward");

let scale = $state(1);


const legends = {
  ward_area: {
    title: "Ward - Hectares injuncted",
    labels: ["0–5", "20", "100", "300", "500", "500–1300"],
    colors: ["#61187a", "#b0349a", "#e04d79", "#fd842b", "#fec083", "#fcfd4f"]
  },

  ward_injunctions: {
    title: "Ward – Number of Injunctions",
    labels: [">0", "1", "3", "6", "10", "15", "20+"],
    colors: ["#0a061b", "#2a0a3a", "#61187a", "#96308d", "#d3477d", "#fd842b", "#fcfd4f"]
  },

  lad_area: {
    title: "LAD - Hectares injuncted",
    labels: ["0–5", "20", "100", "500", "1000", "1000+"],
    colors: ["#61187a", "#b0349a", "#e04d79", "#fd842b", "#fec083", "#fcfd4f"]
  },

  lad_injunctions: {
    title: "LAD – Number of Injunctions",
    labels: ["1", "2", "5", "10", "20", "50", "100+"],
    colors: ["#0a061b", "#2a0a3a", "#61187a", "#96308d", "#d3477d", "#fd842b", "#fcfd4f"]
  }
};


let legend = $derived(legends[getView()]);

/* -----------------------------
   MODE
----------------------------- */
function updateModeFromScroll() {
  const el = document.getElementById("map2");
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

function getValue(feature) {

  if (mode === "injunctions") {

    if (geography === "lad") {
      return Math.max(
        0,
        +feature.properties["Injunction Names"] || 0
      );
    }

    return Math.max(
      0,
      +feature.properties.injunction_names || 0
    );
  }

  if (geography === "lad") {
    return Math.max(
      0,
      +feature.properties["Total Area Injuncted (ha)"] || 0
    );
  }

  return Math.max(
    0,
    +feature.properties.covered_area_ha || 0
  );
}

/* -----------------------------
   BASE MAP
----------------------------- */
function drawBaseMap() {
  context.clearRect(0, 0, width, height);

  const features =
    geography === "ward"
      ? wards.features
      : lads.features;

  const view = getView(); // ✅ compute ONCE

  for (const feature of features) {
    context.beginPath();
    path(feature);

    context.fillStyle = scales[view](getValue(feature));

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

function getView() {
  return `${geography}_${mode}`;
}

const scales = {
  ward_area: d3.scaleThreshold()
    .domain([0.0001, 5, 20, 100, 300, 500, 1300])
    .range(["#0a061b","#61187a","#b0349a","#e04d79","#fd842b","#fec083","#fcfd4f"]),

  ward_injunctions: d3.scaleThreshold()
    .domain([1, 3, 6, 10, 15, 20, 25, 34])
    .range(["#0a061b","#2a0a3a","#61187a","#96308d","#d3477d","#fd842b","#fcfd4f","#fff07a"]),

  lad_area: d3.scaleThreshold()
    .domain([0.0001, 5, 20, 100, 500, 1000, 2000])
    .range(["#0a061b","#61187a","#b0349a","#e04d79","#fd842b","#fec083","#fcfd4f"]),

  lad_injunctions: d3.scaleThreshold()
    .domain([1, 2, 5, 10, 20, 50, 111])
    .range(["#0a061b","#2a0a3a","#61187a","#96308d","#d3477d","#fd842b","#fcfd4f","#fff07a"])
};

function switchGeography(next) {
  if (geography === next || transitioning) return;

  transitioning = true;
  opacity = 0.2;

  setTimeout(() => {
    geography = next;

    drawBaseMap();

    requestAnimationFrame(() => {
      opacity = 1;
    });

    setTimeout(() => {
      transitioning = false;
    }, 220);
  }, 180);
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

if (geography === "ward") {

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

} else {

  hovered = getFeatureAtPoint(
    x,
    y,
    hitContext,
    colorToLad
  );

  hoveredWard = null;
}
  requestAnimationFrame(drawHover);
});

  canvas.style.cursor = "crosshair";
});
</script>

<div class="map-wrap">

  <div
    class="canvas-stack"
    style="
      --opacity: {opacity};
      --scale: {scale};
    "
  >
    <canvas bind:this={canvas} class="base" />
    <canvas bind:this={hoverCanvas} class="hover" />
  </div>

  <canvas bind:this={hitCanvas} style="display:none;" />
  <canvas bind:this={wardHitCanvas} style="display:none;" />

  <div class="geo-toggle">
    <button
      class:selected={geography === "ward"}
      on:click={() => switchGeography("ward")}
    >
      Ward
    </button>

    <button
      class:selected={geography === "lad"}
      on:click={() => switchGeography("lad")}
    >
      Local Authority
    </button>
  </div>

{#if legend}
<div class="legend-bar">
  <div class="legend-bar-inner">
    <div class="legend">
      <div class="legend-title">
        {legend.title}
      </div>

      <div class="legend-scale">
        {#each legend.labels as label, i}
          <div class="legend-item">
            <div
              class="legend-dot"
              style="background:{legend.colors?.[i] ?? '#fff'}"
            />
            <span>{label}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
{/if}

  {#if geography === "ward" && hoveredWard}
    <div class="tooltip"
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

  {:else if geography === "lad" && hovered}
    <div class="tooltip"
      style="left:{tooltipX + 20}px; top:{tooltipY - 10}px;"
    >
      <div>{hovered.properties["LAD Name"]}</div>

      <div>
        {mode === "injunctions"
          ? `${+hovered.properties["Injunction Names"] || 0} injuncted areas`
          : `${Number(getValue(hovered) || 0).toFixed(2)} hectares injuncted`
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

.canvas-stack canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
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

.geo-toggle {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 20;

  display: flex;
  gap: 6px;
}

.geo-toggle button {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: white;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
}

.geo-toggle button.selected {
  border-color: white;
  font-weight: 600;
}

.canvas-stack {
  position: absolute;
  inset: 72px 0 0 0;
  opacity: var(--opacity, 1);
  transform: scale(var(--scale, 1));
  transition: opacity 220ms ease;

  z-index: 1; /* 👈 ADD */
}

@media (max-width: 900px) {
	.canvas-stack {
		inset: 64px 0 0 0; /* height of mobile header */
	}
}

.legend-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  height: 130px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  padding: 0 1.5rem;
  z-index: 10;

  /* REMOVE THIS */
  background: transparent;
}

.legend {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
  color: white;
  font-size: 0.72rem;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0,0,0,0.85),
               0 0 8px rgba(0,0,0,0.6);
}

.legend-title {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.legend-scale {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.28rem;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.legend-bar-inner {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>