import { db, collection, onSnapshot } from './app.js';
import { addToLocalCart } from './app.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

const grid = document.getElementById('plants-grid');
const filters = document.getElementById('filters');
let currentFilter = 'all';
let allPlants = [];

// Setup filter clicks
filters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderPlants();
    }
});

// Fetch Real-time Stock via onSnapshot
onSnapshot(collection(db, 'plants'), (snapshot) => {
    allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderPlants();
}, (error) => {
    console.error("Error fetching plants: ", error);
    grid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: var(--danger);">Error loading plants.</p>`;
});

function renderPlants() {
    grid.innerHTML = '';
    
    const filtered = currentFilter === 'all' 
        ? allPlants 
        : allPlants.filter(p => {
             const cats = Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []);
             return cats.includes(currentFilter);
          });
          
    if (filtered.length === 0) {
        grid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: var(--text-light);">No plants found matching the filter.</p>`;
        return;
    }
    
    filtered.forEach(plant => {
        const availableStock = Math.max(0, plant.stock - (plant.sold || 0));
        const outOfStock = availableStock === 0;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <a href="product.html?id=${plant.id}">
                <img src="${plant.image}" alt="${plant.name}" onerror="this.src='https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=400&q=80'">
            </a>
            <div class="card-content">
                <div class="card-tags">
                    ${(Array.isArray(plant.category) ? plant.category : [plant.category]).map(c => `
                        <span class="tag">${c.replace('-', ' ')}</span>
                    `).join('')}
                </div>
                <h3 class="card-title">${plant.name}</h3>
                <div class="card-price">$${plant.price.toFixed(2)}</div>
                <div class="card-stock" style="color: ${outOfStock ? 'var(--danger)' : 'var(--primary)'}">
                    ${outOfStock ? 'Out of Stock' : `${availableStock} left in stock`}
                </div>
                <button class="btn-primary add-to-cart" data-id="${plant.id}" ${outOfStock ? 'disabled' : ''}>
                    ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        grid.appendChild(card);
        
        const btn = card.querySelector('.add-to-cart');
        btn.addEventListener('click', () => {
            btn.textContent = 'Adding...';
            btn.disabled = true;
            
            setTimeout(() => {
                addToLocalCart(plant, 1);
                btn.textContent = 'Added ✔';
                
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.disabled = false;
                }, 1000);
            }, 300);
        });
    });
}
