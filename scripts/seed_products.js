// Run this script with: node scripts/seed_products.js
// It will insert 100 sample products into the `products` table if present.

const db = require('../db');

const categories = ['Produce', 'Greens', 'Dairy', 'Poultry', 'Fish', 'Bakery', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Condiments'];
const brands = ['HarvestHill', 'OceanFresh', 'GoldenBake', 'QuickNoods', 'DairyPure', 'SunFarm', 'Everyday', 'CanningCo', 'GreenLeaf', 'TasteWell'];

function rnd(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

const catalog = [
  { name: 'Wholemeal Bread', category: 'Bakery' },
  { name: 'White Bread', category: 'Bakery' },
  { name: 'Canned Spam', category: 'Pantry' },
  { name: 'Instant Noodles (Chicken)', category: 'Pantry' },
  { name: 'Instant Noodles (Beef)', category: 'Pantry' },
  { name: 'Eggs (12 pack)', category: 'Dairy' },
  { name: 'Full Cream Milk 1L', category: 'Dairy' },
  { name: 'Skim Milk 1L', category: 'Dairy' },
  { name: 'Bananas (kg)', category: 'Produce' },
  { name: 'Apples (kg)', category: 'Produce' },
  { name: 'Baby Spinach', category: 'Greens' },
  { name: 'Romaine Lettuce', category: 'Greens' },
  { name: 'Frozen Fish Fillet', category: 'Frozen' },
  { name: 'Chicken Thighs (1kg)', category: 'Poultry' },
  { name: 'Salmon Fillet', category: 'Fish' },
  { name: 'Peanut Butter Jar', category: 'Pantry' },
  { name: 'Tomato Ketchup', category: 'Condiments' },
  { name: 'Soya Sauce', category: 'Condiments' },
  { name: 'Potato Chips', category: 'Snacks' },
  { name: 'Instant Oodles (Seafood)', category: 'Pantry' },
  { name: 'Olive Oil 500ml', category: 'Pantry' },
  { name: 'Sparkling Water 1L', category: 'Beverages' },
  { name: 'Coffee (Ground) 250g', category: 'Pantry' },
  { name: 'Green Tea Bags', category: 'Beverages' },
  { name: 'Sugar 1kg', category: 'Pantry' }
];

async function seed(){
  try{
    const conn = await db.getConnectionWithTimeout ? await db.getConnectionWithTimeout(5000) : await db.pool.getConnection();
    await conn.query('USE ??', [process.env.DB_DATABASE]);
    for(let i=0;i<100;i++){
      const seedItem = catalog[i % catalog.length];
      const cat = seedItem.category || categories[i % categories.length];
      const name = seedItem.name + (i >= catalog.length ? ` ${Math.floor(i/catalog.length)+1}` : '');
      const brand = brands[i % brands.length];
      const qty = rnd(0,120);
      const price = (rnd(80,3500)/100).toFixed(2);
      const featured = (i%10===0)?1:0; // some featured
      const deal = (i%17===0)?1:0; // occasional deal for expiring
      const img = 'default-avatar.svg';
      // best before within next 30 days for some items to simulate expiring deals
      const bestBefore = deal ? new Date(Date.now() + rnd(1,30)*24*60*60*1000).toISOString().slice(0,10) : null;
      try{
        await conn.query('INSERT INTO products (productName, quantity, price, image, category, featured, brand, bestBefore, deal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, qty, price, img, cat, featured, brand, bestBefore, deal]);
      }catch(e){
        // if some columns don't exist, try simpler insert
        try{ await conn.query('INSERT INTO products (productName, quantity, price, image, category) VALUES (?, ?, ?, ?, ?)', [name, qty, price, img, cat]); }
        catch(err){ console.warn('Insert failed for product', name, err.message); break; }
      }
    }
    console.log('Seeding complete');
    conn.release();
    process.exit(0);
  }catch(err){
    console.error('Seeding failed', err.message);
    process.exit(1);
  }
}

seed();
