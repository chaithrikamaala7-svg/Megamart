const express = require('express');
const { sendOrderNotify } = require('../sendMail');
const { createOrder: createRazorpayOrder, getPublicKey } = require('../services/razorpay');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/Users');

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());
}

function paymentDetail(order) {
  const p = order?.payment || {};
  if (p.cardLast4) return `Card ****${p.cardLast4}`;
  if (p.upiIdMasked) return `UPI ${p.upiIdMasked}`;
  if (p.reference) return p.reference;
  return '-';
}

function buildOrderMailText(order, heading, customer = {}) {
  const products = Array.isArray(order?.products) ? order.products : [];
  const payment = order?.payment || {};
  const customerName = customer.name || 'Customer';
  const customerEmail = customer.email || '-';
  const customerMobile = customer.mobile || '-';
  const productLines =
    products.length > 0
      ? products
          .map((p, idx) => `${idx + 1}. ${p.name} | Qty: ${p.quantity} | Price: ₹${p.price}`)
          .join('\n')
      : 'No products';

  return [
    'Hello,',
    '',
    heading,
    '',
    `Customer Name: ${customerName}`,
    `Customer Email: ${customerEmail}`,
    `Customer Mobile: ${customerMobile}`,
    `Order ID: ${order?._id || '-'}`,
    `Date: ${order?.date ? new Date(order.date).toLocaleString() : '-'}`,
    `Order Status: ${order?.status || '-'}`,
    `Payment Method: ${payment.method || '-'}`,
    `Payment Detail: ${paymentDetail(order)}`,
    `Payment Status: ${payment.status || 'Pending'}`,
    `Payment Reference: ${payment.reference || '-'}`,
    `Total Amount: ₹${order?.totalAmount || 0}`,
    '',
    'Products:',
    productLines,
    '',
    'Sent by Megamart',
  ].join('\n');
}

function buildOrderMailHtml(order, heading, customer = {}) {
  const products = Array.isArray(order?.products) ? order.products : [];
  const payment = order?.payment || {};
  const customerName = customer.name || 'Customer';
  const customerEmail = customer.email || '-';
  const customerMobile = customer.mobile || '-';
  const rows =
    products.length > 0
      ? products
          .map(
            (p, idx) =>
              `<tr>
                <td style="border:1px solid #ddd;padding:8px;">${idx + 1}</td>
                <td style="border:1px solid #ddd;padding:8px;">${p.name || '-'}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:right;">${p.quantity || 0}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:right;">₹${p.price || 0}</td>
              </tr>`
          )
          .join('')
      : `<tr><td colspan="4" style="border:1px solid #ddd;padding:8px;">No products</td></tr>`;

  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2937;line-height:1.5;">
      <p>Hello,</p>
      <p>${heading}</p>
      <p><strong>Customer Name:</strong> ${customerName}<br/>
      <strong>Customer Email:</strong> ${customerEmail}<br/>
      <strong>Customer Mobile:</strong> ${customerMobile}</p>
      <p><strong>Order ID:</strong> ${order?._id || '-'}<br/>
      <strong>Date:</strong> ${order?.date ? new Date(order.date).toLocaleString() : '-'}<br/>
      <strong>Order Status:</strong> ${order?.status || '-'}<br/>
      <strong>Payment Method:</strong> ${payment.method || '-'}<br/>
      <strong>Payment Detail:</strong> ${paymentDetail(order)}<br/>
      <strong>Payment Status:</strong> ${payment.status || 'Pending'}<br/>
      <strong>Payment Reference:</strong> ${payment.reference || '-'}<br/>
      <strong>Total Amount:</strong> ₹${order?.totalAmount || 0}</p>
      <p><strong>Products:</strong></p>
      <table style="border-collapse:collapse;width:100%;max-width:650px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">#</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Item</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:right;">Qty</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:14px;">Sent by Megamart</p>
    </div>
  `;
}

function mapMailResult(mr) {
  if (mr.ok) return { status: 'sent', err: '' };
  if (mr.skipped) return { status: 'skipped', err: mr.reason || '' };
  return { status: 'failed', err: mr.reason || 'Unknown error' };
}

router.delete('/:orderId', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const userId = body.userId;
    const customerObj = body.customer || {};
    let customerEmail = String(body.customerEmail ?? customerObj.email ?? '').trim().toLowerCase();
    let customerName = String(body.customerName ?? customerObj.name ?? '').trim();
    let customerMobile = String(body.customerMobile ?? customerObj.mobile ?? '').trim();
    if (!customerName) customerName = 'Customer';
    if (!customerMobile) customerMobile = '-';
    const rawProducts = Array.isArray(body.products) ? body.products : Array.isArray(body.items) ? body.items : null;
    const totalAmount = Number(body.totalAmount ?? body.total);
    const status = body.status;
    const paymentBody = body.payment || {};
    const paymentMethod = String(body.paymentMethod || paymentBody.method || '').trim().toLowerCase();
    if (!rawProducts || !Array.isArray(rawProducts) || rawProducts.length === 0) {
      return res.status(400).json({ error: 'Products required' });
    }
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ error: 'Valid totalAmount required' });
    }

    const products = rawProducts.map((item) => ({
      productId: item.productId || item._id || item.id,
      name: item.name,
      image: item.image || item.imageUrl || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));

    if (products.some((item) => !item.productId)) {
      return res.status(400).json({ error: 'Each product must include productId' });
    }

    let order = await Order.create({
      userId,
      products,
      totalAmount,
      status: status || 'Pending',
      payment: {
        method: paymentBody.method || (paymentMethod ? paymentMethod.toUpperCase() : 'Card'),
        status: paymentBody.status === 'Paid' ? 'Paid' : 'Pending',
        cardLast4: paymentBody.cardLast4 || '',
        upiIdMasked: paymentBody.upiIdMasked || '',
        reference: paymentBody.reference || '',
        paidAt: new Date(),
      },
    });

    if (userId) {
      const cart = await Cart.findOne({ userId });
      if (cart) {
        cart.products = [];
        await cart.save();
      }
    }

    // Resolve email from user profile when checkout payload does not provide a valid one.
    if (userId) {
      const user = await User.findById(userId).select('name username mobilenumber');
      if (user) {
        customerName = user.name || customerName;
        customerMobile = user.mobilenumber || customerMobile;
        if (!looksLikeEmail(customerEmail) && looksLikeEmail(user.username)) {
          customerEmail = String(user.username).trim().toLowerCase();
        }
      }
    }

    // If still not a valid email, avoid showing a wrong value in mail.
    if (customerEmail && !looksLikeEmail(customerEmail)) {
      customerEmail = '';
    }

    // Send detailed order summary email (same details visible in Manage Order).
    const mr = await sendOrderNotify(
      `Megamart: order ${order._id} placed`,
      buildOrderMailText(order, 'Your order has been placed successfully.', {
        name: customerName,
        email: customerEmail || '-',
        mobile: customerMobile,
      }),
      customerEmail,
      buildOrderMailHtml(order, 'Your order has been placed successfully.', {
        name: customerName,
        email: customerEmail || '-',
        mobile: customerMobile,
      })
    );
    const em = mapMailResult(mr);
    if (!mr.ok) {
      console.warn('[mail] Order created, notify failed/skipped:', em.err || em.status);
    }
    order = await Order.findByIdAndUpdate(
      order._id,
      { emailOnOrder: em.status, emailOnOrderErr: em.err },
      { new: true }
    );

    const shouldCreateRazorpayOrder = paymentMethod && paymentMethod !== 'cod';
    if (!shouldCreateRazorpayOrder) {
      return res.json({ success: true, order });
    }

    const rpOrder = await createRazorpayOrder(totalAmount);
    return res.json({
      success: true,
      order,
      razorpayOrder: {
        key: getPublicKey(),
        id: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name username mobilenumber');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    let order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const fullOrder = await Order.findById(orderId).populate('userId', 'name username mobilenumber');
    const statusRecipient = looksLikeEmail(fullOrder?.userId?.username) ? fullOrder.userId.username : '';
    const statusCustomer = {
      name: fullOrder?.userId?.name || 'Customer',
      email: statusRecipient || '-',
      mobile: fullOrder?.userId?.mobilenumber || '-',
    };
    const mr = await sendOrderNotify(
      `Megamart: order ${orderId} updated`,
      buildOrderMailText(fullOrder || order, `Your order status is updated to: ${status}`, statusCustomer),
      statusRecipient,
      buildOrderMailHtml(fullOrder || order, `Your order status is updated to: ${status}`, statusCustomer)
    );
    const em = mapMailResult(mr);
    if (!mr.ok) {
      console.warn('[mail] Status saved, notify failed/skipped:', em.err || em.status);
    }

    order = await Order.findByIdAndUpdate(
      orderId,
      { emailOnStatus: em.status, emailOnStatusErr: em.err },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
