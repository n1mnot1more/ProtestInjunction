<svelte:head>
	<title>Stories | Protest Injunctions</title>
</svelte:head>

<div class="page">
	<div class="content">

		<section class="hero">
			<p class="eyebrow">Stories</p>

			<h1>
				Personal Stories from Within Injunction Areas
			</h1>

			<p class="standfirst">
				Accounts from people affected by protest injunctions across
				England and Wales. These stories explore how restrictions
				intersect with daily life, activism and local communities.
			</p>
		</section>

		<article class="story">
			<h2>Story One</h2>

			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Vestibulum sit amet mi nec neque ultrices volutpat.
			</p>

			<p>
				Sed cursus, lectus quis consequat vulputate, magna urna
				fermentum arcu, sed efficitur velit velit vitae lorem.
			</p>

			<!-- sketch goes here -->

			<p>
				Curabitur convallis, velit vel posuere luctus, risus massa
				interdum purus, at luctus sem risus nec neque.
			</p>
		</article>

		<article class="story">
			<h2>Story Two</h2>

			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
			</p>

			<p>
				Aliquam erat volutpat. Donec scelerisque nibh id risus
				ultricies, non volutpat mauris facilisis.
			</p>

			<!-- sketch goes here -->
		</article>

		<article class="story">
			<h2>Story Three</h2>

			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
			</p>

			<p>
				Praesent at nunc vel neque hendrerit tincidunt.
			</p>
		</article>

	</div>
</div>

<style>

.page {
	background: #0a061b;
	color: white;
	min-height: 100vh;
	padding: 8rem 0;
}

.content {
	max-width: 760px;
	margin-left: 16vw;
	margin-right: 3rem;
}

/* HERO */

.hero {
	margin-bottom: 8rem;
}

.eyebrow {
	font-size: 0.8rem;
	text-transform: uppercase;
	letter-spacing: 0.15em;
	color: #9ca3af;
	margin-bottom: 1rem;
}

h1 {
	font-size: clamp(3.5rem, 6vw, 6rem);
	line-height: 0.95;
	font-weight: 700;
	margin: 0 0 2rem 0;
	max-width: 12ch;
}

.standfirst {
	font-size: 1.25rem;
	line-height: 1.8;
	color: #d0d0d0;
	max-width: 38rem;
}

/* STORIES */

.story {
	margin-bottom: 10rem;
}

.story:last-child {
	margin-bottom: 0;
}

h2 {
	font-size: 2rem;
	margin-bottom: 2rem;
}

.story p {
	font-size: 1.15rem;
	line-height: 1.95;
	color: #d0d0d0;
	margin-bottom: 1.5rem;
	max-width: 38rem;
}

/* PLACEHOLDER FOR FUTURE SKETCHES */

.story :global(img) {
	display: block;
	width: 100%;
	max-width: 600px;
	margin: 4rem 0;
	border-radius: 12px;
}

/* OPTIONAL QUOTES */

blockquote {
	margin: 3rem 0;
	padding-left: 1.5rem;
	border-left: 2px solid rgba(255,255,255,0.2);
	font-size: 1.4rem;
	line-height: 1.7;
	color: white;
}

/* MOBILE */

@media (max-width: 900px) {

	.page {
		padding: 6rem 0;
	}

	.content {
		margin-left: 1.5rem;
		margin-right: 1.5rem;
		max-width: none;
	}

	.hero {
		margin-bottom: 5rem;
	}

	h1 {
		font-size: 3rem;
		max-width: none;
	}

	.standfirst {
		font-size: 1.05rem;
		line-height: 1.7;
	}

	h2 {
		font-size: 1.6rem;
	}

	.story {
		margin-bottom: 6rem;
	}

	.story p {
		font-size: 1rem;
		line-height: 1.8;
	}
}

</style>