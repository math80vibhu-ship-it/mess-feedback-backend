const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    mealType: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    },
    items: {
      type: [String],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
