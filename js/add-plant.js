import { db, collection, addDoc } from './app.js';
import { setupNavbar } from './navbar.js';

setupNavbar();

const form = document.getElementById('add-plant-form');
const submitBtn = document.getElementById('submit-btn');
const statusMsg = document.getElementById('status-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding Plant...';
    statusMsg.textContent = '';
    
    const name = document.getElementById('p-name').value.trim();
    const price = parseFloat(document.getElementById('p-price').value);
    const categorySelect = document.getElementById('p-category');
    const categories = Array.from(categorySelect.selectedOptions).map(opt => opt.value);
    const image = document.getElementById('p-image').value.trim();
    const careInstructions = document.getElementById('p-care').value.trim();
    
    if (!name || isNaN(price) || categories.length === 0 || !image || !careInstructions) {
        showStatus('Please fill in all fields correctly.', 'var(--danger)');
        resetBtn();
        return;
    }
    
    try {
        await addDoc(collection(db, 'plants'), {
            name,
            price,
            category: categories,
            image,
            careInstructions,
            stock: 20, // Strict rule: initializes stock to exactly 20
            sold: 0
        });
        
        showStatus('Plant added successfully! Initial stock is 20.', 'var(--primary)');
        form.reset();
    } catch (err) {
        console.error("Error adding plant", err);
        showStatus('Failed to add plant to database.', 'var(--danger)');
    }
    
    resetBtn();
});

function showStatus(text, color) {
    statusMsg.style.color = color;
    statusMsg.textContent = text;
}

function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Plant to Inventory';
}
