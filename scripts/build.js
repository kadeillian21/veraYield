/**
 * Build script that temporarily clears the DOTENV_KEY environment variable
 * to avoid warnings during build.
 */
const { execSync } = require('child_process');

// Store the original DOTENV_KEY
const originalDotenvKey = process.env.DOTENV_KEY;

// Clear DOTENV_KEY for the build process
delete process.env.DOTENV_KEY;

try {
  // Run prisma generate
  console.log('Running prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run next build
  console.log('Running next build...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Restore the original DOTENV_KEY if it existed
  if (originalDotenvKey) {
    process.env.DOTENV_KEY = originalDotenvKey;
  }
}