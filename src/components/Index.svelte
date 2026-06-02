<script>
	import Map from "../components/Map.svelte";

	const sections = [
		{
			id: "map",
			title: "Protest Injunctions Cover Large Areas of the UK",
			text: "Overview of injunction coverage across wards and LADs."
		},
		{
			id: "map2",
			title: "Many Areas are Impacted by different Protest Injunctions",
			text: "A section about the number of injunctions"
		},
		{
			id: "stories",
			title: "Stories",
			text: "Individual accounts and impacts of injunctions."
		},
		{
			id: "resources",
			title: "Resources",
			text: "Further reading, datasets, and methodology."
		},
		{
			id: "acknowledgements",
			title: "Acknowledgements",
			text: "Credits, collaborators, and data sources."
		}
	];
</script>

<div class="page">

	<!-- LEFT MAP -->
	<div class="map-column">

		<!-- MAP -->
		<div class="map-sticky">
			<Map />
		</div>

	</div>

	<!-- RIGHT TEXT -->
	<div class="text-column">

		{#each sections as section}
			<section class="step" id={section.id}>
				<h2>{section.title}</h2>
				<p>{section.text}</p>
			</section>
		{/each}

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

/* LEGEND BAR */
.legend-bar {
	height: 10px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 0 1.5rem;
	position: sticky;
	top: 0;
	z-index: 30;
	background: #0a061b;
}

/* MAP AREA */
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



/* RIGHT TEXT */
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
	margin: -3vh 0;
}

h2 {
	font-size: 2rem;
	margin-bottom: 1rem;
}

p {
	font-size: 1.1rem;
	line-height: 1.7;
	color: #d0d0d0;
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

	h2 {
		font-size: 1.6rem;
	}

	p {
		font-size: 1rem;
		line-height: 1.6;
	}
}

</style>