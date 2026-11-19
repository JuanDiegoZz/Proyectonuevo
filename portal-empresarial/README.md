# Conecta Rural Empresarial

Portal de demostración para compras regionales en el sector forrajero. Los perfiles, operaciones y comprobantes son ficticios.

## Ejecución

Desde PowerShell, en la carpeta del proyecto:

```powershell
cd portal-empresarial
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Abrir http://127.0.0.1:4173. Preparar dependencias y compilar antes de desconectar internet. El navegador se comunica únicamente con el servidor estático local. Para usar la misma sesión, conservar navegador, hostname y puerto. Usar una pestaña. 

Para desarrollo usar `npm run dev`. Para verificar el build, instalar Chromium con `npx playwright install chromium`, ejecutar `npm run test:domain` y `npm test`. Las capturas se escriben en `screenshots/`.

## Guion de exposición (4 minutos)

1. **0:00–0:40.** Restablecer desde Configuración antes de comenzar. Mostrar en Resumen la meta de 1,000 pacas, 850 comprometidas y 150 pendientes. Señalar la barra de recepción separada.
2. **0:40–1:35.** Abrir «Completar 150 pacas». Seleccionar José Hernández, Nadadores, y agregar 90. Volver a resultados, seleccionar María González, San Buenaventura, y agregar 60.
3. **1:35–2:25.** Abrir «Revisar compra», revisar el importe de $18,000.00 y confirmar OC-016. Aceptar a José y mostrar 94% en NODESS. Aceptar a María y mostrar 100% de compromiso.
4. **2:25–3:25.** Volver a OC-016. Simular envío y confirmar recepción para cada productor. Mostrar dos comprobantes individuales: $10,800.00 y $7,200.00. Mostrar leyenda «Sin validez fiscal».
5. **3:25–4:00.** Volver al resumen: 1,000 comprometidas y 150 recibidas en campaña. Consultar el total histórico de $148,850.00 y los 12 comprobantes. Las 850 restantes siguen pendientes de entrega.

## Recursos

Los retratos y fotografías agrícolas son sintéticos y están incluidos localmente. Los puntos del mapa son referencias aproximadas. La geometría municipal procesada proviene de [PhantomInsights/mexico-geojson, CONABIO 2023](https://github.com/PhantomInsights/mexico-geojson). Consultar `public/map-license.txt` y `public/licenses.json`.

El protocolo y las referencias indicados en la solicitud no estaban disponibles en la carpeta. El portal usa el plan aprobado como referencia funcional.

## Distribución portable para Windows x64

Desde la raíz, ejecuta en PowerShell:

```powershell
powershell.exe -NoProfile -File .\scripts\Empaquetar-Portable-Windows.ps1
```

Para empaquetar se necesita Node.js compatible con Vite, npm e internet. El script usa el lockfile, compila producción y descarga solo el ejecutable oficial de Node.js para Windows x64. Comprueba el SHA-256 oficial y el fijado en el script antes de agregar el ejecutable al ZIP.

El ZIP y su suma SHA-256 quedan en `release/`. Adjunta el ZIP al GitHub Release manualmente. Quien lo reciba solo necesita extraerlo y abrir `INICIAR.cmd`. Consulta el `README.txt` incluido para el cierre y la persistencia entre sesiones.
