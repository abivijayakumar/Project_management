import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const getBadgeConfig = () => {
    switch (priority) {
      case 'High':
        return {
          className: 'badge badge-high',
          icon: <AlertCircle size={13} />
        };
      case 'Medium':
        return {
          className: 'badge badge-medium',
          icon: <AlertTriangle size={13} />
        };
      case 'Low':
      default:
        return {
          className: 'badge badge-low',
          icon: <ArrowDown size={13} />
        };
    }
  };

  const { className, icon } = getBadgeConfig();

  return (
    <span className={className}>
      {icon}
      <span>{priority || 'Medium'}</span>
    </span>
  );
};

export default PriorityBadge;
