import React from 'react';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Completed':
        return {
          className: 'badge badge-completed',
          icon: <CheckCircle2 size={13} />
        };
      case 'In Progress':
        return {
          className: 'badge badge-progress',
          icon: <PlayCircle size={13} />
        };
      case 'Not Started':
      case 'Pending':
      default:
        return {
          className: 'badge badge-pending',
          icon: <Clock size={13} />
        };
    }
  };

  const { className, icon } = getBadgeConfig();

  return (
    <span className={className}>
      {icon}
      <span>{status || 'Pending'}</span>
    </span>
  );
};

export default StatusBadge;
