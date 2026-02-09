/**
 * Date Generator Utility
 * Generates random dates and times within specified ranges
 */

/**
 * Parses a YYYY-MM-DD date string to a Date object using UTC to avoid timezone issues
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Date} Date object in UTC
 */
function parseDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error(`Invalid date: ${dateStr}`);
    }
    
    // Create date using UTC to avoid timezone issues
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Generates a random date between start and end dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} Random date in YYYY-MM-DD format
 */
function generateRandomDate(startDate, endDate) {

    const start = parseDate(startDate);
    const end = parseDate(endDate);

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
    // IMPORTANT: Use the original start/end dates to calculate day offset, then reconstruct
    // This avoids any timezone issues with Date object conversion
    const daysDiff = Math.floor((randomTimestamp - startTimestamp) / (1000 * 60 * 60 * 24));
    
    // Parse start date components
    const startParts = startDate.split('-');
    const startYear = parseInt(startParts[0], 10);
    const startMonth = parseInt(startParts[1], 10);
    const startDay = parseInt(startParts[2], 10);
    
    // Create a date object from start date and add days
    const resultDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    resultDate.setUTCDate(resultDate.getUTCDate() + daysDiff);
    
    // Extract components using UTC methods
    const year = resultDate.getUTCFullYear();
    const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(resultDate.getUTCDate()).padStart(2, '0');

    const result = `${year}-${month}-${day}`;
    
    // Validate the result is in correct format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) {
        throw new Error(`Invalid date format generated: "${result}". Expected YYYY-MM-DD. Year: ${year}, Month: ${month}, Day: ${day}`);
    }
    
    // Ensure year is reasonable (between 1900 and 2100)
    if (year < 1900 || year > 2100) {
        throw new Error(`Invalid year generated: ${year}. Date: ${result}`);
    }
    
    // Ensure the result is within the original date range
    const resultTimestamp = resultDate.getTime();
    if (resultTimestamp < startTimestamp || resultTimestamp > endTimestamp) {
        throw new Error(`Generated date ${result} is outside the range ${startDate} to ${endDate}`);
    }
    
    return result;
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
    // Parse YYYY-MM-DD format manually to avoid timezone issues
    const parts = dateStr.split('-');
    
    if (parts.length !== 3) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Validate the parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error('Invalid date');
    }

    // Format as DD/MM/YYYY
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const yearStr = String(year);

    return `${dayStr}/${monthStr}/${yearStr}`;
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
    const start = parseDate(startDate);
    const end = parseDate(endDate);

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
            const dateObj = {
                date: randomDate,
                time,
                dateFormatted: formatDateForDisplay(randomDate),
                timeFormatted: formatTimeForDisplay(time)
            };
            dates.push(dateObj);
            usedDates.add(randomDate);
        }
    }

    if (dates.length < count) {
        throw new Error(
            `Could not generate ${count} unique dates with ${minDaysApart}-day spacing in the given range after ${maxAttempts} attempts.`
        );
    }

    // Sort dates chronologically using parseDate to avoid timezone issues
    dates.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

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
    const newDateTime = parseDate(newDate).getTime();
    const minMilliseconds = minDaysApart * 24 * 60 * 60 * 1000;

    for (const dateObj of existingDates) {
        const existingDateTime = parseDate(dateObj.date).getTime();
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
