const express = require('express');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory storage (will move to DB later)
let waitlist = [];
let customers = [];

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        waitlist_count: waitlist.length,
        customer_count: customers.length
    });
});

// Waitlist signup
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
    
    // Check if already exists
    const existing = waitlist.find(w => w.email === entry.email);
    if (existing) {
        return res.json({ message: 'Already on waitlist', existing: true, id: existing.id });
    }
    
    waitlist.push(entry);
    console.log(`[WAITLIST] New signup: ${entry.email} for ${entry.plan}`);
    
    res.json({ message: 'Added to waitlist', id: entry.id });
});

// Stripe checkout session creation
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { planType, customerEmail } = req.body;
        
        const prices = {
            apprentice: { price: 10000, name: 'Apprentice Plan' }, // $100
            partner: { price: 25000, name: 'Partner Plan' },       // $250
            cofounder: { price: 50000, name: 'Co-Founder Plan' }   // $500
        };
        
        const plan = prices[planType];
        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: customerEmail,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan.name,
                        description: `Agent Murph AI automation service - ${plan.name}`
                    },
                    unit_amount: plan.price,
                    recurring: { interval: 'month' }
                },
                quantity: 1
            }],
            success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/?cancelled=true`,
            metadata: {
                plan: planType,
                agent: 'murph'
            }
        });
        
        res.json({ sessionId: session.id, url: session.url });
        
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: 'Payment session creation failed' });
    }
});

// Stripe webhook
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`[STRIPE] Payment successful: ${session.customer_email} for ${session.metadata.plan}`);
            
            // Add to customers
            customers.push({
                id: session.customer,
                email: session.customer_email,
                plan: session.metadata.plan,
                status: 'active',
                stripe_session_id: session.id,
                created: new Date().toISOString()
            });
            break;
            
        case 'invoice.payment_succeeded':
            console.log(`[STRIPE] Recurring payment succeeded`);
            break;
            
        default:
            console.log(`[STRIPE] Unhandled event type: ${event.type}`);
    }
    
    res.json({received: true});
});

// Admin stats
app.get('/api/admin/stats', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const stats = {
        waitlist: {
            total: waitlist.length,
            byPlan: waitlist.reduce((acc, entry) => {
                acc[entry.plan] = (acc[entry.plan] || 0) + 1;
                return acc;
            }, {}),
            recent: waitlist.slice(-10).map(entry => ({
                email: entry.email,
                plan: entry.plan,
                timestamp: entry.timestamp
            }))
        },
        customers: {
            total: customers.length,
            active: customers.filter(c => c.status === 'active').length,
            byPlan: customers.reduce((acc, customer) => {
                acc[customer.plan] = (acc[customer.plan] || 0) + 1;
                return acc;
            }, {})
        },
        revenue: {
            mrr: customers.reduce((acc, customer) => {
                const planPrices = { apprentice: 100, partner: 250, cofounder: 500 };
                return acc + (planPrices[customer.plan] || 0);
            }, 0)
        }
    };
    
    res.json(stats);
});

// Customer onboarding
app.post('/api/onboard', (req, res) => {
    const { customerId, preferences, wallets } = req.body;
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }
    
    customer.preferences = preferences;
    customer.wallets = wallets;
    customer.status = 'onboarded';
    customer.onboarded_at = new Date().toISOString();
    
    console.log(`[ONBOARD] Customer ${customer.email} onboarded with ${wallets?.length || 0} wallets`);
    
    res.json({ message: 'Onboarding completed', customer: {
        id: customer.id,
        email: customer.email,
        plan: customer.plan,
        status: customer.status
    }});
});

// Serve landing page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Adopt an AI server running on port ${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/api/admin/stats`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
