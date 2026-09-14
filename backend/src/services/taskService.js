const { Op } = require('sequelize');
const { Task, Project } = require('../models');

class TaskService {
  /**
   * Retrieve tasks belonging exclusively to projects owned by the user
   */
  async getTasks(userId, query = {}) {
    const {
      search,
      status,
      priority,
      projectId,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50
    } = query;

    // First retrieve all project IDs owned by this user
    const userProjects = await Project.findAll({
      where: { userId },
      attributes: ['id'],
      raw: true
    });
    const userProjectIds = userProjects.map(p => p.id);

    if (userProjectIds.length === 0) {
      return {
        tasks: [],
        pagination: { total: 0, page: 1, totalPages: 1, limit: 50 }
      };
    }

    const where = {};

    if (projectId) {
      const parsedPid = parseInt(projectId, 10);
      if (!userProjectIds.includes(parsedPid)) {
        const error = new Error('Unauthorized: You do not own the requested project');
        error.statusCode = 403;
        throw error;
      }
      where.projectId = parsedPid;
    } else {
      where.projectId = { [Op.in]: userProjectIds };
    }

    if (search && search.trim()) {
      where.name = { [Op.like]: `%${search.trim()}%` };
    }

    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
      where.status = status;
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      where.priority = priority;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const allowedSortFields = ['createdAt', 'name', 'dueDate', 'priority', 'status', 'id'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const { count: total, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset
    });

    return {
      tasks: tasks.map(t => t.toJSON()),
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    };
  }

  /**
   * Get single task by ID verifying project ownership
   */
  async getTaskById(taskId, userId) {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status', 'userId']
        }
      ]
    });

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (!task.project || task.project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You do not have access to this task');
      error.statusCode = 403;
      throw error;
    }

    return task.toJSON();
  }

  /**
   * Create a task after verifying project ownership
   */
  async createTask(userId, taskData) {
    const project = await Project.findByPk(taskData.projectId);

    if (!project) {
      const error = new Error('Target project not found');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot add tasks to another user\'s project');
      error.statusCode = 403;
      throw error;
    }

    const task = await Task.create(taskData);
    const populatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ]
    });

    return populatedTask.toJSON();
  }

  /**
   * Update a task after verifying project ownership
   */
  async updateTask(taskId, userId, updateData) {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'userId']
        }
      ]
    });

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (!task.project || task.project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot edit another user\'s task');
      error.statusCode = 403;
      throw error;
    }

    if (updateData.projectId && parseInt(updateData.projectId, 10) !== task.projectId) {
      const targetProject = await Project.findByPk(updateData.projectId);
      if (!targetProject || targetProject.userId.toString() !== userId.toString()) {
        const error = new Error('Unauthorized: You cannot move a task to an unowned project');
        error.statusCode = 403;
        throw error;
      }
    }

    const allowedUpdates = ['name', 'description', 'priority', 'status', 'dueDate', 'projectId'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        task[field] = updateData[field];
      }
    });

    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ]
    });

    return updatedTask.toJSON();
  }

  /**
   * Delete a task after verifying project ownership
   */
  async deleteTask(taskId, userId) {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'userId']
        }
      ]
    });

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (!task.project || task.project.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot delete another user\'s task');
      error.statusCode = 403;
      throw error;
    }

    await task.destroy();
    return { taskId, message: 'Task deleted successfully' };
  }
}

module.exports = new TaskService();
