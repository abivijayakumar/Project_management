const { body, param } = require('express-validator');

const isValidId = (val) => !isNaN(val) && parseInt(val, 10) > 0;

const createTaskValidator = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .custom(isValidId).withMessage('Invalid project ID format'),
  body('name')
    .trim()
    .notEmpty().withMessage('Task name is required')
    .isLength({ max: 150 }).withMessage('Task name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Pending, In Progress, Completed'),
  body('dueDate')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Due date must be a valid ISO date')
];

const updateTaskValidator = [
  param('id')
    .custom(isValidId).withMessage('Invalid task ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Task name cannot be empty')
    .isLength({ max: 150 }).withMessage('Task name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Pending, In Progress, Completed'),
  body('dueDate')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Due date must be a valid ISO date')
];

const taskIdParamValidator = [
  param('id')
    .custom(isValidId).withMessage('Invalid task ID format')
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  taskIdParamValidator
};
