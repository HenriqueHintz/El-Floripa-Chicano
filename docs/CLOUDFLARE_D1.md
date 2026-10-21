# Cloudflare D1 Database — El Chicano

Banco de dados relacional distribuído na borda (Cloudflare D1 SQL) configurado para permitir atualizações mensais de pratos, preços, horários de funcionamento e status das casas com máxima performance (<15ms de latência global).

---

## 1. Identificação do Banco no Cloudflare

* **Nome do Banco:** `el-chicano-db`
* **Database ID (UUID):** `08b76053-a2b4-4bca-938e-cd0777adc498`
* **Região Primária:** ENAM (com replicação e cache de leitura global nos 330+ data centers Cloudflare)
* **Status:** Produção Ativa

---

## 2. Estrutura de Tabelas (Schema)

### A. `categories` (Categorias do Cardápio)
* `id` (TEXT PRIMARY KEY)
* `name` (TEXT)
* `slug` (TEXT UNIQUE)
* `count` (INTEGER)
* `order_index` (INTEGER)
* `color` (TEXT)
* `is_active` (INTEGER DEFAULT 1)

### B. `products` (Produtos & Pratos)
* `id` (TEXT PRIMARY KEY)
* `name` (TEXT)
* `category` (TEXT)
* `description` (TEXT)
* `price` (REAL)
* `tag` (TEXT)
* `image_url` (TEXT)
* `is_featured` (INTEGER DEFAULT 0)
* `is_active` (INTEGER DEFAULT 1)
* `order_index` (INTEGER DEFAULT 0)
* `updated_at` (DATETIME)

### C. `site_settings` (Configurações e Avisos Dinâmicos)
* `key` (TEXT PRIMARY KEY): `unit_floripa_status`, `unit_laguna_status`, `unit_floripa_hours`, `whatsapp_floripa`, `cardapio_web_url`, etc.
* `value` (TEXT)
* `category` (TEXT)
* `updated_at` (DATETIME)

### D. `monthly_updates` (Histórico de Modificações Mensais)
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `month_year` (TEXT)
* `title` (TEXT)
* `summary` (TEXT)
* `applied_at` (DATETIME)

---

## 3. Dados Iniciais Carregados

* **Categorias:** 11 categorias autênticas cadastradas e ativas.
* **Produtos:** 66 pratos/itens reais com fotos, descrições e preços oficiais.
* **Configurações:** 16 chaves operacionais das unidades Florianópolis e Laguna.

---

## 4. Como Fazer Atualizações Mensais

### Opção 1: Via Linha de Comando (Wrangler / Script Rápido)
```bash
# Consultar status do banco
node scripts/d1-monthly-update.js status

# Atualizar o preço de um prato (ex: produto 2624929 para R$ 52,00)
node scripts/d1-monthly-update.js update-price 2624929 52.00

# Alterar status de uma casa (ex: reabrir Laguna)
node scripts/d1-monthly-update.js set-status laguna "Aberto Hoje"

# Registrar alteração no histórico mensal
node scripts/d1-monthly-update.js log-monthly "Novembro 2026" "Lançamento da nova temporada de Tacos"
```

### Opção 2: Via SQL Direto no Cloudflare Dashboard ou Wrangler
```sql
-- Alterar preço de um item
UPDATE products SET price = 52.00, updated_at = CURRENT_TIMESTAMP WHERE id = '2624929';

-- Adicionar um prato novo no mês
INSERT INTO products (id, name, category, description, price, tag, is_featured, is_active)
VALUES ('novo-01', 'Taco Especial da Estação', 'Duplas de tacos', 'Receita sazonal com camarão e manga', 48.0, 'Especial do Mês', 1, 1);
```

---

## 5. Estratégia de Performance Máxima

1. **Latência Zero na Renderização (0ms):**
   O frontend utiliza o padrão **Stale-While-Revalidate** via [d1Api.ts](file:///c:/Users/ricop/Documents/El%20Chicano/src/services/d1Api.ts). A página carrega instantaneamente do bundle local/localStorage e, em background, busca atualizações na Edge da Cloudflare.
2. **Cache na Borda (Edge Caching):**
   O Worker [worker/index.ts](file:///c:/Users/ricop/Documents/El%20Chicano/worker/index.ts) injeta cabeçalhos HTTP:
   `Cache-Control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`
   Isso significa que requisições subsequentes são respondidas diretamente pelo cache CDN mais próximo do cliente em menos de 15ms.
