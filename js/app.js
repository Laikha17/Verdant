import { auth, db, collection, onSnapshot, doc, setDoc, getDoc, updateDoc, increment, onAuthStateChanged } from './firebase-config.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

let currentUser = null;
let allPlants = [];
let currentFilter = 'all';

// Track auth state
onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

const grid = document.getElementById('plants-grid');
const filters = document.getElementById('filters');

// Setup Filters
filters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderPlants();
    }
});

// Fetch plants
onSnapshot(collection(db, 'plants'), (snapshot) => {
    allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderPlants();
});

function renderPlants() {
    const filteredPlants = currentFilter === 'all' 
        ? allPlants 
        : allPlants.filter(p => {
            const catArray = Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []);
            return catArray.includes(currentFilter);
        });
        
    grid.innerHTML = '';
    
    if (filteredPlants.length === 0) {
        grid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-light);">No plants found.</p>`;
        return;
    }
    
    filteredPlants.forEach(plant => {
        const available = plant.stock - (plant.sold || 0);
        const stockStatus = available > 0 ? `<span style="color:var(--primary)">${available} in stock</span>` : `<span style="color:var(--danger)">Sold Out</span>`;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${plant.image}" alt="${plant.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';">
            <div class="card-content">
                <div class="card-tags">
                    ${(Array.isArray(plant.category) ? plant.category : (plant.category ? [plant.category] : [])).map(cat => `<span class="tag">${cat.replace('-', ' ')}</span>`).join('')}
                </div>
                <h3 class="card-title">${plant.name}</h3>
                <div class="card-price">$${plant.price.toFixed(2)}</div>
                <div class="card-stock">${stockStatus}</div>
                
                <div class="qty-controls">
                    <button class="qty-btn dec" data-id="${plant.id}">-</button>
                    <span id="qty-${plant.id}">1</span>
                    <button class="qty-btn inc" data-id="${plant.id}" ${available <= 1 ? 'disabled' : ''}>+</button>
                </div>
                
                <button class="btn-primary add-to-cart" data-id="${plant.id}" ${available === 0 ? 'disabled' : ''}>
                    ${available === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        grid.appendChild(card);
        
        // Setup quantity logic
        let currentQty = 1;
        const qtySpan = card.querySelector(`#qty-${plant.id}`);
        const btnDec = card.querySelector('.dec');
        const btnInc = card.querySelector('.inc');
        
        btnDec.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;
                qtySpan.textContent = currentQty;
                btnInc.disabled = currentQty >= available;
                if (currentQty <= 1) btnDec.disabled = true;
            }
        });
        
        btnDec.disabled = true; // start at 1
        
        btnInc.addEventListener('click', () => {
            if (currentQty < available) {
                currentQty++;
                qtySpan.textContent = currentQty;
                btnDec.disabled = false;
                if (currentQty >= available) btnInc.disabled = true;
            }
        });
        
        // Add to cart logic
        const addToCartBtn = card.querySelector('.add-to-cart');
        addToCartBtn.addEventListener('click', async () => {
            if (!currentUser) {
                window.location.href = 'auth.html';
                return;
            }
            
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Adding...';
            
            try {
                const cartRef = doc(db, `users/${currentUser.uid}/cart`, plant.id);
                const cartDoc = await getDoc(cartRef);
                
                let previousQtyInCart = 0;
                if (cartDoc.exists()) {
                    previousQtyInCart = cartDoc.data().qty;
                }
                
                const newQty = previousQtyInCart + currentQty;
                
                if (newQty > available) {
                    alert("Not enough stock available!");
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = 'Add to Cart';
                    return;
                }
                
                if (cartDoc.exists()) {
                    await updateDoc(cartRef, {
                        qty: increment(currentQty)
                    });
                } else {
                    await setDoc(cartRef, {
                        id: plant.id,
                        name: plant.name,
                        price: plant.price,
                        image: plant.image,
                        qty: currentQty
                    });
                }
                
                addToCartBtn.textContent = 'Added!';
                setTimeout(() => {
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = 'Add to Cart';
                    currentQty = 1;
                    qtySpan.textContent = '1';
                    btnDec.disabled = true;
                    btnInc.disabled = available <= 1;
                }, 1500);
            } catch (err) {
                console.error(err);
                alert("Error adding to cart.");
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'Add to Cart';
            }
        });
    });
}
