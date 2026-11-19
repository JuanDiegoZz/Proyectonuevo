export const towns = [
  "Nadadores",
  "San Buenaventura",
  "Monclova",
  "Frontera",
  "Sacramento",
  "Lamadrid",
  "Cuatro Ciénegas",
  "Abasolo",
  "Escobedo",
  "Castaños",
  "General Cepeda",
  "Saltillo",
];
export const products = [
  "Alfalfa",
  "Avena forrajera",
  "Sorgo forrajero",
  "Zacate",
  "Rastrojo de maíz",
  "Cebada forrajera",
  "Trigo forrajero",
  "Ryegrass",
  "Ensilado de maíz",
  "Ensilado de sorgo",
  "Maíz en grano",
  "Sorgo en grano",
];
const names = [
  "José Hernández",
  "María González",
  "Rafael Méndez",
  "Elena Soto",
  "Miguel Vargas",
  "Carmen Ríos",
  "Arturo Salas",
  "Lucía Robles",
  "Pablo Flores",
  "Rosa Aguilar",
  "Diego Lozano",
  "Ana Cárdenas",
  "Mario Treviño",
  "Julia Valdés",
  "Hugo Paredes",
  "Isabel Garza",
  "Ramón Luna",
  "Clara Villarreal",
  "Luis Moreno",
  "Silvia Ramos",
  "Raúl Torres",
  "Nora Medina",
  "Javier Silva",
  "Eva Reyes",
];
export const producers = names.map((name, id) => ({
  id,
  name,
  town: towns[id % 12],
  distance: [32, 24, 5, 9, 43, 51, 82, 39, 55, 21, 172, 195][id % 12],
  farm:
    "Unidad productiva " +
    [
      "El Mezquite",
      "Las Palmas",
      "San Isidro",
      "El Encino",
      "La Esperanza",
      "Los Nogales",
      "La Noria",
      "El Milagro",
      "Santa Rita",
      "El Fresno",
      "La Tinaja",
      "Los Álamos",
      "Piedra Blanca",
      "El Carrizal",
      "La Loma",
      "San Joaquín",
      "El Rosario",
      "Buenavista",
      "La Cañada",
      "Las Moras",
      "El Sauz",
      "El Porvenir",
      "El Álamo",
      "Santa Clara",
    ][id],
  rating: [4.9, 4.8, 4.7, 4.5, 4.8, 4.6, 4.2, 4.9, 4.4, 4.7, 4.6, 4.8][
    id % 12
  ].toFixed(1),
  hectares:
    [8, 6, 24, 18, 16, 12, 34, 21, 14, 28, 11, 19][id % 12] +
    (id >= 12 ? 5 : 0),
  storage: [
    "Cobertizo ventilado",
    "Bodega techada",
    "Patio de maniobras con área cubierta",
  ][id % 3],
  packing: [
    "Paca rectangular",
    "Paca rectangular con amarres reforzados",
    "Paca rectangular apilada por lote",
  ][id % 3],
}));
export const unit = (p) => (p < 8 ? "pacas" : "kg");
export const money = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    n / 100,
  );
export const amount = (l) => Math.round(l.qty * l.price);
export const total = (ls) => ls.reduce((a, l) => a + amount(l), 0);
const qty = [
    250, 180, 120, 200, 160, 300, 500, 800, 1000, 600, 300, 300, 250, 100, 200,
  ],
  prices = [
    120, 118, 105, 95, 85, 65, 4.5, 4.2, 6, 5.5, 120, 120, 120, 105, 95,
  ],
  catalog = [0, 0, 1, 2, 3, 4, 8, 9, 10, 11, 0, 0, 0, 1, 5];
export function seed() {
  const groups = [
    "Forrajero Centro",
    "Valle de Monclova",
    "Desierto Productivo",
    "Sierra de Coahuila",
    "Campo del Norte",
    "Alianza del Sureste",
  ].map((name, id) => ({
    id,
    name,
    town: towns[id],
    members: [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [17, 18, 19, 20],
      [21, 22, 23],
    ][id],
    target: id === 0 ? 1000 : 500,
    p: id === 1 ? 1 : id === 2 ? 5 : 0,
  }));
  const orders = qty
    .map((q, i) => ({
      id: i + 1,
      date:
        "2026-" +
        ["05", "05", "06", "06", "07", "07", "08", "08", "09", "10"][i] +
        "-12",
      lines: [
        {
          producer: i < 10 ? i + 5 : i < 13 ? i - 8 : i === 13 ? 5 : 9,
          p: catalog[i],
          qty: q,
          price: prices[i] * 100,
          group: i >= 10 ? (i < 13 ? 0 : i === 13 ? 1 : 2) : null,
          status:
            i < 10
              ? "Recibida"
              : i === 13
                ? "Pendiente"
                : i === 14
                  ? "En tránsito"
                  : "Aceptada",
          received:
            i < 10
              ? "2026-" +
                ["05", "05", "06", "06", "07", "07", "08", "08", "09", "10"][
                  i
                ] +
                "-12"
              : null,
        },
      ],
    }))
    .map((o) => ({
      ...o,
      date:
        o.id > 10
          ? "2026-11-" + (o.id - 3)
          : o.date.slice(0, -2) + String(3 + (o.id % 7)).padStart(2, "0"),
      plannedDelivery:
        o.id > 10 ? "2026-11-" + (o.id + 10) : o.lines[0].received,
    }));
  const offers = producers.flatMap(({ id }) =>
    [
      ...new Set([
        0,
        id % 12,
        ...orders.flatMap((o) =>
          o.lines.filter((l) => l.producer === id).map((l) => l.p),
        ),
      ]),
    ].map((p) => ({
      producer: id,
      p,
      price:
        p === 0 && id < 2
          ? 12000
          : p < 8
            ? [116, 101, 94, 86, 68, 98, 102, 103][p] * 100 + (id % 5) * 200
            : [450, 420, 600, 550][p - 8] + (id % 5) * 15,
      capacity:
        p < 8 ? (id < 2 ? [240, 180][id] : 460 + id * 39) : 1100 + id * 145,
      harvest: "2026-11-" + String(2 + ((id * 3 + p) % 15)).padStart(2, "0"),
      stock:
        (id === 0 && p === 0 ? 90 : id === 1 && p === 0 ? 60 : 150 + id * 12) +
        orders
          .flatMap((o) => o.lines)
          .filter((l) => l.producer === id && l.p === p)
          .reduce((a, l) => a + l.qty, 0),
    })),
  );
  return {
    groups,
    orders,
    offers,
    cart: [],
    paid: Object.fromEntries(
      orders.slice(0, 8).map((o) => [o.id + "-" + o.lines[0].producer, true]),
    ),
    company: {
      name: "Forrajes del Norte",
      town: "Monclova",
      address: "Centro de recepción · Monclova",
      contact: "Equipo de compras",
      reduced: false,
      view: "cuadricula",
    },
    events: [],
  };
}
export const all = (s) =>
  s.orders.flatMap((o) =>
    o.lines.map((l) => ({ ...l, order: o.id, date: o.date })),
  );
export const stock = (s, o) =>
  Math.max(
    0,
    Math.round(
      (o.stock -
        all(s)
          .filter(
            (l) =>
              l.producer === o.producer &&
              l.p === o.p &&
              l.status !== "Cancelada",
          )
          .reduce((a, l) => a + l.qty, 0)) *
        1000,
    ) / 1000,
  );
export const stats = (s, id) => {
  const g = s.groups.find((g) => g.id === id),
    ls = all(s).filter((l) => l.group === id);
  const sum = (states) =>
    ls.filter((l) => states.includes(l.status)).reduce((a, l) => a + l.qty, 0);
  return {
    target: g.target,
    committed: sum(["Aceptada", "En tránsito", "Recibida"]),
    received: sum(["Recibida"]),
    pending: sum(["Pendiente"]),
  };
};
export const today = "2026-11-19";
export const receipts = (s) =>
  s.orders.flatMap((o) =>
    [
      ...new Set(
        o.lines.filter((l) => l.status === "Recibida").map((l) => l.producer),
      ),
    ].map((producer) => ({
      id: o.id + "-" + producer,
      order: o.id,
      producer,
      lines: o.lines.filter(
        (l) => l.producer === producer && l.status === "Recibida",
      ),
      company: o.company || "Forrajes del Norte",
    })),
  );
export const folio = (n) => "OC-" + String(n).padStart(3, "0");
export function transact(s, action) {
  const fail = (message) => {
    throw Error(message);
  };
  const event = (next, label) => ({
    ...next,
    events: [
      { label, id: crypto.randomUUID(), date: today },
      ...s.events,
    ].slice(0, 40),
  });
  if (action.type === "create") {
    if (!s.cart.length) fail("Agrega productos a la orden.");
    const seen = new Set();
    for (const l of s.cart) {
      const o = s.offers.find((o) => o.producer === l.producer && o.p === l.p),
        k = l.producer + "-" + l.p;
      if (
        seen.has(k) ||
        !o ||
        !Number.isFinite(l.qty) ||
        l.qty <= 0 ||
        l.qty > stock(s, o) ||
        Math.abs(
          l.qty * (l.p < 8 ? 1 : 1000) -
            Math.round(l.qty * (l.p < 8 ? 1 : 1000)),
        ) > 1e-7
      )
        fail("Revisa las cantidades y la disponibilidad.");
      seen.add(k);
    }
    const id = Math.max(0, ...s.orders.map((o) => o.id)) + 1;
    return event(
      {
        ...s,
        cart: [],
        orders: [
          ...s.orders,
          {
            id,
            date: today,
            company: s.company.name,
            address: action.address,
            plannedDelivery: "2026-11-23",
            lines: s.cart.map((l) => {
              const g = s.groups.find((g) => g.id === l.group);
              return {
                ...l,
                group:
                  g && g.p === l.p && g.members.includes(l.producer)
                    ? g.id
                    : null,
                status: "Pendiente",
              };
            }),
          },
        ],
      },
      "Orden " + folio(id) + " creada",
    );
  }
  if (action.type === "transition") {
    const o = s.orders.find((o) => o.id === action.id),
      allowed = {
        Pendiente: ["Aceptada", "Cancelada"],
        Aceptada: ["En tránsito", "Cancelada"],
        "En tránsito": ["Recibida"],
      };
    if (
      !o?.lines.some(
        (l) =>
          l.producer === action.producer &&
          allowed[l.status]?.includes(action.status),
      )
    )
      return s;
    return event(
      {
        ...s,
        orders: s.orders.map((x) =>
          x.id !== o.id
            ? x
            : {
                ...x,
                lines: x.lines.map((l) =>
                  l.producer !== action.producer ||
                  !allowed[l.status]?.includes(action.status)
                    ? l
                    : {
                        ...l,
                        status: action.status,
                        received: action.status === "Recibida" ? today : null,
                      },
                ),
              },
        ),
      },
      folio(o.id) +
        " · " +
        producers[action.producer].name +
        " · " +
        action.status,
    );
  }
  return s;
}
