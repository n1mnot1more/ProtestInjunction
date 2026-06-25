<script>
  import Map from "$components/Map.svelte";
</script>

<div class="page">

<div class="map-column">
  <div class="map-sticky">
    <Map animateOnLoad={false} />
  </div>
</div>

  <div class="text-column">

    <section class="step hero">

      <h1>Further Resources</h1>

      <p class="dek">
        Further Resources2
      </p>
    </section>

    <section class="step">
      <p>text text text.</p>
      <p>text text</p>
    </section>

    <section class="step">
      <img
        src="/story/map-drawing-1.jpg"
        alt=""
      />
    </section>

    <section class="step">
      <p>text text</p>
      <p>text</p>
    </section>

    <section class="step">
      <img
        src="/story/panorama.jpg"
        alt=""
      />
    </section>

    <section class="step">
      <h2>text</h2>

      <p>text</p>
      <p>text</p>
    </section>

  </div>

</div>

<style>
.page {
  display: flex;
  min-height: 100vh;
  background: #0a061b;
  color: white;
}

/* LEFT SIDE */

.map-column {
  width: 60vw;
  display: flex;
  flex-direction: column;
  background: #0a061b;
  position: relative;
}

.map-sticky {
  position: sticky;
  top: 10px;
  height: calc(100vh - 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0a061b;
}

/* RIGHT SIDE */

.text-column {
  width: 40vw;
  padding: 0 3rem;
  position: relative;
  z-index: 2;
}

.step {
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 40rem;
}

.hero {
  gap: 0.5rem;
}

.kicker {
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

h1,
h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.dek {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #d0d0d0;
  max-width: 32rem;
}

p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #d0d0d0;
}

.step img {
  width: 100%;
  display: block;
  border-radius: 12px;
}

/* MOBILE */

@media (max-width: 900px) {
  .page {
    display: block;
    position: relative;
  }

  .map-column {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
  }

  .map-sticky {
    position: absolute;
    inset: 0;
    height: 100%;
  }

  .text-column {
    width: 100%;
    padding: 0 1.25rem;
  }

  .step {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 35vh 0;
  }

  .step > * {
    background: rgba(10, 10, 10, 0.82);
    backdrop-filter: blur(6px);
    padding: 1.5rem;
    border-radius: 12px;
  }

  h1,
  h2 {
    font-size: 1.6rem;
  }

  p,
  .dek {
    font-size: 1rem;
    line-height: 1.6;
  }
}
</style>