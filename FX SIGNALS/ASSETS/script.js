let lastFetchedSignals = null;

// Function to get the current UTC time as a Date object
function getCurrentUtcTime() {
    return new Date(new Date().toISOString());
}

// Function to calculate and display the relative time
function getRelativeTime(lastUpdatedTime) {
    const currentTime = new Date();

    // Ensure lastUpdatedTime is a valid date
    const updatedTime = new Date(lastUpdatedTime);
    if (isNaN(updatedTime.getTime())) {
        console.error('Invalid lastUpdatedTime value:', lastUpdatedTime);
        return 'Invalid Date';
    }

    const diffInSeconds = Math.floor((currentTime - updatedTime) / 1000);

    if (diffInSeconds < 0) {
        return 'Future';
    }

    if (diffInSeconds < 60) {
        return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}

// Function to fetch the combined data from signals.json
async function fetchCombinedData() {
    try {
        const worldTime = getCurrentUtcTime();
        console.log('Current World Time (UTC):', worldTime);

        // Fetch signals.json with cache-busting to always get the latest file
        const response = await fetch(`signals.json?timestamp=${new Date().getTime()}`, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Failed to fetch combined data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched Combined Data:', data);

        // Destructure lastUpdatedTime and signals from the combined JSON data
        const { lastUpdatedTime, signals } = data;

        if (!Array.isArray(signals)) {
            throw new TypeError('Fetched data does not contain a signals array.');
        }

        const storedSignals = JSON.parse(localStorage.getItem('signals')) || [];
        console.log('Stored Signals:', storedSignals);

        // Compare the fetched signals with stored signals to check for changes
        if (JSON.stringify(signals) !== JSON.stringify(storedSignals)) {
            lastFetchedSignals = signals;
            localStorage.setItem('signals', JSON.stringify(signals));
            populateTable(signals);

            const beepSound = document.getElementById('beepSound');
            if (beepSound) {
                beepSound.play().catch(error => console.error('Error playing sound:', error));
            }
        } else {
            populateTable(storedSignals);
        }
    } catch (error) {
        console.error('Error fetching combined data or file missing:', error);
        localStorage.removeItem('signals');
        populateTable([]); // Clear the table or show an empty state
    }
}

// Function to populate the table
function populateTable(signals) {
    const table = document.getElementById('signalsTable');
    console.log('Populating Table with Signals:', signals);

    // Clear existing table rows except the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Populate table with new signals
    signals.forEach(signal => {
        // Main row for signal data
        const mainRow = table.insertRow();
        mainRow.insertCell(0).innerText = signal.currency_pair;

        const actionCell = mainRow.insertCell(1);
        actionCell.innerText = signal.action;
        actionCell.className = signal.action.toLowerCase();

        mainRow.insertCell(2).innerText = signal.entry_price;
        mainRow.insertCell(3).innerText = signal.stop_loss;
        mainRow.insertCell(4).innerText = signal.take_profit;

        const statusCell = mainRow.insertCell(5);
        statusCell.innerText = signal.status || 'Pending';

        // Calculate relative time for lastUpdatedTime field
        const lastUpdatedTime = signal.lastUpdatedTime ? getRelativeTime(signal.lastUpdatedTime) : 'N/A';

        // Secondary row for "Last Updated"
        const updatedRow = table.insertRow();
        const updatedCell = updatedRow.insertCell(0);
        updatedCell.colSpan = 6; // Span across all columns
        updatedCell.innerHTML = `<strong>Last Updated:</strong> ${lastUpdatedTime}`;
        updatedCell.style.fontSize = '0.9em';
        updatedCell.style.color = '#555';
        updatedCell.style.textAlign = 'left';
        updatedRow.style.backgroundColor = '#f9f9f9';
    });
}

// Function to start periodic fetching of combined data
function startDynamicUpdates(signalInterval = 60000) {
    fetchCombinedData();  // Initial fetch
    setInterval(fetchCombinedData, signalInterval);  // Periodic fetching
}

document.addEventListener('DOMContentLoaded', () => {
    startDynamicUpdates();
});

// Dropdown menu functionality
document.querySelector('.menu-icon').addEventListener('click', function() {
    var dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.classList.toggle('show');
});

document.addEventListener('click', function(event) {
    var dropdownContent = document.querySelector('.dropdown-content');
    var menuIcon = document.querySelector('.menu-icon');
    if (!menuIcon.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.classList.remove('show');
    }
});

function goBack() {
    window.history.back();
}