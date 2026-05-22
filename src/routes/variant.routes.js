'use strict';

const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/variant.controller');
const asyncWrap = require('../middleware/asyncWrap');

router.get  ('/',              asyncWrap(ctrl.listVariants));
router.get  ('/:code',         asyncWrap(ctrl.getVariant));
router.patch('/images',        asyncWrap(ctrl.updateImages));

module.exports = router;
