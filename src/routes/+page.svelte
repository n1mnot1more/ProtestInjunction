<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
import { base } from "$app/paths";

function enterSite() {
  goto(`${base}/map`);
}

  let canvas;
  let ctx;

  let lastX = null;
  let lastY = null;

  let drawing = false;
  let unlocked = true;
  let eraseAmount = 0;



  function startErase(e) {
    drawing = true;
    erase(e);
  }

  function stopErase() {
    drawing = false;
    lastX = null;
    lastY = null;
  }

  function erase(event) {

    const rect = canvas.getBoundingClientRect();
    const point = event.touches?.[0] ?? event;

    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";

    ctx.beginPath();

    if (lastX !== null) {
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.1, y + 0.1);
    }

    ctx.stroke();

    ctx.globalCompositeOperation = "source-over";

    lastX = x;
    lastY = y;

      unlocked = true;

  }

  function drawInjunction() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 12;

    const s = 50;

    const left = cx - s;
    const right = cx + s;
    const top = cy - s;
    const bottom = cy + s;

    const midX = cx - s * 0.2;
    const midY = cy + s * 0.2;

ctx.fillStyle = "rgba(255, 122, 26, 0.10)";
    ctx.strokeStyle = "#ff6a00";
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, midY);
    ctx.lineTo(midX, midY);
    ctx.lineTo(midX, bottom);
    ctx.lineTo(left, bottom);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }

  onMount(() => {
    const w = 300;
    const h = 140;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    canvas.width = w;
    canvas.height = h;

    ctx = canvas.getContext("2d");

    drawInjunction();
  });
</script>

<svelte:head>
  <title>Not 1 More Protest Injunction</title>
</svelte:head>

<div class="landing">
  <div class="content">

 <div class="header">
  <span class="header-top">Not 1 More</span><br />
  <span class="header-bottom">Protest<br />Injunction</span>
</div>

    <p class="intro">
The use of Protest Injunctions has been making protesting even more risky. Huge swathes of the UK are currently covered by these punitive court orders. Explore the geography of protest injunctions in England and Wales.
    </p>

    <div class="cta1">
      {#if unlocked}
        <div class="hint">
          ERASE INJUNCTION
        </div>
      {/if}
    </div>

    <div class="widget">
      <canvas
        bind:this={canvas}
        on:pointerdown={startErase}
        on:pointermove={erase}
        on:pointerup={stopErase}
        on:pointerleave={stopErase}
        on:touchstart={startErase}
        on:touchmove={erase}
        on:touchend={stopErase}
      />
    </div>

    <div class="cta1">
      {#if unlocked}

        <button on:click={enterSite}>
          Enter Website →
        </button>
      {/if}
    </div>


  </div>
</div>

<style>
:global(body) {
  margin: 0;
}

.landing {

  min-height: 100dvh;
  overflow: hidden;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a061b;
  color: white;
}

.content {
  text-align: center;
  max-width: 700px;
  padding: 2rem;
}

.header {
  font-size: clamp(2rem, 4.5vw, 4rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.01em;
  margin-bottom: 1.2rem;
}

.header-top {
  font-weight: 800;
  letter-spacing: 0.01em;
  opacity: 1;
  color: #ff6a00;
}

.header-bottom {
  font-weight: 800; /* keep strong emphasis */
  letter-spacing: -0.02em;
}

.intro {
  opacity: 0.85;
  margin-bottom: 1rem;
}

/* canvas wrapper */
.widget {
  display: flex;
  justify-content: center;
  margin-bottom: -1.2rem;
}

canvas {
  cursor: url("/eraser.png") 12 12, auto;
  touch-action: none;
  display: block;
}

/* CTA BELOW CANVAS (CENTERED) */
.cta1 {
  width: 100%;
  margin-top: 0.6rem;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta2 > * {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* hint */
.hint {
  color: #ff6a00;
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.2;

  font-family: "Courier New", "IBM Plex Mono", "Space Mono", monospace;

  animation: pulseHint 1.6s ease-in-out infinite;

  display: inline-block;
  text-align: center;
}

/* arrow points INTO shape */
.arrow {
  display: inline-block;
  font-size: 2rem;
  transform: translateY(-10px);
  line-height: 1;
}

/* button */
button {
  border: none;
  border-radius: 999px;
  padding: 1rem 1.75rem;
  background: white;
  color: #0a061b;
  font-weight: 600;
  cursor: pointer;
  line-height: 1; /* 👈 important */
}



/* animation */
@keyframes pulseHint {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
</style>