'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Room {
  id: string
  name: string
  capacity: number | null
  assignedAttendees: {
    attendee: {
      id: string
      name: string
    }
  }[]
  checkIns: {
    attendee: {
      id: string
      name: string
    }
  }[]
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (!response.ok) throw new Error('Failed to fetch rooms')
      const data = await response.json()
      setRooms(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoom),
      })

      if (!response.ok) throw new Error('Failed to create room')

      const data = await response.json()
      setRooms([...rooms, data])
      setNewRoom({ name: '', capacity: '' })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Room Management</h2>
      
      {/* Add Room Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (optional)
            </label>
            <input
              type="number"
              value={newRoom.capacity}
              onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>

      {/* Rooms List */}
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{room.name}</h3>
                {room.capacity && (
                  <p className="text-sm text-gray-600">
                    Capacity: {room.capacity}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p>Assigned: {room.assignedAttendees.length}</p>
                <p>Checked In: {room.checkIns.length}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
} 