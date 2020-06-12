class Transaction {
    constructor(symbol, what, price, amount) {
        this.symbol = symbol;
        this.what = what;
        this.price = price;
        this.amount = amount;
    }

    getAmountDiff() {
        return this.amount;
    }

    getWorth() {
        return this.price * this.amount;
    }
}

export class BuyTransaction extends Transaction {
    constructor(symbol, what, price, amount) {
        super(symbol, what, -price, amount);
    }
}

export class SellTransaction extends Transaction {
    constructor(symbol, what, price, amount) {
        super(symbol, what, -price, -amount);
    }
}

