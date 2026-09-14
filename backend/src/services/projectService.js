const Project = require('../models/Project');
const Task = require('../models/Task');
const { escapeRegex } = require('../utils/sanitize');

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

    // Base query scoped strictly to the authenticated user
    const filter = { userId };

    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      filter.name = { $regex: sanitized, $options: 'i' };
    }

    if (status && ['Not Started', 'In Progress', 'Completed'].includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(filter)
    ]);

    // Attach task count summaries for each project
    const projectIds = projects.map(p => p._id);
    const taskAggregations = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: '$projectId',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const taskCountMap = {};
    taskAggregations.forEach(item => {
      taskCountMap[item._id.toString()] = {
        totalTasks: item.totalTasks,
        completedTasks: item.completedTasks
      };
    });

    const enrichedProjects = projects.map(proj => {
      const counts = taskCountMap[proj._id.toString()] || { totalTasks: 0, completedTasks: 0 };
      return {
        ...proj,
        totalTasks: counts.totalTasks,
        completedTasks: counts.completedTasks,
        progressPercent: counts.totalTasks > 0 
          ? Math.round((counts.completedTasks / counts.totalTasks) * 100) 
          : (proj.status === 'Completed' ? 100 : 0)
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
    const project = await Project.findById(projectId).lean();

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

    // Retrieve associated tasks
    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 }).lean();

    return {
      ...project,
      tasks
    };
  }

  /**
   * Create a new project for the authenticated user
   */
  async createProject(userId, projectData) {
    const project = await Project.create({
      ...projectData,
      userId
    });

    return project;
  }

  /**
   * Update an existing project verifying ownership
   */
  async updateProject(projectId, userId, updateData) {
    const project = await Project.findById(projectId);

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Strict ownership verification
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
    return project;
  }

  /**
   * Delete a project and cascade delete all associated tasks
   */
  async deleteProject(projectId, userId) {
    const project = await Project.findById(projectId);

    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Strict ownership verification
    if (project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot delete another user\'s project');
      error.statusCode = 403;
      throw error;
    }

    // Controlled cascade delete: Remove all tasks linked to this project
    const deletedTasksResult = await Task.deleteMany({ projectId: project._id });

    // Delete the project itself
    await project.deleteOne();

    return {
      deletedProjectId: projectId,
      deletedTasksCount: deletedTasksResult.deletedCount
    };
  }
}

module.exports = new ProjectService();
