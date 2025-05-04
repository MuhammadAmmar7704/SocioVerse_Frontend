import React, { useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import UserContext from '../../Context/userContext/createContext';
import axios from 'axios';

const Chat = () => {
  const { user } = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messageContainerRef = useRef(null);

  console.log('Current user:', user); // Debug log

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!socket || !user) return;

    const userId = user?.userID || user?.user_id;
    console.log('Connecting user to socket:', userId, user.username); // Debug log

    // Connect user
    socket.emit('user_connected', {
      userId: userId,
      name: user.username
    });

    // Get online users
    socket.on('users_list', (usersList) => {
      console.log('Received users list:', usersList); // Debug log
      setUsers((prevUsers) => {
        // Keep existing user data and update with online status
        const updatedUsers = prevUsers.map(user => {
          const onlineUser = usersList.find(u => u.userId === user.user_id);
          return {
            ...user,
            isOnline: Boolean(onlineUser)
          };
        });
        return updatedUsers;
      });
    });

    // Handle incoming messages
    socket.on('new_message', (data) => {
      if (selectedUser && data.fromUserId === selectedUser.user_id) {
        setMessages(prevMessages => [...prevMessages, {
          id: data.messageId,
          content: data.content,
          from_user_id: data.fromUserId,
          to_user_id: userId,
          created_at: data.timestamp,
          isOwn: false
        }]);
      }
    });

    // Handle message history
    socket.on('message_history', (data) => {
      console.log('Received message history:', data); // Debug log
      const formattedMessages = data.messages.map(msg => ({
        ...msg,
        isOwn: msg.from_user_id === userId
      }));
      setMessages(formattedMessages);
      setLoading(false);
    });

    return () => {
      socket.off('users_list');
      socket.off('new_message');
      socket.off('message_history');
    };
  }, [socket, user, selectedUser]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Attempting to fetch users with user:', user);
        const res = await axios.get('/api/auth/users', {
          withCredentials: true
        });
        console.log('Raw API response:', res);
        if (res.data && Array.isArray(res.data)) {
          console.log('Users fetched successfully:', res.data.length, 'users');
          setUsers(res.data.map(user => ({ ...user, isOnline: false })));
        } else {
          console.error('API returned unexpected data format:', res.data);
          setError('Received invalid data format from server');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Show more detailed error information
        const errorMsg = error.response 
          ? `Error ${error.response.status}: ${error.response.data.message || error.response.statusText}` 
          : 'Network error connecting to server';
        setError(errorMsg);
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    setLoading(true);
    setMessages([]);
    
    if (socket && user) {
      const userId = user?.userID || user?.user_id;
      console.log('Getting message history with:', selectedUser.user_id); // Debug log
      socket.emit('get_message_history', {
        userId: userId,
        otherUserId: selectedUser.user_id
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !socket || !user) return;

    const userId = user?.userID || user?.user_id;
    const messageData = {
      content: message,
      fromUserId: userId,
      toUserId: selectedUser.user_id
    };

    console.log('Sending message:', messageData); // Debug log
    socket.emit('private_message', messageData);

    // Optimistically add message to the UI
    setMessages(prevMessages => [...prevMessages, {
      id: 'temp-' + Date.now(),
      content: message,
      from_user_id: userId,
      to_user_id: selectedUser.user_id,
      created_at: new Date().toISOString(),
      isOwn: true
    }]);

    setMessage('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)] bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading User Data</h2>
          <p className="text-gray-600 mb-2">Please wait while we load your profile information.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-150px)] bg-gray-100">
      {/* Users sidebar */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {loading && users.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-gray-500">No users found</div>
          ) : (
            users.map((u) => (
              <div
                key={u.user_id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-100 flex items-center ${
                  selectedUser && selectedUser.user_id === u.user_id ? 'bg-gray-200' : ''
                }`}
                onClick={() => handleUserSelect(u)}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold mr-3">
                  {u.username ? u.username[0].toUpperCase() : '?'}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{u.username}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${u.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b bg-white flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold mr-3">
                {selectedUser.username[0].toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{selectedUser.username}</div>
                <div className="text-xs text-gray-500">{selectedUser.isOnline ? 'Online' : 'Offline'}</div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={messageContainerRef}
              className="flex-1 p-4 overflow-y-auto"
            >
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Start a conversation with {selectedUser.username}
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.isOwn 
                          ? 'bg-indigo-500 text-white rounded-br-none' 
                          : 'bg-white border rounded-bl-none'
                      }`}
                    >
                      <div>{msg.content}</div>
                      <div className={`text-xs mt-1 ${msg.isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={sendMessage} className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-indigo-500 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-600"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-center items-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-500 mb-2">Select a user to start chatting</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 