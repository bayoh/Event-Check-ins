import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendee = await prisma.attendee.findUnique({
      where: { id: params.id }
    })

    if (!attendee) {
      return NextResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(attendee)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendee' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, category } = body

    const attendee = await prisma.attendee.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        category
      }
    })

    return NextResponse.json(attendee)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update attendee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.attendee.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Attendee deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete attendee' },
      { status: 500 }
    )
  }
} 