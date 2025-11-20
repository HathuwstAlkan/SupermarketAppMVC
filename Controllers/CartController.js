const CartItem = require('../Models/CartItem');
const Product = require('../Models/Product');

const CartController = {
  async view(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/login');
      const cart = await CartItem.getByUser(user.id);
      res.render('cart', { cart, user });
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
        req.flash('error', 'Cannot add more of this product - not enough stock');
        return res.redirect('/shopping');
      }

      await CartItem.addOrUpdate(user.id, productId, qtyToAdd);
      req.flash('success', `Added ${qtyToAdd} × ${product.productName} to cart`);
      res.redirect('/cart');
    } catch (err) {
      console.error('Add to cart error', err);
      res.status(500).send('Failed to add to cart');
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
