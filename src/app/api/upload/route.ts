import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Readable } from 'stream'
import { parse } from 'csv-parse'
import * as XLSX from 'xlsx'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    let attendees: { firstName: string; lastName: string; email: string; category: string, publicID: string }[] = []

    if (file.name.endsWith('.csv')) {
      const records = await new Promise((resolve, reject) => {
        const parser = parse(buffer, {
          columns: true,
          skip_empty_lines: true,
        })
        const records: any[] = []
        parser.on('readable', function () {
          let record
          while ((record = parser.read())) {
            records.push(record)
          }
        })
        parser.on('error', reject)
        parser.on('end', () => resolve(records))
      })

      attendees = records.map((record: any) => ({
        firstName: record.firstName || record['First Name'] || '',
        lastName: record.lastName || record['Last Name'] || '',
        email: record.email || record.Email || '',
        publicID: record.publicID || record['public ID'] || record['Public ID'] || '',
        category,
      }))
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const workbook = XLSX.read(buffer)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const records = XLSX.utils.sheet_to_json(worksheet)
      console.log(records)

      attendees = records.map((record: any) => ({
        firstName: record.firstName || record['First Name'] || '',
        lastName: record.lastName || record['Last Name'] || '',
        email: record.email || record.Email || '',
        publicID: record.publicID || record['public ID'] || record['Public ID']  || '',
        category,
      }))
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a CSV or Excel file.' },
        { status: 400 }
      )
    }

    // Validate all records before creating
    const validAttendees = attendees.filter(attendee => 
      attendee.firstName && attendee.lastName && attendee.publicID
    )

    if (validAttendees.length === 0) {
      return NextResponse.json(
        { error: 'No valid attendees found in the file' },
        { status: 400 }
      )
    }

    // Create attendees in batches
    const batchSize = 100
    const createdAttendees = []
    const errors = []

    for (let i = 0; i < validAttendees.length; i += batchSize) {
      const batch = validAttendees.slice(i, i + batchSize)
      console.log(batch)
      try {
        const result = await prisma.attendee.createMany({
          data: batch,
          skipDuplicates: true,
        })
        createdAttendees.push(...batch)
      } catch (error) {
        errors.push({
          batch: i / batchSize + 1,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${createdAttendees.length} attendees`,
      total: validAttendees.length,
      created: createdAttendees.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
} 