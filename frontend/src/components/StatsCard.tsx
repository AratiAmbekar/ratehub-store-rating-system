import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  id?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, id }) => {
  return (
    <div className="glass-card stat-card" id={id}>
      <div className="stat-info">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
};
