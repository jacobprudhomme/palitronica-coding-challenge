<script>
	import { onMount } from 'svelte';

	let customers = null;
	let items = null;
	onMount(async () => {
		let res = await fetch(`http://localhost:3000/items`);
		items = await res.json();

		res = await fetch(`http://localhost:3000/customers`);
		customers = await res.json();
	});
</script>

<main>
	{#if items.length > 0}
		<h1>Here are the items:</h1>
		<ul>
			{#each items as item (item.id)}
				<li>{item.id}</li>
			{/each}
		</ul>
	{:else}
		<p>Loading</p>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
