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
      <h1>Acknowledgements, Data Sources and Methodology</h1>
    </section>

    <section class="step">
      <h2>Data Sources</h2>

      <p>
        Injunction data compiled from publicly available court documents,
        local authority publications and associated legal records.
      </p>

      <p>
        Ward and Local Authority District boundaries sourced from the
        Office for National Statistics.
      </p>
    </section>

    <section class="step">
      <h2>Methodology</h2>

      <p>
        Injunction areas were digitised and analysed using geographic
        boundary data to estimate the total area affected and the number
        of wards and local authorities impacted.
      </p>

      <p>
        Text.
      </p>
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

h1,
h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
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

  p {
    font-size: 1rem;
    line-height: 1.6;
  }
}
</style>