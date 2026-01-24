import * as fs from 'fs';
import * as path from 'path';

const csvPath = '/Users/paulolopes/Downloads/services_export_2026-01-22.csv';
const fileContent = fs.readFileSync(csvPath, 'utf-8');

// 1. Define Master Price List from MD (Manual extraction)
const mdPrices: Record<string, number> = {
    // Marketing Packages
    'Ads: Visibility Starter': 249,
    'Ads: Visibility Pro': 399,
    'Ads: Visibility Max': 599,
    'Social: Starter': 299,
    'Social: Growth': 449,
    'Social: Pro': 649,
    'Leads: Starter': 349,
    'Leads: Growth': 549,
    'Leads: Pro': 799,

    // One-Time Setup
    'Ads: Setup Único': 399,
    'Social: Setup Único': 299,
    'Leads: Magnet Setup': 499,

    // Branding
    'Branding: Logótipo Simples': 350,
    'Branding: Kit de Marca': 650,

    // Quick Wins
    'Quick: Auditoria Website': 149,
    'Quick: Speed Optimization': 179,
    'Quick: Google Business': 99,

    // Retainers
    'Retainer: Lite (6h)': 630,
    'Retainer: Pro (12h)': 1200,
    'Retainer: Enterprise (20h)': 1900,

    // Care Plans
    'Care: Essential (Mensal)': 89,
    'Care: Essential (Anual)': 890,
    'Care: Growth (Mensal)': 179,
    'Care: Growth (Anual)': 1790,
    'Hosting: Mensal': 39,
    'Hosting: Anual': 390,

    // Automations
    'Auto: Formulário Micro': 299,
    'Auto: Captação de Leads': 550,
    'Auto: Coleção de Reviews': 399,
    'Auto: Agendamentos': 450,
    'AI: Chatbot FAQ': 700,

    // Websites (Using User's CSV 'Starter' 1200 as base, but enforcing others)
    'Website: Landing Page': 600,
    'Website: Starter': 1200, // MD 850-1200
    'Website: Starter Plus': 1680, // MD 1400-1900
    'Website: Business Pro': 2600, // MD 2000-3200 -> Average/Target? CSV was 1600 (too low). Set to 2600.
};

// 2. Parse CSV
const lines = fileContent.split(/\r\n|\n/).filter(l => l.trim() !== '');
const header = lines[0];
const dataLines = lines.slice(1);

const services: any[] = [];
const ptOverrides: Record<string, number> = {};

// Parse lines into objects
dataLines.forEach(line => {
    // Simple parse (assuming no commas in fields for now, or handling basically)
    // Actually description has commas. Need regex split or robust parse.
    // Given previous step wrote it, we know the structure.
    // But duplicate rows might be present from the CSV history.
    // I previously deduped it.

    // Basic CSV split respecting quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    // This regex is brittle. Let's use a simpler split if no quotes in critical fields.
    // Descriptions have quotes.

    // Better: Helper function
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { parts.push(current); current = ''; }
        else { current += char; }
    }
    parts.push(current);

    const [name, price, price_eur, billing, active, name_en, name_pt, name_de, desc_en, desc_pt, desc_de] = parts;

    // Check if PT variant
    /* A row like 'Website: Business Pro (PT)' is a source for price_eur for 'Website: Business Pro' */
    if (name.includes('(PT)')) {
        const baseName = name.replace('(PT)', '').replace(' (PT)', '').trim();
        ptOverrides[baseName] = parseFloat(price);
    } else {
        services.push({ name, price, price_eur, billing, active, name_en, name_pt, name_de, desc_en, desc_pt, desc_de, origLine: line });
    }
});

// 3. Process Services
const processed = services.map(s => {
    let newPrice = parseFloat(s.price);

    // Update Price from MD
    if (mdPrices[s.name]) {
        newPrice = mdPrices[s.name];
    } else if (s.name.includes('Website: ')) {
        // Special logic for Websites if not in list
    }

    // Determine EUR Price
    let newPriceEur = 0;
    if (ptOverrides[s.name]) {
        newPriceEur = ptOverrides[s.name];
    } else {
        // Heuristic: 0.65 ratio
        newPriceEur = Math.round(newPrice * 0.65 / 5) * 5; // Round to nearest 5
        if (newPriceEur === 0 && newPrice > 0) newPriceEur = newPrice; // Safety
    }

    // Clean string fields
    const pack = (val: string) => {
        val = String(val).replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
        return val;
    };

    return [
        pack(s.name),
        newPrice,
        newPriceEur,
        s.billing,
        s.active,
        pack(s.name_en),
        pack(s.name_pt),
        pack(s.name_de),
        pack(s.desc_en),
        pack(s.desc_pt),
        pack(s.desc_de)
    ].join(',');
});

// 4. Write back
const newContent = [header, ...processed].join('\r\n');
fs.writeFileSync(csvPath, newContent);
console.log(`Updated ${processed.length} services.`);
