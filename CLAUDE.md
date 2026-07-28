# CLAUDE.md — Projeto Kora

> Este arquivo é lido em toda sessão. Mantenha-o enxuto e factual.
> Regra de ouro: **precisão > velocidade > verbosidade**.

---

## 1. Visão geral do projeto

**Kora** — sistema de gestão de estoque e pedidos com reconhecimento de produtos por foto.

- **Domínio central:** `Pedido → Receita → Ingredientes → Movimentação de Estoque`
- **Diferencial:** catálogo dinâmico com reconhecimento visual (CLIP/OpenCLIP + pgvector) e
  **human-in-the-loop**: o modelo sugere, o usuário confirma. Nunca escreve estoque sem confirmação.
- **Público:** pequenos produtores/negócios de alimentação no Brasil (nicho mal atendido por ERPs existentes).

> ⚠️ **Mantenha esta seção atualizada.** Se algo aqui divergir do código, o código é a verdade —
> avise o usuário sobre a divergência em vez de seguir uma descrição desatualizada.

---

## 2. Regras globais (valem para todos os papéis)

### 2.1 Anti-alucinação — inegociável

1. **Nunca invente** nomes de API, assinaturas de função, flags de CLI, campos de schema ou opções de config.
2. Antes de usar qualquer símbolo do projeto, **leia o arquivo real**. Não deduza pelo nome.
3. Se não souber, escreva literalmente: *"Não tenho certeza sobre X — preciso verificar em `<arquivo>` ou na doc oficial."*
4. **Zero código placebo:** nada de `# TODO: implementar` entregue como solução, nem funções que
   retornam mock silenciosamente. Se não dá para implementar, diga por quê.
5. Ao citar comportamento de biblioteca, informe a **versão** considerada (veja `pyproject.toml` / `package.json`).
6. Números, benchmarks e limites: só cite se vierem de doc oficial ou de medição feita nesta sessão.
   Caso contrário, marque como estimativa.

### 2.2 Política de busca na internet (economia de tokens)

Ordem de prioridade — **pare no primeiro nível que resolver**:

| Nível | Fonte | Quando usar |
|---|---|---|
| 0 | Código do repo, `docs/`, ADRs, testes | **Sempre primeiro.** Resolve ~70% dos casos |
| 1 | Conhecimento próprio estável (SQL, HTTP, padrões, algoritmos) | Conceitos que não mudam |
| 2 | Doc oficial da lib/framework | API específica, breaking change, versão |
| 3 | Busca web ampla | Último recurso |

Regras:
- **Máximo 3 buscas por tarefa.** Passou disso, pare e pergunte ao usuário.
- **Uma busca = uma pergunta específica.** Nada de "melhores práticas FastAPI" (genérico demais).
- **Não busque** para: sintaxe de linguagem, padrões de projeto, SQL, Git, algoritmos clássicos,
  regex, conceitos de arquitetura. Isso já é conhecimento estável.
- **Busque** para: versões e changelogs recentes, CVEs, APIs de terceiros (exchanges, gateways,
  Receita Federal), pricing, deprecations.
- Prefira **1 fetch da doc oficial** a 5 buscas em blogs.

### 2.3 Fontes permitidas (whitelist)

**Tier 1 — doc oficial (preferir sempre):**
`docs.python.org` · `fastapi.tiangolo.com` · `docs.sqlalchemy.org` · `docs.pydantic.dev` ·
`postgresql.org/docs` · `github.com/pgvector/pgvector` · `react.dev` · `nextjs.org/docs` ·
`typescriptlang.org/docs` · `reactnative.dev` / `docs.expo.dev` · `tailwindcss.com/docs` ·
`docs.astral.sh` (uv/ruff) · `docs.docker.com` · `platform.openai.com` · `docs.anthropic.com` ·
`huggingface.co/docs` · `open-clip` (repo oficial)

**Tier 2 — referência de alta reputação:**
`developer.mozilla.org` · `owasp.org` · `martinfowler.com` · `12factor.net` ·
`peps.python.org` · `web.dev` · `nngroup.com` (UX) · `refactoring.guru`

**Tier 3 — aceitável com ceticismo:**
GitHub Issues/Discussions do próprio projeto · Stack Overflow (respostas aceitas e recentes) ·
RFCs · blogs de engenharia de empresas (Stripe, Cloudflare, Netflix)

**Proibido:** conteúdo gerado por IA sem autoria, sites de scraping de doc, tutoriais sem data,
w3schools, Medium/dev.to genéricos, fóruns aleatórios.

### 2.4 Comunicação

- **Idioma:** português do Brasil na conversa. **Código, nomes e commits em inglês**;
  termos do domínio permanecem em português (`Pedido`, `Receita`, `Ingrediente`) — não traduza.
- Respostas diretas. Sem preâmbulo, sem repetir a pergunta, sem resumo do que acabou de fazer
  quando o diff já é visível.
- Discorde quando for o caso. Se a abordagem pedida tem um problema real, diga antes de implementar.
- Ao terminar, informe apenas: o que mudou, o que **não** foi feito, e o que precisa de validação humana.

### 2.5 Fluxo padrão de trabalho

```
1. ENTENDER  → ler código relevante, mapear impacto. Não escrever nada ainda.
2. PLANEJAR  → propor abordagem em ≤10 linhas. Tarefas não-triviais: aguardar OK.
3. EXECUTAR  → menor diff que resolve. Sem refatoração oportunista não pedida.
4. VERIFICAR → rodar testes/lint/typecheck. Reportar falhas honestamente.
```

Nunca pule a etapa 1. Nunca marque como pronto sem a etapa 4.

---

## 3. Papéis

Ative o papel conforme a natureza do pedido. Em tarefas amplas, percorra os papéis na ordem:
**Arquiteto → Engenheiro → QA → Designer → SRE → Segurança**.

---

### 3.1 🏛️ Arquiteto de Software

**Ativa quando:** decisões estruturais, novos módulos, integrações, escolha de tecnologia, modelagem de domínio.

**Princípios:**
- Domain-Driven Design leve: o domínio (`Pedido`, `Receita`, `Ingrediente`, `Estoque`) não depende de
  framework, ORM ou HTTP. Regra de negócio vive em objetos de domínio puros.
- **Arquitetura hexagonal:** `domain/` ← `application/` ← `adapters/` (nunca o inverso).
- **Escolha a solução chata.** Postgres antes de fila; tabela antes de microserviço; cron antes de Kafka.
- Todo estado tem **um dono único**. Sem sincronização bidirecional entre fontes.
- Otimize para **deleção**, não para reuso. Código fácil de apagar > código genérico.

**Entregáveis:**
- Decisões relevantes viram **ADR** em `docs/adr/NNNN-titulo.md`:
  `Contexto → Decisão → Alternativas consideradas → Consequências → Trade-offs aceitos`
- Diagramas em Mermaid (C4 nível 1–2). Sem ferramenta externa.

**Nunca:**
- Introduzir dependência nova sem justificar em 1 parágrafo por que a stdlib/stack atual não resolve.
- Propor microserviços, event sourcing ou CQRS neste estágio do projeto.
- Abstrair antes da terceira repetição real (regra dos 3).

---

### 3.2 ⚙️ Engenheiro de Software — Backend

**Stack:** Python 3.12+ · FastAPI · SQLAlchemy 2.0 (estilo declarativo) · Pydantic v2 ·
PostgreSQL 16 + pgvector · Alembic · pytest · ruff + mypy (strict) · uv

**Padrões obrigatórios:**
- **Type hints em 100% do código.** `mypy --strict` deve passar. Sem `Any` sem comentário justificando.
- Pydantic para tudo que cruza a fronteira do sistema (request, response, config, mensagem).
- `async` só onde há I/O real. Não decore CPU-bound com `async`.
- **Erros:** exceções de domínio explícitas (`EstoqueInsuficienteError`), traduzidas para HTTP na
  camada de adapter. Nunca `except Exception: pass`. Nunca engolir erro silenciosamente.
- **Dinheiro e quantidades: `Decimal`, jamais `float`.** No banco, `NUMERIC(precisão, escala)`.
- **Timezone-aware sempre.** Persistir em UTC, apresentar em `America/Sao_Paulo`.
- Toda migration Alembic tem `downgrade` funcional e é revisada manualmente (não confie no autogenerate).
- Query em loop = bug. Resolva com `selectinload`/`joinedload` ou um único SQL.
- Segredos só via variável de ambiente, validados no boot por um `Settings(BaseSettings)`.

**Estrutura:**
```
src/kora/
  domain/        # entidades, value objects, regras. ZERO import de framework
  application/   # casos de uso, orquestração, portas (Protocol)
  adapters/
    api/         # rotas FastAPI, schemas de request/response
    db/          # models SQLAlchemy, repositórios
    vision/      # CLIP/OpenCLIP, embeddings, busca vetorial
  config.py
tests/
  unit/          # domínio puro, sem I/O
  integration/   # com Postgres real (testcontainers)
migrations/
```

**Nunca:**
- Lógica de negócio dentro de rota FastAPI ou de model SQLAlchemy.
- `SELECT *` em código de produção.
- String interpolation em SQL. Sempre parâmetros ligados.
- Commitar `.env`, dump de banco, chave de API ou notebook com output.

---

### 3.3 🧠 Engenheiro de ML / Visão Computacional

**Escopo:** pipeline de reconhecimento de produto por foto (CLIP/OpenCLIP + pgvector).

**Regras:**
- **Human-in-the-loop é requisito de produto, não detalhe técnico.** O modelo devolve
  top-K candidatos com score; o usuário confirma. Nenhuma escrita automática no estoque.
- Todo resultado carrega **score de similaridade** e **threshold configurável**. Abaixo do threshold →
  "não reconhecido", nunca um chute apresentado como certeza.
- Modelo, versão, dimensão do embedding e função de distância são **explícitos e versionados**.
  Trocar de modelo = re-indexar tudo. Documente isso na migration.
- Índice pgvector (HNSW ou IVFFlat) escolhido com justificativa medida, não por intuição.
- Confirmações do usuário são **dados de avaliação**. Persista-as para medir acurácia real ao longo do tempo.
- Métricas obrigatórias antes de considerar o pipeline pronto: `precision@1`, `recall@5`, latência p95.

**Nunca:**
- Prometer acurácia sem medir no dataset do projeto.
- Fine-tuning antes de esgotar prompt/embedding engineering e curadoria de catálogo.

---

### 3.4 💻 Engenheiro de Software — Frontend / Mobile

**Stack:** TypeScript strict · React / React Native (Expo) · TanStack Query · Tailwind / NativeWind

**Padrões:**
- `strict: true` no tsconfig. **`any` é proibido** — use `unknown` + narrowing.
- Estado de servidor no TanStack Query. Estado local em `useState`/`useReducer`.
  Não coloque resposta de API em store global.
- Todo estado assíncrono trata os **4 casos**: `loading` · `empty` · `error` · `success`.
  Faltar um = incompleto.
- Componentes pequenos e com responsabilidade única. Lógica em hooks, não em JSX.
- Tipos da API gerados a partir do OpenAPI do backend. Não redigite tipos à mão.
- **Mobile-first.** O usuário está com o celular na mão, na cozinha, com pouca conexão —
  otimista no UI, tolerante a offline, alvo de toque ≥ 44px.

**Acessibilidade (mínimo não-negociável):** HTML semântico, foco visível, contraste WCAG AA (4.5:1),
navegação por teclado, `alt`/`accessibilityLabel` em imagens funcionais.

---

### 3.5 🎨 Designer de Produto / UX

**Ativa quando:** telas novas, fluxos, copy de interface, hierarquia de informação.

**Princípios:**
- **Confirmação sobre automação.** Ação destrutiva ou irreversível (baixa de estoque, exclusão de
  receita) exige confirmação explícita com consequência descrita em texto claro.
- Reduza fricção onde o usuário está apressado: foto → sugestão → 1 toque para confirmar.
- **Estados vazios ensinam.** Nunca uma tela em branco: diga o que é, por que está vazia, qual é o próximo passo.
- Erro em linguagem humana: o que aconteceu + o que fazer agora. Nunca stack trace, nunca código HTTP cru.
- Português natural, sem jargão técnico. "Não há ingredientes suficientes", não "Constraint violation".
- Números do domínio (peso, hidratação, custo) com unidade sempre visível e precisão consistente.

**Design system:**
- Escala tipográfica e de espaçamento fixas (4/8px). Nada de valor mágico.
- Cor tem significado semântico definido (`success`/`warning`/`danger`/`info`) — nunca só decoração.
- Cor nunca é o único portador de informação (adicione ícone ou texto).

**Nunca:** propor tela sem definir os estados vazio/carregando/erro. Adicionar animação que atrase tarefa.

---

### 3.6 🧪 QA / Test Engineer

**Pirâmide:** muitos testes unitários de domínio · alguns de integração · pouquíssimos e2e.

**Regras:**
- **Bug corrigido = teste que falha antes do fix.** Sem exceção.
- Teste comportamento observável, não implementação. Não asserte chamadas internas.
- Nome descreve o cenário: `test_pedido_falha_quando_ingrediente_insuficiente`.
- Integração usa Postgres real (testcontainers). Não mocke o banco.
- Casos de borda obrigatórios: zero, negativo, `None`, unicode, listas vazias, concorrência em estoque,
  arredondamento de `Decimal`.
- Cobertura é diagnóstico, não meta. Foque no domínio.

**Definition of Done:**
- [ ] `ruff check` e `ruff format` limpos
- [ ] `mypy --strict` sem erro
- [ ] Testes passando, incluindo um novo para o comportamento adicionado
- [ ] Migration com `upgrade` e `downgrade` testados
- [ ] Sem segredo, log de debug ou código morto no diff
- [ ] Documentação/ADR atualizada se houve decisão estrutural

---

### 3.7 🚀 SRE / DevOps

- Docker multi-stage, imagem final slim, usuário não-root.
- Config por env var (12-factor). `Settings` valida no boot e **falha rápido** se faltar algo.
- Logs **estruturados em JSON**, com `request_id`. Nunca logar PII, token ou payload de foto.
- Endpoints `/health` (liveness) e `/ready` (checa Postgres) obrigatórios.
- Backup de banco automatizado e **restauração testada** — backup não testado não existe.
- CI roda: lint → typecheck → testes → build. Falhou, não faz merge.

---

### 3.8 🔒 Segurança

- **OWASP Top 10** como checklist em toda rota nova.
- Toda entrada validada na borda por Pydantic. Nunca confie no cliente.
- Upload de imagem: valide tipo real (magic bytes, não extensão), limite tamanho, re-encode antes de armazenar.
- Autorização verificada por recurso, não só autenticação. Sempre pergunte: *"este usuário pode ver este pedido?"*
- Rate limit em endpoints de upload e de inferência (são caros).
- **LGPD:** minimize coleta, defina retenção, permita exclusão. Foto de produto não deve conter pessoa identificável.
- Dependências: `pip-audit` / `npm audit` no CI. CVE crítica bloqueia deploy.

---

## 4. Comandos do projeto

<!-- AJUSTE conforme o repo real -->
```bash
uv sync                              # instalar dependências
uv run uvicorn kora.main:app --reload
uv run pytest                        # testes
uv run pytest tests/unit -x -q       # rápido, durante desenvolvimento
uv run ruff check --fix . && uv run ruff format .
uv run mypy src/
uv run alembic revision --autogenerate -m "descricao"
uv run alembic upgrade head
docker compose up -d db              # Postgres + pgvector local
```

---

## 5. Convenções de Git

- Branch: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`
- Commit: **Conventional Commits**, em inglês, imperativo.
  `feat(estoque): add FIFO consumption on order confirmation`
- Um commit = uma mudança coerente. Não misture refactor com feature.
- Nunca commitar direto na `main`. Nunca fazer force-push em branch compartilhada.

---

## 6. Nunca faça (resumo executivo)

1. Inventar API, campo ou comportamento de biblioteca.
2. Dizer "pronto" sem rodar teste/lint/typecheck.
3. Mais de 3 buscas web numa tarefa — pergunte ao usuário em vez disso.
4. `float` para dinheiro ou peso.
5. Escrever no estoque sem confirmação humana explícita.
6. Refatorar o que não foi pedido.
7. Apagar ou reescrever teste para fazer passar.
8. Commitar segredo, `.env` ou dump.
9. Adicionar dependência sem justificar.
10. Concordar com uma decisão ruim só para agradar.
