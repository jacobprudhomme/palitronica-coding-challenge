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

		name = customerName;
		itemPrices = totalItemPrices;
		taxRate = taxComponent;
		price = totalPrice;
	}
</script>

<main>
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
					<p>Total Price: ${itemPrices[id]}</p>
				{/if}
			</div>
		{/each}

		<button type="submit">Submit</button>
	</form>

	{#if name && taxRate && price}
		<p>With a tax rate of {taxRate * 100}%, customer {name}'s total order price comes to ${price}</p>
	{/if}
</main>

<style>
	main {
		width: 40vw;
		margin: 0 auto;

		display: flex;
		flex-direction: column;
	}

	.item-row {
		display: flex;
	}

	.item-row > label {
		margin-right: 20px;
	}
</style>
