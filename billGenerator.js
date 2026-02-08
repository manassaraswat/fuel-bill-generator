/**
 * Bill Generator Module
 * Uses Puppeteer to automate bill generation on freeforonline.com
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { distributeAmount } = require('./utils/amountDistributor');
const { generateUniqueDates } = require('./utils/dateGenerator');
const { mergePDFsInDirectory } = require('./utils/pdfMerger');

// URL of the fuel bill generator website
const FUEL_BILL_URL = 'https://freeforonline.com/fuel-bills/index.html';

// Download directory
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.join(__dirname, 'downloads');

// Configuration
const MAX_RETRIES = 3;
const PAGE_TIMEOUT = 60000; // 60 seconds
const ELEMENT_TIMEOUT = 10000; // 10 seconds

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

/**
 * Generates multiple fuel bills based on provided parameters
 * @param {Object} params - Bill generation parameters
 * @returns {Promise<Object>} Result with success status and generated bills info
 */
async function generateBills(params) {
    const {
        stationName,
        fuelRate,
        template,
        totalAmount,
        numberOfBills,
        maxAmountPerBill,
        startDate,
        endDate
    } = params;

    let browser = null;
    const generatedBills = [];

    try {
        console.log('Starting bill generation...');
        console.log(`Parameters: ${numberOfBills} bills, Total: ₹${totalAmount}`);

        // Distribute amounts across bills
        const amounts = distributeAmount(totalAmount, numberOfBills, maxAmountPerBill);
        console.log('Amount distribution:', amounts);

        // Generate unique dates with 3-day minimum spacing
        console.log('Generating unique dates with 3-day spacing...');
        const uniqueDates = generateUniqueDates(numberOfBills, startDate, endDate, 3);
        console.log('Dates generated successfully');

        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('Browser launched successfully');

        // Generate each bill with retry logic
        for (let i = 0; i < numberOfBills; i++) {
            console.log(`\nGenerating bill ${i + 1} of ${numberOfBills}...`);

            const billData = {
                stationName,
                fuelRate,
                template,
                amount: amounts[i],
                ...uniqueDates[i]  // Use pre-generated unique date
            };

            // Retry logic
            let billInfo = null;
            let lastError = null;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    billInfo = await generateSingleBill(browser, billData, i + 1);
                    console.log(`Bill ${i + 1} generated successfully`);
                    break; // Success, exit retry loop
                } catch (error) {
                    lastError = error;
                    console.error(`  Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);

                    if (attempt < MAX_RETRIES) {
                        const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s
                        console.log(`  Retrying in ${waitTime / 1000} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }

            if (!billInfo) {
                throw new Error(`Failed to generate bill ${i + 1} after ${MAX_RETRIES} attempts: ${lastError.message}`);
            }

            generatedBills.push(billInfo);
        }

        console.log('\nAll bills generated successfully!');

        // Merge all generated PDFs into one file
        let mergedPdfPath = null;
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const mergedFileName = `fuel-bills-merged-${timestamp}.pdf`;

            mergedPdfPath = await mergePDFsInDirectory(
                DOWNLOAD_DIR,
                'fuel-bill-',
                mergedFileName
            );

            console.log(`\n🎉 Success! All bills merged into: ${mergedFileName}\n`);
        } catch (mergeError) {
            console.warn(`\n⚠️  Warning: Could not merge PDFs: ${mergeError.message}`);
            console.log('Individual bills are still available in the downloads folder.\n');
        }

        return {
            success: true,
            billsGenerated: numberOfBills,
            bills: generatedBills,
            downloadDirectory: DOWNLOAD_DIR,
            mergedPdf: mergedPdfPath ? path.basename(mergedPdfPath) : null
        };

    } catch (error) {
        console.error('Error generating bills:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    }
}

/**
 * Generates a single fuel bill
 * @param {Browser} browser - Puppeteer browser instance
 * @param {Object} billData - Data for the bill
 * @param {number} billNumber - Bill number for file naming
 * @returns {Promise<Object>} Bill information
 */
async function generateSingleBill(browser, billData, billNumber) {
    const page = await browser.newPage();

    try {
        // Set page timeout
        page.setDefaultTimeout(PAGE_TIMEOUT);

        // Set download behavior
        await page._client().send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: DOWNLOAD_DIR
        });

        // Navigate to the fuel bill generator with timeout handling
        console.log(`  Navigating to ${FUEL_BILL_URL}...`);
        try {
            await page.goto(FUEL_BILL_URL, {
                waitUntil: 'networkidle2',
                timeout: PAGE_TIMEOUT
            });
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Page load timeout - website may be slow or unavailable');
            }
            throw error;
        }

        console.log('  Page loaded, filling form...');

        // Select template
        await selectTemplate(page, billData.template);

        // Fill in the form fields
        await fillBillForm(page, billData);

        // Generate and download the bill
        const fileName = `fuel-bill-${String(billNumber).padStart(3, '0')}.pdf`;
        await downloadBill(page, fileName);

        return {
            billNumber,
            fileName,
            amount: billData.amount,
            date: billData.dateFormatted,
            time: billData.timeFormatted,
            stationName: billData.stationName
        };

    } catch (error) {
        console.error(`  Error generating bill ${billNumber}:`, error.message);
        throw error;
    } finally {
        await page.close();
    }
}

/**
 * Selects the bill template
 * @param {Page} page - Puppeteer page instance
 * @param {string} template - Template number (1, 2, or 3)
 */
async function selectTemplate(page, template) {
    console.log(`  Selecting template ${template}...`);

    const templateSelector = `label[for="template-${template}"]`;

    try {
        // Wait for template selector to be available with timeout
        await page.waitForSelector(templateSelector, { timeout: ELEMENT_TIMEOUT });

        // Click the radio button for the selected template
        await page.click(templateSelector);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for template to load
        console.log(`  Template ${template} selected`);
    } catch (error) {
        if (error.name === 'TimeoutError') {
            throw new Error(`Template selector not found - page may have changed structure`);
        }
        console.error(`  Error selecting template: ${error.message}`);
        throw new Error(`Failed to select template ${template}`);
    }
}

/**
 * Fills in the bill form with provided data
 * @param {Page} page - Puppeteer page instance
 * @param {Object} billData - Bill data to fill
 */
async function fillBillForm(page, billData) {
    console.log('  Filling form fields...');

    try {
        // Wait for form to be ready
        await page.waitForSelector('#fs-station-name', { timeout: ELEMENT_TIMEOUT });

        // Fill station name
        await page.type('#fs-station-name', billData.stationName);

        // Fill fuel rate
        await page.type('#fs-fuel-rate', String(billData.fuelRate));

        // Fill total amount
        await page.type('#fs-amount', String(billData.amount));

        // Fill date (format: YYYY-MM-DD)
        await page.type('#fs-date', billData.date);

        // Fill time (format: HH:mm)
        await page.type('#fs-time', billData.time);

        // Set payment type to "Online"
        await page.select('#u-payment-type', 'Online');

        // Leave vehicle number blank (as per requirements)
        // No action needed - field is already empty

        // Select "None" for tax type (GST IN, CST TIN, TX NO)
        await page.click('#vat-none');

        console.log(`  Form filled successfully with amount: ₹${billData.amount}`);
    } catch (error) {
        if (error.name === 'TimeoutError') {
            throw new Error('Form elements not found - page structure may have changed');
        }
        console.error(`  Error filling form: ${error.message}`);
        throw new Error('Failed to fill bill form');
    }
}

/**
 * Triggers bill download
 * @param {Page} page - Puppeteer page instance
 * @param {string} fileName - Desired file name
 */
async function downloadBill(page, fileName) {
    console.log(`  Triggering PDF generation...`);

    try {
        // Wait for download button to be available
        await page.waitForSelector('#download-fuel-bills', { timeout: ELEMENT_TIMEOUT });

        // Click the download button
        await page.click('#download-fuel-bills');

        // Wait for PDF generation and download
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`  PDF downloaded successfully`);

        // Rename the downloaded file to prevent overwriting
        const defaultFileName = 'Fuel Bill [freeforonline_com].pdf';
        const oldPath = path.join(DOWNLOAD_DIR, defaultFileName);
        const newPath = path.join(DOWNLOAD_DIR, fileName);

        // Wait a bit more to ensure file is fully written
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if the default file exists and rename it
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`  Renamed to: ${fileName}`);
        } else {
            console.warn(`  Warning: Could not find downloaded file to rename`);
        }
    } catch (error) {
        if (error.name === 'TimeoutError') {
            throw new Error('Download button not found - page structure may have changed');
        }
        console.error(`  Error downloading bill: ${error.message}`);
        throw new Error('Failed to download bill PDF');
    }
}

module.exports = {
    generateBills
};
