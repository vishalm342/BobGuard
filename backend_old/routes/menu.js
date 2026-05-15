const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /menu
router.get('/', menuController.getMenu);

// POST /menu (for admin to add items later)
router.post('/', menuController.addMenuItem);

module.exports = router;
