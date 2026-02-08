/**
 * Date Generator Utility
 * Generates random dates and times within specified ranges
 */

/**
 * Generates a random date between start and end dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} Random date in YYYY-MM-DD format
 */
function generateRandomDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime())) {
        throw new Error('Invalid start date');
    }

    if (isNaN(end.getTime())) {
        throw new Error('Invalid end date');
    }

    if (end < start) {
        throw new Error('End date cannot be before start date');
    }

    // Generate random timestamp between start and end
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();
    const randomTimestamp = startTimestamp + Math.random() * (endTimestamp - startTimestamp);

    // Create date from random timestamp
    const randomDate = new Date(randomTimestamp);

    // Format as YYYY-MM-DD
    const year = randomDate.getFullYear();
    const month = String(randomDate.getMonth() + 1).padStart(2, '0');
    const day = String(randomDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Generates a random time in business hours (6 AM - 10 PM)
 * @returns {string} Random time in HH:MM format (24-hour)
 */
function generateRandomTime() {
    // Business hours: 6 AM (06:00) to 10 PM (22:00)
    const minHour = 6;
    const maxHour = 22;

    // Generate random hour between 6 and 22
    const hour = minHour + Math.floor(Math.random() * (maxHour - minHour));

    // Generate random minute between 0 and 59
    const minute = Math.floor(Math.random() * 60);

    // Format as HH:MM
    const hourStr = String(hour).padStart(2, '0');
    const minuteStr = String(minute).padStart(2, '0');

    return `${hourStr}:${minuteStr}`;
}

/**
 * Formats a date string for display (DD/MM/YYYY format)
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Date in DD/MM/YYYY format
 */
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Formats time for 12-hour display with AM/PM
 * @param {string} timeStr - Time in HH:MM format (24-hour)
 * @returns {string} Time in 12-hour format with AM/PM
 */
function formatTimeForDisplay(timeStr) {
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    const minute = minuteStr;

    const period = hour >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    if (hour === 0) {
        hour = 12;
    } else if (hour > 12) {
        hour = hour - 12;
    }

    return `${hour}:${minute} ${period}`;
}

/**
 * Generates a random date and time within the specified range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Object} Object with date and time properties
 */
function generateRandomDateTime(startDate, endDate) {
    const date = generateRandomDate(startDate, endDate);
    const time = generateRandomTime();

    return {
        date,
        time,
        dateFormatted: formatDateForDisplay(date),
        timeFormatted: formatTimeForDisplay(time)
    };
}

/**
 * Generates multiple unique dates with minimum spacing between them
 * @param {number} count - Number of dates to generate
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {number} minDaysApart - Minimum days between dates (default: 3)
 * @returns {Array<Object>} Array of date-time objects
 */
function generateUniqueDates(count, startDate, endDate, minDaysApart = 3) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate inputs
    if (isNaN(start.getTime())) {
        throw new Error('Invalid start date');
    }

    if (isNaN(end.getTime())) {
        throw new Error('Invalid end date');
    }

    if (end < start) {
        throw new Error('End date cannot be before start date');
    }

    // Calculate total days in range
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Check if range can accommodate required spacing
    const minRequiredDays = (count - 1) * minDaysApart;
    if (totalDays < minRequiredDays) {
        throw new Error(
            `Date range is too small. Need at least ${minRequiredDays + 1} days for ${count} bills with ${minDaysApart}-day spacing. Current range: ${totalDays + 1} days.`
        );
    }

    const dates = [];
    const usedDates = new Set();
    let attempts = 0;
    const maxAttempts = count * 100; // Prevent infinite loops

    while (dates.length < count && attempts < maxAttempts) {
        attempts++;

        // Generate a random date
        const randomDate = generateRandomDate(startDate, endDate);

        // Check if this date is unique and properly spaced
        if (!usedDates.has(randomDate) && isDateProperlySpaced(randomDate, dates, minDaysApart)) {
            const time = generateRandomTime();
            dates.push({
                date: randomDate,
                time,
                dateFormatted: formatDateForDisplay(randomDate),
                timeFormatted: formatTimeForDisplay(time)
            });
            usedDates.add(randomDate);
        }
    }

    if (dates.length < count) {
        throw new Error(
            `Could not generate ${count} unique dates with ${minDaysApart}-day spacing in the given range after ${maxAttempts} attempts.`
        );
    }

    // Sort dates chronologically
    dates.sort((a, b) => new Date(a.date) - new Date(b.date));

    return dates;
}

/**
 * Checks if a date is properly spaced from existing dates
 * @param {string} newDate - Date to check in YYYY-MM-DD format
 * @param {Array<Object>} existingDates - Array of existing date objects
 * @param {number} minDaysApart - Minimum days required between dates
 * @returns {boolean} True if properly spaced, false otherwise
 */
function isDateProperlySpaced(newDate, existingDates, minDaysApart) {
    const newDateTime = new Date(newDate).getTime();
    const minMilliseconds = minDaysApart * 24 * 60 * 60 * 1000;

    for (const dateObj of existingDates) {
        const existingDateTime = new Date(dateObj.date).getTime();
        const difference = Math.abs(newDateTime - existingDateTime);

        if (difference < minMilliseconds) {
            return false;
        }
    }

    return true;
}

module.exports = {
    generateRandomDate,
    generateRandomTime,
    formatDateForDisplay,
    formatTimeForDisplay,
    generateRandomDateTime,
    generateUniqueDates
};
