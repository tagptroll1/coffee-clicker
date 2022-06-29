<script lang="ts">
import { onMount } from "svelte";

	import { clickPower, clicks, money, moneyPercentModifier, moneyPerSecond, upgrades, upgradesPurchased } from "./stores";

    let _lastFrameMs: number = 0;

    function loop(timestamp) {
		let delta = (timestamp - _lastFrameMs) / 1000;
		_lastFrameMs = timestamp;


		$money += ($moneyPerSecond * $moneyPercentModifier) * delta;

        requestAnimationFrame(loop);
    }

    function start() {
        requestAnimationFrame(loop);
    }


	onMount(() => {
		start();
	});

	function buyUpgrade(upgradeName: string) {
		$money -= upgrades.purchase(upgradeName);
        $upgradesPurchased++;

		let cps = 0;
		for (const upgrade of $upgrades) {
			if (upgrade.isCps) {
				cps += upgrade.totalCoffeePerSecond;
			}
		}

		$moneyPerSecond = cps;
	}

	function handleClick() {
		$clicks++
		$money += $clickPower;
	}

	function beautifyNumber(number: number) {
		return number.toLocaleString("en")
	}
</script>

<main>
	v1.3 test
	<section class="clicking-side">

		<h1>{beautifyNumber(Math.ceil($money))} ☕</h1>
		
		<button on:click={handleClick}>
			Click
		</button>
		<small>{beautifyNumber($moneyPerSecond * $moneyPercentModifier)} ☕/sec</small>
		<small>{$clickPower} 👆</small>
	</section>

	<aside class="shop">
		<h2>Shop</h2>

		<ul>
			{#each $upgrades as upgrade}
				<li>
					<button class="upgrades" disabled={$money < upgrade.price || upgrade.disabled} on:click={() => buyUpgrade(upgrade.name)}>
						{#if !upgrade.disabled && upgrade.amountPurchased > 0}
							{upgrade.amountPurchased} 
						{/if}

						{upgrade.name} 
						<small>{upgrade.description}</small>

						<aside>
							{#if !upgrade.disabled} 
								{beautifyNumber(upgrade.price)} ☕
							{:else }
								Purchased
							{/if}
							{#if upgrade.isCps} 
								<p>
									({beautifyNumber(upgrade.coffeePerSecond)} ☕/sec) 
								</p>
							{/if}
						</aside>
					</button>

				</li>
			{/each}
		</ul>
	</aside>
</main>

<style>
	main {
		display: flex;
		flex-direction: row;
		gap: 5rem;	
		height: 100%;	
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 50%;
		height: 100%;

	}

	aside.shop {
		width: 50%;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	button.upgrades {
		position: relative;

		width: 100%;
		text-align: start;
		padding-right: 5rem;
	}

	small {
		display: block;
	}

	button.upgrades aside {
		height: 100%;
		position: absolute;

		display: flex;
		flex-direction: column;
		justify-content: center;
		right: 1rem;
		bottom: 0;
		text-align: end;
	}

	button.upgrades aside p {
		padding: 0;
		margin: 0;
		text-align: end;
	}

</style>