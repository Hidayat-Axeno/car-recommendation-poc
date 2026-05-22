'use strict';

const db = require('../config/db');

/** Get all variants (admin list) */
async function getAllVariants() {
  const [rows] = await db.query(
    'SELECT model_sales_code, model_name, variant_name, fuel_type, ex_showroom_price, car_image_url FROM mg_variants ORDER BY model_name, ex_showroom_price'
  );
  return rows;
}

/** Get single variant by code */
async function getVariantByCode(code) {
  const [rows] = await db.query(
    'SELECT * FROM mg_variants WHERE model_sales_code = ?',
    [code]
  );
  return rows[0] || null;
}

/**
 * Update car_image_url for one or multiple variants.
 * Accepts: { model_sales_code, image_url } or array of same.
 */
async function updateImages(updates) {
  const list = Array.isArray(updates) ? updates : [updates];
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const { model_sales_code, image_url } of list) {
      await conn.query(
        'UPDATE mg_variants SET car_image_url = ? WHERE model_sales_code = ?',
        [image_url, model_sales_code]
      );
    }
    await conn.commit();
    return { updated: list.length };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { getAllVariants, getVariantByCode, updateImages };
