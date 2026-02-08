/**
 * Validator Utility
 * Validates user inputs for bill generation
 */

/**
 * Validates all form inputs and returns structured error messages
 * @param {Object} data - Form data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateBillGenerationData(data) {
    const errors = [];

    const {
        stationName,
        fuelRate,
        template,
        totalAmount,
        numberOfBills,
        maxAmountPerBill,
        startDate,
        endDate
    } = data;

    // Validate fuel station name
    if (!validateStationName(stationName)) {
        errors.push('Fuel Station Name is required and cannot be empty');
    }

    // Validate fuel rate
    const fuelRateError = validateFuelRate(fuelRate);
    if (fuelRateError) {
        errors.push(fuelRateError);
    }

    // Validate template
    const templateError = validateTemplate(template);
    if (templateError) {
        errors.push(templateError);
    }

    // Validate total amount
    const totalAmountError = validateTotalAmount(totalAmount);
    if (totalAmountError) {
        errors.push(totalAmountError);
    }

    // Validate number of bills
    const numberOfBillsError = validateNumberOfBills(numberOfBills);
    if (numberOfBillsError) {
        errors.push(numberOfBillsError);
    }

    // Validate max amount per bill
    const maxAmountError = validateMaxAmountPerBill(maxAmountPerBill);
    if (maxAmountError) {
        errors.push(maxAmountError);
    }

    // Validate that max amount allows distribution
    if (!totalAmountError && !numberOfBillsError && !maxAmountError) {
        const distributionError = validateDistributionPossible(
            totalAmount,
            numberOfBills,
            maxAmountPerBill
        );
        if (distributionError) {
            errors.push(distributionError);
        }
    }

    // Validate dates
    const dateError = validateDates(startDate, endDate);
    if (dateError) {
        errors.push(dateError);
    }

    // Validate date range can accommodate required spacing
    if (!dateError && !numberOfBillsError) {
        const dateRangeError = validateDateRangeCapacity(
            startDate,
            endDate,
            numberOfBills
        );
        if (dateRangeError) {
            errors.push(dateRangeError);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates fuel station name
 * @param {string} stationName - Station name to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateStationName(stationName) {
    return stationName && typeof stationName === 'string' && stationName.trim().length > 0;
}

/**
 * Validates fuel rate
 * @param {number} fuelRate - Fuel rate to validate
 * @returns {string|null} Error message or null if valid
 */
function validateFuelRate(fuelRate) {
    if (fuelRate === undefined || fuelRate === null || fuelRate === '') {
        return 'Fuel Rate is required';
    }

    const rate = parseFloat(fuelRate);

    if (isNaN(rate)) {
        return 'Fuel Rate must be a valid number';
    }

    if (rate <= 0) {
        return 'Fuel Rate must be greater than 0';
    }

    return null;
}

/**
 * Validates template selection
 * @param {string|number} template - Template selection to validate
 * @returns {string|null} Error message or null if valid
 */
function validateTemplate(template) {
    if (!template) {
        return 'Template selection is required';
    }

    const templateNum = parseInt(template);

    if (isNaN(templateNum) || ![1, 2, 3].includes(templateNum)) {
        return 'Template must be 1, 2, or 3';
    }

    return null;
}

/**
 * Validates total amount
 * @param {number} totalAmount - Total amount to validate
 * @returns {string|null} Error message or null if valid
 */
function validateTotalAmount(totalAmount) {
    if (totalAmount === undefined || totalAmount === null || totalAmount === '') {
        return 'Total Amount is required';
    }

    const amount = parseFloat(totalAmount);

    if (isNaN(amount)) {
        return 'Total Amount must be a valid number';
    }

    if (amount <= 0) {
        return 'Total Amount must be greater than 0';
    }

    return null;
}

/**
 * Validates number of bills
 * @param {number} numberOfBills - Number of bills to validate
 * @returns {string|null} Error message or null if valid
 */
function validateNumberOfBills(numberOfBills) {
    if (numberOfBills === undefined || numberOfBills === null || numberOfBills === '') {
        return 'Number of Bills is required';
    }

    const num = parseInt(numberOfBills);

    if (isNaN(num)) {
        return 'Number of Bills must be a valid integer';
    }

    if (num < 1) {
        return 'Number of Bills must be at least 1';
    }

    if (num !== parseFloat(numberOfBills)) {
        return 'Number of Bills must be a whole number';
    }

    return null;
}

/**
 * Validates max amount per bill
 * @param {number} maxAmountPerBill - Max amount to validate
 * @returns {string|null} Error message or null if valid
 */
function validateMaxAmountPerBill(maxAmountPerBill) {
    if (maxAmountPerBill === undefined || maxAmountPerBill === null || maxAmountPerBill === '') {
        return 'Max Amount Per Bill is required';
    }

    const amount = parseFloat(maxAmountPerBill);

    if (isNaN(amount)) {
        return 'Max Amount Per Bill must be a valid number';
    }

    if (amount <= 0) {
        return 'Max Amount Per Bill must be greater than 0';
    }

    return null;
}

/**
 * Validates that distribution is mathematically possible
 * @param {number} totalAmount - Total amount
 * @param {number} numberOfBills - Number of bills
 * @param {number} maxAmountPerBill - Max amount per bill
 * @returns {string|null} Error message or null if valid
 */
function validateDistributionPossible(totalAmount, numberOfBills, maxAmountPerBill) {
    const total = parseFloat(totalAmount);
    const count = parseInt(numberOfBills);
    const max = parseFloat(maxAmountPerBill);

    const maxPossibleTotal = max * count;

    if (maxPossibleTotal < total) {
        return `Max Amount Per Bill (₹${max}) × Number of Bills (${count}) = ₹${maxPossibleTotal.toFixed(2)}, which is less than Total Amount (₹${total}). Please increase Max Amount Per Bill or Number of Bills.`;
    }

    return null;
}

/**
 * Validates date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string|null} Error message or null if valid
 */
function validateDates(startDate, endDate) {
    if (!startDate) {
        return 'Start Date is required';
    }

    if (!endDate) {
        return 'End Date is required';
    }

    // Validate date format (YYYY-MM-DD)
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormatRegex.test(startDate)) {
        return 'Start Date must be in YYYY-MM-DD format';
    }

    if (!dateFormatRegex.test(endDate)) {
        return 'End Date must be in YYYY-MM-DD format';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
        return 'Start Date is invalid';
    }

    if (isNaN(end.getTime())) {
        return 'End Date is invalid';
    }

    // Additional check: ensure the parsed date matches the input
    // This catches cases like 2026-02-30 (invalid day)
    const startFormatted = start.toISOString().split('T')[0];
    const endFormatted = end.toISOString().split('T')[0];

    if (startFormatted !== startDate) {
        return 'Start Date is not a valid calendar date';
    }

    if (endFormatted !== endDate) {
        return 'End Date is not a valid calendar date';
    }

    if (end < start) {
        return 'End Date cannot be before Start Date';
    }

    return null;
}

/**
 * Validates that date range can accommodate bills with required spacing
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {number} numberOfBills - Number of bills to generate
 * @param {number} minDaysApart - Minimum days between bills (default: 3)
 * @returns {string|null} Error message or null if valid
 */
function validateDateRangeCapacity(startDate, endDate, numberOfBills, minDaysApart = 3) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const count = parseInt(numberOfBills);

    // Calculate total days in range
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate minimum required days for the spacing
    const minRequiredDays = (count - 1) * minDaysApart;

    if (totalDays < minRequiredDays) {
        return `Date range is too small. Need at least ${minRequiredDays + 1} days for ${count} bills with ${minDaysApart}-day spacing between bills. Current range: ${totalDays + 1} days. Please extend your date range or reduce the number of bills.`;
    }

    return null;
}

module.exports = {
    validateBillGenerationData,
    validateStationName,
    validateFuelRate,
    validateTemplate,
    validateTotalAmount,
    validateNumberOfBills,
    validateMaxAmountPerBill,
    validateDistributionPossible,
    validateDates,
    validateDateRangeCapacity
};
