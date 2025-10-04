import { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Socket is initializing')
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socketio',
    addTrailingSlash: false
  })

  res.socket.server.io = io

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Join room event
    socket.on('join-room', (roomCode, userName) => {
      socket.join(roomCode)
      socket.data.room = roomCode
      socket.data.userName = userName
      
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
      console.log(`Client disconnected: ${socket.id}`)
      if (socket.data.room) {
        socket.to(socket.data.room).emit('user-left', socket.id)
      }
    })
  })

  res.end()
}
