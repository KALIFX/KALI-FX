document.addEventListener("DOMContentLoaded", () => {
    const riskTypeSelect = document.getElementById("risk-type");
    const stopLossTypeSelect = document.getElementById("stop-loss-type");
    const riskPercentageGroup = document.getElementById("risk-percentage-group");
    const riskAmountGroup = document.getElementById("risk-amount-group");
    const stopLossPriceGroup = document.getElementById("stop-loss-price-group");
    const stopLossPipsGroup = document.getElementById("stop-loss-pips-group");
    const openPriceGroup = document.getElementById("open-price-group");

    let conversionRates = {
        USD: 1.0,
        EUR: 0.9,
        GBP: 0.8,
        CHF: 0.92,
        ZAR: 18.5,
        AUD: 0.67,
        NZD: 0.64,
        CAD: 1.36,
        JPY: 109.0
    };

    const fetchConversionRates = async () => {
        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/877faa9f33009ebd39c25c71/latest/USD`);
            const data = await response.json();
            conversionRates = data.conversion_rates;
            localStorage.setItem('conversionRates', JSON.stringify(conversionRates));
            localStorage.setItem('lastFetchDate', new Date().toISOString());
            console.log("Conversion rates updated:", conversionRates);
        } catch (error) {
            console.error("Failed to fetch conversion rates:", error);
        }
    };

    const checkAndUpdateRates = () => {
        const lastFetchDate = localStorage.getItem('lastFetchDate');
        if (lastFetchDate) {
            const lastFetchTime = new Date(lastFetchDate).getTime();
            const currentTime = new Date().getTime();
            const timeDifference = currentTime - lastFetchTime;

            if (timeDifference > 24 * 60 * 60 * 1000) {  // 24 hours
                fetchConversionRates();
            } else {
                const storedRates = localStorage.getItem('conversionRates');
                if (storedRates) {
                    conversionRates = JSON.parse(storedRates);
                    console.log("Using stored conversion rates:", conversionRates);
                }
            }
        } else {
            fetchConversionRates();
        }
    };

    const getPipValue = (currencyPair, accountCurrency) => {
        const [baseCurrency, quoteCurrency] = currencyPair.split("/");
        const isJPYPair = currencyPair.includes("JPY");

        let pipValueInBaseCurrency = isJPYPair ? 0.01 : 0.0001;

        let pipValue;

        if (quoteCurrency === "USD") {
            pipValue = pipValueInBaseCurrency;
        } else if (baseCurrency === "USD") {
            pipValue = pipValueInBaseCurrency / conversionRates[quoteCurrency];
        } else {
            const pipValueInQuoteCurrency = pipValueInBaseCurrency / conversionRates[quoteCurrency];
            pipValue = pipValueInQuoteCurrency * conversionRates[baseCurrency];
        }

        if (accountCurrency !== "USD") {
            pipValue /= conversionRates[accountCurrency];
        }

        return pipValue;
    };

    const toggleRiskInput = () => {
        const riskType = riskTypeSelect.value;
        if (riskType === "percentage") {
            riskPercentageGroup.style.display = "block";
            riskAmountGroup.style.display = "none";
            riskAmountGroup.querySelector("input").value = "";
        } else {
            riskPercentageGroup.style.display = "none";
            riskAmountGroup.style.display = "block";
            riskPercentageGroup.querySelector("input").value = "";
        }
    };

    const toggleStopLossInput = () => {
        const stopLossType = stopLossTypeSelect.value;
        if (stopLossType === "price") {
            stopLossPriceGroup.style.display = "block";
            stopLossPipsGroup.style.display = "none";
            openPriceGroup.style.display = "block";
            stopLossPipsGroup.querySelector("input").value = "";
        } else {
            stopLossPriceGroup.style.display = "none";
            stopLossPipsGroup.style.display = "block";
            openPriceGroup.style.display = "none";
            stopLossPriceGroup.querySelector("input").value = "";
            openPriceGroup.querySelector("input").value = "";
        }
    };

    const calculatePositionSize = () => {
        const accountBalance = parseFloat(document.getElementById("account-balance").value) || 0;
        const riskPercentage = parseFloat(document.getElementById("risk-percentage").value) || 0;
        const riskAmount = parseFloat(document.getElementById("risk-amount").value) || 0;
        const openPrice = parseFloat(document.getElementById("open-price").value) || 0;
        const stopLossPrice = parseFloat(document.getElementById("stop-loss-price").value) || 0;
        const stopLossPips = parseFloat(document.getElementById("stop-loss-pips").value) || 0;
        const accountCurrency = document.getElementById("account-currency").value;
        const currencyPair = document.getElementById("currency-pair").value;

        let risk = riskTypeSelect.value === "percentage" ? (riskPercentage / 100) * accountBalance : riskAmount;

        let stopLossInPips = stopLossTypeSelect.value === "price" ? Math.abs(openPrice - stopLossPrice) / (currencyPair.includes("JPY") ? 0.01 : 0.0001) : stopLossPips;

        const pipValue = getPipValue(currencyPair, accountCurrency);

        if (pipValue === 0) {
            document.getElementById("result").innerText = "Error: Invalid pip value.";
            return;
        }

        let positionSizeUnits = risk / (stopLossInPips * pipValue);

        let positionSizeLots = positionSizeUnits / 100000;

        document.getElementById("result").innerText = `Calculated Position Size: ${positionSizeLots.toFixed(2)} lots`;

        console.log(`Risk: ${risk}, Stop Loss in Pips: ${stopLossInPips}, Pip Value: ${pipValue}, Position Size (units): ${positionSizeUnits}`);
    };

    const toggleDropdown = () => {
        const dropdownMenu = document.getElementById("dropdown-menu");
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    };

    toggleRiskInput();
    toggleStopLossInput();

    checkAndUpdateRates();

    riskTypeSelect.addEventListener("change", toggleRiskInput);
    stopLossTypeSelect.addEventListener("change", toggleStopLossInput);
    document.querySelector(".btn").addEventListener("click", calculatePositionSize);
});
function goBack() {
    window.history.back();
}

