import { Upgrade } from "./Upgrade";
import { derived, get, writable } from 'svelte/store';



// Money / Passive Income
export const money = writable(0);
export const moneyPerSecond = writable(0);
export const moneyPercentModifier = writable(1);

// Clicks
export const clicks = writable(0);
export const clickAddition = writable(0);
export const clickMultiplier = writable(1);
export const clickPercentModifier = writable(1);
export const clickPower = derived([clickAddition, clickMultiplier, clickPercentModifier], ([$add, $mult, $perc]) => {
    return Math.ceil((1 + $add * $mult) * $perc);
})

const upgrds = [
    new Upgrade(
        {name: "Increment Click Power", price: 10, description: "Increase the power of your clicks by 1"},
        () => { clickAddition.set(get(clickAddition) + 1); }),
    new Upgrade(
        {name: "10% Click Power increase", price: 100, description: "Increase the power of your clicks by 10%"},
        () => { clickPercentModifier.set(get(clickPercentModifier) + 0.1) }),
    new Upgrade(
        {name: "Double ClickPower increase", price: 1000, oneTimePurchase: true, description: "Increase the power of your clicks by 2x"},
        () => { clickMultiplier.set(get(clickMultiplier) + 1) }),
    new Upgrade({id: 1, name: "Frenchpress", description: "Drips a coffee drop now and then", isCps: true}),
    new Upgrade({id: 2, name: "Capsule Machine", description: "Get a quick cup of coffee", isCps: true}),
    new Upgrade({id: 3, name: "Mocha Master", description: "Can make a pot of coffee rather quick", isCps: true}),
    new Upgrade({id: 4, name: "Cappuccino Machine", description: "Now we're getting fancy coffee worth more", isCps: true}),
    new Upgrade({id: 5, name: "Espresso Machine", description: "Long sleepless nights?", isCps: true}),
    new Upgrade({id: 6, name: "KitchenAid Classic", description: "Even helps clean the kitchen", isCps: true}),
    new Upgrade({id: 7, name: "Coisinart Grind & Brew", description: "Your neighbors start showing up for breakfast", isCps: true}),
    new Upgrade({id: 8, name: "Breville The Oracle Touch", description: "Developers has moved in with you", isCps: true}),
    new Upgrade({id: 9, name: "De'Longhi Dinamica Plus", description: "Every morning a ray of sunlight shines on your house", isCps: true}),
    new Upgrade({id: 10, name: "Nespresso Vertuo Next", description: "Jesus sometimes stops by for a cup", isCps: true}),
]

// Coffee machines
// Nespresso Vertuo Next
// De'Longhi Dinamica Plus
// Breville The Oracle Touch
// Coisinart Grind & Brew
// KitchenAid Classic
// Espresso Machine
// Cappuccino Machine
// Capsule Machine


// Upgrades
export const upgradesPurchased = writable(0);
export const upgrades = (upgrades => {
    const { subscribe, set, update } = writable(upgrades);
    return {
        subscribe,
        purchase: (upgradeName: string) => {
            const upgrade = upgrades.find(u => u.name === upgradeName);
            const moneySpent = upgrade.price;
            upgrade.purchase();

            set(upgrades);
            
            return moneySpent;
        }
    };
})(upgrds);