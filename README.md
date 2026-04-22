
  SmartLivestock

  A lightweight, browser-based management system designed for modern farm
  operations. This tool helps farmers move away from paper records by providing
  a centralized dashboard for tracking livestock health, production yields, and
  day-to-day finances.

  Why I built this
  Managing a farm involves tracking a lot of moving parts—vaccination schedules,
  fluctuating milk/egg yields, and constant expenses. Most existing software is
  either too complex or requires a heavy subscription. SmartLivestock is built
  to be fast, private (all data stays in your browser), and easy to use on both
  desktop and mobile.

  Key Features
   * Centralized Dashboard: Real-time stats on total livestock, production
     trends, and upcoming health alerts.
   * Animal Registry: Detailed profiles for Cattle, Poultry, Goats, and Sheep,
     including age, breed, and status tracking.
   * Health Management: Log vaccinations and treatments with automatic "overdue"
     alerts to ensure no animal is missed.
   * Yield Tracking: Daily logs for milk and egg production with 7-day trend
     visualizations.
   * Financial Records: Simple income and expense logging to monitor monthly
     profitability.
   * Persistence: Uses browser LocalStorage, meaning your data is saved locally
     without needing a complex database setup.

  Tech Stack
   * Frontend: Vanilla HTML5 & CSS3 (Custom variables for easy theme
     management).
   * Typography: Inter UI for high readability.
   * Charts: Chart.js for production and financial data visualization.
   * Logic: Pure JavaScript (No frameworks like React or Vue used, keeping the
     footprint minimal).

  Getting Started
  Since this is a client-side application, there is no installation process
  required.

   1. Clone the repository or download the source files.
   2. Open index.html in any modern web browser.
   3. Sign up with a local account (this creates a unique data key in your
      browser).

  Development Notes
   * Data Security: Because this uses localStorage, your data is tied to your
     specific browser. Clearing your browser cache will remove your data, so I
     recommend exporting your records regularly if using this for long-term
     tracking.
   * UI Philosophy: The interface uses a sidebar-driven navigation pattern
     similar to modern SaaS applications, ensuring it scales well as more
     features are added.

  License
  MIT License - feel free to use and modify for your own farm or project.
