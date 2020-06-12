class Account {
    constructor(symbol, startBalance, amount = 1) {
        this.balance = startBalance;
        this.symbol = symbol;
        this.amount = amount;
    }
}

export class PlayerAccount extends Account {
    constructor(symbol, startBalance) {
        super(symbol, startBalance, 0);
    }
}

export class NPCAccount extends Account{
    takeARisk() {
        const dice = getRandomInt(1, 20);
        let balance = this.balance;
        if (dice === 1) {
            balance = balance + Math.min(Math.max((balance * 1.25) - balance, -20), 20);
        } else if(dice === 20) {
            balance = balance + Math.min(Math.max((balance * 0.5) - balance, -10), 10);
        } else {
            const factor = (((dice - 2) / 17) * 0.4) + 0.9;
            balance = balance + Math.min(Math.max((balance * factor) - balance, -5), 5);
        }
        return new NPCAccount(this.symbol, balance, this.amount);
    }
}

export class EmptyAccount extends Account {
    constructor() {
        super('', 0, 0);
    }
}

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min + 1));
}