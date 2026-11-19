import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Sprout,
  LayoutGrid,
  Map,
  Users,
  Network,
  ShoppingBag,
  Receipt,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Plus,
  Minus,
  LocateFixed,
  Search,
  ChevronDown,
  Menu,
  X,
  Check,
  Truck,
  Warehouse,
  Layers,
  Download,
  Printer,
} from "lucide-react";
import {
  towns,
  products,
  producers,
  unit,
  money,
  amount,
  total,
  seed,
  all,
  stock,
  stats,
  receipts,
  folio,
  transact,
  today,
} from "./domain";
import "./style.css";
const nav = [
  ["dashboard", "Resumen", LayoutGrid],
  ["mapa", "Mapa de abasto", Map],
  ["productores", "Productores", Users],
  ["nodess", "Monitor NODESS", Network],
  ["ordenes", "Órdenes de compra", ShoppingBag],
  ["comprobantes", "Facturación", Receipt],
  ["reportes", "Reportes", ChartNoAxesCombined],
  ["configuracion", "Configuración", Settings],
];
const key = "conecta-rural-empresarial:v1",
  nf = (n) => new Intl.NumberFormat("es-MX").format(n),
  go = (p) => (location.hash = "#/" + p);
function initial() {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    if (
      v?.schemaVersion === 1 &&
      Array.isArray(v.data?.orders) &&
      Array.isArray(v.data?.groups) &&
      Array.isArray(v.data?.offers) &&
      Array.isArray(v.data?.cart) &&
      Array.isArray(v.data?.events) &&
      v.data.company &&
      v.data.paid
    )
      return { data: v.data, error: "" };
    return {
      data: seed(),
      error: v ? "Datos locales incompatibles. Restablece la demo." : "",
    };
  } catch {
    return {
      data: seed(),
      error: "No se pudo leer la sesión local. Restablece la demo.",
    };
  }
}
function App() {
  const [boot] = useState(initial),
    [s, set] = useState(boot.data),
    [notice, msg] = useState(boot.error),
    [locked, lock] = useState(!!boot.error),
    [route, R] = useState(location.hash.slice(2) || "dashboard"),
    [drawer, D] = useState(false);
  const content = useRef(null);
  useEffect(() => {
    if (
      s.company.reduced ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const motion = content.current?.animate(
      [
        { opacity: 0.86, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, easing: "ease-out" },
    );
    return () => motion?.cancel();
  }, [route, s.company.reduced]);
  useEffect(() => {
    const h = () => {
      R(location.hash.slice(2) || "dashboard");
      D(false);
      window.scrollTo(0, 0);
    };
    const t = (e) => {
      if (e.key === key) {
        lock(true);
        msg("Otra pestaña cambió los datos. Recarga antes de editar.");
      }
    };
    window.addEventListener("hashchange", h);
    window.addEventListener("storage", t);
    return () => {
      window.removeEventListener("hashchange", h);
      window.removeEventListener("storage", t);
    };
  }, []);
  useEffect(() => {
    if (!locked)
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            schemaVersion: 1,
            seedVersion: 1,
            savedAt: today,
            data: s,
          }),
        );
      } catch {
        msg("Los cambios no se conservarán al cerrar.");
      }
  }, [s, locked]);
  const [section, detail] = route.split("?")[0].split("/"),
    campaign = route.includes("campana") ? 0 : null;
  function update(fn, feedback = "") {
    if (locked) return;
    try {
      const next = fn(s);
      set(next);
      msg(next === s ? "" : feedback);
    } catch (e) {
      msg(e.message);
    }
  }
  function add(o, qty, group = null) {
    const other = s.cart.filter(
        (l) => l.producer === o.producer && l.p === o.p,
      ),
      sum = qty + (other[0]?.qty || 0),
      scale = o.p < 8 ? 1 : 1000;
    if (
      !Number.isFinite(qty) ||
      qty <= 0 ||
      sum > stock(s, o) ||
      Math.abs(qty * scale - Math.round(qty * scale)) > 1e-7
    ) {
      msg("Revisa la cantidad y la disponibilidad.");
      return;
    }
    update((s) => ({
      ...s,
      cart: [
        ...s.cart.filter((l) => l.producer !== o.producer || l.p !== o.p),
        {
          producer: o.producer,
          p: o.p,
          price: o.price,
          qty: Math.round(sum * scale) / scale,
          group: group ?? other[0]?.group ?? null,
        },
      ],
    }));
    if (!locked) msg("Producto agregado a la orden.");
  }
  const props = { s, update, add, msg, buying: route.includes("compra=1") };
  return (
    <div className={"app " + (s.company.reduced ? "reduced" : "")}>
      <aside className={drawer ? "open" : ""}>
        <a className="brand" href="#/dashboard">
          <span>
            <svg
              width="26"
              height="26"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 22c7-7 15-10 22-9M5 26c6-6 13-9 20-9M13 26c4-3 8-5 12-5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M12 14c-5 0-8-4-8-9 5 0 9 3 9 8M13 14c0-6 4-10 10-10 0 6-4 10-10 10Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            Conecta Rural<small>EMPRESARIAL</small>
          </div>
        </a>
        <div className="navlabel">ESPACIO DE TRABAJO</div>
        {nav.map(([id, label, Icon]) => (
          <a
            key={id}
            className={"nav " + (section === id ? "active" : "")}
            aria-current={section === id ? "page" : undefined}
            href={"#/" + id}
          >
            <Icon size={18} />
            {label}
          </a>
        ))}
        <div className="asidefoot">
          <i />
          Modo demostración<small>Datos y operaciones ficticios</small>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <button
            className="mobile icon"
            onClick={() => D(!drawer)}
            aria-label="Menú"
          >
            <Menu />
          </button>
          <div className="crumb">
            Espacio empresarial <span>/</span>{" "}
            {nav.find((n) => n[0] === section)?.[1]}
          </div>
          <a
            className="cart"
            href="#/ordenes/nueva"
            aria-label="Abrir orden en preparación"
          >
            <ShoppingBag size={18} />
            <b>{s.cart.length}</b>
          </a>
          <div className="account">
            <div className="avatar">FN</div>
            <div>
              <b>{s.company.name}</b>
              <small>Compras regionales</small>
            </div>
          </div>
        </header>
        <main ref={content}>
          {section === "dashboard" ? (
            <Dashboard {...props} />
          ) : section === "mapa" ? (
            <Supply key={route} {...props} campaign={campaign} />
          ) : section === "productores" ? (
            <Directory {...props} detail={detail} />
          ) : section === "nodess" ? (
            <Groups {...props} detail={detail} />
          ) : section === "ordenes" ? (
            <Orders key={route} {...props} detail={detail} />
          ) : section === "comprobantes" ? (
            <Invoices {...props} detail={detail} />
          ) : section === "reportes" ? (
            <Reports {...props} />
          ) : section === "configuracion" ? (
            <Setup
              {...props}
              reset={() => {
                try {
                  localStorage.removeItem(key);
                } catch {}
                lock(false);
                set(seed());
                msg("Demo restablecida.");
                go("dashboard");
              }}
            />
          ) : (
            <Missing />
          )}
        </main>
      </div>
      {notice && (
        <div role="status" className="toast" key={notice}>
          {/agregado|registrado|restablecida|guardad|recepción confirmada|suministro aceptado/i.test(
            notice,
          ) ? (
            <Check aria-hidden="true" size={19} />
          ) : (
            <span className="notice-dot" aria-hidden="true" />
          )}
          {notice}
          <button aria-label="Cerrar aviso" onClick={() => msg("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
const Btn = ({
  children,
  onClick,
  secondary = false,
  disabled = false,
  type = "button",
}) => (
  <button
    type={type}
    disabled={disabled}
    className={secondary ? "btn secondary" : "btn"}
    onClick={onClick}
  >
    {children}
  </button>
);
const Link = ({ to, children, secondary = false }) => (
  <a className={secondary ? "btn secondary" : "btn"} href={"#/" + to}>
    {children}
  </a>
);
const Head = ({ tag, title, desc, children, level: Title = "h1" }) => (
  <div className="heading">
    <div>
      <div className="eyebrow">{tag}</div>
      <Title>{title}</Title>
      <p>{desc}</p>
    </div>
    {children}
  </div>
);
const Badge = ({ children }) => (
  <span
    className={
      "badge " +
      (["Pendiente", "Mixta", "Pendiente de pago"].includes(children)
        ? "amber"
        : {
            Cancelada: "muted",
            Aceptada: "accepted",
            "En tránsito": "in-transit",
            Recibida: "received",
            "Pagado simulado": "received",
          }[children] || "")
    }
  >
    {children}
  </span>
);
const Empty = ({ children }) => <div className="empty">{children}</div>;
const Missing = () => (
  <Empty>
    No encontramos este registro. <Link to="dashboard">Volver al resumen</Link>
  </Empty>
);
const dateMX = (value) =>
  value
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(value))
    : "—";
const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
function SearchField({ label, value, onChange }) {
  return (
    <label>
      {label}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Listing({ headers, rows }) {
  const [page, setPage] = useState(0),
    size = 12,
    pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages - 1);
  return (
    <>
      <Table
        headers={headers}
        rows={rows.slice(current * size, (current + 1) * size)}
      />
      {pages > 1 && (
        <div className="pagination">
          <Btn
            secondary
            disabled={!current}
            onClick={() => setPage(current - 1)}
          >
            Anterior
          </Btn>
          <span aria-live="polite">
            Página {current + 1} de {pages} · {rows.length} registros
          </span>
          <Btn
            secondary
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
          >
            Siguiente
          </Btn>
        </div>
      )}
    </>
  );
}
function Table({ headers, rows }) {
  return rows.length ? (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className={
                  /importe|precio|monto/i.test(h) ? "numeric" : undefined
                }
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td
                  key={j}
                  className={
                    /importe|precio|monto/i.test(headers[j])
                      ? "numeric"
                      : undefined
                  }
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty>No hay resultados con estos filtros.</Empty>
  );
}
function Progress({ data, p = 0 }) {
  return (
    <div className="progress">
      {[
        ["Comprometidas", data.committed],
        ["Recibidas", data.received],
      ].map(([label, n]) => (
        <div
          key={label}
          className={
            label === "Recibidas" ? "received-track" : "committed-track"
          }
        >
          <div>
            <b>{label}</b>
            <span>
              {nf(n)} de {nf(data.target)} {unit(p)} ·{" "}
              <strong className="value-change" key={n}>
                {Math.round((n / data.target) * 100)}%
              </strong>
            </span>
          </div>
          <div
            className="live-progress"
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={data.target}
            aria-valuenow={Math.min(n, data.target)}
          >
            <i
              style={{ width: Math.min(100, (n / data.target) * 100) + "%" }}
            />
          </div>
        </div>
      ))}
      {data.committed >= data.target && (
        <p className="goal-complete">
          <Check size={15} aria-hidden="true" /> Meta de compromiso cubierta
        </p>
      )}
    </div>
  );
}
const months = ["May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov"];
function Chart({ lines }) {
  const vals = months.map((_, i) =>
    total(lines.filter((l) => Number(l.received?.slice(5, 7)) === i + 5)),
  );
  const max = Math.max(
    10000,
    Math.ceil(Math.max(0, ...vals) / 1000000) * 1000000,
  );
  return (
    <div className="chart-shell">
      <div className="chart-axis" aria-hidden="true">
        {[max, max / 2, 0].map((n) => (
          <span key={n}>{money(n).replace(/\.00$/, "")}</span>
        ))}
      </div>
      <div
        className="chart"
        role="group"
        aria-label="Valor mensual de compras en MXN"
      >
        {vals.map((n, i) => (
          <div key={i}>
            <div
              className="charttrack"
              tabIndex={0}
              aria-label={months[i] + ": " + money(n)}
            >
              <span className="chart-tooltip" aria-hidden="true">
                {money(n)}
              </span>
              <b className="chartvalue">
                {n
                  ? new Intl.NumberFormat("es-MX", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(n / 100)
                  : "–"}
              </b>
              <span
                title={money(n)}
                style={{ height: Math.max(n ? 3 : 0, (n / max) * 100) + "%" }}
              />
            </div>
            <small>{months[i]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
function DemoGuide() {
  return (
    <details className="demo-guide">
      <summary>
        Guía de exposición <small>4 minutos</small>
      </summary>
      <ol>
        <li>
          <b>Localizar productores.</b> Ubica a José Hernández en Nadadores y a
          María González en San Buenaventura.
        </li>
        <li>
          <b>Realizar pedido.</b> Agrega 90 y 60 pacas. Confirma la orden por
          $18,000 MXN.
        </li>
        <li>
          <b>Confirmar suministro.</b> Verifica en NODESS el avance de 85% a 94%
          y 100%.
        </li>
        <li>
          <b>Recibir mercancía.</b> Simula los envíos y registra las 150 pacas
          recibidas.
        </li>
        <li>
          <b>Generar comprobantes.</b> Abre ambos documentos y muestra su
          leyenda fiscal.
        </li>
      </ol>
      <a className="textlink" href="#/configuracion">
        Opciones para restablecer la demo <ArrowUpRight size={14} />
      </a>
    </details>
  );
}
function Dashboard({ s }) {
  const lines = all(s),
    received = lines.filter((l) => l.status === "Recibida"),
    sum = (u) =>
      received.filter((l) => unit(l.p) === u).reduce((a, l) => a + l.qty, 0),
    g = stats(s, 0),
    missing = Math.max(0, g.target - g.committed),
    active = s.orders.filter((o) =>
      o.lines.some((l) =>
        ["Pendiente", "Aceptada", "En tránsito"].includes(l.status),
      ),
    ).length;
  return (
    <>
      <Head
        tag="INTELIGENCIA DE ABASTO"
        title="Resumen empresarial"
        desc="Supervisa tus compras y el abastecimiento regional."
      >
        <div className="date">Mayo–noviembre 2026</div>
      </Head>
      <div className="metrics">
        {[
          [
            Warehouse,
            "Volumen adquirido",
            nf(sum("pacas")) + " pacas",
            nf(sum("kg")) + " kg recibidos",
          ],
          [
            Receipt,
            "Valor de compras recibidas",
            money(total(received)),
            "Importe de mercancía recibida",
          ],
          [
            Users,
            "Productores vinculados",
            new Set(
              lines
                .filter((l) => !["Pendiente", "Cancelada"].includes(l.status))
                .map((l) => l.producer),
            ).size,
            "Con compras aceptadas o recibidas",
          ],
          [
            ShoppingBag,
            "Pedidos activos",
            active,
            "Pendientes, aceptados o en tránsito",
          ],
        ].map(([Icon, label, v, h]) => (
          <article key={label}>
            <div>
              <Icon size={18} />
              {label}
            </div>
            <strong className="value-change" key={v}>
              {v}
            </strong>
            <small>{h}</small>
          </article>
        ))}
      </div>
      <section className="campaign">
        <div className="campaign-content">
          <div className="eyebrow">
            <Sprout size={16} /> CAMPAÑA PRIORITARIA · NOVIEMBRE
          </div>
          <h2>Abastecimiento de alfalfa</h2>
          <p>NODESS Forrajero Centro · Meta de 1,000 pacas</p>
          <Progress data={g} />
          <div className="campaign-actions">
            <Link to={missing ? "mapa?campana=0" : "nodess/0"}>
              {missing ? "Completar " + nf(missing) + " pacas" : "Ver campaña"}{" "}
              <ArrowRight size={16} />
            </Link>
            <span className="campaign-gap">
              {missing
                ? nf(missing) + " pacas por comprometer"
                : "Suministro confirmado"}
            </span>
          </div>
          {g.pending > 0 && (
            <p className="acceptance-note">
              {nf(g.pending)} pacas pendientes de aceptación
            </p>
          )}
        </div>
        <div className="campaign-art">
          <img src="/field.jpg" alt="Cultivo agrícola" />
          <div>
            <MapPin size={15} /> Región Centro · Coahuila
          </div>
        </div>
      </section>
      <DemoGuide />
      <div className="dashlower">
        <section className="panel">
          <h3>Evolución de compras</h3>
          <p>Valor mensual en MXN</p>
          <Chart lines={received} />
        </section>
        <section className="panel">
          <h3>Próximas entregas</h3>
          <p>Suministros aceptados o en tránsito</p>
          <div className="delivery-list">
            {s.orders
              .flatMap((o) =>
                [
                  ...new Set(
                    o.lines
                      .filter((l) =>
                        ["Aceptada", "En tránsito"].includes(l.status),
                      )
                      .map((l) => l.producer),
                  ),
                ].map((id) => ({
                  o,
                  id,
                  lines: o.lines.filter(
                    (l) =>
                      l.producer === id &&
                      ["Aceptada", "En tránsito"].includes(l.status),
                  ),
                })),
              )
              .sort(
                (a, b) =>
                  Number(b.lines.some((l) => l.status === "En tránsito")) -
                  Number(a.lines.some((l) => l.status === "En tránsito")),
              )
              .slice(0, 3)
              .map(({ o, id, lines }) => (
                <a href={"#/ordenes/" + folio(o.id)} key={o.id + "-" + id}>
                  <Truck size={17} />
                  <span>
                    <b>{producers[id].name}</b>
                    <small>
                      {folio(o.id)} · {quantities(lines)}
                      {o.plannedDelivery && " · " + dateMX(o.plannedDelivery)}
                    </small>
                  </span>
                  <Badge>{lines[0].status}</Badge>
                </a>
              ))}
          </div>
          <h3 className="spaced">Actividad reciente</h3>
          <div className="activity">
            {(s.events.length
              ? s.events.slice(0, 4)
              : s.orders
                  .slice(-4)
                  .reverse()
                  .map((o) => ({
                    id: o.id,
                    label:
                      folio(o.id) +
                      " · " +
                      producers[o.lines[0].producer].name +
                      " · " +
                      o.lines[0].status +
                      " · " +
                      quantities(o.lines),
                    date: o.date,
                  }))
            ).map((e) => (
              <div key={e.id}>
                <span>
                  <Check size={14} />
                </span>
                <div>
                  <b>{e.label}</b>
                  {e.date && (
                    <small className="activity-date">{dateMX(e.date)}</small>
                  )}
                </div>
              </div>
            ))}
          </div>
          <a className="textlink" href="#/ordenes">
            Todas las órdenes <ArrowUpRight size={14} />
          </a>
        </section>
      </div>
    </>
  );
}
function Filters({ children }) {
  return <div className="filters">{children}</div>;
}
function Select({ label, value, onChange, options, any = "Todos" }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {any !== null && <option value="">{any}</option>}
        {options.map((o) => (
          <option
            key={Array.isArray(o) ? o[0] : o}
            value={Array.isArray(o) ? o[0] : o}
          >
            {Array.isArray(o) ? o[1] : o}
          </option>
        ))}
      </select>
    </label>
  );
}
const productOptions = products.map((p, i) => [i, p]);
import coords from "./locations.json";
function Portrait({ id }) {
  return (
    <div className="portrait">
      <img
        src={"/portrait-" + id + ".jpg"}
        alt="Retrato sintético del perfil ficticio"
        loading="lazy"
      />
    </div>
  );
}
function Supply({ s, add, campaign }) {
  const [town, T] = useState(""),
    [p, P] = useState(campaign === 0 ? "0" : ""),
    [avail, A] = useState(campaign === 0 ? "yes" : ""),
    [distance, D] = useState(""),
    [selected, S] = useState(null),
    [place, F] = useState(""),
    [spread, V] = useState(null),
    [group, G] = useState(campaign),
    [zoom, Z] = useState(campaign === 0 ? 1.6 : 1),
    [pan, B] = useState(
      campaign === 0
        ? [
            360 - (coords[0][0] + coords[1][0]) / 2,
            260 - (coords[0][1] + coords[1][1]) / 2,
          ]
        : [0, 0],
    );
  const drag = useRef(null);
  const matches = producers.filter(
    (x) =>
      (!town || x.town === town) &&
      normalize(x.town).includes(normalize(place)) &&
      (!distance || x.distance <= +distance) &&
      (group === null ||
        s.groups.find((g) => g.id === group)?.members.includes(x.id)) &&
      s.offers.some(
        (o) =>
          o.producer === x.id &&
          (p === "" || o.p === +p) &&
          (!avail || (avail === "yes" ? stock(s, o) > 0 : stock(s, o) === 0)),
      ),
  );
  const focus = matches.find((x) => x.id === selected),
    c = stats(s, 0);
  const recommended = (x) => campaign === 0 && x.id < 2;
  const position = (x) => {
    const [a, b] = coords[x.id % 12];
    return x.id === 0
      ? [a - 9, b + 7]
      : x.id === 1
        ? [a + 9, b - 7]
        : x.id >= 12
          ? [a + 10, b + 11]
          : [a, b];
  };
  const clusters = [];
  for (const x of matches) {
    const [a, b] = position(x);
    const existing =
      !recommended(x) &&
      x.id !== selected &&
      clusters.find((k) => !k.keep && Math.hypot(k.a - a, k.b - b) * zoom < 24);
    if (existing) existing.people.push(x);
    else
      clusters.push({
        a,
        b,
        people: [x],
        keep: recommended(x) || x.id === selected,
      });
  }
  const pins = clusters.flatMap((k) =>
    k.people.length === 1
      ? k.people.map((x) => [x, k.a, k.b])
      : spread === k.people[0].id
        ? k.people.map((x, i) => [
            x,
            k.a + (Math.cos((i * 2 * Math.PI) / k.people.length) * 35) / zoom,
            k.b + (Math.sin((i * 2 * Math.PI) / k.people.length) * 35) / zoom,
          ])
        : [],
  );
  const hub = coords[towns.indexOf(s.company.town)] || coords[2];

  return (
    <>
      <Head
        tag="COAHUILA · RED REGIONAL"
        title="Mapa de abasto"
        desc="Explora la oferta de productores y agrupaciones en Coahuila."
      >
        <Link to="ordenes/nueva" secondary>
          <ShoppingBag size={17} /> Revisar compra ({s.cart.length})
        </Link>
      </Head>
      {campaign === 0 && (
        <div className="callout">
          <Sprout size={19} />
          <b>Campaña de alfalfa</b>
          <span>
            {Math.max(0, c.target - c.committed)} pacas por comprometer
          </span>
          <span>
            {s.cart.filter((l) => l.group === 0).reduce((a, l) => a + l.qty, 0)}{" "}
            pacas en preparación
          </span>
        </div>
      )}
      <Filters>
        <SearchField label="Buscar municipio" value={place} onChange={F} />
        <Select label="Municipio" value={town} onChange={T} options={towns} />
        <Select
          label="Producto"
          value={p}
          onChange={P}
          options={productOptions}
        />
        <Select
          label="Disponibilidad"
          value={avail}
          onChange={A}
          options={[
            ["yes", "Con existencias"],
            ["no", "Sin existencias"],
          ]}
        />
        <Select
          label="Distancia simulada"
          value={distance}
          onChange={D}
          options={[
            [30, "Hasta 30 km"],
            [60, "Hasta 60 km"],
            [100, "Hasta 100 km"],
            [200, "Hasta 200 km"],
          ]}
        />
        <Btn
          secondary
          onClick={() => {
            T("");
            F("");
            V(null);
            P("");
            A("");
            D("");
            G(null);
            S(null);
          }}
        >
          Limpiar
        </Btn>
      </Filters>
      <div className="mapgrid">
        <div className="mapframe">
          <div className="maptitle">
            <span>
              <i /> {matches.length} productores
            </span>
            <span>
              <Layers size={14} /> Vista regional
            </span>
          </div>
          <svg
            aria-label="Mapa de Coahuila"
            className="mapsvg"
            viewBox="0 0 720 520"
            onPointerDown={(e) => {
              if (e.target.closest("[role=button]")) return;
              drag.current = [e.clientX, e.clientY, ...pan];
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (drag.current)
                B([
                  drag.current[2] + (e.clientX - drag.current[0]) / zoom,
                  drag.current[3] + (e.clientY - drag.current[1]) / zoom,
                ]);
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <defs>
              <pattern
                id="grid"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M28 0H0V28"
                  fill="none"
                  stroke="#ccdcd5"
                  strokeWidth=".65"
                />
              </pattern>
              <pattern
                id="terrain"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M-8 30Q10 10 34 20M-8 36Q10 16 34 26"
                  fill="none"
                  stroke="#a8c2ae"
                  opacity=".36"
                />
              </pattern>
            </defs>
            <rect width="720" height="520" fill="#e9f0ed" />
            <rect width="720" height="520" fill="url(#grid)" />
            <g
              transform={
                "translate(360 260) scale(" +
                zoom +
                ") translate(" +
                (-360 + pan[0]) +
                " " +
                (-260 + pan[1]) +
                ")"
              }
            >
              <image
                href="/coahuila.svg"
                x="150"
                y="14"
                width="420"
                height="496"
              />
              <text x="277" y="207" className="mapstate">
                COAHUILA
              </text>
              <text x="470" y="99" className="maplabel">
                TEXAS
              </text>
              <text x="552" y="392" className="maplabel">
                NUEVO LEÓN
              </text>
              <text x="111" y="322" className="maplabel">
                CHIHUAHUA
              </text>
              {towns.map((t, i) => (
                <text
                  className="townlabel"
                  key={t}
                  x={coords[i][0] + 8}
                  y={coords[i][1] - 6}
                >
                  {[0, 1, 2, 6, 10, 11].includes(i) ? t : ""}
                </text>
              ))}
              {s.groups.map((g) => {
                const [x, y] = coords[towns.indexOf(g.town)] || coords[2];
                return (
                  <g
                    key={g.id}
                    role="button"
                    tabIndex="0"
                    aria-label={"NODESS " + g.name}
                    onClick={() => {
                      G(group === g.id ? null : g.id);
                      S(null);
                    }}
                    onKeyDown={(e) => {
                      if (["Enter", " "].includes(e.key)) {
                        e.preventDefault();
                        G(group === g.id ? null : g.id);
                        S(null);
                      }
                    }}
                    transform={"translate(" + (x - 15) + " " + (y - 13) + ")"}
                    className="pin"
                  >
                    <rect
                      x="-6"
                      y="-6"
                      width="12"
                      height="12"
                      rx="3"
                      fill={group === g.id ? "#e09a45" : "#24485e"}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
              <g
                className="map-hub"
                transform={
                  "translate(" + (hub[0] + 14) + " " + (hub[1] + 16) + ")"
                }
              >
                <title>Centro de recepción · {s.company.town}</title>
                <path
                  d="M-8 7V-4L0-10 8-4V7Z"
                  fill="#173d55"
                  stroke="white"
                  strokeWidth="2"
                />
                <path d="M-3 7V0H3V7" fill="#e1edfe" />
              </g>
              {clusters
                .filter((k) => k.people.length > 1 && spread !== k.people[0].id)
                .map((k) => {
                  const open = () => {
                    V(k.people[0].id);
                    B([360 - k.a, 260 - k.b]);
                  };
                  return (
                    <g
                      key={k.people[0].id}
                      className="pin map-cluster"
                      role="button"
                      tabIndex={0}
                      aria-label={
                        "Explorar " +
                        k.people.length +
                        " productores cerca de " +
                        k.people[0].town
                      }
                      transform={"translate(" + k.a + " " + k.b + ")"}
                      onClick={open}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          open();
                        }
                      }}
                    >
                      <circle
                        r={12 / Math.sqrt(zoom)}
                        fill="#195b52"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={10 / Math.sqrt(zoom)}
                      >
                        {k.people.length}
                      </text>
                    </g>
                  );
                })}
              {pins
                .sort(
                  (a, b) =>
                    Number(recommended(a[0]) || selected === a[0].id) -
                    Number(recommended(b[0]) || selected === b[0].id),
                )
                .map(([x, a, b]) => {
                  const chosen = selected === x.id;
                  return (
                    <g
                      key={x.id}
                      className="pin"
                      role="button"
                      tabIndex={0}
                      aria-label={x.name}
                      aria-pressed={chosen}
                      data-recommended={recommended(x) || undefined}
                      transform={"translate(" + a + " " + b + ")"}
                      onClick={() => S(x.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          S(x.id);
                        }
                      }}
                    >
                      <circle
                        r={chosen ? 10 : recommended(x) ? 8 : 7}
                        fill={chosen ? "#954813" : "#247359"}
                        stroke={recommended(x) ? "#ffe2a0" : "white"}
                        strokeWidth={recommended(x) ? 2.8 : 2}
                      />
                      <circle r="2.2" fill="white" pointerEvents="none" />
                      {chosen && (
                        <circle
                          className="pin-halo"
                          r="15"
                          fill="none"
                          stroke="#954813"
                          pointerEvents="none"
                        />
                      )}
                      <title>
                        {x.name} · {x.town}
                      </title>
                    </g>
                  );
                })}
            </g>
          </svg>
          <div className="mapcontrols">
            <button
              aria-label="Acercar"
              onClick={() => Z(Math.min(3, zoom + 0.3))}
            >
              <Plus size={18} />
            </button>
            <button
              aria-label="Alejar"
              onClick={() => Z(Math.max(1, zoom - 0.3))}
            >
              <Minus size={18} />
            </button>
            <button
              aria-label="Restablecer encuadre"
              onClick={() => {
                Z(1);
                B([0, 0]);
              }}
            >
              <LocateFixed size={18} />
            </button>
          </div>
          <div className="maplegend">
            <i /> Productor <i /> NODESS{" "}
            <span>Centro de recepción · Ubicaciones aproximadas</span>
          </div>
        </div>
        <section className="panel mapdetail">
          {focus ? (
            <>
              <button className="textlink" onClick={() => S(null)}>
                Volver a resultados
              </button>
              <div className="detail-reveal" key={focus.id}>
                <Profile x={focus} />
              </div>
              <p className="map-distance">
                {focus.distance} km simulados
                {recommended(focus) ? " · Recomendado para la campaña" : ""}
              </p>
              <OfferList
                s={s}
                x={focus}
                p={p}
                group={campaign ?? group}
                add={add}
              />
              <a className="textlink" href={"#/productores/" + focus.id}>
                Ver perfil <ArrowUpRight size={14} />
              </a>
            </>
          ) : (
            <>
              <h3>
                {group === null
                  ? "Productores disponibles"
                  : s.groups.find((g) => g.id === group)?.name}
              </h3>
              <p>Selecciona un productor para consultar su oferta.</p>
              <div className="mapresults">
                {matches.length ? (
                  matches.map((x) => (
                    <button key={x.id} onClick={() => S(x.id)}>
                      <Portrait id={x.id} />
                      <span>
                        <b>{x.name}</b>
                        {recommended(x) && (
                          <small className="recommendation">Recomendado</small>
                        )}
                        <small>
                          {x.town} · {x.distance} km simulados
                        </small>
                      </span>
                      <ArrowUpRight size={14} />
                    </button>
                  ))
                ) : (
                  <Empty>No se encontraron productores.</Empty>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
function Profile({ x }) {
  return (
    <div className="profile">
      <Portrait id={x.id} />
      <div>
        <h3>{x.name}</h3>
        <p>
          <MapPin size={14} /> {x.town}, Coahuila
        </p>
        <small>Perfil ficticio · Reputación {x.rating}/5</small>
      </div>
    </div>
  );
}
function OfferRow({ s, o, add, group }) {
  const n = stock(s, o),
    [q, Q] = useState("");
  return (
    <div className="offer" data-available={n > 0}>
      <div>
        <b>{products[o.p]}</b>
        <small>
          {nf(n)} {unit(o.p)} disponibles · {money(o.price)} /{" "}
          {unit(o.p) === "pacas" ? "paca" : "kg"}
        </small>
        {o.harvest && (
          <small className="offer-meta">
            Cosecha demo {dateMX(o.harvest)} · Capacidad {nf(o.capacity)}{" "}
            {unit(o.p)}
          </small>
        )}
      </div>
      <label>
        Cantidad
        <input
          type="number"
          min={o.p < 8 ? 1 : 0.001}
          max={n}
          step={o.p < 8 ? 1 : 0.001}
          value={q}
          onChange={(e) => Q(e.target.value)}
          placeholder={String(n)}
        />
      </label>
      <Btn disabled={!n} onClick={() => add(o, q === "" ? n : +q, group)}>
        Agregar <Plus size={14} />
      </Btn>
    </div>
  );
}
function OfferList({ s, x, p = "", group, add }) {
  return (
    <div className="offers">
      {s.offers
        .filter((o) => o.producer === x.id && (p === "" || o.p === +p))
        .map((o) => (
          <OfferRow key={o.p} {...{ s, o, add, group }} />
        ))}
    </div>
  );
}
function Directory({ s, detail, add, update, msg, buying }) {
  const [search, Q] = useState(""),
    [town, T] = useState(""),
    [p, P] = useState(""),
    [g, G] = useState(""),
    [contact, C] = useState(false);
  const x = detail === undefined ? null : producers[+detail];
  if (detail !== undefined && !x) return <Missing />;
  if (x)
    return (
      <>
        <Head tag="DIRECTORIO · PERFIL FICTICIO" title={x.name} desc={x.farm}>
          <Link to="productores" secondary>
            Volver al directorio
          </Link>
        </Head>
        <div className="split">
          <section className="panel">
            <Profile x={x} />
            <img
              className="farm-photo"
              src={["/field.jpg", "/sorghum.jpg", "/maize.jpg"][x.id % 3]}
              alt="Escena agrícola de referencia, generada para la demostración"
            />
            <p>
              {x.hectares} hectáreas productivas · {x.storage}. {x.packing}.
            </p>
            <Btn secondary onClick={() => C(!contact)}>
              Contactar
            </Btn>
            {contact && (
              <form
                className="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  update((s) => ({
                    ...s,
                    events: [
                      {
                        id: crypto.randomUUID(),
                        label: "Contacto simulado · " + x.name,
                      },
                      ...s.events,
                    ],
                  }));
                  C(false);
                  msg("Contacto registrado. No se envió ningún mensaje.");
                }}
              >
                <label>
                  Canal
                  <select>
                    <option>Mensaje</option>
                    <option>Llamada</option>
                  </select>
                </label>
                <label>
                  Mensaje
                  <textarea
                    required
                    defaultValue="Me interesa conocer su próxima disponibilidad."
                  />
                </label>
                <Btn type="submit">Registrar contacto simulado</Btn>
              </form>
            )}
            <h3>Historial comercial</h3>
            <Table
              headers={["Orden", "Producto", "Cantidad", "Estado"]}
              rows={all(s)
                .filter((l) => l.producer === x.id)
                .map((l) => [
                  folio(l.order),
                  products[l.p],
                  l.qty + " " + unit(l.p),
                  <Badge>{l.status}</Badge>,
                ])}
            />
          </section>
          <section className="panel">
            <h3 className={buying ? "buying-title" : undefined}>
              {buying
                ? "Selecciona tu suministro"
                : "Catálogo y disponibilidad"}
            </h3>
            <OfferList {...{ s, x, add }} group={null} />
            <Link to="ordenes/nueva" secondary>
              Revisar compra
            </Link>
          </section>
        </div>
      </>
    );
  const list = producers.filter(
    (x) =>
      x.name.toLowerCase().includes(search.toLowerCase()) &&
      (!town || x.town === town) &&
      (!g || s.groups.find((v) => v.id === +g)?.members.includes(x.id)) &&
      (p === "" || s.offers.some((o) => o.producer === x.id && o.p === +p)),
  );
  return (
    <>
      <Head
        tag="RED DE SUMINISTRO"
        title="Productores"
        desc="Conoce las unidades productivas, su oferta y su historial comercial."
      />
      <Filters>
        <label>
          Buscar
          <input
            placeholder="Nombre del productor"
            value={search}
            onChange={(e) => Q(e.target.value)}
          />
        </label>
        <Select label="Municipio" value={town} onChange={T} options={towns} />
        <Select
          label="Producto"
          value={p}
          onChange={P}
          options={productOptions}
        />
        <Select
          label="NODESS"
          value={g}
          onChange={G}
          options={s.groups.map((g) => [g.id, g.name])}
        />
      </Filters>
      {s.company.view === "tabla" ? (
        <Table
          headers={[
            "Productor",
            "Municipio",
            "Unidad productiva",
            "Reputación",
          ]}
          rows={list.map((x) => [
            <a className="textlink" href={"#/productores/" + x.id}>
              {x.name}
            </a>,
            x.town,
            x.farm,
            x.rating,
          ])}
        />
      ) : list.length ? (
        <div className="directory">
          {list.map((x) => {
            const offers = s.offers.filter(
              (o) =>
                o.producer === x.id &&
                stock(s, o) > 0 &&
                (p === "" || o.p === +p),
            );
            return (
              <article className="panel producer market-card" key={x.id}>
                <div className="market-header">
                  <Portrait id={x.id} />
                  <div>
                    <h3>{x.name}</h3>
                    <p>{x.farm}</p>
                    <small>
                      {x.town} · {x.distance} km simulados
                    </small>
                  </div>
                </div>
                <span
                  className="rating"
                  aria-label={"Calificación " + x.rating + " de 5"}
                >
                  ★ {x.rating} / 5
                </span>
                <div className="market-offers">
                  {offers.slice(0, 3).map((o) => (
                    <div key={o.p}>
                      <b>{products[o.p]}</b>
                      <span>
                        {nf(stock(s, o))} {unit(o.p)} · {money(o.price)} /{" "}
                        {o.p < 8 ? "paca" : "kg"}
                      </span>
                    </div>
                  ))}
                  {!offers.length && (
                    <small>Sin existencias para esta selección</small>
                  )}
                </div>
                <footer>
                  <Link to={"productores/" + x.id} secondary>
                    Ver perfil
                  </Link>
                  <Link to={"productores/" + x.id + "?compra=1"}>
                    Comprar <ArrowRight size={15} />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty>No hay productores con estos filtros.</Empty>
      )}
    </>
  );
}
function Groups({ s, detail, update, msg, embedded = false }) {
  const [creating, C] = useState(false),
    [member, M] = useState(""),
    [query, Q] = useState("");
  const g =
    detail === undefined ? null : s.groups.find((g) => g.id === +detail);
  const active = (id, group) =>
    all(s).some(
      (l) =>
        l.producer === id &&
        l.group === group &&
        ["Pendiente", "Aceptada", "En tránsito"].includes(l.status),
    );
  function move(id, group) {
    if (s.groups.some((x) => x.members.includes(id) && active(id, x.id))) {
      msg("El productor tiene un compromiso activo.");
      return;
    }
    update((s) => ({
      ...s,
      groups: s.groups.map((g) => ({
        ...g,
        members:
          g.id === group
            ? [...new Set([...g.members, id])]
            : g.members.filter((x) => x !== id),
      })),
    }));
    M("");
  }
  if (detail !== undefined && !g) return <Missing />;
  if (g && embedded)
    return (
      <>
        <Head
          tag="ABASTECIMIENTO COLECTIVO"
          level="h2"
          title={"NODESS " + g.name}
          desc={g.town + " · " + products[g.p]}
        >
          {g.id === 0 && stats(s, g.id).committed < g.target && (
            <Link to="mapa?campana=0">
              Completar abastecimiento <ArrowRight size={16} />
            </Link>
          )}
        </Head>
        <div className="panel">
          <h3>Progreso de abastecimiento</h3>
          <div className="group-figures">
            {[
              ["Meta", g.target],
              ["Comprometido", stats(s, g.id).committed],
              ["Recibido", stats(s, g.id).received],
              [
                "Por comprometer",
                Math.max(0, g.target - stats(s, g.id).committed),
              ],
            ].map(([label, n]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{nf(n)}</strong>
                <small>{unit(g.p)}</small>
              </div>
            ))}
          </div>
          <Progress data={stats(s, g.id)} p={g.p} />
          <p>
            {nf(stats(s, g.id).pending)} {unit(g.p)} pendientes de aceptación.
          </p>
        </div>
        <section className="panel spaced">
          <h3>Contribuciones por integrante</h3>
          <Table
            headers={[
              "Productor",
              "Pendiente",
              "Comprometido",
              "Recibido",
              "Estado",
              "Acción",
            ]}
            rows={[
              ...new Set([
                ...g.members,
                ...all(s)
                  .filter((l) => l.group === g.id)
                  .map((l) => l.producer),
              ]),
            ].map((id) => {
              const ls = all(s).filter(
                  (l) => l.group === g.id && l.producer === id,
                ),
                count = (states) =>
                  nf(
                    ls
                      .filter((l) => states.includes(l.status))
                      .reduce((a, l) => a + l.qty, 0),
                  );
              return [
                producers[id].name,
                count(["Pendiente"]),
                count(["Aceptada", "En tránsito", "Recibida"]),
                count(["Recibida"]),
                <div className="member-states">
                  {[...new Set(ls.map((l) => l.status))].map((status) => (
                    <Badge key={status}>{status}</Badge>
                  ))}
                </div>,
                g.members.includes(id) ? (
                  <Btn secondary onClick={() => move(id, -1)}>
                    Retirar
                  </Btn>
                ) : (
                  "Histórico"
                ),
              ];
            })}
          />
          <div className="filters inline">
            <Select
              label="Agregar integrante"
              value={member}
              onChange={M}
              options={producers
                .filter((x) => !g.members.includes(x.id))
                .map((x) => [x.id, x.name])}
              any="Selecciona un productor"
            />
            <Btn onClick={() => move(+member, g.id)} disabled={member === ""}>
              Agregar
            </Btn>
          </div>
        </section>
      </>
    );
  return (
    <>
      <Head
        tag="ABASTECIMIENTO COLECTIVO"
        title="Monitor NODESS"
        desc="Consulta las metas y coordina la aportación de cada integrante."
      >
        <Btn onClick={() => C(!creating)}>
          <Plus size={17} /> Nueva agrupación
        </Btn>
      </Head>
      {creating && (
        <form
          className="panel form groupform"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget),
              id = +f.get("member");
            if (!String(f.get("name")).trim()) {
              msg("Escribe el nombre de la agrupación.");
              return;
            }
            if (
              s.groups.some((g) => g.members.includes(id) && active(id, g.id))
            ) {
              msg("El productor tiene un compromiso activo.");
              return;
            }
            const next = Math.max(...s.groups.map((g) => g.id)) + 1;
            update((s) => ({
              ...s,
              groups: [
                ...s.groups.map((g) => ({
                  ...g,
                  members: g.members.filter((x) => x !== id),
                })),
                {
                  id: next,
                  name: String(f.get("name")).trim(),
                  town: f.get("town"),
                  members: [id],
                  p: +f.get("product"),
                  target: +f.get("target"),
                  date: f.get("date"),
                },
              ],
            }));
            C(false);
            go("nodess/" + next);
          }}
        >
          <label>
            Nombre
            <input name="name" required />
          </label>
          <label>
            Municipio
            <select name="town">
              {towns.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Primer integrante
            <select name="member">
              {producers.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Producto
            <select name="product">
              {productOptions.map(([i, p]) => (
                <option key={i} value={i}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            Meta
            <input name="target" type="number" min="1" required />
          </label>
          <label>
            Fecha objetivo
            <input name="date" type="date" required />
          </label>
          <Btn type="submit">Crear agrupación</Btn>
        </form>
      )}
      <div className="nodess-layout">
        <section className="panel group-list" aria-label="Agrupaciones NODESS">
          <SearchField label="Buscar agrupación" value={query} onChange={Q} />
          {s.groups
            .filter((x) =>
              normalize(x.name + " " + x.town).includes(normalize(query)),
            )
            .map((x) => {
              const d = stats(s, x.id),
                missing = Math.max(0, d.target - d.committed);
              return (
                <a
                  key={x.id}
                  href={"#/nodess/" + x.id}
                  aria-current={(g?.id ?? 0) === x.id ? "true" : undefined}
                >
                  <b>{x.name}</b>
                  <small>
                    {x.town} ·{" "}
                    {missing ? "Abastecimiento abierto" : "Meta cubierta"}
                  </small>
                  <progress
                    aria-label={"Compromiso de " + x.name}
                    value={Math.min(d.committed, d.target)}
                    max={d.target}
                  />
                  <small>
                    {nf(missing)} {unit(x.p)} por comprometer
                  </small>
                </a>
              );
            })}
        </section>
        <div className="group-detail">
          <Groups
            key={g?.id ?? 0}
            s={s}
            detail={String(g?.id ?? 0)}
            update={update}
            msg={msg}
            embedded
          />
        </div>
      </div>
    </>
  );
}
const orderStatus = (o) =>
  new Set(o.lines.map((l) => l.status)).size === 1
    ? o.lines[0].status
    : "Mixta";
function Orders({ s, detail, update, msg, add }) {
  const [query, Q] = useState("");
  const [status, U] = useState(""),
    [p, P] = useState(""),
    [period, E] = useState(""),
    [review, V] = useState(false),
    [address, H] = useState(s.company.address),
    [offer, F] = useState("");
  const o = s.orders.find((o) => folio(o.id) === detail);
  const t = (producer, status) =>
    update(
      (s) => transact(s, { type: "transition", id: o.id, producer, status }),
      {
        Aceptada: "Suministro aceptado.",
        "En tránsito": "Envío registrado. Ya puedes confirmar la recepción.",
        Recibida: "Recepción confirmada. El comprobante está disponible.",
        Cancelada: "Suministro cancelado. Disponibilidad actualizada.",
      }[status],
    );
  const ids = o ? [...new Set(o.lines.map((l) => l.producer))] : [];
  if (detail === "nueva")
    return (
      <>
        <Head
          tag="COMPRAS · PREPARACIÓN"
          title={review ? "Confirmar compra" : "Nueva orden de compra"}
          desc="Consolida productos de uno o varios proveedores."
        >
          <Link to="mapa" secondary>
            Explorar mapa
          </Link>
        </Head>
        <section className="panel">
          <h3>
            {new Set(s.cart.map((l) => l.producer)).size > 1
              ? "Compra colectiva"
              : "Productos de la orden"}
          </h3>
          {!review && (
            <div className="filters inline">
              <Select
                label="Seleccionar oferta"
                value={offer}
                onChange={F}
                any="Selecciona un producto"
                options={s.offers
                  .map((x, i) => [i, x])
                  .filter(([, x]) => stock(s, x) > 0)
                  .map(([i, x]) => [
                    i,
                    producers[x.producer].name +
                      " · " +
                      products[x.p] +
                      " · " +
                      stock(s, x) +
                      " " +
                      unit(x.p),
                  ])}
              />
              <Btn
                disabled={offer === ""}
                onClick={() =>
                  add(s.offers[+offer], s.offers[+offer].p < 8 ? 1 : 0.001)
                }
              >
                Añadir oferta
              </Btn>
            </div>
          )}
          <Table
            headers={[
              "Productor",
              "Producto",
              "Cantidad",
              "Precio unitario",
              "Importe",
              "Acción",
            ]}
            rows={s.cart.map((l) => [
              producers[l.producer].name,
              products[l.p],
              review ? (
                l.qty + " " + unit(l.p)
              ) : (
                <label className="qty">
                  <input
                    aria-label={
                      "Cantidad de " +
                      producers[l.producer].name +
                      " " +
                      products[l.p]
                    }
                    type="number"
                    min={l.p < 8 ? 1 : 0.001}
                    step={l.p < 8 ? 1 : 0.001}
                    value={l.qty}
                    onChange={(e) =>
                      update((s) => ({
                        ...s,
                        cart: s.cart.map((x) =>
                          x.producer === l.producer && x.p === l.p
                            ? { ...x, qty: +e.target.value }
                            : x,
                        ),
                      }))
                    }
                  />
                  {unit(l.p)}
                </label>
              ),
              money(l.price),
              money(amount(l)),
              review ? (
                ""
              ) : (
                <Btn
                  secondary
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      cart: s.cart.filter((x) => x !== l),
                    }))
                  }
                >
                  Quitar
                </Btn>
              ),
            ])}
          />
          <form
            className="form orderform"
            onSubmit={(e) => {
              e.preventDefault();
              if (!review) {
                try {
                  transact(s, { type: "create", address });
                  V(true);
                } catch (e) {
                  msg(e.message);
                }
                return;
              }
              update((s) => {
                const n = transact(s, { type: "create", address });
                go("ordenes/" + folio(n.orders.at(-1).id));
                return n;
              });
            }}
          >
            <label>
              Destino de recepción
              <input
                required
                value={address}
                onChange={(e) => H(e.target.value)}
              />
            </label>
            <div className="ordertotal">
              <span>Total estimado</span>
              <strong>{money(total(s.cart))}</strong>
            </div>
            <div className="actions">
              {review && (
                <Btn secondary onClick={() => V(false)}>
                  Editar orden
                </Btn>
              )}
              <Btn type="submit" disabled={!s.cart.length}>
                {review ? "Confirmar orden simulada" : "Revisar orden"}{" "}
                <ArrowRight size={16} />
              </Btn>
            </div>
          </form>
        </section>
      </>
    );
  if (detail && !o) return <Missing />;
  if (o)
    return (
      <>
        <Head
          tag="SEGUIMIENTO DE COMPRA"
          title={folio(o.id)}
          desc={
            (ids.length > 1 ? "Orden colectiva" : "Orden individual") +
            " · " +
            dateMX(o.date)
          }
        >
          <Link to="ordenes" secondary>
            Volver a órdenes
          </Link>
        </Head>
        <div className="callout">
          <Truck size={20} />
          <Badge>{orderStatus(o)}</Badge>
          <strong>
            {money(total(o.lines.filter((l) => l.status !== "Cancelada")))}
          </strong>
          {o.plannedDelivery && (
            <span>Entrega prevista · {dateMX(o.plannedDelivery)}</span>
          )}
          <span>{o.address || s.company.address}</span>
        </div>
        <div className="supplierlist">
          {ids.map((id) => {
            const ls = o.lines.filter((l) => l.producer === id),
              st = ls[0].status;
            return (
              <section className="panel" key={id}>
                <div className="heading compact">
                  <Profile x={producers[id]} />
                  <Badge>{st}</Badge>
                </div>
                <Table
                  headers={[
                    "Producto",
                    "Cantidad",
                    "Precio unitario",
                    "Importe",
                  ]}
                  rows={ls.map((l) => [
                    products[l.p],
                    nf(l.qty) + " " + unit(l.p),
                    money(l.price),
                    money(amount(l)),
                  ])}
                />
                <div className="actions spaced">
                  {st === "Pendiente" && (
                    <Btn onClick={() => t(id, "Aceptada")}>
                      Simular aceptación
                    </Btn>
                  )}
                  {st === "Aceptada" && (
                    <Btn onClick={() => t(id, "En tránsito")}>
                      Simular envío
                    </Btn>
                  )}
                  {st === "En tránsito" && (
                    <Btn onClick={() => t(id, "Recibida")}>
                      Confirmar recepción
                    </Btn>
                  )}
                  {["Pendiente", "Aceptada"].includes(st) && (
                    <Btn
                      secondary
                      onClick={() => {
                        if (
                          confirm("¿Cancelar el suministro de este productor?")
                        )
                          t(id, "Cancelada");
                      }}
                    >
                      Cancelar suministro
                    </Btn>
                  )}
                  {st === "Recibida" && (
                    <Link to={"comprobantes/" + o.id + "-" + id} secondary>
                      Ver comprobante
                    </Link>
                  )}
                </div>
              </section>
            );
          })}
        </div>
        <section className="panel spaced">
          <h3>Línea de tiempo de la orden</h3>
          <div className="activity timeline">
            <div>
              <span>
                <Check size={14} />
              </span>
              Orden registrada · {dateMX(o.date)}
            </div>
            {s.events
              .filter(
                (e) =>
                  e.label.includes(folio(o.id)) && !e.label.endsWith(" creada"),
              )
              .reverse()
              .map((e) => (
                <div key={e.id}>
                  <span>
                    <Check size={14} />
                  </span>
                  {e.label}
                </div>
              ))}
          </div>
        </section>
      </>
    );
  const ls = [...s.orders]
    .reverse()
    .filter(
      (o) =>
        (!status || orderStatus(o) === status) &&
        (p === "" || o.lines.some((l) => l.p === +p)) &&
        (!period || o.date.slice(5, 7) === period),
    );
  return (
    <>
      <Head
        tag="GESTIÓN COMERCIAL"
        title="Órdenes de compra"
        desc="Crea pedidos y consulta su aceptación, envío y recepción."
      >
        <Link to="ordenes/nueva">
          <Plus size={17} /> Nueva orden
        </Link>
      </Head>
      <Filters>
        <SearchField
          label="Buscar orden o productor"
          value={query}
          onChange={Q}
        />
        <Select
          label="Estado"
          value={status}
          onChange={U}
          options={[
            "Pendiente",
            "Aceptada",
            "En tránsito",
            "Recibida",
            "Cancelada",
            "Mixta",
          ]}
        />
        <Select
          label="Producto"
          value={p}
          onChange={P}
          options={productOptions}
        />
        <Select
          label="Mes"
          value={period}
          onChange={E}
          options={months.map((m, i) => [String(i + 5).padStart(2, "0"), m])}
        />
      </Filters>
      <Listing
        key={query + "-" + status + "-" + p + "-" + period}
        headers={[
          "Orden",
          "Fecha",
          "Productores",
          "Cantidad",
          "Importe",
          "Estado",
        ]}
        rows={ls
          .filter((o) =>
            normalize(
              [
                folio(o.id),
                ...o.lines.map(
                  (l) => producers[l.producer].name + " " + products[l.p],
                ),
              ].join(" "),
            ).includes(normalize(query)),
          )
          .map((o) => [
            <a className="textlink" href={"#/ordenes/" + folio(o.id)}>
              {folio(o.id)} <ArrowUpRight size={13} />
            </a>,
            dateMX(o.date),
            [...new Set(o.lines.map((l) => producers[l.producer].name))].join(
              ", ",
            ),
            quantities(o.lines),
            money(total(o.lines)),
            <Badge>{orderStatus(o)}</Badge>,
          ])}
      />
    </>
  );
}
function quantities(lines) {
  return (
    ["pacas", "kg"]
      .map((u) => [
        u,
        lines.filter((l) => unit(l.p) === u).reduce((a, l) => a + l.qty, 0),
      ])
      .filter(([, n]) => n)
      .map(([u, n]) => nf(n) + " " + u)
      .join(" · ") || "0"
  );
}
function csv(name, rows) {
  const data = rows
    .map((r) =>
      r
        .map((v) => {
          const x = String(v);
          return (
            '"' + (/^[=+@-]/.test(x) ? "'" : "") + x.replaceAll('"', '""') + '"'
          );
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff", data], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name + ".csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Invoices({ s, detail, update }) {
  const [query, Q] = useState("");
  const [payment, P] = useState(""),
    [producer, F] = useState(""),
    [period, E] = useState(""),
    [order, O] = useState("");
  const docs = receipts(s),
    d = docs.find((d) => d.id === detail),
    pid = (n) => "CR-" + n;
  const filtered = docs.filter(
    (d) =>
      (!payment || !!s.paid[d.id] === (payment === "paid")) &&
      (producer === "" || d.producer === +producer) &&
      (!period || d.lines[0].received.slice(5, 7) === period) &&
      (!order || d.order === +order),
  );
  const sum = (ds) => ds.reduce((a, d) => a + total(d.lines), 0);
  if (detail && !d) return <Missing />;
  if (d)
    return (
      <>
        <div className="no-print">
          <Head
            tag="FACTURACIÓN DE DEMOSTRACIÓN"
            title={"Comprobante " + pid(d.id)}
            desc={"Recepción de " + folio(d.order)}
          >
            <div className="actions">
              <Link to="comprobantes" secondary>
                Volver
              </Link>
              <Btn onClick={() => window.print()}>
                <Printer size={17} /> Imprimir / Guardar PDF
              </Btn>
            </div>
          </Head>
        </div>
        <article className="panel document">
          <div className="heading">
            <div>
              <div className="eyebrow">
                <Sprout size={18} /> CONECTA RURAL
              </div>
              <h2>{pid(d.id)}</h2>
            </div>
            <Badge>
              {s.paid[d.id] ? "Pago simulado" : "Pendiente de pago"}
            </Badge>
          </div>
          <div className="fiscal">
            COMPROBANTE SIMULADO — SIN VALIDEZ FISCAL. No es un CFDI.
          </div>
          <div className="docmeta">
            <div>
              <small>EMPRESA COMPRADORA</small>
              <b>{d.company}</b>
            </div>
            <div>
              <small>PRODUCTOR FICTICIO</small>
              <b>{producers[d.producer].name}</b>
            </div>
            <div>
              <small>FECHA DE RECEPCIÓN</small>
              <b>{dateMX(d.lines[0].received)}</b>
            </div>
          </div>
          <Table
            headers={["Producto", "Cantidad", "Precio unitario", "Importe"]}
            rows={d.lines.map((l) => [
              products[l.p],
              l.qty + " " + unit(l.p),
              money(l.price),
              money(amount(l)),
            ])}
          />
          <div className="ordertotal">
            <span>Total del comprobante</span>
            <strong>{money(total(d.lines))}</strong>
          </div>
          <div className="no-print">
            <Btn
              secondary
              onClick={() => {
                if (confirm("¿Cambiar el estado de pago simulado?"))
                  update((s) => ({
                    ...s,
                    paid: { ...s.paid, [d.id]: !s.paid[d.id] },
                  }));
              }}
            >
              {s.paid[d.id] ? "Marcar pendiente" : "Registrar pago simulado"}
            </Btn>
          </div>
        </article>
      </>
    );
  return (
    <>
      <Head
        tag="CONTROL DOCUMENTAL"
        title="Facturación de demostración"
        desc="Consulta comprobantes individuales y saldos de operaciones simuladas."
      >
        <Btn
          secondary
          onClick={() =>
            csv("comprobantes", [
              ["Folio", "Orden", "Productor", "Importe MXN", "Pago"],
              ...filtered.map((d) => [
                pid(d.id),
                folio(d.order),
                producers[d.producer].name,
                total(d.lines) / 100,
                s.paid[d.id] ? "Pagado simulado" : "Pendiente",
              ]),
            ])
          }
        >
          <Download size={17} /> Exportar CSV
        </Btn>
      </Head>
      <div className="metrics three">
        {[
          ["Importe recibido", sum(filtered)],
          ["Pagado simulado", sum(filtered.filter((d) => s.paid[d.id]))],
          ["Saldo pendiente", sum(filtered.filter((d) => !s.paid[d.id]))],
        ].map(([l, n]) => (
          <article key={l}>
            <div>{l}</div>
            <strong>{money(n)}</strong>
          </article>
        ))}
      </div>
      <Filters>
        <SearchField
          label="Buscar comprobante o productor"
          value={query}
          onChange={Q}
        />
        <Select
          label="Estado de pago"
          value={payment}
          onChange={P}
          options={[
            ["paid", "Pagado simulado"],
            ["pending", "Pendiente"],
          ]}
        />
        <Select
          label="Productor"
          value={producer}
          onChange={F}
          options={producers.map((p) => [p.id, p.name])}
        />
        <Select
          label="Mes"
          value={period}
          onChange={E}
          options={months.map((m, i) => [String(i + 5).padStart(2, "0"), m])}
        />
        <Select
          label="Orden"
          value={order}
          onChange={O}
          options={[...new Set(docs.map((d) => d.order))].map((n) => [
            n,
            folio(n),
          ])}
        />
      </Filters>
      <Listing
        key={
          query + "-" + payment + "-" + producer + "-" + period + "-" + order
        }
        headers={[
          "Comprobante",
          "Orden",
          "Productor",
          "Importe",
          "Pago simulado",
        ]}
        rows={[...filtered]
          .reverse()
          .filter((d) =>
            normalize(
              [pid(d.id), folio(d.order), producers[d.producer].name].join(" "),
            ).includes(normalize(query)),
          )
          .map((d) => [
            <a className="textlink" href={"#/comprobantes/" + d.id}>
              {pid(d.id)} <ArrowUpRight size={13} />
            </a>,
            folio(d.order),
            producers[d.producer].name,
            money(total(d.lines)),
            <Badge>
              {s.paid[d.id] ? "Pagado simulado" : "Pendiente de pago"}
            </Badge>,
          ])}
      />
    </>
  );
}
function Reports({ s }) {
  const [p, P] = useState(""),
    [g, G] = useState(""),
    [period, E] = useState(""),
    [mode, M] = useState("Municipios");
  const lines = all(s).filter(
    (l) =>
      l.status === "Recibida" &&
      (p === "" || l.p === +p) &&
      (g === "" || l.group === +g) &&
      (!period || l.received.slice(5, 7) === period),
  );
  const field = (l) =>
    mode === "Municipios"
      ? producers[l.producer].town
      : producers[l.producer].name;
  const keys = [...new Set(lines.map(field))].sort(
    (a, b) =>
      total(lines.filter((l) => field(l) === b)) -
      total(lines.filter((l) => field(l) === a)),
  );
  const rows = keys.map((k) => [
    k,
    quantities(lines.filter((l) => field(l) === k)),
    money(total(lines.filter((l) => field(l) === k))),
  ]);
  return (
    <>
      <Head
        tag="ANÁLISIS REGIONAL"
        title="Reportes de abastecimiento"
        desc="Consulta la evolución de las compras recibidas y su participación regional."
      >
        <Btn
          secondary
          onClick={() =>
            csv("reporte-regional", [
              [
                "Orden",
                "Productor",
                "Municipio",
                "Producto",
                "Cantidad",
                "Unidad",
                "Monto MXN",
              ],
              ...lines.map((l) => [
                folio(l.order),
                producers[l.producer].name,
                producers[l.producer].town,
                products[l.p],
                l.qty,
                unit(l.p),
                amount(l) / 100,
              ]),
            ])
          }
        >
          <Download size={17} /> Exportar CSV
        </Btn>
      </Head>
      <Filters>
        <Select
          label="Producto"
          value={p}
          onChange={P}
          options={productOptions}
        />
        <Select
          label="Agrupación"
          value={g}
          onChange={G}
          options={s.groups.map((g) => [g.id, g.name])}
        />
        <Select
          label="Mes"
          value={period}
          onChange={E}
          options={months.map((m, i) => [String(i + 5).padStart(2, "0"), m])}
        />
      </Filters>
      <div className="metrics three">
        {[
          ["Aportación económica simulada", money(total(lines))],
          [
            "Productores con recepción",
            new Set(lines.map((l) => l.producer)).size,
          ],
          ["Compras regionales", lines.length ? "100%" : "—"],
        ].map(([l, n]) => (
          <article key={l}>
            <div>{l}</div>
            <strong>{n}</strong>
          </article>
        ))}
      </div>
      <div className="split report-layout">
        <section className="panel">
          <h3>Evolución mensual</h3>
          <p>Mercancía recibida · MXN</p>
          <Chart lines={lines} />
          <h3 className="spaced">Distribución por producto</h3>
          <div className="product-distribution">
            {[...new Set(lines.map((l) => l.p))]
              .map((p) => [p, total(lines.filter((l) => l.p === p))])
              .sort((a, b) => b[1] - a[1])
              .map(([p, value]) => (
                <div key={p}>
                  <span>{products[p]}</span>
                  <b>{money(value)}</b>
                  <progress
                    aria-label={products[p]}
                    value={value}
                    max={Math.max(1, total(lines))}
                  />
                </div>
              ))}
            {!lines.length && <p>Sin compras recibidas para estos filtros.</p>}
          </div>
        </section>
        <section className="panel">
          <div className="actions">
            <Btn
              secondary={mode !== "Municipios"}
              onClick={() => M("Municipios")}
            >
              Municipios
            </Btn>
            <Btn
              secondary={mode !== "Productores"}
              onClick={() => M("Productores")}
            >
              Productores
            </Btn>
          </div>
          <h3 className="spaced">
            {mode === "Municipios"
              ? "Ranking municipal"
              : "Ranking de productores"}
          </h3>
          <Table headers={[mode, "Volumen recibido", "Importe"]} rows={rows} />
        </section>
      </div>
      <section className="panel spaced">
        <h3>Operaciones del reporte</h3>
        <Table
          headers={["Orden", "Productor", "Producto", "Cantidad", "Importe"]}
          rows={lines.map((l) => [
            <a className="textlink" href={"#/ordenes/" + folio(l.order)}>
              {folio(l.order)}
            </a>,
            producers[l.producer].name,
            products[l.p],
            l.qty + " " + unit(l.p),
            money(amount(l)),
          ])}
        />
      </section>
    </>
  );
}
function Setup({ s, update, reset, msg }) {
  return (
    <>
      <Head
        tag="ESPACIO EMPRESARIAL"
        title="Configuración"
        desc="Personaliza el perfil, las preferencias y los datos de demostración."
      />
      <div className="split">
        <form
          className="panel form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            update((s) => ({
              ...s,
              company: { ...Object.fromEntries(f), reduced: f.has("reduced") },
            }));
            msg("Preferencias guardadas.");
          }}
        >
          <h3>Perfil empresarial</h3>
          <label>
            Empresa
            <input required name="name" defaultValue={s.company.name} />
          </label>
          <label>
            Contacto de demostración
            <input required name="contact" defaultValue={s.company.contact} />
          </label>
          <label>
            Municipio
            <select name="town" defaultValue={s.company.town}>
              {towns.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Dirección de recepción
            <input required name="address" defaultValue={s.company.address} />
          </label>
          <h3>Preferencias</h3>
          <label>
            Vista de productores
            <select name="view" defaultValue={s.company.view}>
              <option value="cuadricula">Cuadrícula</option>
              <option value="tabla">Tabla</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="reduced"
              defaultChecked={s.company.reduced}
            />{" "}
            Reducir movimiento
          </label>
          <div>
            <Btn type="submit">Guardar cambios</Btn>
          </div>
        </form>
        <section className="panel">
          <h3>Restablecer la demostración</h3>
          <p>
            Elimina los cambios locales de este portal y recupera los datos
            iniciales.
          </p>
          <Btn
            secondary
            onClick={() => {
              if (
                confirm(
                  "¿Restablecer la demo y eliminar los cambios locales de este portal?",
                )
              )
                reset();
            }}
          >
            Restablecer demo
          </Btn>
        </section>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
