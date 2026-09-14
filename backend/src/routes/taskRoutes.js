const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const {
  createTaskValidator,
  updateTaskValidator,
  taskIdParamValidator
} = require('../validators/taskValidator');
const validate = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(createTaskValidator, validate, createTask);

router
  .route('/:id')
  .get(taskIdParamValidator, validate, getTaskById)
  .put(updateTaskValidator, validate, updateTask)
  .delete(taskIdParamValidator, validate, deleteTask);

module.exports = router;
