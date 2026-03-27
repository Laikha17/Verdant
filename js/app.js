import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, increment, addDoc, deleteDoc, query, limit, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHS4YTi2WyfQ2duh1wl0VBfTCof3SlOLI",
  authDomain: "cse24pa1a0502-verdant.firebaseapp.com",
  projectId: "cse24pa1a0502-verdant",
  storageBucket: "cse24pa1a0502-verdant.firebasestorage.app",
  messagingSenderId: "333644553013",
  appId: "1:333644553013:web:cfb1506e1111662ed70a7c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const formatINR = (num) => `₹${num.toLocaleString('en-IN')}`;

window.seedData = async function(clearFirst = true) {
    if (clearFirst) {
        showToast('Wiping database...', 'success');
        const snap = await getDocs(collection(db, 'plants'));
        for(const d of snap.docs) { try { await deleteDoc(doc(db, 'plants', d.id)); } catch(e){} }
    }
    const assets = [
        { id: '1545241047-6083a3684587', name: 'Monstera' },
        { id: '1596547514121-653775f0a38b', name: 'Snake Plant' },
        { id: '1512428559086-560e5dd14d1f', name: 'Pothos' },
        { id: '1509423350119-c6374092d634', name: 'Succulent' },
        { id: '1453904300235-df5c00d4265b', name: 'Aloe Vera' }
    ];
    const cats = ['Indoor', 'Outdoor', 'Low Maintenance'];
    let created = 0; showToast('Seeding Botany-Only optimal thumbnails...', 'success');
    for(let i=1; i<=45; i++) {
        const c = cats[i % 3]; 
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const img = `https://images.unsplash.com/photo-${asset.id}?w=400&q=80&fit=crop&auto=format`;
        const plantName = `${asset.name} Variant ${i}`;
        const price = Math.floor(Math.random() * 2500) + 199;
        try {
            await addDoc(collection(db, 'plants'), {
                name: plantName, price: price, category: [c.toLowerCase().replace(' ', '-')],
                image: img, imageUrl: img, careInstructions: "Perfect layout.", stock: 25, sold: 0
            });
            created++;
        } catch(e){}
    }
    showToast(`Successfully seeded precise images. Refreshing...`, 'success');
    setTimeout(() => window.location.reload(), 1500);
};

window.cleanupImages = async function() {
    showToast('Sweeping Database for bad images...', 'success');
    try {
        const plants = await getDocs(collection(db, 'plants'));
        let fixed = 0;
        for (let plant of plants.docs) {
            const data = plant.data();
            const img = data.image || data.imageUrl || '';
            if (img.includes('car') || !img.includes('unsplash.com')) {
                await updateDoc(doc(db, 'plants', plant.id), { 
                    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&q=80',
                    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&q=80'
                });
                fixed++;
            }
        }
        if(fixed > 0) showToast(`Cleaned ${fixed} broken aesthetic cards!`, 'success');
    } catch(err) {}
};

export function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
    const toast = document.createElement('div'); toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span style="font-size:1.2rem;">${type==='success'?'🌱':'⚠️'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

function getLocalCart(){const c=localStorage.getItem('verdant_cart');return c?JSON.parse(c):[];}
function saveLocalCart(c){localStorage.setItem('verdant_cart',JSON.stringify(c));updateCartBadge();}
function addToLocalCart(p,q){
    const c=getLocalCart();const e=c.find(i=>i.id===p.id);
    if(e)e.qty+=q;else c.push({...p,qty:q});
    saveLocalCart(c); showToast('Item Added to Cart', 'success');
}
function clearLocalCart(){localStorage.removeItem('verdant_cart');updateCartBadge();}
function updateCartBadge(){const c=getLocalCart();const t=c.reduce((a,i)=>a+i.qty,0);const b=document.getElementById('cart-badge');if(b)b.textContent=t>0?`(${t})`:'';}

let currentUserRole = null; 
onAuthStateChanged(auth, async (user) => {
    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path.includes('register.html');
    
    if (user) {
        try {
            const uDoc = await getDoc(doc(db, 'users', user.uid));
            if (uDoc.exists()) {
                currentUserRole = uDoc.data().role || 'buyer';
                setupNavbar(user);
                
                if (currentUserRole === 'manager') {
                    if (isAuthPage) window.location.href = 'index.html'; 
                } else if (currentUserRole === 'buyer') {
                    if (isAuthPage) window.location.href = 'index.html'; 
                    else if (path.includes('admin.html') || path.includes('add-plant.html')) window.location.href = 'index.html';
                }
            } else { currentUserRole = 'buyer'; setupNavbar(user); }
        } catch (err) { console.error(err); showToast("Connection Error", "error"); }
    } else {
        setupNavbar(null);
        if (path.includes('admin.html') || path.includes('add-plant.html') || path.includes('account.html') || path.includes('checkout.html')) window.location.href = 'login.html';
    }
});

function setupNavbar(user) {
    const nav = document.getElementById('navbar'); if (!nav) return;
    
    if(nav.dataset.init !== 'true') {
        nav.innerHTML = `
            <a href="index.html" class="nav-brand">🪴 Verdant</a>
            <div class="nav-links">
                <a href="index.html" class="nav-link">Home</a>
                <a href="products.html" class="nav-link">Gallery</a>
                <a href="admin.html" id="nav-admin" class="nav-link" style="display:none;">Admin Panel</a>
                <a href="account.html" id="nav-account" class="nav-link" style="display:none;">Dashboard</a>
                <a href="account.html" id="nav-orders" class="nav-link" style="display:none;">My Orders</a>
                <a href="checkout.html" id="nav-cart" class="nav-link" style="display:none;">Cart <span id="cart-badge"></span></a>
                <a href="login.html" id="nav-login" class="nav-link" style="display:none;">Login</a>
                <button id="logout-btn" class="nav-link" style="display:none; background:none; font-size:inherit; font-weight:600; color:var(--danger);">Logout</button>
            </div>`;
        nav.dataset.init = 'true';
        document.getElementById('logout-btn').onclick = async () => { await signOut(auth); window.location.href = 'index.html'; };
    }

    const nAdmin = document.getElementById('nav-admin'), nAcc = document.getElementById('nav-account'), nOrd = document.getElementById('nav-orders'), nCart = document.getElementById('nav-cart'), nLog = document.getElementById('nav-login'), nOut = document.getElementById('logout-btn');

    if (user) {
        nLog.style.display = 'none'; nOut.style.display = 'inline-block';
        if (currentUserRole === 'manager') {
            nCart.style.display = 'none'; nAdmin.style.display = 'inline-block'; nAcc.style.display = 'inline-block'; nOrd.style.display = 'none';
        } else {
            nCart.style.display = 'inline-block'; nAdmin.style.display = 'none'; nAcc.style.display = 'none'; nOrd.style.display = 'inline-block';
        }
    } else {
        nLog.style.display = 'inline-block'; nOut.style.display = 'none'; nCart.style.display = 'inline-block'; nAdmin.style.display = 'none'; nAcc.style.display = 'none'; nOrd.style.display = 'none';
    }
    updateCartBadge();
}

function initAuthUI() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault(); const btn = document.getElementById('login-btn'); btn.textContent = 'Authenticating...'; btn.disabled = true;
            try { await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value); showToast("Login Successful", "success"); setTimeout(() => window.location.href = 'index.html', 500); } catch (err) { showToast("Invalid Credentials", "error"); btn.textContent = 'Sign In'; btn.disabled = false; }
        };
    }
    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.onsubmit = async (e) => {
            e.preventDefault(); const btn = document.getElementById('reg-btn'); btn.textContent = 'Registering...'; btn.disabled = true;
            try {
                const cred = await createUserWithEmailAndPassword(auth, document.getElementById('reg-email').value, document.getElementById('reg-password').value);
                await setDoc(doc(db, 'users', cred.user.uid), { email: cred.user.email, role: document.getElementById('reg-role').value });
                showToast("Registration complete.", "success"); setTimeout(() => window.location.href = 'index.html', 500); 
            } catch (err) { showToast("Registration Failed", "error"); btn.textContent = 'Sign Up'; btn.disabled = false; }
        };
    }
}

async function initIndex() {
    const grid = document.getElementById('featured-grid'); if (!grid) return;
    try {
        const snap = await getDocs(query(collection(db, 'plants'), limit(50)));
        grid.innerHTML = '';
        if (snap.empty) { grid.innerHTML = `<p style="grid-column:1/-1;">No plants available.</p>`; return; }
        
        let allP = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const approvedIds = ['1545241047-6083a3684587', '1596547514121-653775f0a38b', '1512428559086-560e5dd14d1f', '1509423350119-c6374092d634', '1453904300235-df5c00d4265b'];
        
        let filteredP = allP.filter(p => {
            const iSrc = p.image || p.imageUrl || '';
            return approvedIds.some(aid => iSrc.includes(aid));
        });

        if (filteredP.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding: 2rem;">
                    <p style="margin-bottom: 2rem; color:var(--text-light); font-size: 1.1rem;">No Verified High-Quality Plants Found.</p>
                    <button id="emergency-seed-home" class="btn-primary" style="padding: 1rem 3rem;">🚀 One-Click: Reseed Aesthetic Plants</button>
                </div>
            `;
            document.getElementById('emergency-seed-home').onclick = () => window.seedData(true);
            return;
        }

        allP = filteredP.slice(0, 3);

        allP.forEach(p => {
            if(!p.name || !p.price) return;
            const cHTML = document.createElement('div'); cHTML.className = 'card plant-card';
            const iSrc = p.image || p.imageUrl || '';
            cHTML.innerHTML = `
                <a href="product.html?id=${p.id}">
                    <img src="${iSrc}" style="width:100%; height:250px; object-fit:cover; border-radius:16px 16px 0 0;" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&q=80'" loading="lazy">
                </a>
                <div class="card-content"><h3 class="card-title">${p.name}</h3><span class="card-price">${formatINR(p.price)}</span></div>`;
            grid.appendChild(cHTML);
        });
    } catch (e) {
        grid.innerHTML = `<p style="color:var(--danger); grid-column:1/-1;">Check connection.</p>`;
    }
}

async function initProducts() {
    const grid = document.getElementById('plants-grid'); if(!grid) return;
    try {
        const snap = await getDocs(query(collection(db, 'plants')));
        if(snap.empty) { grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;">No plants available.</p>'; return; }
        
        let allP = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const approvedIds = ['1545241047-6083a3684587', '1596547514121-653775f0a38b', '1512428559086-560e5dd14d1f', '1509423350119-c6374092d634', '1453904300235-df5c00d4265b'];
        
        let filteredP = allP.filter(p => {
            const iSrc = p.image || p.imageUrl || '';
            return approvedIds.some(aid => iSrc.includes(aid));
        });

        if (filteredP.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding: 4rem 1rem;">
                    <h2>Database Unverified (Contains Cars or Legacy Elements)</h2>
                    <p style="margin: 1rem 0 2rem; color:var(--text-light); font-size: 1.1rem;">The front-end filter has aggressively blocked unverified elements from rendering.<br>Click below to completely overwrite the database with 45 perfect, 100% verified plants globally.</p>
                    <button id="emergency-seed-gallery" class="btn-primary" style="padding: 1rem 3rem; font-size: 1.2rem;">🚀 Reseed Verified 45 UI</button>
                </div>
            `;
            document.getElementById('emergency-seed-gallery').onclick = () => window.seedData(true);
            return;
        }

        allP = filteredP;

        function renderCards(fil) {
            grid.innerHTML = '';
            fil.forEach(p => {
                if(!p.name || !p.price) return;
                const av = Math.max(0, p.stock - (p.sold||0)); const os = av === 0;
                const c = document.createElement('div'); c.className = 'card plant-card';
                const iSrc = p.image || p.imageUrl || '';
                c.innerHTML = `
                    <a href="product.html?id=${p.id}">
                        <img src="${iSrc}" style="width:100%; height:250px; object-fit:cover; border-radius:16px 16px 0 0;" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&q=80'" loading="lazy">
                    </a>
                    <div class="card-content">
                        <h3 class="card-title">${p.name}</h3><div class="card-price">${formatINR(p.price)}</div>
                        <div class="card-stock" style="color:${os?'var(--danger)':'var(--primary)'}">${os?'Out of Stock':`${av} left in stock`}</div>
                        <button class="btn-primary add-to-cart" data-id="${p.id}" ${os?'disabled':''}>${os?'Sold Out':'Add to Cart'}</button>
                    </div>`;
                grid.appendChild(c);
                c.querySelector('.add-to-cart').onclick = () => addToLocalCart(p, 1);
            });
        }
        renderCards(allP);
        
        const filters = document.getElementById('filters');
        if (filters) {
            filters.addEventListener('click', e => {
                if(e.target.classList.contains('filter-btn')){
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const curF = e.target.getAttribute('data-filter');
                    renderCards(curF === 'all' ? allP : allP.filter(p => {
                        let c = Array.isArray(p.category)?p.category:[p.category];
                        return c.map(x=>x.toLowerCase().replace(' ','-')).includes(curF.toLowerCase().replace(' ','-'));
                    }));
                }
            });
        }
    } catch(err) {
        grid.innerHTML = `<p style="color:var(--danger); grid-column:1/-1;">Check connection.</p>`;
    }
}

async function initProductDetail() {
    const con = document.getElementById('product-container'); if (!con) return;
    const pid = new URLSearchParams(window.location.search).get('id'); if(!pid) return;
    con.innerHTML = `<div class="skeleton-card" style="height:400px; animation: pulse 1.5s infinite; background:#e0e0e0;"></div>`;
    try {
        const ds = await getDoc(doc(db, 'plants', pid));
        if(!ds.exists()) { con.innerHTML = `<p>Not found.</p>`; return; }
        const p={id:ds.id,...ds.data()}; const av=Math.max(0,p.stock-(p.sold||0)); const os=av===0;
        
        con.innerHTML = `
        <div style="background:var(--glass-bg); backdrop-filter:blur(15px); border:1px solid var(--glass-border); border-radius:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; overflow:hidden;">
            <img src="${p.image||p.imageUrl}" alt="${p.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover; min-height:400px;">
            <div style="padding: 2.5rem; display:flex; flex-direction:column; gap:1.5rem;">
                <h1 style="font-size:2.5rem; color:var(--primary);">${p.name}</h1>
                <div style="font-size:1.8rem; font-weight:700;">${formatINR(p.price)}</div>
                <p style="color:var(--text-light);">${p.careInstructions || 'Keep in indirect light.'}</p>
                <div class="qty-controls" style="width:fit-content;padding:0.5rem;background:#fff;border:1px solid var(--border);border-radius:8px;"><button class="qty-btn" id="btn-dec" style="border:none;">-</button><span id="qty-val" style="width:40px;text-align:center;font-weight:600;">1</span><button class="qty-btn" id="btn-inc" style="border:none;" ${av<=1?'disabled':''}>+</button></div>
                <button id="detail-add-btn" class="btn-primary" ${os?'disabled':''} style="margin-top:auto;">${os?'Out of Stock':'Add to Cart'}</button>
            </div>
        </div>`;
        if(!os) {
            let q=1;const bd=document.getElementById('btn-dec'),bi=document.getElementById('btn-inc'),qv=document.getElementById('qty-val');
            bd.disabled=true;
            bd.onclick=()=>{if(q>1){q--;qv.textContent=q;bi.disabled=false;if(q===1)bd.disabled=true;}};
            bi.onclick=()=>{if(q<av){q++;qv.textContent=q;bd.disabled=false;if(q>=av)bi.disabled=true;}};
            document.getElementById('detail-add-btn').onclick = () => addToLocalCart(p, q);
        }
    } catch (e) { con.innerHTML = `<p style="color:var(--danger);">Check connection.</p>`; }
}

function initCheckout() {
    const con = document.getElementById('cart-container'), sb = document.getElementById('subtotal'), tl = document.getElementById('total'), cb = document.getElementById('checkout-btn');
    if (!con) return;
    function render() {
        const c = getLocalCart();
        if (c.length === 0) {
            con.innerHTML = `<div style="padding:3rem;text-align:center;background:var(--glass-bg);border-radius:16px;"><p>Your cart is empty.</p></div>`;
            cb.disabled = true; sb.textContent = '₹0'; tl.textContent = '₹0'; return;
        }
        con.innerHTML = ''; let st = 0;
        c.forEach((i, idx) => {
            st += i.price * i.qty;
            con.innerHTML += `<div class="cart-item"><img src="${i.image||i.imageUrl}" loading="lazy"><div style="flex-grow:1;"><h3>${i.name}</h3><p>${formatINR(i.price)}</p></div><div class="qty-controls"><button class="qty-btn dec-btn" data-index="${idx}">-</button><span>${i.qty}</span><button class="qty-btn inc-btn" data-index="${idx}">+</button></div><div style="font-weight:700;">${formatINR(i.price*i.qty)}</div><button class="rm-btn" data-index="${idx}" style="background:none;color:var(--danger);font-size:1.5rem;">&times;</button></div>`;
        });
        sb.textContent = formatINR(st); tl.textContent = formatINR(st); cb.disabled = false;
        document.querySelectorAll('.dec-btn').forEach(b => b.onclick = e => { const x = e.target.dataset.index; if (c[x].qty > 1) { c[x].qty--; saveLocalCart(c); render(); } });
        document.querySelectorAll('.inc-btn').forEach(b => b.onclick = e => { const x = e.target.dataset.index; c[x].qty++; saveLocalCart(c); render(); });
        document.querySelectorAll('.rm-btn').forEach(b => b.onclick = e => { c.splice(e.target.dataset.index, 1); saveLocalCart(c); render(); });
    }
    render();
    cb.onclick = async () => {
        const c = getLocalCart(); if (c.length === 0) return;
        cb.disabled = true; cb.textContent = 'Processing...';
        try {
            const uid = auth.currentUser ? auth.currentUser.uid : 'guest';
            let st = 0;
            for (const i of c) { st += i.price * i.qty; await updateDoc(doc(db, 'plants', i.id), { stock: increment(-i.qty), sold: increment(i.qty) }); }
            await addDoc(collection(db, 'orders'), { uid: uid, items: c, total: st, status: 'Pending', createdAt: new Date().toISOString() });
            clearLocalCart(); render();
            showToast("Success! Tracking Order...", "success"); setTimeout(() => window.location.href = auth.currentUser ? 'account.html' : 'index.html', 1500);
        } catch (err) { showToast("Connection Error", "error"); cb.disabled = false; cb.textContent = 'Pay Securely'; }
    };
}

async function initAccount() {
    const con = document.getElementById('account-container'); if(!con) return;
    onAuthStateChanged(auth, async (user) => {
        if (!user) { window.location.href = 'login.html'; return; }
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        const role = uDoc.exists() ? (uDoc.data().role || 'buyer') : 'buyer';
        
        if (role === 'buyer') {
            con.innerHTML = `<h2 class="section-title">My Orders</h2><div style="overflow-x:auto;"><table class="admin-table"><thead><tr><th>Order ID</th><th>Total</th><th>Status</th></tr></thead><tbody id="buyer-orders"><tr><td colspan="3">Loading...</td></tr></tbody></table></div>`;
            try {
                const snap = await getDocs(query(collection(db, 'orders'), where('uid', '==', user.uid)));
                const tb = document.getElementById('buyer-orders');
                if (snap.empty) { tb.innerHTML = '<tr><td colspan="3" style="text-align:center;">No orders found.</td></tr>'; return; }
                tb.innerHTML = '';
                snap.forEach(d => { const o = d.data(); tb.innerHTML += `<tr><td>${d.id}</td><td>${formatINR(o.total)}</td><td><span class="tag">${o.status}</span></td></tr>`; });
            } catch(e) { con.innerHTML = `<p style="color:var(--danger)">Check connection.</p>`; }
        } else {
            con.innerHTML = `<h2 class="section-title">Business Command Center</h2><div class="product-grid" style="margin-bottom:2rem; width:100%; padding:0; gap:20px;"><div class="card" style="padding:2rem;"><h3 style="color:var(--text-light)">Total Revenue</h3><h1 id="total-revenue" style="color:var(--primary);font-size:2.5rem;">₹0</h1></div><div class="card" style="padding:2rem;"><h3 style="color:var(--text-light)">Low Stock Alerts (< 5)</h3><div id="low-stock-list">Loading...</div></div></div><h2>Order Management</h2><div style="overflow-x:auto;"><table class="admin-table"><thead><tr><th>Order ID</th><th>Total</th><th>Status (Click to toggle)</th></tr></thead><tbody id="admin-orders"><tr><td colspan="3">Loading...</td></tr></tbody></table></div>`;
            try {
                const ordSnap = await getDocs(collection(db, 'orders'));
                let rev = 0; const tb = document.getElementById('admin-orders'); tb.innerHTML = '';
                if(ordSnap.empty) { tb.innerHTML = `<tr><td colspan="3" style="text-align:center;">No orders.</td></tr>`; }
                ordSnap.forEach(d => {
                    const o = d.data(); rev += o.total; 
                    tb.innerHTML += `<tr><td>${d.id}</td><td>${formatINR(o.total)}</td><td><button class="btn-primary toggle-status-btn" data-id="${d.id}" data-status="${o.status}" style="padding:0.4rem 1rem;">${o.status}</button></td></tr>`;
                });
                document.getElementById('total-revenue').innerText = formatINR(rev);
                document.querySelectorAll('.toggle-status-btn').forEach(btn => {
                    btn.onclick = async (e) => {
                        const id = e.target.dataset.id; let s = e.target.dataset.status;
                        let nx = s === 'Pending' ? 'Shipped' : (s === 'Shipped' ? 'Delivered' : 'Pending');
                        await updateDoc(doc(db, 'orders', id), { status: nx }); showToast(`Order marked as ${nx}`, 'success'); e.target.innerText = nx; e.target.dataset.status = nx;
                    };
                });
                const lqSnap = await getDocs(query(collection(db, 'plants'), where('stock', '<', 5)));
                const ll = document.getElementById('low-stock-list'); ll.innerHTML = '';
                if (lqSnap.empty) { ll.innerHTML = '<p>All stock levels healthy.</p>'; }
                lqSnap.forEach(d => { const p = d.data(); ll.innerHTML += `<p style="color:var(--danger);font-weight:600;margin-bottom:0.5rem;">${p.name} - Only ${p.stock} left!</p>`; });
            } catch(e) { con.innerHTML = `<p style="color:var(--danger)">Check connection.</p>`; }
        }
    });
}

function initAdmin() {
    const tb = document.getElementById('inventory-tbody'); if (!tb) return;
    async function loadAdmin() {
        try {
            const snap = await getDocs(collection(db, 'plants'));
            tb.innerHTML = '';
            if (snap.empty) { tb.innerHTML = `<tr><td colspan="6" style="text-align:center;">No inventory.</td></tr>`; return; }
            snap.forEach(d => {
                const p = { id: d.id, ...d.data() }; const av = Math.max(0, p.stock - (p.sold||0)); const cs = Array.isArray(p.category)?p.category.join(', '):p.category;
                tb.innerHTML += `<tr><td><img src="${p.image||p.imageUrl}" alt="${p.name}"></td><td>${p.name}</td><td>${cs}</td><td>${formatINR(p.price)}</td><td style="color:${av<=5?'red':'inherit'}">${av}</td><td><button class="btn-primary update-btn" data-id="${p.id}" data-current="${p.stock}" style="padding:0.4rem;font-size:0.8rem;width:auto;">Update</button> <button class="btn-danger delete-btn" data-id="${p.id}" style="padding:0.4rem;font-size:0.8rem;width:auto;">Del</button></td></tr>`;
            });
            document.querySelectorAll('.update-btn').forEach(b => b.onclick = async e => {
                const id = e.target.dataset.id; const cr = e.target.dataset.current; const ns = prompt("New absolute stock:", cr);
                if (ns !== null && ns.trim() !== "") { const nsv = parseInt(ns, 10); if (!isNaN(nsv) && nsv >= 0) try { await updateDoc(doc(db, 'plants', id), { stock: nsv, sold: 0 }); showToast("Stock updated", "success"); loadAdmin(); } catch (e) {} }
            });
            document.querySelectorAll('.delete-btn').forEach(b => b.onclick = async e => { if (confirm("Delete plant?")) try { await deleteDoc(doc(db, 'plants', e.target.dataset.id)); showToast("Deleted", "success"); loadAdmin(); } catch (err) {} });
        } catch(e) {
            tb.innerHTML = `<tr><td colspan="6" style="text-align:center;"><p style="color:var(--danger)">Check connection.</p></td></tr>`;
        }
    }
    loadAdmin();
}

function initAddPlant() {
    const fm = document.getElementById('add-plant-form'); if (!fm) return;
    fm.onsubmit = async e => {
        e.preventDefault(); const sBtn = document.getElementById('submit-btn');
        sBtn.disabled = true; sBtn.textContent = 'Adding...';
        const n = document.getElementById('p-name').value.trim(), p = parseFloat(document.getElementById('p-price').value), c = [document.getElementById('p-category').value], i = document.getElementById('p-image').value.trim(), ca = document.getElementById('p-care').value.trim();
        try {
            await addDoc(collection(db, 'plants'), { name: n, price: p, category: c, image: i, careInstructions: ca, stock: 20, sold: 0 });
            showToast('Plant Added Successfully!', 'success'); fm.reset();
        } catch (err) { console.error(err); showToast("Connection Error", "error"); }
        sBtn.disabled = false; sBtn.textContent = 'Add Plant';
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    window.cleanupImages();
    const p = window.location.pathname;
    if (p.endsWith('/') || p.endsWith('index.html')) initIndex();
    else if (p.endsWith('products.html')) initProducts();
    else if (p.endsWith('product.html')) initProductDetail();
    else if (p.endsWith('checkout.html') || p.endsWith('cart.html')) initCheckout();
    else if (p.endsWith('admin.html')) initAdmin();
    else if (p.endsWith('add-plant.html')) initAddPlant();
    else if (p.endsWith('account.html')) initAccount();
});
