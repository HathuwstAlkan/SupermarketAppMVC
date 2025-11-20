// Run this script with: node scripts/seed_products.js
// It will insert 100 sample products into the `products` table if present.

const db = require('../db');

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Household'];

function rnd(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

async function seed(){
  try{
    const conn = await db.getConnectionWithTimeout ? await db.getConnectionWithTimeout(5000) : await db.pool.getConnection();
    await conn.query('USE ??', [process.env.DB_DATABASE]);
    for(let i=1;i<=100;i++){
      const cat = categories[i % categories.length];
      const name = `${cat} Product ${i}`;
      const qty = rnd(0,120);
      const price = (rnd(100,3000)/100).toFixed(2);
      const featured = (i%11===0)?1:0; // roughly some featured
      const img = 'default-avatar.svg';
      try{
        await conn.query('INSERT INTO products (productName, quantity, price, image, category, featured) VALUES (?, ?, ?, ?, ?, ?)', [name, qty, price, img, cat, featured]);
      }catch(e){
        // if category/featured columns don't exist, try without them
        try{ await conn.query('INSERT INTO products (productName, quantity, price, image) VALUES (?, ?, ?, ?)', [name, qty, price, img]); }
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
