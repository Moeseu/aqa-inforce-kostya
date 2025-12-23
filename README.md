# AQA Test Task - Inforce

This repository contains the automated test suite for the [Automation in Testing](https://automationintesting.online/) application. The project is implemented using **Playwright** with JavaScript.

## 📂 Project Structure

- **`tests/ui/`**: Contains UI automation tests (Booking flow).
- **`tests/api/`**: Contains API automation tests covering the following flows:
  - Create Room (Admin API) -> Verify (User API)
  - Book Room (User API) -> Verify (Admin API)
  - Edit Room (Admin API) -> Verify (User API)
  - Delete Room (Admin API) -> Verify (User API)
- **`test-cases.txt`**: Detailed manual test cases for the UI flow.
- **`.github/workflows/`**: GitHub Actions configuration for CI/CD.

## 📄 Test Cases

According to the task requirements, the detailed manual test cases for the UI flow are located in the root directory:
👉 **File:** [`test-cases.txt`](./test-cases.txt)

## 🚀 Setup & Installation

To run the tests locally, ensure you have **Node.js** installed.

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd aqa-inforce-kostya

```

2. **Install dependencies:**
```bash
npm ci

```


3. **Install Playwright browsers:**
```bash
npx playwright install --with-deps

```



## ▶️ Running Tests

You can run the tests using the following commands:

### Run All Tests

To execute both UI and API tests:

```bash
npx playwright test

```

### Run Specific Suites

**Run only UI tests:**

```bash
npx playwright test tests/ui

```

**Run only API tests:**

```bash
npx playwright test tests/api

```

### View Report

After the test run completes, you can view the HTML report:

```bash
npx playwright show-report

```
