// content.js

let facultyDB = {};           // normalizedName -> {original, rating}
let csvLoaded = false;
let debounceTimer = null;

function debounce(fn, delay = 250) {
    return (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fn(...args), delay);
    };
}

function normalizeName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z\s.]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Pre-normalized DB for faster lookup
let normalizedFacultyDB = {};

function getBadgeColor(rating) {
    if (rating >= 4.0) return "#16a34a";
    if (rating >= 3.0) return "#eab308";
    return "#dc2626";
}

// --------------------
// CSV Loading
// --------------------
async function loadFacultyDatabase() {
    if (csvLoaded) return;

    try {
        const response = await fetch(chrome.runtime.getURL("faculties.csv"));
        if (!response.ok) throw new Error("faculties.csv not found");

        const csvText = await response.text();
        facultyDB = parseFacultyCSV(csvText);
        csvLoaded = true;

        console.log(`✅ Loaded ${Object.keys(facultyDB).length} faculty ratings`);
    } catch (err) {
        console.error("❌ Failed to load faculty database:", err);
    }
}

function parseFacultyCSV(csvText) {
    const db = {};
    const lines = csvText.trim().split("\n");

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row) continue;

        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length < 5) continue;

        const rawName = cols[1]?.replace(/"/g, "").trim();
        const ratingText = cols[4]?.replace(/"/g, "").trim();

        if (!rawName || !ratingText || ratingText === "N/A") continue;

        const rating = parseFloat(ratingText.split("/")[0]);
        if (!isNaN(rating) && rating > 0) {
            const norm = normalizeName(rawName);
            db[norm] = { original: rawName, rating };
        }
    }
    return db;
}

// --------------------
// Badge
// --------------------
function createBadge(rating) {
    const badge = document.createElement("span");
    badge.className = "vit-rating-badge";
    badge.style.cssText = `
        background: ${getBadgeColor(rating)};
        color: white;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 12.5px;
        font-weight: 700;
        margin-left: 8px;
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        vertical-align: middle;
        box-shadow: 0 1px 3px rgba(0,0,0,0.18);
    `;
    badge.textContent = `★ ${rating.toFixed(2)}`;
    return badge;
}

// --------------------
// Matching (Optimized)
// --------------------
function findMatchingFaculty(text) {
    const normText = normalizeName(text);
    return normalizedFacultyDB[normText] || null;
}

// --------------------
// Main Injection
// --------------------
function injectRatings(force = false) {
    if (!csvLoaded) return;

    console.log(`🔍 Running injection (force: ${force})`);

    let injected = 0;

    // TreeWalker - Most effective for text nodes
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (!text || text.length < 8) continue;
        if (!text.includes("Dr.") && !text.includes("Prof.")) continue;

        const parent = node.parentElement;
        if (!parent || parent.querySelector('.vit-rating-badge')) continue;

        const match = findMatchingFaculty(text);
        if (match) {
            const badge = createBadge(match.rating);
            parent.appendChild(badge);
            parent.dataset.vitFacultyProcessed = "true";
            injected++;
            console.log(`✅ Added: ${match.original} (${match.rating})`);
        }
    }

    // Backup selector scan
    if (injected === 0 || force) {
        const selectors = ['h1','h2','h3','h4','strong','b','a','.faculty-name','[class*="faculty"]','[class*="name"]','[class*="title"]'];
        
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.querySelector('.vit-rating-badge') || el.dataset.vitFacultyProcessed) return;

                const text = el.textContent.trim();
                const match = findMatchingFaculty(text);
                if (match) {
                    el.appendChild(createBadge(match.rating));
                    el.dataset.vitFacultyProcessed = "true";
                    injected++;
                }
            });
        });
    }

    console.log(`🏁 Injection complete. Badges added: ${injected}`);
}

// --------------------
// Navigation & Observer
// --------------------
const debouncedInject = debounce(() => injectRatings(false), 300);

function handleNavigation() {
    console.log("🔄 Navigation / Content change detected");
    
    // Give DOM time to settle
    setTimeout(() => injectRatings(true), 400);
    setTimeout(() => injectRatings(true), 1200);
    setTimeout(() => injectRatings(true), 2500);
}

// Init
(async function init() {
    await loadFacultyDatabase();

    // Pre-build normalized lookup
    normalizedFacultyDB = {};
    Object.keys(facultyDB).forEach(key => {
        normalizedFacultyDB[key] = facultyDB[key];
    });

    // Initial runs with increasing delays
    injectRatings(true);
    setTimeout(() => injectRatings(true), 600);
    setTimeout(() => injectRatings(true), 1500);

    // Mutation Observer
    const observer = new MutationObserver(debouncedInject);
    observer.observe(document.body, { childList: true, subtree: true });

    // SPA Navigation detection
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            handleNavigation();
        }
    }).observe(document.documentElement, { childList: true, subtree: true });

    console.log("🚀 Faculty Rating Extension Ready (Optimized)");
})();