import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { attendeeIds } = await request.json()

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: params.id }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Create assignments for each attendee
    const assignments = await prisma.attendeeRoom.createMany({
      data: attendeeIds.map((attendeeId: string) => ({
        attendeeId,
        roomId: params.id
      })),
      skipDuplicates: true // Skip if assignment already exists
    })

    return NextResponse.json({
      message: `Successfully assigned ${assignments.count} attendees to room`,
      assignments
    })
  } catch (error) {
    console.error('Error assigning attendees:', error)
    return NextResponse.json(
      { error: 'Failed to assign attendees to room' },
      { status: 500 }
    )
  }
} 