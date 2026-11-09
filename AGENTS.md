# El Chicano — Guia do Agente (`AGENTS.md`)

Site institucional e cardápio interativo do **El Chicano Mexican Food** (Laguna e Florianópolis – SC).
Visão completa das funcionalidades no [`README.md`](README.md).

## Stack

- **Frontend:** Vite 6 + React 19 + TypeScript 5 + Tailwind CSS 4 (`@tailwindcss/vite`)
- **Backend:** Cloudflare Worker (`worker/index.ts`) + Cloudflare D1 (`el-chicano-db`, binding `DB`) — config em `wrangler.jsonc`
- **Deploy:** Vercel (`vercel.json`) para o frontend; Worker/D1 via Wrangler
- **Testes/QA:** Python (`tests/run_qa_suite.py`)

## Comandos

Execute a partir de `C:\Projetos\El Chicano`:

| Comando | Finalidade |
| :--- | :--- |
| `npm run dev` | Servidor de desenvolvimento em `http://localhost:3000` |
| `npm run build` | `tsc` + build de produção em `dist/` |
| `npm run typecheck` | Checagem de tipos sem gerar arquivos |
| `npm test` | Suíte de QA (`python tests/run_qa_suite.py`) |
| `npm run test:full` | Build + suíte de QA |

## Mapa de pastas

- `src/components/` — seções e componentes da página (Header, Hero, Cardápio, Galeria…)
- `src/data/` — dados do cardápio e conteúdo estático
- `src/services/` — acesso à API/D1 (`d1Api.ts`, padrão stale-while-revalidate)
- `src/hooks/`, `src/utils/`, `src/types/` — utilitários e tipos
- `worker/` — API no Cloudflare Worker
- `scripts/` — sincronização do cardápio e capturas/auditorias visuais
- `public/` — imagens, ícones e manifesto PWA
- `docs/` — documentação (ver `docs/CLOUDFLARE_D1.md`)
- `d1-*.sql` — schema e seed do banco D1

## Regras

- Responda e documente em **português (pt-BR)**.
- Preserve a identidade visual e os dados reais da marca (pratos, endereços, telefones, links).
- Rode `npm run typecheck` e `npm run build` antes de considerar uma tarefa concluída.
- Não versionar `.env`, `dist/`, `node_modules/` nem `.control-tower/` (já no `.gitignore`).
