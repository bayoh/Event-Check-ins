'use client'

import { Container, Title, Text, Card, Group, TextInput, Button, LoadingOverlay, Stack, Alert } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { IconQrcode, IconKeyboard } from '@tabler/icons-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface Room {
  id: string
  name: string
  capacity: number | null
}

export default function CheckInPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publicId, setPublicId] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const [lastCheckedIn, setLastCheckedIn] = useState<{
    name: string
    timestamp: string
  } | null>(null)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch room')
        const data = await response.json()
        setRoom(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [params.id])

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null

    if (scannerActive) {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      )

      scanner.render(
        (decodedText: string) => {
          setPublicId(decodedText)
          setScannerActive(false)
          handleCheckIn(decodedText)
        },
        (error: string) => {
          console.warn(`QR Code scan error: ${error}`)
        }
      )
    }

    return () => {
      if (scanner) {
        scanner.clear()
      }
    }
  }, [scannerActive])

  const handleCheckIn = async (id: string) => {
    if (!id) return

    setCheckingIn(true)
    try {
      const response = await fetch(`/api/rooms/${params.id}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId: id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to check in')
      }

      const data = await response.json()
      setLastCheckedIn({
        name: data.attendeeName,
        timestamp: new Date().toLocaleString()
      })
      
      notifications.show({
        title: 'Success',
        message: `${data.attendeeName} checked in successfully`,
        color: 'green',
      })

      setPublicId('')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to check in',
        color: 'red',
      })
    } finally {
      setCheckingIn(false)
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
        <Alert color="red" title="Error">
          {error}
        </Alert>
      </Container>
    )
  }

  if (!room) {
    return (
      <Container size="xl">
        <Alert color="red" title="Error">
          Room not found
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl">
      <Stack>
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1}>Check In to {room.name}</Title>
            <Text c="dimmed" size="sm">
              Scan QR code or enter attendee ID
            </Text>
          </div>
        </Group>

        <Card withBorder>
          <Stack>
            <Group>
              <Button
                leftSection={<IconQrcode size={14} />}
                onClick={() => setScannerActive(!scannerActive)}
                variant={scannerActive ? 'filled' : 'light'}
                disabled={checkingIn}
              >
                {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
              </Button>
            </Group>

            {scannerActive && (
              <div id="qr-reader" style={{ width: '100%', maxWidth: '500px' }} />
            )}

            <TextInput
              label="Attendee ID"
              placeholder="Enter attendee ID"
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              leftSection={<IconKeyboard size={14} />}
              disabled={checkingIn}
            />

            <Button
              onClick={() => handleCheckIn(publicId)}
              loading={checkingIn}
              disabled={!publicId || checkingIn}
              fullWidth
            >
              Check In
            </Button>

            {lastCheckedIn && (
              <Alert color="green" title="Last Check-in">
                <Text size="sm">
                  {lastCheckedIn.name} checked in at {lastCheckedIn.timestamp}
                </Text>
              </Alert>
            )}
          </Stack>
          <LoadingOverlay 
            visible={checkingIn} 
            zIndex={1000} 
            overlayProps={{ radius: "sm", blur: 2 }}
            loaderProps={{ type: 'dots' }}
          />
        </Card>
      </Stack>
    </Container>
  )
} 