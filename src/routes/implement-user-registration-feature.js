/**
 * implement-user-registration-feature API Routes
 * Generated for issue: Implement user registration feature
 */

const express = require('express');
const router = express.Router();
const implement-user-registration-featureService = require('../services/implement-user-registration-featureService');

// GET implement-user-registration-features
router.get('/', async (req, res) => {
  try {
    const result = await implement-user-registration-featureService.getAll();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST implement-user-registration-feature
router.post('/', async (req, res) => {
  try {
    const result = await implement-user-registration-featureService.create(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET implement-user-registration-feature/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await implement-user-registration-featureService.getById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'implement-user-registration-feature not found'
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT implement-user-registration-feature/:id
router.put('/:id', async (req, res) => {
  try {
    const result = await implement-user-registration-featureService.update(req.params.id, req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE implement-user-registration-feature/:id
router.delete('/:id', async (req, res) => {
  try {
    await implement-user-registration-featureService.delete(req.params.id);
    res.json({
      success: true,
      message: 'implement-user-registration-feature deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
