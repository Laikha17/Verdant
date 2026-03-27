import { db } from './app.js';
import { collection, doc, deleteDoc, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.seedData = async function(clearFirst = true) {
    if (clearFirst) {
        console.log('Wiping database...');
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
        } catch(e){}
    }
    console.log(`Successfully seeded precise images. Refreshing...`);
    setTimeout(() => window.location.reload(), 1500);
};

// Expose legacy hook if it is bound to an old button
window.seedPlants = window.seedData;
