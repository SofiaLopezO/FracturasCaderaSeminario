// tests/quickSummary.js
module.exports = function quickSummaryReporter() {
  const c = {
    reset: '\x1b[0m', bright: '\x1b[1m',
    green: '\x1b[32m', yellow: '\x1b[33m',
    blue: '\x1b[34m', cyan: '\x1b[36m'
  };
  const fmt = ms => (ms < 1000 ? `${Math.round(ms)}ms` : `${(ms/1000).toFixed(2)}s`);

  return {
    onFinished(ctx) {
      const state = ctx.state ?? ctx;
      const files = state.getFiles();
      const total = files.reduce((a, f) => a + f.tasks.length, 0);
      const passed = files.reduce((a, f) => a + f.tasks.filter(t => t.result?.state === 'pass').length, 0);
      const totalTime = state.duration ?? files.reduce((a, f) => a + (f.result?.duration ?? 0), 0);

      const fileStats = files.map(f => ({
        name: f.name.split('/').pop(),
        time: f.result?.duration ?? 0
      })).sort((a, b) => b.time - a.time);

      console.log('\n' + c.cyan + '━'.repeat(60) + c.reset);
      console.log(c.bright + '⏱️  Resumen de Tiempos (quickSummary)' + c.reset);
      console.log(c.cyan + '━'.repeat(60) + c.reset);

      console.log(c.bright + '\nSuites más lentas:' + c.reset);
      fileStats.slice(0, 3).forEach((f, i) => {
        const color = f.time > 300 ? c.yellow : c.green;
        console.log(`  ${i + 1}. ${f.name.padEnd(35)} ${color}${fmt(f.time)}${c.reset}`);
      });

      console.log('\n' + c.bright + 'Tiempo total de ejecución:' + c.reset, c.blue + fmt(totalTime) + c.reset);
      console.log(c.bright + 'Tests:' + c.reset, `${passed}/${total}`, '\n');
    }
  };
};
