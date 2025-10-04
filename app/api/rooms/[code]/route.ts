import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'

interface RoomParams {
  params: { code: string }
}

export async function GET(request: NextRequest, { params }: RoomParams) {
  try {
    const code = params.code.toUpperCase()
    
    if (!code || code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    await connectDB()

    const room = await Room.findOne({ code }).select(
      'code host createdAt messages partyState'
    )

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      room: {
        code: room.code,
        host: room.host,
        createdAt: room.createdAt,
        messageCount: room.messages.length,
        partyState: room.partyState
      }
    })

  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RoomParams) {
  try {
    const code = params.code.toUpperCase()
    const { partyState } = await request.json()
    
    if (!code || code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
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

    // Update party state
    if (partyState) {
      room.partyState = { ...room.partyState, ...partyState }
      await room.save()
    }

    return NextResponse.json({
      success: true,
      room: {
        code: room.code,
        host: room.host,
        createdAt: room.createdAt,
        messageCount: room.messages.length,
        partyState: room.partyState
      }
    })

  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RoomParams) {
  try {
    const code = params.code.toUpperCase()
    
    if (!code || code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    await connectDB()

    const result = await Room.findOneAndDelete({ code })

    if (!result) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
