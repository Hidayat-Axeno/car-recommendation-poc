'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors'); 

const recommendRoutes = require('./routes/recommendation.routes');
const variantRoutes = require('./routes/variant.routes');
const errorHandler = require('./middleware/errorHandler');

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/recommend',       recommendRoutes);
app.use('/api/admin/variants',  variantRoutes);

// ── Health ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// ── Error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MG Recommendation API running on port ${PORT}`);
});

module.exports = app; // for Lambda wrapper / testing
