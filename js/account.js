import { auth, db, collection, query, orderBy, onSnapshot } from './firebase-config.js';
import { requireAuth, setupNavbar } from './navbar.js';

setupNavbar();

const ordersContainer = document.getElementById('orders-container');
let currentUser = null;

async function init() {
    try {
        currentUser = await requireAuth();
        
        const q = query(collection(db, `users/${currentUser.uid}/orders`), orderBy('createdAt', 'desc'));
        onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderOrders(orders);
        });
        
    } catch (err) {
        console.error("Auth routing error", err);
    }
}

function renderOrders(orders) {
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `<p style="text-align:center; color: var(--text-light); font-size: 1.1rem; padding: 2rem;">You haven't placed any orders yet.</p>
        <div style="text-align:center;"><a href="index.html" class="btn-primary" style="display:inline-block; width:auto;">Start Shopping</a></div>`;
        return;
    }
    
    orders.forEach(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString() : 'Just now';
        
        const div = document.createElement('div');
        div.className = 'order-card';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        
        let itemsHtml = order.items.map(item => `
            <div style="display:flex; align-items:center; gap:1rem; margin-top:1rem;">
                <img src="${item.image}" style="width:50px; height:50px; border-radius:6px;">
                <div>
                    <div style="font-weight:600;">${item.name}</div>
                    <div style="color:var(--text-light); font-size:0.9rem;">Qty: ${item.qty} | $${item.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
        
        div.innerHTML = `
            <div style="width: 100%; display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:1rem;">
                <div>
                    <h3 style="color:var(--primary); margin-bottom:0.5rem;">Order #${order.id.slice(0,8).toUpperCase()}</h3>
                    <div style="color:var(--text-light); font-size:0.9rem;">Placed on: ${orderDate}</div>
                    <div style="color:var(--text-light); font-size:0.9rem;">Method: ${order.paymentMethod.toUpperCase()}</div>
                </div>
                <div style="text-align:right;">
                    <span style="background:var(--bg-color); color:var(--primary); padding:0.3rem 0.8rem; border-radius:20px; font-size:0.85rem; font-weight:600;">${order.status}</span>
                    <h3 style="margin-top:0.8rem;">$${order.total.toFixed(2)}</h3>
                </div>
            </div>
            <div style="width:100%;">
                ${itemsHtml}
            </div>
        `;
        
        ordersContainer.appendChild(div);
    });
}

init();
