'use client'

import { Container, Title, Text, Button, Table, Badge, Group, LoadingOverlay } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Room {
  id: string
  name: string
  capacity: number | null
  _count: {
    checkIns: number
  }
  createdAt: string
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms')
        if (!response.ok) {
          throw new Error('Failed to fetch rooms')
        }
        const data = await response.json()
        setRooms(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  if (loading) {
    return (
      <Container size="xl">
        <LoadingOverlay visible={loading} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl">
        <Text c="red">{error}</Text>
      </Container>
    )
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Rooms</Title>
          <Text c="dimmed" size="sm">
            Manage your event rooms and their check-in status.
          </Text>
        </div>
        <Button
          component={Link}
          href="/rooms/new"
          leftSection={<IconPlus size={14} />}
          size="md"
        >
          Add New Room
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Room Name</Table.Th>
            <Table.Th>Capacity</Table.Th>
            <Table.Th>Current Check-ins</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rooms.map((room) => (
            <Table.Tr key={room.id}>
              <Table.Td>{room.name}</Table.Td>
              <Table.Td>{room.capacity || 'Unlimited'}</Table.Td>
              <Table.Td>{room._count.checkIns}</Table.Td>
              <Table.Td>
                <Badge 
                  color={room._count.checkIns > 0 ? 'green' : 'gray'} 
                  variant="light"
                >
                  {room._count.checkIns > 0 ? 'Active' : 'Available'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Button
                  component={Link}
                  href={`/rooms/${room.id}`}
                  variant="subtle"
                  size="xs"
                >
                  View
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
          {rooms.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5} ta="center">
                <Text c="dimmed">No rooms found. Create your first room to get started.</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Container>
  )
} 