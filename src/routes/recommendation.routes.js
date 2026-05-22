'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/recommendation.controller');
const asyncWrap = require('../middleware/asyncWrap');

router.post('/', asyncWrap(ctrl.recommend));

module.exports = router;
