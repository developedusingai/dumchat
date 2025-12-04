# Secret Chat App Setup Instructions

This is a private chat application for two users with disguised push notifications.

## Features
- Secure login with hardcoded credentials
- Text and image messaging
- Real-time message updates
- Push notifications disguised as shopping deals
- Image upload via Cloudinary
- MongoDB for message storage

## Prerequisites
1. MongoDB installed and running locally (or use MongoDB Atlas)
2. Cloudinary account
3. Node.js and npm installed

## Setup Steps

### 1. Configure MongoDB

If using local MongoDB:
```bash
# Start MongoDB service
brew services start mongodb-community
```

If using MongoDB Atlas:
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update MONGODB_URI in .env.local

### 2. Configure Cloudinary

1. Sign up at https://cloudinary.com/
2. Get your credentials from the dashboard
3. Update .env.local with:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

### 3. Update Environment Variables

Edit `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/secret-chat
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Note: VAPID keys are already generated and configured.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Login Credentials

**User 1:**
- Username: daddy
- Password: Lisban@2002

**User 2:**
- Username: Dum
- Password: Jenisa@2003

## How It Works

### Push Notifications
When a message is sent, the recipient receives a notification that says:
**"Sale 20% off on selected items! Grab now before they run out!"**

This disguises the real purpose of the notification. The recipient will understand it's a new message.

### Using the App

1. **Login**: Use one of the credentials above
2. **Grant Permission**: Allow notifications when prompted
3. **Chat**:
   - Type messages in the input field
   - Click the image icon to upload pictures
   - Messages appear in real-time
4. **Logout**: Click the logout button when done

## Security Notes

- This app uses hardcoded credentials for simplicity
- In production, use proper authentication
- Keep your .env.local file secure
- Never commit sensitive credentials to git

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `brew services list`
- Check connection string in .env.local
- Verify MongoDB port (default: 27017)

### Cloudinary Upload Issues
- Verify credentials in .env.local
- Check Cloudinary dashboard for errors
- Ensure file size is within limits

### Push Notifications Not Working
- Enable notifications in browser settings
- Check browser console for errors
- Ensure service worker is registered
- Try on a different device/browser

### Messages Not Appearing
- Check MongoDB connection
- Verify API routes are working
- Check browser console for errors

## Development Notes

- Messages poll every 3 seconds for updates
- Images are stored on Cloudinary
- Messages are stored in MongoDB
- Push notifications work on Chrome, Firefox, and Safari (iOS 16.4+)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari (iOS 16.4+)
- Edge

Note: Push notifications require HTTPS in production.
