<script>
import { base } from "$app/paths";
import { activePanel } from "$lib/stores/panel";
import wordmark from "$svg/Not1More.svg";

const nav = [
	{ type: "panel", panel: "map", label: "Map" },
	{ type: "panel", panel: "stories", label: "Stories" },
	{ type: "panel", panel: "resources", label: "Resources" },
	{ type: "panel", panel: "credits", label: "Credits" }
];

function openPanel(panel) {
	activePanel.set(panel);
	open = false;
}
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

		open = false;
	}
</script>

<header class="header">

	<!-- MOBILE LOGO -->
	<a href="{base}/" class="mobile-logo" aria-label="home">
		{@html wordmark}
	</a>

	<!-- MOBILE BURGER -->
	<button
		class="burger"
		on:click={() => (open = !open)}
		aria-label="menu"
	>
		☰
	</button>

	{#if open}
		<div
			class="overlay"
			on:click={() => (open = false)}
		/>
	{/if}

	<nav class:open={open} class="nav">

		<!-- DESKTOP LOGO -->
		<a href="{base}/" class="nav-logo" aria-label="home">
			{@html wordmark}
		</a>

{#each nav as item}
	<button
		class="nav-button"
		on:click={() => activePanel.set(item.panel)}
	>
		{item.label}
	</button>
{/each}

	</nav>

</header>

<style>

.header {
	background: #0a061b;
	color: white;
}

/* DESKTOP NAV */

.nav-button {
	background: rgba(18, 12, 34, 0.82);

	backdrop-filter: blur(10px);

	border: 1px solid rgba(255,255,255,0.08);

	color: rgba(255,255,255,0.82);

	font-size: 0.72rem;
	font-weight: 600;
	letter-spacing: 0.02em;
	text-transform: uppercase;

	padding: 0.5rem 0.9rem;

	border-radius: 999px;

	cursor: pointer;

	text-decoration: none;

	box-shadow: 0 4px 18px rgba(0,0,0,0.35);

	transition:
		transform 0.18s ease,
		background 0.18s ease,
		border-color 0.18s ease,
		color 0.18s ease;
}

.nav-button:hover {
	transform: translateY(-1px);
	background: rgba(40, 22, 70, 0.92);
	border-color: rgba(255,255,255,0.16);
	color: white;
}




.nav {
	position: fixed;
	top: 1.25rem;
	right: 1.5rem;

	z-index: 1000;

	display: flex;
	align-items: center;
	gap: 0.5rem;

	flex-wrap: wrap;
}

/* DESKTOP LOGO */

.nav-logo {
		display: block;

		position: fixed;
		top: 1 rem;
		left: 1.5rem;

		width: 3.3rem;

		z-index: 1002;
}

.nav-logo:hover {
	opacity: 1;
}

.nav-logo :global(svg) {
	width: 100%;
	height: auto;
	display: block;
}

/* MOBILE LOGO */

.mobile-logo {
	display: none;
}

/* BUTTONS */

.nav button {
	background: rgba(18, 12, 34, 0.82);

	backdrop-filter: blur(10px);

	border: 1px solid rgba(255,255,255,0.08);

	color: rgba(255,255,255,0.82);

	font-size: 0.72rem;
	font-weight: 600;
	letter-spacing: 0.02em;
	text-transform: uppercase;

	padding: 0.5rem 0.9rem;

	border-radius: 999px;

	cursor: pointer;

	box-shadow: 0 4px 18px rgba(0,0,0,0.35);

	transition:
		transform 0.18s ease,
		background 0.18s ease,
		border-color 0.18s ease,
		color 0.18s ease;
}

.nav button:hover {
	transform: translateY(-1px);
	background: rgba(40, 22, 70, 0.92);
	border-color: rgba(255,255,255,0.16);
	color: white;
}

.nav button.selected {
	background: rgba(255,255,255,0.10);
	border-color: rgba(252,253,79,0.55);
	color: #fcfd4f;

	box-shadow:
		0 0 0 1px rgba(252,253,79,0.15),
		0 6px 18px rgba(0,0,0,0.35);
}

/* BURGER */

.burger {
	display: none;
}

/* OVERLAY */

.overlay {
	position: fixed;
	inset: 0;

	background: rgba(0,0,0,0.45);

	backdrop-filter: blur(2px);

	z-index: 999;
}

/* MOBILE */

@media (max-width: 900px) {

	.nav-logo {
		display: none;
	}

	.mobile-logo {
		display: block;

		position: fixed;
		top: 1.5rem;
		left: 1.1rem;

		width: 4rem;

		z-index: 1002;
	}

	.mobile-logo :global(svg) {
		width: 100%;
		height: auto;
		display: block;
	}

	.burger {
		display: block;

		position: fixed;
		top: 3.2rem;
		left: 0.5rem;

		z-index: 1002;

		background: none;
		border: none;

		color: white;
		font-size: 1.8rem;

		cursor: pointer;
	}

	.nav {
		position: fixed;

		top: 0px;
		left: -180px;

		width: 180px;
		height: 100vh;

		padding: 7rem 1rem 1rem;

		background: rgba(10, 6, 27, 0.96);

		backdrop-filter: blur(12px);

		flex-direction: column;
		align-items: stretch;

		gap: 0.75rem;

		transition: left 0.25s ease;

		z-index: 1001;
	}

	.nav.open {
		left: 0;
	}

	.nav button {
		width: 100%;
		text-align: left;
	}
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: transparent;
}
body {
  background: #0a061b;
}

</style>