# Farewell Pass Manager

A web application for managing student passes for a farewell party.

## Database Setup

The application uses PostgreSQL as its database. To set up the database:

1. Make sure you have PostgreSQL installed and running
2. Create a `.env` file in the root directory with the following variables (copy from `.env.example`):
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/farewell_db
   REDIS_URL=redis://localhost:6379
   ```
   Replace `username`, `password`, and `farewell_db` with your actual PostgreSQL credentials.

3. Check if the database connection is working:
   ```
   npm run check-db
   ```

4. Reset the database (this will drop and recreate all tables):
   ```
   npm run reset-db
   ```

## Development

To run the application in development mode:

```
npm run dev
```

## Building for Production

To build the application for production:

```
npm run build
```

## Running in Production

To run the application in production mode:

```
npm run start
```

## Database Schema

The application uses the following database schema:

### Students Table
- `id`: Serial primary key
- `name`: Student name
- `email`: Student email (unique)
- `class`: Student class
- `roll_number`: Student roll number
- `pass_generated`: Boolean indicating if a pass has been generated
- `pass_sent`: Boolean indicating if a pass has been sent
- `pass_used`: Boolean indicating if a pass has been used
- `qr_code`: QR code data URL
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### Passes Table
- `id`: Serial primary key
- `student_id`: Foreign key to students table
- `pass_code`: Unique pass code
- `is_valid`: Boolean indicating if the pass is valid
- `scanned_at`: Timestamp when the pass was scanned
- `status`: Pass status (active, used, expired, revoked)
- `created_at`: Timestamp of creation

## API Endpoints

The application provides the following API endpoints:

- `POST /api/students`: Import students from Excel
- `GET /api/students`: Get all students
- `GET /api/students/list`: Get students with pagination and filtering
- `POST /api/students/check`: Check if students already exist
- `GET /api/students/[id]`: Get a student by ID
- `PATCH /api/students/[id]`: Update a student
- `POST /api/passes/generate`: Generate passes for students
- `POST /api/passes/send`: Send passes to students
- `POST /api/passes/validate`: Validate a pass
- `GET /api/passes/status`: Get pass status
- `GET /api/passes`: Get all passes with pagination and filtering
- `GET /api/passes/[id]`: Get a pass by ID
- `DELETE /api/passes/[id]`: Delete a pass
- `GET /api/stats`: Get system statistics

## Troubleshooting

If you encounter database connection issues:

1. Make sure PostgreSQL is running
2. Check your `.env` file for correct database credentials
3. Run `npm run check-db` to verify the connection
4. If needed, run `npm run reset-db` to reset the database schema
