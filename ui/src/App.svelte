<script>
	// Data is hardcoded, as specified
	const numCustomers = 5;
	const numItems = 5;

	let customerId;
	let itemQty = Array(numItems);

	let name = null;
	let itemPrices = null;
	let taxRate = null;
	let price = null;
	async function getPrice() {
		// Reset values first, for UI reasons
		name = null;
		itemPrices = null;
		taxRate = null;
		price = null;

		const res = await fetch('http://localhost:3000/payment', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				customerId,
				itemIds: Array.from({ length: numItems }, (_, i) => i + 1),
				itemQty,
			}),
		});
		const { customerName, totalItemPrices, taxComponent, totalPrice } = await res.json();

		// Set values
		name = customerName;
		itemPrices = totalItemPrices;
		taxRate = taxComponent;
		price = totalPrice;
	}
</script>

<main class="container">
	<form on:submit|preventDefault={getPrice}>
		<div>
			<label for="customer-id">Customer ID</label>
			<select name="customer-id" bind:value={customerId} required>
				{#each Array(numCustomers) as _, id (id)}
					<option value={id + 1}>{id + 1}</option>
				{/each}
			</select>
		</div>

		{#each Array(numItems) as _, id (id)}
			<div class="item-row">
				<label for="item-{id + 1}">Item {id + 1}</label>
				<input
					type="number"
					name="item-{id + 1}"
					placeholder="Input quantity"
					bind:value={itemQty[id]}
					required
				/>
				{#if itemPrices}
					<span>Total Price: ${itemPrices[id].toFixed(2)}</span>
				{:else}
					<span></span> <!-- Empty span to fill column -->
				{/if}
			</div>
		{/each}

		<button type="submit">Submit</button>
	</form>

	{#if name && taxRate && price}
		<p>With a tax rate of {taxRate * 100}%, customer {name}'s total order price comes to ${price.toFixed(2)}.</p>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
	}

	select {
		margin: 10px 0;
	}

	.item-row {
		display: flex;
		align-items: center;
	}

	.item-row > label {
		flex: 1;
	}
	.item-row > input {
		flex: 6;
		margin: 10px 0;
	}
	.item-row > span {
		flex: 3;
	}
	.item-row > span {
		margin-left: 20px;
	}

	button {
		margin: 10px 0;
	}

	p {
		margin: 0 auto;
	}
</style>
