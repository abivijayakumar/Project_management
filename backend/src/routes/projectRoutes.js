const express = require('express');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator
} = require('../validators/projectValidator');
const validate = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(createProjectValidator, validate, createProject);

router
  .route('/:id')
  .get(projectIdParamValidator, validate, getProjectById)
  .put(updateProjectValidator, validate, updateProject)
  .delete(projectIdParamValidator, validate, deleteProject);

module.exports = router;
