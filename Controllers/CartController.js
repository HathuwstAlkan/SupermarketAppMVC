const CartItem = require('../Models/CartItem');
const Product = require('../Models/Product');

const CartController = {
  async view(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/login');
      const cart = await CartItem.getByUser(user.id);
      const cartCount = await CartItem.getCountByUser(user.id);
      res.render('cart', { cart, user, cartCount });
    } catch (err) {
      console.error('Cart view error', err);
      res.status(500).render('error', { error: err.message, user: req.session.user || null });
    }
  },

  async add(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/login');
      const productId = parseInt(req.params.id, 10);
      const requested = Math.max(1, parseInt(req.body.quantity, 10) || 1);

      const product = await Product.getById(productId);
      if (!product) return res.status(404).send('Product not found');

      // get existing cart item and clamp to available
      const existing = await CartItem.getItem(user.id, productId);
      const currentInCart = existing ? existing.quantity : 0;
      const available = parseInt(product.quantity, 10) || 0;
      const canAdd = Math.max(0, available - currentInCart);
      const qtyToAdd = Math.min(requested, canAdd);

      if (qtyToAdd <= 0) {
        // No available quantity
        const msg = 'Out of Stock';
        const accept = (req.get('Accept') || '').toLowerCase();
        if (req.xhr || accept.includes('application/json')) {
          return res.status(400).json({ success: false, error: msg });
        }
        req.flash('error', msg);
        return res.redirect('/shopping');
      }

      await CartItem.addOrUpdate(user.id, productId, qtyToAdd);
      // get updated cart count
      const cartCount = await CartItem.getCountByUser(user.id);

      // if AJAX/JSON request, respond with JSON so client can animate without redirect
      const accept = (req.get('Accept') || '').toLowerCase();
      if (req.xhr || accept.includes('application/json')) {
        return res.json({ success: true, qty: qtyToAdd, productName: product.productName, cartCount });
      }

      req.flash('success', `Added ${qtyToAdd} × ${product.productName} to cart`);
      res.redirect('/cart');
    } catch (err) {
      console.error('Add to cart error', err);
      const msg = err && err.message ? `Failed to add to cart: ${err.message}` : 'Failed to add to cart: Unknown Error';
      const accept = (req.get('Accept') || '').toLowerCase();
      if (req.xhr || accept.includes('application/json')) {
        return res.status(500).json({ success: false, error: msg });
      }
      req.flash('error', msg);
      res.redirect('/shopping');
    }
  },

  async remove(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/login');
      const productId = parseInt(req.params.id, 10);
      await CartItem.remove(user.id, productId);
      req.flash('success', 'Item removed from cart');
      res.redirect('/cart');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to remove');
    }
  },

  async clear(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/login');
      await CartItem.clear(user.id);
      req.flash('success', 'Cart cleared');
      res.redirect('/cart');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to clear cart');
    }
  }
};

module.exports = CartController;
