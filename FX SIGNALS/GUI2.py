import tkinter as tk
from tkinter import ttk
import json
import requests
from datetime import datetime

# Load JSON data
def load_json(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {"lastUpdatedTime": "", "signals": []}

# Save JSON data
def save_json(file_path, data):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

# Fetch the latest time from TimeZoneDB API
def fetch_latest_time():
    api_key = "6LIN6URVQ6SP"  # Replace with your TimeZoneDB API key
    url = f"http://api.timezonedb.com/v2.1/get-time-zone?key={api_key}&format=json&by=zone&zone=UTC"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Check if the request was successful
        data = response.json()

        # Extract the UTC time string
        utc_time = data['formatted']

        # Parse the datetime string and format it to the desired format
        formatted_time = datetime.strptime(utc_time, "%Y-%m-%d %H:%M:%S").strftime('%Y-%m-%dT%H:%M:%SZ')
        return formatted_time

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from TimeZoneDB: {e}")
        return None

# Update JSON file with the latest time
def update_json_file(file_path, new_time):
    try:
        # Read the existing JSON data
        data = load_json(file_path)

        # Update the 'lastUpdatedTime' field
        data['lastUpdatedTime'] = new_time

        # Write the updated JSON data back to the file
        save_json(file_path, data)

        update_status(f"Successfully updated {file_path} with the latest time.")

    except json.JSONDecodeError as e:
        print(f"Error updating JSON file: {e}")

# Add new entry
def add_entry():
    new_entry = {
        "currency_pair": currency_var.get(),
        "action": action_var.get(),
        "entry_price": entry_price.get(),
        "stop_loss": entry_stop_loss.get(),
        "take_profit": entry_take_profit.get(),
        "status": status_var.get()
    }
    data['signals'].append(new_entry)
    refresh_list()
    clear_entries()
    update_status("Entry added successfully!")

# Update selected entry
def update_entry():
    selected = listbox.curselection()
    if selected:
        index = selected[0]
        
        # Fetch data from entry fields
        updated_entry = {
            "currency_pair": currency_var.get(),
            "action": action_var.get(),
            "entry_price": entry_price.get(),
            "stop_loss": entry_stop_loss.get(),
            "take_profit": entry_take_profit.get(),
            "status": status_var.get()
        }

        # Update the signal in the data list
        data['signals'][index] = updated_entry

        # Refresh the listbox to reflect the updated entry
        refresh_list()
        clear_entries()
        update_status("Entry updated successfully!")
    else:
        update_status("Please select an entry to update.")

# Delete selected entry
def delete_entry():
    selected = listbox.curselection()
    if selected:
        index = selected[0]
        del data['signals'][index]
        refresh_list()
        clear_entries()
        update_status("Entry deleted successfully!")

# Save current state of JSON file
def save_signals():
    save_json(file_path, data)
    update_status("Signals saved successfully!")

# Clear the entry fields
def clear_entries():
    entry_price.delete(0, tk.END)
    entry_stop_loss.delete(0, tk.END)
    entry_take_profit.delete(0, tk.END)
    action_var.set('Buy')
    status_var.set('Open')
    currency_var.set('EUR/USD')

# Refresh the listbox with updated data
def refresh_list():
    listbox.delete(0, tk.END)
    for entry in data['signals']:
        listbox.insert(tk.END, f"{entry['currency_pair']} - {entry['action']} - {entry['status']}")

# Update the status bar with a message
def update_status(message):
    status_bar.config(text=message)

# Populate entry fields with the selected item
def on_listbox_double_click(event):
    selected = listbox.curselection()
    if selected:
        index = selected[0]
        entry_data = data['signals'][index]

        # Populate the entry fields with selected data
        currency_var.set(entry_data['currency_pair'])
        action_var.set(entry_data['action'])
        entry_price.delete(0, tk.END)
        entry_price.insert(0, entry_data['entry_price'])
        entry_stop_loss.delete(0, tk.END)
        entry_stop_loss.insert(0, entry_data['stop_loss'])
        entry_take_profit.delete(0, tk.END)
        entry_take_profit.insert(0, entry_data['take_profit'])
        status_var.set(entry_data['status'])

# Handle "Update Last Updated Time" button click
def handle_update_time():
    latest_time = fetch_latest_time()
    if latest_time:
        update_json_file(file_path, latest_time)

# Function to update the lastUpdatedTime for a selected currency pair
def update_signal_time():
    selected = listbox.curselection()  # Get the selected index from the listbox
    if selected:
        index = selected[0]
        print(f"Selected Index: {index}")  # Debugging - print the selected index

        # Fetch the latest time from TimeZoneDB
        latest_time = fetch_latest_time()
        if latest_time:
            # Update the selected signal's lastUpdatedTime
            data['signals'][index]['lastUpdatedTime'] = latest_time
            print(f"Updated Time for {data['signals'][index]['currency_pair']}: {latest_time}")  # Debugging - print the updated time

            # Save the updated data back to the JSON file
            save_json(file_path, data)
            print(f"Signals saved to {file_path}.")  # Debugging - confirm save

            # Refresh the listbox to reflect the updated time
            refresh_list()
            update_status(f"Successfully updated the time for {data['signals'][index]['currency_pair']} to {latest_time}.")
        else:
            update_status("Failed to update time. Please try again.")
    else:
        update_status("Please select an entry to update the time.")

# Initialize the GUI
root = tk.Tk()
root.title("Forex Signal Manager")

# Load data
file_path = 'signals.json'
data = load_json(file_path)

# Create a frame for the listbox and scrollbar
frame_list = tk.Frame(root)
frame_list.pack(padx=10, pady=10)

# Create a scrollbar and listbox to display entries
scrollbar = tk.Scrollbar(frame_list)
scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

listbox = tk.Listbox(frame_list, height=15, width=50, yscrollcommand=scrollbar.set)
listbox.pack(side=tk.LEFT, fill=tk.BOTH)
scrollbar.config(command=listbox.yview)

# Bind double-click event to listbox
listbox.bind('<Double-1>', on_listbox_double_click)

# Create a frame for the entry fields
frame_entries = tk.Frame(root)
frame_entries.pack(padx=10, pady=10)

# Entry fields
labels = ["Entry Price:", "Stop Loss:", "Take Profit:"]
entries = []

for label in labels:
    row = tk.Frame(frame_entries)
    row.pack(side=tk.TOP, fill=tk.X, pady=2)
    lbl = tk.Label(row, width=15, text=label, anchor='w')
    lbl.pack(side=tk.LEFT)
    entry = tk.Entry(row)
    entry.pack(side=tk.RIGHT, expand=tk.YES, fill=tk.X)
    entries.append(entry)

entry_price, entry_stop_loss, entry_take_profit = entries

# Dropdown menus for currency, action, and status
currency_var = tk.StringVar(value='EUR/USD')
action_var = tk.StringVar(value='Buy')
status_var = tk.StringVar(value='Open')

currency_pairs = [
    "EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF", "AUD/USD", "USD/CAD", 
    "NZD/USD", "USD/ZAR", "EUR/AUD", "EUR/JPY", "GBP/CHF", "GBP/CAD", 
    "GBP/AUD", "AUD/JPY", "AUD/CAD", "AUD/CHF", "NZD/CHF", "NZD/CAD", 
    "EUR/CAD", "GBP/JPY", "CHF/JPY", "EUR/NZD", "CAD/CHF"
]

currency_menu = ttk.Combobox(frame_entries, textvariable=currency_var, values=currency_pairs)
currency_menu.pack(pady=5)

action_menu = ttk.Combobox(frame_entries, textvariable=action_var, values=["Buy", "Sell"])
action_menu.pack(pady=5)

status_menu = ttk.Combobox(frame_entries, textvariable=status_var, values=["Open", "Pending", "Closed"])
status_menu.pack(pady=5)

# Frame for buttons
frame_buttons = tk.Frame(root)
frame_buttons.pack(pady=10)

# Buttons
btn_add = tk.Button(frame_buttons, text="Add", command=add_entry)
btn_add.grid(row=0, column=0, padx=5)

btn_update = tk.Button(frame_buttons, text="Update", command=update_entry)
btn_update.grid(row=0, column=1, padx=5)

btn_delete = tk.Button(frame_buttons, text="Delete", command=delete_entry)
btn_delete.grid(row=0, column=2, padx=5)

# New button for saving signals.json
btn_save_signals = tk.Button(frame_buttons, text="Save Signals", command=save_signals)
btn_save_signals.grid(row=0, column=4, padx=5)

# New button for updating individual signal time
btn_update_signal_time = tk.Button(frame_buttons, text="Update Signal Time", command=update_signal_time)
btn_update_signal_time.grid(row=0, column=5, padx=5)

# Status bar
status_bar = tk.Label(root, text="", bd=1, relief=tk.SUNKEN, anchor=tk.W)
status_bar.pack(side=tk.BOTTOM, fill=tk.X)

refresh_list()

# Start the GUI event loop
root.mainloop()
