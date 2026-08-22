const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// @route   POST /api/menu
// @desc    Create a new menu entry (admin)
router.post('/', async (req, res) => {
  try {
    const { day, mealType, items, date } = req.body;

    if (!day || !mealType || !items) {
      return res.status(400).json({ message: 'day, mealType and items are required' });
    }

    const menu = new Menu({ day, mealType, items, date });
    const savedMenu = await menu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/menu
// @desc    Get all menu entries (optionally filter by day via ?day=Monday)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.day) filter.day = req.query.day;

    const menus = await Menu.find(filter).sort({ date: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/menu/:id
// @desc    Get a single menu entry by ID
router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu entry not found' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update a menu entry (admin)
router.put('/:id', async (req, res) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedMenu) return res.status(404).json({ message: 'Menu entry not found' });
    res.json(updatedMenu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete a menu entry (admin)
router.delete('/:id', async (req, res) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
    if (!deletedMenu) return res.status(404).json({ message: 'Menu entry not found' });
    res.json({ message: 'Menu entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
