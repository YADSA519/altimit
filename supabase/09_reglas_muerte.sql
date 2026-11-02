-- =====================================================================
--  CENIZAS 1.4 · reglas que se cambian sin bajar el juego de nuevo
--  muertePierdeNivel: false = en el MUNDO morir no te baja de nivel (volvés a la base curado)
--                     true  = si te mata un Oscuro volvés al nivel 1 (como antes)
--  Para cambiarla: editar el valor acá abajo y volver a correr este archivo.
--  El cambio llega a cada jugador la próxima vez que entra a Cenizas.
-- =====================================================================
insert into public.game_state (k, v, updated_at)
values ('reglas', '{"muertePierdeNivel": false}'::jsonb, now())
on conflict (k) do update set v = excluded.v, updated_at = now();
