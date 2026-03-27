import { db, doc, getDoc } from './app.js';
import { addToLocalCart } from './app.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

const container = document.getElementById('product-container');
const urlParams = new URLSearchParams(window.location.search);
const plantId = urlParams.get('id');

async function loadProduct() {
    if (!plantId) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">No plant ID provided.</p>`;
        return;
    }

    try {
        const docRef = doc(db, 'plants', plantId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Plant not found.</p>`;
            return;
        }

        const plant = { id: docSnap.id, ...docSnap.data() };
        const available = Math.max(0, plant.stock - (plant.sold || 0));
        const categories = Array.isArray(plant.category) ? plant.category : [plant.category];
        const outOfStock = available === 0;

        container.innerHTML = `
            <div>
                <img src="${plant.image}" alt="${plant.name}" style="width: 100%; border-radius: 16px; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.1); height: 500px;" onerror="this.src='https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80'">
            </div>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="card-tags">
                    ${categories.map(c => `<span class="tag">${c.replace('-', ' ')}</span>`).join('')}
                </div>
                <h1 style="font-size: 2.5rem; color: var(--primary); line-height: 1.2;">${plant.name}</h1>
                <div style="font-size: 1.8rem; font-weight: 700; color: var(--text);">
                    $${plant.price.toFixed(2)}
                </div>
                <div style="color: ${outOfStock ? 'var(--danger)' : 'var(--text-light)'}; font-weight: 500;">
                    ${outOfStock ? 'Out of Stock' : `${available} units available`}
                </div>
                
                <div style="background: var(--surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); margin-top: 1rem;">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.1rem;">Care Instructions</h3>
                    <p style="color: var(--text-light); line-height: 1.6;">${plant.careInstructions || 'Water when topsoil is dry. Keep in bright, indirect light. Avoid direct harsh sunlight.'}</p>
                </div>

                <div class="qty-controls" style="width: fit-content; margin-top: 1rem; padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;">
                    <button class="qty-btn" id="btn-dec" style="width: 35px; height: 35px; background: var(--bg-color); border-radius: 4px; border: none; cursor: pointer; font-weight: bold; font-size: 1.2rem;">-</button>
                    <span id="qty-val" style="width: 40px; text-align: center; font-weight: 600; font-size: 1.1rem;">1</span>
                    <button class="qty-btn" id="btn-inc" style="width: 35px; height: 35px; background: var(--bg-color); border-radius: 4px; border: none; cursor: pointer; font-weight: bold; font-size: 1.2rem;" ${available <= 1 ? 'disabled' : ''}>+</button>
                </div>

                <button id="add-to-cart-btn" class="btn-primary" style="padding: 1rem; font-size: 1.1rem; border-radius: 50px; margin-top: 1rem; width: 100%; box-shadow: 0 4px 15px rgba(45, 90, 39, 0.2);" ${outOfStock ? 'disabled' : ''}>
                    ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;

        // Interactive logic
        if (!outOfStock) {
            let qty = 1;
            const btnDec = document.getElementById('btn-dec');
            const btnInc = document.getElementById('btn-inc');
            const qtyVal = document.getElementById('qty-val');
            const addBtn = document.getElementById('add-to-cart-btn');

            btnDec.addEventListener('click', () => {
                if (qty > 1) {
                    qty--;
                    qtyVal.textContent = qty;
                    btnInc.disabled = false;
                    if (qty === 1) btnDec.disabled = true;
                }
            });
            btnDec.disabled = true;

            btnInc.addEventListener('click', () => {
                if (qty < available) {
                    qty++;
                    qtyVal.textContent = qty;
                    btnDec.disabled = false;
                    if (qty >= available) btnInc.disabled = true;
                }
            });

            addBtn.addEventListener('click', () => {
                addBtn.textContent = 'Adding...';
                addBtn.disabled = true;
                
                setTimeout(() => {
                    addToLocalCart(plant, qty);
                    addBtn.textContent = 'Added to Cart ✔';
                    
                    setTimeout(() => {
                        addBtn.textContent = 'Add to Cart';
                        addBtn.disabled = false;
                        qty = 1;
                        qtyVal.textContent = '1';
                        btnDec.disabled = true;
                        btnInc.disabled = available <= 1;
                    }, 1500);
                }, 400);
            });
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Error displaying product.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadProduct);
