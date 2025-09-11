const socket = io();
let username = '';

function joinChat() {
    username = document.getElementById('username').value.trim();
    if (!username) return alert('Please enter a name');

    socket.emit('join', username);
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'flex';
    document.getElementById('messageInput').focus();
}

socket.on('chatHistory', (msgs) => {
    msgs.forEach(addMessage);
    scrollToBottom();
});

socket.on('message', (msg) => {
    addMessage(msg);
    scrollToBottom();
});

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (message) {
        socket.emit('sendMessage', message);
        input.value = '';
        input.focus();
    }
}

// Send message on Enter key press
document.getElementById('messageInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent new line
        sendMessage();
    }
});

function addMessage(msg) {
    const li = document.createElement('li');

    if (msg.user === 'System') {
        li.classList.add('system');
        li.textContent = `${msg.text}`;
    } else if (msg.user === username) {
        li.textContent = `You: ${msg.text}`;
        li.style.backgroundColor = '#007bff';
        li.style.color = 'white';
        li.style.alignSelf = 'flex-end';
    } else {
        li.textContent = `${msg.user}: ${msg.text}`;
        li.style.backgroundColor = '#e9ecef';
        li.style.color = '#333';
        li.style.alignSelf = 'flex-start';
    }

    document.getElementById('messages').appendChild(li);
}

// Smooth scroll to the bottom of the messages list
function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    });
}
