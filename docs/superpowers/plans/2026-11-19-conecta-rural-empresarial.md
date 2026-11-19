# Conecta Rural Empresarial — Plan maestro de implementación

Fecha: 19 de noviembre de 2026. Destinatario: Codex Terra.

**Objetivo:** construir hoy un frontend empresarial demostrativo, navegable y visualmente cuidado, con ocho módulos y una operación colectiva coherente de extremo a extremo.

**Arquitectura:** SPA independiente con React y TypeScript, construida con Vite. Un estado de dominio compartido, persistencia local versionada y selectores puros alimentan todas las pantallas. Recursos visuales y cartográficos incluidos en el paquete.

**Especificación:** este documento integra el diseño funcional y el plan de ejecución. La implementación corresponde a una fase posterior; no se creó código de aplicación.

## 0. Evidencia disponible y límites del análisis

La carpeta `C:/Users/juand/Desktop/agrored` estaba vacía, incluidos archivos ocultos. No hay repositorio Git, aplicación móvil, dependencias instaladas, protocolo oficial ni referencias visuales accesibles. El mensaje tampoco contiene adjuntos visibles. Se comprobó Node `v24.19.0` y npm `11.17.0`.

Por tanto, este plan responde al alcance escrito por el usuario. **No se ha contrastado con el protocolo ni con referencias adjuntas.** No atribuir definiciones, resultados científicos ni identidad visual a documentos no revisados. Al recibirlos, revisar terminología NODESS, objetivos del protocolo, identidad y restricciones; registrar diferencias antes de implementar lo afectado.

Las agrupaciones NODESS de la demo son ficticias y se presentan como agrupaciones de abastecimiento para este prototipo. No afirmar que representan instituciones o acreditaciones reales. La definición institucional deberá contrastarse con el protocolo.

Aplicación empresarial aislada en `portal-empresarial/`. No buscar ni modificar una aplicación móvil fuera del directorio autorizado. No crear backend, autenticación, CFDI, pagos reales, mensajería real o infraestructura de nube.

## 1. Arquitectura frontend y dependencias

### Decisión

Usar React + TypeScript + Vite, CSS propio con variables y componentes pequeños. En esta escala, `useReducer` y Context bastan: evitan agregar un gestor de estado. Separar cálculo de negocio de presentación permite probar consistencia sin renderizar ocho pantallas.

Alternativas evaluadas:

| Alternativa | Ventaja | Coste para esta entrega | Decisión |
|---|---|---|---|
| React + Vite + estado local | Composición de pantallas y build estático | Configuración inicial pequeña | Elegida |
| HTML y JavaScript sin framework | Menos paquetes | Más sincronización manual entre módulos | Descartada para este alcance |
| Framework con renderizado servidor | Capacidades de servidor | Complejidad sin necesidad funcional | Descartado |

Dependencias de ejecución: `react`, `react-dom` y una biblioteca única de iconos, preferentemente `lucide-react`. Resolver versiones compatibles al iniciar y fijarlas en `package-lock.json`; no actualizar durante el ensayo final. Dependencias de desarrollo: TypeScript, Vite, plugin React y Vitest. Usar Playwright para regresión de navegador si la herramienta disponible permite ejecutarlo; instalarlo como dependencia de desarrollo solo si hace falta para dejar la prueba reproducible.

No agregar Redux, Zustand, React Query, motores GIS, mapas comerciales, bibliotecas PDF, frameworks CSS ni motores de animación. Para cuatro gráficas de alcance fijo, SVG accesible resulta suficiente. Si la implementación encuentra un componente instalado adecuado, reutilizarlo antes de incorporar otro paquete.

Navegación mediante enlaces hash y un resolvedor pequeño: conserva recarga y navegación atrás sin requerir reglas del servidor. El resolvedor solo interpreta ocho rutas y detalles por ID; no crear un framework de rutas propio. Una ruta desconocida muestra recuperación al dashboard.

### Estructura prevista

```text
portal-empresarial/
  package.json, package-lock.json, index.html, vite.config.ts
  src/
    main.tsx
    app/App.tsx, AppShell.tsx, routes.ts
    domain/types.ts, seed.ts, reducer.ts, selectors.ts, validation.ts
    state/DemoProvider.tsx, storage.ts
    components/                 # Botones, diálogo, tabla, filtros y gráficas compartidos
    features/dashboard/DashboardPage.tsx
    features/map/SupplyMapPage.tsx, CoahuilaMap.tsx
    features/producers/ProducersPage.tsx, ProducerDetail.tsx
    features/nodess/NodessPage.tsx, NodessDetail.tsx
    features/orders/OrdersPage.tsx, OrderComposer.tsx, OrderDetail.tsx
    features/invoices/InvoicesPage.tsx, ReceiptDocument.tsx
    features/reports/ReportsPage.tsx
    features/settings/SettingsPage.tsx
    styles/tokens.css, global.css, print.css
  public/assets/
    maps/coahuila.svg, locations.json
    portraits/, agriculture/, fonts/
    licenses.json
  tests/domain.test.ts, seed.test.ts, storage.test.ts, demo.spec.ts
  README.md
```

Crear un componente compartido solo cuando dos pantallas lo necesiten. No generar capas de servicios, repositorios, plugins de sectores ni clientes HTTP.

Referencias consultadas mediante Context7: [reducer y Context en React](https://react.dev/learn/scaling-up-with-reducer-and-context), [build y rutas de recursos en Vite](https://vite.dev/guide/build), [verificación del build estático](https://vite.dev/guide/static-deploy). La documentación respalda la mecánica; la arquitectura es una decisión de este plan.

## 2. Sistema visual

### Dirección

Una mesa de trabajo de abastecimiento regional. El mapa, las cantidades y el progreso colectivo dominan la experiencia. Fotografías agrícolas aportan contexto sin convertir cada pantalla en una galería.

Empresa ficticia: **Forrajes del Norte — Compras regionales**, con destino de recepción en Monclova. Marca del portal: **Conecta Rural Empresarial**. Mostrar permanentemente una etiqueta discreta «Entorno de demostración · Datos ficticios».

| Token | Valor propuesto | Uso |
|---|---|---|
| Azul nocturno | `#10283F` | Sidebar y encabezados fuertes |
| Verde agrícola | `#18734D` | Acción principal y aceptación |
| Verde suave | `#EAF4ED` | Progreso y selección |
| Fondo | `#F4F6F5` | Superficie general |
| Superficie | `#FFFFFF` | Tablas, paneles y diálogos |
| Texto | `#182C3A` | Lectura principal |
| Texto secundario | `#566574` | Metadatos |
| Borde | `#DEE5E3` | Separaciones |
| Ámbar | `#9A5708` | Pendiente, acompañado por texto |

Verificar contraste final; los valores son punto de partida, no evidencia de accesibilidad comprobada.

Tipografía: Inter local, con su licencia incluida y fallback del sistema. Cuerpo de 14–16 px, títulos de 28–32 px, cifras de 30–36 px y números tabulares. Espaciado en múltiplos de 4 px. Radios de 10–14 px, bordes suaves y sombras reservadas para overlays.

Sidebar de 240 px; encabezado de 72 px. Contenido con márgenes de 28–32 px. Tablas y secciones amplias, sin encerrar cada dato en una tarjeta. Dashboard: franja de métricas, bloque central de abastecimiento y sección inferior de evolución y actividad.

Transiciones de 120–180 ms. Respetar movimiento reducido. No simular esperas de red ni agregar skeletons para datos locales instantáneos; usar reserva de espacio durante decodificación de imágenes.

Objetivos de revisión: 1440×900, 1366×768, 1024×768 y 390×844. Sidebar colapsable bajo 1100 px; drawer bajo 768 px. Mapa y ficha se apilan; las tablas desplazan horizontalmente dentro de su contenedor, no toda la página.

### Recursos y derechos

Preparar 24 retratos sintéticos diferenciados y fotografías agrícolas generadas o con licencia que permita uso y almacenamiento local. No asociar retratos de personas reales a los nombres ficticios. Etiquetar los retratos como ilustraciones generadas y todos los perfiles como ficticios.

Puede generarse un conjunto de retratos en láminas y recortarlo durante preparación, verificando cada resultado. No generar imágenes al ejecutar el portal. Guardar WebP, dimensiones y fallback local; ninguna URL de imagen remota en componentes.

`licenses.json` registra archivo, procedencia, autor/proveedor, licencia, atribución requerida y fecha. Incluir también fuente y licencia del mapa, tipografía e iconos. No asumir que un recurso descargable permite redistribución. La obtención y revisión de estos recursos es trabajo pendiente de implementación.

## 3. Navegación

| Sección | Ruta hash | Destinos relacionados |
|---|---|---|
| Resumen empresarial | `#/dashboard` | Campaña, mapa y órdenes activas |
| Mapa de abasto | `#/mapa` | Ficha de productor y nueva orden |
| Productores | `#/productores` | `#/productores/:id` |
| Monitor NODESS | `#/nodess` | `#/nodess/:id` |
| Órdenes de compra | `#/ordenes` | `#/ordenes/nueva`, `#/ordenes/:id` |
| Facturación demo | `#/comprobantes` | `#/comprobantes/:id` |
| Reportes | `#/reportes` | Órdenes filtradas |
| Configuración | `#/configuracion` | Perfil, preferencias y reset |

Inicio directo en dashboard, sin pantalla de login. Encabezado con nombre de empresa, contexto regional y acceso a ayuda de demostración. No colocar búsqueda global o notificaciones si no tienen una función concreta. Los filtros relevantes pertenecen a cada pantalla.

El carrito de compra conserva líneas al cambiar entre mapa y directorio. «Preparar compra colectiva» abre el mismo compositor utilizado en Órdenes. Mantener selección y filtros al volver desde una ficha.

## 4. Pantallas e interacciones

### 4.1 Dashboard empresarial

Franja con volumen recibido por unidad, importe recibido, productores vinculados y pedidos activos. No sumar pacas con kilogramos ni presentar gasto recibido como dinero pagado.

Bloque principal: campaña «Abastecimiento de alfalfa · Noviembre», meta de 1,000 pacas, compromiso de 850, recepción de 0 y faltante de compromiso de 150. Dos barras separadas: compromiso y recepción. Acción «Completar 150 pacas» abre mapa con producto alfalfa, disponibilidad positiva y contexto de campaña.

Gráfica de gasto recibido de mayo a noviembre; barras de volumen por unidad, sin eje de unidades mezcladas. Actividad reciente derivada de eventos. Cada indicador incluye periodo y vínculo al detalle que explica su cifra.

### 4.2 Mapa de abasto

Distribución de tres áreas: filtros compactos, mapa dominante y ficha lateral de selección. En portátil, filtros superiores y ficha de 320 px; en móvil, ficha debajo.

Filtros combinables: municipio, producto, disponibilidad y distancia simulada al destino empresarial. Mostrar cantidad de resultados, limpiar filtros y estado vacío con recuperación. La distancia es un dato semilla rotulado «Distancia simulada»; no ofrecer navegación vial ni tiempo de traslado.

24 productores y seis agrupaciones con símbolos distintos. Al seleccionar una agrupación se muestran sus miembros; al seleccionar un productor se resaltan ficha y marcador. Ofrecer lista equivalente para teclado y accesibilidad. Marcadores cercanos se separan visualmente sin alterar su ubicación de referencia; no se requiere motor de clustering.

Ficha: retrato, municipio, productos, unidad, precio, stock disponible, reputación ficticia y agrupación. Cantidad editable, validación de stock y «Agregar a compra». La selección de José y María muestra total acumulado 150/150 y abre revisión de orden colectiva. No confirmar compra desde un marcador sin revisar.

### 4.3 Directorio de productores

Vista inicial editorial compacta: retrato, nombre, unidad productiva ficticia, municipio, especialidad, disponibilidad y reputación. Búsqueda por nombre y filtros por municipio, producto y NODESS.

Detalle con descripción breve, catálogo de ofertas, capacidad por producto y periodo, operaciones históricas y reseñas ficticias claramente identificadas. Capacidad potencial y stock disponible son conceptos separados. Contactar abre diálogo local con canal y mensaje; «Registrar contacto simulado» agrega actividad y confirma que no se envió ningún mensaje real.

Comprar reutiliza carrito y compositor. Productores sin stock permiten contacto, pero no agregar cantidad positiva.

### 4.4 Monitor NODESS

Seis agrupaciones: nombre ficticio, municipios, integrantes, campañas y progreso. Detalle con meta, comprometido, recibido y faltante. Tabla de contribuciones por integrante con pedidos pendientes de aceptación separados de compromisos aceptados.

Crear agrupación exige nombre, municipio de referencia y al menos un integrante. Para abrir una campaña exige producto, unidad, cantidad positiva y fecha objetivo. Agregar o retirar integrantes actualiza membresía, sin reescribir órdenes ni campañas históricas. Un productor con aportación activa no puede retirarse de esa agrupación hasta cerrar su compromiso; explicar el motivo en la interfaz.

Cada productor pertenece inicialmente a una agrupación. La primera versión conserva esa regla para evitar dobles pertenencias ambiguas. Las campañas guardan su agrupación y los pedidos conservan referencias históricas.

### 4.5 Órdenes de compra

Listado con folio, fecha, tipo individual/colectiva, productores, cantidad por unidad, importe y estado. Filtros por estado, producto y periodo. Nueva orden en tres pasos: selección, cantidades y destino, revisión y confirmación.

Para cada línea: productor, producto, unidad, precio congelado, cantidad e importe. Permitir varios productos; una orden solo aporta a una campaña con líneas de su producto y unidad exactos. Las líneas ajenas quedan como compra general y no incrementan esa meta.

Detalle con desglose por productor y línea temporal. Acciones explícitas: «Simular aceptación» por productor, «Simular envío» y «Confirmar recepción» por entrega de productor. No ejecutar aceptación con temporizadores. Se admite recepción independiente de cada productor, completa para sus líneas; recepción parcial dentro de una misma línea queda fuera de esta entrega.

Confirmación muestra cantidades y destino. Bloquear cantidades vacías, negativas, decimales en pacas y superiores al disponible; kilogramos admiten hasta tres decimales. Un segundo clic no repite la operación. Cancelación solo antes del envío; libera reservas y compromisos, conservando historial.

### 4.6 Facturación de demostración

Listado de diez comprobantes iniciales, filtros por productor, periodo, orden y pago simulado. Resumen consolidado con subtotal recibido, pagado simulado y saldo pendiente. Una orden colectiva genera documentos separados por productor recibido.

Documento: folio interno, empresa ficticia, productor ficticio, fecha, referencia de orden/recepción, líneas, cantidades, precios e importe total. Texto visible en pantalla e impresión: **«COMPROBANTE SIMULADO — SIN VALIDEZ FISCAL. No es un CFDI.»** No inventar RFC, sellos, UUID fiscales ni QR de validación SAT.

Precios finales de demostración; sin desglose ni cálculo de impuestos. No implica tratamiento fiscal de productos reales. Pago simulado alterna pendiente/pagado mediante confirmación y evento; no mueve cantidades ni gasto recibido.

Vista imprimible con CSS `@media print`, documento sin sidebar y salto por productor. Acción «Imprimir / Guardar como PDF» usa el diálogo del navegador; no prometer descarga PDF automática. CSV local para resumen consolidado, con escape de celdas para evitar interpretación como fórmulas.

### 4.7 Reportes

Periodo inicial mayo–noviembre de 2026. Cuatro vistas dentro de la misma pantalla: compras por municipio, evolución mensual, participación por productor y aportación económica simulada. Filtros de periodo, producto y agrupación.

Compras e impacto económico usan recepciones; mostrar monto destinado a productores ficticios, productores con compras recibidas y proporción de compra regional. No convertir eso en empleos creados, mejora de ingreso causal o impacto social validado. La etiqueta «regional» significa municipio dentro del conjunto Coahuila del seed; no inventar una comparación externa.

Series y tablas comparten selectores con dashboard; al seleccionar un dato se abre el conjunto de órdenes que lo compone. Exportación CSV con columnas y unidades explícitas. Estado vacío cuando un filtro no tiene operaciones.

### 4.8 Configuración

Editar nombre comercial ficticio, contacto de demostración, municipio y dirección de recepción. Preferencias: vista inicial del directorio y movimiento reducido. Español de México y MXN son valores fijos de esta entrega.

Restablecer muestra confirmación indicando que eliminará los cambios locales. Borra únicamente la clave de este portal, recrea el seed, limpia carrito/filtros y vuelve al dashboard. Nunca usar `localStorage.clear()`.

## 5. Modelo de datos y relaciones

Todas las entidades tienen IDs estables. Fechas de negocio ISO de calendario; eventos con fecha/hora ISO. Moneda en centavos enteros. Cantidades en unidad mínima: pacas enteras y gramos para productos vendidos por kilogramo; presentación y cálculo convierten de forma explícita. Redondear importes por línea a centavos antes de sumar.

| Entidad | Campos esenciales | Relación |
|---|---|---|
| Company | id, nombre, destino, preferencias | Compradora de órdenes y campañas |
| Municipality | id, nombre, punto de referencia | Productores, grupos y destino |
| Producer | id, nombre ficticio, retrato, municipio, unidad productiva, reputación demo | Ofertas y membresía actual |
| Product | id, nombre, sector, unidad, escala de cantidad | Ofertas, campañas y líneas |
| Offer | id, producerId, productId, existencias iniciales, precio, capacidad, distancia simulada | Fuente de líneas de compra |
| NodessGroup | id, nombre, referencia geográfica, memberIds | Agrupa productores y campañas |
| Campaign | id, groupId, companyId, productId, meta, periodo | Recibe aportaciones de líneas vinculadas |
| Order | id, folio, companyId, fecha, destino congelado, líneas | Individual o colectiva según proveedores distintos |
| OrderLine | id, offerId, producerId, productId, campaignId opcional, cantidad, precio congelado | Referencia estable para aceptación y recepción |
| SupplierFulfillment | orderId, producerId, estado, fechas | Controla aceptación, envío y recepción por productor |
| Receipt | id, orderId, producerId, lineIds, fecha | Mercancía efectivamente recibida |
| DemoInvoice | id, receiptId, folio interno, snapshot de partes y líneas, pago simulado | Exactamente una por recepción |
| ActivityEvent | id, tipo, referencias, fecha, descripción | Historial visible; no event sourcing |

No guardar KPIs como entidades. No copiar productor completo dentro de cada oferta. Los documentos y órdenes sí congelan datos comerciales necesarios para que una edición posterior no reescriba el historial.

### Seed definido

Empresa única, 24 productores ficticios, seis agrupaciones con distribución inicial de integrantes **5, 4, 4, 4, 4, 3**, doce productos, quince órdenes y diez comprobantes. Las cantidades son exactas al restablecer; aumentan durante la interacción.

Municipios representados: Nadadores, San Buenaventura, Monclova, Frontera, Sacramento, Lamadrid, Cuatro Ciénegas, Abasolo, Escobedo, Castaños, General Cepeda y Saltillo. Validar nombres y posiciones durante preparación cartográfica. No afirmar ubicaciones de predios reales; los puntos indican referencias municipales aproximadas.

Doce productos: alfalfa, avena forrajera, sorgo forrajero, zacate, rastrojo de maíz, cebada forrajera, trigo forrajero y ryegrass en pacas; ensilado de maíz, ensilado de sorgo, maíz en grano y sorgo en grano en kg. `sector` es un dato del catálogo, sin plugins ni lógica rígida ligada a alfalfa.

Agrupación principal ficticia: **NODESS Forrajero Centro**. Miembros: José Hernández, María González y otros tres productores ficticios. Esos tres aportan los compromisos iniciales de 300, 300 y 250 pacas. José tiene 90 disponibles y María 60. Ambos empiezan sin otra reserva sobre esas ofertas.

Las diez órdenes históricas son individuales y recibidas; corresponden a diez productores distintos. Dos por mes de mayo a agosto, una en septiembre y una en octubre. Cada una tiene recepción y comprobante. Las cinco restantes están aceptadas en noviembre, todavía sin recepción; pueden reutilizar productores históricos. Los demás productores conservan ofertas y perfiles sin compras empresariales previas.

| Orden | Producto | Cantidad | Precio unitario MXN | Total MXN | Situación inicial |
|---|---|---:|---:|---:|---|
| OC-001 | Alfalfa | 250 pacas | 120.00 | 30,000.00 | Recibida, mayo |
| OC-002 | Alfalfa | 180 pacas | 118.00 | 21,240.00 | Recibida, mayo |
| OC-003 | Avena forrajera | 120 pacas | 105.00 | 12,600.00 | Recibida, junio |
| OC-004 | Sorgo forrajero | 200 pacas | 95.00 | 19,000.00 | Recibida, junio |
| OC-005 | Zacate | 160 pacas | 85.00 | 13,600.00 | Recibida, julio |
| OC-006 | Rastrojo de maíz | 300 pacas | 65.00 | 19,500.00 | Recibida, julio |
| OC-007 | Ensilado de maíz | 500 kg | 4.50 | 2,250.00 | Recibida, agosto |
| OC-008 | Ensilado de sorgo | 800 kg | 4.20 | 3,360.00 | Recibida, agosto |
| OC-009 | Maíz en grano | 1,000 kg | 6.00 | 6,000.00 | Recibida, septiembre |
| OC-010 | Sorgo en grano | 600 kg | 5.50 | 3,300.00 | Recibida, octubre |
| OC-011 | Alfalfa | 300 pacas | 120.00 | 36,000.00 | Aceptada, campaña principal |
| OC-012 | Alfalfa | 300 pacas | 120.00 | 36,000.00 | Aceptada, campaña principal |
| OC-013 | Alfalfa | 250 pacas | 120.00 | 30,000.00 | Aceptada, campaña principal |
| OC-014 | Avena forrajera | 100 pacas | 105.00 | 10,500.00 | Aceptada, otra campaña |
| OC-015 | Cebada forrajera | 200 pacas | 95.00 | 19,000.00 | Aceptada, otra campaña |

Ocho comprobantes históricos figuran pagados simuladamente y dos pendientes: OC-009 y OC-010. El saldo inicial es $9,300.00; pagado simulado $121,550.00. Las otras cinco agrupaciones tienen una campaña cada una; fijar metas positivas compatibles con sus ofertas, sin añadir órdenes para fabricar progreso. Se admite progreso cero.

Las existencias iniciales de una oferta deben cubrir sus cantidades históricas recibidas, reservas vigentes y disponible mostrado. No poner la cantidad disponible directamente en una variable que luego ignore pedidos existentes.

## 6. Estado, persistencia y reglas de negocio

### Fuente única

`DemoProvider` inicializa el estado desde LocalStorage válido o desde `createSeed()`. Un reducer puro aplica comandos atómicos. Los filtros y overlays son estado de interfaz; las órdenes, carrito, membresías, perfil y documentos son estado persistido.

Clave exclusiva: `conecta-rural-empresarial:v1`. Sobre guardado: `schemaVersion`, `seedVersion`, `savedAt` y `data`. No persistir imágenes en base64; guardar rutas locales.

Al cargar: validar versión, forma, IDs referidos, cantidades y estados permitidos. Datos corruptos o incompatibles no deben provocar pantalla blanca ni sobrescribirse silenciosamente: mostrar recuperación con opción de descargar el contenido original y restablecer. Si falla escritura por bloqueo o cuota, mantener sesión en memoria y mostrar «Los cambios no se conservarán al cerrar».

Una sola pestaña de edición es el modo soportado. Si cambia la clave desde otra pestaña, mostrar aviso y pedir recargar antes de editar; no implementar sincronización multiusuario. Mantener mismo navegador y origen local durante la exposición, porque la persistencia depende del origen.

### Ciclo por productor

`pendiente_aceptacion → aceptada → en_transito → recibida`.

`pendiente_aceptacion → cancelada` y `aceptada → cancelada` son transiciones permitidas. No cancelar recepciones ni reabrir estados terminales. Una orden colectiva resume los estados de sus productores; mostrar estado mixto y detalle cuando difieran. El agregado no sustituye el estado individual.

Comandos mínimos: crear orden, aceptar productor, registrar envío, confirmar recepción, cancelar aportación antes de envío, cambiar pago simulado, crear agrupación, actualizar miembros, guardar empresa, actualizar carrito y restablecer demo.

Crear orden valida todas las líneas contra el estado actual y reserva stock en una sola transición. Aceptar convierte reserva pendiente en compromiso, sin volver a descontar. Confirmar recepción crea recepción y comprobante del productor de forma atómica; repetir el comando devuelve el mismo estado, sin documento adicional. Eventos e IDs se preparan fuera del reducer para conservar su pureza.

### Fórmulas compartidas

- Disponible de oferta = existencias iniciales − cantidades de líneas no canceladas. Incluye reservas pendientes, aceptadas, en tránsito y ya recibidas; una recepción no devuelve stock.
- Reservado pendiente = cantidad de líneas pendientes de aceptación.
- Comprometido de campaña = líneas aceptadas, en tránsito o recibidas vinculadas exactamente a esa campaña.
- Recibido de campaña = cantidades con recepción confirmada de esa campaña.
- Faltante de compromiso = máximo entre meta − comprometido y cero.
- Progreso de compromiso = comprometido / meta; barra limitada a 100%, cifra real conserva eventual excedente.
- Cumplimiento de recepción = recibido / meta; nunca sustituye la barra de compromiso.
- Volumen adquirido mostrado = volumen recibido, separado por unidad y con filtro de producto cuando corresponde.
- Gasto recibido = suma de importes de líneas recibidas en el periodo. Pago simulado es un indicador distinto.
- Productores vinculados = productores distintos con alguna aportación aceptada, en tránsito o recibida; la mera membresía NODESS no cuenta.
- Pedidos activos = órdenes con al menos una aportación pendiente, aceptada o en tránsito.
- Contribución individual = las mismas líneas agrupadas por productor, no un porcentaje guardado manualmente.

Importes comprometidos y gasto recibido deben estar identificados con esos nombres. Las compras históricas de alfalfa no cuentan para la campaña actual solo por compartir producto.

## 7. Mapa autónomo

Elegir **SVG local con contorno de Coahuila y referencias municipales**, sin mosaicos de internet. Descargar durante preparación una geometría redistribuible y registrar procedencia/licencia; simplificarla y convertirla a SVG antes de empacar. Si solo se obtiene un contorno estatal, dibujar puntos municipales; no inventar límites municipales.

Guardar puntos de referencia y sus coordenadas en `locations.json`. Aplicar la misma transformación de coordenadas al contorno y a todos los marcadores. Las agrupaciones usan referencia central aproximada y declaran su área mediante municipios miembros.

Interacciones necesarias: seleccionar, zoom con botones, arrastre, restablecer encuadre, tooltip y selección equivalente en lista. Implementar con `viewBox`, límites de escala y Pointer Events. Separar selección de arrastre. Nunca capturar permanentemente el scroll de la página. Mantener geometría y datos dentro del bundle; no hacer `fetch` a servicios cartográficos.

Estética: fondo claro, límites sobrios, etiquetas prioritarias y una capa agrícola decorativa discreta. Diferenciar productor y agrupación por forma y leyenda. Al iniciar el escenario, encuadrar la región de los dos productores; permitir regresar a todo Coahuila.

No requiere precisión predial, cálculo de rutas, geocodificación, GPS, teselas satelitales ni una licencia de proveedor comercial. El mapa es geográfico y aproximado; no presentarlo como plano técnico.

Funcionamiento offline significa equipo sin internet, con un servidor **estático local** sirviendo `dist` por loopback. No hay servidor de negocio. No prometer ejecución por doble clic en `index.html`: no es la forma de entrega prevista. No agregar service worker para este plazo.

## 8. Guion obligatorio de demostración

Fecha de referencia inicial fija: 19 de noviembre de 2026. La campaña pertenece a noviembre. Los eventos nuevos pueden usar la fecha local real sin mover las fechas históricas. El ensayo parte de restablecer datos.

Precio elegido para ambos nuevos proveedores: **$120.00 por paca**. José: $10,800.00; María: $7,200.00. Orden colectiva: **$18,000.00**, sin cargos ocultos.

| Paso | Acción del expositor | Comprometido | Recibido de campaña | Comprobantes totales |
|---|---|---:|---:|---:|
| 0 | Restablecer y abrir dashboard | 850 / 1,000 · 85% | 0 | 10 |
| 1 | Completar 150; seleccionar José 90 y María 60 | 850 · 85% | 0 | 10 |
| 2 | Confirmar nueva orden colectiva | 850 · 85%; 150 pendientes | 0 | 10 |
| 3 | Simular aceptación de José | 940 · 94% | 0 | 10 |
| 4 | Simular aceptación de María | 1,000 · 100% | 0 | 10 |
| 5 | Simular envío de ambos | 1,000 · 100% | 0 | 10 |
| 6 | Confirmar recepción de José | 1,000 · 100% | 90 | 11 |
| 7 | Confirmar recepción de María | 1,000 · 100% | 150 | 12 |
| 8 | Ver documentos individuales y resumen | 1,000 · 100% | 150 | 12 |

Resultado importante: **recibir estas 150 pacas no implica haber recibido 1,000**. Las otras 850 siguen comprometidas y pendientes de entrega. La pantalla termina con «Meta de compromiso cubierta» y «150 de 1,000 recibidas · 15%». No celebrar abastecimiento entregado al 100%.

La nueva orden es OC-016. Al crearla baja la disponibilidad de ambos proveedores a cero; aceptar y recibir no vuelven a descontar. Tras la segunda recepción existen 16 órdenes, 12 documentos y dos productores adicionales con recepción.

En vista de todo el historial, el gasto recibido pasa de **$130,850.00 a $148,850.00**, y las pacas recibidas de **1,210 a 1,360**. Los **2,900 kg** históricos no cambian. En noviembre, gasto recibido pasa de cero a $18,000.00. Las cinco órdenes iniciales siguen activas; OC-016 deja de contar como activa al recibir ambos proveedores.

El compromiso aceptado abierto inicial es $131,500.00. Tras ambas aceptaciones alcanza $149,500.00; al recibir las 150 pacas vuelve a $131,500.00. Los dos comprobantes nuevos nacen pendientes de pago simulado. Consultar el mismo periodo en dashboard y reportes para comparar cifras.

La guía de exposición muestra estos ocho pasos como ayuda. Cada paso lleva a la pantalla pertinente; no modifica estado por su cuenta ni salta validaciones.

## 9. Orden de implementación y archivos afectados

Ejecutar secuencialmente por Codex Terra. No iniciar ocho pantallas con datos desconectados. Cada bloque termina con su verificación antes de continuar.

### P0-A. Dominio y seed verificable

- [ ] Crear proyecto únicamente en `portal-empresarial/`, configuración y scripts `dev`, `build`, `preview`, `test` y `typecheck`.
- [ ] Escribir `domain/types.ts`, `seed.ts`, `validation.ts`, `reducer.ts` y `selectors.ts`.
- [ ] Definir los 24 perfiles, todas las ofertas, seis campañas y sus relaciones; completar exactamente las quince órdenes y diez comprobantes de la tabla.
- [ ] Preparar pruebas de seed y transiciones antes de conectar pantallas. Comprobar los valores esperados del apartado 8.
- [ ] Implementar `state/storage.ts` y `DemoProvider.tsx` con recuperación de errores.

Entrega comprobable: la secuencia de comandos de demo produce los valores esperados sin UI. Los tests importan funciones de dominio, no duplican sus algoritmos.

### P0-B. Sistema visual, navegación y recursos

- [ ] Crear `styles/*`, `AppShell.tsx`, `routes.ts`, ocho rutas y estado de ruta desconocida.
- [ ] Incorporar mapa, retratos, fotografías, fuente y manifiesto de licencias en `public/assets/`.
- [ ] Construir componentes compartidos al necesitarlos: botón, estado, diálogo accesible, tabla, filtro y barra de progreso doble.
- [ ] Verificar encuadre de 1366×768 y navegación con teclado antes de replicar patrones.

Entrega comprobable: todas las secciones son alcanzables, los recursos son locales y la identidad visual está fijada.

### P0-C. Recorrido principal integrado

- [ ] Implementar dashboard con campaña y selectores reales.
- [ ] Implementar mapa, selección y carrito persistido.
- [ ] Implementar compositor, detalle de orden y acciones por productor.
- [ ] Implementar monitor NODESS con progreso derivado.
- [ ] Implementar recepción atómica, documentos individuales e impresión.
- [ ] Ejecutar la demo completa y recargar después de cada etapa crítica.

Entrega comprobable: recorrido obligatorio terminado, incluida distinción compromiso/recepción y documentos sin duplicados.

### P1. Completar alcance obligatorio

- [ ] Terminar directorio, fichas, catálogo, contacto simulado y reputación.
- [ ] Terminar creación de agrupación y administración de integrantes.
- [ ] Terminar filtros de órdenes, compras individuales y productos distintos de alfalfa.
- [ ] Terminar consolidado de comprobantes y pago simulado.
- [ ] Implementar reportes y CSV con los selectores compartidos.
- [ ] Implementar edición de perfil, preferencias y restablecimiento.

Entrega comprobable: ocho módulos utilizables; ninguna acción visible queda sin respuesta o abre una pantalla vacía.

### P2. Preparación de exposición

- [ ] Revisar responsive, accesibilidad, imágenes, contraste y textos.
- [ ] Ejecutar pruebas de regresión, typecheck y build.
- [ ] Probar el build con conexión externa desactivada y recarga completa.
- [ ] Guardar build, dependencias necesarias para arrancar localmente y guía de exposición.
- [ ] Documentar resultados reales y limitaciones en `portal-empresarial/README.md`.

No generar cambios en una app móvil ni cambiar paquetes de un proyecto hermano.

## 10. Criterios de aceptación

1. Ocho módulos navegables, con ruta recargable, regreso y estados vacíos funcionales.
2. Seed con 24 productores, seis agrupaciones, doce productos, quince órdenes y diez comprobantes; integridad referencial comprobada.
3. Dashboard y reportes reconstruyen sus indicadores desde operaciones y recepciones del mismo periodo.
4. No se suman unidades incompatibles ni se confunden compromiso, recepción y pago.
5. Mapa local reconoce 24 productores y seis grupos; filtros combinables, zoom, desplazamiento y selección funcionan sin internet.
6. El guion produce 85%, 94% y 100% de compromiso en orden; recepción final de campaña de 150, no 1,000.
7. Orden de 90 + 60 pacas cuesta $18,000.00; produce exactamente dos documentos nuevos al recibir ambos proveedores.
8. Carrito, órdenes y datos sobreviven recarga. Fallos de persistencia y datos corruptos tienen recuperación visible.
9. Compras individuales y colectivas validan stock y unidades; no admiten doble reserva ni transición inválida.
10. Se pueden crear agrupaciones y administrar miembros respetando compromisos activos.
11. Todos los comprobantes declaran simulación y falta de validez fiscal, también impresos.
12. Pago simulado, contacto simulado, perfil y preferencias producen resultados observables y coherentes.
13. Reset reproduce exactamente el estado inicial, sin eliminar claves ajenas.
14. Fotografías, retratos, mapa, iconos y fuente son locales; derechos y atribuciones están registrados.
15. Sin errores de consola durante el recorrido; sin peticiones a dominios externos en la prueba offline.
16. Acciones accesibles por teclado, foco visible y restaurado tras diálogos; etiquetas de formularios y mensajes de error claros.
17. No hay desbordamiento global en resoluciones objetivo; las tablas conservan acceso a todas sus columnas.
18. Build, tipos y pruebas críticas pasan con evidencia registrada. El estado visual se revisa en navegador, no solo mediante compilación.

## 11. Pruebas de regresión

### Dominio y seed — Vitest

| Caso | Resultado exigido |
|---|---|
| Seed recién creado | Conteos exactos, IDs únicos, referencias existentes y 850 comprometidas en campaña |
| Crear colectiva | Nueva orden, 150 pendientes, 850 comprometidas, stock José/María cero |
| Aceptación separada | Primero 940; después 1,000; recibido permanece cero |
| Enviar sin aceptar | Operación rechazada sin cambios |
| Recepción separada | 90 y después 150 recibidas; 11 y después 12 documentos |
| Doble clic / reintento | Misma recepción y documento; sin doble stock o actividad |
| Cantidad inválida | Rechazar cero, negativo, decimal en pacas y exceso de stock |
| Carrito desactualizado | Revalidar al confirmar; no reservar parcialmente una orden inválida |
| Cancelación permitida | Libera cantidades una sola vez; ajusta compromiso si ya estaba aceptada |
| Cancelación tras envío | Rechazo sin pérdida de recepción o documentos |
| Precio editado después | Órdenes y documentos históricos conservan su precio |
| Agrupación editada | Historial no cambia; no retirar aportante activo |
| Periodo y unidades | Total histórico $130,850.00; 1,210 pacas y 2,900 kg; campaña excluye compras antiguas |
| Pago simulado | Cambia saldo, sin modificar gasto recibido ni volumen |
| Persistencia | Lectura válida; corrupción, versión incompatible y fallo de escritura controlados |
| Reset | Seed exacto; clave ajena en LocalStorage intacta |

Probar importes fraccionarios en kg y redondeo por línea con un caso pequeño, sin introducir impuestos.

### Navegador — recorrido integrado

Un test automatizado principal: reset, dashboard, mapa filtrado, José 90, María 60, orden OC-016, aceptación por productor, NODESS 100%, recepción separada y dos documentos. Recargar tras crear orden y tras primera recepción. Consultar reportes y verificar $148,850.00 en todo el historial. Repetir acción terminal comprueba ausencia de duplicados.

Un segundo recorrido corto: crear compra individual de otro producto, contactar simuladamente, crear agrupación con un productor transferible, editar empresa y restablecer.

Comprobación manual: impresión sin navegación y con leyenda fiscal, PDF guardado desde diálogo, CSV legible, teclado y Escape en diálogos, navegación atrás, imágenes cargadas, filtros sin resultados y cuatro tamaños objetivo.

Para offline: servir build en localhost, cortar internet externo manteniendo loopback, abrir navegador con caché desactivada y recargar. Recorrer ocho módulos y la demo; revisar red. No usar el modo del navegador que bloquee también localhost como única prueba.

Los scripts previstos son `npm run test -- --run`, `npm run typecheck` y `npm run build`, ejecutados desde `portal-empresarial/`. `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` sirve únicamente para el ensayo estático local. Configurar esos scripts durante implementación; todavía no existen.

## 12. Estrategia para terminar hoy

Estimación orientativa de **ocho horas efectivas**, no promesa de rendimiento de un agente. Si quedan menos horas, reducir ornamentación y variantes; conservar los ocho módulos y todas las reglas del recorrido.

| Tiempo acumulado | Trabajo | Puerta de salida |
|---|---|---|
| 0:00–0:30 | Contrastar adjuntos si llegan, fijar alcance y obtener recursos | Sin decisiones de dominio abiertas |
| 0:30–1:45 | Seed, reducer, selectores y persistencia | Secuencia de demo aprobada por pruebas |
| 1:45–2:45 | Shell, estilos y recursos locales | Identidad visual y navegación revisadas |
| 2:45–4:30 | Mapa, carrito, órdenes, aceptación y NODESS | Compra colectiva completa |
| 4:30–5:15 | Recepción, documentos e impresión | Dos comprobantes correctos e idempotentes |
| 5:15–6:30 | Directorio, gestión NODESS, reportes y configuración | Alcance funcional completo |
| 6:30–7:15 | Pulido visual y responsive | Presentación consistente en portátil |
| 7:15–8:00 | Regresión, offline, empaquetado y ensayo | Build final estable y guía lista |

Reservar los últimos 45 minutos para validación. Congelar dependencias y funcionalidades al comenzar ese bloque. Si aparece un fallo de dominio, corregirlo antes de añadir una transición o animación.

Reducciones admisibles: menos animaciones, cuatro gráficas fijas, diálogo de contacto sencillo, impresión del navegador y mapa de contorno con puntos municipales. No reducir productores, módulos, filtros exigidos, operaciones individuales/colectivas, derechos de recursos ni pruebas del recorrido principal.

Paquete final: código fuente, lockfile, `dist/`, recursos/licencias, instrucciones de arranque local con puerto fijo, resultados de pruebas y guion de exposición de cuatro minutos. Preparar recursos y dependencias antes de desconectar internet. Abrir una sola pestaña y restablecer una vez antes de recibir a los jueces.

### Instrucción de traspaso a Codex Terra

Leer este documento completo. Revisar primero si ya hay archivos nuevos para preservar trabajo ajeno. Trabajar únicamente en `portal-empresarial/`. Ejecutar P0-A, P0-B, P0-C, P1 y P2 en ese orden. Actualizar las casillas y registrar evidencia al terminar cada bloque. Tomar decisiones menores de forma autónoma dentro del alcance. No introducir backend, servicios remotos, autenticación ni cambios móviles. Si siguen faltando protocolo y referencias, conservar esa limitación explícita; no afirmar que se analizaron.

El trabajo termina cuando los criterios del apartado 10 están comprobados, el build navega sin internet externo y el guion produce sus cifras exactas. Esta fase entrega planificación; no implementa la aplicación.
