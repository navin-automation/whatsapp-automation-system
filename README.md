# 🚀 Advanced WhatsApp Business Automation System

A robust WhatsApp automation bot designed to handle large-scale business operations, specifically tailored for **Balaji Agency**. This system manages complex ordering workflows, including route selection, category filtering, and automated invoice calculations.

## ✨ Key Features
* **Scalable Architecture**: Designed to handle **3,000+ clients** and high-volume messaging.
* **Multi-Step Ordering Flow**:
    * **Route Selection**: Choose from 12+ active delivery routes (e.g., Junagadh City, Jetpur Road).
    * **Smart Catalog**: Dynamic category and item selection from Excel.
    * **Packing Logic**: Automatic calculation for 'Box' (20 units) or 'Patti' (12 units) packing types.
* **Automated Reporting**: Real-time order logging into Excel with Grand Total calculations.
* **Session Management**: Built-in "Back" (*) and "Restart" (0) commands for a smooth user experience.

## 🛠️ Tech Stack
* **Language**: Node.js
* **Library**: [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
* **Automation**: Puppeteer (Chromium)
* **Data Management**: XLSX (Excel)

## 📥 Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/navin-automation/whatsapp-automation-system.git](https://github.com/navin-automation/whatsapp-automation-system.git)
2. **Install dependencies**:
   ```bash
   npm install
3. **Install dependencies**:
   ```bash
   npx puppeteer browsers install chrome
4. **Install dependencies**:
   ```bash
   node s.js

📝 Configuration
Catalog: Update Balajii.xlsx to change items, categories, or prices.

Routes: Modify the ROUTES array in s.js to add or remove delivery zones.

⌨️ Global Commands
0 or restart: Resets the current session and returns to the Route selection.

*: Goes back to the previous step in the ordering flow.

Developed by Navin Meghval - Targeted for large-scale automation workflows.
