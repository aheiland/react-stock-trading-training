import React from 'react';

export default class Portfolio extends React.Component{
    constructor(props) {
        super(props);
        this.refCollection = [];
    }

    handleSubmit(event, symbol) {
        event.preventDefault();
        this.props.onSell(symbol, this.props.getPrice(symbol), parseInt(this.refCollection[symbol].value));
    }

    firmItems () {
        return this.props.stocks.map(stock => {
            let price = Number.parseFloat(this.props.getPrice(stock.symbol)).toFixed(2);
            return (
                    <div key={stock.symbol} className="firm">
                        <div className="firm-head">
                            {stock.symbol}
                            <span className="firm-price">(Price: {price})</span>
                            <span className="firm-amount">(Available Amount: {stock.amount})</span>
                        </div>
                        <form className="firm-body" onSubmit={event => this.handleSubmit(event, stock.symbol)}>
                            <input type="number" max={stock.amount} min="0" ref={instance => this.refCollection[stock.symbol] = instance}/>
                            <button>Sell</button>
                        </form>
                    </div>
                )
            }
        );
    }

    render() {
        return (
            <section>
                <section className="firm-container">
                    {this.firmItems()}
                </section>
            </section>
        );
    }
}