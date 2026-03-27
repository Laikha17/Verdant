import { db, doc, updateDoc, increment } from './app.js';
import { getLocalCart, clearLocalCart, saveLocalCart } from './app.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

const cartContainer = document.getElementById('cart-container');
const subtotalEl = document.getElementById('subtotal');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkout-btn');
const successModal = document.getElementById('success-modal');
const continueBtn = document.getElementById('continue-btn');

function renderCart() {
    const cart = getLocalCart();
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `<div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 12px; border: 1px solid var(--border);">
            <p style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--text-light);">Your cart is currently empty.</p>
            <a href="products.html" class="btn-primary">Browse Plants</a>
        </div>`;
        checkoutBtn.disabled = true;
        subtotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }
    
    cartContainer.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3 style="margin-bottom: 0.25rem;">${item.name}</h3>
                <p style="color: var(--primary); font-weight: 600;">$${item.price.toFixed(2)}</p>
            </div>
            <div class="qty-controls">
                <button class="qty-btn dec-btn" data-index="${index}">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn inc-btn" data-index="${index}">+</button>
            </div>
            <div style="font-weight: 700; font-size: 1.1rem; min-width: 80px; text-align: right;">
                $${(item.price * item.qty).toFixed(2)}
            </div>
            <button class="rm-btn" data-index="${index}" style="background: none; color: var(--danger); font-size: 1.5rem; cursor: pointer; border: none; padding: 0.5rem;" title="Remove item">&times;</button>
        `;
        cartContainer.appendChild(div);
    });
    
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${subtotal.toFixed(2)}`;
    checkoutBtn.disabled = false;
    
    // Attach events
    document.querySelectorAll('.dec-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            if (cart[index].qty > 1) {
                cart[index].qty--;
                saveLocalCart(cart);
                renderCart();
            }
        });
    });
    
    document.querySelectorAll('.inc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            // Assuming no strict stock check here for simplicity, or we can limit max.
            cart[index].qty++;
            saveLocalCart(cart);
            renderCart();
        });
    });
    
    document.querySelectorAll('.rm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            cart.splice(index, 1);
            saveLocalCart(cart);
            renderCart();
        });
    });
}

checkoutBtn.addEventListener('click', async () => {
    const cart = getLocalCart();
    if (cart.length === 0) return;
    
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing Payment...';
    
    try {
        // Decrement stock in Firebase
        for (const item of cart) {
            const docRef = doc(db, 'plants', item.id);
            // Updating sold counter or decrementing stock
            await updateDoc(docRef, {
                stock: increment(-item.qty),
                sold: increment(item.qty)
            });
        }
        
        // Simulating network delay for payment
        setTimeout(() => {
            clearLocalCart();
            renderCart();
            successModal.style.display = 'flex';
        }, 1500);
        
    } catch (err) {
        console.error("Checkout error: ", err);
        alert("There was an error processing your simulated payment.");
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Pay Securely';
    }
});

continueBtn.addEventListener('click', () => {
    window.location.href = 'products.html';
});

document.addEventListener('DOMContentLoaded', renderCart);
