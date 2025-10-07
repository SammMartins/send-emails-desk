import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';

interface Contact {
  id: number;
  email: string;
  name: string;
  phone: string;
  city: string;
  created_at: string;
}

const ContactManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadContacts();
    loadCities();
  }, [cityFilter, searchQuery]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter) params.append('city', cityFilter);
      if (searchQuery) params.append('search', searchQuery);

      const data = await apiGet(`/contacts?${params.toString()}`);
      setContacts(data.contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const data = await apiGet('/contacts/cities');
      setCities(data.cities);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const saveContact = async (contact: Partial<Contact>) => {
    try {
      if (contact.id) {
        await apiPut(`/contacts/${contact.id}`, contact);
      } else {
        await apiPost('/contacts', contact);
      }
      setEditingContact(null);
      await loadContacts();
      await loadCities();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact');
    }
  };

  return (
    <div className="contact-manager">
      <h2>Contact Management</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <button onClick={() => setEditingContact({} as Contact)} className="add-btn">
          + Add Contact
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading contacts...</div>
      ) : (
        <div className="contacts-table-container">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone || '-'}</td>
                  <td>{contact.city || '-'}</td>
                  <td>
                    <button
                      onClick={() => setEditingContact(contact)}
                      className="edit-btn-small"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingContact && (
        <div className="modal-overlay" onClick={() => setEditingContact(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingContact.id ? 'Edit Contact' : 'Add Contact'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveContact(editingContact);
              }}
            >
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editingContact.email || ''}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, email: e.target.value })
                  }
                  required
                  disabled={!!editingContact.id}
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingContact.name || ''}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editingContact.phone || ''}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={editingContact.city || ''}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, city: e.target.value })
                  }
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingContact(null)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;
