# THE O|F

Red de sobrevivientes del universo Cenizas. App Android hecha con Capacitor.

- `www/` es la app (pantallas, íconos por bando, fuentes). Lo que se cambia va acá.
- `android/` es el envoltorio nativo.
- `supabase/` tiene el SQL de la base: correr `01_altimit.sql` y después `02_the_of.sql`.
- Cada vez que se sube un cambio, GitHub compila el APK solo (pestaña **Actions**)
  y lo deja en **Releases**.
