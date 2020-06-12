import React, {Component} from 'react';

export default class StockTrader extends React.Component {
    constructor(props) {
        super(props);
    }

    calculateValue(firm, prices) {
        return -2.0 * prices.find(price => price.symbol === firm.symbol).price;
    }

    renderCurrent(prev, current, index) {
        if(prev === undefined) {
            return ;
        }
        const colors = ['#FF0000', '#00FF00', '#00FFFF', '#FF00FF'];

        return current.firms.map((firm, ind) => {
            const prevFirm = prev.firms.find(pFirm => pFirm.symbol === firm.symbol);
            return (
                    <g key={index + firm.symbol}>
                        <line x1={(index * 10) - 10} y1={this.calculateValue(prevFirm, prev.prices) + 1000} x2={(index * 10)} y2={this.calculateValue(firm, current.prices) + 1000}
                              style={{stroke: colors[ind], strokeWidth: "4"}}></line>
                    </g>
                );
            }
        );
    }

    renderHistory() {
        const colors = ['#FF0000', '#00FF00', '#00FFFF', '#FF00FF'];
        return this.props.history.map((current, index, array) => (
            <g key={index}>
                {this.renderCurrent(array[index - 1], current, index)}
                </g>
            )
        );

    }

    renderLabels() {
        const colors = ['#FF0000', '#00FF00', '#00FFFF', '#FF00FF'];
        const current = this.props.history.slice(-1)[0];
        return current.firms.map((firm, index) => (
            <text x={(this.props.history.length * 10)} y={this.calculateValue(firm, current.prices) + 1000} fill={colors[index]} fontSize={50}>{firm.symbol}</text>
        ));
    }

    render() {
        const funds = Number.parseFloat(this.props.funds).toFixed(2);
        return (
            <section>
                <h1>Trade Or View Your Portfolio</h1>
                You may save & load your data<br/>
                Click on 'End Day' to begin a new day!<br/>
                <br/>
                Your funds: ${funds}
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
                     baseProfile="full" style={{
                    width: '80vw',
                    height: '21vw',
                    background: '#000000'
                }} viewBox="0 0 3650 1000">
                    {this.renderHistory()}
                    {this.renderLabels()}
                </svg>
            </section>
        );
    }
}