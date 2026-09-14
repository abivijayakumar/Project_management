const Task = require('../models/Task');
const Project = require('../models/Project');
const { escapeRegex } = require('../utils/sanitize');

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
    const userProjects = await Project.find({ userId }).select('_id').lean();
    const userProjectIds = userProjects.map(p => p._id.toString());

    if (userProjectIds.length === 0) {
      return {
        tasks: [],
        pagination: { total: 0, page: 1, totalPages: 1, limit: 50 }
      };
    }

    const filter = {};

    if (projectId) {
      // If a specific projectId is requested, ensure it belongs to this user!
      if (!userProjectIds.includes(projectId.toString())) {
        const error = new Error('Unauthorized: You do not own the requested project');
        error.statusCode = 403;
        throw error;
      }
      filter.projectId = projectId;
    } else {
      filter.projectId = { $in: userProjectIds };
    }

    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      filter.name = { $regex: sanitized, $options: 'i' };
    }

    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
      filter.status = status;
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      filter.priority = priority;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('projectId', 'name status')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Task.countDocuments(filter)
    ]);

    return {
      tasks,
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
    const task = await Task.findById(taskId).populate('projectId', 'name status userId');

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Check project ownership
    if (!task.projectId || task.projectId.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You do not have access to this task');
      error.statusCode = 403;
      throw error;
    }

    return task;
  }

  /**
   * Create a task after verifying project ownership
   */
  async createTask(userId, taskData) {
    const project = await Project.findById(taskData.projectId);

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
    const populatedTask = await Task.findById(task._id).populate('projectId', 'name status');
    return populatedTask;
  }

  /**
   * Update a task after verifying project ownership
   */
  async updateTask(taskId, userId, updateData) {
    const task = await Task.findById(taskId).populate('projectId', 'userId');

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (!task.projectId || task.projectId.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot edit another user\'s task');
      error.statusCode = 403;
      throw error;
    }

    // If changing projectId, ensure the destination project belongs to the user
    if (updateData.projectId && updateData.projectId !== task.projectId._id.toString()) {
      const targetProject = await Project.findById(updateData.projectId);
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
    const updatedTask = await Task.findById(task._id).populate('projectId', 'name status');
    return updatedTask;
  }

  /**
   * Delete a task after verifying project ownership
   */
  async deleteTask(taskId, userId) {
    const task = await Task.findById(taskId).populate('projectId', 'userId');

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (!task.projectId || task.projectId.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You cannot delete another user\'s task');
      error.statusCode = 403;
      throw error;
    }

    await task.deleteOne();
    return { taskId, message: 'Task deleted successfully' };
  }
}

module.exports = new TaskService();
