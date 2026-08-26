'use strict';

/**
 * ============================================================
 *  BASELINE / LOAD TEST — Hyper-localService
 *  Tool    : autocannon (Node.js HTTP benchmarking)
 *  Config  : 100 virtual users | 60 seconds | all endpoints
 * ============================================================
 */

const autocannon = require('autocannon');
const ExcelJS    = require('exceljs');
const fs         = require('fs');
const path       = require('path');

// ──────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────
const VIRTUAL_USERS   = 100;          // concurrent connections
const DURATION_SECS   = 60;           // test duration in seconds
const OTP_SERVER_URL  = 'http://localhost:3001';
const FRONTEND_URL    = 'http://localhost:8080';
const OUTPUT_DIR      = path.join(__dirname, 'load-test-results');

// Make sure output folder exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Shared results store
const allResults = [];

// ──────────────────────────────────────────────────────────────
// HELPER: pretty-print latency
// ──────────────────────────────────────────────────────────────
function fmtMs(val) {
    if (val === undefined || val === null) return 'N/A';
    return `${val} ms`;
}

// ──────────────────────────────────────────────────────────────
// HELPER: run one autocannon scenario and return a promise
// ──────────────────────────────────────────────────────────────
function runScenario(label, opts) {
    return new Promise((resolve, reject) => {
        const instance = autocannon({
            ...opts,
            connections : VIRTUAL_USERS,
            duration    : DURATION_SECS,
            pipelining  : 1,
        }, (err, result) => {
            if (err) return reject(err);

            const summary = {
                label,
                url            : opts.url,
                method         : (opts.requests && opts.requests[0] && opts.requests[0].method) || 'GET',
                virtualUsers   : VIRTUAL_USERS,
                durationSecs   : DURATION_SECS,
                totalRequests  : result.requests.total,
                rps            : result.requests.average.toFixed(2),
                throughputMBps : (result.throughput.average / 1024 / 1024).toFixed(3),
                latencyAvgMs   : result.latency.average,
                latencyMinMs   : result.latency.min,
                latencyMaxMs   : result.latency.max,
                latencyP50Ms   : result.latency.p50,
                latencyP90Ms   : result.latency.p90,
                latencyP99Ms   : result.latency.p99,
                errors         : result.errors,
                timeouts       : result.timeouts,
                non2xxResponses: result.non2xx,
                status         : result.errors > result.requests.total * 0.1
                                    ? 'FAIL' : 'PASS',
            };

            allResults.push(summary);
            return resolve(summary);
        });

        // Live progress to console
        autocannon.track(instance, {
            renderProgressBar  : true,
            renderResultsTable : true,
            renderLatencyTable : true,
        });
    });
}

// ──────────────────────────────────────────────────────────────
// HELPER: console banner
// ──────────────────────────────────────────────────────────────
function banner(text) {
    const line = '═'.repeat(60);
    console.log(`\n${line}`);
    console.log(`  ${text}`);
    console.log(`${line}\n`);
}

// ──────────────────────────────────────────────────────────────
// HELPER: print per-scenario summary
// ──────────────────────────────────────────────────────────────
function printSummary(r) {
    console.log(`\n  ✅  ${r.label}`);
    console.log(`     URL             : ${r.url}`);
    console.log(`     Method          : ${r.method}`);
    console.log(`     Virtual Users   : ${r.virtualUsers}`);
    console.log(`     Duration        : ${r.durationSecs}s`);
    console.log(`     Total Requests  : ${r.totalRequests.toLocaleString()}`);
    console.log(`     RPS (avg)       : ${r.rps} req/sec`);
    console.log(`     Throughput      : ${r.throughputMBps} MB/s`);
    console.log(`     Latency Avg     : ${fmtMs(r.latencyAvgMs)}`);
    console.log(`     Latency Min     : ${fmtMs(r.latencyMinMs)}`);
    console.log(`     Latency Max     : ${fmtMs(r.latencyMaxMs)}`);
    console.log(`     Latency p50     : ${fmtMs(r.latencyP50Ms)}`);
    console.log(`     Latency p90     : ${fmtMs(r.latencyP90Ms)}`);
    console.log(`     Latency p99     : ${fmtMs(r.latencyP99Ms)}`);
    console.log(`     Errors          : ${r.errors}`);
    console.log(`     Timeouts        : ${r.timeouts}`);
    console.log(`     Non-2xx         : ${r.non2xxResponses}`);
    console.log(`     Status          : ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
}

// ──────────────────────────────────────────────────────────────
// MAIN: Run all load-test scenarios sequentially
// ──────────────────────────────────────────────────────────────
async function main() {
    banner('BASELINE / LOAD TEST  —  Hyper-localService');
    console.log(`  Virtual Users  : ${VIRTUAL_USERS}`);
    console.log(`  Duration/Test  : ${DURATION_SECS} seconds`);
    console.log(`  OTP Server     : ${OTP_SERVER_URL}`);
    console.log(`  Frontend       : ${FRONTEND_URL}`);
    console.log(`\n  NOTE: Make sure the servers are running before starting.`);
    console.log(`  OTP server : node server.js`);
    console.log(`  Frontend   : npx http-server -p 8080`);

    // ── SCENARIO 1: GET /  (Frontend home page) ──────────────
    banner('SCENARIO 1/4 — GET / (Frontend Homepage)');
    try {
        const r1 = await runScenario('GET / — Frontend Homepage', {
            url: `${FRONTEND_URL}/`,
        });
        printSummary(r1);
    } catch (e) {
        console.error(`  ⚠️  Scenario 1 failed: ${e.message}`);
        allResults.push({
            label: 'GET / — Frontend Homepage', url: FRONTEND_URL, method: 'GET',
            virtualUsers: VIRTUAL_USERS, durationSecs: DURATION_SECS,
            totalRequests: 0, rps: 0, throughputMBps: 0,
            latencyAvgMs: 0, latencyMinMs: 0, latencyMaxMs: 0,
            latencyP50Ms: 0, latencyP90Ms: 0, latencyP99Ms: 0,
            errors: 1, timeouts: 0, non2xxResponses: 0, status: 'FAIL (server offline)',
        });
    }

    // ── SCENARIO 2: GET /index.html  ─────────────────────────
    banner('SCENARIO 2/4 — GET /index.html');
    try {
        const r2 = await runScenario('GET /index.html — HTML Asset', {
            url: `${FRONTEND_URL}/index.html`,
        });
        printSummary(r2);
    } catch (e) {
        console.error(`  ⚠️  Scenario 2 failed: ${e.message}`);
        allResults.push({
            label: 'GET /index.html', url: `${FRONTEND_URL}/index.html`, method: 'GET',
            virtualUsers: VIRTUAL_USERS, durationSecs: DURATION_SECS,
            totalRequests: 0, rps: 0, throughputMBps: 0,
            latencyAvgMs: 0, latencyMinMs: 0, latencyMaxMs: 0,
            latencyP50Ms: 0, latencyP90Ms: 0, latencyP99Ms: 0,
            errors: 1, timeouts: 0, non2xxResponses: 0, status: 'FAIL (server offline)',
        });
    }

    // ── SCENARIO 3: POST /send-otp — valid payload ───────────
    banner('SCENARIO 3/4 — POST /send-otp (OTP API, Valid Payload)');
    try {
        const r3 = await runScenario('POST /send-otp — Valid Payload', {
            url: `${OTP_SERVER_URL}/send-otp`,
            requests: [{
                method : 'POST',
                path   : '/send-otp',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({ email: 'loadtest@example.com', otp: '123456' }),
            }],
        });
        printSummary(r3);
    } catch (e) {
        console.error(`  ⚠️  Scenario 3 failed: ${e.message}`);
        allResults.push({
            label: 'POST /send-otp — Valid Payload', url: `${OTP_SERVER_URL}/send-otp`, method: 'POST',
            virtualUsers: VIRTUAL_USERS, durationSecs: DURATION_SECS,
            totalRequests: 0, rps: 0, throughputMBps: 0,
            latencyAvgMs: 0, latencyMinMs: 0, latencyMaxMs: 0,
            latencyP50Ms: 0, latencyP90Ms: 0, latencyP99Ms: 0,
            errors: 1, timeouts: 0, non2xxResponses: 0, status: 'FAIL (server offline)',
        });
    }

    // ── SCENARIO 4: POST /send-otp — missing fields ──────────
    banner('SCENARIO 4/4 — POST /send-otp (OTP API, Missing Fields)');
    try {
        const r4 = await runScenario('POST /send-otp — Missing Fields (400 path)', {
            url: `${OTP_SERVER_URL}/send-otp`,
            requests: [{
                method : 'POST',
                path   : '/send-otp',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({}),
            }],
        });
        printSummary(r4);
    } catch (e) {
        console.error(`  ⚠️  Scenario 4 failed: ${e.message}`);
        allResults.push({
            label: 'POST /send-otp — Missing Fields', url: `${OTP_SERVER_URL}/send-otp`, method: 'POST',
            virtualUsers: VIRTUAL_USERS, durationSecs: DURATION_SECS,
            totalRequests: 0, rps: 0, throughputMBps: 0,
            latencyAvgMs: 0, latencyMinMs: 0, latencyMaxMs: 0,
            latencyP50Ms: 0, latencyP90Ms: 0, latencyP99Ms: 0,
            errors: 1, timeouts: 0, non2xxResponses: 0, status: 'FAIL (server offline)',
        });
    }

    // ──────────────────────────────────────────────────────────
    // Generate Reports
    // ──────────────────────────────────────────────────────────
    await generateExcelReport(allResults);
    generateTextReport(allResults);
    banner('LOAD TEST COMPLETE — Reports saved in /load-test-results/');
}

// ──────────────────────────────────────────────────────────────
// REPORT: Excel
// ──────────────────────────────────────────────────────────────
async function generateExcelReport(results) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Load Test Tool — Hyper-localService';
    workbook.created = new Date();

    // ── Sheet 1: Full Results ─────────────────────────────────
    const mainSheet = workbook.addWorksheet('Load Test Results');
    mainSheet.columns = [
        { header: 'Scenario',           key: 'label',           width: 38 },
        { header: 'URL',                key: 'url',             width: 35 },
        { header: 'Method',             key: 'method',          width: 8  },
        { header: 'Virtual Users',      key: 'virtualUsers',    width: 14 },
        { header: 'Duration (s)',        key: 'durationSecs',    width: 12 },
        { header: 'Total Requests',     key: 'totalRequests',   width: 15 },
        { header: 'RPS (avg)',          key: 'rps',             width: 12 },
        { header: 'Throughput (MB/s)',  key: 'throughputMBps',  width: 16 },
        { header: 'Latency Avg (ms)',   key: 'latencyAvgMs',    width: 16 },
        { header: 'Latency Min (ms)',   key: 'latencyMinMs',    width: 16 },
        { header: 'Latency Max (ms)',   key: 'latencyMaxMs',    width: 16 },
        { header: 'Latency p50 (ms)',   key: 'latencyP50Ms',    width: 16 },
        { header: 'Latency p90 (ms)',   key: 'latencyP90Ms',    width: 16 },
        { header: 'Latency p99 (ms)',   key: 'latencyP99Ms',    width: 16 },
        { header: 'Errors',             key: 'errors',          width: 10 },
        { header: 'Timeouts',           key: 'timeouts',        width: 10 },
        { header: 'Non-2xx Responses',  key: 'non2xxResponses', width: 18 },
        { header: 'Status',             key: 'status',          width: 14 },
    ];

    // Header style
    const headerRow = mainSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D47A1' } };
    headerRow.alignment = { horizontal: 'center' };

    results.forEach((r) => {
        const row = mainSheet.addRow(r);
        row.alignment = { vertical: 'middle' };

        // Colour the Status cell
        const statusCell = row.getCell('status');
        if (String(r.status).startsWith('PASS')) {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
            statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        } else {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF5252' } };
            statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        }

        // Colour latency avg if > 1000 ms
        const latAvgCell = row.getCell('latencyAvgMs');
        if (Number(r.latencyAvgMs) > 1000) {
            latAvgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } };
            latAvgCell.font = { bold: true, color: { argb: 'FFCC0000' } };
        } else if (Number(r.latencyAvgMs) > 500) {
            latAvgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
        }

        // Colour RPS
        const rpsCell = row.getCell('rps');
        if (Number(r.rps) > 500) {
            rpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
            rpsCell.font = { bold: true, color: { argb: 'FF2E7D32' } };
        }
    });

    // ── Sheet 2: Summary Dashboard ────────────────────────────
    const summarySheet = workbook.addWorksheet('Summary Dashboard');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value',  key: 'value',  width: 25 },
    ];
    const shRow = summarySheet.getRow(1);
    shRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    shRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D47A1' } };

    const totalReqs  = results.reduce((s, r) => s + (Number(r.totalRequests) || 0), 0);
    const avgRPS     = results.length > 0
        ? (results.reduce((s, r) => s + (Number(r.rps) || 0), 0) / results.length).toFixed(2)
        : 0;
    const avgLat     = results.length > 0
        ? Math.round(results.reduce((s, r) => s + (Number(r.latencyAvgMs) || 0), 0) / results.length)
        : 0;
    const minLat     = results.length > 0 ? Math.min(...results.map(r => Number(r.latencyMinMs) || 9999)) : 0;
    const maxLat     = results.length > 0 ? Math.max(...results.map(r => Number(r.latencyMaxMs) || 0)) : 0;
    const totalErrs  = results.reduce((s, r) => s + (Number(r.errors) || 0), 0);
    const passCount  = results.filter(r => String(r.status).startsWith('PASS')).length;

    const summaryData = [
        { metric: '🧪 Test Type',              value: 'Baseline / Load Test'                   },
        { metric: '👥 Virtual Users',           value: `${VIRTUAL_USERS} concurrent`            },
        { metric: '⏱ Duration per Scenario',   value: `${DURATION_SECS} seconds`               },
        { metric: '📋 Scenarios Executed',      value: results.length                           },
        { metric: '✅ Scenarios Passed',        value: passCount                                },
        { metric: '❌ Scenarios Failed',        value: results.length - passCount               },
        { metric: '📦 Total Requests Sent',     value: totalReqs.toLocaleString()               },
        { metric: '⚡ Average RPS',             value: `${avgRPS} requests/second`              },
        { metric: '📊 Average Latency',         value: `${avgLat} ms`                           },
        { metric: '🐢 Min Latency (fastest)',   value: `${minLat} ms`                           },
        { metric: '🐌 Max Latency (slowest)',   value: `${maxLat} ms`                           },
        { metric: '💥 Total Errors',            value: totalErrs                                },
        { metric: '📅 Test Date',               value: new Date().toLocaleString()              },
    ];

    summaryData.forEach(d => {
        const row = summarySheet.addRow(d);
        row.alignment = { vertical: 'middle' };
    });

    // ── Sheet 3: Latency Thresholds ───────────────────────────
    const threshSheet = workbook.addWorksheet('Latency Thresholds');
    threshSheet.columns = [
        { header: 'Scenario',      key: 'label',        width: 38 },
        { header: 'Avg (ms)',      key: 'latencyAvgMs', width: 14 },
        { header: 'p50 (ms)',      key: 'latencyP50Ms', width: 14 },
        { header: 'p90 (ms)',      key: 'latencyP90Ms', width: 14 },
        { header: 'p99 (ms)',      key: 'latencyP99Ms', width: 14 },
        { header: 'Max (ms)',      key: 'latencyMaxMs', width: 14 },
        { header: 'RPS',           key: 'rps',          width: 12 },
        { header: 'Grade',         key: 'grade',        width: 10 },
    ];
    const thRow = threshSheet.getRow(1);
    thRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    thRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D47A1' } };

    results.forEach((r) => {
        const avg = Number(r.latencyAvgMs) || 0;
        const grade = avg < 200 ? 'A (Excellent)' : avg < 500 ? 'B (Good)' : avg < 1000 ? 'C (Fair)' : 'D (Slow)';
        const gradeColor = avg < 200 ? 'FF4CAF50' : avg < 500 ? 'FF8BC34A' : avg < 1000 ? 'FFFFC107' : 'FFFF5252';

        const row = threshSheet.addRow({
            label: r.label, latencyAvgMs: r.latencyAvgMs, latencyP50Ms: r.latencyP50Ms,
            latencyP90Ms: r.latencyP90Ms, latencyP99Ms: r.latencyP99Ms, latencyMaxMs: r.latencyMaxMs,
            rps: r.rps, grade,
        });
        row.getCell('grade').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: gradeColor } };
        row.getCell('grade').font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // ── Sheet 4: Per-Second Interpretation Guide ──────────────
    const guideSheet = workbook.addWorksheet('Reading Guide');
    guideSheet.columns = [
        { header: 'Metric',      key: 'metric',  width: 25 },
        { header: 'What it Means', key: 'meaning', width: 55 },
        { header: 'Good Threshold', key: 'good',  width: 25 },
    ];
    const gRow = guideSheet.getRow(1);
    gRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    gRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D47A1' } };

    const guide = [
        { metric: 'RPS (req/sec)', meaning: 'Number of HTTP requests your server handles every second. Higher = better performance.', good: '> 100 req/sec = Good' },
        { metric: 'Latency Avg', meaning: 'Average time (ms) from sending request to receiving a full response.', good: '< 250 ms = Good' },
        { metric: 'Latency Min', meaning: 'Fastest single request observed during the test. Best-case performance.', good: '< 50 ms = Excellent' },
        { metric: 'Latency Max', meaning: 'Slowest single request observed. Indicates worst-case for any user.', good: '< 2000 ms = Acceptable' },
        { metric: 'Latency p50', meaning: '50% of requests were faster than this. The median response time most users experience.', good: '< 300 ms = Good' },
        { metric: 'Latency p90', meaning: '90% of requests were faster than this. Represents your slow-tail users.', good: '< 500 ms = Good' },
        { metric: 'Latency p99', meaning: '99% of requests were faster than this. Your worst 1% of users.', good: '< 1000 ms = Acceptable' },
        { metric: 'Errors', meaning: 'Requests that resulted in a network error (connection refused, timeout, etc.)', good: '0 = Perfect' },
        { metric: 'Timeouts', meaning: 'Requests that exceeded the timeout window before getting any response.', good: '0 = Perfect' },
        { metric: 'Non-2xx', meaning: 'Responses with status codes outside 200-299 (e.g., 400, 500 errors).', good: '< 1% of total' },
        { metric: 'Throughput (MB/s)', meaning: 'Total data transferred per second. Useful for bandwidth analysis.', good: 'Depends on payload size' },
        { metric: 'Virtual Users', meaning: 'Number of concurrent HTTP connections simulated simultaneously.', good: 'Test used 100' },
    ];

    guide.forEach(g => guideSheet.addRow(g));

    // Save file
    const outputPath = path.join(OUTPUT_DIR, 'LoadTestReport.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n  📊 Excel report saved: ${outputPath}`);
}

// ──────────────────────────────────────────────────────────────
// REPORT: Plain text summary
// ──────────────────────────────────────────────────────────────
function generateTextReport(results) {
    const lines = [];
    const sep   = '═'.repeat(70);

    lines.push(sep);
    lines.push('  LOAD TEST REPORT — Hyper-localService');
    lines.push(`  Generated: ${new Date().toLocaleString()}`);
    lines.push(sep);
    lines.push(`  Virtual Users   : ${VIRTUAL_USERS} concurrent`);
    lines.push(`  Duration        : ${DURATION_SECS} seconds per scenario`);
    lines.push('');

    results.forEach((r, i) => {
        lines.push(`  [${i + 1}] ${r.label}`);
        lines.push(`      URL             : ${r.url}`);
        lines.push(`      Method          : ${r.method}`);
        lines.push(`      Total Requests  : ${Number(r.totalRequests).toLocaleString()}`);
        lines.push(`      RPS (avg)       : ${r.rps} req/sec`);
        lines.push(`      Latency         : Avg=${fmtMs(r.latencyAvgMs)}  Min=${fmtMs(r.latencyMinMs)}  Max=${fmtMs(r.latencyMaxMs)}`);
        lines.push(`      Percentiles     : p50=${fmtMs(r.latencyP50Ms)}  p90=${fmtMs(r.latencyP90Ms)}  p99=${fmtMs(r.latencyP99Ms)}`);
        lines.push(`      Errors          : ${r.errors}  |  Timeouts: ${r.timeouts}  |  Non-2xx: ${r.non2xxResponses}`);
        lines.push(`      Status          : ${r.status}`);
        lines.push('');
    });

    lines.push(sep);
    const outputPath = path.join(OUTPUT_DIR, 'LoadTestReport.txt');
    fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
    console.log(`  📄 Text report saved:  ${outputPath}`);
}

// ──────────────────────────────────────────────────────────────
// ENTRY POINT
// ──────────────────────────────────────────────────────────────
main().catch((err) => {
    console.error('\n  ❌ Load test failed with an unexpected error:', err);
    process.exit(1);
});
