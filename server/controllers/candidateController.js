const Candidate = require('../models/Candidate');
const Message = require('../models/Message');

const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
};

const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('addedBy', 'name email');
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ message: 'Failed to fetch candidate' });
  }
};

const createCandidate = async (req, res) => {
  try {
    const { name, email, phone, position, skills, experience, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ message: 'Candidate with this email already exists' });
    }

    const candidate = new Candidate({
      name,
      email,
      phone,
      position,
      skills: skills || [],
      experience,
      notes,
      addedBy: req.user._id
    });

    await candidate.save();
    await candidate.populate('addedBy', 'name email');
    
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Failed to create candidate' });
  }
};

const updateCandidate = async (req, res) => {
  try {
    const { name, email, phone, position, skills, experience, notes, status } = req.body;
    
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        position,
        skills,
        experience,
        notes,
        status
      },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');

    res.json(updatedCandidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ message: 'Failed to update candidate' });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ message: 'Failed to delete candidate' });
  }
};

const getCandidateStats = async (req, res) => {
  try {
    const candidateId = req.params.id;
    
    const [candidate, messageCount, lastMessageDate] = await Promise.all([
      Candidate.findById(candidateId),
      Message.countDocuments({ candidateId }),
      Message.findOne({ candidateId }).sort({ createdAt: -1 }).select('createdAt')
    ]);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({
      messageCount,
      lastMessageDate: lastMessageDate?.createdAt || null,
      candidate: {
        name: candidate.name,
        email: candidate.email,
        status: candidate.status
      }
    });
  } catch (error) {
    console.error('Error fetching candidate stats:', error);
    res.status(500).json({ message: 'Failed to fetch candidate stats' });
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateStats
};