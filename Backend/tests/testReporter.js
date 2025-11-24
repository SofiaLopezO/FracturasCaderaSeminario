const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '..', 'test-results.json');

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m',
  green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', red: '\x1b[31m',
};

const fmt = ms => (ms < 1 ? `${(ms * 1000).toFixed(2)}μs`
                 : ms < 1000 ? `${ms.toFixed(2)}ms`
                 : `${(ms / 1000).toFixed(2)}s`);

const sep = (ch='=', n=80) => console.log(colors.cyan + ch.repeat(n) + colors.reset);
const header = t => { sep(); console.log(colors.bright + colors.blue + `  ${t}` + colors.reset); sep(); };

function analyze() {
  if (!fs.existsSync(resultsPath)) {
    console.log(`${colors.yellow}⚠ No se encontró ${resultsPath}${colors.reset}`);
    console.log(`${colors.cyan}ℹ Ejecuta primero: npm test${colors.reset}`);
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const testsResults = results.testResults || [];

  header('📊 RESUMEN DE TIEMPOS DE EJECUCIÓN DE TESTS');
  console.log();

  const totalTests  = results.numTotalTests  || 0;
  const passedTests = results.numPassedTests || 0;
  const failedTests = results.numFailedTests || 0;
  const totalTimeMs = testsResults.reduce((s,f)=> s + ((f.endTime||0) - (f.startTime||0)), 0);

  console.log(`${colors.bright}Tests totales:${colors.reset} ${totalTests}`);
  console.log(`${colors.green}✓ Pasaron:${colors.reset} ${passedTests}`);
  if (failedTests > 0) console.log(`${colors.red}✗ Fallaron:${colors.reset} ${failedTests}`);
  console.log(`${colors.bright}Tiempo total:${colors.reset} ${fmt(totalTimeMs)}\n`);

  header('⏱️  TIEMPO POR SUITE'); console.log();

  const suites = testsResults.map(f => {
    const fileName = path.basename(f.name || '');
    const time = (f.endTime||0) - (f.startTime||0);
    const num = (f.assertionResults?.length) || 0;
    const avg = num ? time / num : time;
    return { fileName, time, num, avg, tests: f.assertionResults || [] };
  }).sort((a,b)=> b.time - a.time);

  suites.forEach((s, i) => {
    const color = s.time > 1000 ? colors.red : s.time > 300 ? colors.yellow : colors.green;
    console.log(`${colors.bright}${i+1}. ${s.fileName}${colors.reset}`);
    console.log(`   ${color}Tiempo total: ${fmt(s.time)}${colors.reset}`);
    console.log(`   Tests: ${s.num}`);
    console.log(`   Promedio por test: ${fmt(s.avg)}\n`);
  });

  header('🐌 TESTS MÁS LENTOS (Top 10)'); console.log();

  const allTests = [];
  suites.forEach(s => s.tests.forEach(t => {
    const dur = Number.isFinite(t.duration) ? t.duration : 0;
    allTests.push({ title: t.title, fileName: s.fileName, duration: dur, status: t.status });
  }));
  allTests.sort((a,b)=> b.duration - a.duration);

  allTests.slice(0, 10).forEach((t, i) => {
    const icon = t.status === 'passed' ? '✓' : '✗';
    const stat = t.status === 'passed' ? colors.green : colors.red;
    const col  = t.duration > 1000 ? colors.red : t.duration > 300 ? colors.yellow : colors.green;
    console.log(`${i+1}. ${stat}${icon}${colors.reset} ${t.title}`);
    console.log(`   ${colors.cyan}${t.fileName}${colors.reset}`);
    console.log(`   ${col}${fmt(t.duration)}${colors.reset}\n`);
  });

  header('📈 ESTADÍSTICAS ADICIONALES'); console.log();

  const times = allTests.map(t => t.duration).filter(Number.isFinite);
  const avg = times.length ? times.reduce((a,b)=>a+b,0)/times.length : 0;
  const min = times.length ? Math.min(...times) : 0;
  const max = times.length ? Math.max(...times) : 0;
  const sorted = [...times].sort((a,b)=>a-b);
  const med = sorted.length ? sorted[Math.floor(sorted.length/2)] : 0;

  console.log(`${colors.bright}Tiempo promedio por test:${colors.reset} ${fmt(avg)}`);
  console.log(`${colors.bright}Test más rápido:${colors.reset} ${fmt(min)}`);
  console.log(`${colors.bright}Test más lento:${colors.reset} ${fmt(max)}`);
  console.log(`${colors.bright}Mediana:${colors.reset} ${fmt(med)}\n`);

  sep();
}

analyze();
