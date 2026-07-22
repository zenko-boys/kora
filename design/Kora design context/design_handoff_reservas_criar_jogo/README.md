# Handoff: Reservas & Criar Jogo (Kora — desktop)

## Overview
Fluxo desktop de reserva de quadras do Kora: tela de listagem/filtro de jogos disponíveis (Reservas) e formulário de criação de reserva (Criar Jogo), conectados por navegação.

## About the Design Files
Os arquivos neste pacote (`kora-tela-reservas.html`, `kora-criar-jogo.html`) são **referências de design em HTML** — protótipos navegáveis mostrando aparência e comportamento pretendidos, não código de produção para copiar diretamente. A tarefa é **recriar esses designs no ambiente/stack já existente do seu app** (React, Vue, SwiftUI, nativo etc.), usando os padrões e bibliotecas já estabelecidos no seu codebase — ou, se ainda não houver um ambiente definido, escolher o framework mais adequado para o projeto e implementar os designs ali.

## Fidelity
**Alta fidelidade (hifi)**: cores, tipografia, espaçamento e interações finais. O desenvolvedor deve recriar a UI pixel-perfect usando as bibliotecas/padrões já existentes no codebase de destino.

## Screens / Views

### 1. Reservas (`kora-tela-reservas.html`)
**Purpose**: usuário busca, filtra (clube, dia, período/horário) e navega pela listagem de jogos/reservas disponíveis; ponto de entrada para criar uma nova reserva.

**Layout**: grid de 2 colunas — `84px` (sidebar ícones) + `1fr` (conteúdo). Conteúdo interno dividido em coluna de filtros fixa à esquerda (`.filters-col`, ~280px, fundo card, borda direita `1px solid var(--line-soft)`) e área principal rolável à direita (`.main`, padding `32px 40px`).

**Components**:
- **Sidebar** (`.sidebar`, fundo `--charcoal`): logo (imagem `assets/kora-icon.jpeg`, 36×36, `border-radius: 9px`) centralizado no topo; abaixo, ícones de navegação empilhados (`.icon-btn`, 46×46, `border-radius: 13px`) — "Reservas" (ativo: fundo `rgba(15,163,90,0.22)`, cor `--lime-green`) e "Gerenciar"; avatar do usuário no rodapé (gradiente `--lime-green` → `--deep-green`, circular). Sidebar é sticky (`position: sticky; top:0; height:100vh`) para permanecer fixa durante o scroll do conteúdo.
- **Busca** (`.search-wrap input`): input com fundo branco, borda `--line-soft`, ícone de lupa.
- **Filtro de Clube**: chips selecionáveis.
- **Filtro de Dia** (`.day-row-wrap`): carrossel horizontal de chips dia-da-semana + número (`.day-chip`, 54px min-width, `border-radius: 12px`), com setas de navegação (`.carousel-arrow`, 24px, círculo com borda) à esquerda/direita que fazem `scrollBy` suave.
- **Filtro de Período**: 3 cards (Manhã/Tarde/Noite) com ícone + label; selecionado = borda/cor `--deep-green`.
- **Slots de horário** (`.slots-grid`): grid 3 colunas, gerado dinamicamente por JS conforme o período escolhido (intervalos de 30min); estado `selected` (fundo `--deep-green`), `unavailable` (fundo `#FBE4E4`, cor `--red`, `cursor: not-allowed`).
- **Botão Filtrar** (`.btn-filtrar`): full-width, fundo `--deep-green`, texto branco, `border-radius: 10px`.
- **Header da listagem**: título "Jogos disponíveis" + contagem, e botão **"Nova reserva"** (`.btn-nova-reserva`, fundo `--deep-green`, ícone "+") que navega para Criar Jogo.
- **Cards de jogo**: cada card tem carrossel de tags de status (`.tags-carousel-wrap` com setas `.carousel-arrow` iguais às do filtro de dia) — pills de status ("Em andamento"/"Finalizado"/"Próximo"), tipo (GAME/DAY USE), nível.

**Interactions & Behavior**:
- Clique em "Nova reserva" → navega para `kora-criar-jogo.html`.
- Clique no ícone "Reservas" da sidebar → mantém-se na própria tela (marcado ativo); "Gerenciar" → `alert('Gerenciar — em construção')` (placeholder, tela ainda não existe).
- Seleção de dia, período e slot de horário: clique alterna classe `.selected` (single-select dentro de cada grupo).
- Setas de carrossel: `scrollBy({left: ±100/120, behavior:'smooth'})` no container correspondente.

### 2. Criar Jogo (`kora-criar-jogo.html`)
**Purpose**: formulário para configurar e confirmar uma nova reserva de quadra.

**Layout**: mesma sidebar/grid da tela de Reservas (reuso exato de estilos `.sidebar`/`.icon-btn`/`.avatar-user`). Área de conteúdo (`.page`), max-width 640px, centralizada, com breadcrumb "← Reservas" no topo, título "Criar Jogo" e subtítulo.

**Components**: mesmos padrões de campo de dia/período/slots de horário da tela de Reservas (mesma lógica de geração de slots). Rodapé do formulário com dois botões: `.btn-cancel` (outline) e `.btn-create` (fundo `--deep-green`, ícone check) — "Criar Reserva".

**Interactions & Behavior**:
- "← Reservas" (breadcrumb) e "Cancelar" → navegam de volta para `kora-tela-reservas.html`.
- "Criar Reserva" → navega para `kora-tela-reservas.html` (simulação — sem persistência real).

## Design Tokens
- `--charcoal`: `#151A1F` (sidebar, escuro)
- `--deep-green`: `#0FA35A` (CTA primário, seleção)
- `--lime-green`: `#A7F15B` (accent, gradiente logo/avatar)
- `--line-soft`: cor de borda neutra clara (usar valor exato do arquivo)
- `--text-primary` / `--text-muted`: cores de texto do design
- `--red`: `#FF6B57`-ish para estado indisponível (`#FBE4E4` fundo claro correspondente)
- Border radius: 10px (botões), 12–13px (cards/ícones), 9px (logo)
- Fonte: stack de sistema / Inter para UI (ver `<head>` de cada arquivo para valores exatos)

Nota: os valores exatos de cada variável CSS estão declarados no `:root` de cada arquivo HTML — usar esses como fonte de verdade.

## Assets
- `assets/kora-icon.jpeg`: ícone/logo do Kora usado no topo da sidebar (fornecido pelo usuário).

## Files
- `kora-tela-reservas.html` — tela de listagem/filtro de reservas
- `kora-criar-jogo.html` — formulário de criação de jogo/reserva
- `assets/kora-icon.jpeg` — logo

Observação: este pacote reflete a versão desktop do fluxo; a moldura estilo "MacBook" (barra de título com 3 botões) visível ao abrir os arquivos é apenas apresentação do mockup e **não deve ser recriada** no app real.
