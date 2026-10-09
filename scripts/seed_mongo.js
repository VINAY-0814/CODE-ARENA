/**
 * Direct MongoDB Seeding Script for CodeArena
 * Usage:
 *   node scripts/seed_mongo.js "mongodb+srv://user:pass@cluster.mongodb.net/codearena"
 *   or MONGODB_URI=... node scripts/seed_mongo.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const uri = process.argv[2] || process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: Please provide a MongoDB connection string:');
  console.error('Usage: node scripts/seed_mongo.js "<mongodb_connection_uri>"');
  process.exit(1);
}

async function seedMongo() {
  console.log(`Connecting to MongoDB at: ${uri.replace(/:([^:@]+)@/, ':****@')}`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('Successfully connected to MongoDB!');

  const problemsPath = path.resolve('data/codearena/problems.json');
  if (!fs.existsSync(problemsPath)) {
    console.error('problems.json not found at:', problemsPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(problemsPath, 'utf-8');
  const problems = JSON.parse(raw);
  console.log(`Loaded ${problems.length} challenges from problems.json.`);

  const db = mongoose.connection.db;
  const collection = db.collection('problems');

  let insertedOrUpdated = 0;
  for (const prob of problems) {
    await collection.updateOne(
      { slug: prob.slug },
      { $set: prob },
      { upsert: true }
    );
    insertedOrUpdated++;
    if (insertedOrUpdated % 50 === 0) {
      console.log(`Synced ${insertedOrUpdated} / ${problems.length} challenges...`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`SUCCESS: All ${insertedOrUpdated} industry challenges synced to MongoDB!`);
  console.log(`Collection: 'problems' in database '${mongoose.connection.name}'`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

seedMongo().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
