/**
 * ADMIN GOD-MODE SERVER ENTRY POINT
 * Run separately from user API
 */

import { adminGodServer } from './admin/godServer';
import { systemMonitor } from './system/healthMonitor';

// Prevent silent exits
process.on('uncaughtException', (error) => {
  console.error('[ADMIN] 🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ADMIN] 🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start system monitoring
systemMonitor.startMonitoring();

// Listen for critical events
systemMonitor.on('critical', (health) => {
  console.error('[ADMIN] 🚨 CRITICAL SYSTEM STATE:', health);
});

systemMonitor.on('cooling-start', () => {
  console.log('[ADMIN] ❄️  Cooling mode activated');
});

systemMonitor.on('cooling-end', () => {
  console.log('[ADMIN] ✅ System cooled down');
});

// Start god-mode server
adminGodServer.start();

console.log('');
console.log('🛡️  FORTRESS MODE: Users cannot access this server');
console.log('');

// Keep process alive
setInterval(() => {
  // Just to keep the process running
}, 60000);
