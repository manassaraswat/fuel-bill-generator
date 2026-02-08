// DOM Elements
const form = document.getElementById('billGeneratorForm');
const generateBtn = document.getElementById('generateBtn');
const errorContainer = document.getElementById('errorMessages');
const successContainer = document.getElementById('successMessage');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Form input elements
const stationNameInput = document.getElementById('stationName');
const fuelRateInput = document.getElementById('fuelRate');
const templateInput = document.getElementById('template');
const totalAmountInput = document.getElementById('totalAmount');
const numberOfBillsInput = document.getElementById('numberOfBills');
const maxAmountPerBillInput = document.getElementById('maxAmountPerBill');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

/**
 * Display error messages to the user
 * @param {Array<string>} errors - Array of error messages
 */
function displayErrors(errors) {
    errorContainer.innerHTML = '';

    if (errors.length === 0) {
        errorContainer.classList.add('hidden');
        return;
    }

    const ul = document.createElement('ul');
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        ul.appendChild(li);
    });

    errorContainer.appendChild(ul);
    errorContainer.classList.remove('hidden');
}

/**
 * Display success message to the user
 * @param {string} message - Success message
 */
function displaySuccess(message) {
    successContainer.textContent = message;
    successContainer.classList.remove('hidden');
}

/**
 * Hide success message
 */
function hideSuccess() {
    successContainer.classList.add('hidden');
}

/**
 * Update progress indicator
 * @param {number} current - Current bill number
 * @param {number} total - Total number of bills
 */
function updateProgress(current, total) {
    const percentage = (current / total) * 100;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `Generating bill ${current} of ${total}...`;
}

/**
 * Show progress container
 */
function showProgress() {
    progressContainer.classList.remove('hidden');
}

/**
 * Hide progress container
 */
function hideProgress() {
    progressContainer.classList.add('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '';
}

/**
 * Client-side validation
 * @returns {Array<string>} Array of validation error messages
 */
function validateForm() {
    const errors = [];

    // Validate station name
    if (!stationNameInput.value.trim()) {
        errors.push('Fuel Station Name is required');
    }

    // Validate fuel rate
    const fuelRate = parseFloat(fuelRateInput.value);
    if (!fuelRate || fuelRate <= 0) {
        errors.push('Fuel Rate must be greater than 0');
    }

    // Validate template selection
    if (!templateInput.value) {
        errors.push('Please select a template');
    }

    // Validate total amount
    const totalAmount = parseFloat(totalAmountInput.value);
    if (!totalAmount || totalAmount <= 0) {
        errors.push('Total Amount must be greater than 0');
    }

    // Validate number of bills
    const numberOfBills = parseInt(numberOfBillsInput.value);
    if (!numberOfBills || numberOfBills < 1) {
        errors.push('Number of Bills must be at least 1');
    }

    // Validate max amount per bill
    const maxAmountPerBill = parseFloat(maxAmountPerBillInput.value);
    if (!maxAmountPerBill || maxAmountPerBill <= 0) {
        errors.push('Max Amount Per Bill must be greater than 0');
    }

    // Validate that max amount allows distribution
    if (totalAmount && numberOfBills && maxAmountPerBill) {
        if (maxAmountPerBill * numberOfBills < totalAmount) {
            errors.push(`Max Amount Per Bill (₹${maxAmountPerBill}) × Number of Bills (${numberOfBills}) must be at least ₹${totalAmount}`);
        }
    }

    // Validate dates
    if (!startDateInput.value) {
        errors.push('Start Date is required');
    }

    if (!endDateInput.value) {
        errors.push('End Date is required');
    }

    // Validate end date is not before start date
    if (startDateInput.value && endDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (endDate < startDate) {
            errors.push('End Date cannot be before Start Date');
        }
    }

    return errors;
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
async function handleSubmit(e) {
    e.preventDefault();

    // Clear previous messages
    displayErrors([]);
    hideSuccess();
    hideProgress();

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
        displayErrors(errors);
        return;
    }

    // Prepare form data
    const formData = {
        stationName: stationNameInput.value.trim(),
        fuelRate: parseFloat(fuelRateInput.value),
        template: templateInput.value,
        totalAmount: parseFloat(totalAmountInput.value),
        numberOfBills: parseInt(numberOfBillsInput.value),
        maxAmountPerBill: parseFloat(maxAmountPerBillInput.value),
        startDate: startDateInput.value,
        endDate: endDateInput.value
    };

    // Disable form and show loading state
    generateBtn.disabled = true;
    generateBtn.classList.add('loading');
    showProgress();

    try {
        // Send request to backend
        const response = await fetch('/api/generate-bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to generate bills');
        }

        // Simulate progress updates (in real implementation, this would come from server)
        for (let i = 1; i <= formData.numberOfBills; i++) {
            updateProgress(i, formData.numberOfBills);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Show success message
        hideProgress();
        displaySuccess(`Successfully generated ${formData.numberOfBills} bills! PDFs have been downloaded.`);

        // Reset form after successful generation
        setTimeout(() => {
            form.reset();
            hideSuccess();
        }, 5000);

    } catch (error) {
        console.error('Error generating bills:', error);
        hideProgress();
        displayErrors([error.message || 'An error occurred while generating bills. Please try again.']);
    } finally {
        // Re-enable form
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
    }
}

// Event Listeners
form.addEventListener('submit', handleSubmit);

// Real-time validation feedback (optional enhancement)
const inputs = [
    stationNameInput,
    fuelRateInput,
    templateInput,
    totalAmountInput,
    numberOfBillsInput,
    maxAmountPerBillInput,
    startDateInput,
    endDateInput
];

inputs.forEach(input => {
    input.addEventListener('blur', () => {
        // Clear errors when user starts fixing them
        if (errorContainer.children.length > 0) {
            const errors = validateForm();
            if (errors.length === 0) {
                displayErrors([]);
            }
        }
    });
});
