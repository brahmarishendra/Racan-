// Chat functionality
class Chat {
    constructor(db, rtdb, currentUser) {
        this.db = db;
        this.rtdb = rtdb;
        this.currentUser = currentUser;
        this.currentChatUserId = null;
        this.messagesListener = null;
        
        // DOM Elements
        this.chatHeader = document.getElementById('chat-header');
        this.chatAvatar = document.getElementById('chat-avatar');
        this.chatName = document.getElementById('chat-name');
        this.chatStatus = document.getElementById('chat-status');
        this.messagesContainer = document.getElementById('messages-container');
        this.welcomeMessage = document.getElementById('welcome-message');
        this.chatInputContainer = document.getElementById('chat-input-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    // Set the current user
    setCurrentUser(user) {
        this.currentUser = user;
    }
    
    // Start chat with a user
    startChat(userId, userName, distance) {
        // Clear previous chat session if exists
        this.clearChatSession();
        
        this.currentChatUserId = userId;
        
        // Update chat header
        this.chatHeader.style.display = 'flex';
        this.chatName.textContent = userName;
        this.chatStatus.textContent = `${distance.toFixed(1)} km away`;
        this.chatAvatar.textContent = this.getInitials(userName);
        
        // Show chat input
        this.chatInputContainer.style.display = 'flex';
        
        // Hide welcome message
        this.welcomeMessage.style.display = 'none';
        
        // Get or create chat ID
        this.getChatId(userId).then(chatId => {
            // Listen for messages
            this.listenForMessages(chatId);
        });
    }
    
    // Get initials from name
    getInitials(name) {
        if (!name) return "?";
        return name.split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    // Get chat ID based on two user IDs
    async getChatId(otherUserId) {
        // Sort user IDs to ensure consistent chat ID
        const users = [this.currentUser.uid, otherUserId].sort();
        const chatId = users.join('_');
        
        // Check if chat exists
        const chatRef = this.db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();
        
        // Create chat if it doesn't exist
        if (!chatDoc.exists) {
            await chatRef.set({
                users: users,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: null,
                lastMessageTime: null
            });
            
            // Create messages collection in realtime database
            await this.rtdb.ref(`messages/${chatId}`).set({
                initialized: true
            });
        }
        
        return chatId;
    }
    
    // Listen for messages
    listenForMessages(chatId) {
        // Remove previous listener if exists
        if (this.messagesListener) {
            this.messagesListener();
        }
        
        // Clear messages container
        this.messagesContainer.innerHTML = '';
        
        // Create messages reference
        const messagesRef = this.rtdb.ref(`messages/${chatId}`);
        
        // Listen for messages
        this.messagesListener = messagesRef.on('child_added', snapshot => {
            const message = snapshot.val();
            
            // Skip the initialization message
            if (snapshot.key === 'initialized') return;
            
            // Render message
            this.renderMessage(message);
            
            // Scroll to bottom
            this.scrollToBottom();
        });
    }
    
    // Render a message
    renderMessage(message) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.senderId === this.currentUser.uid ? 'sent' : 'received'}`;
        
        // Create message text
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = message.text;
        
        // Create message time
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTimestamp(message.timestamp);
        
        // Append elements
        messageElement.appendChild(messageText);
        messageElement.appendChild(messageTime);
        
        // Append to messages container
        this.messagesContainer.appendChild(messageElement);
    }
    
    // Format timestamp
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Send message
    async sendMessage() {
        const text = this.messageInput.value.trim();
        
        // Don't send empty messages
        if (!text) return;
        
        // Clear input
        this.messageInput.value = '';
        
        // Get chat ID
        const chatId = await this.getChatId(this.currentChatUserId);
        
        // Create message
        const message = {
            text: text,
            senderId: this.currentUser.uid,
            senderName: this.currentUser.displayName,
            timestamp: Date.now(),
            read: false
        };
        
        // Add message to database
        const newMessageRef = this.rtdb.ref(`messages/${chatId}`).push();
        await newMessageRef.set(message);
        
        // Update last message in chat document
        await this.db.collection('chats').doc(chatId).update({
            lastMessage: text,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Send message with API
        this.sendMessageViaAPI(message);
    }
    
    // Send message via API for live real-time communication
    sendMessageViaAPI(message) {
        const apiKey = 'gby65n65fpn76tus5qmh7ufkny7rn74yf6j6ugcd7kp7ew8tvqja4fvru4gtkna7';
        
        // Prepare data for API
        const data = {
            apiKey: apiKey,
            chatId: this.getChatId(this.currentChatUserId),
            message: message.text,
            senderId: message.senderId,
            receiverId: this.currentChatUserId,
            timestamp: message.timestamp
        };
        
        // Use the API to send message (In a real app, implement this as needed)
        console.log('Sending message via API:', data);
        
        // Example fetch implementation:
        /*
        fetch('https://yourapiendpoint.com/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => console.log('API response:', data))
        .catch(error => console.error('Error calling API:', error));
        */
    }
    
    // Scroll to bottom of messages container
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    // Clear chat session
    clearChatSession() {
        this.currentChatUserId = null;
        
        // Clear and hide chat header
        this.chatHeader.style.display = 'none';
        
        // Hide chat input
        this.chatInputContainer.style.display = 'none';
        
        // Show welcome message
        this.welcomeMessage.style.display = 'block';
        
        // Clear messages container
        this.messagesContainer.innerHTML = '';
        this.messagesContainer.appendChild(this.welcomeMessage);
        
        // Remove messages listener
        if (this.messagesListener) {
            this.messagesListener();
            this.messagesListener = null;
        }
    }
}
