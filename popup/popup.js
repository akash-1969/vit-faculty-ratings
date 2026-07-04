// popup/popup.js

document.getElementById('refresh').addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ 
            active: true, 
            currentWindow: true 
        });

        if (!tab?.id) {
            alert("No active tab found!");
            return;
        }

        await chrome.tabs.sendMessage(tab.id, { action: "refreshRatings" });

        // Nice feedback
        const status = document.createElement('div');
        status.textContent = "✅ Ratings refreshed!";
        status.style.cssText = `
            margin-top: 12px; 
            color: #16a34a; 
            font-size: 14px; 
            text-align: center;
            font-weight: 500;
        `;
        document.body.appendChild(status);

        setTimeout(() => status.remove(), 2500);

    } catch (error) {
        console.error(error);
        alert("Could not refresh. Make sure you're on a VIT page.");
    }
});