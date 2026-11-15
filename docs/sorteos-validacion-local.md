# Sorteos: validación local

Rama: `feat/staff-sorteos`. Base verificada: `f36e1e0`. Preparado para revisión mediante PR y preview de Vercel; no fusionar sin validación.

## Qué cambia

- `/sorteo` permite administradores y Staff, como `/admin`.
- Staff solo puede listar eventos asignados y consultar sus participantes. La API comprueba el evento independientemente de la pantalla y mantiene RLS con el cliente del usuario.
- Filtros combinables: evento, rol y pago confirmado.
- En el esquema no existe un ciclo de vida del paquete. Por decisión de Fernando, el filtro **pago confirmado** usa la señal actual: inscripción `confirmed` con `responses.package` no vacío, distinto de la opción exenta del formulario y de «Sin paquete». La acción de confirmación de pago de la app utiliza ese mismo estado. No es una auditoría bancaria independiente, y el estado también puede cambiarse administrativamente. Sin activar ese filtro, se conserva la población del evento, incluyendo inscripciones pendientes.
- Se paginan consultas para no truncar participantes en 1000 y se deduplican por usuario. La API no devuelve correo, teléfono ni respuestas libres.
- Interfaz ordenada: configuración, sorteo y resultados. Búsqueda solo visual, no modifica elegibilidad. Ganadores/descartados se excluyen de nuevos sorteos en esa sesión.
- Filtros y reinicio bloqueados durante el giro y mientras se confirma al seleccionado. Cleanup de timers, cancelación de solicitudes viejas y soporte de movimiento reducido.
- Resultados temporales en memoria: recargar/salir/cambiar filtros los borra. No se añadió persistencia ni migraciones.

## Ejecutar

Requiere Node >=24, Bun y las variables del proyecto Supabase de desarrollo (no producción): `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Usar credenciales y usuarios de prueba existentes; no añadir secretos al repositorio.

```sh
bun install --frozen-lockfile
bun test tests/raffle-service.test.ts tests/raffle-api.test.ts
bun run build
bun dev
```

Abrir `/sorteo`, con una sesión Staff/admin de desarrollo. Si Astro auto-detecta un agente y falla al lanzar en segundo plano, usar `ASTRO_DEV_BACKGROUND=1 bun dev` para mantenerlo en primer plano.

## Verificación ejecutada

- Build de producción: aprobado. Advertencia preexistente: asset `fondo-sponsors.webp` de IO Extended 25 no resuelto al compilar.
- 12 pruebas nuevas aprobadas: validación de entradas, paquete/exentos, intersección, paginación >1000, deduplicación, fallo cerrado y eventos restringidos; endpoint real/helper de autorización real con transporte Supabase simulado (401 anónimo, 403 miembro y Staff ajeno, 200 Staff propio/admin).
- Biome de archivos modificados/nuevos: aprobado. `git diff --check`: aprobado.
- Biome global: 10 errores, 89 advertencias, 2 avisos. La misma ejecución sobre un archivo limpio de la base `f36e1e0` da exactamente esos resultados; no se modificaron problemas ajenos.
- No se verificó con Supabase real. La interfaz rediseñada se comprobó en navegador con datos ficticios: filtros 8→5, selección y confirmación dejaron 4 disponibles y 1 ganador. Esa demo no comprueba permisos ni datos reales. No había configuración de desarrollo en el checkout.
- El servidor inicialmente falló en el sandbox con `ERR_SYSTEM_ERROR: uv_interface_addresses`. Fuera del sandbox y en primer plano informó `ready`, pero el navegador y llamadas separadas no alcanzaron su listener (`ERR_CONNECTION_REFUSED`). Es una limitación del entorno de validación, no evidencia de funcionamiento visual.

## Comprobación manual pendiente

1. Anónimo y miembro común: `/sorteo` redirige; API no entrega participantes.
2. Staff de A: solo ve A; cambiar manualmente `eventSlug` a B devuelve 403. Admin puede seleccionar todos los eventos.
3. Evento A + pago confirmado: solo confirmados con paquete no exento. Confirmar con datos reales del formulario.
4. Probar evento sin inscripciones y fallos de red; no debe sortear datos anteriores.
5. Sortear, confirmar, descartar y devolver; no repetir ganadores/descartados. Buscar nombre no cambia el total elegible.
6. Durante giro no cambiar filtros/reiniciar. Cancelar confirmación de reinicio conserva resultados; aceptar recarga población y borra resultados.
7. Revisar pantalla estrecha, teclado, modo oscuro y preferencia de movimiento reducido.

La revisión final con sesiones reales y datos del entorno de preview sigue pendiente.

## Rediseño visual solicitado

Se sustituyeron las tarjetas redondeadas, el titular promocional y los bloques numerados por una herramienta de sorteo con panel de filtros, escenario central, tabla de participantes y resultados. Se reutiliza Google Sans/Google Sans Code y la paleta del repositorio; colores planos, divisores, controles rectos y una composición adaptable al móvil. CSS específico en `src/components/sorteo.css`.

Referencias consultadas: [GDG Sucre](https://www.gdgsucre.com/), [Google Developers Community](https://developers.google.com/community) y [Google Sans Flex](https://design.google/library/google-sans-flex-font), además de `landing/Header.astro`, `Hero.astro`, `Featured.astro` y `styles/global.css` del proyecto. No se copiaron templates de terceros.
