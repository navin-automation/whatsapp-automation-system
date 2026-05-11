const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const xlsx = require('xlsx');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        // niche wala path agar galat hai toh ise hata kar sirf args rehne dein
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

const REPORT_FILE = './Order_Report.xlsx';
const CATALOG_FILE = './Balajii.xlsx';
const userState = {}; 

const ROUTES = [
    { id: 1, name: "Junagadh City", active: true },
    { id: 2, name: "Jetpur Road", active: true },
    { id: 3, name: "Dhoraji Line", active: false },
    { id: 4, name: "Keshod Highway", active: true },
    { id: 5, name: "Veraval Road", active: true },
    { id: 6, name: "Maliya Route", active: true },
    { id: 7, name: "Talala Line", active: true },
    { id: 8, name: "Sasan Area", active: true },
    { id: 9, name: "Visavadar Road", active: true },
    { id: 10, name: "Bilkha Line", active: true },
    { id: 11, name: "Mendarda Route", active: true },
    { id: 12, name: "Local Village", active: true }
];

// Excel Logic
function saveOrderToExcel(data) {
    const sheetName = "Orders";
    let workbook, excelData = [];
    try {
        if (fs.existsSync(REPORT_FILE)) {
            workbook = xlsx.readFile(REPORT_FILE);
            excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName] || {});
        } else { 
            workbook = xlsx.utils.book_new(); 
        }
        
        excelData.push(data);
        const newWs = xlsx.utils.json_to_sheet(excelData);
        if (!workbook.SheetNames.includes(sheetName)) {
            xlsx.utils.book_append_sheet(workbook, newWs, sheetName);
        } else {
            workbook.Sheets[sheetName] = newWs;
        }
        xlsx.writeFile(workbook, REPORT_FILE);
    } catch (e) { console.log("Excel Error:", e); }
}

function getCatalog() {
    if (!fs.existsSync(CATALOG_FILE)) return [];
    const workbook = xlsx.readFile(CATALOG_FILE);
    return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('🚀 Balaji Advanced Bot LIVE!'));

client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return;
    const from = msg.from;
    const text = msg.body.trim().toLowerCase();

    // 1. GLOBAL COMMANDS
    if (text === '0' || text === 'restart') {
        delete userState[from];
        return client.sendMessage(from, "🔄 Session Restarted. Type *HI* to begin.");
    }

    // 2. INITIAL HI / MENU
    if (['hi', 'hello', 'menu'].includes(text)) {
        let routeMsg = "📍 *Step 1: Select Route*\n\n";
        ROUTES.forEach(r => routeMsg += `${r.id}. ${r.name} ${r.active ? '' : '(🚫 Closed)'}\n`);
        routeMsg += "\n_Type *0* to Restart_";
        userState[from] = { stage: 'route' };
        return client.sendMessage(from, routeMsg);
    }

    const state = userState[from];
    if (!state) return; // Ignore if no session active

    // 3. BACK LOGIC (*)
    if (text === '*') {
        if (state.stage === 'catalog') {
            state.stage = 'route';
            return client.sendMessage(from, "⬅️ Back to Route selection. Type your Route Number.");
        } else if (state.stage === 'packing') {
            state.stage = 'catalog';
            return client.sendMessage(from, "⬅️ Back to Category selection. Type your Category Number.");
        } else if (state.stage === 'quantity') {
            state.stage = 'packing';
            return client.sendMessage(from, "⬅️ Back to Packing selection. Type 1 or 2.");
        } else if (state.stage === 'subcategory') {
            state.stage = 'quantity';
            return client.sendMessage(from, "⬅️ Back to Quantity. Enter the number of packs.");
        }
    }

    // 4. FLOW LOGIC
    if (state.stage === 'route') {
        const rId = parseInt(text);
        const route = ROUTES.find(r => r.id === rId);
        if (route) {
            if (!route.active) return client.sendMessage(from, "❌ This route is closed.");
            const data = getCatalog();
            const categories = [...new Set(data.map(p => p.Category || p.category))].filter(Boolean);
            let catMsg = `✅ Route: ${route.name}\n\n*Step 2: Select Category*\n\n`;
            categories.forEach((c, i) => catMsg += `${i + 1}. ${c}\n`);
            catMsg += "\n_* - Back | 0 - Restart_";
            userState[from] = { ...state, stage: 'catalog', route: route.name, categories };
            return client.sendMessage(from, catMsg);
        }
    }

    if (state.stage === 'catalog') {
        const idx = parseInt(text) - 1;
        if (state.categories[idx]) {
            userState[from].category = state.categories[idx];
            userState[from].stage = 'packing';
            return client.sendMessage(from, "📦 *Step 3: Packing Type*\n\n1. Box (20 Units)\n2. Patti (12 Units)\n\n_* - Back_");
        }
    }

    if (state.stage === 'packing') {
        if (text === '1' || text === '2') {
            userState[from].packing = (text === '1') ? 'Box' : 'Patti';
            userState[from].unitsPerPack = (text === '1') ? 20 : 12;
            userState[from].stage = 'quantity';
            return client.sendMessage(from, `🔢 *Step 4: Quantity*\n\nHow many ${userState[from].packing}s?`);
        }
    }

    if (state.stage === 'quantity') {
        const qty = parseInt(text);
        if (!isNaN(qty) && qty > 0) {
            userState[from].qty = qty;
            const data = getCatalog();
            const subs = data.filter(p => (p.Category || p.category) === userState[from].category);
            let subMsg = "✨ *Final Step: Select Item*\n\n";
            subs.forEach((s, i) => subMsg += `${i + 1}. ${s.ItemName} (₹${s.Price})\n`);
            userState[from].stage = 'subcategory';
            userState[from].subItems = subs;
            return client.sendMessage(from, subMsg);
        }
    }

    if (state.stage === 'subcategory') {
        const idx = parseInt(text) - 1;
        if (state.subItems[idx]) {
            const item = state.subItems[idx];
            const contact = await msg.getContact();
            const totalUnits = state.qty * state.unitsPerPack;
            
            // TOTAL PRICE CALCULATION
            const pricePerUnit = parseFloat(item.Price) || 0;
            const finalPrice = totalUnits * pricePerUnit; 

            const orderData = {
                'Date': new Date().toLocaleString(),
                'Route': state.route,
                'Customer': contact.pushname || 'Customer',
                'Mobile': contact.number,
                'Category': state.category,
                'Item': item.ItemName,
                'Packing': state.packing,
                'Qty': state.qty,
                'Total Units': totalUnits,
                'Price Per Pack': pricePerUnit,
                'Grand Total': finalPrice
            };

            saveOrderToExcel(orderData);
            delete userState[from];

            return client.sendMessage(from, `✅ *ORDER SUCCESS!*
            
📍 Route: ${state.route}
📦 Item: ${item.ItemName}
📦 Packing: ${state.qty} ${state.packing}
🔢 Total Units: ${totalUnits}
💰 *Total Price: ₹${finalPrice}*

_Thank you! Your order is recorded._`);
        }
    }
});

client.initialize();