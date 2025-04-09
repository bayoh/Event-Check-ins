import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const attendees = await prisma.attendee.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(attendees)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, category, publicID } = body

    const attendee = await prisma.attendee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        category,
        publicID,
        status: 'active'
      }
    })

    return NextResponse.json(attendee)
  } catch (error) {
    console.error('Error creating attendee:', error)
    return NextResponse.json(
      { error: 'Failed to create attendee' },
      { status: 500 }
    )
  }
} 