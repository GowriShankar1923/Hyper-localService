/**
 * GitHub API Uploader — Hyper-localService
 * Pushes project files directly to GitHub without requiring Git.
 *
 * Usage: node push-to-github.js YOUR_GITHUB_TOKEN
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const TOKEN = process.argv[2];
if (!TOKEN) {
    console.error('\n❌ ERROR: Please provide your GitHub Personal Access Token.');
    console.error('   Usage: node push-to-github.js ghp_YourTokenHere\n');
    console.error('   Get token at: https://github.com/settings/tokens');
    console.error('   Required scope: repo (full control)\n');
    process.exit(1);
}

const OWNER = 'GowriShankar1923';
const REPO  = 'Hyper-localService';
const BRANCH = 'main';

// Files to push (relative to project root)
const FILES_TO_PUSH = [
    'index.html',
    'script.js',
    'styles.css',
    'server.js',
    'sw.js',
    'manifest.json',
    'package.json',
    '.gitignore',
    'logo.png',
    // Security reports
    'Vulnerability Test Results/security-review.md',
    'Vulnerability Test Results/executive-summary.md',
    'Vulnerability Test Results/dependency-report.md',
    'Vulnerability Test Results/findings.xlsx',
    'Vulnerability Test Results/endpoint-inventory.xlsx',
    // GitHub Actions
    '.github/workflows/security-review.yml',
    // Load test
    'load-test.js',
    'load-test-results/LoadTestReport.txt',
    // Selenium tests
    'selenium-tests/tests/login-tests.js',
    // Appium tests
    'appium-tests/app-tests.js',
    'appium-tests/package.json',
    // Mobile wrapper
    'MobileWrapper/App.js',
    'MobileWrapper/package.json',
    'MobileWrapper/app.json',
];

const ROOT = __dirname;
const octokit = new Octokit({ auth: TOKEN });

async function fileToBase64(filePath) {
    const fullPath = path.join(ROOT, filePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath).toString('base64');
}

async function getSHA(filePath) {
    try {
        const res = await octokit.repos.getContent({
            owner: OWNER, repo: REPO, path: filePath, ref: BRANCH,
        });
        return res.data.sha;
    } catch {
        return null; // File doesn't exist yet
    }
}

async function ensureRepoExists() {
    try {
        await octokit.repos.get({ owner: OWNER, repo: REPO });
        console.log(`✅ Repo found: https://github.com/${OWNER}/${REPO}`);
    } catch (e) {
        console.log(`📁 Repo not found. Creating: ${REPO}...`);
        await octokit.repos.createForAuthenticatedUser({
            name: REPO,
            description: 'Hyper-localService — Hyperlocal Service Booking Platform',
            private: false,
            auto_init: true,
        });
        console.log('✅ Repository created!');
        // Give GitHub a moment to initialize
        await new Promise(r => setTimeout(r, 3000));
    }
}

async function pushFile(filePath) {
    const content = await fileToBase64(filePath);
    if (!content) {
        console.log(`  ⚠️  SKIP (not found): ${filePath}`);
        return;
    }

    const sha = await getSHA(filePath);
    const message = sha
        ? `update: ${path.basename(filePath)}`
        : `add: ${path.basename(filePath)}`;

    try {
        await octokit.repos.createOrUpdateFileContents({
            owner: OWNER,
            repo: REPO,
            path: filePath,
            message,
            content,
            sha: sha || undefined,
            branch: BRANCH,
        });
        console.log(`  ✅  ${filePath}`);
    } catch (err) {
        console.error(`  ❌  FAILED: ${filePath} — ${err.message}`);
    }
}

async function main() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  GitHub Uploader — Hyper-localService');
    console.log(`  Repo   : https://github.com/${OWNER}/${REPO}`);
    console.log(`  Branch : ${BRANCH}`);
    console.log(`  Files  : ${FILES_TO_PUSH.length} files to push`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Verify token works
    try {
        const { data } = await octokit.users.getAuthenticated();
        console.log(`🔑 Authenticated as: ${data.login}\n`);
    } catch {
        console.error('❌ Invalid token or no internet. Check your PAT and try again.');
        process.exit(1);
    }

    await ensureRepoExists();
    console.log(`\n📤 Uploading ${FILES_TO_PUSH.length} files...\n`);

    for (const file of FILES_TO_PUSH) {
        await pushFile(file);
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅  DONE! All files pushed to GitHub.');
    console.log(`🔗  https://github.com/${OWNER}/${REPO}`);
    console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('\n❌ Unexpected error:', err.message);
    process.exit(1);
});
