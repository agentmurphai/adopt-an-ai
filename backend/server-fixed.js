const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

let waitlist = [];
let customers = [];

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        waitlist_count: waitlist.length
    });
});

app.post('/api/waitlist', (req, res) => {
    const { email, plan, source } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
    }
    
    const entry = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        plan: plan || 'not_specified',
        source: source || 'landing_page',
        timestamp: new Date().toISOString(),
        ip: req.ip
    };
    
    const existing = waitlist.find(w => w.email === entry.email);
    if (existing) {
        return res.json({ message: 'Already on waitlist', existing: true });
    }
    
    waitlist.push(entry);
    console.log(`[WAITLIST] ${entry.email} -> ${entry.plan}`);
    
    res.json({ message: 'Added to waitlist', id: entry.id });
});

app.get('/api/admin/stats', (req, res) => {
    const auth = req.headers.authorization;
    if (auth !== 'Bearer admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.json({
        waitlist: {
            total: waitlist.length,
            byPlan: waitlist.reduce((acc, entry) => {
                acc[entry.plan] = (acc[entry.plan] || 0) + 1;
                return acc;
            }, {}),
            recent: waitlist.slice(-10)
        },
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for all other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Adopt an AI running on http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/api/admin/stats`);
});

module.exports = app;
