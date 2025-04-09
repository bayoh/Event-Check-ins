import { NextResponse } from 'next/server'
import  prisma  from '@/lib/prisma'

// Assign attendees to rooms
export async function POST(request: Request) {
  try {
    const { attendeeId, roomIds } = await request.json()

    // First, remove existing assignments for this attendee
    await prisma.attendeeRoom.deleteMany({
      where: {
        attendeeId,
      },
    })

    // Then create new assignments
    const assignments = await Promise.all(
      roomIds.map((roomId: string) =>
        prisma.attendeeRoom.create({
          data: {
            attendeeId,
            roomId,
          },
        })
      )
    )

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error assigning attendees to rooms:', error)
    return NextResponse.json(
      { error: 'Error assigning attendees to rooms' },
      { status: 500 }
    )
  }
}

// Get all assignments
export async function GET() {
  try {
    const assignments = await prisma.attendeeRoom.findMany({
      include: {
        attendee: true,
        room: true,
      },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Error fetching assignments' },
      { status: 500 }
    )
  }
} 