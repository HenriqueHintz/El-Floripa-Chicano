#!/usr/bin/env node
/**
 * El Chicano - Cloudflare D1 Monthly Management Script
 * 
 * Uso rápido:
 *   node scripts/d1-monthly-update.js status
 *   node scripts/d1-monthly-update.js update-price <id> <novo_preco>
 *   node scripts/d1-monthly-update.js set-status <floripa|laguna> <Aberto|Fechado>
 *   node scripts/d1-monthly-update.js log-monthly "Outubro 2026" "Ajuste de safra e novos pratos"
 */

import { execSync } from 'child_process';

const DB_NAME = 'el-chicano-db';
const action = process.argv[2] || 'status';

function runD1Sql(sql) {
  const cleanSql = sql.replace(/"/g, '\"');
  const cmd = `npx wrangler d1 execute ${DB_NAME} --remote --command="${cleanSql}"`;
  try {
    console.log(`\n📡 Executando no Cloudflare D1 (${DB_NAME})...`);
    const output = execSync(cmd, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
    console.log(output);
  } catch (err) {
    console.error('❌ Erro executando no D1:', err.message);
  }
}

switch (action) {
  case 'status': {
    console.log('🌮 === STATUS DO BANCO DE DADOS CLOUDFLARE D1 (EL CHICANO) ===');
    runD1Sql(`
      SELECT 
        (SELECT COUNT(*) FROM categories WHERE is_active = 1) AS categorias_ativas,
        (SELECT COUNT(*) FROM products WHERE is_active = 1) AS produtos_ativos,
        (SELECT COUNT(*) FROM monthly_updates) AS historico_atualizacoes;
    `);
    break;
  }

  case 'update-price': {
    const id = process.argv[3];
    const price = parseFloat(process.argv[4]);
    if (!id || isNaN(price)) {
      console.error('Uso: node scripts/d1-monthly-update.js update-price <id_produto> <novo_preco>');
      process.exit(1);
    }
    console.log(`Atualizando produto ${id} para R$ ${price.toFixed(2)}...`);
    runD1Sql(`UPDATE products SET price = ${price}, updated_at = CURRENT_TIMESTAMP WHERE id = '${id}';`);
    break;
  }

  case 'set-status': {
    const unit = process.argv[3]; // floripa ou laguna
    const statusText = process.argv[4]; // ex: "Aberto Hoje" ou "Fechado Temporariamente"
    if (!unit || !statusText) {
      console.error('Uso: node scripts/d1-monthly-update.js set-status <floripa|laguna> "<Status>"');
      process.exit(1);
    }
    const key = unit.toLowerCase().includes('laguna') ? 'unit_laguna_status' : 'unit_floripa_status';
    runD1Sql(`UPDATE site_settings SET value = '${statusText}', updated_at = CURRENT_TIMESTAMP WHERE key = '${key}';`);
    break;
  }

  case 'log-monthly': {
    const monthYear = process.argv[3] || 'Mensal';
    const summary = process.argv[4] || 'Atualização mensal realizada com sucesso.';
    runD1Sql(`INSERT INTO monthly_updates (month_year, title, summary) VALUES ('${monthYear}', 'Atualização Mensal', '${summary}');`);
    break;
  }

  default:
    console.log(`Ação desconhecida: ${action}. Use: status, update-price, set-status, log-monthly.`);
}
