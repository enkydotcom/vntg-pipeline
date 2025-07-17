import axios from 'axios';
import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

const proxy = 'http://eu.proxy-jet.io:1010';
const username = '2506208QIbu-dc-FR-ip-7792191';
const password = 'Mb8vIFB9kLNP92M';
const API_BASE = 'https://my.enky.com/api/1.1/wf';
const AUTH_HEADER = { 'Authorization': 'Bearer cccd9fff2b82f7cd24ae3ce68564e9c6' };
const TIMEOUT = 15000;

async function launchBrowser() {
  return puppeteer.launch({
    args: [
      `--proxy-server=${proxy}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    headless: false,
    ignoreHTTPSErrors: true
  });
}

async function createNewPage(browser) {
  const page = await browser.newPage();
  await page.authenticate({ username, password });
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    if (resourceType === 'font' || resourceType === 'media') {
      request.abort();
    } else {
      request.continue();
    }
  });
  return page;
}

async function extractPriceFromPage(page) {
  return await page.evaluate(() => {
    const extractPrice = (priceText) => {
      const match = priceText?.match(/([\d\s,.]+)/g);
      return match ? match[0].replace(/\s/g, '').replace(',', '.') : '';
    };
    const rawPrice = document.querySelector('#item_price span:nth-child(2)')?.innerText.trim() || '';
    return extractPrice(rawPrice);
  });
}

async function main() {
  try {
    console.log('🔎 Récupération des URLs publiées...');
    const res = await axios.get(`${API_BASE}/vintage_published_products`, { headers: AUTH_HEADER });
    const urls = Array.isArray(res.data) ? res.data : res.data?.response || [];
    console.log(`📦 ${urls.length} URLs récupérées.`);
    let soldCount = 0;
    let postCount = 0;
    const BATCH_SIZE = 10;
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const browser = await launchBrowser();
      for (const url of batch) {
        let page;
        try {
          page = await createNewPage(browser);
          await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });
          const price = await extractPriceFromPage(page);
          if (price && price.trim().toLowerCase() === 'sold') {
            soldCount++;
            try {
              await axios.post(
                `${API_BASE}/vintage_product_sold`,
                { url },
                { headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' } }
              );
              postCount++;
              console.log(`✅ Produit SOLD signalé : ${url}`);
            } catch (err) {
              console.error(`❌ Erreur lors du POST pour ${url} : ${err.message}`);
            }
          } else {
            console.log(`ℹ️ Produit NON SOLD : ${url} (prix détecté : ${price})`);
          }
        } catch (err) {
          console.error(`❌ Erreur lors du traitement de ${url} : ${err.message}`);
        } finally {
          if (page) await page.close();
        }
        await new Promise(r => setTimeout(r, 1000)); // Délai de 1 seconde entre chaque URL
      }
      await browser.close();
    }
    console.log(`🎯 ${soldCount} produits SOLD détectés, ${postCount} POST envoyés.`);
  } catch (err) {
    console.error('❌ Erreur générale :', err.message);
  }
}

main(); 