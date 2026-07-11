const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHALLENGE_APPS_DIR = path.join(__dirname, '..', 'challenge-apps');

function buildImage(challengeDir) {
  const relativePath = path.relative(CHALLENGE_APPS_DIR, challengeDir);
  const imageName = `ctf-challenge-${relativePath.replace(/[\\/]/g, '-')}`;
  console.log(`Building ${imageName} from ${relativePath}...`);
  try {
    execSync(`docker build -t ${imageName}:latest "${challengeDir}"`, {
      stdio: 'inherit',
      cwd: challengeDir,
    });
    console.log(`  ✓ ${imageName} built`);
  } catch (err) {
    console.error(`  ✗ ${imageName} failed: ${err.message}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = fs.readdirSync(fullPath);
      if (subFiles.includes('Dockerfile')) {
        buildImage(fullPath);
      } else {
        walkDir(fullPath);
      }
    }
  }
}

console.log('=== Building Challenge Docker Images ===\n');
walkDir(CHALLENGE_APPS_DIR);
console.log('\n=== Done ===');
