<script>
	import { base } from "$app/paths";
	import wordmark from "$svg/Not1More.svg";

	const nav = [
		{ id: "map", label: "Map" },
		{ id: "stories", label: "Stories" },
		{ id: "resources", label: "Resources" },
		{ id: "acknowledgements", label: "Credits" }
	];

	let active = "map";
	let open = false;

	function goTo(id) {
		active = id;

		const el = document.getElementById(id);
		if (!el) return;

		el.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});

		open = false; // close menu on mobile
	}
</script>

<header class="header">
	<!-- LOGO (always visible) -->
	<a href="{base}/" class="logo" aria-label="home">
		{@html wordmark}
	</a>

	<!-- HAMBURGER (mobile only) -->
	<button class="burger" on:click={() => (open = !open)}>
		☰
	</button>

	<!-- OVERLAY -->
	{#if open}
		<div class="overlay" on:click={() => (open = false)}></div>
	{/if}

	<!-- NAV -->
	<nav class="nav {open ? 'open' : ''}">
		{#each nav as item}
			<button
				class:selected={active === item.id}
				on:click={() => goTo(item.id)}
			>
				{item.label}
			</button>
		{/each}
	</nav>
</header>

<style>
.header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	pointer-events: none; /* allow map interaction except UI */
}

/* LOGO TOP LEFT */
.logo {
	position: absolute;
	top: 0.75rem;
	left: 0.75rem;

	width: 2.8rem;
	opacity: 0.9;
	pointer-events: auto;
}

.logo:hover {
	opacity: 1;
}

.logo :global(svg) {
	width: 100%;
	height: auto;
}

/* DESKTOP NAV */
.nav {
	position: absolute;
	top: 1rem;
	right: 1.5rem;

	display: flex;
	gap: 0.5rem;
	align-items: center;

	pointer-events: auto;
}

/* BUTTON STYLE */
.nav button {
	background: rgba(18, 12, 34, 0.82);
	backdrop-filter: blur(10px);

	border: 1px solid rgba(255,255,255,0.08);
	color: rgba(255,255,255,0.82);

	font-size: 0.72rem;
	font-weight: 600;
	text-transform: uppercase;

	padding: 0.5rem 0.9rem;
	border-radius: 999px;

	cursor: pointer;

	transition: 0.2s ease;
}

.nav button:hover {
	border-color: #ff6a00;
	color: #ff6a00;
}

.nav button.selected {
	background: rgba(255, 106, 0, 0.12);
	border-color: #ff6a00;
	color: #ff6a00;
}

/* HAMBURGER (hidden desktop) */
.burger {
	display: none;
	position: absolute;
	top: 0.6rem;
	right: 0.75rem;

	font-size: 1.5rem;
	background: none;
	border: none;
	color: white;

	pointer-events: auto;
	cursor: pointer;
}

/* OVERLAY */
.overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.5);
	backdrop-filter: blur(2px);
}

/* MOBILE MODE */
@media (max-width: 900px) {

	.burger {
		display: block;
	}

	/* slide-in menu */
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;

		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;

		padding: 5rem 1.5rem;

		width: 75%;
		max-width: 280px;

		background: rgba(10, 6, 27, 0.98);
		backdrop-filter: blur(10px);

		transform: translateX(-100%);
		transition: transform 0.25s ease;
	}

	.nav.open {
		transform: translateX(0);
	}
}
</style>