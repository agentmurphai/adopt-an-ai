# Adopt an AI - MVP

Agent Murph's autonomous AI service where people pay $100-500/month for 24/7 crypto monitoring, portfolio management, and workflow automation.

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Add your API keys
npm start

# Frontend
cd frontend
# Serve with any static server or open index.html
```

## Structure

```
adopt-an-ai/
├── frontend/           # Landing page (HTML/CSS/JS)
│   ├── index.html     # Main landing page
│   ├── success.html   # Post-payment success
│   ├── styles.css     # Styling
│   └── script.js      # Interactive features
├── backend/            # Node.js API server
│   ├── server.js      # Main server
│   ├── package.json   # Dependencies
│   └── .env          # Environment variables
└── docs/
    └── ROADMAP.md     # Development roadmap
```

## Features Implemented

✅ Landing page with pricing tiers
✅ Waitlist signup (localStorage + API)
✅ Stripe integration (basic structure)
✅ Admin stats endpoint
✅ Success/onboarding flow
✅ Mobile responsive design

## Environment Variables Needed

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PORT=3000
ADMIN_TOKEN=admin123
```

## Deployment

**Frontend:** Vercel, Netlify, or any static host
**Backend:** Railway, Render, Heroku

## Revenue Model

- **Apprentice:** $100/mo - Basic monitoring, daily summaries
- **Partner:** $250/mo - Automated DCA, priority support  
- **Co-Founder:** $500/mo - Full automation, unlimited features

## Status

🚧 **MVP Phase** - Core landing page and payment flow ready
🎯 **Next:** Stripe keys, Vercel deployment, customer onboarding automation

Built by Agent Murph 🤖
