export interface UpgradeOptions {
  id?: number;
  name: string;
  price?: number;
  oneTimePurchase?: boolean;
  description: string;
  isCps?: boolean;
}

export class Upgrade {
  id: number;
  name: string;
  basePrice: number;
  price: number;
  oneTimePurchase: boolean;
  description: string;
  isCps: boolean;
  coffeePerSecond: number;
  totalCoffeePerSecond: number;

  callback: () => any;

  disabled = false;
  amountPurchased = 0;

  constructor(
    {
      id,
      name,
      description,
      price,
      isCps,
      oneTimePurchase = false,
    }: UpgradeOptions,
    callback: () => any = () => null
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.isCps = isCps;
    this.coffeePerSecond = 0;
    this.totalCoffeePerSecond = 0;
    this.basePrice = price;
    this.oneTimePurchase = oneTimePurchase;
    this.callback = callback;

    if (this.isCps && this.id > 0) {
      let cps = Math.ceil(Math.pow(this.id * 1, this.id * 0.5 + 2) * 10) / 10;
      //clamp 14,467,199 to 14,000,000 (there's probably a more elegant way to do that)
      let digits = Math.pow(10, Math.ceil(Math.log(Math.ceil(cps)) / Math.LN10)) / 100;
      this.coffeePerSecond = Math.round(cps / digits) * digits;

      this.basePrice = (this.id * 1 + 9 + (this.id < 5 ? 0 : Math.pow(this.id - 5, 1.75) * 5)) * Math.pow(10, this.id) * Math.max(1, this.id - 14);
      digits = Math.pow(10, Math.ceil(Math.log(Math.ceil(this.basePrice)) / Math.LN10)) / 100;
      this.basePrice = Math.round(this.basePrice / digits) * digits;
      this.price = this.basePrice;
    }
  }

  purchase() {
    this.amountPurchased++;
    this.increasePrice();

    if (this.callback) {
      this.callback();
    }

    if (this.isCps) {
        this.totalCoffeePerSecond = this.coffeePerSecond * this.amountPurchased;
    }

    if (this.oneTimePurchase) {
      this.disabled = true;
    }
    return this;
  }

  increasePrice() {
    this.price = Math.ceil(
      this.basePrice * Math.pow(1.15, this.amountPurchased)
    );
  }
}
