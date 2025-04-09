import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all rooms
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        createdAt: 'desc'
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
        }
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST new room
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, capacity } = body

    const room = await prisma.room.create({
      data: {
        name,
        capacity: capacity ? parseInt(capacity) : null
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
} 