const fs = require("fs");
const puppeteer = require("puppeteer");
const properties = {
  propertyBuy: [],
  propertyRent: [],
  AddToArray(buyOrRent, data) {
    buyOrRent === "buy"
      ? this.propertyBuy.push(data)
      : this.propertyRent.push(data);
  },
  returnArray(buyOrRent) {
    return buyOrRent === "buy" ? this.propertyBuy : this.propertyRent;
  },
};
const urlData = {
  page: 1,
  returnUrl(buyOrRent) {
    const urlString =
      buyOrRent === "buy"
        ? `https://www.property24.com/for-sale/western-cape/9/p${this.page}?sp=pf%3d200000%26pt%3d2000000%26so%3dPriceLow&PropertyCategory=House%2cApartmentOrFlat%2cTownhouse`
        : `https://www.property24.com/to-rent/western-cape/9/p${this.page}?PropertyCategory=House%2cApartmentOrFlat%2cTownhouse`;
    return urlString;
  },
};

const Property = function (link, type, price, city, foundOnPage) {
  this.link = link;
  this.type = type;
  this.price = price;
  this.city = city;
  this.foundOnPage = foundOnPage;
  this.avgRent = "No data Available";
  this.bedrooms = parseInt(type);
};

function createObject(links, type, price, city, foundOnPage, buyOrRent) {
  for (const [i, link] of links.entries()) {
    const propertyData = new Property(
      link,
      type[i],
      price[i],
      city[i],
      foundOnPage
    );
    console.log(propertyData);
    properties.AddToArray(buyOrRent, propertyData);
  }
}

// Function to change price string to readable number primitive. Also sets estimated bond repayment amount P/M (1% of value)
function priceToNum(data) {
  data.forEach((element) => {
    element.price = Number(element.price.replace("R", "").replaceAll(" ", ""));
    element.monthlyBond = (element.price * 0.01).toFixed(2);
  });
}

// Function to save array of object data to json file
function saveDataToFile(obj, buyOrRent) {
  const data = JSON.stringify(obj);

  // write JSON string to a file
  try {
    fs.writeFileSync(`${buyOrRent}.json`, data);
  } catch (e) {
    console.log(e);
  }
}

// retry function for goTo
async function retry(promiseFactory, retryCount) {
  try {
    return await promiseFactory();
  } catch (error) {
    if (retryCount <= 0) {
      throw error;
    }
    console.log("Retrying");
    return await retry(promiseFactory, retryCount - 1);
  }
}

//main function. First scrapes amount of pages and then runs getdataFunctiioin on all pages
async function scrape(buyOrRent) {
  urlData.page = 1;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(urlData.returnUrl(buyOrRent));
  const totalPages = Number(
    await page.evaluate(
      () => document.querySelector(".pagination li:nth-last-child(1)").innerText
    )
  );

  await page.close();

  for (i = 1; i < totalPages; i++) {
    urlData.page = i;

    console.log(`Scanning page ${i} of ${totalPages}`);
    await getPageData(browser, urlData.returnUrl(buyOrRent), i, buyOrRent);
  }
  priceToNum(properties.returnArray(buyOrRent));
  saveDataToFile(properties.returnArray(buyOrRent), buyOrRent);
  browser.close();
}

async function getPageData(browser, url, foundOnPage, buyOrRent) {
  //const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await retry(() => page.goto(url), 6);
  // { waitUntil: "networkidle2", timeout: 0 }
  /// GRAB TOTAL PAGES
  const totalPages = Number(
    await page.evaluate(
      () => document.querySelector(".pagination li:nth-last-child(1)").innerText
    )
  );
  /// GRABBING LINKS
  const links = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        ".js_listingResultsContainer .js_resultTile:not(.p24_promotedTile) .p24_regularTile:not(.p24_boostedTile) a"
      )
    ).map((house) => house.href)
  );

  /// GRABBING TYPE
  const type = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        ".js_listingResultsContainer .js_resultTile:not(.p24_promotedTile) .p24_regularTile:not(.p24_boostedTile) .p24_content .p24_title"
      )
    ).map((house) => house.innerText)
  );

  /// GRABBING PRICE
  const price = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        ".js_listingResultsContainer .js_resultTile:not(.p24_promotedTile) .p24_regularTile:not(.p24_boostedTile) .p24_content .p24_price"
      )
    ).map((house) => house.innerText)
  );

  /// GRABBING CITY
  const city = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        ".js_listingResultsContainer .js_resultTile:not(.p24_promotedTile) .p24_regularTile:not(.p24_boostedTile) .p24_content .p24_location"
      )
    ).map((house) => house.innerText)
  );

  /// GRABBING BEDROOMS
  /*   const bedrooms = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        '.js_listingResultsContainer .js_resultTile:not(.p24_promotedTile) .p24_regularTile:not(.p24_boostedTile) .p24_content .p24_featureDetails[title="Bedrooms"]'
      )
    ).map((house) => house.innerText)
  );
  console.log(bedrooms); */

  await page.close();

  /// create object from data and push to array
  createObject(links, type, price, city, foundOnPage, buyOrRent);
}

async function scrapeBuyAndRent() {
  await scrape("buy");
  await scrape("rent");
}

scrapeBuyAndRent();
//scrape("buy");
