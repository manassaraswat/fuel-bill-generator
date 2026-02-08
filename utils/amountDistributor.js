/**
 * Amount Distributor Utility
 * Distributes a total amount across multiple bills randomly while respecting constraints
 */

/**
 * Distributes total amount across bills randomly
 * @param {number} totalAmount - Total amount to distribute
 * @param {number} numberOfBills - Number of bills to generate
 * @param {number} maxAmountPerBill - Maximum amount allowed per bill
 * @returns {Array<number>} Array of bill amounts that sum to totalAmount
 */
function distributeAmount(totalAmount, numberOfBills, maxAmountPerBill) {
    // Validate inputs
    if (totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
    }

    if (numberOfBills < 1) {
        throw new Error('Number of bills must be at least 1');
    }

    if (maxAmountPerBill <= 0) {
        throw new Error('Max amount per bill must be greater than 0');
    }

    if (maxAmountPerBill * numberOfBills < totalAmount) {
        throw new Error(`Max amount per bill (${maxAmountPerBill}) × number of bills (${numberOfBills}) must be at least ${totalAmount}`);
    }

    // Initialize array to store bill amounts
    const amounts = new Array(numberOfBills).fill(0);
    let remaining = totalAmount;

    // Calculate minimum amount per bill to ensure we can distribute the total
    const minAmountPerBill = 0.01; // Minimum 1 cent per bill

    // Distribute amounts randomly
    for (let i = 0; i < numberOfBills - 1; i++) {
        // Calculate the maximum we can assign to this bill
        // Must leave enough for remaining bills (at least minAmountPerBill each)
        const remainingBills = numberOfBills - i - 1;
        const maxForThisBill = Math.min(
            maxAmountPerBill,
            remaining - (remainingBills * minAmountPerBill)
        );

        // Calculate minimum for this bill
        const minForThisBill = Math.max(
            minAmountPerBill,
            remaining - (remainingBills * maxAmountPerBill)
        );

        // Generate random amount between min and max
        const randomAmount = minForThisBill + Math.random() * (maxForThisBill - minForThisBill);

        // Round to 2 decimal places
        amounts[i] = Math.round(randomAmount * 100) / 100;
        remaining -= amounts[i];
    }

    // Assign remaining amount to last bill (ensures exact sum)
    amounts[numberOfBills - 1] = Math.round(remaining * 100) / 100;

    // Final validation: ensure all amounts are positive and within constraints
    for (let i = 0; i < amounts.length; i++) {
        if (amounts[i] <= 0) {
            throw new Error(`Generated amount for bill ${i + 1} is not positive: ${amounts[i]}`);
        }
        if (amounts[i] > maxAmountPerBill) {
            throw new Error(`Generated amount for bill ${i + 1} exceeds max: ${amounts[i]} > ${maxAmountPerBill}`);
        }
    }

    // Verify sum equals total (accounting for rounding)
    const sum = amounts.reduce((acc, val) => acc + val, 0);
    const roundedSum = Math.round(sum * 100) / 100;
    const roundedTotal = Math.round(totalAmount * 100) / 100;

    if (Math.abs(roundedSum - roundedTotal) > 0.01) {
        // If there's a rounding discrepancy, adjust the last bill
        const diff = roundedTotal - roundedSum;
        amounts[numberOfBills - 1] = Math.round((amounts[numberOfBills - 1] + diff) * 100) / 100;
    }

    return amounts;
}

module.exports = {
    distributeAmount
};
