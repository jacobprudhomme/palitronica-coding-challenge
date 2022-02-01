<script>
	import { onMount } from 'svelte';

	let customerId;
	let itemQty;

	let customers = null;
	let items = null;
	onMount(async () => {
		let res = await fetch(`http://localhost:3000/items`);
		items = await res.json();

		res = await fetch(`http://localhost:3000/customers`);
		customers = await res.json();
	});

	function getPrice() {}
</script>

<main>
	{#if !items || !customers}
		<p>Loading</p>
	{:else}
		<h1>Here are the items:</h1>
		<form on:submit|preventDefault={getPrice}>
			<div>
				<label for="customer-id">Customer ID</label>
				<select name="customer-id" bind:value={customerId}>
					{#each customers as customer (customer.id)}
						<option value={customer.id}>{customer.id} - {customer.first} {customer.last}</option>
					{/each}
				</select>
			</div>


			{#each items as item (item.id)}
				<div>
					<label for="item-${item.id}">Item {item.id}</label>
					<input
						type="number"
						name="item-${item.id}"
						placeholder="Input quantity"
						bind:value={itemQty}
					/>
				</div>
			{/each}
		</form>
	{/if}
</main>
