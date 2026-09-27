import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'codearena_super_secret_jwt_key_2026_conquer',
  jwtExpiresIn: '7d',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/codearena',
  judge0Url: process.env.JUDGE0_URL || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
};
