'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ChatPage() {
  const [user, setUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationError, setNotificationError] = useState('');
  const [settingUpNotifications, setSettingUpNotifications] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const setupNotificationSubscription = useCallback(async (username) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        console.error('VAPID public key is not configured');
        setNotificationError('Notification service is not configured');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      });

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, subscription })
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to notifications');
      }
    } catch (error) {
      console.error('Notification setup error:', error);
      setNotificationError('Failed to set up notifications. Please try again.');
    }
  }, []);

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) {
      router.push('/');
      return;
    }
    setUser(loggedUser);
    
    // Check existing notification permission status
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      // If already granted, set up service worker and subscription
      if (Notification.permission === 'granted') {
        setupNotificationSubscription(loggedUser);
      }
    }
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [router, setupNotificationSubscription]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationError('Your browser does not support notifications');
      return;
    }

    setSettingUpNotifications(true);
    setNotificationError('');

    try {
      // Request permission (must be called from user gesture on mobile)
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        await setupNotificationSubscription(user);
      } else if (permission === 'denied') {
        setNotificationError('Notifications were blocked. Please enable them in your browser settings.');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      setNotificationError('Failed to request notification permission. Please try again.');
    } finally {
      setSettingUpNotifications(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: user,
          content: newMessage,
          type: 'text'
        })
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: user,
            content: 'Image',
            type: 'image',
            imageUrl: uploadData.url
          })
        });

        await fetchMessages();
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <div className="bg-white shadow-lg px-6 py-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Shopping Deals</h1>
            <p className="text-sm text-gray-600">Logged in as: {user}</p>
          </div>
          <div className="flex gap-2 items-center">
            {notificationPermission !== 'granted' && 'Notification' in window && (
              <button
                onClick={handleEnableNotifications}
                disabled={settingUpNotifications}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Enable notifications to receive sale alerts"
              >
                {settingUpNotifications ? 'Enabling...' : '🔔 Enable Notifications'}
              </button>
            )}
            {notificationPermission === 'granted' && (
              <span className="text-sm text-green-600 font-medium">✓ Notifications Enabled</span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {notificationError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{notificationError}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotificationError('')}
                  className="text-yellow-400 hover:text-yellow-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`flex ${msg.from === user ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  msg.from === user
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold opacity-75">
                    {msg.from}
                  </span>
                  <span className="text-xs opacity-50">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {msg.type === 'image' ? (
                  <div className="mt-2">
                    <Image
                      src={msg.imageUrl}
                      alt="Shared image"
                      width={300}
                      height={300}
                      className="rounded-lg"
                    />
                    {msg.content && msg.content !== 'Image' && (
                      <p className="mt-2">{msg.content}</p>
                    )}
                  </div>
                ) : (
                  <p className="break-words">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white shadow-lg px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200 disabled:opacity-50"
              title="Upload image"
            >
              {uploading ? (
                <span className="text-sm">...</span>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
