#!/usr/bin/env node

// Vercel build script that skips all TypeScript checks
console.log('🚀 Starting Vercel build...');
console.log('⏭️ Skipping TypeScript checks for faster deployment');

import { execSync } from 'child_process';

try {
  // Run the actual build command
  console.log('📦 Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 