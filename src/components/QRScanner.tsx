'use client'

import { useState, useEffect, useRef } from 'react'
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'
import { Result } from '@zxing/library'

interface Attendee {
  id: string
  name: string
  email: string
  ticketNumber: string
  assignedRooms: {
    room: {
      id: string
      name: string
    }
  }[]
}

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanner, setScanner] = useState<IScannerControls | null>(null)
  const [attendee, setAttendee] = useState<Attendee | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const startScanner = async () => {
      try {
        const codeReader = new BrowserQRCodeReader()
        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          ((result: Result | undefined) => {
            if (result) {
              handleQRCode(result.getText())
            }
          }) as any
        )
        setScanner(controls)
      } catch (err) {
        setError('Failed to initialize scanner')
        console.error(err)
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        scanner.stop()
      }
    }
  }, [])

  const handleQRCode = async (text: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch attendee data based on QR code content
      const response = await fetch(`/api/attendees/${text}`)
      if (!response.ok) throw new Error('Attendee not found')

      const data = await response.json()
      setAttendee(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!attendee || !selectedRoom) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeId: attendee.id,
          roomId: selectedRoom,
        }),
      })

      if (!response.ok) throw new Error('Failed to check in')

      // Reset state after successful check-in
      setAttendee(null)
      setSelectedRoom('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">QR Code Scanner</h2>

      {/* Video Preview */}
      <div className="mb-6">
        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-md"
          style={{ maxHeight: '400px' }}
        />
      </div>

      {/* Attendee Info */}
      {attendee && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">{attendee.name}</h3>
          <p className="text-gray-600 mb-4">{attendee.email}</p>

          {/* Room Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a room</option>
              {attendee.assignedRooms.map(({ room }) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={!selectedRoom || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking in...' : 'Check In'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
} 