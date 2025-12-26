/**
 * Environment Configuration Loader
 * Loads appropriate .env file based on NODE_ENV
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Determine environment
const environment = process.env.NODE_ENV || 'development';

// Define environment file paths
const envFiles = [
  // Environment-specific file
  resolve(__dirname, ../../.env.),
  // Default .env file
  resolve(__dirname, '../../.env'),
  // Legacy support
  resolve(__dirname, '../../.env.local')
];

// Load the first existing environment file
let envLoaded = false;
for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    console.log(🔧 Loading environment from: );
    config({ path: envFile });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No environment file found, using process.env variables');
}

// Environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

// Export environment configuration
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000'),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
  
  // Flags
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',
  isTesting: environment === 'test'
};

console.log(🚀 Environment: );
console.log(📊 Frontend URL: );
console.log(🔗 Backend URL: );
