const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const chatHistory = {}; // { roomName: [ { user, text } ] }

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    if (!chatHistory[room]) {
      chatHistory[room] = [];
    }

    socket.emit('chatHistory', chatHistory[room]);

    socket.to(room).emit('message', {
      user: 'System',
      text: `${username} joined the room.`,
    });
  });

  socket.on('sendMessage', (text) => {
    const msg = {
      user: socket.username,
      text,
    };
    chatHistory[socket.room].push(msg);
    io.to(socket.room).emit('message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.username && socket.room) {
      io.to(socket.room).emit('message', {
        user: 'System',
        text: `${socket.username} left the room.`,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
