const { body, param } = require('express-validator');

const isValidId = (val) => !isNaN(val) && parseInt(val, 10) > 0;

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Not Started, In Progress, Completed'),
  body('startDate')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('End date must be a valid ISO date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        if (new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error('End date cannot be earlier than start date');
        }
      }
      return true;
    })
];

const updateProjectValidator = [
  param('id')
    .custom(isValidId).withMessage('Invalid project ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty')
    .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Not Started, In Progress, Completed'),
  body('startDate')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('End date must be a valid ISO date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        if (new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error('End date cannot be earlier than start date');
        }
      }
      return true;
    })
];

const projectIdParamValidator = [
  param('id')
    .custom(isValidId).withMessage('Invalid project ID format')
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator
};
