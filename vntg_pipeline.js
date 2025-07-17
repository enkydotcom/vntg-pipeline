import { spawn } from 'child_process';

function runScript(script) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [script], { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Le script ${script} s'est terminé avec le code ${code}`));
      }
    });
  });
}

(async () => {
  try {
    console.log('🚦 Étape 1 : Détection et signalement des produits SOLD...');
    await runScript('vntage/vntg_mark_sold.js');
    console.log('✅ Étape 1 terminée.\n');

    console.log('🚦 Étape 2 : Scraping et ajout de nouveaux produits...');
    await runScript('vntage/vntg_scraper.js');
    console.log('✅ Étape 2 terminée.\n');

    console.log('🎉 Pipeline complet exécuté avec succès !');
  } catch (err) {
    console.error('❌ Erreur dans le pipeline :', err.message);
    process.exit(1);
  }
})(); 