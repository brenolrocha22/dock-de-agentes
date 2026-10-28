# Integration hand-off — Dock de Agentes

- **Approved plan:** `.azure/project-plan.md` (frontend-only prototype).
- **Frontend:** workspace root (`services/web` is not used); `npm.cmd run dev`, `npm.cmd run build`, `npm.cmd run typecheck`.
- **API seam:** none; no backend or live-data client is in the approved scope.
- **Routes:** none.
- **Backend:** none; no run/build/health endpoint.
- **Mock/demo behavior:** task simulation is local in `src/App.tsx`; no separate mock client, mock datasets, duplicate shared types, or preview state switcher. Keep the simulation; live agent execution is explicitly out of scope.
- **Database/migrations:** none; no database, migration tool, connection variables, or seed data.
- **Shared types:** none; local UI types in `src/App.tsx`.
- **Services:** React/Vite web app — Essential. Motion animation — Essential. Azure services — none.
- **Verification:** run `npm.cmd run typecheck` and `npm.cmd run build`; no backend probes or schema work apply to this prototype.
