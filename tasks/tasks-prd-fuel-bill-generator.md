# Task List: Fuel Bill Generator


## Relevant Files

- `index.html` - Main HTML page with the user input form
- `styles.css` - Styling for the web application
- `app.js` - Frontend JavaScript for form handling and user interaction
- `server.js` - Node.js Express server for handling bill generation requests
- `billGenerator.js` - Core logic for browser automation and bill generation using Puppeteer
- `utils/amountDistributor.js` - Algorithm for randomly distributing total amount across bills
- `utils/dateGenerator.js` - Utility for generating random dates and times within specified range
- `utils/validator.js` - Input validation logic
- `package.json` - Project dependencies and scripts
- `.env.example` - Environment variable template

### Notes

- This project will use Puppeteer for browser automation to interact with freeforonline.com
- Express server will handle the backend logic and coordinate bill generation
- Frontend will be a simple HTML form with vanilla JavaScript for simplicity

## Tasks

- [x] 1.0 Project Setup and Configuration
  - [x] 1.1 Initialize Node.js project with `npm init -y`
  - [x] 1.2 Install required dependencies: Express, Puppeteer, dotenv, cors, body-parser
  - [x] 1.3 Install development dependencies: nodemon for auto-restart during development
  - [x] 1.4 Create project folder structure (public/, utils/, routes/)
  - [x] 1.5 Create `.env.example` file with configuration variables (PORT, etc.)
  - [x] 1.6 Create `.gitignore` file to exclude node_modules, .env, and downloaded PDFs
  - [x] 1.7 Set up npm scripts in package.json (start, dev)

- [x] 2.0 Build Frontend User Interface
  - [x] 2.1 Create `public/index.html` with semantic HTML structure
  - [x] 2.2 Add form with all required input fields (Fuel Rate, Station Name, Template selector, Total Amount, Number of Bills, Max Amount Per Bill, Start Date, End Date)
  - [x] 2.3 Add appropriate input types (number, text, select, date) with proper labels
  - [x] 2.4 Create `public/styles.css` with modern, clean styling
  - [x] 2.5 Style the form with sections for better organization (Station Details, Bill Settings, Date Range)
  - [x] 2.6 Add a prominent "Generate Bills" button
  - [x] 2.7 Create areas for displaying validation errors and progress feedback
  - [x] 2.8 Create `public/app.js` for frontend JavaScript logic
  - [x] 2.9 Implement form submission handler that prevents default and sends data to backend
  - [x] 2.10 Add client-side validation for required fields
  - [x] 2.11 Implement progress indicator UI (e.g., "Generating bill 3 of 10...")
  - [x] 2.12 Add success/error message display functionality

- [x] 3.0 Implement Backend Server and API
  - [x] 3.1 Create `server.js` with Express app initialization
  - [x] 3.2 Configure middleware (body-parser, cors, static file serving for public folder)
  - [x] 3.3 Create POST endpoint `/api/generate-bills` to receive form data
  - [x] 3.4 Set up server to listen on configured port (default 3000)
  - [x] 3.5 Add error handling middleware for uncaught errors
  - [x] 3.6 Implement request logging for debugging
  - [x] 3.7 Create response structure for progress updates and final results

- [x] 4.0 Develop Bill Generation Logic with Browser Automation
  - [x] 4.1 Create `billGenerator.js` module
  - [x] 4.2 Initialize Puppeteer browser instance with appropriate configuration (headless mode)
  - [x] 4.3 Implement function to navigate to https://freeforonline.com/fuel-bills/index.html
  - [x] 4.4 Implement template selection logic (identify and click the correct template from 3 options)
  - [x] 4.5 Implement form field population for each bill:
    - [x] 4.5.1 Set Fuel Station Name
    - [x] 4.5.2 Set Fuel Rate
    - [x] 4.5.3 Set Bill Date (from random generator)
    - [x] 4.5.4 Set Bill Time (from random generator)
    - [x] 4.5.5 Set Bill Amount (from distribution algorithm)
    - [x] 4.5.6 Set Payment Mode to "Online"
    - [x] 4.5.7 Ensure Vehicle Number is left blank
    - [x] 4.5.8 Set GST IN, CST IIN, TX NO to "None"
  - [x] 4.6 Implement PDF download trigger and wait for download completion
  - [x] 4.7 Implement file naming logic for downloaded PDFs (e.g., fuel-bill-001.pdf)
  - [x] 4.8 Add cleanup logic to close browser after all bills are generated
  - [x] 4.9 Implement retry logic for failed bill generations
  - [x] 4.10 Add timeout handling for slow page loads

- [x] 5.0 Implement Utility Functions (Amount Distribution, Date Generation, Validation)
  - [x] 5.1 Create `utils/amountDistributor.js`
    - [x] 5.1.1 Implement random distribution algorithm that respects max amount per bill
    - [x] 5.1.2 Ensure distributed amounts sum exactly to total amount
    - [x] 5.1.3 Ensure all amounts are positive and non-zero
    - [x] 5.1.4 Add rounding logic to handle decimal precision (2 decimal places)
  - [x] 5.2 Create `utils/dateGenerator.js`
    - [x] 5.2.1 Implement function to generate random date within user-specified range
    - [x] 5.2.2 Implement function to generate random time in business hours (6 AM - 10 PM)
    - [x] 5.2.3 Format dates and times according to the bill form requirements
  - [x] 5.3 Create `utils/validator.js`
    - [x] 5.3.1 Validate total amount is greater than zero
    - [x] 5.3.2 Validate number of bills is a positive integer
    - [x] 5.3.3 Validate fuel rate is a positive number
    - [x] 5.3.4 Validate end date is not before start date
    - [x] 5.3.5 Validate max amount per bill allows distribution (max × count ≥ total)
    - [x] 5.3.6 Validate fuel station name is not empty
    - [x] 5.3.7 Validate template selection is valid (1, 2, or 3)
    - [x] 5.3.8 Return structured error messages for each validation failure

- [x] 6.0 Integration and End-to-End Testing
  - [x] 6.1 Test complete workflow: form submission → validation → bill generation → PDF download
  - [x] 6.2 Test with minimum inputs (1 bill)
  - [x] 6.3 Test with multiple bills (e.g., 5, 10 bills)
  - [/] 6.4 Test all 3 template options (Templates 1 and 2 tested, Template 3 not tested)
  - [x] 6.5 Test amount distribution with various max amount constraints
  - [x] 6.6 Test date range spanning different months
  - [x] 6.7 Verify all PDFs are downloaded correctly and named properly
  - [x] 6.8 Verify bill amounts sum to exact total specified
  - [x] 6.9 Verify dates are within specified range
  - [x] 6.10 Test edge case: total amount equals max amount per bill × number of bills

- [x] 7.0 Error Handling and User Feedback
  - [x] 7.1 Display clear validation error messages on frontend for invalid inputs
  - [x] 7.2 Handle network errors when connecting to freeforonline.com
  - [x] 7.3 Handle timeout errors if external website is slow
  - [x] 7.4 Provide meaningful error messages if bill generation fails
  - [/] 7.5 Show progress updates during bill generation (backend logs, not frontend UI)
  - [/] 7.6 Display success message when all bills are generated and downloaded (backend works, frontend display issue)
  - [x] 7.7 Add loading state to prevent multiple simultaneous submissions
  - [x] 7.8 Log errors to console for debugging purposes
  - [x] 7.9 Gracefully handle browser automation failures (e.g., element not found)
  - [x] 7.10 Add user-friendly message if external website structure has changed
