import { auth, db, doc, getDoc, onAuthStateChanged, signOut, updateCartBadge } from './app.js';

export function setupNavbar() {
    const navbar = document.getElementById('navbar');
    
    onAuthStateChanged(auth, async (user) => {
        let links = `
            <a href="index.html" class="nav-link">Home</a>
            <a href="products.html" class="nav-link">Shop</a>
        `;
        
        if (user) {
            links += `
                <a href="admin.html" class="nav-link">Dashboard</a>
                <a href="add-plant.html" class="nav-link">Add Plant</a>
                <a href="cart.html" class="nav-link">Cart <span id="cart-badge"></span></a>
                <button id="logout-btn" class="nav-link" style="background:none;font-size:inherit;color:inherit;cursor:pointer;">Logout</button>
            `;
            
            navbar.innerHTML = `
                <a href="index.html" class="nav-brand">🪴 Verdant</a>
                <div class="nav-links">${links}</div>
            `;
            
            document.getElementById('logout-btn').addEventListener('click', async () => {
                await signOut(auth);
                window.location.href = 'index.html';
            });
        } else {
            links += `
                <a href="cart.html" class="nav-link">Cart <span id="cart-badge"></span></a>
                <a href="auth.html" class="nav-link">Login</a>
            `;
            navbar.innerHTML = `
                <a href="index.html" class="nav-brand">🪴 Verdant</a>
                <div class="nav-links">${links}</div>
            `;
        }
        
        updateCartBadge();
    });
}
