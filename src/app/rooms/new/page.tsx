'use client'

import { Container, Title, Text, TextInput, NumberInput, Button, Stack, Group } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { notifications } from '@mantine/notifications'

export default function NewRoomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    capacity: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      notifications.show({
        title: 'Success',
        message: 'Room created successfully',
        color: 'green',
      })

      router.push('/rooms')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create room. Please try again.',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="sm">
      <Stack>
        <div>
          <Title order={1}>Add New Room</Title>
          <Text c="dimmed" size="sm">
            Create a new room for your event.
          </Text>
        </div>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Room Name"
              placeholder="Enter room name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <NumberInput
              label="Capacity"
              placeholder="Enter room capacity (optional)"
              min={1}
              value={formData.capacity ? parseInt(formData.capacity) : undefined}
              onChange={(value) => setFormData({ ...formData, capacity: value?.toString() || '' })}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={() => router.push('/rooms')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                Create Room
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
} 