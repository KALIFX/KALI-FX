import requests
import json
import os

# Define the API endpoint and your API key
API_KEY = '877faa9f33009ebd39c25c71'
BASE_URL = 'https://v6.exchangerate-api.com/v6/'

# List of currency pairs
CURRENCY_PAIRS = [
    'EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'USD/ZAR', 'EUR/AUD', 'EUR/JPY', 'GBP/CHF', 'GBP/CAD',
    'GBP/AUD', 'AUD/JPY', 'AUD/CAD', 'AUD/CHF', 'NZD/CHF', 'NZD/CAD',
    'EUR/CAD', 'GBP/JPY', 'CHF/JPY', 'EUR/NZD', 'CAD/CHF'
]

def fetch_latest_prices(api_key):
    url = f'{BASE_URL}{api_key}/latest/USD'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: Unable to fetch data. Status code {response.status_code}")
        return None

def load_previous_data(file_path):
    """Load the previous data from forexData.json if it exists."""
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            return json.load(file)
    return None

def get_rate_for_pair(pair, data):
    """Get the conversion rate for a specific pair from the data."""
    base_currency, target_currency = pair.split('/')
    if base_currency in data['conversion_rates'] and target_currency in data['conversion_rates']:
        base_rate = data['conversion_rates'][base_currency]
        target_rate = data['conversion_rates'][target_currency]
        return target_rate / base_rate
    return None

def update_forex_data_file(data, previous_data):
    file_path = 'forexData.json'
    
    # Initialize the new data dictionary with pairs and indicators
    updated_data = {'conversion_rates': {}}
    
    # If there is previous data, compare and add indicators
    if previous_data:
        previous_rates = previous_data.get('conversion_rates', {})
        
        for pair in CURRENCY_PAIRS:
            new_rate = get_rate_for_pair(pair, data)
            old_rate = previous_rates.get(pair, {}).get('rate')
            
            if new_rate is not None:
                if old_rate is not None:
                    if new_rate > old_rate:
                        indicator = "↑"
                    elif new_rate < old_rate:
                        indicator = "↓"
                    else:
                        indicator = "→"
                else:
                    indicator = "→"  # No previous data to compare
                updated_data['conversion_rates'][pair] = {
                    "rate": new_rate,
                    "indicator": indicator
                }
    else:
        # If no previous data, initialize with new data without indicators
        for pair in CURRENCY_PAIRS:
            new_rate = get_rate_for_pair(pair, data)
            if new_rate is not None:
                updated_data['conversion_rates'][pair] = {
                    "rate": new_rate,
                    "indicator": "→"  # No previous data, so default to → (unchanged)
                }
    
    # Write updated data to forexData.json
    with open(file_path, 'w') as file:
        json.dump(updated_data, file, indent=4)
    print(f"{file_path} has been updated.")

def main():
    # Fetch the latest prices
    data = fetch_latest_prices(API_KEY)
    
    if data:
        # Load the previous data
        previous_data = load_previous_data('forexData.json')
        
        # Update the forexData.json file with new rates and indicators
        update_forex_data_file(data, previous_data)

if __name__ == "__main__":
    main()
