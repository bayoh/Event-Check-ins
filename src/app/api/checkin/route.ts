import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { attendeeId, roomId } = await request.json()

    // Verify that the attendee is assigned to the room
    const assignment = await prisma.attendeeRoom.findFirst({
      where: {
        attendeeId,
        roomId,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { message: 'Attendee is not assigned to this room' },
        { status: 403 }
      )
    }

    // Check if attendee is already checked in to any room
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        attendeeId,
        checkedOutAt: null,
      },
    })

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'Attendee is already checked in to another room' },
        { status: 400 }
      )
    }

    // Create the check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        attendeeId,
        roomId,
      },
      include: {
        attendee: true,
        room: true,
      },
    })

    return NextResponse.json(checkIn)
  } catch (error) {
    console.error('Error processing check-in:', error)
    return NextResponse.json(
      { error: 'Error processing check-in' },
      { status: 500 }
    )
  }
}

// Check out an attendee
export async function PUT(request: Request) {
  try {
    const { attendeeId } = await request.json()

    const checkIn = await prisma.checkIn.updateMany({
      where: {
        attendeeId,
        checkedOutAt: null,
      },
      data: {
        checkedOutAt: new Date(),
      },
    })

    return NextResponse.json(checkIn)
  } catch (error) {
    console.error('Error processing check-out:', error)
    return NextResponse.json(
      { error: 'Error processing check-out' },
      { status: 500 }
    )
  }
} 