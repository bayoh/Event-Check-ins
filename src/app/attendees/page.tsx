'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, Button, Table, Badge, Group, Stack, Modal, TextInput, FileButton, ActionIcon, Menu, rem, Alert, Select, LoadingOverlay } from '@mantine/core'
import { IconUpload, IconPlus, IconDots, IconEdit, IconTrash, IconQrcode, IconAlertCircle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { QRCodeModal } from '@/components/QRCodeModal'
import * as XLSX from 'xlsx'
// import { PrismaClient } from '@prisma/client'
// import prisma from '@/lib/prisma'
// const prisma = new PrismaClient();

interface Attendee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  category: string
  publicID: string
  status: 'active' | 'inactive'
  createdAt: string
}

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [newAttendee, setNewAttendee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    publicID: '',
    category: ''
  })

  useEffect(() => {
    fetchAttendees()
  }, [])

  // const fetchAttendees = async () => {
  //   try {
  //     const data = await prisma.attendee.findMany()
  //     setAttendees(data)
  //   } catch (error) {
  //     notifications.show({
  //       title: 'Error',
  //       message: 'Failed to fetch attendees',
  //       color: 'red'
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const fetchAttendees = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/attendees', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      setAttendees(data)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch attendees',
        color: 'red'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAttendee = async () => {
    try {
      const response = await fetch('/api/attendees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAttendee)
      })

      if (!response.ok) throw new Error('Failed to create attendee')

      const data = await response.json()
      setAttendees([data, ...attendees])
      setIsAddModalOpen(false)
      setNewAttendee({ firstName: '', lastName: '', email: '', phone: '', category: '', publicID: '' })
      notifications.show({
        title: 'Success',
        message: 'Attendee added successfully',
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add attendee',
        color: 'red'
      })
    }
  }

  const handleEditAttendee = async () => {
    if (!selectedAttendee) return

    try {
      const response = await fetch(`/api/attendees/${selectedAttendee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAttendee)
      })

      if (!response.ok) throw new Error('Failed to update attendee')

      const data = await response.json()
      setAttendees(attendees.map(a => a.id === data.id ? data : a))
      setIsEditModalOpen(false)
      setSelectedAttendee(null)
      setNewAttendee({ firstName: '', lastName: '', email: '', phone: '', category: '', publicID: '' })
      notifications.show({
        title: 'Success',
        message: 'Attendee updated successfully',
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update attendee',
        color: 'red'
      })
    }
  }

  const handleDeleteAttendee = async (id: string) => {
    try {
      const response = await fetch(`/api/attendees/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete attendee')

      setAttendees(attendees.filter(a => a.id !== id))
      notifications.show({
        title: 'Success',
        message: 'Attendee deleted successfully',
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete attendee',
        color: 'red'
      })
    }
  }

  const handleViewQRCode = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setIsQRModalOpen(true)
  }

  const handleEdit = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setNewAttendee({
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      phone: attendee.phone,
      publicID: attendee.publicID,
      category: attendee.category
    })
    setIsEditModalOpen(true)
  }
  const generatePublicID = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'A-';
    const charactersLength = characters.length;
    for ( let i = 0; i < 9; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const processExcelFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        const newAttendees = jsonData.map((row: any) => {
          

          return {
            firstName: row.firstName || row['First Name'] || row.FirstName || '',
            lastName: row.lastName || row['Last Name'] || row.LastName || '',
            email: row.email || row.Email || row.EMAIL || '',
            phone: row.phone || row.Phone || row.PHONE || '',
            publicID: row.publicID || row['Public ID'] || row['publicID'] || generatePublicID(),
            category: row.category || row.Category || ''
          }
        })

        // Create attendees in parallel
        const responses = await Promise.all(
          newAttendees.map(attendee =>
            fetch('/api/attendees', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(attendee)
            })
          )
        )

        const results = await Promise.all(responses.map(r => r.json()))
        setAttendees([...results, ...attendees])
        notifications.show({
          title: 'Success',
          message: `${results.length} attendees imported successfully`,
          color: 'green'
        })
        setUploadError(null)
      } catch (error) {
        setUploadError('Error processing Excel file. Please ensure it has the correct format.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const processCSVFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        
        const newAttendees = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })

          return {
            firstName: row.firstname || row['first name'] || '',
            lastName: row.lastname || row['last name'] || '',
            email: row.email || '',
            phone: row.phone || '',
            publicID: row.publicID || row['Public ID'] || row['publicID'] || generatePublicID(),
            category: row.category || ''
          }
        })

        // Create attendees in parallel
        const responses = await Promise.all(
          newAttendees.map(attendee =>
            fetch('/api/attendees', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(attendee)
            })
          )
        )

        const results = await Promise.all(responses.map(r => r.json()))
        setAttendees([...results, ...attendees])
        notifications.show({
          title: 'Success',
          message: `${results.length} attendees imported successfully`,
          color: 'green'
        })
        setUploadError(null)
      } catch (error) {
        setUploadError('Error processing CSV file. Please ensure it has the correct format.')
      }
    }
    reader.readAsText(file)
  }

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadError(null)
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        processExcelFile(file)
      } else if (fileExtension === 'csv') {
        processCSVFile(file)
      } else {
        setUploadError('Please upload a valid Excel (.xlsx, .xls) or CSV file.')
      }
    }
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Attendees</Title>
          <Text c="dimmed" size="sm">
            Manage your event attendees and their check-in status.
          </Text>
        </div>
        <Group>
          <FileButton
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
          >
            {(props) => (
              <Button
                {...props}
                leftSection={<IconUpload size={14} />}
                disabled={isLoading}
              >
                Upload File
              </Button>
            )}
          </FileButton>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={() => setIsAddModalOpen(true)}
            disabled={isLoading}
          >
            Add Attendee
          </Button>
        </Group>
      </Group>

      {uploadError && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {uploadError}
        </Alert>
      )}

      <div style={{ position: 'relative' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>PublicID</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attendees.map((attendee) => (
              <Table.Tr key={attendee.id}>
                <Table.Td>{attendee.firstName} {attendee.lastName}</Table.Td>
                <Table.Td>{attendee.email}</Table.Td>
                <Table.Td>{attendee.phone}</Table.Td>
                <Table.Td>{attendee.category}</Table.Td>
                <Table.Td>{attendee.publicID}</Table.Td>
                <Table.Td>
                  <Badge color={attendee.status === 'active' ? 'green' : 'red'} variant="light">
                    {attendee.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={0} justify="flex-end">
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots style={{ width: rem(16), height: rem(16) }} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => handleEdit(attendee)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconQrcode style={{ width: rem(14), height: rem(14) }} />}
                          onClick={() => handleViewQRCode(attendee)}
                        >
                          View QR Code
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                          color="red"
                          onClick={() => handleDeleteAttendee(attendee.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <LoadingOverlay 
          visible={isLoading} 
          zIndex={1000} 
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ type: 'dots' }}
        />
      </div>

      <Modal opened={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Attendee">
        <Stack>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={newAttendee.firstName}
            onChange={(e) => setNewAttendee({ ...newAttendee, firstName: e.target.value })}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={newAttendee.lastName}
            onChange={(e) => setNewAttendee({ ...newAttendee, lastName: e.target.value })}
            required
          />
          <TextInput
            label="Email"
            placeholder="Enter email"
            value={newAttendee.email}
            onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
            required
          />
          <TextInput
            label="Phone"
            placeholder="Enter phone"
            value={newAttendee.phone}
            onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
          />
          <Select
            label="Category"
            placeholder="Select category"
            value={newAttendee.category}
            onChange={(value) => setNewAttendee({ ...newAttendee, category: value || '' })}
            data={[
              { value: 'VIP', label: 'VIP' },
              { value: 'Speaker', label: 'Speaker' },
              { value: 'Staff', label: 'Staff' },
              { value: 'Attendee', label: 'Attendee' }
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAttendee}>
              Add Attendee
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Attendee">
        <Stack>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={newAttendee.firstName}
            onChange={(e) => setNewAttendee({ ...newAttendee, firstName: e.target.value })}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={newAttendee.lastName}
            onChange={(e) => setNewAttendee({ ...newAttendee, lastName: e.target.value })}
            required
          />
          <TextInput
            label="Email"
            placeholder="Enter email"
            value={newAttendee.email}
            onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
            required
          />
          <TextInput
            label="Phone"
            placeholder="Enter phone"
            value={newAttendee.phone}
            onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
          />
          <Select
            label="Category"
            placeholder="Select category"
            value={newAttendee.category}
            onChange={(value) => setNewAttendee({ ...newAttendee, category: value || '' })}
            data={[
              { value: 'VIP', label: 'VIP' },
              { value: 'Speaker', label: 'Speaker' },
              { value: 'Staff', label: 'Staff' },
              { value: 'Attendee', label: 'Attendee' }
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAttendee}>
              Update Attendee
            </Button>
          </Group>
        </Stack>
      </Modal>

      {selectedAttendee && (
        <QRCodeModal
          opened={isQRModalOpen}
          onClose={() => {
            setIsQRModalOpen(false)
            setSelectedAttendee(null)
          }}
          attendee={{
            name: `${selectedAttendee.firstName} ${selectedAttendee.lastName}`,
            publicID: selectedAttendee.publicID
          }}
        />
      )}
    </Container>
  )
} 