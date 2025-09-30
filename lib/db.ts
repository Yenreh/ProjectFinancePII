import { neon } from "@neondatabase/serverless"

// For development, we'll use a mock database
// In production, this would connect to a real database
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export { sql }
