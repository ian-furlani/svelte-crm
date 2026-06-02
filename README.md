# Svelte CRM
This is a lightweight, simple and 100% local CRM (Customer Relationship Management) system written in [Svelte](https://svelte.dev/) and [Electron.js](https://www.electronjs.org/) using a local [SQLite database](https://sqlite.org/).

https://github.com/user-attachments/assets/ad80e3e9-ce96-450f-b3b7-19f8b0b568d7

## Installation
```bash
git clone https://github.com/ian-furlani/svelte-crm.git
cd svelte-crm
npm install
npm run dev
```

You may need to [install Node.js](https://nodejs.org/en/download) first.
## Features
- Adding customers
- Adding purchases manually
- Adding purchases by scanning a code_128 barcode
- View purchase history
- Removing purchases
- Searching for customers based on their first name, last name or both
## Usage
- To **add a customer**, click the "Add New Customer" button
- To **manually add a purchase**, left click on any column of the customer's row.
- To **add a purchase by scanning a barcode**, click the "Scan Code" button. Scanning codes was tested working on MacOS Tahoe 26.5.
- To see **purchase history**, right click on any column of the customer's row.
- To **remove a purchase**, go to the purchase history window first and then right click on the purchase you wish to remove.
- To **search for customers**, use the Search textbox in the bottom-right corner of the **customers table**.
