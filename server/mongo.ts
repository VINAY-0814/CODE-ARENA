import mongoose, { Schema } from 'mongoose';

let isMongoConnected = false;

// 1. User Schema
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    xp: { type: Number, default: 0, index: true },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    rank: { type: Number, default: 1 },
    lastActiveDate: { type: String, default: () => new Date().toISOString() },
    problemsSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    solvedProblemIds: { type: [String], default: [] },
    bio: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// 2. Problem Schema
const ProblemSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    points: { type: Number, default: 50 },
    supportedLanguages: { type: [String], default: ['javascript', 'python', 'cpp', 'java'] },
    constraints: { type: [String], default: [] },
    examples: { type: Array, default: [] },
    testCases: { type: Array, default: [] },
    starterCode: { type: Map, of: String, default: {} },
    hints: { type: [String], default: [] },
    acceptanceRate: { type: Number, default: 100 },
    totalAttempts: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
    isDaily: { type: Boolean, default: false },
    isDailyChallenge: { type: Boolean, default: false },
    designatedDailyAt: { type: String },
  },
  { timestamps: true }
);

// 3. Submission Schema
const SubmissionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    userProfileImage: { type: String },
    problemId: { type: String, required: true, index: true },
    problemTitle: { type: String, required: true },
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
    status: { type: String, required: true },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 },
    memoryUsed: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    details: { type: Array, default: [] },
    submittedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// 4. Achievement Schema
const AchievementSchema = new Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  badgeIcon: { type: String, required: true },
  xpReward: { type: Number, default: 50 },
  category: { type: String, default: 'General' },
});

// 5. User Achievement Schema
const UserAchievementSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: String, required: true },
    achievementCode: { type: String, required: true },
    unlockedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// 6. Battle Schema
const BattleSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    problemId: { type: String, required: true },
    problemTitle: { type: String, required: true },
    problemDifficulty: { type: String, default: 'Easy' },
    status: { type: String, default: 'waiting' },
    durationSeconds: { type: Number, default: 600 },
    startedAt: { type: String },
    endedAt: { type: String },
    winnerId: { type: String, default: null },
    winnerUsername: { type: String, default: null },
    createdBy: { type: String, required: true },
    createdByName: { type: String, required: true },
  },
  { timestamps: true }
);

// 7. Battle Participant Schema
const BattleParticipantSchema = new Schema(
  {
    battleId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    profileImage: { type: String, default: '' },
    status: { type: String, default: 'ready' },
    testsPassed: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    submittedAt: { type: String },
    code: { type: String },
    language: { type: String },
  },
  { timestamps: true }
);

// 8. Battle Invite Schema
const BattleInviteSchema = new Schema(
  {
    battleId: { type: String, required: true },
    battleCode: { type: String, required: true },
    battleTitle: { type: String, required: true },
    problemId: { type: String, required: true },
    problemTitle: { type: String, required: true },
    problemDifficulty: { type: String, default: 'Easy' },
    fromUserId: { type: String, required: true },
    fromUsername: { type: String, required: true },
    fromProfileImage: { type: String, default: '' },
    toUserId: { type: String, required: true, index: true },
    toUsername: { type: String, required: true },
    status: { type: String, default: 'pending' },
    expiresAt: { type: String, required: true },
  },
  { timestamps: true }
);

// 9. Notification Schema
const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'system' },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const MongoModels = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Problem: mongoose.models.Problem || mongoose.model('Problem', ProblemSchema),
  Submission: mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema),
  Achievement: mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema),
  UserAchievement: mongoose.models.UserAchievement || mongoose.model('UserAchievement', UserAchievementSchema),
  Battle: mongoose.models.Battle || mongoose.model('Battle', BattleSchema),
  BattleParticipant: mongoose.models.BattleParticipant || mongoose.model('BattleParticipant', BattleParticipantSchema),
  BattleInvite: mongoose.models.BattleInvite || mongoose.model('BattleInvite', BattleInviteSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema),
};

export async function connectMongo(uri?: string): Promise<boolean> {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('[MongoDB] No MONGODB_URI configured. Running with local storage engine.');
    return false;
  }

  // Prevent buffering commands so queries fail fast or fall back gracefully
  mongoose.set('bufferCommands', false);

  try {
    const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`[MongoDB] Connecting to MongoDB instance at ${maskedUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected to live MongoDB: ${mongoose.connection.host}`);
    return true;
  } catch (err: any) {
    console.warn(`[MongoDB] Could not establish live MongoDB connection (${err.message}). Safe in-memory/JSON fallback active.`);
    isMongoConnected = false;
    return false;
  }
}

export function isMongoActive(): boolean {
  return isMongoConnected && mongoose.connection.readyState === 1;
}
