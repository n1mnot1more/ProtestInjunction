<script>
	import "$styles/app.css";
	import Header from "$components/Header.svelte";
	import { page } from "$app/stores";
	import { base } from "$app/paths";

	let { children } = $props();
</script>

{#if $page.url.pathname.startsWith(`${base}/map`)}
	<Header />
{/if}


<main id="content">
	{@render children?.()}
</main>