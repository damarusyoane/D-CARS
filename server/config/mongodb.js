import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)
let db

export async function connectDB() {
  if (!db) {
    await client.connect()
    db = client.db('dcars')
    console.log('✅ MongoDB Connected')
  }
  return db
}