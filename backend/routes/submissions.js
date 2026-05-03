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

    // Increment totalSubmissions on the problem
    const Problem = require('../models/Problem');
    const problem = await Problem.findById(problemId);
    if (problem) {
      problem.totalSubmissions += 1;
      // Recalculate acceptance rate
      if (problem.totalSubmissions > 0) {
        problem.acceptanceRate = Math.round(
          (problem.totalAccepted / problem.totalSubmissions) * 100
        );
      }
      await problem.save();
    }

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
    // Get the existing submission first
    const existingSubmission = await Submission.findById(req.params.id);
    if (!existingSubmission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    const previousStatus = existingSubmission.status;

    // Update the submission
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    )
      .populate('problem', 'title')
      .populate('user', 'username');

    // === STATS + RATING LOGIC ===
    const Problem = require('../models/Problem');
    const User = require('../models/User');

    const problem = await Problem.findById(existingSubmission.problem);
    const user = await User.findById(existingSubmission.user);

    if (problem && user) {
      const wasAccepted = previousStatus === 'Accepted';
      const isNowAccepted = status === 'Accepted';

      // Adjust totalAccepted based on transition
      if (!wasAccepted && isNowAccepted) {
        problem.totalAccepted += 1;
      } else if (wasAccepted && !isNowAccepted) {
        problem.totalAccepted = Math.max(0, problem.totalAccepted - 1);
      }

      // Recalculate acceptance rate
      if (problem.totalSubmissions > 0) {
        problem.acceptanceRate = Math.round(
          (problem.totalAccepted / problem.totalSubmissions) * 100
        );
      }

      await problem.save();

      // === RATING UPDATES (only on first transition to Accepted) ===
      if (!wasAccepted && isNowAccepted) {
        const ratingPoints = {
          Easy: 30,
          Medium: 50,
          Hard: 80,
        };
        const points = ratingPoints[problem.difficulty] || 30;

        user.learningRating += points;
        user.hardcoreRating += points;

        await user.save();
      } else if (wasAccepted && !isNowAccepted) {
        // Revert rating if admin changes Accepted to something else
        const ratingPoints = {
          Easy: 30,
          Medium: 50,
          Hard: 80,
        };
        const points = ratingPoints[problem.difficulty] || 30;

        user.learningRating = Math.max(1200, user.learningRating - points);
        user.hardcoreRating = Math.max(1200, user.hardcoreRating - points);

        await user.save();
      }
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
