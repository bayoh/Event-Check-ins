# Attendee Check-in System

A full-stack web application for managing attendee check-ins using QR codes and room-based access control.

## Features

- **Excel File Import**: Upload and parse Excel files containing attendee information
- **Room Management**: Create and manage rooms with optional capacity limits
- **Attendee-Room Assignment**: Assign attendees to specific rooms
- **QR Code Scanning**: Web-based QR code scanner for quick check-ins
- **Room-Based Access Control**: Only allow check-ins to assigned rooms
- **Real-time Status**: Track checked-in attendees per room

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker and Docker Compose
- **QR Code**: ZXing library for scanning and generation

## Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd attendencecheckin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials.

4. Start the development environment:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── upload/            # Excel upload page
│   ├── rooms/             # Room management page
│   └── scanner/           # QR scanner page
├── components/            # React components
├── lib/                   # Utility functions
└── prisma/               # Database schema and migrations
```

## API Endpoints

- `POST /api/upload`: Upload and process Excel files
- `GET /api/rooms`: Get all rooms
- `POST /api/rooms`: Create a new room
- `POST /api/assignments`: Assign attendees to rooms
- `POST /api/checkin`: Process attendee check-in
- `PUT /api/checkin`: Process attendee check-out

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 