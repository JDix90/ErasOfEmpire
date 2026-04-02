# Operations: snapshots and process restarts

## PostgreSQL game state snapshots

The server persists turn snapshots to the `game_states` table via `saveGameState` in `backend/src/sockets/gameSocket.ts`. Snapshots are written when meaningful state changes occur (combat, draft, fortify, phase advance, turn timer, game end, etc.), not on a fixed wall-clock interval.

**On reconnect:** If a game is `in_progress` and not in memory, the server loads the **latest** row from `game_states` for that `game_id` when the first client joins after a cold start.

## In-memory games vs server restart

Active games are held in memory (`activeGames`). If the Node process exits **without** a recent snapshot, in-memory-only progress since the last `INSERT` into `game_states` can be lost. Production deployments should use graceful shutdown (SIGTERM) and rely on snapshots having been written after each material update. See `setupGracefulShutdown` in `backend/src/index.ts`.

## WebSocket reconnect (client)

The game client should emit `game:join` again after a Socket.IO reconnect so the server re-attaches the socket to the room and sends `game:state`. The main game page listens for `connect` and re-joins automatically.
