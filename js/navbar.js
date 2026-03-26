import { auth, db, doc, getDoc, onAuthStateChanged, signOut, collection, onSnapshot } from './firebase-config.js';

export function setupNavbar() {
    const navbar = document.getElementById('navbar');
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Fetch user name
            let userName = 'User';
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    userName = userDoc.data().name || 'User';
                }
            } catch (err) {
                console.error("Error fetching user data for navbar", err);
            }
            
            navbar.innerHTML = `
                <a href="index.html" class="nav-brand">🪴 Verdant</a>
                <div class="nav-links">
                    <span class="nav-greeting">Hi, ${userName}</span>
                    <a href="index.html" class="nav-link">Shop</a>
                    <a href="cart.html" class="nav-link">Cart <span id="cart-badge"></span></a>
                    <a href="account.html" class="nav-link">Account</a>
                    <button id="logout-btn" class="nav-link" style="background:none;font-weight:500;">Logout</button>
                </div>
            `;
            
            document.getElementById('logout-btn').addEventListener('click', async () => {
                await signOut(auth);
                window.location.href = 'index.html';
            });
            
            // Listen to cart changes for badge
            onSnapshot(collection(db, `users/${user.uid}/cart`), (snapshot) => {
                const count = snapshot.docs.reduce((acc, cartDoc) => acc + cartDoc.data().qty, 0);
                const badge = document.getElementById('cart-badge');
                if (badge) {
                    badge.textContent = count > 0 ? `(${count})` : '';
                }
            });
        } else {
            navbar.innerHTML = `
                <a href="index.html" class="nav-brand">🪴 Verdant</a>
                <div class="nav-links">
                    <a href="index.html" class="nav-link">Shop</a>
                    <a href="auth.html" class="nav-link">Login/Register</a>
                </div>
            `;
        }
    });
}

// Route guard helper
export function requireAuth() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                window.location.href = 'auth.html';
                reject('Not authenticated');
            }
        });
    });
}
