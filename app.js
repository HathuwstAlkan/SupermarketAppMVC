const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const app = express();
const db = require('./db');
const User = require('./Models/User');
const Product = require('./Models/Product');
const CartItem = require('./Models/CartItem');

// Import product controller only (like StudentAppMVC)
const productController = require('./Controllers/ProductController');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
});

// expose flash messages and cart count to views
app.use(async (req, res, next) => {
    res.locals.flash = {
        success: req.flash('success') || [],
        error: req.flash('error') || [],
        info: req.flash('info') || []
    };
    if (req.session?.user) {
        try {
            const cnt = await CartItem.getCountByUser(req.session.user.id);
            res.locals.cartCount = cnt || 0;
        } catch (e) {
            res.locals.cartCount = 0;
        }
    } else {
        res.locals.cartCount = 0;
    }
    next();
});

// --- AUTH ROUTES (restore original behaviour) ---

// show register page
app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] || {}, user: req.session?.user || null });
});

// handle register (now using User model)
app.post('/register', async (req, res) => {
    const { username, email, password, address, contact, role } = req.body;
    if (!username || !email || !password || !address || !contact || !role) {
        req.flash('error', 'All fields are required.');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }

    try {
        await User.create({ username, email, password, address, contact, role });
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Registration failed');
        req.flash('formData', req.body);
        res.redirect('/register');
    }
});

// show login page
app.get('/login', (req, res) => {
    res.render('login', { messages: req.flash('success'), errors: req.flash('error'), user: req.session?.user || null });
});

// handle login (now using User model)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/login');
    }

    try {
        const user = await User.authenticate(email, password);
        if (user) {
            req.session.user = user;
            req.flash('success', 'Login successful!');
            if (user.role === 'user') res.redirect('/shopping');
            else res.redirect('/inventory');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'Login failed');
        res.redirect('/login');
    }
});

// Product routes (similar to StudentAppMVC)
app.get('/', productController.list);
app.get('/product/:id', productController.getById);
app.get('/addProduct', (req, res) => res.render('addProduct'));
app.post('/addProduct', upload.single('image'), productController.add);
app.get('/updateProduct/:id', productController.getById);
app.post('/updateProduct/:id', upload.single('image'), productController.update);
app.get('/deleteProduct/:id', productController.delete);

// ensure these middleware exist in app.js (if not, add them)
const checkAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) return next();
    req.flash('error', 'Please log in to view this resource');
    res.redirect('/login');
};

const checkAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') return next();
    req.flash('error', 'Access denied');
    res.redirect('/shopping');
};

// --- add routes ---
app.get('/inventory', checkAuthenticated, checkAdmin, productController.inventory);
app.get('/shopping', checkAuthenticated, productController.shopping);

// --- Cart / Checkout / Orders / logout routes ---
const cartController = require('./Controllers/CartController');
const checkoutController = require('./Controllers/CheckoutController');
const Order = require('./Models/Order');
const OrderItem = require('./Models/OrderItem');
const ShippingDetails = require('./Models/ShippingDetails');
const Payment = require('./Models/Payment');

// Add product to cart (DB-backed)
app.post('/add-to-cart/:id', checkAuthenticated, cartController.add);

// View cart
app.get('/cart', checkAuthenticated, cartController.view);

// Remove single product from cart
app.post('/cart/remove/:id', checkAuthenticated, cartController.remove);

// Clear cart
app.post('/cart/clear', checkAuthenticated, cartController.clear);

// Checkout pages
app.get('/checkout', checkAuthenticated, checkoutController.showCheckout);
app.post('/checkout', checkAuthenticated, checkoutController.performCheckout);

// Display a single order (receipt)
app.get('/order/:id', checkAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const orderId = parseInt(req.params.id, 10);
        const order = await Order.getById(orderId);
        if (!order) return res.status(404).render('error', { error: 'Order not found', user });
        if (order.user_id !== user.id && user.role !== 'admin') return res.status(403).render('error', { error: 'Access denied', user });

        const items = await OrderItem.getByOrder(orderId);
        const shipping = await ShippingDetails.getByOrder(orderId);
        // payment details may be retrieved via Payment model if needed
        res.render('order', { order, items, shipping, user });
    } catch (err) {
        console.error('Order view error', err);
        res.status(500).render('error', { error: err.message, user: req.session.user || null });
    }
});

// List orders for current user
app.get('/orders', checkAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const orders = await Order.getByUser(user.id);
        res.render('orders', { orders, user });
    } catch (err) {
        console.error('Orders list error', err);
        res.status(500).render('error', { error: err.message, user: req.session.user || null });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error('Session destroy error:', err);
        res.redirect('/');
    });
});

console.log('app.js starting');

// log uncaught/unhandled errors so they don't crash silently
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception', err && err.stack ? err.stack : err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection', reason && reason.stack ? reason.stack : reason);
});

// wrap startup so we only listen after DB init
(async () => {
    try {
        await db.initializeDatabase();
        
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, '127.0.0.1', () => console.log(`Server running on http://localhost:${PORT}`));
        server.on('error', err => {
            console.error('Server listen error:', err);
            process.exit(1);
        });
    } catch (err) {
        console.error('Startup failed:', err && err.message ? err.message : err);
        process.exit(1);
    }
})();
