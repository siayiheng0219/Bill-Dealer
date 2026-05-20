# 🧾 Bill Dealer

A smart bill splitting app for groups & trips — inspired by [TravelSplit](https://travel-split-app-brown.vercel.app).

## Features

- **👥 Member Management** — Add/remove trip members with avatars
- **💸 Multi-Currency Expenses** — 13 currencies with exchange rate conversion
- **📐 Flexible Splitting** — Equal split or custom amounts per person
- **💰 Smart Settlement** — Calculates who pays whom to settle all debts with minimal transactions
- **📤📥 Import/Export** — Backup & restore all your data as JSON
- **🤖 AI Receipt Scanner** — Upload a receipt image and auto-extract items (demo mode)
- **✅ Settle Tracking** — Click any expense to mark it as settled; settled bills are excluded from the settlement plan
- **📱 Mobile-First Design** — Bottom tab navigation, bottom sheets, collapsible cards, touch-optimized
- **📸 Receipt Scanner** — Take a photo + manually enter items alongside the photo (auto-resized for performance)
- **🌐 Bilingual** — English & 中文 (Chinese) support, persists your language preference
- **💾 Local Storage** — All data stays in your browser, never uploaded anywhere
- **🎨 Beautiful UI** — Modern gradient design, responsive on all devices
- **🗑 Clear Data** — One-click reset

## How to Use

1. Open `index.html` in any modern browser
2. Add members in "Trip Settings"
3. Select your base currency for settlement
4. Add expenses: who paid, how much, which currency, and who participated
5. View the settlement plan showing who pays whom

## Settlement Algorithm

Uses a greedy debt-simplification algorithm:
1. Converts all expenses to the base currency using exchange rates
2. Calculates each member's net balance
3. Matches creditors with debtors to minimize the number of transactions

## Tech Stack

- Pure HTML/CSS/JS — no frameworks, no build steps
- LocalStorage for persistence