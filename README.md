# SyncEditor

SyncEditor is a minimal real-time collaborative text editor built as an MVP to demonstrate how multiple users can edit the same document simultaneously.

## 🚀 Project Overview

This project showcases a simple shared-editor experience with a React frontend and a Node.js backend.
It uses Socket.io to synchronize text updates in real time across all connected browser clients.

## 🌟 Features

- Real-time text collaboration in a shared room
- Live broadcast of updates to all connected users
- Clean editor UI with connection status
- In-memory document state stored on the server
- Easy local setup for development and testing

## 🧠 Architecture

### Frontend
- Built with React and Vite
- Uses `socket.io-client` to connect to the backend
- Sends `text-change` events when the editor content changes
- Receives `text-update` events to refresh the editor for other users

### Backend
- Built with Node.js and Express
- Uses Socket.io for WebSocket communication
- Accepts room join requests and manages socket rooms
- Stores the latest document text for each room in memory
- Broadcasts text updates to all other clients in the same room

## 📁 Project Structure

- `backend/`
  - `server.js` — Express server and Socket.io setup
  - `package.json` — backend dependencies and start script

- `frontend/`
  - `src/App.jsx` — editor UI and Socket.io client logic
  - `src/App.css` — styles for the editor interface
  - `package.json` — frontend dependencies and Vite scripts

## 💡 How It Works

1. The React frontend connects to the backend at `http://localhost:3001`.
2. The client emits a `join-room` event for a room ID (`room1` in this MVP).
3. When a user types, the frontend sends a `text-change` event with the updated text.
4. The backend saves the text for that room and broadcasts a `text-update` event to other clients.
5. Connected clients receive the update and refresh their editor content instantly.

## ▶️ Local Setup

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, typically `http://localhost:5173`.

## 🧪 Testing Collaboration

- Open the frontend URL in two browser windows or tabs.
- Type into the editor in one window.
- The other window should update automatically with the same text.

## ⚠️ Important Notes

- The MVP uses a fixed room ID: `room1`.
- The server keeps the document state in memory only.
- If the backend restarts, all unsaved text is lost.
- This implementation does not currently include conflict resolution or operational transforms.

## 🚧 Possible Enhancements

- Add multiple dynamic rooms and room creation
- Persist documents to a database
- Add user presence and cursor tracking
- Implement text diffing or CRDT/OT for better conflict handling
- Add authentication and access control

## ✅ Summary

SyncEditor is a working MVP for real-time collaboration with a React frontend and Socket.io backend. It demonstrates the core realtime flow: connect, join room, send changes, and broadcast updates.
