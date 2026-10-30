/* CENIZAS · configuración de red (Supabase Realtime)
   Todo lo que regula cuántos mensajes manda el juego está acá. */
window.CZ_NET = {
  NET_TICK_HZ: 10,                 // envíos por segundo en multijugador (5–10)
  FULL_SNAPSHOT_INTERVAL_MS: 2000, // cada cuánto el anfitrión manda TODOS los Oscuros (corrige desvíos)
  INTERP_BUFFER_MS: 100,           // atraso con el que se dibujan los remotos para suavizar
  MAX_EXTRAPOLATION_MS: 200,       // si no llegan datos, se adivina como máximo esto y después se congela
  POS_EPSILON: 0.5,                // movimiento mínimo (en unidades del mundo) para volver a mandar posición
  HIDDEN_UNTRACK_MS: 60000,        // con la app en segundo plano más de esto, deja de figurar en la sala
  AFK_MS: 180000                   // sin tocar nada por 3 minutos, deja de mandar su posición
};
