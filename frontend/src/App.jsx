import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const roomId = 'room1'; // For MVP, hardcoded room
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characterCount = text.length;

  useEffect(() => {
    socket.emit('join-room', roomId);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('text-update', (newText) => {
      setText(newText);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('text-update');
    };
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit('text-change', { roomId, text: newText });
  };

  return (
    <div className="App">
      <div className="page-glow page-glow-left" aria-hidden="true" />
      <div className="page-glow page-glow-right" aria-hidden="true" />

      <div className="workspace-shell">
        <section className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">Collaborative Writing Workspace</div>
            <h1>Keep shared notes in sync without losing momentum.</h1>
            <p className="editor-subtitle">
              SyncEditor gives your team one focused space to write together in real time,
              with instant updates across every connected session.
            </p>
          </div>

          <div className="hero-meta">
            <div className="hero-stat">
              <span className="stat-label">Room</span>
              <strong>{roomId}</strong>
            </div>
            <div className="hero-stat">
              <span className="stat-label">Status</span>
              <strong>{connected ? 'Live sync active' : 'Reconnecting'}</strong>
            </div>
          </div>
        </section>

        <section className="editor-shell">
          <header className="editor-header">
            <div className="editor-heading">
              <h2>Shared document</h2>
              <p>Edits are broadcast to everyone connected to this room.</p>
            </div>

            <div className="editor-actions">
              <span className="room-chip">Room {roomId}</span>
              <span className={`status-badge ${connected ? 'online' : 'offline'}`}>
                <span className="status-dot" aria-hidden="true" />
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </header>

          <div className="editor-surface">
            <div className="editor-toolbar" aria-hidden="true">
              <span className="toolbar-pill">Live draft</span>
              <span className="toolbar-pill">Autosynced</span>
            </div>

            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Start typing and share this room with collaborators..."
              rows={20}
            />

            <footer className="editor-footer">
              <div className="footer-metric">
                <span className="metric-value">{wordCount}</span>
                <span className="metric-label">Words</span>
              </div>
              <div className="footer-metric">
                <span className="metric-value">{characterCount}</span>
                <span className="metric-label">Characters</span>
              </div>
              <p className="editor-footnote">One live document. Multiple collaborators. Zero refreshes.</p>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
