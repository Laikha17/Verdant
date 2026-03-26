import { auth, db, collection, onSnapshot, doc, getDoc, updateDoc, increment, writeBatch, serverTimestamp, getDocs } from './firebase-config.js';
import { requireAuth, setupNavbar } from './navbar.js';
import { deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

setupNavbar();

const cartContainer = document.getElementById('cart-container');
const cartSummarySection = document.getElementById('cart-summary-section');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const spinner = document.getElementById('spinner');

let currentUser = null;
let cartItems = [];

async function init() {
    try {
        currentUser = await requireAuth();
        
        onSnapshot(collection(db, `users/${currentUser.uid}/cart`), (snapshot) => {
            cartItems = snapshot.docs.map(doc => ({ ...doc.data(), cartItemId: doc.id }));
            renderCart();
        });
        
    } catch (err) {
        console.error("Auth routing error", err);
    }
}

function renderCart() {
    cartContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `<p style="text-align:center; color: var(--text-light); font-size: 1.1rem;">Your cart is empty.</p>
        <div style="text-align:center; margin-top:2rem;"><a href="index.html" class="btn-primary" style="text-decoration:none; display:inline-block; width:auto;">Go Shopping</a></div>`;
        cartSummarySection.style.display = 'none';
        return;
    }
    
    let total = 0;
    
    cartItems.forEach(item => {
        total += item.price * item.qty;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="item-info">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';">
                <div>
                    <h3 style="margin-bottom: 0.5rem;">${item.name}</h3>
                    <div style="color: var(--primary); font-weight: 600;">$${item.price.toFixed(2)}</div>
                </div>
            </div>
            
            <div style="display:flex; align-items:center; gap: 2rem;">
                <div class="qty-controls" style="margin:0;">
                    <button class="qty-btn dec" data-id="${item.cartItemId}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn inc" data-id="${item.cartItemId}">+</button>
                </div>
                <div style="font-weight:bold; min-width: 80px;">$${(item.price * item.qty).toFixed(2)}</div>
                <button class="btn-danger remove-btn" data-id="${item.cartItemId}">Remove</button>
            </div>
        `;
        cartContainer.appendChild(div);
        
        // Listeners for buttons
        const btnDec = div.querySelector('.dec');
        const btnInc = div.querySelector('.inc');
        const removeBtn = div.querySelector('.remove-btn');
        
        btnDec.addEventListener('click', async () => {
            if (item.qty > 1) {
                await updateDoc(doc(db, `users/${currentUser.uid}/cart`, item.cartItemId), {
                    qty: increment(-1)
                });
            }
        });
        
        btnInc.addEventListener('click', async () => {
            // Need to check available stock in real DB, but for simple UX, we will let it increment and catch it at checkout if needed, or query it here. Let's do a simple check.
            const pDoc = await getDoc(doc(db, "plants", item.id));
            const available = pDoc.data().stock - (pDoc.data().sold || 0);
            if (item.qty < available) {
                await updateDoc(doc(db, `users/${currentUser.uid}/cart`, item.cartItemId), {
                    qty: increment(1)
                });
            } else {
                alert("Cannot add more than available stock!");
            }
        });
        
        removeBtn.addEventListener('click', async () => {
            await deleteDoc(doc(db, `users/${currentUser.uid}/cart`, item.cartItemId));
        });
    });
    
    cartTotalEl.textContent = total.toFixed(2);
    cartSummarySection.style.display = 'flex';
}

checkoutBtn.addEventListener('click', async () => {
    if (cartItems.length === 0) return;
    
    // UI Loading
    spinner.style.display = 'flex';
    checkoutBtn.disabled = true;
    
    try {
        const batch = writeBatch(db);
        
        // 1. Validate stock again and deduct it
        let totalVal = 0;
        for (const item of cartItems) {
            const plantRef = doc(db, 'plants', item.id);
            const plantSnap = await getDoc(plantRef);
            if (!plantSnap.exists()) throw new Error(`Plant ${item.name} not found`);
            
            const plantData = plantSnap.data();
            const available = plantData.stock - (plantData.sold || 0);
            
            if (available < item.qty) {
                throw new Error(`Not enough stock for ${item.name}. Available: ${available}`);
            }
            
            // Add to batch: increment sold count
            batch.update(plantRef, { sold: increment(item.qty) });
            totalVal += item.price * item.qty;
        }
        
        // 2. Create the Order document
        const orderRef = doc(collection(db, `users/${currentUser.uid}/orders`));
        const paymentMethod = document.getElementById('payment-method').value;
        batch.set(orderRef, {
            items: cartItems.map(i => ({ id: i.id, name: i.name, image: i.image, qty: i.qty, price: i.price })),
            total: totalVal,
            paymentMethod,
            status: "Completed",
            createdAt: serverTimestamp()
        });
        
        // 3. Clear the Cart
        for (const item of cartItems) {
            const cartRef = doc(db, `users/${currentUser.uid}/cart`, item.cartItemId);
            batch.delete(cartRef);
        }
        
        // Commit fake checkout (wait 2 seconds for visual spinner delay)
        await new Promise(res => setTimeout(res, 2000));
        await batch.commit();
        
        // Redirect to success
        window.location.href = 'success.html';
        
    } catch (err) {
        console.error("Checkout error:", err);
        alert(err.message || "An error occurred during checkout.");
    } finally {
        spinner.style.display = 'none';
        checkoutBtn.disabled = false;
    }
});

// Initialize view
init();
