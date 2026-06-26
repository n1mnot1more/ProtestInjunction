<script>
	import { createEventDispatcher } from "svelte";
	import Header from "../components/Header.svelte";


	const dispatch = createEventDispatcher();

	function go(panel) {
		dispatch("go", panel);
	}
</script>


<svelte:head>
	<title>Stories | Protest Injunctions</title>
</svelte:head>

<div class="page">
	<div class="content">

		<section class="hero">
			<p class="eyebrow">Stories</p>

			<h1> Stories About Injuncted Areas</h1>

			<p class="standfirst">
				Accounts from people affected by protest injunctions across England and Wales.
			</p>
		</section>

		<article class="story">
			<h2>Story One</h2>
			<p>Lorem ipsum dolor sit amet...</p>
		</article>

		<article class="story">
			<h2>Story Two</h2>
			<p>Lorem ipsum dolor sit amet...</p>
		</article>

		<article class="story">
			<h2>Story Three</h2>
			<p>Lorem ipsum dolor sit amet...</p>
		</article>


	</div>
</div>

<style>

.page {
	background: #0a061b;
	color: white;
	min-height: 100vh;
	padding: 10rem 0 8rem; /* increased top padding */
}

.content {
	max-width: 900px; /* slightly wider as requested */
	margin-left: 16vw;
	margin-right: 3rem;
}

.hero {
	margin-bottom: 6rem;
}

.eyebrow {
	font-size: 0.8rem;
	text-transform: uppercase;
	letter-spacing: 0.15em;
	color: #9ca3af;
}

h1 {
	font-size: clamp(3rem, 5vw, 5.5rem);
	line-height: 1;
}

.standfirst {
	font-size: 1.25rem;
	color: #d0d0d0;
	max-width: 40rem;
}

.story {
	margin-bottom: 8rem;
}

.story p {
	font-size: 1.15rem;
	line-height: 1.9;
	color: #d0d0d0;
}


.links {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.links button {
	font: inherit;
	color: white;
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;

	font-weight: 600;
	font-size: 1rem;
	text-align: left;
}

.links button:hover {
	text-decoration: underline;
}
</style>