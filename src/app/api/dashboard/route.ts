import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {

    const [totalAttendees, activeRooms, checkInsToday, recentCheckIns] = await Promise.all([
      prisma.attendee.findMany(),
      prisma.room.count(),
      prisma.checkIn.count({
        where: {
          checkedInAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.checkIn.findMany({
        take: 5,
        orderBy: {
          checkedInAt: 'desc'
        },
        include: {
          attendee: {
            select: {
              name: true
            }
          },
          room: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      totalAttendees,
      activeRooms,
      checkInsToday,
      recentCheckIns
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 