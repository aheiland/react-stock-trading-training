import React from 'react';

export default class Trading extends React.Component {
    constructor(props) {
        super(props);
        this.refCollection = [];
    }

    handleSubmit(event, firm) {
        event.preventDefault();
        this.props.onBuy(firm.symbol, this.props.getPrice(firm), parseInt(this.refCollection[firm.symbol].value));
    }

    firmItems () {
        return this.props.firms.map(firm => {
            const price = Number.parseFloat(this.props.getPrice(firm))
                .toFixed(2);
            return (
                <div key={firm.symbol} className="firm">
                    <div className="firm-head">
                        {firm.symbol}
                        <span className="firm-price">(Price: {price})</span>
                        <span
                            className="firm-amount">(Available Amount: {this.props.getAmount(
                            firm) - 1})</span>
                    </div>
                    <form className="firm-body"
                          onSubmit={event => this.handleSubmit(event, firm)}>
                        <input type="number"
                               max={this.props.getAmount(firm) - 1} min="0"
                               ref={instance => this.refCollection[firm.symbol] = instance}/>
                        <button>BUY</button>
                    </form>
                </div>
            );
        });
    }

    render() {
        return (
            <section className="firm-container">
                {this.firmItems()}
            </section>
        );
    }
}