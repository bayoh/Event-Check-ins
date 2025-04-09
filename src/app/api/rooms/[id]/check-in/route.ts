import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
// Removed import statement as per instructions

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { publicId } = await req.json()

    if (!publicId) {
      return NextResponse.json(
        { error: 'Attendee ID is required' },
        { status: 400 }
      )
    }

    // Find the attendee by public ID
    const attendee = await prisma.attendee.findUnique({
      where: { publicID: publicId},
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!attendee) {
      return NextResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }

    // Check if attendee is assigned to the room
    const assignment = await prisma.attendeeRoom.findFirst({
      where: {
        roomId: params.id,
        attendeeId: attendee.id,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Attendee is not assigned to this room' },
        { status: 403 }
      )
    }

    // Check if attendee is already checked in
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        roomId: params.id,
        attendeeId: attendee.id,
        checkedOutAt: null,
      },
    })

    if (existingCheckIn) {
      return NextResponse.json(
        { message: 'Attendee is already checked in' },
        { status: 400 }
      )
    }

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        roomId: params.id,
        attendeeId: attendee.id,
        checkedInAt: new Date(),
      },
      include: {
        attendee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Check-in successful',
      attendeeName: `${checkIn.attendee.firstName} ${checkIn.attendee.lastName}`,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
} 