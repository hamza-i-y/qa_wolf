/*
  ||Problem||: 
    - Came across this error in terminal trying to run Playwright.
  
  ||Solution||:
    - Had to run `npx playwright install`.
*/
const { chromium } = require('playwright');

/* 
  ||Problem||: 
    - expect is not defined ? 

    Why use npx playwright test instead of node index.js ? (Recommended in their documentation)

  ||Solution||:
    - Had to import the `expect` method in order to be able to use it.
    ex: `import { expect } from '@playwright/test';`
*/
const { expect, test } = require('@playwright/test');

const fs = require('fs'); //This module is used to read/write from or to files using nodejs (built in package)

test('Get urls/titles', async function saveHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto('https://news.ycombinator.com');

  /*
    Tried to figure out how to access and retrieve data from the DOM, normally would simply use DOM methods such as document.querySelectorAll() to get an array of elements such as:
    `document.querySelectorAll('.athing .title .titleline')`

    Issue `document` was not defined, so investigated the playwright documentation and figured I could use this instead: page.$$eval() to achieve the same goal.

    Correction: Found out issue was not document not defined..was not defined because I was trying to use it outside of the evaluate method xD

    Documentation clearly warns against using page.$$eval()...OOPS

    So discarded below code:

    const titleTexts = await page.$$eval('.athing .title a', (links) => {
      const arrayOfData = [];

      for (let i = 0; i < 10; i++) {
        arrayOfData.push({
          title: titleTexts[i].textContent,
          url: titleTexts[i].
        });
      }
    });
  */

  const topTenTitlesAndURLS = await page.evaluate(() => {
    const retrieveElements = document.querySelectorAll('.athing .titleline');

    const titlesAndURLS = [];

    /**
     * Format for returned object example
     *
     * {
     *  title: "Show HN: Sonauto – a more controllable AI music creator",
     *  url: "https://sonauto.ai/"
     * }
     */
    for (let i = 0; i < 10; i++) {
      titlesAndURLS.push({
        title: retrieveElements[i].firstChild.textContent, //Grab the title
        url: retrieveElements[i].firstChild.href, //Grab the url
      });
    }
    return titlesAndURLS;
  });

  /*
    Write to CSV file the data
  */

  const saveData = topTenTitlesAndURLS
    .map(({ title, url }) => {
      return `${title}: ${url}`;
    })
    .join('\n');

  fs.writeFile('data.csv', saveData, (err) => {
    if (err) {
      console.log('Oops something terrible happened...');
    }

    console.log('Successfully saved data to CSV');
  });

  /*
    NEED TO NOW SAVE THE DATA TO A CSV IN A NICE FORMAT!
  */

  await expect(page).toHaveTitle(/Hacker News/);
});
