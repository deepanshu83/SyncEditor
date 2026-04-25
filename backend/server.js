const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store room texts
const roomTexts = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    // Send current text to the new user
    if (roomTexts[roomId]) {
      socket.emit('text-update', roomTexts[roomId]);
    }
  });

  socket.on('text-change', (data) => {
    roomTexts[data.roomId] = data.text;
    socket.to(data.roomId).emit('text-update', data.text);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});