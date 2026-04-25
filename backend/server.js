const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const MAX_ROOM_ID_LENGTH = 64;
const MAX_DOCUMENT_LENGTH = 50000;
const roomTexts = new Map();

app.use(express.json());

const io = socketIo(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

function normalizeRoomId(roomId) {
  if (typeof roomId !== 'string') {
    return null;
  }

  const trimmed = roomId.trim();
  if (!trimmed || trimmed.length > MAX_ROOM_ID_LENGTH) {
    return null;
  }

  return trimmed;
}

function normalizeText(text) {
  if (typeof text !== 'string') {
    return null;
  }

  if (text.length > MAX_DOCUMENT_LENGTH) {
    return null;
  }

  return text;
}

function getRoomText(roomId) {
  return roomTexts.get(roomId) || '';
}

function getParticipantCount(roomId) {
  return io.sockets.adapter.rooms.get(roomId)?.size || 0;
}

function emitPresence(roomId) {
  io.to(roomId).emit('room-presence', {
    roomId,
    participants: getParticipantCount(roomId),
  });
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    port: PORT,
    rooms: roomTexts.size,
  });
});

app.get('/api/rooms/:roomId/document', (req, res) => {
  const roomId = normalizeRoomId(req.params.roomId);

  if (!roomId) {
    return res.status(400).json({ error: 'Invalid room ID.' });
  }

  return res.json({
    roomId,
    text: getRoomText(roomId),
    participants: getParticipantCount(roomId),
  });
});

app.post('/api/rooms/:roomId/document', (req, res) => {
  const roomId = normalizeRoomId(req.params.roomId);
  const text = normalizeText(req.body?.text);

  if (!roomId) {
    return res.status(400).json({ error: 'Invalid room ID.' });
  }

  if (text === null) {
    return res.status(400).json({ error: 'Invalid document text.' });
  }

  roomTexts.set(roomId, text);
  io.to(roomId).emit('text-update', text);

  return res.json({ roomId, text });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', (rawRoomId, callback) => {
    const roomId = normalizeRoomId(rawRoomId);

    if (!roomId) {
      if (typeof callback === 'function') {
        callback({ ok: false, error: 'Invalid room ID.' });
      }
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    const text = getRoomText(roomId);
    socket.emit('text-update', text);
    emitPresence(roomId);

    if (typeof callback === 'function') {
      callback({
        ok: true,
        roomId,
        text,
        participants: getParticipantCount(roomId),
      });
    }
  });

  socket.on('text-change', (payload, callback) => {
    const roomId = normalizeRoomId(payload?.roomId);
    const text = normalizeText(payload?.text);

    if (!roomId || text === null) {
      if (typeof callback === 'function') {
        callback({ ok: false, error: 'Invalid room update payload.' });
      }
      return;
    }

    roomTexts.set(roomId, text);
    socket.to(roomId).emit('text-update', text);

    if (typeof callback === 'function') {
      callback({ ok: true, roomId, text });
    }
  });

  socket.on('disconnect', () => {
    const { roomId } = socket.data;
    if (roomId) {
      emitPresence(roomId);
    }

    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
