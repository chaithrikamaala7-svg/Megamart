const mongoose = require('mongoose');

const emailResultSchema = {
  type: String,
  enum: ['sent', 'failed', 'skipped'],
  default: 'skipped',
};

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      image: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  payment: {
    method: { type: String, default: 'Card' },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    cardLast4: { type: String, default: '' },
    upiIdMasked: { type: String, default: '' },
    reference: { type: String, default: '' },
    paidAt: { type: Date, default: Date.now },
  },
  emailOnOrder: emailResultSchema,
  emailOnOrderErr: { type: String, default: '' },
  emailOnStatus: emailResultSchema,
  emailOnStatusErr: { type: String, default: '' },
});

module.exports = mongoose.model('Order', OrderSchema);
