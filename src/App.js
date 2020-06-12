import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import StockTrader from "./StockTrader";
import Trading from './Trading';
import Portfolio from './Portfolio';
import { PlayerAccount, NPCAccount, EmptyAccount } from "./Account";
import Ledger from "./Ledger"
import {BuyTransaction, SellTransaction} from "./Transaction";
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    const firms = [
        new NPCAccount('BMW', 10000, 200),
        new NPCAccount('Apple', 10000, 500),
        new NPCAccount('Google', 100000, 500),
        new NPCAccount('Twitter', 5000, 50)
    ];
    this.state = {
      history: [
        {
          account: new PlayerAccount('YOU', 1000),
          firms: firms,
          prices: this.calculatePrices(firms),
          ledger: new Ledger([]),
        }
      ]
    };
  }

  getCurrent() {
    return this.state.history.slice(-1)[0];
  }

  calculatePrices(firms) {
    if (this.state === undefined) {
      return firms.map(firm => {
        return {symbol: firm.symbol, price: firm.balance / firm.amount};
      });
    }
    return firms.map(firm => {
      return {symbol: firm.symbol, price: this.getFunds(firm) / this.getAmount(firm.symbol, firm)};
    });
  }

  getFunds(account) {
    return this.getCurrent().ledger.transactions
        .filter(transaction => transaction.symbol === account.symbol)
        .reduce((carry, current) => carry + current.getWorth(), account.balance);
  }

  getTransactionWorth(symbol, account) {
    return this.getCurrent().ledger.transactions
        .filter(transaction => transaction.what === symbol && transaction.symbol === account.symbol)
        .reduce((carry, current) => carry - current.getWorth(), 0);
  }

  getAmount(symbol, account) {
    return this.getCurrent().ledger.transactions
        .filter(transaction => transaction.symbol === account.symbol && transaction.what === symbol)
        .reduce((carry, current) => carry + current.getAmountDiff(), account.amount);
  }

  getWorth(account) {
    return this.getCurrent().firms
        .filter(firm => firm.symbol !== account.symbol)
        .reduce(
            (carry, current) => carry + this.getTransactionWorth(current.symbol, account),
            this.getFunds(account)
        );
  }

  getStocks(account) {
    return this.getCurrent().firms.map(firm => {
      return {symbol: firm.symbol, amount: this.getAmount(firm.symbol, account)};
    }).filter(stock => stock.amount > 0);
  }

  targetHasSufficentMoney(symbol, neededFunds) {
    const target = this.getCurrent().firms
        .concat([this.getCurrent().account])
        .find(account => account.symbol === symbol);
    return this.getFunds(target) >= neededFunds;
  }

  sourceHasSufficentAmount(symbol, sourceSymbol, neededAmount, unsellable = 1) {
    const source = this.getCurrent().firms
        .concat([this.getCurrent().account])
        .find(account => account.symbol === sourceSymbol);
    return this.getAmount(symbol, source) >= ((neededAmount * 1) + unsellable);
  }

  canBuy(fromSymbol, forSymbol, price, amount) {
    return this.targetHasSufficentMoney(forSymbol, price * amount) &&
        this.sourceHasSufficentAmount(fromSymbol, fromSymbol, amount);
  }

  canSell(target, source, price, amount) {
    return this.targetHasSufficentMoney(target, price * amount) &&
        this.sourceHasSufficentAmount(target, source, amount, 0);
  }

  createBuyTransactions(fromSymbol, forSymbol, price, amount) {
    const toTransaction = new BuyTransaction(forSymbol, fromSymbol, price, amount);
    const fromTransaction = new SellTransaction(fromSymbol, fromSymbol, price, amount);
    return [toTransaction, fromTransaction]
  }

  createSellTransactions(source, target, price, amount) {
    const toTransaction = new BuyTransaction(target, target, price, amount);
    const fromTransaction = new SellTransaction(source, target, price, amount);
    return [toTransaction, fromTransaction]
  }

  buy(fromSymbol, forSymbol, price, amount) {
    if (!this.canBuy(fromSymbol, forSymbol, price, amount)){
      return;
    }
    const newTransactions = this.createBuyTransactions(fromSymbol, forSymbol, price, amount);
    this.updateTransactions(newTransactions);
  }

  updateTransactions(newTransactions) {
    const current = this.getCurrent();
    const befor = this.state.history.slice(0, -1);
    current.ledger = new Ledger(
        this.getCurrent().ledger.transactions.concat(newTransactions));
    const history = befor.concat([current]);
    this.setState({history: history});
  }

  sell(source, target, price, amount) {
    if (!this.canSell(target, source, price, amount)){
      return;
    }
    const newTransactions = this.createSellTransactions(source, target, price, amount);
    this.updateTransactions(newTransactions);
  }

  firmBuysOther(firm, firms) {
    return firms.map(firm => {
      const others = firms.filter(oFirm => oFirm.symbol !== firm.symbol);
      const other = others[getRandomInt(others.length)];
      const amount = getRandomInt(5);
      const price = this.calculatePriceForAccountPice(other);
      if (this.canBuy(other.symbol, firm.symbol, price, amount)) {
        return this.createBuyTransactions(other.symbol, firm.symbol, price, amount);
      }
      return [];
    }).reduce((carry, current) => carry.concat(current), []);
  }

  firmSellsOther(firm, firms) {
    return firms.map(firm => {
      const others = firms.filter(oFirm => oFirm.symbol !== firm.symbol);
      const other = others[getRandomInt(others.length)];
      const amount = getRandomInt(5);
      const price = this.calculatePriceForAccountPice(other);
      if (this.canSell(other.symbol, firm.symbol, price, amount)) {
        return this.createSellTransactions(firm.symbol, other.symbol, price, amount);
      }
      return [];
    }).reduce((carry, current) => carry.concat(current), []);
  }

  advanceDay() {
    const firms = this.getCurrent().firms.slice();
    const firmsAction = firms.map(firm => { return {firm: firm, action: getRandomInt(5)}; });
    const actionResults = firmsAction.map(action => {
      switch (action.action) {
        case 0:
        case 1:
        case 2: return {type: 'firm', change: ((firm) => { return firm.takeARisk(); })(action.firm)}
        case 3: return {type: 'transaction', change: this.firmBuysOther(action.firm, firms)}
        case 4: return {type: 'transaction', change: this.firmSellsOther(action.firm, firms)}
      }
    });

    const newTransactions = actionResults
        .filter(result => result.type === 'transaction')
        .reduce(
            (carry, current) => carry.concat(current.change),
            []
        );

    const newFirms = firms
        .map(firm => {
          let changes = actionResults
              .filter(result => result.type === 'firm' && result.change.symbol === firm.symbol);
          if (changes.length < 1) {
            return firm;
          }
          return changes[0].change;
        });

    this.setState({history: this.state.history.concat([{
        account: this.getCurrent().account,
        ledger: new Ledger(this.getCurrent().ledger.transactions.concat(newTransactions)),
        firms: newFirms,
        prices: this.calculatePrices(newFirms),
      }])
    });
  }

  calculatePriceForAccountPice(account) {
    const price = this.getCurrent().prices.find(price => price.symbol === account.symbol).price;
    return Math.sign(price) * price;
  }

  render () {
    return (
        <Router>
          <div>
            <nav>
              <ul className="menu">
                <li>
                  <NavLink exact={true} activeClassName='active' to="/">Stock Trader</NavLink>
                </li>
                <li>
                  <NavLink exact={true} activeClassName='active' to="/portfolio">Portfolio</NavLink>
                </li>
                <li>
                  <NavLink exact={true} activeClassName='active' to="/trading">Trading</NavLink>
                </li>
              </ul>
              <ul className="menu">
                <li>
                  <button onClick={() => this.advanceDay()}>End Day
                  </button>
                </li>
                <li>
                  Save & Load
                  <ul className="menu menu--sub">
                    <li>
                      <button onClick={() => {
                      }}>Save
                      </button>
                    </li>
                    <li>
                      <button onClick={() => {
                      }}>Load
                      </button>
                    </li>
                  </ul>
                </li>
                <li>
                  $ {Number.parseFloat(this.getFunds(this.getCurrent().account)).toFixed(2)}
                </li>
              </ul>
            </nav>
            <Switch>
              <Route exact={true} path="/">
                <StockTrader funds={this.getFunds(this.getCurrent().account)} history={this.state.history}/>
              </Route>
              <Route path="/portfolio">
                <Portfolio
                    stocks={this.getStocks(this.getCurrent().account)}
                    onSell={(symbol, price, amount) => { this.sell(this.getCurrent().account.symbol, symbol, price, amount) }}
                    getPrice={symbol => { return this.calculatePriceForAccountPice(this.getCurrent().firms.find(firm => firm.symbol === symbol));}}/>
              </Route>
              <Route path="/trading">
                <Trading
                    firms={this.getCurrent().firms}
                    getAmount={account => this.getAmount(account.symbol, account)}
                    getPrice={account => this.calculatePriceForAccountPice(account)}
                    onBuy={(symbol, price, amount) => { this.buy(symbol, this.getCurrent().account.symbol, price, amount) }}
                />
              </Route>
            </Switch>
          </div>
        </Router>
    );
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

export default App;
