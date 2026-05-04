const express = require('express');
const Problem = require('../models/Problem');
const { protect } = require('../middleware/auth');
const Submission = require('../models/Submission');

const router = express.Router();

// GET /api/problems — get all problems
router.get('/', async (req, res) => {
  try {
    const { difficulty, tag } = req.query;
    let filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = { $in: [tag] };

    const problems = await Problem.find(filter).select(
      'title slug difficulty tags acceptanceRate roadmapDay'
    );

    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/problems/status — returns solved/attempted map for logged-in user
router.get('/status', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id }).select(
      'problem status'
    );

    const statusMap = {};
    submissions.forEach((sub) => {
      const id = sub.problem.toString();
      if (sub.status === 'Accepted') {
        statusMap[id] = 'solved';
      } else if (!statusMap[id]) {
        statusMap[id] = 'attempted';
      }
    });

    res.json(statusMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/problems/:slug — get single problem
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
