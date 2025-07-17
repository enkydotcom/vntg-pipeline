# vntg-pipeline

Node.js scripts to automate vintage product management for Enky/VNTG.

## Folder structure

- `vntg_mark_sold.js`:
  - Loops through published product URLs, opens each page, detects if the product is marked as SOLD (price = 'SOLD'), and notifies the Enky API.
  - Works in batches of 10 URLs, with a 1-second delay between each URL.

- `vntg_scraper.js`:
  - Scrapes new products from the VNTG platform, extracts all useful information, and sends it to the Enky API.
  - Uses Puppeteer with proxy and StealthPlugin.

- `vntg_pipeline.js`:
  - Full pipeline: first runs the SOLD detection/processing, then scrapes new products.
  - Displays clear logs in French.

## Usage

1. Install the required dependencies (in this folder):
   ```bash
   npm install puppeteer-extra puppeteer-extra-plugin-stealth axios
   ```

2. Run the full pipeline:
   ```bash
   node vntg_pipeline.js
   ```

3. (Optional) You can run each script separately if needed:
   ```bash
   node vntg_mark_sold.js
   node vntg_scraper.js
   ```

## Requirements
- Node.js >= 18
- Access to the Enky API with a valid token (see variables in the scripts)
- Proxy configured if needed (see variables in the scripts)

## Customization
- Edit the parameters (proxy, token, batch size, delay, etc.) directly in the scripts as needed.

---

For any questions or improvements, open an issue or contact the Enky team.
