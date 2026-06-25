<script>
	import Map from "../components/Map.svelte";
	import { onMount } from "svelte";

	let showHS2 = false;

	onMount(() => {
		const el = document.getElementById("map2");

		const obs = new IntersectionObserver(([entry]) => {
			showHS2 = entry.isIntersecting;
		}, { threshold: 0.5 });

		if (el) obs.observe(el);

		return () => obs.disconnect();
	});
</script>

<div class="page">

	<div class="map-column">
		<div class="map-sticky">
<Map hs2Visible={showHS2} />
		</div>
	</div>

	<div class="text-column">

		<section class="step" id="map">
			<h1> Protest Injunctions Across England and Wales</h1>

			<p>
				Interactive exploration of protest injunctions and the
				areas they affect.
			</p>

		</section>


		<section class="step">
			<h2>
				Protest Activities Targeted
			</h2>

			<p>
				text
			</p>
		</section>

		<section class="step" id="map2">
			<h2>
				The HS2 injunction
			</h2>

			<p>
				Something on the HS2 injunction. Map zooms into injected area
			</p>


			<div class="links">
				<a href="/stories">Stories →</a>
				<a href="/resources">Resources →</a>
				<a href="/credits">Credits →</a>
			</div>

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

.links {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-top: 2rem;
}

.links a {
	color: white;
	text-decoration: none;
	font-weight: 600;
	font-size: 1rem;
}

.links a:hover {
	text-decoration: underline;
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