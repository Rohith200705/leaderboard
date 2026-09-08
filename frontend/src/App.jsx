import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

const API = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Host Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`${API}/scores/leaderboard`).then(r => r.json()).then(setLeaderboard);
    fetch(`${API}/events`).then(r => r.json()).then(setEvents);
  }, []);

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
  };

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h2>Leaderboard</h2>
        <p>September 2026 | Working Days: 8, 9, 10, 11, 15</p>
      </div>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.slice(0, 10).map((entry) => (
            <tr key={entry.team?._id}>
              <td>
                <span className={`rank-badge ${getRankClass(entry.rank)}`}>
                  {entry.rank}
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>{entry.team?.name}</td>
              <td><span className="points-badge">{entry.totalPoints}</span></td>
            </tr>
          ))}
          {leaderboard.length > 10 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', color: '#888', padding: '16px', fontSize: '1.1rem', letterSpacing: '6px' }}>
                . . . . .
              </td>
            </tr>
          )}
          {leaderboard.length === 0 && (
            <tr><td colSpan="3" className="no-event">No scores yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Admin() {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [scores, setScores] = useState({});
  const [message, setMessage] = useState('');

  const loadEvents = () => fetch(`${API}/events`).then(r => r.json()).then(setEvents);

  useEffect(() => {
    loadEvents();
    fetch(`${API}/teams`).then(r => r.json()).then(setTeams);
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetch(`${API}/scores/event/${selectedEvent}`, { headers: getHeaders() })
        .then(r => r.json())
        .then(data => {
          const map = {};
          data.forEach(s => { map[s.team?._id] = s.points; });
          setScores(map);
        });
    }
  }, [selectedEvent]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newEventName, date: newEventDate })
      });
      if (!res.ok) throw new Error('Failed');
      setNewEventName('');
      setNewEventDate('');
      loadEvents();
      setMessage('Event created!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error creating event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: getHeaders() });
    loadEvents();
    if (selectedEvent === id) setSelectedEvent('');
  };

  const handleScoreChange = (teamId, value) => {
    const num = parseInt(value) || 0;
    setScores(prev => ({ ...prev, [teamId]: Math.min(100, Math.max(0, num)) }));
  };

  const handleSaveScores = async () => {
    const scoreArray = teams.map(t => ({
      teamId: t._id,
      points: scores[t._id] || 0
    }));
    try {
      await fetch(`${API}/scores/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ eventId: selectedEvent, scores: scoreArray })
      });
      setMessage('Scores saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving scores');
    }
  };

  const workingDates = ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-15'];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
      </div>

      {message && <p style={{ textAlign: 'center', color: '#ffd200', marginBottom: 20 }}>{message}</p>}

      <div className="admin-section">
        <h3>Create Event</h3>
        <form onSubmit={handleCreateEvent} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <label>Event Name</label>
            <input type="text" value={newEventName} onChange={e => setNewEventName(e.target.value)} required placeholder="e.g. Quiz Round 1" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <label>Date</label>
            <select value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required>
              <option value="">Select date</option>
              {workingDates.map(d => (
                <option key={d} value={d}>{new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>Create</button>
        </form>
      </div>

      <div className="admin-section">
        <h3>Events</h3>
        {events.length === 0 ? (
          <p className="no-event">No events created yet</p>
        ) : (
          <div className="event-list">
            {events.map(ev => (
              <div key={ev._id} className="event-card" style={{ borderColor: selectedEvent === ev._id ? '#ffd200' : undefined }}>
                <div className="event-info">
                  <span>{ev.name}</span>
                  <span>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-small" onClick={() => setSelectedEvent(ev._id)}>
                    {selectedEvent === ev._id ? '✓ Selected' : 'Select'}
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDeleteEvent(ev._id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="admin-section">
          <h3>Enter Scores — {events.find(e => e._id === selectedEvent)?.name} <span style={{fontSize:'0.75rem', color:'#aaa', fontWeight:400}}>(max 100 per event)</span></h3>
          <div className="score-grid">
            {teams.map(team => (
              <div key={team._id} className="score-item">
                <label>{team.name}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores[team._id] || ''}
                  onChange={e => handleScoreChange(team._id, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 40px' }} onClick={handleSaveScores}>
              Save All Scores
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="navbar">
      <h1>LEADERBOARD</h1>
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/admin">Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Host Login</Link>
        )}
      </nav>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}
