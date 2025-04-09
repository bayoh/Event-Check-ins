'use client'

import Link from 'next/link'
import { AppShell, Text, Group, Button, Stack } from '@mantine/core'
import { IconHome, IconBuilding, IconUsers, IconQrcode } from '@tabler/icons-react'

export function Navigation({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <Group mb="xl">
          <Text size="xl" fw={700}>Check-in Pro</Text>
        </Group>
        
        <Stack gap="xs">
          <Button
            component={Link}
            href="/"
            variant="subtle"
            leftSection={<IconHome size={16} />}
            justify="start"
            fullWidth
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            href="/rooms"
            variant="subtle"
            leftSection={<IconBuilding size={16} />}
            justify="start"
            fullWidth
          >
            Rooms
          </Button>
          <Button
            component={Link}
            href="/attendees"
            variant="subtle"
            leftSection={<IconUsers size={16} />}
            justify="start"
            fullWidth
          >
            Attendees
          </Button>
          <Button
            component={Link}
            href="/checkin"
            variant="subtle"
            leftSection={<IconQrcode size={16} />}
            justify="start"
            fullWidth
          >
            Check-in
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
} 