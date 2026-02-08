/**
 * PDF Merger Utility
 * Merges multiple PDF files into a single PDF document
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Merges multiple PDF files into a single PDF
 * @param {string[]} pdfPaths - Array of absolute paths to PDF files
 * @param {string} outputPath - Path where the merged PDF should be saved
 * @returns {Promise<string>} Path to the merged PDF file
 */
async function mergePDFs(pdfPaths, outputPath) {
    try {
        console.log(`\n📄 Merging ${pdfPaths.length} PDFs into one file...`);

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();

        // Iterate through each PDF file
        for (let i = 0; i < pdfPaths.length; i++) {
            const pdfPath = pdfPaths[i];
            console.log(`  Adding: ${path.basename(pdfPath)} (${i + 1}/${pdfPaths.length})`);

            // Read the PDF file
            const pdfBytes = fs.readFileSync(pdfPath);

            // Load the PDF
            const pdf = await PDFDocument.load(pdfBytes);

            // Copy all pages from this PDF to the merged PDF
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        fs.writeFileSync(outputPath, mergedPdfBytes);

        console.log(`✅ Merged PDF created: ${path.basename(outputPath)}`);
        console.log(`   Total pages: ${mergedPdf.getPageCount()}`);
        console.log(`   File size: ${(mergedPdfBytes.length / 1024).toFixed(2)} KB`);

        return outputPath;

    } catch (error) {
        console.error('❌ Error merging PDFs:', error.message);
        throw new Error(`Failed to merge PDFs: ${error.message}`);
    }
}

/**
 * Merges all PDFs in a directory that match a pattern
 * @param {string} directory - Directory containing PDF files
 * @param {string} pattern - Pattern to match files (e.g., 'fuel-bill-')
 * @param {string} outputFileName - Name for the merged PDF file
 * @returns {Promise<string>} Path to the merged PDF file
 */
async function mergePDFsInDirectory(directory, pattern, outputFileName) {
    try {
        // Get all PDF files matching the pattern
        const files = fs.readdirSync(directory)
            .filter(file => file.includes(pattern) && file.endsWith('.pdf'))
            .sort(); // Sort to maintain order

        if (files.length === 0) {
            throw new Error(`No PDF files found matching pattern: ${pattern}`);
        }

        // Create full paths
        const pdfPaths = files.map(file => path.join(directory, file));

        // Create output path
        const outputPath = path.join(directory, outputFileName);

        // Merge the PDFs
        return await mergePDFs(pdfPaths, outputPath);

    } catch (error) {
        console.error('❌ Error merging PDFs in directory:', error.message);
        throw error;
    }
}

module.exports = {
    mergePDFs,
    mergePDFsInDirectory
};
