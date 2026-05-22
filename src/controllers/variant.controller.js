'use strict';

const variantService = require('../services/variant.service');

/** GET /api/admin/variants */
async function listVariants(req, res) {
  const variants = await variantService.getAllVariants();
  return res.json({ success: true, count: variants.length, payload: variants });
}

/** GET /api/admin/variants/:code */
async function getVariant(req, res) {
  const variant = await variantService.getVariantByCode(req.params.code);
  if (!variant) {
    return res.status(404).json({ success: false, error: 'Variant not found' });
  }
  return res.json({ success: true, payload: variant });
}

/**
 * PATCH /api/admin/variants/images
 *
 * Body (single):
 * { "model_sales_code": "WIN-ESSENCEPRO-529", "image_url": "https://..." }
 *
 * Body (bulk):
 * [
 *   { "model_sales_code": "WIN-ESSENCEPRO-529", "image_url": "https://..." },
 *   { "model_sales_code": "HEC-SAVVYPRO-5-CVT", "image_url": "https://..." }
 * ]
 */
async function updateImages(req, res) {
  const body = req.body;
  if (!body || (Array.isArray(body) && body.length === 0)) {
    return res.status(400).json({ success: false, error: 'Request body is empty' });
  }

  const list = Array.isArray(body) ? body : [body];
  for (const item of list) {
    if (!item.model_sales_code || !item.image_url) {
      return res.status(400).json({
        success: false,
        error:   'Each item must have model_sales_code and image_url',
      });
    }
  }

  const result = await variantService.updateImages(list);
  return res.json({ success: true, ...result });
}

module.exports = { listVariants, getVariant, updateImages };
