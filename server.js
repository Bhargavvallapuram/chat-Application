const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static('public'));

// Store connected users and chat messages in memory
let users = [];
let messages = [];

io.on('connection', (socket) => {
  let username = null;

  socket.on('join', (name) => {
    username = name;
    users.push(username);

    // Broadcast system message: user joined
    const sysMsg = { user: 'System', text: `${username} joined the chat` };
    messages.push(sysMsg);

    // Send chat history to the new user
    socket.emit('chatHistory', messages);

    // Broadcast the system message to all others
    socket.broadcast.emit('message', sysMsg);
  });

  socket.on('sendMessage', (msg) => {
    if (!username) return;

    const message = { user: username, text: msg };
    messages.push(message);

    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    if (username) {
      users = users.filter(u => u !== username);

      const sysMsg = { user: 'System', text: `${username} left the chat` };
      messages.push(sysMsg);
      socket.broadcast.emit('message', sysMsg);
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
