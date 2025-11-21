const db = require('../db');

// Simple keyword -> category mapping. Extend as needed.
const mapping = [
  { keywords: ['bread','bagel','croissant','bakery'], category: 'Bakery' },
  { keywords: ['milk','yogurt','cheese','butter','dairy'], category: 'Dairy' },
  { keywords: ['chicken','beef','sausage','meat','mince','pork'], category: 'Meat' },
  { keywords: ['fish','salmon','tuna','sardine','seafood','fillet'], category: 'Fish' },
  { keywords: ['banana','apple','tomato','carrot','onion','garlic','produce','fruit'], category: 'Produce' },
  { keywords: ['noodle','pasta','spaghetti','ramen','noodles'], category: 'Pantry' },
  { keywords: ['rice','sushi','lentil','beans','corn'], category: 'Pantry' },
  { keywords: ['oil','olive oil','ketchup','sauce','condiment'], category: 'Condiments' },
  { keywords: ['chips','snack','chocolate','cracker','crisps'], category: 'Snacks' },
  { keywords: ['frozen','icecream','pizza','frozen'], category: 'Frozen' },
  { keywords: ['toilet','soap','shampoo','toothpaste','household'], category: 'Household' },
  { keywords: ['coffee','tea','juice','beverage','water','drink'], category: 'Beverages' },
];

(async function assign(){
  try{
    console.log('Fetching products...');
    const [rows] = await db.query('SELECT id, productName, image, category FROM products');
    const updates = [];
    for(const r of rows){
      const name = (r.productName || '').toLowerCase();
      let assigned = r.category && r.category.trim() !== '' && r.category !== 'Uncategorized';
      if(assigned) continue;

      for(const m of mapping){
        for(const kw of m.keywords){
          if(name.includes(kw)){
            updates.push({ id: r.id, category: m.category });
            assigned = true;
            break;
          }
        }
        if(assigned) break;
      }
      if(!assigned){
        // fallback: set Uncategorized explicitly
        updates.push({ id: r.id, category: 'Uncategorized' });
      }
    }

    console.log(`Preparing to update ${updates.length} products`);
    for(const u of updates){
      await db.query('UPDATE products SET category = ? WHERE id = ?', [u.category, u.id]);
    }
    console.log('Category assignment complete.');
    process.exit(0);
  }catch(err){
    console.error('Failed to assign categories', err);
    process.exit(1);
  }
})();
