'use client'

import ExcelUpload from '@/components/ExcelUpload'

export default function UploadPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Attendees</h1>
        <p className="mt-2 text-gray-600">
          Upload an Excel file containing attendee information
        </p>
      </div>

      <ExcelUpload />
    </div>
  )
} 