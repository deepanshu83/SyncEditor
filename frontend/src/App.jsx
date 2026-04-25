import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [text, setText] = useState('');
  const roomId = 'room1'; // For MVP, hardcoded room

  useEffect(() => {
    socket.emit('join-room', roomId);

    socket.on('text-update', (newText) => {
      setText(newText);
    });

    return () => {
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
      <h1>SyncEditor</h1>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Start typing..."
        rows={20}
        cols={80}
      />
    </div>
  );
}

export default App;