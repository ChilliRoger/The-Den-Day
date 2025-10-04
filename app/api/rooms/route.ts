import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'
import { generateRoomCode } from '@/lib/webrtc'

export async function POST(request: NextRequest) {
  try {
    console.log('🏠 Creating new room...')
    const { host } = await request.json()
    console.log('👤 Host name:', host)
    
    if (!host || typeof host !== 'string' || host.trim().length === 0) {
      console.log('❌ Host name validation failed')
      return NextResponse.json(
        { error: 'Host name is required' },
        { status: 400 }
      )
    }

    console.log('🗄️ Connecting to database...')
    require('dotenv').config({ path: '.env.local' })
    await connectDB()

    let roomCode: string
    let attempt = 0
    const maxAttempts = 10

    // Generate unique room code
    console.log('🎲 Generating unique room code...')
    do {
      roomCode = generateRoomCode()
      console.log('🔍 Checking room code:', roomCode)
      const existingRoom = await Room.findOne({ code: roomCode })
      
      if (!existingRoom) {
        console.log('✅ Room code is unique:', roomCode)
        break
      }
      
      attempt++
      if (attempt >= maxAttempts) {
        console.error('❌ Failed to generate unique room code after', maxAttempts, 'attempts')
        return NextResponse.json(
          { error: 'Unable to generate unique room code. Please try again.' },
          { status: 500 }
        )
      }
      console.log('🔄 Room code taken, trying again. Attempt:', attempt)
    } while (true)

    // Create new room
    console.log('🏗️ Creating new room object...')
    const newRoom = new Room({
      code: roomCode,
      host: host.trim(),
      messages: [],
      partyState: {
        cakeCut: false,
        videoCallActive: false
      }
    })

    console.log('💾 Saving room to database...')
    await newRoom.save()
    console.log('✅ Room saved successfully with ID:', newRoom._id)

    return NextResponse.json({
      success: true,
      roomCode,
      roomId: newRoom._id
    })

  } catch (error) {
    console.error('Error creating room:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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
