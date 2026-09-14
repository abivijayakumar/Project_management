/**
 * Escape special regex characters in a string to avoid ReDoS or injection in RegExp searches
 * @param {string} str - Raw user input
 * @returns {string} Sanitized string safe for new RegExp()
 */
const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
  escapeRegex
};
