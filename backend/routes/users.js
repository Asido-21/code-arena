const express = require('express');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:username — profile data
router.get('/:username', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-password'
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });

    // All accepted submissions with problem difficulty
    const accepted = await Submission.find({
      user: user._id,
      status: 'Accepted',
    }).populate('problem', 'title slug difficulty');

    // Solved count by difficulty
    const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const seenProblems = new Set();

    accepted.forEach((sub) => {
      if (sub.problem && !seenProblems.has(sub.problem._id.toString())) {
        seenProblems.add(sub.problem._id.toString());
        solvedByDifficulty[sub.problem.difficulty] =
          (solvedByDifficulty[sub.problem.difficulty] || 0) + 1;
      }
    });

    // Recent 5 submissions (any status)
    const recent = await Submission.find({ user: user._id })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      username: user.username,
      email:
        req.user._id.toString() === user._id.toString()
          ? user.email
          : undefined,
      role: user.role,
      hardcoreRating: user.hardcoreRating,
      learningRating: user.learningRating,
      roadmapProgress: user.roadmapProgress,
      memberSince: user.createdAt,
      solvedByDifficulty,
      totalSolved: seenProblems.size,
      recentSubmissions: recent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
