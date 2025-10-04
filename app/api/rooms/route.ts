import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'
import { generateRoomCode } from '@/lib/webrtc'

export async function POST(request: NextRequest) {
  try {
    const { host } = await request.json()
    
    if (!host || typeof host !== 'string' || host.trim().length === 0) {
      return NextResponse.json(
        { error: 'Host name is required' },
        { status: 400 }
      )
    }

    await connectDB()

    let roomCode: string
    let attempt = 0
    const maxAttempts = 10

    // Generate unique room code
    do {
      roomCode = generateRoomCode()
      const existingRoom = await Room.findOne({ code: roomCode })
      
      if (!existingRoom) {
        break
      }
      
      attempt++
      if (attempt >= maxAttempts) {
        return NextResponse.json(
          { error: 'Unable to generate unique room code. Please try again.' },
          { status: 500 }
        )
      }
    } while (true)

    // Create new room
    const newRoom = new Room({
      code: roomCode,
      host: host.trim(),
      messages: [],
      partyState: {
        cakeCut: false,
        videoCallActive: false
      }
    })

    await newRoom.save()

    return NextResponse.json({
      success: true,
      roomCode,
      roomId: newRoom._id
    })

  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectDB()
    
    // Get all rooms (for debugging purposes only - remove in production)
    const rooms = await Room.find({})
      .select('code host createdAt messages.length partyState')
      .sort({ createdAt: -1 })
      .limit(50)
    
    return NextResponse.json({
      success: true,
      rooms: rooms.map(room => ({
        code: room.code,
        host: room.host,
        createdAt: room.createdAt,
        messageCount: room.messages.length,
        cakeCut: room.partyState?.cakeCut || false
      }))
    })

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
