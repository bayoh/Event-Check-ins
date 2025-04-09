'use client'

import { Container, Title, Text, Card, Group, Button, Table, Badge, LoadingOverlay, Stack, ActionIcon, Modal, MultiSelect, Select } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { IconTrash, IconQrcode, IconUsersPlus } from '@tabler/icons-react'
import Link from 'next/link'

interface Room {
  id: string
  name: string
  capacity: number | null
  _count: {
    checkIns: number
  }
  checkIns: Array<{
    id: string
    checkedInAt: string
    attendee: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }>
  assignedAttendees: Array<{
    id: string
    assignedAt: string
    attendee: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }>
}

interface Attendee {
  id: string
  firstName: string
  lastName: string
  email: string
}

export default function ViewRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch room details
        const roomResponse = await fetch(`/api/rooms/${params.id}`)
        if (!roomResponse.ok) {
          throw new Error('Failed to fetch room')
        }
        const roomData = await roomResponse.json()
        setRoom(roomData)

        // Fetch all attendees
        const attendeesResponse = await fetch('/api/attendees')
        if (!attendeesResponse.ok) {
          throw new Error('Failed to fetch attendees')
        }
        const attendeesData = await attendeesResponse.json()
        setAttendees(attendeesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete room')
      }

      notifications.show({
        title: 'Success',
        message: 'Room deleted successfully',
        color: 'green',
      })

      router.push('/rooms')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete room. Please try again.',
        color: 'red',
      })
    }
  }

  const handleAssignAttendees = async () => {
    if (selectedAttendees.length === 0) return

    setAssigning(true)
    try {
      const response = await fetch(`/api/rooms/${params.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendeeIds: selectedAttendees }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign attendees')
      }

      const data = await response.json()
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green',
      })

      // Refresh room data
      const roomResponse = await fetch(`/api/rooms/${params.id}`)
      if (roomResponse.ok) {
        const roomData = await roomResponse.json()
        setRoom(roomData)
      }

      setAssignModalOpen(false)
      setSelectedAttendees([])
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to assign attendees. Please try again.',
        color: 'red',
      })
    } finally {
      setAssigning(false)
    }
  }

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

  if (!room) {
    return (
      <Container size="xl">
        <Text>Room not found</Text>
      </Container>
    )
  }

  const attendeeOptions = attendees
    .filter(attendee => 
      !room.checkIns?.some(checkIn => checkIn.attendee.id === attendee.id) &&
      !room.assignedAttendees?.some(assigned => assigned.attendee.id === attendee.id)
    )
    .map(attendee => ({
      value: attendee.id,
      label: `${attendee.firstName} ${attendee.lastName}`
    }))

  return (
    <Container size="xl">
      <Stack>
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1}>{room.name}</Title>
            <Text c="dimmed" size="sm">
              Room Details and Current Check-ins
            </Text>
          </div>
          <Group>
            <Button
              component={Link}
              href={`/rooms/${room.id}/check-in`}
              leftSection={<IconQrcode size={14} />}
            >
              Check-in Attendee
            </Button>
            <Button
              leftSection={<IconUsersPlus size={14} />}
              onClick={() => setAssignModalOpen(true)}
            >
              Assign Attendees
            </Button>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => setDeleteModalOpen(true)}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>

        <Card withBorder>
          <Stack>
            <Group>
              <div>
                <Text fw={500}>Capacity</Text>
                <Text size="sm" c="dimmed">
                  {room.capacity || 'Unlimited'}
                </Text>
              </div>
              <div>
                <Text fw={500}>Current Check-ins</Text>
                <Text size="sm" c="dimmed">
                  {room._count.checkIns}
                </Text>
              </div>
            </Group>

            <div>
              <Text fw={500} mb="sm">Current Attendees</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {room.assignedAttendees?.map((assignment) => (
                    <Table.Tr key={assignment.id}>
                      <Table.Td>{`${assignment.attendee.firstName} ${assignment.attendee.lastName}`}</Table.Td>
                      <Table.Td>{assignment.attendee.email}</Table.Td>
                      <Table.Td>
                        <Badge color="blue">Assigned</Badge>
                      </Table.Td>
                      <Table.Td>
                        {new Date(assignment.assignedAt).toLocaleString()}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {room.checkIns.map((checkIn) => (
                    <Table.Tr key={checkIn.id}>
                      <Table.Td>{`${checkIn.attendee.firstName} ${checkIn.attendee.lastName}`}</Table.Td>
                      <Table.Td>{checkIn.attendee.email}</Table.Td>
                      <Table.Td>
                        <Badge color="green">Checked In</Badge>
                      </Table.Td>
                      <Table.Td>
                        {new Date(checkIn.checkedInAt).toLocaleString()}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {room.assignedAttendees?.length === 0 && room.checkIns.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={4} ta="center">
                        <Text c="dimmed">No attendees in this room</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </div>
          </Stack>
        </Card>
      </Stack>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Room"
        centered
      >
        <Stack>
          <Text>Are you sure you want to delete this room? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Attendees"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Select attendees to assign to this room. They will be able to check in to this room.
          </Text>
          
          <MultiSelect
            label="Select Attendees"
            placeholder="Search and select attendees"
            data={attendeeOptions}
            value={selectedAttendees}
            onChange={setSelectedAttendees}
            searchable
            clearable
            maxDropdownHeight={300}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignAttendees}
              loading={assigning}
              disabled={selectedAttendees.length === 0}
            >
              Assign Selected
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
} 