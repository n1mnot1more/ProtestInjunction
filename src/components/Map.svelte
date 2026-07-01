<script>
import { base } from "$app/paths";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { onMount } from "svelte";

let hs2Cached;

let hoverScheduled = false;
let pendingEvent = null;


let {
  hs2Visible = false,
  animateOnLoad = true,
  disableInteraction = false
} = $props();

let hs2HasLockedView = false;

let canvasSelection;
let zoomLocked = false;

let zoomSession = 0;
let zoomPhase = "idle"; // "zooming" | "done"

let hs2Injunction;


$effect(() => {
  if (!hs2Visible) {
    hs2HasLockedView = false;
    animateZoom(1, 0, 0, true);
    return;
  }

  if (!hs2Injunction || !path || !width || !height || !projection) return;
  if (!hs2Cached) return;

  const bounds = path.bounds(hs2Injunction);
  if (!bounds) return;

  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];

  const cx = (bounds[0][0] + bounds[1][0]) / 2;
  const cy = (bounds[0][1] + bounds[1][1]) / 2;

  const scale = Math.min(width / dx, height / dy) * 0.6;

  const x = width / 2 - scale * cx;
  const y = height / 2 - scale * cy;

  animateZoom(scale, x, y, true);
});

$effect(() => {
  if (!hs2Injunction || !projection) return;
  buildHS2Cache();
});

let hitCanvas;
let wardHitCanvas;

let hitContext;
let wardHitContext;

let hitPath;
let wardHitPath;

let introProgress = 0;
let introDone = false;


const colorToLad = new Map();
const colorToWard = new Map();


let geographyTransition = false;
let transitionProgress = 0;


let prevGeography = null;
let transitionT = 0;

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

let geography = $state("lad");
let targetGeography = null;          // where we're going


 let zoomTransform = {
  scale: 1,
  x: 0,
  y: 0
};



const legends = {
  ward_area: {
    title: "Ward - Hectares injuncted",
    labels: ["0–5", "20", "100", "300", "500", "500–1300"],
    colors: ["#61187a", "#b0349a", "#e04d79", "#fd842b", "#fec083", "#fcfd4f"]
  },

  ward_injunctions: d3.scaleThreshold()
    .domain([0, 1, 3, 6, 10, 20, 36])
    .range(["#0a061b","#0a061b","#61187a","#96308d","#d3477d","#fd842b","#fcfd4f","#fff07a"]),

  ward_injunctions: {
    title: "Ward – Number of Injunctions",
    labels: ["0", "1", "3", "6", "10", "15+"],
    colors: ["#0a061b", "#61187a", "#96308d", "#d3477d", "#fd842b", "#fcfd4f"]
  },

  lad_area: {
    title: "LAD - Hectares injuncted",
    labels: ["0–5", "20", "100", "500", "1000", "1000+"],
    colors: ["#61187a", "#b0349a", "#e04d79", "#fd842b", "#fec083", "#fcfd4f"]
  },

  lad_injunctions: {
    title: "LAD – Number of Injunctions",
    labels: ["0", "1", "2", "5", "10", "20", "50+"],
    colors: ["#0a061b", "#2a0a3a", "#61187a", "#96308d", "#d3477d", "#fd842b", "#fcfd4f"]
  }
};


let legend = $derived(legends[getView()]);

/* -----------------------------
   MODE
----------------------------- */
const alpha = d3.scaleLinear()
  .domain([0, 1])
  .range([0, 1])
  .clamp(true);


let wardOrder = [];

function prepareWardIntro() {
  wardOrder = [...wards.features];

  wardOrder.sort((a, b) =>
    (a.properties.covered_area_ha_rounded || 0) -
    (b.properties.covered_area_ha_rounded || 0)
  );

  wardOrder.forEach((f, i) => {
    f.__introIndex = i;
  });
}

let LADOrder = [];

function prepareLADIntro() {
  LADOrder = [...lads.features];

  LADOrder.sort((a, b) =>
    (a.properties["Total.Area.Injuncted..ha."] || 0) -
    (b.properties["Total.Area.Injuncted..ha."] || 0)
  );

  LADOrder.forEach((f, i) => {
    f.__introIndex = i;
  });
}


function animateIntro() {
  introProgress = 0;
  introDone = false;

  const start = performance.now();
  const duration = 1400;

  function tick(t) {
    const raw = (t - start) / duration;
    introProgress = d3.easeSinOut(Math.min(1.5, raw));

    drawBaseMap();

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      introDone = true;

      introProgress = 1;
      drawBaseMap();
    }
  }

  requestAnimationFrame(tick);
}


function animateZoom(scale, x, y, lock = false) {
  if (lock) zoomLocked = true;

  zoomPhase = "zooming";
  const session = ++zoomSession;

  const start = { ...zoomTransform };
  const startTime = performance.now();
const isMobile = window.innerWidth < 900;
const duration = isMobile ? 800 : 1100;

  function tick(t) {
    const p = Math.min(1, (t - startTime) / duration);
    const e = d3.easeSinOut(p);

    zoomTransform = {
      scale: start.scale + (scale - start.scale) * e,
      x: start.x + (x - start.x) * e,
      y: start.y + (y - start.y) * e
    };

    drawBaseMap();
    drawHover();

    if (p < 1) {
      requestAnimationFrame(tick);
      return;
    }

    // ignore stale animations
    if (session !== zoomSession) return;

    // commit exact final transform
    zoomTransform = { scale, x, y };

    drawBaseMap();
    drawHover();

    zoomPhase = "done";

    // IMPORTANT:
    // update D3's internal zoom state so
    // panning/wheel zoom starts from this view
const finalTransform = d3.zoomIdentity
  .translate(x, y)
  .scale(scale);

canvasSelection.interrupt(); // cancel any transitions

canvasSelection.call(zoom.transform, finalTransform);

zoomLocked = false;
  }

  requestAnimationFrame(tick);
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

function getYOffset() {
  return 5* (dpr || 1);
}

function getValue(feature) {

  if (mode === "injunctions") {

    if (geography === "lad") {
      return Math.max(
        0,
        +feature.properties["Injunction.Names"] || 0
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
      +feature.properties["Total.Area.Injuncted..ha."] || 0
    );
  }

  return Math.max(
    0,
    +feature.properties.covered_area_ha_rounded || 0
  );
}

/* -----------------------------
   BASE MAP
----------------------------- */
function drawBaseMap() {
  context.clearRect(0, 0, width, height);

  context.save();

  context.translate(zoomTransform.x, zoomTransform.y);
  context.scale(zoomTransform.scale, zoomTransform.scale);

  // clip to boundary
  context.beginPath();
  path(engwal);
  context.clip();

  const viewFrom = `${prevGeography}_${mode}`;
  const viewTo = `${geography}_${mode}`;

  const fromFeatures =
    prevGeography === "ward" ? wards.features : lads.features;

  const toFeatures =
    geography === "ward" ? wards.features : lads.features;

  const fromOrder = prevGeography === "lad" ? LADOrder : wardOrder;
  const toOrder = geography === "lad" ? LADOrder : wardOrder;

  // -----------------------------
  // CASE 1: NORMAL
  // -----------------------------
  if (!prevGeography) {
    const features = toFeatures;

    for (const feature of features) {
      const t =
        feature.__introIndex / Math.max(1, toOrder.length - 1);

      if (!introDone && introProgress < t) continue;

      context.globalAlpha = 1;
      context.beginPath();
      path(feature);
      context.fillStyle = scales[viewTo](getValue(feature));
      context.fill();
    }

// HS2 INJUNCTION (cached version)
if (hs2Injunction && hs2Visible && zoomPhase === "done" && hs2Cached) {

  context.save();

  context.shadowColor = "#1fe4ff";
  context.shadowBlur = 17;

  context.strokeStyle = "#ddfdff";
  context.lineWidth = 2 / zoomTransform.scale;

  context.stroke(hs2Cached);

  context.restore();
}

    context.globalAlpha = 1;
    context.beginPath();
    path(engwal);
    context.strokeStyle = "#262235";
    context.lineWidth = 1 / zoomTransform.scale;
    context.stroke();

  } else {
    // -----------------------------
    // CASE 2: CROSSFADE
    // -----------------------------

    // OLD layer
    context.globalAlpha = 1 - transitionT;

    for (const feature of fromFeatures) {
      const t =
        feature.__introIndex / Math.max(1, fromOrder.length - 1);

      if (!introDone && introProgress < t) continue;

      context.beginPath();
      path(feature);
      context.fillStyle = scales[viewFrom](getValue(feature));
      context.fill();
    }

    // NEW layer
    context.globalAlpha = transitionT;

    for (const feature of toFeatures) {
      const t =
        feature.__introIndex / Math.max(1, toOrder.length - 1);

      if (!introDone && introProgress < t) continue;

      context.beginPath();
      path(feature);
      context.fillStyle = scales[viewTo](getValue(feature));
      context.fill();
    }

    context.globalAlpha = 1;

    context.beginPath();
    path(engwal);
    context.strokeStyle = "#262235";
    context.lineWidth = 1 / zoomTransform.scale;
    context.stroke();
  }

  // =========================================================
  // SUBTLE BOUNDARIES (WARD + LAD — background hierarchy)
  // =========================================================
if (zoomPhase === "done") {

  context.save();

  context.lineJoin = "round";
  context.lineCap = "round";

  const wardStroke = {
    color: "#101018",
    alpha: 0.08,
    width: 0.8
  };

  const ladStroke = {
    color: "#101018",
    alpha: 0.08,
    width: 0.8
  };

  if (geography === "ward") {
    context.globalAlpha = wardStroke.alpha;
    context.strokeStyle = wardStroke.color;
    context.lineWidth = wardStroke.width / zoomTransform.scale;

    for (const feature of wards.features) {
      context.beginPath();
      path(feature);
      context.stroke();
    }
  }

  if (geography === "lad") {
    context.globalAlpha = ladStroke.alpha;
    context.strokeStyle = ladStroke.color;
    context.lineWidth = ladStroke.width / zoomTransform.scale;

    for (const feature of lads.features) {
      context.beginPath();
      path(feature);
      context.stroke();
    }
  }

  context.restore();
}

  context.restore();
  return;
}

function switchGeography(next) {
  if (geography === next || transitioning) return;

  transitioning = true;

  prevGeography = geography;
  targetGeography = next;

  const start = performance.now();
  const duration = 350;

  function tick(t) {
    const raw = Math.min(1, (t - start) / duration);
    transitionT = d3.easeSinOut(raw);

    drawBaseMap();

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      geography = targetGeography;   // commit only at end
      targetGeography = null;
      prevGeography = null;
      transitionT = 0;
      transitioning = false;

      drawBaseMap();
    }
  }

  requestAnimationFrame(tick);
}
/* -----------------------------
   HOVER
----------------------------- */

function findLad(x, y) {

  for (const feature of lads.features) {

    hitContext.beginPath();
    hitPath(feature);

    if (hitContext.isPointInPath(
      x * dpr,
      y * dpr
    )) {
      return feature;
    }
  }

  return null;
}

function findWard(x, y) {

  for (const feature of wards.features) {

    wardHitContext.beginPath();
    wardHitPath(feature);

    if (wardHitContext.isPointInPath(
      x * dpr,
      y * dpr
    )) {
      return feature;
    }
  }

  return null;
}

function getFeatureAtPoint(x, y, ctx, colorMap) {
const radius = 0;

  const size = radius * 2 + 1;

const px = Math.floor(x * dpr);
const py = Math.floor(y * dpr);

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

const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .wheelDelta(event => -event.deltaY * 0.004)
  .on("zoom", (event) => {

     zoomSession++; 

    zoomTransform = {
      scale: event.transform.k,
      x: event.transform.x,
      y: event.transform.y
    };

    drawBaseMap();
    drawHover();
  });


function drawHover() {

  hoverContext.clearRect(0, 0, width, height);

  hoverContext.save();

hoverContext.translate(
  zoomTransform.x,
  zoomTransform.y 
);

  hoverContext.scale(
    zoomTransform.scale,
    zoomTransform.scale
  );

  if (hoveredWard) {
    hoverContext.beginPath();
    hoverPath(hoveredWard);

    hoverContext.strokeStyle = "#fff";
hoverContext.lineWidth = 0.8 / zoomTransform.scale;
    hoverContext.globalAlpha = 0.9;
    hoverContext.stroke();
  }

  if (hovered) {
    hoverContext.beginPath();
    hoverPath(hovered);

    hoverContext.strokeStyle = "#fff";
hoverContext.lineWidth = 1.7 / zoomTransform.scale;
    hoverContext.globalAlpha = 1;
    hoverContext.stroke();
  }

  hoverContext.globalAlpha = 1;
hoverContext.restore();
}

function buildHS2Cache() {
  if (!hs2Injunction || !projection) return;

  hs2Cached = new Path2D();
  const hs2Path = d3.geoPath(projection).context(hs2Cached);
  hs2Path(hs2Injunction);
}

function getView() {
  return `${geography}_${mode}`;
}

const scales = {
  ward_area: d3.scaleThreshold()
    .domain([0.0001, 5, 20, 100, 300, 500, 1300])
    .range(["#0a061b","#61187a","#b0349a","#e04d79","#fd842b","#fec083","#fcfd4f"]),

  ward_injunctions: d3.scaleThreshold()
    .domain([1, 3, 6, 10, 20, 36])
    .range(["#0a061b","#61187a","#96308d","#d3477d","#fd842b","#fcfd4f","#fff07a"]),

  lad_area: d3.scaleThreshold()
    .domain([0.0001, 5, 20, 100, 500, 1000, 2000])
    .range(["#0a061b","#61187a","#b0349a","#e04d79","#fd842b","#fec083","#fcfd4f"]),

  lad_injunctions: d3.scaleThreshold()
    .domain([ 1, 2, 5, 10, 20, 50, 111])
    .range(["#0a061b","#2a0a3a","#61187a","#96308d","#d3477d","#fd842b","#fcfd4f"])
};





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

const hs2Topo = await d3.json(
  `${base}/hs2injunction.topo.json`
);

hs2Injunction = topojson.feature(
  hs2Topo,
  hs2Topo.objects[
    Object.keys(hs2Topo.objects)[0]
  ]
);

console.log(hs2Injunction);
console.log(hs2Injunction.type);


const isMobile = window.innerWidth < 900;

const extent = isMobile
  ? [[0, 70], [width - 25, height - 20]]  // shift left on mobile
  : [[30, 30], [width - 25, height - 20]]; // normal on desktop

projection = d3.geoIdentity()
  .reflectY(true)
  .fitExtent(extent, wards);


canvas.width = width * dpr;
canvas.height = height * dpr;

hoverCanvas.width = width * dpr;
hoverCanvas.height = height * dpr;

context = canvas.getContext("2d");
hoverContext = hoverCanvas.getContext("2d");

context.setTransform(dpr, 0, 0, dpr, 0, 0);
hoverContext.setTransform(dpr, 0, 0, dpr, 0, 0);

path = d3.geoPath(projection, context);

hs2Cached = new Path2D();

const hs2Path = d3.geoPath(projection).context(hs2Cached);
hs2Path(hs2Injunction);

hoverPath = d3.geoPath(projection, hoverContext);

// HS2 CACHE (must be after projection + path exist)
if (hs2Injunction) {
  hs2Cached = new Path2D();

  const hs2Path = d3.geoPath(projection).context(hs2Cached);
  hs2Path(hs2Injunction);
}


canvasSelection = d3.select(canvas);
if (!disableInteraction) {
  canvasSelection.call(zoom);
}
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

hitContext.imageSmoothingEnabled = false;
wardHitContext.imageSmoothingEnabled = false;

buildLadHitMap();
buildWardHitMap();

prepareWardIntro();
prepareLADIntro();

drawBaseMap();

if (animateOnLoad) {
  animateIntro();
} else {
  introDone = true;
  introProgress = 1;
  drawBaseMap();
}



let hoverScheduled = false;
let pendingEvent = null;

canvas.addEventListener("mousemove", (e) => {
  pendingEvent = e;

  if (hoverScheduled) return;
  hoverScheduled = true;

  requestAnimationFrame(() => {
    hoverScheduled = false;

    const e = pendingEvent;
    if (!e) return;

    const rect = canvas.getBoundingClientRect();

    const sx =
      ((e.clientX - rect.left) / rect.width) * width;

    const sy =
      ((e.clientY - rect.top) / rect.height) * height;

    const x = (sx - zoomTransform.x) / zoomTransform.scale;
    const y = (sy - zoomTransform.y) / zoomTransform.scale;

    tooltipX = e.clientX - rect.left;
    tooltipY = e.clientY - rect.top;

    if (geography === "ward") {
      hoveredWard = findWard(x, y);
      hovered = findLad(x, y);
    } else {
      hovered = findLad(x, y);
      hoveredWard = null;
    }

    drawHover(); // 👈 move it here (important)
  });
});
});
</script>



<div class="map-wrap">


<div
  class="canvas-stack"
>
    <canvas bind:this={canvas} class="base" />
    <canvas bind:this={hoverCanvas} class="hover" />

  </div>

</div>

  <canvas bind:this={hitCanvas} style="display:none;" />
  <canvas bind:this={wardHitCanvas} style="display:none;" />

<div class="geo-toggle">
  <div class="toggle-row">
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

  <div class="toggle-row">
    <button
      class:selected={mode === "area"}
      on:click={() => {
        mode = "area";
        drawBaseMap();
      }}
    >
      Hectares
    </button>

    <button
      class:selected={mode === "injunctions"}
      on:click={() => {
        mode = "injunctions";
        drawBaseMap();
      }}
    >
      Counts
    </button>
  </div>
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
        in {hovered?.properties?.["LAD.Name"] ?? "Unknown LAD"}
      </div>

      <div>
        {mode === "injunctions"
          ? `${+hoveredWard.properties.injunction_names || 0} injuncted areas`
          : `${Math.max(0, +hoveredWard.properties.covered_area_ha_rounded || 0)} hectares injuncted`
        }
      </div>
    </div>

{:else if geography === "lad" && hovered}
  <div class="tooltip"
    style="left:{tooltipX + 20}px; top:{tooltipY - 10}px;"
  >

    <div>
      {hovered.properties["LAD.Name"] ?? "Unknown LAD"}
    </div>

    <div>
      {mode === "injunctions"
        ? `${+hovered.properties["Injunction.Names"] || 0} injuncted areas`
        : `${Number(getValue(hovered) || 0).toFixed(2)} hectares injuncted`
      }
    </div>
  </div>
{/if}



<style>
.map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-stack {
	position: absolute;
	inset: 0 0 0 0;


	transition:
		opacity 400ms ease,
		transform 600ms ease;

	z-index: 1;

}

@media (max-width: 900px) {
  .canvas-stack {
    inset: 0px 0 0 0;

  }
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

text-shadow:
  0 1px 2px rgba(0, 0, 0, 0.6),
  0 0 6px rgba(0, 0, 0, 0.3);
}

.geo-toggle {
  position: absolute;
  top: 20px;
  right: 12px;
  z-index: 20;

display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end; /* THIS is the key */

}


.geo-toggle button {
  background: none;
  border: 0.7px solid white;
  color: white;

  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;

  cursor: pointer;

  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.geo-toggle button.selected {
	background: rgba(255,255,255,0.10);
	border-color: rgba(252,253,79,0.55);
	color: #fcfd4f;

}



.toggle-row {
  display: flex;
  gap: 6px;
}



@media (max-width: 900px) {
	.canvas-stack {
		inset: 0 0 0 0; /* height of mobile header */
	}
}

.legend-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  height: 190px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  padding: 0 1.2rem;
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