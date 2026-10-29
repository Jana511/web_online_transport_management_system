import mongoose from 'mongoose';

// One monthly van fee for one student
const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    // Saved here too, so "find all payments for this parent" is fast and safe
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // e.g. "2026-10" for October 2026
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be more than 0'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card'],
    },
    paidAt: Date,
    // e.g. "SR-202610-A1B2C3" - created when the fee is marked as paid
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true, // allows many unpaid fees with no receipt number yet
    },
    // The admin who recorded the payment
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// One fee per student per month
paymentSchema.index({ student: 1, month: 1 }, { unique: true });
paymentSchema.index({ parent: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;