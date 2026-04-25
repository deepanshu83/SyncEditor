import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const roomId = 'room1'; // For MVP, hardcoded room

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
      <div className="editor-shell">
        <header className="editor-header">
          <div>
            <h1>SyncEditor</h1>
            <p className="editor-subtitle">Real-time collaborative editing for your team.</p>
          </div>
          <span className={`status-badge ${connected ? 'online' : 'offline'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </header>

        <div className="room-chip">Room: {roomId}</div>

        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Start typing and share this room with collaborators..."
          rows={20}
        />
      </div>
    </div>
  );
}

export default App;