# Backlog — Kora Web (Tela Inicial / Reservas)

Documento de especificação das próximas melhorias, organizado por prioridade e detalhado em funcionalidades para implementação.

**Status:** ✅ Concluídos: 1, 2, 3, 4, 5, 6, 7, 8, 9, 11 · ⏳ Pendentes: 10, 12, 13, 14 (14 é bug de backend, só documentado)

---

## 🔴 Bug crítico — bloqueia criação de reserva para jogadores comuns

### 14. Rota GET pública para listar clubes (usuários não-admin não conseguem criar reserva)
**Sintoma:** um usuário comum (não Staff/Admin de nenhum clube) não vê nenhum clube no carrossel de seleção do formulário de criação de reserva (`create-booking-form.tsx`) — o formulário fica vazio e ele não consegue criar reserva nenhuma. Só usuários Admin conseguem passar dessa etapa.

**Causa raiz (backend, `Kora.Api`):** o formulário usa `getMyClubs()` → `GET /api/v1/me/clubs` → `ListMyClubsHandler.cs:24-37`. Essa rota foi desenhada para listar clubes que o usuário **gerencia**, não clubes disponíveis para reservar:
- Se `user.Role == Admin`: retorna **todos** os clubes do sistema.
- Caso contrário: retorna **somente** clubes onde existe uma linha em `ClubStaff` para esse usuário.
- Um jogador comum (sem nenhum vínculo de staff) recebe lista **vazia** — mesmo estando livre pra reservar em qualquer clube.

**Solução proposta:** criar uma rota `GET /api/v1/clubs` (fora de `/management`, sem exigir staff/admin — só autenticação), que lista todos os clubes disponíveis para reserva, análoga à leitura pública de `ListMyClubsHandler` mas sem o filtro de `ClubStaff`. O frontend (`create-booking-form.tsx`, e possivelmente outros pontos que hoje reaproveitam `getMyClubs()` para fins de "listar clubes" em vez de "listar clubes que gerencio") deve trocar para essa nova rota onde o objetivo for popular clubes para reserva, mantendo `/me/clubs` só para telas de management.
- *Escopo:* alteração em `Kora.Api` (nova rota/handler) + `Kora.Web` (trocar a chamada no formulário de criação).

---

## Prioridade: Fácil

### 1. ✅ Filtro "apenas com vagas abertas" na tela inicial
Adicionar um filtro que exibe somente jogos com vagas disponíveis (`spotsOpen > 0` / `open=true` na API).
- Deve vir **ativado por padrão** ao carregar a tela.
- Usuário pode desativar para ver também jogos lotados.

> **OK.** `open: true` como estado inicial de `filters` em `bookings-client.tsx`.

### 2. ✅ Separação entre "Meus Jogos" e "Descobrir Jogos"
Dividir a listagem da tela inicial em duas seções/abas distintas:
- **Meus Jogos**: jogos em que o usuário está participando (`amIIn = true`).
- **Descobrir Jogos**: jogos em que o usuário não está participando (`amIIn = false`).

> **OK.** Implementado como toggle na barra de filtros (`bookings-client.tsx`), derivado client-side do mesmo resultado de `getBookings`, sem request extra. Regra simplificada durante a implementação: descobrir = apenas `amIIn = false` (removida a exclusão adicional por clube, pois escondia jogos de clubes onde o usuário também tem vínculo mas não está naquele jogo específico).

### 3. ✅ Entrada automática do criador na reserva
Ao criar uma reserva, o usuário criador deve ser automaticamente adicionado como participante (sem precisar dar "join" manualmente depois).

> **Já implementado — nenhuma alteração necessária.** Em `GameBookingStrategy.cs:48-65` (backend), quando um jogador comum (não staff/admin do clube) cria uma reserva do tipo Game, ele já é adicionado automaticamente à lista de `participants` (Team A, posição 1) antes de a reserva ser salva. O frontend (`create-booking-form.tsx`) não precisa enviar o criador na lista de participantes.
>
> A única exceção é quando quem cria é staff/admin do clube (`isStaff = true`): nesse caso o criador não é auto-adicionado, pois management normalmente está criando a reserva para outros jogadores, não para si mesmo — comportamento intencional.

### 4. ✅ Filtro por clube
Adicionar seletor de clube na tela inicial para filtrar os jogos exibidos por clube específico.

> **OK.** Reaproveitado o `ClubSwitcher` do calendário, promovido para `src/components/clubs/club-switcher.tsx` (compartilhado). Opções vêm de uma query própria sem o `clubId` ativo, pra não encolher o dropdown ao selecionar um clube (bug corrigido durante a implementação).

### 5. ✅ Filtro por data
Adicionar seletor/intervalo de data na tela inicial para filtrar os jogos por período.

> **OK.** Popover + `Calendar` em `mode="range"` (mesmo padrão do `NewBookingDialog.tsx`), em `bookings-filter-bar.tsx`.

### 6. ✅ Garantir funcionamento do filtro por tipo (Day Use / Game / Todos)
Validar que o filtro de tipo de reserva funciona corretamente para as três opções: Day Use, Game e Todos (sem filtro).

> **OK — validado por inspeção de código de ponta a ponta** (sem browser automatizado disponível neste ambiente):
> 1. `bookings-filter-bar.tsx`: `ToggleGroup` (`all` / `Game` / `DayUse`) → `handleTypeChange` converte `"all"` para `undefined`; guarda contra deseleção total.
> 2. `api.ts:78-81`: mapa `BOOKING_TYPE_INT = { Game: "1", DayUse: "2" }`; só envia o param `type` quando definido (Todos = sem param).
> 3. `BookingsController.cs:20`: `[FromQuery] BookingType? type` — aceita tanto `type=1/2` quanto `type=Game/DayUse`.
> 4. `Domain/Bookings/BookingType.cs`: `Game = 1, DayUse = 2` — bate exatamente com o mapa do frontend (principal ponto de risco de dessincronia, conferido).
> 5. `ListBookingsHandler.cs:44-47`: só filtra por tipo quando o param está presente.
>
> **Não validado:** clique real no navegador (sem ferramenta de automação de browser disponível) e comportamento visual com reservas `DayUse` reais (a base de dev usada nos testes só tinha bookings `Game` no momento). Recomenda-se um teste manual rápido antes de considerar 100% fechado.

### 7. ✅ Validar join / leave com múltiplos usuários
Testar o fluxo de entrar/sair de uma reserva com diferentes contas de usuário.
- Criar um usuário de teste (e-mail qualquer) para validar o cenário com múltiplos participantes simultâneos.

> **OK — validado manualmente.** Fluxo de join/leave testado com múltiplas contas; a regra de bloqueio de saída com menos de 24h antes do início do jogo (item relacionado à mensagem de erro tratada em `booking-card.tsx`) foi confirmada funcionando corretamente.

### 8. ✅ Confirmação de saída da reserva
Ao sair de um jogo (tanto criador quanto jogadores), exigir confirmação antes de efetivar a saída.
- Tanto o criador quanto os jogadores podem sair do jogo.
- Se o **último participante** sair, a reserva deve ser automaticamente excluída.

> **OK.** Diálogo de confirmação adicionado em `booking-card.tsx` (mesmo padrão do dialog de join). A exclusão automática ao sair o último participante **já existia no backend** (`LeaveBookingHandler.cs:52-57` — quando `Participants.Count == 0` após a remoção, a booking é removida), nenhuma alteração necessária ali.

### 9. ✅ Flag pública/privada na criação da reserva
Adicionar controle na tela de criação de reserva para marcar o jogo como público ou privado.
- *Observação técnica*: o backend já possui o campo `IsPrivate` no domínio de `Booking` e já aplica a regra de visibilidade (jogos privados só aparecem para participantes); falta apenas expor o controle na UI de criação.

> **OK.** Switch "Reserva privada" adicionado em `create-booking-form.tsx`, logo após a descrição. Estado `isPrivate` (default `false`) enviado no body de `createBooking` — o tipo `CreateBookingRequest.isPrivate` e o handling no backend (`GameBookingStrategy.cs`) já existiam, só faltava a UI.
>
> **Complemento adicionado:** reservas privadas do tipo Game exigem pelo menos um jogador cadastrado (não convidado) selecionado no momento da criação — reaproveitando a mesma seleção de jogadores (Team A/B) do calendário, promovida para `src/components/players/` (`avatar-slot.tsx`, `player-selector-dialog.tsx`, `types.ts`) para ser compartilhada entre o calendário e este formulário. Validação client-side bloqueia o submit (botão desabilitado + mensagem em vermelho) até haver ao menos um participante com `userId`. Motivo: staff/admin nunca entra automaticamente como participante (item 3), então sem essa exigência uma reserva privada criada por staff poderia ficar sem nenhum participante — e por ser privada, invisível para todo mundo, inclusive quem criou.
>
> *Observação (não implementada):* `DayUseBookingStrategy.cs` não aplica `IsPrivate` na `Booking` criada (só `GameBookingStrategy.cs` faz isso) — o switch "Reserva privada" no formulário não tem efeito real para reservas Day Use. Como Day Use já é staff-only e não tem estrutura de times, a seleção de jogadores desse item também não se aplica lá. Se quiser que Day Use suporte privacidade de fato, é alteração em `Kora.Api`.

### 10. Fluxo de seleção de horário/quadra na criação de reserva
Inverter a ordem de seleção: o usuário escolhe primeiro o **horário** e, com base nisso, o sistema retorna as **quadras disponíveis** para aquele horário.
- A primeira quadra disponível deve vir pré-selecionada como padrão.
- Se o usuário não alterar a seleção, a reserva é confirmada com essa quadra padrão.

### 11. ✅ Remover "Day Use" da tela de reserva de jogadores
Jogadores comuns não devem ver a opção de criar reserva do tipo Day Use na tela pública de reservas — essa opção deve ficar restrita à área de gerenciamento (management).

> **Já implementado — nenhuma alteração necessária.** Em `create-booking-form.tsx:50-51`, `availableTypes` só inclui `"DayUse"` quando `MANAGEMENT_ROLES.includes(selectedClubRole)`; jogadores comuns só veem "Game".

---

## Prioridade: Difícil

### 12. Convite/notificação obrigatória ao adicionar jogador
Ao adicionar um jogador a uma reserva (via management ou convite direto), o sistema deve:
1. Enviar um convite/notificação ao jogador.
2. Manter o jogador como "pendente" até a confirmação.
3. Só marcar o jogador como participante efetivo da reserva após ele confirmar o convite.

### 13. Notificações por evento
Implementar sistema de notificações (push/e-mail/in-app — a definir) disparadas por eventos relevantes do sistema (ex.: novo convite, confirmação de participação, saída de participante, cancelamento de reserva, etc.).
- Escopo e canais de notificação a serem detalhados antes da implementação.

---

## Notas gerais para o desenvolvedor
- Alterações de backend ficam restritas a `src/Kora.Api`; alterações de frontend em `src/Kora.Web/kora-web`.
- Os itens 1, 4, 5, 6 dependem do endpoint de listagem de reservas, que já suporta os parâmetros `clubId`, `type`, `open`, `fromUtc`, `toUtc`.
- O item 9 é majoritariamente uma tarefa de frontend, já que o suporte a `IsPrivate` já existe no backend.
