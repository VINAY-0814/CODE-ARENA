import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data/codearena');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface UserDoc {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  profileImage: string;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  problemsSolved: number;
  totalSubmissions: number;
  solvedProblemIds: string[];
  bio?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemDoc {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
  category: 'Arrays' | 'Strings' | 'Linked Lists' | 'Stacks' | 'Queues' | 'Trees' | 'Graphs' | 'Dynamic Programming' | 'Algorithms' | 'Mathematics';
  points: number;
  supportedLanguages: string[];
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation?: string;
  }>;
  starterCode: Record<string, string>;
  hints: string[];
  acceptanceRate: number;
  totalAttempts: number;
  totalAccepted: number;
  isDaily?: boolean;
  isDailyChallenge?: boolean;
  designatedDailyAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionDoc {
  id: string;
  _id?: string;
  userId: string;
  username: string;
  userProfileImage?: string;
  problemId: string;
  problemTitle: string;
  language: string;
  sourceCode: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number; // in ms
  memoryUsed: number; // in KB
  score: number;
  details: Array<{
    testCaseNumber: number;
    passed: boolean;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    error?: string;
    executionTimeMs?: number;
    isHidden?: boolean;
  }>;
  submittedAt: string;
}

export interface AchievementDoc {
  id: string;
  _id?: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  xpReward: number;
  category: string;
}

export interface UserAchievementDoc {
  id: string;
  _id?: string;
  userId: string;
  achievementId: string;
  achievementCode: string;
  unlockedAt: string;
}

export interface BattleDoc {
  id: string;
  _id?: string;
  code: string;
  title: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  durationSeconds: number;
  startedAt?: string;
  endedAt?: string;
  winnerId?: string | null;
  winnerUsername?: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface BattleParticipantDoc {
  id: string;
  _id?: string;
  battleId: string;
  userId: string;
  username: string;
  profileImage: string;
  status: 'ready' | 'coding' | 'submitted' | 'surrendered';
  testsPassed: number;
  totalTests: number;
  executionTimeMs?: number;
  score: number;
  submittedAt?: string;
  code?: string;
  language?: string;
}

export interface BattleInviteDoc {
  id: string;
  _id?: string;
  battleId: string;
  battleCode: string;
  battleTitle: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  fromUserId: string;
  fromUsername: string;
  fromProfileImage: string;
  toUserId: string;
  toUsername: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface NotificationDoc {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'battle' | 'battle_invite' | 'streak' | 'system' | 'submission';
  isRead: boolean;
  createdAt: string;
  metadata?: {
    inviteId?: string;
    battleId?: string;
    battleCode?: string;
    battleTitle?: string;
    fromUserId?: string;
    fromUsername?: string;
    fromProfileImage?: string;
    problemId?: string;
    problemTitle?: string;
    problemDifficulty?: string;
    status?: 'pending' | 'accepted' | 'declined';
  };
}

// Collection Class mimicking MongoDB collection with indexing & queries
class Collection<T extends { id: string; _id?: string }> {
  private filePath: string;
  private data: Map<string, T> = new Map();
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.load();
  }

  private load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const items: T[] = JSON.parse(raw);
        items.forEach((item) => {
          if (!item.id && item._id) item.id = item._id;
          if (!item._id && item.id) item._id = item.id;
          this.data.set(item.id, item);
        });
      } catch (err) {
        console.error(`Failed reading collection ${this.name}:`, err);
      }
    }
  }

  private save() {
    try {
      const items = Array.from(this.data.values());
      fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Failed saving collection ${this.name}:`, err);
    }
  }

  public find(query: (item: T) => boolean = () => true): T[] {
    const results: T[] = [];
    for (const item of this.data.values()) {
      if (query(item)) {
        results.push({ ...item });
      }
    }
    return results;
  }

  public findById(id: string): T | null {
    const item = this.data.get(id);
    return item ? { ...item } : null;
  }

  public findOne(query: (item: T) => boolean): T | null {
    for (const item of this.data.values()) {
      if (query(item)) {
        return { ...item };
      }
    }
    return null;
  }

  public insert(doc: Omit<T, 'id' | '_id'> & { id?: string; _id?: string }): T {
    const id = doc.id || doc._id || crypto.randomBytes(12).toString('hex');
    const newDoc = {
      ...doc,
      id,
      _id: id,
    } as unknown as T;
    this.data.set(id, newDoc);
    this.save();
    return { ...newDoc };
  }

  public updateById(id: string, updates: Partial<T>): T | null {
    const existing = this.data.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      id,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    this.data.set(id, updated);
    this.save();
    return { ...updated };
  }

  public deleteById(id: string): boolean {
    const exists = this.data.delete(id);
    if (exists) this.save();
    return exists;
  }

  public count(query: (item: T) => boolean = () => true): number {
    let count = 0;
    for (const item of this.data.values()) {
      if (query(item)) count++;
    }
    return count;
  }
}

// Database instance
export const db = {
  users: new Collection<UserDoc>('users'),
  problems: new Collection<ProblemDoc>('problems'),
  submissions: new Collection<SubmissionDoc>('submissions'),
  achievements: new Collection<AchievementDoc>('achievements'),
  userAchievements: new Collection<UserAchievementDoc>('user_achievements'),
  battles: new Collection<BattleDoc>('battles'),
  battleParticipants: new Collection<BattleParticipantDoc>('battle_participants'),
  battleInvites: new Collection<BattleInviteDoc>('battle_invites'),
  notifications: new Collection<NotificationDoc>('notifications'),
};

// Database Seed Function
export async function seedDatabase(force: boolean = false) {
  const userCount = db.users.count();
  if (userCount > 0 && !force) {
    return;
  }

  console.log('Seeding CodeArena database with initial challenges, achievements, and admin user...');

  // 1. Achievements
  const achievementsList: Omit<AchievementDoc, 'id'>[] = [
    {
      code: 'first-victory',
      title: 'First Victory',
      description: 'Solve your first programming challenge.',
      badgeIcon: 'Award',
      xpReward: 50,
      category: 'General',
    },
    {
      code: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day coding streak.',
      badgeIcon: 'Flame',
      xpReward: 150,
      category: 'Consistency',
    },
    {
      code: 'problem-crusher',
      title: 'Problem Crusher',
      description: 'Solve 10 algorithm challenges.',
      badgeIcon: 'Zap',
      xpReward: 300,
      category: 'Volume',
    },
    {
      code: 'speed-coder',
      title: 'Speed Coder',
      description: 'Pass all test cases with execution time under 50ms.',
      badgeIcon: 'Gauge',
      xpReward: 100,
      category: 'Performance',
    },
    {
      code: 'perfect-score',
      title: 'Perfect Score',
      description: 'Pass 100% of test cases on your first submission.',
      badgeIcon: 'CheckCircle2',
      xpReward: 100,
      category: 'Precision',
    },
    {
      code: 'battle-veteran',
      title: 'Battle Veteran',
      description: 'Win a 1v1 live coding battle.',
      badgeIcon: 'Swords',
      xpReward: 200,
      category: 'Competitive',
    },
  ];

  achievementsList.forEach((ach) => {
    if (!db.achievements.findOne((a) => a.code === ach.code)) {
      db.achievements.insert(ach);
    }
  });

  // 2. Users: Admin and Dev accounts
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', salt);
  const devPasswordHash = await bcrypt.hash('CoderPass123!', salt);

  let adminUser = db.users.findOne((u) => u.email === 'admin@codearena.dev');
  if (!adminUser) {
    adminUser = db.users.insert({
      name: 'System Admin',
      username: 'admin',
      email: 'admin@codearena.dev',
      password: adminPasswordHash,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      xp: 1450,
      level: 6,
      streak: 12,
      lastActiveDate: new Date().toISOString(),
      problemsSolved: 8,
      totalSubmissions: 14,
      solvedProblemIds: [],
      bio: 'CodeArena Administrator & Platform Architect.',
      githubUrl: 'https://github.com/codearena-admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  let coderUser = db.users.findOne((u) => u.email === 'alex@codearena.dev');
  if (!coderUser) {
    coderUser = db.users.insert({
      name: 'Alex Rivera',
      username: 'alex_codes',
      email: 'alex@codearena.dev',
      password: devPasswordHash,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      xp: 850,
      level: 4,
      streak: 5,
      lastActiveDate: new Date().toISOString(),
      problemsSolved: 5,
      totalSubmissions: 9,
      solvedProblemIds: [],
      bio: 'Competitive programmer, full-stack enthusiast, and algorithm optimizer.',
      githubUrl: 'https://github.com/alexrivera',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 3. Coding Problems across categories and difficulties
  const problemsList: Omit<ProblemDoc, 'id'>[] = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
      difficulty: 'Easy',
      category: 'Arrays',
      points: 50,
      supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
      ],
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
        },
      ],
      testCases: [
        {
          input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
          expectedOutput: '[0,1]',
          isHidden: false,
          explanation: 'Standard pair at indices 0 and 1',
        },
        {
          input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
          expectedOutput: '[1,2]',
          isHidden: false,
          explanation: 'Pair 2 + 4 = 6',
        },
        {
          input: JSON.stringify({ nums: [3, 3], target: 6 }),
          expectedOutput: '[0,1]',
          isHidden: false,
          explanation: 'Duplicates at different indices',
        },
        {
          input: JSON.stringify({ nums: [1, 5, 8, 13, 20, 25], target: 26 }),
          expectedOutput: '[0,5]',
          isHidden: true,
          explanation: 'Hidden large array test with unique pair',
        },
        {
          input: JSON.stringify({ nums: [-3, 4, 3, 90], target: 0 }),
          expectedOutput: '[0,2]',
          isHidden: true,
          explanation: 'Negative numbers test',
        },
      ],
      starterCode: {
        javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `def two_sum(nums, target):
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Implement solution
        return new int[]{0, 1};
    }
}`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Implement solution
        return {0, 1};
    }
};`,
        c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Implement solution
    *returnSize = 2;
    return nums;
}`,
      },
      hints: [
        'A really brute force way would be to search for all possible pairs of numbers but that would be slow.',
        'Can we use extra space like a Hash Map to look up complements in O(1) time?',
      ],
      acceptanceRate: 78.4,
      totalAttempts: 124,
      totalAccepted: 97,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
      difficulty: 'Beginner',
      category: 'Strings',
      points: 20,
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      constraints: [
        '1 <= s.length <= 2 * 10^5',
        's consists only of printable ASCII characters.',
      ],
      examples: [
        {
          input: 's = "A man, a plan, a canal: Panama"',
          output: 'true',
          explanation: '"amanaplanacanalpanama" is a palindrome.',
        },
        {
          input: 's = "race a car"',
          output: 'false',
          explanation: '"raceacar" is not a palindrome.',
        },
      ],
      testCases: [
        {
          input: JSON.stringify({ s: 'A man, a plan, a canal: Panama' }),
          expectedOutput: 'true',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: 'race a car' }),
          expectedOutput: 'false',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: ' ' }),
          expectedOutput: 'true',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: '0P' }),
          expectedOutput: 'false',
          isHidden: true,
        },
        {
          input: JSON.stringify({ s: 'Was it a car or a cat I saw?' }),
          expectedOutput: 'true',
          isHidden: true,
        },
      ],
      starterCode: {
        javascript: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
        python: `def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
        java: `public class Solution {
    public boolean isPalindrome(String s) {
        // Implement solution
        return true;
    }
}`,
        cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        // Implement solution
        return true;
    }
};`,
      },
      hints: [
        'Consider two pointers moving from ends toward center, skipping non-alphanumeric characters.',
      ],
      acceptanceRate: 85.1,
      totalAttempts: 95,
      totalAccepted: 81,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
      difficulty: 'Medium',
      category: 'Strings',
      points: 100,
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      constraints: [
        '0 <= s.length <= 5 * 10^4',
        's consists of English letters, digits, symbols and spaces.',
      ],
      examples: [
        {
          input: 's = "abcabcbb"',
          output: '3',
          explanation: 'The answer is "abc", with the length of 3.',
        },
        {
          input: 's = "bbbbb"',
          output: '1',
          explanation: 'The answer is "b", with the length of 1.',
        },
      ],
      testCases: [
        {
          input: JSON.stringify({ s: 'abcabcbb' }),
          expectedOutput: '3',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: 'bbbbb' }),
          expectedOutput: '1',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: 'pwwkew' }),
          expectedOutput: '3',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: '' }),
          expectedOutput: '0',
          isHidden: true,
        },
        {
          input: JSON.stringify({ s: 'tmmzuxt' }),
          expectedOutput: '5',
          isHidden: true,
        },
      ],
      starterCode: {
        javascript: `function lengthOfLongestSubstring(s) {
  let maxLength = 0;
  let start = 0;
  const map = new Map();

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (map.has(char) && map.get(char) >= start) {
      start = map.get(char) + 1;
    }
    map.set(char, i);
    maxLength = Math.max(maxLength, i - start + 1);
  }

  return maxLength;
}`,
        python: `def length_of_longest_substring(s):
    char_map = {}
    max_len = 0
    start = 0
    for i, char in enumerate(s):
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        char_map[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len`,
        java: `public class Solution {
    public int lengthOfLongestSubstring(String s) {
        return 0;
    }
}`,
        cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        return 0;
    }
};`,
      },
      hints: [
        'Use the sliding window technique with two pointers [start, end].',
        'Store the most recent index of each visited character.',
      ],
      acceptanceRate: 54.2,
      totalAttempts: 150,
      totalAccepted: 81,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      difficulty: 'Easy',
      category: 'Stacks',
      points: 50,
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only "()[]{}"',
      ],
      examples: [
        {
          input: 's = "()"',
          output: 'true',
        },
        {
          input: 's = "()[]{}"',
          output: 'true',
        },
        {
          input: 's = "(]"',
          output: 'false',
        },
      ],
      testCases: [
        {
          input: JSON.stringify({ s: '()' }),
          expectedOutput: 'true',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: '()[]{}' }),
          expectedOutput: 'true',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: '(]' }),
          expectedOutput: 'false',
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: '([)]' }),
          expectedOutput: 'false',
          isHidden: true,
        },
        {
          input: JSON.stringify({ s: '{[]}' }),
          expectedOutput: 'true',
          isHidden: true,
        },
      ],
      starterCode: {
        javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
        python: `def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
        java: `public class Solution {
    public boolean isValid(String s) {
        return true;
    }
}`,
        cpp: `class Solution {
public:
    bool isValid(string s) {
        return true;
    }
};`,
      },
      hints: [
        'A Stack data structure naturally preserves LIFO bracket pairing.',
      ],
      acceptanceRate: 72.8,
      totalAttempts: 110,
      totalAccepted: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: 'Merge Intervals',
      slug: 'merge-intervals',
      description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
      difficulty: 'Medium',
      category: 'Algorithms',
      points: 100,
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      constraints: [
        '1 <= intervals.length <= 10^4',
        'intervals[i].length == 2',
        '0 <= start_i <= end_i <= 10^4',
      ],
      examples: [
        {
          input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
          output: '[[1,6],[8,10],[15,18]]',
          explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
        },
      ],
      testCases: [
        {
          input: JSON.stringify({ intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }),
          expectedOutput: '[[1,6],[8,10],[15,18]]',
          isHidden: false,
        },
        {
          input: JSON.stringify({ intervals: [[1, 4], [4, 5]] }),
          expectedOutput: '[[1,5]]',
          isHidden: false,
        },
        {
          input: JSON.stringify({ intervals: [[1, 4], [0, 4]] }),
          expectedOutput: '[[0,4]]',
          isHidden: true,
        },
        {
          input: JSON.stringify({ intervals: [[1, 4], [2, 3]] }),
          expectedOutput: '[[1,4]]',
          isHidden: true,
        },
      ],
      starterCode: {
        javascript: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}`,
        python: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged`,
        java: `public class Solution {
    public int[][] merge(int[][] intervals) {
        return intervals;
    }
}`,
        cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        return intervals;
    }
};`,
      },
      hints: [
        'Sort intervals by their starting times before merging.',
      ],
      acceptanceRate: 61.5,
      totalAttempts: 98,
      totalAccepted: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: 'Trapping Rain Water',
      slug: 'trapping-rain-water',
      description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
      difficulty: 'Hard',
      category: 'Dynamic Programming',
      points: 200,
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      constraints: [
        'n == height.length',
        '1 <= n <= 2 * 10^4',
        '0 <= height[i] <= 10^5',
      ],
      examples: [
        {
          input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
          output: '6',
          explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.',
        },
      ],
      testCases: [
        {
          input: JSON.stringify({ height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }),
          expectedOutput: '6',
          isHidden: false,
        },
        {
          input: JSON.stringify({ height: [4, 2, 0, 3, 2, 5] }),
          expectedOutput: '9',
          isHidden: false,
        },
        {
          input: JSON.stringify({ height: [3, 0, 2, 0, 4] }),
          expectedOutput: '7',
          isHidden: true,
        },
        {
          input: JSON.stringify({ height: [1, 2, 3, 4, 5] }),
          expectedOutput: '0',
          isHidden: true,
        },
      ],
      starterCode: {
        javascript: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }

  return water;
}`,
        python: `def trap(height):
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water`,
        java: `public class Solution {
    public int trap(int[] height) {
        return 0;
    }
}`,
        cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        return 0;
    }
};`,
      },
      hints: [
        'Water trapped at index i is determined by min(maxLeft, maxRight) - height[i].',
        'Can you optimize space to O(1) using two pointers?',
      ],
      acceptanceRate: 46.8,
      totalAttempts: 130,
      totalAccepted: 61,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  problemsList.forEach((prob) => {
    if (!db.problems.findOne((p) => p.slug === prob.slug)) {
      db.problems.insert(prob);
    }
  });

  // Ensure at least one random problem is designated as 'daily challenge' in database
  const existingDaily = db.problems.findOne((p) => p.isDaily === true || p.isDailyChallenge === true);
  if (!existingDaily) {
    const allProbs = db.problems.find();
    if (allProbs.length > 0) {
      const randomIdx = Math.floor(Math.random() * allProbs.length);
      db.problems.updateById(allProbs[randomIdx].id, {
        isDaily: true,
        isDailyChallenge: true,
        designatedDailyAt: new Date().toISOString(),
      });
    }
  }

  // Seed sample submissions
  const sampleProblems = db.problems.find();
  if (sampleProblems.length > 0 && adminUser && coderUser) {
    const p1 = sampleProblems[0];
    const p2 = sampleProblems[1];

    db.submissions.insert({
      userId: adminUser.id,
      username: adminUser.username,
      userProfileImage: adminUser.profileImage,
      problemId: p1.id,
      problemTitle: p1.title,
      language: 'javascript',
      sourceCode: p1.starterCode['javascript'] || '',
      status: 'Accepted',
      testCasesPassed: p1.testCases.length,
      totalTestCases: p1.testCases.length,
      executionTime: 28,
      memoryUsed: 1420,
      score: 50,
      details: p1.testCases.map((tc, idx) => ({
        testCaseNumber: idx + 1,
        passed: true,
        executionTimeMs: 6,
        isHidden: tc.isHidden,
      })),
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    });

    db.submissions.insert({
      userId: coderUser.id,
      username: coderUser.username,
      userProfileImage: coderUser.profileImage,
      problemId: p2.id,
      problemTitle: p2.title,
      language: 'javascript',
      sourceCode: p2.starterCode['javascript'] || '',
      status: 'Accepted',
      testCasesPassed: p2.testCases.length,
      totalTestCases: p2.testCases.length,
      executionTime: 19,
      memoryUsed: 1210,
      score: 20,
      details: p2.testCases.map((tc, idx) => ({
        testCaseNumber: idx + 1,
        passed: true,
        executionTimeMs: 4,
        isHidden: tc.isHidden,
      })),
      submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    });

    // Unlocked achievements
    const ach = db.achievements.findOne((a) => a.code === 'first-victory');
    if (ach) {
      db.userAchievements.insert({
        userId: adminUser.id,
        achievementId: ach.id,
        achievementCode: ach.code,
        unlockedAt: new Date().toISOString(),
      });
      db.userAchievements.insert({
        userId: coderUser.id,
        achievementId: ach.id,
        achievementCode: ach.code,
        unlockedAt: new Date().toISOString(),
      });
    }

    // Sample Notification
    db.notifications.insert({
      userId: adminUser.id,
      title: 'Welcome to CodeArena!',
      message: 'Explore challenges, earn XP, maintain streaks, and challenge developers in 1v1 battles.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Sample Battle room (waiting)
    db.battles.insert({
      code: 'ARENA-772',
      title: 'Speed Duel: Array Mastery',
      problemId: p1.id,
      problemTitle: p1.title,
      problemDifficulty: p1.difficulty,
      status: 'waiting',
      durationSeconds: 600,
      createdBy: coderUser.id,
      createdByName: coderUser.username,
      createdAt: new Date().toISOString(),
    });

    // Seed Completed Battles for History
    const battleData = [
      {
        code: 'ARENA-541',
        title: 'Two Sum Lightning Duel',
        prob: p1,
        winner: adminUser,
        loser: coderUser,
        hoursAgo: 3,
        winTime: 42,
        loseTime: 68,
      },
      {
        code: 'ARENA-492',
        title: 'Palindrome Blitz Showdown',
        prob: p2,
        winner: coderUser,
        loser: adminUser,
        hoursAgo: 8,
        winTime: 31,
        loseTime: 49,
      },
      {
        code: 'ARENA-388',
        title: 'Valid Parentheses Clash',
        prob: sampleProblems[2] || p1,
        winner: adminUser,
        loser: coderUser,
        hoursAgo: 24,
        winTime: 55,
        loseTime: 92,
      },
      {
        code: 'ARENA-271',
        title: 'Merge Sorted Lists Speed Run',
        prob: sampleProblems[3] || p2,
        winner: coderUser,
        loser: adminUser,
        hoursAgo: 48,
        winTime: 38,
        loseTime: 71,
      },
      {
        code: 'ARENA-119',
        title: 'Maximum Subarray Championship',
        prob: sampleProblems[4] || p1,
        winner: adminUser,
        loser: coderUser,
        hoursAgo: 72,
        winTime: 64,
        loseTime: 110,
      },
    ];

    for (const b of battleData) {
      const endedAt = new Date(Date.now() - b.hoursAgo * 3600000).toISOString();
      const createdAt = new Date(Date.now() - (b.hoursAgo * 3600000 + 120000)).toISOString();

      const createdBattle = db.battles.insert({
        code: b.code,
        title: b.title,
        problemId: b.prob.id,
        problemTitle: b.prob.title,
        problemDifficulty: b.prob.difficulty,
        status: 'completed',
        durationSeconds: 600,
        createdBy: b.winner.id,
        createdByName: b.winner.username,
        winnerId: b.winner.id,
        winnerUsername: b.winner.username,
        createdAt,
        endedAt,
      });

      // Winner participant
      db.battleParticipants.insert({
        battleId: createdBattle.id,
        userId: b.winner.id,
        username: b.winner.username,
        profileImage: b.winner.profileImage,
        status: 'submitted',
        testsPassed: b.prob.testCases.length,
        totalTests: b.prob.testCases.length,
        executionTimeMs: b.winTime,
        score: 200,
        submittedAt: endedAt,
      });

      // Loser participant
      db.battleParticipants.insert({
        battleId: createdBattle.id,
        userId: b.loser.id,
        username: b.loser.username,
        profileImage: b.loser.profileImage,
        status: 'coding',
        testsPassed: Math.max(1, b.prob.testCases.length - 1),
        totalTests: b.prob.testCases.length,
        executionTimeMs: b.loseTime,
        score: 50,
        submittedAt: endedAt,
      });
    }
  }

  console.log('Database seeded successfully.');
}
