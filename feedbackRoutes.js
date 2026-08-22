const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit feedback for a meal (student)
router.post('/', async (req, res) => {
  try {
    const { menuId, studentName, rollNo, rating, comment } = req.body;

    if (!menuId || !studentName || !rollNo || !rating) {
      return res
        .status(400)
        .json({ message: 'menuId, studentName, rollNo and rating are required' });
    }

    const feedback = new Feedback({ menuId, studentName, rollNo, rating, comment });
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/feedback/summary
// @desc    Average rating + count per menu item (admin dashboard)
// NOTE: defined BEFORE /:menuId so Express doesn't treat "summary" as an id
router.get('/summary', async (req, res) => {
  try {
    const summary = await Feedback.aggregate([
      {
        $group: {
          _id: '$menuId',
          averageRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: '_id',
          as: 'menu',
        },
      },
      { $unwind: '$menu' },
      {
        $project: {
          _id: 0,
          menuId: '$_id',
          day: '$menu.day',
          mealType: '$menu.mealType',
          items: '$menu.items',
          averageRating: { $round: ['$averageRating', 2] },
          totalFeedbacks: 1,
        },
      },
      { $sort: { day: 1, mealType: 1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/feedback/:menuId
// @desc    Get all feedback for a specific meal
router.get('/:menuId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.menuId)) {
      return res.status(400).json({ message: 'Invalid menuId' });
    }
    const feedbacks = await Feedback.find({ menuId: req.params.menuId }).sort({
      createdAt: -1,
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete a feedback entry (admin, e.g. inappropriate comment)
router.delete('/:id', async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!deletedFeedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
