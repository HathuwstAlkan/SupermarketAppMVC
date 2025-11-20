const db = require('../db');
const CartItem = require('../Models/CartItem');
const Order = require('../Models/Order');
const OrderItem = require('../Models/OrderItem');
const Payment = require('../Models/Payment');
const ShippingDetails = require('../Models/ShippingDetails');

const CheckoutController = {
  // show a simple checkout page (needs a view) - minimal placeholder
  async showCheckout(req, res) {
    try {
      const user = req.session.user;
      if (!user) return res.redirect('/login');
      const cart = await CartItem.getByUser(user.id);
      if (!cart || cart.length === 0) {
        req.flash('info', 'Your cart is empty');
        return res.redirect('/cart');
      }
      const cartCount = await CartItem.getCountByUser(user.id);
      res.render('checkout', { cart, user, cartCount });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err.message, user: req.session.user || null });
    }
  },

  // perform checkout: transactional: verify stock, create order, order_items, decrement stock, create payment (mock), clear cart
  async performCheckout(req, res) {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();

      // fetch cart items FOR UPDATE by joining products
      const [cartRows] = await connection.query(
        `SELECT ci.product_id, ci.quantity AS cart_qty, p.productName, p.quantity AS stock_qty, p.price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = ? FOR UPDATE`,
        [user.id]
      );

      if (!cartRows || cartRows.length === 0) {
        await connection.rollback();
        req.flash('info', 'Your cart is empty');
        connection.release();
        return res.redirect('/cart');
      }

      // verify stock
      for (const item of cartRows) {
        if (item.cart_qty > item.stock_qty) {
          await connection.rollback();
          req.flash('error', `Not enough stock for ${item.productName}. Available: ${item.stock_qty}`);
          connection.release();
          return res.redirect('/cart');
        }
      }

      // compute total
      let total = 0;
      for (const item of cartRows) total += parseFloat(item.price) * parseInt(item.cart_qty, 10);

      // create order
      const [orderResult] = await connection.query('INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)', [user.id, total, 'paid']);
      const orderId = orderResult.insertId;

      // insert order items and decrement stock
      for (const item of cartRows) {
        await connection.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)', [orderId, item.product_id, item.cart_qty, item.price]);
        await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.cart_qty, item.product_id]);
      }

      // create mock payment record (simulate immediate success)
      const [paymentResult] = await connection.query('INSERT INTO payments (order_id, user_id, method, amount, currency, status, provider_transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [orderId, user.id, req.body.method || 'mock', total, 'USD', 'success', 'MOCK_' + Date.now()]);
      const paymentId = paymentResult.insertId;

      // link payment to order
      await connection.query('UPDATE orders SET payment_id = ? WHERE id = ?', [paymentId, orderId]);

      // store shipping details if provided
      if (req.body.recipient_name && req.body.address_line1) {
        await connection.query(`INSERT INTO shipping_details (order_id, recipient_name, address_line1, address_line2, city, region, postal_code, country, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
          orderId,
          req.body.recipient_name,
          req.body.address_line1,
          req.body.address_line2 || null,
          req.body.city || null,
          req.body.region || null,
          req.body.postal_code || null,
          req.body.country || null,
          req.body.phone || null,
          'packing'
        ]);
      }

      // clear cart
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [user.id]);

      await connection.commit();
      connection.release();

      req.flash('success', 'Payment successful and order created');
      res.redirect(`/order/${orderId}`);
    } catch (err) {
      console.error('Checkout error', err);
      try { await connection.rollback(); } catch (e) {}
      connection.release();
      req.flash('error', 'Checkout failed');
      res.redirect('/cart');
    }
  }
};

module.exports = CheckoutController;
