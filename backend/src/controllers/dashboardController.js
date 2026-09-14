const dashboardService = require('../services/dashboardService');

/**
 * @desc    Get aggregated dashboard statistics for authenticated user
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user._id);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
