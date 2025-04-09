'use client'

import QRScanner from '@/components/QRScanner'

export default function ScannerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Check-in Scanner</h1>
        <p className="mt-2 text-gray-600">
          Scan attendee QR codes to check them into rooms
        </p>
      </div>

      <QRScanner />
    </div>
  )
} 