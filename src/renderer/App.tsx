import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import TicketInbox from './components/TicketInbox';
import TicketDetail from './components/TicketDetail';
import ContactManager from './components/ContactManager';
import Settings from './components/Settings';
import './styles/App.css';

type View = 'dashboard' | 'inbox' | 'contacts' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const renderView = () => {
    if (selectedTicketId) {
      return (
        <TicketDetail
          ticketId={selectedTicketId}
          onBack={() => setSelectedTicketId(null)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inbox':
        return (
          <TicketInbox
            onSelectTicket={(id) => setSelectedTicketId(id)}
          />
        );
      case 'contacts':
        return <ContactManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo">
          <h1>📧 Help Desk</h1>
        </div>
        <ul className="nav-menu">
          <li
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => {
              setCurrentView('dashboard');
              setSelectedTicketId(null);
            }}
          >
            📊 Dashboard
          </li>
          <li
            className={currentView === 'inbox' ? 'active' : ''}
            onClick={() => {
              setCurrentView('inbox');
              setSelectedTicketId(null);
            }}
          >
            📥 Inbox
          </li>
          <li
            className={currentView === 'contacts' ? 'active' : ''}
            onClick={() => {
              setCurrentView('contacts');
              setSelectedTicketId(null);
            }}
          >
            👥 Contacts
          </li>
          <li
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => {
              setCurrentView('settings');
              setSelectedTicketId(null);
            }}
          >
            ⚙️ Settings
          </li>
        </ul>
      </nav>
      <main className="content">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
