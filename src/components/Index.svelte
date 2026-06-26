<script>
  import Map from "../components/Map.svelte";
  import { activePanel } from "$lib/stores/panel";
  import Stories from "./Stories.svelte";

  let mapKey = 0;
  let showHS2 = false;
  let map2El;

  function intersection(node) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        showHS2 = entry.isIntersecting;
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    obs.observe(node);

    return {
      destroy() {
        obs.disconnect();
      }
    };
  }

  function go(panel) {
    activePanel.set(panel === "map" ? "map" : panel);

    if (panel === "map") {
      mapKey += 1; // force remount map (good)
      showHS2 = false; // IMPORTANT reset so it can retrigger cleanly
    }
  }

  // IMPORTANT: reset when leaving map area entirely
  $: if ($activePanel !== "map") {
    showHS2 = false;
  }
</script>

{#if $activePanel !== "stories"}
<div class="page">

	<!-- MAP SIDE -->
	<div class="map-column">
		<div class="map-sticky">
<Map key={mapKey} hs2Visible={showHS2} />
		</div>
	</div>

	<!-- TEXT SIDE -->
	<div class="text-column">

		<section class="step" id="map">
			<h1>Protest Injunctions Across England and Wales</h1>
			<p>
				Interactive exploration of protest injunctions and the
				areas they affect.
			</p>
		</section>

		<section class="step">
			<h2>Protest Activities Targeted</h2>
			<p>text</p>
		</section>

<section class="step" id="map2" bind:this={map2El} use:intersection>
			<h2>The HS2 injunction</h2>

			<p>
				Something on the HS2 injunction. Map zooms into injected area.
			</p>

			<div class="links">
<button on:click={() => go("stories")}>
	Stories →
</button>
				<button on:click={() => go("resources")}>
					Resources →
				</button>

				<button on:click={() => go("credits")}>
					Credits →
				</button>
			</div>
		</section>
	</div>

</div>
{/if}
<!-- ================= PANELS ================= -->


{#if $activePanel === "stories"}
<div class="stories-panel">

	<Stories />

	<div class="stories-nav">
		<button on:click={() => go("resources")}>
			Resources →
		</button>

		<button on:click={() => go("credits")}>
			Credits →
		</button>

		<button on:click={() => go("map")}>
			Map →
		</button>
	</div>

</div>
{/if}

{#if $activePanel === "resources"}
	<div class="panel">
		<div class="panel-inner">

			<section class="step panel-step">
				<h2>Resources</h2>

				<p>
					Useful datasets, legal documents, and methodology used in this project.
				</p>

				<ul>
					<li>Mapping data</li>
					<li>Legal injunction documents</li>
					<li>Research notes</li>
				</ul>

				<div class="links">
<button on:click={() => go("stories")}>
	Stories →
</button>
					<button on:click={() => go("credits")}>
						Credits →
					</button>

					<button on:click={() => go("map")}>
						Map →
					</button>
				</div>
			</section>

		</div>
	</div>
{/if}

{#if $activePanel === "credits"}
	<div class="panel">
		<div class="panel-inner">

			<section class="step panel-step">
				<h2>Credits</h2>

				<p>
					Project contributors and data sources.
				</p>

				<ul>
					<li>Research: </li>
					<li>Design: </li>
					<li>Development: </li>
				</ul>

				<div class="links">
<button on:click={() => go("stories")}>
	Stories →
</button>
					<button on:click={() => go("resources")}>
						Resources →
					</button>

					<button on:click={() => go("map")}>
						Map →
					</button>
				</div>
			</section>

		</div>
	</div>
{/if}

<style>

.page {
	display: flex;
	min-height: 100vh;
	background: #0a061b;
	color: white;
}

/* LEFT MAP */
.map-column {
	width: 60vw;
	display: flex;
	flex-direction: column;
	position: relative;
}

.map-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* RIGHT TEXT */
.text-column {
	width: 40vw;
	padding: 0 3rem;
	z-index: 2;
}

.step {
	min-height: 85vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	max-width: 40rem;
}

/* TYPOGRAPHY */
h1, h2 {
	font-size: 2rem;
	margin-bottom: 1rem;
}

p {
	font-size: 1.1rem;
	line-height: 1.7;
	color: #d0d0d0;
}

/* LINKS (your story-style nav) */



.links {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-top: 2rem;
}

.links a,
.links button {
	font: inherit;
	color: white;
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	text-align: left;

	font-weight: 600;
	font-size: 1rem;
	text-decoration: none;
}

.links a:hover,
.links button:hover {
	text-decoration: underline;
}


/* ================= PANEL OVERLAY (FIXED COLOURS) ================= */

.panel {
	position: fixed;
	top: 0;
	right: 0;
	width: 40vw;
	height: 100vh;

	background: #0a061b; /* SAME as map */
	color: white;

	z-index: 9999;

	display: flex;
	align-items: center;
	justify-content: center;

}

.panel-inner {
	width: 100%;
	padding: 3rem;
}

/* IMPORTANT: force consistent typography inside panel */
.panel h2 {
	font-size: 2rem;
	margin-bottom: 1rem;
	color: white; /* override any yellow tint */
}

.panel p {
	font-size: 1.1rem;
	line-height: 1.7;
	color: #d0d0d0; /* same as map text */
}

.panel ul {
	margin-top: 1rem;
	padding-left: 1.2rem;
	color: #d0d0d0;
}

.panel li {
	margin-bottom: 0.4rem;
}

/* BUTTONS inside panel = SAME STYLE AS MAP LINKS */
.panel .links {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-top: 2rem;
}

.panel .links a,
.panel .links button {
	color: white;
	background: none;
	border: none;
	padding: 0;

	cursor: pointer;
	text-align: left;

	font-weight: 600;
	font-size: 1rem;
	text-decoration: none;

	opacity: 0.9;
}

.panel .links a:hover,
.panel .links button:hover {
	text-decoration: underline;
	opacity: 1;
}

.stories-panel {
	position: fixed;
	inset: 0;
	background: #0a061b;
	color: white;
	z-index: 9999;
	overflow-y: auto;
	padding-bottom: 6rem; /* important so nav has breathing room */
}


.stories-nav {
	position: static; /* was likely fixed or absolute in earlier version */
	margin-top: 6rem;
	margin-left: 16vw; /* align with content like your story column */
	max-width: 760px;  /* match story width */
	padding-right: 3rem;

	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.stories-nav button {
	background: none;
	border: none;
	color: white;

	font: inherit;
	font-weight: 600;
	font-size: 1rem;

	padding: 0;
	cursor: pointer;
	text-align: left;
}

.stories-nav button:hover {
	text-decoration: underline;
}


</style>