function scrollToPricing() {
    document.getElementById('pricing').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

async function selectPlan(planType) {
    const plans = {
        'apprentice': { name: 'Apprentice Plan', price: 100 },
        'partner': { name: 'Partner Plan', price: 250 },
        'cofounder': { name: 'Co-Founder Plan', price: 500 }
    };

    const selectedPlan = plans[planType];
    showComingSoonModal(selectedPlan);
}

function showComingSoonModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🚀 Almost Ready!</h2>
            <p>You selected: <strong>${plan.name}</strong> ($${plan.price}/mo)</p>
            <p>Payment processing is being finalized. Join the waitlist to be first!</p>
            <div class="modal-form">
                <input type="email" placeholder="Enter your email" id="waitlist-email" />
                <button onclick="joinWaitlist('${plan.name}')">Join Waitlist</button>
            </div>
            <button onclick="closeModal()" class="close-btn">×</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (!document.getElementById('modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .modal-content {
                background: white;
                padding: 40px;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                position: relative;
            }
            .modal-form {
                margin: 20px 0;
                display: flex;
                gap: 10px;
                flex-direction: column;
            }
            .modal-form input {
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
            }
            .modal-form button {
                background: linear-gradient(135deg, #00D4FF, #0099CC);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
            .close-btn {
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
        `;
        document.head.appendChild(styles);
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function joinWaitlist(planName) {
    const email = document.getElementById('waitlist-email').value;
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email');
        return;
    }
    
    // Store locally for now
    const waitlistData = {
        email: email,
        plan: planName,
        timestamp: new Date().toISOString()
    };
    
    let waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
    waitlist.push(waitlistData);
    localStorage.setItem('waitlist', JSON.stringify(waitlist));
    
    const modal = document.querySelector('.modal-content');
    modal.innerHTML = `
        <h2>🎉 You're on the list!</h2>
        <p>Thanks for your interest in <strong>${planName}</strong></p>
        <p>I'll personally email you when we launch.</p>
        <p>Expected launch: <strong>March 8, 2026</strong></p>
        <button onclick="closeModal()" class="cta-button-main">Close</button>
    `;
    
    console.log('Waitlist entry:', waitlistData);
}

console.log('Adopt an AI landing page loaded');
