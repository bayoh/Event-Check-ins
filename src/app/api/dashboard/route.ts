import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get total attendees count
    const totalAttendees = await prisma.attendee.findMany()
    console.log(totalAttendees.length)
    // Get active rooms count
    const activeRooms = await prisma.room.findMany()
    console.log(activeRooms)

    // Get today's check-ins count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const checkInsToday = await prisma.checkIn.findMany({
      where: {
        checkedInAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    console.log(checkInsToday)

    // Get recent check-ins with attendee and room details
    const recentCheckIns = await prisma.checkIn.findMany({
      include: {
        attendee: {
          select: {
            firstName: true
          }
        },
        room: {
          select: {
            name: true
          }
        }
      }
    })
    console.log(recentCheckIns)

    return NextResponse.json({
      totalAttendees,
      activeRooms,
      checkInsToday,
      recentCheckIns
    })
  } catch (error) {
    console.log(error)
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 