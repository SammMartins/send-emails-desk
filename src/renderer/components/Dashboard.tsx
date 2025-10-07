import React, { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';

interface DashboardMetrics {
  slaConfig: any;
  ticketsByStatus: Array<{ status: string; count: number }>;
  ticketsByPriority: Array<{ priority: string; count: number }>;
  averageFirstResponseHours: number;
  averageResolutionHours: number;
  firstResponseSLA: { total: number; withinSLA: number; percentage: string };
  resolutionSLA: { total: number; withinSLA: number; percentage: string };
  ticketsPerDay: Array<{ date: string; count: number }>;
  topSenders: Array<{ sender_email: string; sender_name: string; ticket_count: number }>;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await apiGet('/dashboard/metrics');
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!metrics) {
    return <div className="error">Failed to load dashboard metrics</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard - Performance Metrics</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Tickets by Status</h3>
          <div className="metric-content">
            {metrics.ticketsByStatus.map((item) => (
              <div key={item.status} className="metric-row">
                <span className={`status-badge ${item.status}`}>{item.status}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card">
          <h3>Tickets by Priority</h3>
          <div className="metric-content">
            {metrics.ticketsByPriority.map((item) => (
              <div key={item.priority} className="metric-row">
                <span className={`priority-badge ${item.priority}`}>{item.priority}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card sla-card">
          <h3>SLA - First Response</h3>
          <div className="metric-content">
            <div className="sla-percentage">
              {metrics.firstResponseSLA.percentage}%
            </div>
            <div className="sla-details">
              {metrics.firstResponseSLA.withinSLA} of {metrics.firstResponseSLA.total} within SLA
            </div>
            <div className="sla-target">
              Target: {'<'} {metrics.slaConfig.first_response_hours} hours
            </div>
            <div className="sla-average">
              Average: {metrics.averageFirstResponseHours.toFixed(2)} hours
            </div>
          </div>
        </div>

        <div className="metric-card sla-card">
          <h3>SLA - Resolution Time</h3>
          <div className="metric-content">
            <div className="sla-percentage">
              {metrics.resolutionSLA.percentage}%
            </div>
            <div className="sla-details">
              {metrics.resolutionSLA.withinSLA} of {metrics.resolutionSLA.total} within SLA
            </div>
            <div className="sla-target">
              Target: {'<'} {metrics.slaConfig.resolution_hours} hours
            </div>
            <div className="sla-average">
              Average: {metrics.averageResolutionHours.toFixed(2)} hours
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Tickets Created (Last 30 Days)</h3>
          <div className="simple-chart">
            {metrics.ticketsPerDay.map((item) => (
              <div key={item.date} className="chart-bar">
                <div className="bar-label">{new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{ height: `${Math.min(item.count * 10, 100)}px` }}
                  ></div>
                </div>
                <div className="bar-value">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Top 10 Senders</h3>
          <div className="top-senders">
            {metrics.topSenders.map((sender, index) => (
              <div key={sender.sender_email} className="sender-row">
                <span className="rank">{index + 1}</span>
                <span className="sender-info">
                  <strong>{sender.sender_name || sender.sender_email}</strong>
                  <br />
                  <small>{sender.sender_email}</small>
                </span>
                <span className="sender-count">{sender.ticket_count} tickets</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
