const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateStats
} = require('../controllers/candidateController');

router.get('/', authenticateToken, getAllCandidates);
router.get('/:id/stats', authenticateToken, getCandidateStats);
router.get('/:id', authenticateToken, getCandidateById);
router.post('/', authenticateToken, createCandidate);
router.put('/:id', authenticateToken, updateCandidate);
router.delete('/:id', authenticateToken, deleteCandidate);

module.exports = router;