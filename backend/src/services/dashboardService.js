const { fn, col, Op } = require('sequelize');
const { Project, Task } = require('../models');

class DashboardService {
  /**
   * Calculate aggregated statistics exclusively for the authenticated user
   * @param {number|string} userId
   */
  async getStats(userId) {
    const userPk = parseInt(userId, 10) || userId;

    // Aggregate project metrics for this user
    const projectStats = await Project.findAll({
      where: { userId: userPk },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    let totalProjects = 0;
    let projectsInProgress = 0;
    let completedProjects = 0;
    let notStartedProjects = 0;

    projectStats.forEach(item => {
      const count = parseInt(item.count, 10) || 0;
      totalProjects += count;
      if (item.status === 'In Progress') projectsInProgress = count;
      if (item.status === 'Completed') completedProjects = count;
      if (item.status === 'Not Started') notStartedProjects = count;
    });

    // Find all project IDs owned by this user
    const userProjects = await Project.findAll({
      where: { userId: userPk },
      attributes: ['id'],
      raw: true
    });
    const projectIds = userProjects.map(p => p.id);

    // Aggregate task metrics for tasks linked to user's projects
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;

    if (projectIds.length > 0) {
      const taskStats = await Task.findAll({
        where: { projectId: { [Op.in]: projectIds } },
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      taskStats.forEach(item => {
        const count = parseInt(item.count, 10) || 0;
        totalTasks += count;
        if (item.status === 'Completed') completedTasks = count;
        if (item.status === 'Pending') pendingTasks = count;
        if (item.status === 'In Progress') inProgressTasks = count;
      });
    }

    // Fetch 5 most recent projects
    const recentProjects = await Project.findAll({
      where: { userId: userPk },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Fetch 5 most recent tasks
    let recentTasks = [];
    if (projectIds.length > 0) {
      const fetchedTasks = await Task.findAll({
        where: { projectId: { [Op.in]: projectIds } },
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      recentTasks = fetchedTasks.map(t => t.toJSON());
    }

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
      completedProjects,
      notStartedProjects,
      inProgressTasks,
      recentProjects: recentProjects.map(p => p.toJSON()),
      recentTasks
    };
  }
}

module.exports = new DashboardService();
