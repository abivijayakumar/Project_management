const { Op, fn, col, literal } = require('sequelize');
const { Project, Task } = require('../models');

class ProjectService {
  /**
   * Retrieve all projects owned by the user with search, filtering, and pagination
   */
  async getProjects(userId, query = {}) {
    const {
      search,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50
    } = query;

    const where = { userId };

    if (search && search.trim()) {
      where.name = { [Op.like]: `%${search.trim()}%` };
    }

    if (status && ['Not Started', 'In Progress', 'Completed'].includes(status)) {
      where.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Validate sortBy column to prevent SQL injection
    const allowedSortFields = ['createdAt', 'name', 'status', 'startDate', 'endDate', 'id'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const { count: total, rows: projects } = await Project.findAndCountAll({
      where,
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset
    });

    // Compute task counts and progress
    const projectIds = projects.map(p => p.id);
    let taskCountMap = {};

    if (projectIds.length > 0) {
      const taskAggregations = await Task.findAll({
        where: { projectId: projectIds },
        attributes: [
          'projectId',
          [fn('COUNT', col('id')), 'totalTasks'],
          [fn('SUM', literal("CASE WHEN status = 'Completed' THEN 1 ELSE 0 END")), 'completedTasks']
        ],
        group: ['projectId'],
        raw: true
      });

      taskAggregations.forEach(item => {
        taskCountMap[item.projectId] = {
          totalTasks: parseInt(item.totalTasks, 10) || 0,
          completedTasks: parseInt(item.completedTasks, 10) || 0
        };
      });
    }

    const enrichedProjects = projects.map(proj => {
      const pJson = proj.toJSON();
      const counts = taskCountMap[proj.id] || { totalTasks: 0, completedTasks: 0 };
      const totalTasks = counts.totalTasks;
      const completedTasks = counts.completedTasks;
      const progressPercent = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : (proj.status === 'Completed' ? 100 : 0);

      return {
        ...pJson,
        totalTasks,
        completedTasks,
        progressPercent
      };
    });

    return {
      projects: enrichedProjects,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    };
  }

  /**
   * Get single project by ID with authorization verification and populated tasks
   */
  async getProjectById(projectId, userId) {
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: Task,
          as: 'tasks',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Strict ownership verification
    if (project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You do not have access to this project');
      error.statusCode = 403;
      throw error;
    }

    return project.toJSON();
  }

  /**
   * Create a new project for the authenticated user
   */
  async createProject(userId, projectData) {
    const project = await Project.create({
      ...projectData,
      userId
    });

    return project.toJSON();
  }

  /**
   * Update an existing project verifying ownership
   */
  async updateProject(projectId, userId, updateData) {
    const project = await Project.findByPk(projectId);

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot edit another user\'s project');
      error.statusCode = 403;
      throw error;
    }

    const allowedUpdates = ['name', 'description', 'status', 'startDate', 'endDate'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        project[field] = updateData[field];
      }
    });

    await project.save();
    return project.toJSON();
  }

  /**
   * Delete a project and cascade delete all associated tasks
   */
  async deleteProject(projectId, userId) {
    const project = await Project.findByPk(projectId);

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot delete another user\'s project');
      error.statusCode = 403;
      throw error;
    }

    const deletedTasksCount = await Task.destroy({ where: { projectId: project.id } });
    await project.destroy();

    return {
      deletedProjectId: projectId,
      deletedTasksCount
    };
  }
}

module.exports = new ProjectService();
