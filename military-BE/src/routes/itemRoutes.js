const express = require('express');
const {
  getItems,
  getItemById,
  getItemDetail,
  createItem,
  updateItem,
  transferItemCondition,
  addStock,
  deleteItem,
  updateItemStatus,
  repairItem
} = require('../controllers/itemController');
const { adminOnly } = require('../middlewares/auth');
const { validateWarehouseExists, validateItemInput } = require('../middlewares/validation');
const router = express.Router();

// Read — accessible to all authenticated users
router.get('/', getItems);
router.get('/:id', getItemById);
router.get('/:id/detail', getItemDetail);

// Write — admin only
router.post('/', adminOnly, validateItemInput, validateWarehouseExists, createItem);
router.put('/:id', adminOnly, validateItemInput, validateWarehouseExists, updateItem);
router.patch('/:id/condition-transfer', adminOnly, transferItemCondition);
router.patch('/:id/add-stock', adminOnly, addStock);
router.delete('/:id', adminOnly, deleteItem);
router.patch('/:id/status', adminOnly, updateItemStatus);
router.patch('/:id/repair', adminOnly, repairItem);

module.exports = router;