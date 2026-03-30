import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from './ThemeProvider';

// Mock data for demonstration
const mockStats = [
  { date: '2023-01-01', mastered: 10, reviewed: 20 },
  { date: '2023-01-02', mastered: 15, reviewed: 25 },
  { date: '2023-01-03', mastered: 20, reviewed: 30 },
];

export const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(mockStats);

  // In real implementation, fetch from Supabase
  useEffect(() => {
    // fetchStats().then(setStats);
  }, []);

  return (
    <Card className="cyber-surface p-6 neon-border-blue">
      <h2 className="mb-4 text-xl font-medium bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
        Study Analytics
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={stats}>
          <XAxis dataKey="date" stroke={theme === 'dark' ? 'var(--neon-blue)' : '#000'} />
          <YAxis stroke={theme === 'dark' ? 'var(--neon-blue)' : '#000'} />
          <Tooltip />
          <Line type="monotone" dataKey="mastered" stroke="var(--neon-blue)" strokeWidth={2} />
          <Line type="monotone" dataKey="reviewed" stroke="var(--neon-purple)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
