// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* Максимальний час виконання одного тесту */
  timeout: 60 * 1000,
  
  /* Налаштування для expect */
  expect: {
    timeout: 10000
  },
  
  /* Запуск тестів послідовно в одному файлі */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Кількість повторів при падінні тестів */
  retries: process.env.CI ? 2 : 0,
  
  /* Кількість worker'ів для паралельного запуску */
  workers: process.env.CI ? 1 : 1,
  
  /* Reporter для виводу результатів */
  reporter: [
    ['html'],
    ['list']
  ],
  
  /* Загальні налаштування для всіх проектів */
  use: {
    /* Базова URL для навігації */
    baseURL: 'https://automationintesting.online/',
    
    /* Збір трейсів при падінні тестів */
    trace: 'on-first-retry',
    
    /* Скріншоти при падінні */
    screenshot: 'only-on-failure',
    
    /* Відео при падінні */
    video: 'off',
    
    /* Таймаути для дій */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Налаштування для різних браузерів */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },

    /* Мобільні браузери (опціонально) */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Запуск локального dev сервера перед тестами (якщо потрібно) */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});