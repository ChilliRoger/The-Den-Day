# 🎂 The Den - Virtual Birthday Parties

A complete Next.js 14+ web application for hosting virtual birthday parties with friends and family. Features real-time chat, video calls, and virtual cake cutting ceremonies.

## 🌟 Features

- **🏠 Party Rooms**: Create private party rooms with unique 6-character codes
- **💬 Real-time Chat**: Instant messaging powered by Socket.io
- **📹 Video Calls**: Peer-to-peer video calls using WebRTC (free!)
- **🎂 Cake Cutting**: Host-triggered virtual cake cutting ceremonies with animations
- **👥 Guest Management**: See who's connected and manage party attendees
- **📱 Responsive Design**: Mobile-friendly interface using Shadcn UI
- **🆓 Completely Free**: Uses only free and open-source technologies

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+, React 18, TypeScript
- **UI Library**: Shadcn UI components with Tailwind CSS
- **Real-time**: Socket.io for messaging and WebRTC signaling
- **Video**: WebRTC peer-to-peer connections
- **Animations**: Framer Motion for cake cutting effects
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS with custom animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier)
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd the-den-day
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/the-den?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 4. Install Additional Dependencies

Install Shadcn UI components:

```bash
npx shadcn@latest init
```

Add the required components:

```bash
npx shadcn@latest add button input card dialog tabs avatar tooltip toast
```

### 5. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string and replace the placeholder in `.env.local`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use)

### Hosting a Party

1. Click "Host a Party" on the homepage
2. Enter your name
3. Click "Create Party Room"
4. Share the 6-character code with guests
5. Start chatting, video calling, and celebrating!

### Joining a Party

1. Click "Join a Party" on the homepage
2. Enter the 6-character room code
3. Enter your name
4. Click "Join Party Room"
5. Start celebrating with friends and family!

### Features in Party Room

- **Chat Tab**: Send messages and see chat history
- **Video Call Tab**: Join video calls with multiple people
- **Cake Cutting**: Host can trigger animated cake cutting ceremony
- **User List**: See who's connected to the party

## 🎯 Key Features Explained

### Room Codes
- Generated 6-character alphanumeric codes (e.g., "ABC123")
- Unique codes to prevent conflicts
- Easy to share via text, social media, etc.

### Real-time Chat
- Powered by Socket.io
- Instant message delivery
- Shows timestamps and user names
- Messages persist during session

### Video Calls
- Peer-to-peer WebRTC connections
- No external servers needed
- Multiple participants supported
- Host can start/end calls

### Cake Cutting
- Host-only feature
- Broadcasts to all party members
- Animated cake with confetti and effects
- Uses Framer Motion for smooth animations

## 🏗️ Project Structure

```
the-den-day/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   └── rooms/        # Room management APIs
│   ├── create/            # Create party page
│   ├── join/              # Join party page
│   ├── room/[code]/       # Party room page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   └── CakeCut.tsx       # Cake cutting animation
├── hooks/                # Custom React hooks
│   └── use-toast.ts      # Toast notifications
├── lib/                  # Utilities
│   ├── mongodb.ts        # Database connection
│   ├── socket.ts         # Socket.io utilities
│   ├── utils.ts          # General utilities
│   └── webrtc.ts         # WebRTC utilities
├── models/               # Database models
│   └── Room.ts           # Room schema
├── pages/                # Pages directory
│   └── api/             # Socket.io API
└── server.js             # Socket.io server
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Base URL for authentication | Yes |
| `NEXTAUTH_SECRET` | Secret key for sessions | Yes |

### MongoDB Schema

```typescript
interface Room {
  code: string           // Unique 6-character code
  host: string          // Host name
  createdAt: Date       // Creation timestamp
  messages: Message[]   // Chat messages
  partyState: {         // Party state
    cakeCut: boolean
    videoCallActive: boolean
  }
}

interface Message {
  user: string
  text: string
  timestamp: Date
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## 🔧 Development

### Linting

```bash
npm run lint
npm run format
```

### Type Checking

```bash
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Common Issues

**Socket.io Connection Error**
- Ensure Socket.io server is running
- Check CORS settings
- Verify network connectivity

**Camera/Microphone Access Denied**
- Grant browser permissions
- Check HTTPS in production
- Try refreshing the page

**Database Connection Error**
- Verify MongoDB URI
- Check network firewall settings
- Ensure MongoDB cluster is running

**Video Call Not Working**
- Check browser WebRTC support
- Verify camera/mic permissions
- Try different browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for Shadcn UI components
- Socket.io for real-time communication
- MongoDB for the database
- All contributors and users

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the GitHub issues
3. Create a new issue with detailed information

---

**Made with ❤️ for virtual celebrations**
