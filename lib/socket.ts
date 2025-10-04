import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Socket as NetSocket } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: NetSocket & {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export interface SocketMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left' | 'message' | 'cake-cut'
  data: any
  room: string
  from?: string
}

import { NextApiResponse } from 'next'
