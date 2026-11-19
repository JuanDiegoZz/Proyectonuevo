import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  stats,
  stock,
  receipts,
  total,
  all,
  transact,
  producers,
  products,
} from "../domain.js";
test("reserva, aceptación, cancelación y recepción mantienen cantidades y documentos", () => {
  let s = seed();
  assert.deepEqual(
    [
      producers.length,
      s.groups.length,
      products.length,
      s.orders.length,
      receipts(s).length,
    ],
    [24, 6, 12, 15, 10],
  );
  const offers = s.offers.filter(
    (o) => [0, 1].includes(o.producer) && o.p === 0,
  );
  s.cart = offers.map((o, i) => ({ ...o, group: 0, qty: [90, 60][i] }));
  assert.throws(() =>
    transact({ ...s, cart: [{ ...s.cart[0], qty: 91 }] }, { type: "create" }),
  );
  s = transact(s, { type: "create" });
  assert.equal(stock(s, offers[0]), 0);
  assert.deepEqual(stats(s, 0), {
    target: 1000,
    committed: 850,
    received: 0,
    pending: 150,
  });
  const next = (producer, status) =>
    (s = transact(s, { type: "transition", id: 16, producer, status }));
  const reserved = s;
  assert.equal(next(0, "Recibida"), reserved);
  next(0, "Aceptada");
  assert.equal(stats(s, 0).committed, 940);
  next(1, "Aceptada");
  next(0, "En tránsito");
  next(1, "En tránsito");
  next(0, "Recibida");
  assert.equal(receipts(s).length, 11);
  const once = s;
  assert.equal(next(0, "Recibida"), once);
  next(1, "Recibida");
  assert.deepEqual(stats(s, 0), {
    target: 1000,
    committed: 1000,
    received: 150,
    pending: 0,
  });
  assert.equal(receipts(s).length, 12);
  assert.equal(total(all(s).filter((l) => l.status === "Recibida")), 14885000);
});
