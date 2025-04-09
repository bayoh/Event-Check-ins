import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            checkIns: {
              where: {
                checkedOutAt: null
              }
            }
          }
        },
        checkIns: {
          where: {
            checkedOutAt: null
          },
          include: {
            attendee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            checkedInAt: 'desc'
          }
        },
        assignedAttendees: {
          include: {
            attendee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    console.log(room)
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.room.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
} 