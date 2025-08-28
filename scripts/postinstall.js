#!/usr/bin/env node

/**
 * Post-install script for production deployment
 * Only runs database migrations when NODE_ENV is production
 * Optimized for Vercel deployment with Neon.com database
 */

const { execSync } = require('child_process');

function runPostInstall() {
  console.log('🚀 Running post-install script...');
  
  const nodeEnv = process.env.NODE_ENV;
  console.log(`📊 NODE_ENV: ${nodeEnv}`);
  
  // Only run database operations in production
  if (nodeEnv === 'sandbox') {
    console.log('🌍 Production environment detected');
    console.log('📦 Running database migrations...');
    
    try {
      // Generate migration files
      execSync('pnpm db:generate', { stdio: 'inherit' });
      console.log('✅ Database migration files generated');
      
      // Run migrations
      execSync('pnpm db:migrate', { stdio: 'inherit' });
      console.log('✅ Database migrations completed');
      
      console.log('🎉 Post-install script completed successfully!');
    } catch (error) {
      console.error('❌ Error during post-install script:', error.message);
      process.exit(1);
    }
  } else {
    console.log('🔧 Development environment - skipping database migrations');
    console.log('💡 To run migrations manually, use: pnpm db:generate && pnpm db:migrate');
  }
}

runPostInstall();
