const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

class DashboardService {
  /**
   * Calculate aggregated statistics exclusively for the authenticated user
   * @param {string|mongoose.Types.ObjectId} userId
   */
  async getStats(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregate project metrics for this user
    const projectStats = await Project.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    let totalProjects = 0;
    let projectsInProgress = 0;
    let completedProjects = 0;
    let notStartedProjects = 0;

    projectStats.forEach(item => {
      totalProjects += item.count;
      if (item._id === 'In Progress') projectsInProgress = item.count;
      if (item._id === 'Completed') completedProjects = item.count;
      if (item._id === 'Not Started') notStartedProjects = item.count;
    });

    // Find all project IDs owned by this user
    const userProjects = await Project.find({ userId: userObjectId }).select('_id').lean();
    const projectIds = userProjects.map(p => p._id);

    // Aggregate task metrics for tasks linked to user's projects
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;

    if (projectIds.length > 0) {
      const taskStats = await Task.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      taskStats.forEach(item => {
        totalTasks += item.count;
        if (item._id === 'Completed') completedTasks = item.count;
        if (item._id === 'Pending') pendingTasks = item.count;
        if (item._id === 'In Progress') inProgressTasks = item.count;
      });
    }

    // Also fetch 5 most recent projects and 5 upcoming/recent tasks for rich dashboard widgets
    const recentProjects = await Project.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    let recentTasks = [];
    if (projectIds.length > 0) {
      recentTasks = await Task.find({ projectId: { $in: projectIds } })
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    }

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
      // Extended metrics for enhanced UI visualization
      completedProjects,
      notStartedProjects,
      inProgressTasks,
      recentProjects,
      recentTasks
    };
  }
}

module.exports = new DashboardService();
