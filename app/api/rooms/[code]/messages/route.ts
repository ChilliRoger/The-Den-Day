import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'

interface MessageParams {
  params: { code: string }
}

export async function GET(request: NextRequest, { params }: MessageParams) {
  try {
    const code = params.code.toUpperCase()
    
    if (!code || code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    await connectDB()

    const room = await Room.findOne({ code }).select('messages')

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: room.messages || []
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: MessageParams) {
  try {
    const code = params.code.toUpperCase()
    const { user, text } = await request.json()
    
    if (!code || code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    if (!user || !text || typeof user !== 'string' || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'User name and message text are required' },
        { status: 400 }
      )
    }

    if (user.trim().length === 0 || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'User name and message text cannot be empty' },
        { status: 400 }
      )
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Message text is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    await connectDB()

    const room = await Room.findOne({ code })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Add message to room
    const message = {
      user: user.trim(),
      text: text.trim(),
      timestamp: new Date()
    }

    room.messages.push(message)
    await room.save()

    return NextResponse.json({
      success: true,
      message: {
        id: `msg_${room.messages.length - 1}`,
        ...message,
        timestamp: message.timestamp.toISOString()
      }
    })

  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
