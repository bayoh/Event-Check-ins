'use client'

import { useState } from 'react'
import { Container, Title, Text, Button, Group, Stack, Card, Select, TextInput, Badge } from '@mantine/core'
import { IconQrcode, IconSearch, IconCheck } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

interface Room {
  id: string
  name: string
  capacity: number
  currentAttendees: number
}

interface Attendee {
  id: string
  name: string
  email: string
  publicID: string
  status: 'active' | 'inactive'
  lastCheckIn?: string
}

export default function CheckInPage() {
  const [rooms] = useState<Room[]>([
    { id: '1', name: 'Main Hall', capacity: 100, currentAttendees: 45 },
    { id: '2', name: 'Conference Room A', capacity: 50, currentAttendees: 30 },
    { id: '3', name: 'Workshop Room B', capacity: 30, currentAttendees: 15 },
  ])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scannedAttendee, setScannedAttendee] = useState<Attendee | null>(null)

  const handleQRCodeScan = () => {
    // This would typically use a QR code scanner library
    // For demo purposes, we'll simulate a scan
    const mockAttendee: Attendee = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      publicID: 'A-ETSJKD',
      status: 'active',
      lastCheckIn: '2024-04-10 10:30 AM'
    }
    setScannedAttendee(mockAttendee)
  }

  const handleCheckIn = () => {
    if (selectedRoom && scannedAttendee) {
      // Here you would typically make an API call to record the check-in
      notifications.show({
        title: 'Check-in Successful',
        message: `${scannedAttendee.name} has been checked into ${rooms.find(r => r.id === selectedRoom)?.name}`,
        color: 'green',
        icon: <IconCheck size={14} />
      })
      setScannedAttendee(null)
      setSelectedRoom(null)
    }
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Check-in Attendees</Title>
          <Text c="dimmed" size="sm">
            Scan QR codes or search for attendees to check them into rooms.
          </Text>
        </div>
      </Group>

      <Stack>
        <Card withBorder>
          <Stack>
            <Group>
              <Button
                leftSection={<IconQrcode size={14} />}
                onClick={handleQRCodeScan}
              >
                Scan QR Code
              </Button>
              <TextInput
                placeholder="Search by name or ID"
                leftSection={<IconSearch size={14} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
            </Group>

            {scannedAttendee && (
              <Card withBorder>
                <Stack>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{scannedAttendee.name}</Text>
                      <Text size="sm" c="dimmed">{scannedAttendee.email}</Text>
                    </div>
                    <Badge color={scannedAttendee.status === 'active' ? 'green' : 'red'}>
                      {scannedAttendee.status}
                    </Badge>
                  </Group>
                  <Text size="sm">ID: {scannedAttendee.publicID}</Text>
                  {scannedAttendee.lastCheckIn && (
                    <Text size="sm" c="dimmed">
                      Last Check-in: {scannedAttendee.lastCheckIn}
                    </Text>
                  )}
                </Stack>
              </Card>
            )}

            <Select
              label="Select Room"
              placeholder="Choose a room"
              data={rooms.map(room => ({
                value: room.id,
                label: `${room.name} (${room.currentAttendees}/${room.capacity})`
              }))}
              value={selectedRoom}
              onChange={setSelectedRoom}
            />

            <Button
              onClick={handleCheckIn}
              disabled={!selectedRoom || !scannedAttendee}
              leftSection={<IconCheck size={14} />}
            >
              Check In
            </Button>
          </Stack>
        </Card>

        <Card withBorder>
          <Title order={2} size="h4" mb="md">Recent Check-ins</Title>
          <Stack>
            {[1, 2, 3].map((item) => (
              <Group key={item} justify="space-between">
                <div>
                  <Text fw={500}>John Doe</Text>
                  <Text size="sm" c="dimmed">Main Hall</Text>
                </div>
                <Text size="sm" c="dimmed">10:30 AM</Text>
              </Group>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
} 