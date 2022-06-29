<script lang="ts">
import { onMount } from "svelte";

	import { clickPower, clicks, money, 
		moneyPercentModifier, moneyPerSecond, 
		upgrades, upgradesPurchased, clickAddition,
		clickMultiplier, clickPercentModifier } from "./stores";

    let _lastFrameMs: number = 0;
	let tick: number = 0;

    function loop(timestamp) {
		let delta = (timestamp - _lastFrameMs) / 1000;
		_lastFrameMs = timestamp;

		$money += ($moneyPerSecond * $moneyPercentModifier) * delta;

		tick++;
		if (tick % 500 === 0) {

			ensureNotNaNValues();
			console.log({$clicks, $money, $moneyPercentModifier, $moneyPerSecond, $upgrades, $upgradesPurchased});

			saveSave();
			tick = 0;
		}
        requestAnimationFrame(loop);
    }

	function ensureNotNaNValues() {
		if (!$money || isNaN($money)) {
			$money = 0;
		}

		if (!$moneyPerSecond || isNaN($moneyPerSecond)) {
			$moneyPerSecond = 0;
		}

		if (!$moneyPercentModifier || isNaN($moneyPercentModifier)) {
			$moneyPercentModifier = 0;
		}

		if (!$clicks || isNaN($clicks)) {
			$clicks = 0;
		}

		if (!$upgradesPurchased || isNaN($upgradesPurchased)) {
			$upgradesPurchased = 0;
		}

		$upgrades.map(u => {
			if (!u.amountPurchased || isNaN(u.amountPurchased)) {
				u.amountPurchased = 0;
			}

			if (!u.price || isNaN(u.price)) {
				u.price = Math.ceil(
					u.basePrice * Math.pow(1.15, u.amountPurchased)
					);
			}

			if (!u.totalCoffeePerSecond || isNaN(u.totalCoffeePerSecond)) {
				u.totalCoffeePerSecond = u.coffeePerSecond * u.amountPurchased
			}

			return u;
		})
	}

	function loadSave() {
		let save = localStorage.getItem("save");
		if (save) {
			let data = JSON.parse(save);
			$clicks = data.clicks;
			$clickAddition = data.clickAddition;
			$clickMultiplier = data.clickMultiplier;
			$clickPercentModifier = data.clickPercentModifier;
			$money = data.money;
			$moneyPercentModifier = data.moneyPercentModifier;
			let cps = 0;

			for (const upgrade of $upgrades) {
				const saveUpgrade = data.upgrades.find(d => d.name === upgrade.name);
				upgrade.amountPurchased = saveUpgrade.amountPurchased;
				upgrade.disabled = saveUpgrade.disabled;
				upgrade.increasePrice();
				if (upgrade.isCps) {
					upgrade.coffeePerSecond = saveUpgrade.coffeePerSecond;
					upgrade.totalCoffeePerSecond = upgrade.coffeePerSecond * upgrade.amountPurchased;
					
					
					cps += upgrade.totalCoffeePerSecond;
				}
			};
			$upgradesPurchased = data.upgradesPurchased;
			$moneyPerSecond = cps;
		}
	}

	function saveSave() {
		let save = {
			clicks: $clicks ?? 0,
			money: $money ?? 0,
			moneyPercentModifier: $moneyPercentModifier ?? 1,
			moneyPerSecond: $moneyPerSecond ?? 0,
			upgrades: $upgrades,
			upgradesPurchased: $upgradesPurchased ?? 0,
			clickAddition: $clickAddition ?? 0,
			clickMultiplier: $clickMultiplier ?? 1,
			clickPercentModifier: $clickPercentModifier ?? 1
		};
		localStorage.setItem("save", JSON.stringify(save));
	}

	onMount(() => {
		loadSave();
		requestAnimationFrame(loop);
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
		<small>v0.1.5</small>
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