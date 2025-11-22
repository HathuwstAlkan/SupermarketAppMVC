// Auto-categorize existing products based on product names
// Run this once to categorize existing products in database
// Usage: node scripts/categorize_products.js

const db = require('../db');

const categoryMappings = [
  {
    category: 'Fruits & Vegetables',
    keywords: ['banana', 'apple', 'tomato', 'tomatoes', 'lettuce', 'spinach', 'carrot',  'cucumber', 'onion', 'garlic', 'fruit']
  },
  {
    category: 'Dairy & Eggs',
   keywords: ['milk', 'egg', 'butter', 'cheese', 'yogurt', 'cottage', 'dairy']
  },
  {
    category: 'Meat & Seafood',
    keywords: ['chicken', 'beef', 'salmon', 'fish', 'sausage', 'meat']
  },
  {
    category: 'Bakery',
    keywords: ['bread', 'bagel', 'croissant', 'pancake', 'muffin']
  },
  {
    category: 'Beverages',
    keywords: ['water', 'juice', 'tea', 'coffee', 'drink', 'energy']
  },
  {
    category: 'Snacks & Candy',
    keywords: ['chip', 'chocolate', 'candy', 'muesli', 'cracker', 'seaweed']
  },
  {
    category: 'Canned & Packaged Foods',
    keywords: ['noodle', 'spam', 'tuna', 'bean', 'pasta', 'rice', 'sardine', 'corn', 'lentil']
  },
  {
    category: 'Frozen Foods',
    keywords: ['frozen', 'ice cream', 'pizza']
  },
  {
    category: 'Personal Care',
    keywords: ['shampoo', 'soap', 'toothpaste', 'shave', 'face wash', 'lip balm']
  },
  {
    category: 'Household',
    keywords: ['toilet', 'dishwash', 'dog food', 'cat food', 'paper']
  }
];

const perishableCategories = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Frozen Foods'
];

async function categorizeProducts() {
  try {
    await db.initializeDatabase();
    
    const [products] = await db.query('SELECT id, productName, category FROM products');
    console.log(`Found ${products.length} products to categorize`);
    
    let categorized = 0;
    let uncategorized = 0;
    
    for (const product of products) {
      // Skip if already categorized
      if (product.category && product.category !== '' && product.category !== 'Uncategorized' && product.category !== 'Other') {
        console.log(`✓ ${product.productName}: already categorized as ${product.category}`);
        continue;
      }
      
      const productNameLower = product.productName.toLowerCase();
      let matched = false;
      
      // Try to match with category keywords
      for (const mapping of categoryMappings) {
        for (const keyword of mapping.keywords) {
          if (productNameLower.includes(keyword)) {
            await db.query(
              'UPDATE products SET category = ? WHERE id = ?',
              [mapping.category, product.id]
            );
            
            console.log(`✓ ${product.productName} → ${mapping.category}`);
            categorized++;
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
      
      // If no match, mark as "Other"
      if (!matched) {
        await db.query(
          'UPDATE products SET category = ? WHERE id = ?',
          ['Other', product.id]
        );
        console.log(`? ${product.productName} → Other (no keyword match)`);
        uncategorized++;
      }
    }
    
    console.log(`\n=== Results ===`);
    console.log(`Categorized: ${categorized}`);
    console.log(`Uncategorized (set to "Other"): ${uncategorized}`);
    console.log(`Total processed: ${products.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error categorizing products:', err);
    process.exit(1);
  }
}

categorizeProducts();
