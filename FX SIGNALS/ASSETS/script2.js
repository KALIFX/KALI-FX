const targetCurrencies = [
    'EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'USD/ZAR', 'EUR/AUD', 'EUR/JPY', 'GBP/CHF', 'GBP/CAD',
    'GBP/AUD', 'AUD/JPY', 'AUD/CAD', 'AUD/CHF', 'NZD/CHF', 'NZD/CAD',
    'EUR/CAD', 'GBP/JPY', 'CHF/JPY', 'EUR/NZD', 'CAD/CHF'
];

let previousPrices = JSON.parse(localStorage.getItem('previousPrices')) || {};
let forexData = {};

async function loadForexData() {
    try {
        const response = await fetch('forexData.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        forexData = data.conversion_rates;
        updateTickerPrices();
    } catch (error) {
        console.error('Error loading forex data:', error);
    }
}

function updateTickerPrices() {
    const ticker = document.getElementById('ticker');
    if (!ticker) {
        console.error('Ticker element not found');
        return;
    }

    let tickerText = '';

    targetCurrencies.forEach(pair => {
        const rateData = forexData[pair];

        if (rateData) {
            const price = rateData.rate;
            const previousPrice = previousPrices[pair];
            let trendClass = '';
            let arrow = '';

            // Read the indicator from the data
            const indicator = rateData.indicator;

            // Map indicators to appropriate arrows
            switch (indicator) {
                case '↑': // Green up arrow
                    trendClass = 'up';
                    arrow = '▲';
                    break;
                case '↓': // Red down arrow
                    trendClass = 'down';
                    arrow = '▼';
                    break;
                case '→': // No change
                default:
                    trendClass = 'no-change';
                    arrow = '';
                    break;
            }

            tickerText += `${pair}: ${price.toFixed(4)} <span class="${trendClass}">${arrow}</span> | `;

            previousPrices[pair] = price;
            previousPrices[`${pair}_trend`] = trendClass;
        } else {
            console.error(`Missing rate data for pair: ${pair}`);
        }
    });

    ticker.innerHTML = tickerText.slice(0, -3); // Remove the last ' | '

    localStorage.setItem('previousPrices', JSON.stringify(previousPrices));
}

loadForexData();
setInterval(loadForexData, 60000);
