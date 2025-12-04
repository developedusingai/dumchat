# Secret Chat App

A private, secure chat application for two users with disguised push notifications that appear as shopping deal alerts.

## Features

- **Private Authentication**: Hardcoded credentials for two specific users
- **Real-time Messaging**: Text and image messages with automatic updates
- **Disguised Notifications**: Push notifications appear as "Sale 20% off" alerts
- **Image Sharing**: Upload and share images via Cloudinary
- **Mobile-Friendly**: Responsive design that works on all devices
- **Secure**: Messages stored in MongoDB, images on Cloudinary

## Quick Start

### Prerequisites
1. MongoDB (local or Atlas)
2. Cloudinary account (free tier is fine)
3. Node.js installed

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**

Edit `.env.local` and add your credentials:
- MongoDB connection string (or use the default local connection)
- Cloudinary credentials from your dashboard

3. **Start MongoDB** (if using local)
```bash
brew services start mongodb-community
# or
mongod
```

4. **Run the app**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Login Credentials

**User 1**
- Username: `daddy`
- Password: `Lisban@2002`

**User 2**
- Username: `Dum`
- Password: `Jenisa@2003`

## How to Use

1. **Login** with one of the credentials above
2. **Allow notifications** when prompted (important!)
3. **Start chatting**:
   - Type messages in the input field
   - Click the image icon to upload pictures
   - Messages update automatically every 3 seconds
4. **Logout** when done

## The Secret Feature

When you send a message, the other person receives a notification that says:

> **"Sale Alert!"**
> "Sale 20% off on selected items! Grab now before they run out!"

This disguises the notification as a shopping deal, so no one will suspect it's actually a chat message!

## Setup Guide

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## Configuring Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to your dashboard
3. Copy these values to `.env.local`:
   - Cloud Name
   - API Key
   - API Secret

## Technology Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Notifications**: Web Push API with service workers

## Project Structure

```
dum-chat/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Login endpoint
│   │   ├── messages/     # Message CRUD
│   │   ├── notifications/ # Push subscription
│   │   └── upload/       # Image upload
│   ├── chat/             # Chat page
│   ├── layout.js         # Root layout
│   └── page.js           # Login page
├── lib/
│   ├── mongodb.js        # MongoDB connection
│   └── models.js         # Data models
├── public/
│   ├── sw.js            # Service worker
│   └── manifest.json    # PWA manifest
└── .env.local           # Environment variables
```

## Important Notes

- **Privacy**: This app is designed for two specific users only
- **Notifications**: Require HTTPS in production
- **Browser Support**: Works on Chrome, Firefox, Safari (iOS 16.4+)
- **Security**: Never commit `.env.local` to version control

## Troubleshooting

**MongoDB won't connect?**
- Check if MongoDB is running: `brew services list`
- Verify the connection string in `.env.local`

**Images won't upload?**
- Verify Cloudinary credentials
- Check browser console for errors

**No notifications?**
- Make sure you allowed notifications
- Check browser notification settings
- Try a different browser

**Messages not appearing?**
- Verify MongoDB is running
- Check browser console for errors
- Refresh the page

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Security Notice

This app uses hardcoded credentials for simplicity. In a production environment, you should:
- Use proper authentication (JWT, sessions, etc.)
- Hash passwords
- Implement rate limiting
- Add CSRF protection
- Use HTTPS

## License

Private use only.
