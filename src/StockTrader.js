import React from 'react';

export default function StockTrader(props) {
    const funds = Number.parseFloat(props.funds).toFixed(2);
    return (
        <section>
            <h1>Trade Or View Your Portfolio</h1>
            You may save & load your data<br/>
            Click on 'End Day' to begin a new day!<br/>
            <br/>
            Your funds: ${funds}
        </section>
    );
}