const Product = require('../Models/Product');
const CartItem = require('../Models/CartItem');

async function getCartCount(req) {
    try {
        if (req.session && req.session.user) {
            const cnt = await CartItem.getCountByUser(req.session.user.id);
            return cnt || 0;
        }
    } catch (e) {
        return 0;
    }
    return 0;
}

const list = async (req, res) => {
    try {
        const products = await Product.getAllExtended();
        const cartCount = await getCartCount(req);
        // Group products by category for shelf-style display
        const categories = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(p);
        });

        // adjust availability by user's cart
        let cartMap = {};
        if (req.session && req.session.user) {
            const cartItems = await CartItem.getByUser(req.session.user.id);
            cartItems.forEach(ci => { cartMap[ci.product_id] = (cartMap[ci.product_id] || 0) + ci.quantity; });
        }

        Object.keys(categories).forEach(cat => {
            categories[cat] = categories[cat].map(p => ({ ...p, available: Math.max(0, (p.quantity || 0) - (cartMap[p.id] || 0)) }));
        });

        // featured products for landing/carousel
        const featured = products.filter(p => p.featured);

        const mode = req.query.mode || null;
        // If /features or /home, render `featured.ejs` (landing carousel); else render index
        if (req.path === '/features' || req.path === '/home') {
            res.render('featured', { featured, user: req.session?.user || null, cartCount });
        } else {
            res.render('index', { categories, featured: featured.slice(0,8), user: req.session?.user || null, cartCount, mode });
        }
    } catch (err) {
        res.status(500).render('error', { error: err.message, user: req.session?.user || null });
    }
};

const getById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.getById(id);
            if (!product) {
                return res.status(404).render('error', { 
                    error: 'Product not found',
                    user: req.session.user || null
                });
            }

            // If client requests JSON (AJAX/modal), send JSON payload
            const wantsJson = req.xhr || (req.get('Accept') || '').toLowerCase().includes('application/json') || req.query.format === 'json';
            if (wantsJson) {
                return res.json({ success: true, product });
            }

            const viewTemplate = req.path.includes('updateProduct') ? 'updateProduct' : 'product';
            const cartCount = await getCartCount(req);
            res.render(viewTemplate, { 
                product,
                user: req.session.user || null,
                cartCount
            });
    } catch (err) {
        res.status(500).render('error', { 
            error: err.message,
            user: req.session.user || null
        });
    }
};

const add = async (req, res) => {
    try {
        const productData = {
            productName: req.body.name,
            quantity: parseInt(req.body.quantity,10) || 0,
            price: parseFloat(req.body.price) || 0,
            image: req.file ? req.file.filename : null,
            category: req.body.category || null,
            featured: req.body.featured ? 1 : 0,
            brand: req.body.brand || null,
            bestBefore: req.body.bestBefore || null,
            deal: req.body.deal ? 1 : 0,
            perishable: req.body.perishable ? 1 : 0,
            expiry: req.body.expiry || null
        };
        await Product.add(productData);
        res.redirect('/');
    } catch (err) {
        res.status(500).render('error', { error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const productData = {
            productName: req.body.name,
            quantity: parseInt(req.body.quantity,10) || 0,
            price: parseFloat(req.body.price) || 0,
            image: req.file ? req.file.filename : req.body.currentImage,
            category: req.body.category || null,
            featured: req.body.featured ? 1 : 0,
            brand: req.body.brand || null,
            bestBefore: req.body.bestBefore || null,
            deal: req.body.deal ? 1 : 0,
            perishable: req.body.perishable ? 1 : 0,
            expiry: req.body.expiry || null
        };
        const ok = await Product.update(id, productData);
        if (!ok) return res.status(404).render('error', { error: 'Product not found' });
        res.redirect('/');
    } catch (err) {
        res.status(500).render('error', { error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const id = req.params.id;
        const ok = await Product.remove(id);
        if (!ok) return res.status(404).render('error', { error: 'Product not found' });
        res.redirect('/');
    } catch (err) {
        res.status(500).render('error', { error: err.message });
    }
};

const inventory = async (req, res) => {
    try {
        const products = await Product.getAll();
        const cartCount = await getCartCount(req);
        const productsAdjusted = products.map(p => ({ ...p, available: p.quantity || 0 }));
        res.render('inventory', { products: productsAdjusted, user: req.session?.user || null, cartCount });
    } catch (err) {
        res.status(500).render('error', { error: err.message, user: req.session?.user || null });
    }
};

const shopping = async (req, res) => {
    try {
        const products = await Product.getAllExtended();
        const cartCount = await getCartCount(req);
        // group by category and render shopping catalog
        const categories = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(p);
        });

        let cartMap = {};
        if (req.session && req.session.user) {
            const cartItems = await CartItem.getByUser(req.session.user.id);
            cartItems.forEach(ci => { cartMap[ci.product_id] = (cartMap[ci.product_id] || 0) + ci.quantity; });
        }

        Object.keys(categories).forEach(cat => {
            categories[cat] = categories[cat].map(p => ({ ...p, available: Math.max(0, (p.quantity || 0) - (cartMap[p.id] || 0)) }));
        });

        res.render('shopping', { categories, user: req.session?.user || null, cartCount });
    } catch (err) {
        res.status(500).render('error', { error: err.message, user: req.session?.user || null });
    }
};

// list products in a specific category
const byCategory = async (req, res) => {
    try {
        const cat = req.params.category;
        const items = await Product.getByCategory(cat);
        const cartCount = await getCartCount(req);
        res.render('products/category', { category: cat, products: items, user: req.session?.user || null, cartCount });
    } catch (err) {
        res.status(500).render('error', { error: err.message, user: req.session?.user || null });
    }
};

module.exports = {
    list,
    getById,
    add,
    update,
    delete: remove,
    inventory,
    shopping,
    byCategory
};