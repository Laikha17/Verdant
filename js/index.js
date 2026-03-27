import { db, collection, query, limit, getDocs } from './app.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

const grid = document.getElementById('featured-grid');

async function loadFeatured() {
    try {
        const q = query(collection(db, 'plants'), limit(3));
        const snapshot = await getDocs(q);
        
        grid.innerHTML = '';
        
        if (snapshot.empty) {
            grid.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No plants available at the moment.</p>`;
            return;
        }

        snapshot.forEach(docSnap => {
            const plant = { id: docSnap.id, ...docSnap.data() };
            const available = plant.stock - (plant.sold || 0);
            
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <a href="product.html?id=${plant.id}">
                    <img src="${plant.image}" alt="${plant.name}" onerror="this.src='https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=400&q=80'">
                </a>
                <div class="card-content">
                    <h3 class="card-title">${plant.name}</h3>
                    <div class="card-price">$${plant.price.toFixed(2)}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Error fetching featured plants:", err);
        grid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: var(--danger);">Error loading plants.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadFeatured);
