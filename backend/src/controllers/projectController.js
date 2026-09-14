const projectService = require('../services/projectService');

/**
 * @desc    Get all projects for the authenticated user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.projects,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project and its associated tasks
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
