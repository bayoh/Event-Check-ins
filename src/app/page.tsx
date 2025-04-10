'use client'

import { Container, Title, Text, Button, Group, SimpleGrid, Card, Badge, Stack, LoadingOverlay } from '@mantine/core'
import { IconUsers, IconBuilding, IconClock } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalAttendees: Array<{}>
  activeRooms: number
  checkInsToday: number
  recentCheckIns: Array<{
    id: string
    attendee: {
      name: string
    }
    room: {
      name: string
    }
    checkedInAt: string
  }>
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
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
          <Title order={1}>Dashboard</Title>
          <Text c="dimmed" size="sm">
            Welcome to Check-in Pro. Manage your events and attendees efficiently.
          </Text>
        </div>
        <Button component={Link} href="/rooms/new" size="md">
          Add New Room
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <Card withBorder padding="lg" radius="md">
          <Group>
            <div style={{ backgroundColor: 'var(--mantine-color-blue-1)', padding: '12px', borderRadius: '8px' }}>
              <IconUsers size={24} color="var(--mantine-color-blue-6)" />
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">Total Attendees</Text>
              <Text fw={700} size="xl">{stats?.totalAttendees.length || 0}</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Group>
            <div style={{ backgroundColor: 'var(--mantine-color-green-1)', padding: '12px', borderRadius: '8px' }}>
              <IconBuilding size={24} color="var(--mantine-color-green-6)" />
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">Active Rooms</Text>
              <Text fw={700} size="xl">{stats?.activeRooms || 0}</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Group>
            <div style={{ backgroundColor: 'var(--mantine-color-indigo-1)', padding: '12px', borderRadius: '8px' }}>
              <IconClock size={24} color="var(--mantine-color-indigo-6)" />
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">Check-ins Today</Text>
              <Text fw={700} size="xl">{stats?.checkInsToday || 0}</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <Card withBorder mt="xl" radius="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={2} size="h4">Recent Activity</Title>
        </Card.Section>
        <Card.Section p="md">
          <Stack>
            {stats?.recentCheckIns.map((checkIn) => (
              <Group key={checkIn.id} justify="space-between">
                <Group>
                  <div style={{ backgroundColor: 'var(--mantine-color-blue-1)', padding: '8px', borderRadius: '50%' }}>
                    <IconUsers size={16} color="var(--mantine-color-blue-6)" />
                  </div>
                  <div>
                    <Text fw={500}>{checkIn.attendee.name}</Text>
                    <Text size="sm" c="dimmed">checked in to {checkIn.room.name}</Text>
                  </div>
                </Group>
                <Badge color="green" variant="light">
                  {new Date(checkIn.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </Group>
            ))}
            {(!stats?.recentCheckIns || stats.recentCheckIns.length === 0) && (
              <Text c="dimmed" ta="center">No recent check-ins</Text>
            )}
          </Stack>
        </Card.Section>
      </Card>
    </Container>
  )
} 