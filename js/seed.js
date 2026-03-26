import { db, doc, setDoc } from './firebase-config.js';

const generatePlants = () => {
    const plants = [];
    const names = [
        "Aloe Vera", "Snake Plant", "Boston Fern", "Peace Lily", "Spider Plant", 
        "Fiddle Leaf Fig", "Monstera Deliciosa", "Pothos", "ZZ Plant", "Rubber Plant",
        "Calathea Orbifolia", "Philodendron", "Cast Iron Plant", "Chinese Evergreen", "Bird of Paradise",
        "Jade Plant", "Parlor Palm", "English Ivy", "Areca Palm", "Dracaena",
        "Dumb Cane", "Majesty Palm", "Pilea Peperomioides", "String of Pearls", "Air Plant",
        "Bamboo Palm", "Croton", "Peperomia", "Polka Dot Plant", "Arrowhead Plant",
        "Rex Begonia", "Zebra Plant", "Nerve Plant", "Wax Plant", "Elephant Ear",
        "Money Tree", "Ponytail Palm", "Weeping Fig", "African Violet", "Bromeliad"
    ];

    const categoriesList = [
        ["low-light"], ["pet-friendly"], ["air-purifying"], 
        ["low-light", "pet-friendly"], ["low-light", "air-purifying"], 
        ["pet-friendly", "air-purifying"], ["low-light", "pet-friendly", "air-purifying"]
    ];

    const images = [
        "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1593482892290-f54927eba119?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601004147055-6b2a47d25e4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1620021509984-75eb92f447f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1597055936465-985b88126b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600411832986-5a4477b64a1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1485900277362-e19fe9b78a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1530968984360-63ce0445d3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1545241047-6083a36db15a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497250681560-ef03dffcbb01?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1520626336821-6bce43058864?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1510525019385-b82b988fceba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ];

    for (let i = 0; i < 40; i++) {
        const plantName = names[i] || `Plant ${i + 1}`;
        plants.push({
            id: `plant_${i + 1}`,
            name: plantName,
            price: Math.floor(Math.random() * 40) + 10.99,
            image: images[i % images.length],
            category: categoriesList[i % categoriesList.length],
            stock: 20,
            sold: 0
        });
    }
    return plants;
};

const initialPlants = generatePlants();

export async function seedPlants() {
    console.log("Seeding plants...");
    try {
        for (const plant of initialPlants) {
            await setDoc(doc(db, "plants", plant.id), {
                name: plant.name,
                price: plant.price,
                image: plant.image,
                category: plant.category,
                stock: plant.stock,
                sold: plant.sold
            });
        }
        console.log("Seeding complete!");
        alert("40 dummy plants seeded successfully! Reload the page to see changes.");
    } catch(err) {
        console.error("Error seeding", err);
        alert("Error seeding plants. Check console.");
    }
}

// Attach to window so it can be triggered from browser console
window.seedPlants = seedPlants;
