import React from 'react';
import { useProject } from '../context/ProjectContext';
import { MetricsView } from '../components/MetricsView';

export const MetricsPage: React.FC = () => {
  const { tickets, users } = useProject();

  return <MetricsView tickets={tickets} users={users} />;
};

export default MetricsPage;
