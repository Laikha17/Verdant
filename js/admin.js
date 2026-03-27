import { db, collection, onSnapshot, doc, updateDoc, deleteDoc } from './app.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

const tbody = document.getElementById('inventory-tbody');
let allInventory = [];

// Listen for actual data
onSnapshot(collection(db, 'plants'), (snapshot) => {
    allInventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTable();
}, (error) => {
    console.error("Error fetching inventory: ", error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Error loading inventory.</td></tr>`;
});

function renderTable() {
    tbody.innerHTML = '';
    
    if (allInventory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No plants found in inventory.</td></tr>`;
        return;
    }
    
    allInventory.forEach(plant => {
        const available = Math.max(0, plant.stock - (plant.sold || 0));
        const categories = Array.isArray(plant.category) ? plant.category.join(', ') : plant.category;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${plant.image}" alt="${plant.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
            <td style="font-weight: 500;">${plant.name}</td>
            <td style="color: var(--text-light); text-transform: capitalize;">${categories}</td>
            <td style="font-weight: 600;">$${plant.price.toFixed(2)}</td>
            <td style="color: ${available <= 5 ? 'var(--danger)' : 'var(--text)'}; font-weight: ${available <= 5 ? 'bold' : 'normal'};">
                ${available}
            </td>
            <td style="text-align: right;">
                <div class="action-btns" style="justify-content: flex-end;">
                    <button class="btn-primary update-btn" data-id="${plant.id}" data-current="${plant.stock}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; width: auto; background-color: #2b7a78;">Update Stock</button>
                    <button class="btn-danger delete-btn" data-id="${plant.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Attach event listeners
    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const currentStock = e.target.getAttribute('data-current');
            
            const newStockStr = prompt("Enter the new absolute stock value:", currentStock);
            if (newStockStr !== null && newStockStr.trim() !== "") {
                const newStock = parseInt(newStockStr, 10);
                if (!isNaN(newStock) && newStock >= 0) {
                    try {
                        const plant = allInventory.find(p => p.id === id);
                        // Updating base stock. The available stock is (stock - sold).
                        // If admin sets absolute stock, they probably mean absolute available stock.
                        // So we can set stock = newStock + plant.sold. Or reset sold to 0. Let's just update `stock` and reset `sold` to 0 for simplicity.
                        await updateDoc(doc(db, 'plants', id), {
                            stock: newStock,
                            sold: 0
                        });
                    } catch(err) {
                        console.error("Error updating stock", err);
                        alert("Failed to update stock.");
                    }
                } else {
                    alert("Please enter a valid positive number.");
                }
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this plant? This action cannot be undone.")) {
                try {
                    await deleteDoc(doc(db, 'plants', id));
                } catch(err) {
                    console.error("Error deleting plant", err);
                    alert("Failed to delete plant.");
                }
            }
        });
    });
}
