# VIT Faculty Ratings

A Chrome extension that displays faculty ratings directly beside professor names on VIT pages and FFCS screens.

## Problem

During FFCS, students often switch between the registration portal and faculty rating websites to decide which professors to choose.

This extension removes that friction by displaying ratings directly where students make their decisions.

## Features

- Displays faculty ratings beside professor names
- Uses locally stored CSV data
- Works automatically on supported VIT pages
- Lightweight and privacy-friendly
- No backend or external API calls

## Tech Stack

- JavaScript
- Chrome Extension Manifest V3
- DOM Manipulation
- MutationObserver
- CSV Parsing

## Screenshots

### Extension Installed

![Extension Installed](screenshots/extension-installed.png.png)

### Faculty Rating Source

![Faculty Rating Source](screenshots/faculty-rating-source.png)

## Supported Domains

The extension automatically runs on the following VIT domains:

- `*.vit.ac.in`
- `*.vit.edu.in`
- `*.vitap.ac.in`


### FFCS Integration

Coming soon during the next FFCS registration cycle.

## Installation

1. Clone the repository.
2. Open `chrome://extensions`.
3. Enable Developer Mode.
4. Click **Load unpacked**.
5. Select the project folder.

## Project Structure

```text
VIT-FACULTY-RATINGS/
├── icons/
├── popup/
├── screenshots/
├── content.js
├── faculties.csv
├── manifest.json
└── README.md
```
