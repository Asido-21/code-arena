const express = require('express');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/submissions — user submits code
router.post('/', protect, async (req, res) => {
  const { problemId, code, language } = req.body;

  if (!problemId || !code || !language) {
    return res
      .status(400)
      .json({ message: 'Problem, code and language are required.' });
  }

  try {
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      status: 'Pending',
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/submissions/my — user sees their own submissions
router.get('/my', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/submissions — admin sees all submissions
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }

  try {
    const submissions = await Submission.find()
      .populate('problem', 'title slug difficulty')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/submissions/:id/verdict — admin sets verdict
router.patch('/:id/verdict', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }

  const { status, adminNote } = req.body;

  const validStatuses = [
    'Accepted',
    'Wrong Answer',
    'Time Limit Exceeded',
    'Memory Limit Exceeded',
    'Runtime Error',
    'Compilation Error',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    )
      .populate('problem', 'title')
      .populate('user', 'username');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
