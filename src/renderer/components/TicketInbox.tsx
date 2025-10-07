import React, { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';

interface Ticket {
  id: number;
  subject: string;
  sender_email: string;
  sender_name: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface TicketInboxProps {
  onSelectTicket: (id: number) => void;
}

const TicketInbox: React.FC<TicketInboxProps> = ({ onSelectTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(0);
  const [limit] = useState(50);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, searchQuery, sortBy, sortOrder, page]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        limit: limit.toString(),
        offset: (page * limit).toString()
      });

      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);

      const data = await apiGet(`/tickets?${params.toString()}`);
      setTickets(data.tickets);
      setTotal(data.total);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

  return (
    <div className="ticket-inbox">
      <h2>Ticket Inbox</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(0);
          }}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <button onClick={loadTickets} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : (
        <>
          <div className="ticket-table-container">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="sortable">
                    ID {sortBy === 'id' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('subject')} className="sortable">
                    Subject {sortBy === 'subject' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('sender_email')} className="sortable">
                    From {sortBy === 'sender_email' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    Status {sortBy === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('priority')} className="sortable">
                    Priority {sortBy === 'priority' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('created_at')} className="sortable">
                    Created {sortBy === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket.id)}
                    className="ticket-row"
                  >
                    <td>{ticket.id}</td>
                    <td className="subject-cell">{ticket.subject}</td>
                    <td>
                      {ticket.sender_name || ticket.sender_email}
                      <br />
                      <small>{ticket.sender_email}</small>
                    </td>
                    <td>
                      <span className={`status-badge ${ticket.status}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${ticket.priority}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>{new Date(ticket.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>
              Page {page + 1} of {Math.ceil(total / limit)} ({total} total)
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketInbox;
