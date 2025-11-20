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
        const products = await Product.getAll();
        const cartCount = await getCartCount(req);
        res.render('index', { products, user: req.session?.user || null, cartCount });
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
            quantity: req.body.quantity,
            price: req.body.price,
            image: req.file ? req.file.filename : null
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
            quantity: req.body.quantity,
            price: req.body.price,
            image: req.file ? req.file.filename : req.body.currentImage
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
        res.render('inventory', { products, user: req.session?.user || null, cartCount });
    } catch (err) {
        res.status(500).render('error', { error: err.message, user: req.session?.user || null });
    }
};

const shopping = async (req, res) => {
    try {
        const products = await Product.getAll();
        const cartCount = await getCartCount(req);
        res.render('shopping', { products, user: req.session?.user || null, cartCount });
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
    shopping
};