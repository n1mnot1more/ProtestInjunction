<script>
	import "$styles/app.css";
	import Header from "$components/Header.svelte";
	import { page } from "$app/stores";

	let { children } = $props();
</script>

{#if $page.url.pathname !== "/"}
	<Header />
{/if}

<main id="content">
	{@render children?.()}
</main>