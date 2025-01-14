let lastFetchedSignals = null;

// Function to get the current UTC time as a Date object
function getCurrentUtcTime() {
    return new Date(new Date().toISOString());
}

// Function to fetch the combined data from combined.json
async function fetchCombinedData() {
    try {
        const worldTime = getCurrentUtcTime();
        console.log('Current World Time (UTC):', worldTime);

        // Fetch combined.json with cache-busting to always get the latest file
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

        // Update relative time immediately after fetching and updating the table
        await updateRelativeTime(lastUpdatedTime);

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
        const row = table.insertRow();
        row.insertCell(0).innerText = signal.currency_pair;

        const actionCell = row.insertCell(1);
        actionCell.innerText = signal.action;
        actionCell.className = signal.action.toLowerCase();

        row.insertCell(2).innerText = signal.entry_price;
        row.insertCell(3).innerText = signal.stop_loss;
        row.insertCell(4).innerText = signal.take_profit;

        const statusCell = row.insertCell(5);
        statusCell.innerText = signal.status || 'Pending';
    });
}

// Function to calculate and display the relative time
async function updateRelativeTime(lastUpdatedTime) {
    try {
        const currentTime = getCurrentUtcTime();
        const parsedLastUpdatedTime = new Date(lastUpdatedTime); // Ensure the date is parsed as UTC
        const diffInSeconds = Math.floor((currentTime - parsedLastUpdatedTime) / 1000);
        console.log('Time Difference in Seconds:', diffInSeconds);

        if (diffInSeconds < 0) {
            console.warn('Last updated time is in the future.');
            document.getElementById('relativeTime').innerText = 'Future';
            return;
        }

        let relativeTimeText = '';

        if (diffInSeconds < 60) {
            relativeTimeText = `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            relativeTimeText = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            relativeTimeText = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            relativeTimeText = `${days} day${days !== 1 ? 's' : ''} ago`;
        }

        document.getElementById('relativeTime').innerText = relativeTimeText;
    } catch (error) {
        console.error('Error updating relative time:', error);
        document.getElementById('relativeTime').innerText = 'Error';
    }
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