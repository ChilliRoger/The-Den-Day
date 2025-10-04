const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  })

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join room
    socket.on('join-room', (roomCode, userName) => {
      socket.join(roomCode)
      socket.data.room = roomCode
      socket.data.userName = userName
      socket.data.isHost = false // This would be determined by checking if they created the room

      // Notify others in the room
      socket.to(roomCode).emit('user-joined', {
        id: socket.id,
        name: userName,
        isHost: false
      })

      console.log(`${userName} joined room ${roomCode}`)
    })

    // Handle messages
    socket.on('message', (message) => {
      if (socket.data.room) {
        io.to(socket.data.room).emit('message', message)
        console.log(`Message from ${socket.data.userName}: ${message.text}`)
      }
    })

    // Handle WebRTC offers
    socket.on('offer', (data) => {
      socket.to(data.to).emit('offer', {
        from: socket.id,
        offer: data.offer
      })
    })

    // Handle WebRTC answers
    socket.on('answer', (data) => {
      socket.to(data.to).emit('answer', {
        from: socket.id,
        answer: data.answer
      })
    })

    // Handle ICE candidates
    socket.on('ice-candidate', (data) => {
      socket.to(data.to).emit('ice-candidate', {
        from: socket.id,
        candidate: data.candidate
      })
    })

    // Handle cake cutting
    socket.on('cut-cake', (roomCode) => {
      io.to(roomCode).emit('cake-cut')
      console.log(`Cake cutting ceremony initiated in room ${roomCode}`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
      if (socket.data.room) {
        socket.to(socket.data.room).emit('user-left', socket.id)
      }
    })
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
