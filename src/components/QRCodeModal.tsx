'use client'

import { Modal, Text, Group, Button, Stack } from '@mantine/core'
import { QRCodeSVG } from 'qrcode.react'
import { IconDownload } from '@tabler/icons-react'

interface QRCodeModalProps {
  opened: boolean
  onClose: () => void
  attendee: {
    name: string
    publicID: string
  }
}

export function QRCodeModal({ opened, onClose, attendee }: QRCodeModalProps) {
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code') as HTMLCanvasElement
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `${attendee.name}-qr-code.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Attendee QR Code" size="sm">
      <Stack align="center" gap="md">
        <QRCodeSVG
          id="qr-code"
          value={attendee.publicID}
          size={200}
          level="H"
          includeMargin
        />
        <Text size="sm" c="dimmed" ta="center">
          {attendee.name}
        </Text>
        <Text size="xs" c="dimmed" ta="center">
          ID: {attendee.publicID}
        </Text>
        <Button
          leftSection={<IconDownload size={14} />}
          onClick={downloadQRCode}
          variant="light"
        >
          Download QR Code
        </Button>
      </Stack>
    </Modal>
  )
} 