import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';

interface SLAConfig {
  first_response_hours: number;
  resolution_hours: number;
  business_hours_only: number;
}

const Settings: React.FC = () => {
  const [slaConfig, setSlaConfig] = useState<SLAConfig>({
    first_response_hours: 4,
    resolution_hours: 24,
    business_hours_only: 1
  });
  const [openaiKey, setOpenaiKey] = useState('');
  const [gmailClientId, setGmailClientId] = useState('');
  const [gmailClientSecret, setGmailClientSecret] = useState('');
  const [gmailAuthUrl, setGmailAuthUrl] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSLAConfig();
  }, []);

  const loadSLAConfig = async () => {
    try {
      const data = await apiGet('/sla/config');
      if (data.config) {
        setSlaConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading SLA config:', error);
    }
  };

  const saveSLAConfig = async () => {
    try {
      await apiPut('/sla/config', slaConfig);
      alert('SLA configuration saved successfully');
    } catch (error) {
      console.error('Error saving SLA config:', error);
      alert('Failed to save SLA configuration');
    }
  };

  const initializeOpenAI = async () => {
    try {
      await apiPost('/ai/init', { apiKey: openaiKey });
      alert('OpenAI configured successfully');
      setOpenaiKey(''); // Clear for security
    } catch (error) {
      console.error('Error initializing OpenAI:', error);
      alert('Failed to configure OpenAI');
    }
  };

  const initializeGmail = async () => {
    try {
      const result = await apiPost('/gmail/auth/init', {
        clientId: gmailClientId,
        clientSecret: gmailClientSecret
      });
      setGmailAuthUrl(result.authUrl);
      alert('Please open the authorization URL and complete the OAuth flow');
    } catch (error) {
      console.error('Error initializing Gmail:', error);
      alert('Failed to initialize Gmail authentication');
    }
  };

  const syncGmail = async () => {
    setSyncing(true);
    try {
      const result = await apiPost('/gmail/sync', {});
      alert(`Gmail sync completed! Created ${result.createdTickets} new tickets from ${result.totalMessages} messages.`);
    } catch (error) {
      console.error('Error syncing Gmail:', error);
      alert('Failed to sync Gmail. Make sure authentication is complete.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="settings">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>SLA Configuration</h3>
        <p>Configure service level agreement targets (in hours)</p>
        
        <div className="form-group">
          <label>First Response Time (hours)</label>
          <input
            type="number"
            step="0.5"
            value={slaConfig.first_response_hours}
            onChange={(e) =>
              setSlaConfig({ ...slaConfig, first_response_hours: parseFloat(e.target.value) })
            }
          />
          <small>Target time to provide first response to a ticket</small>
        </div>

        <div className="form-group">
          <label>Resolution Time (hours)</label>
          <input
            type="number"
            step="0.5"
            value={slaConfig.resolution_hours}
            onChange={(e) =>
              setSlaConfig({ ...slaConfig, resolution_hours: parseFloat(e.target.value) })
            }
          />
          <small>Target time to resolve and close a ticket</small>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={slaConfig.business_hours_only === 1}
              onChange={(e) =>
                setSlaConfig({ ...slaConfig, business_hours_only: e.target.checked ? 1 : 0 })
              }
            />
            Calculate SLA using business hours only (Mon-Fri, 9AM-6PM)
          </label>
        </div>

        <button onClick={saveSLAConfig} className="save-btn">
          Save SLA Configuration
        </button>
      </div>

      <div className="settings-section">
        <h3>OpenAI Configuration</h3>
        <p>Configure OpenAI API for AI-powered text analysis</p>
        
        <div className="form-group">
          <label>OpenAI API Key</label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
          />
          <small>Your OpenAI API key will be stored securely</small>
        </div>

        <button onClick={initializeOpenAI} className="save-btn" disabled={!openaiKey}>
          Configure OpenAI
        </button>
      </div>

      <div className="settings-section">
        <h3>Gmail Integration</h3>
        <p>Connect to Gmail to automatically create tickets from emails</p>
        
        <div className="form-group">
          <label>Gmail Client ID</label>
          <input
            type="text"
            value={gmailClientId}
            onChange={(e) => setGmailClientId(e.target.value)}
            placeholder="Your Google OAuth Client ID"
          />
        </div>

        <div className="form-group">
          <label>Gmail Client Secret</label>
          <input
            type="password"
            value={gmailClientSecret}
            onChange={(e) => setGmailClientSecret(e.target.value)}
            placeholder="Your Google OAuth Client Secret"
          />
        </div>

        <button
          onClick={initializeGmail}
          className="save-btn"
          disabled={!gmailClientId || !gmailClientSecret}
        >
          Initialize Gmail Authentication
        </button>

        {gmailAuthUrl && (
          <div className="auth-url-section">
            <p>Authorization URL:</p>
            <a href={gmailAuthUrl} target="_blank" rel="noopener noreferrer" className="auth-link">
              {gmailAuthUrl}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(gmailAuthUrl);
                alert('URL copied to clipboard');
              }}
              className="copy-btn"
            >
              Copy URL
            </button>
          </div>
        )}

        <button onClick={syncGmail} disabled={syncing} className="sync-btn">
          {syncing ? 'Syncing...' : '🔄 Sync Gmail Now'}
        </button>
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <p>Send Emails Desk - Help Desk System v1.0.0</p>
        <p>A complete help desk solution with Gmail integration, AI analysis, and performance metrics.</p>
      </div>
    </div>
  );
};

export default Settings;
