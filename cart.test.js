const test = require("node:test");
const assert = require("node:assert");
const Cart = require("./cart.js");

const lamp = { id: "p1", name: "Lamp", price: 2500 };
const rug = { id: "p2", name: "Rug", price: 9999 };

test("adding the same product twice merges into one line", () => {
  const c = Cart.createCart();
  Cart.addItem(c, lamp);
  Cart.addItem(c, lamp, 2);
  assert.strictEqual(c.lines.length, 1);
  assert.strictEqual(c.lines[0].qty, 3);
});

test("totals compute subtotal, rounded tax and total in cents", () => {
  const c = Cart.createCart();
  Cart.addItem(c, lamp, 2);
  Cart.addItem(c, rug);
  const t = Cart.totals(c);
  assert.strictEqual(t.subtotal, 14999);
  assert.strictEqual(t.tax, 2250);
  assert.strictEqual(t.total, 17249);
  assert.strictEqual(t.items, 3);
});

test("setQty to zero removes the line", () => {
  const c = Cart.createCart();
  Cart.addItem(c, lamp);
  Cart.setQty(c, "p1", 0);
  assert.strictEqual(c.lines.length, 0);
});

test("invalid quantities are rejected", () => {
  const c = Cart.createCart();
  assert.throws(() => Cart.addItem(c, lamp, 0));
  assert.throws(() => Cart.setQty(c, "p1", -1));
  assert.throws(() => Cart.addItem(c, lamp, 1.5));
});

test("change is tendered minus total and rejects underpayment", () => {
  assert.strictEqual(Cart.change(17249, 20000), 2751);
  assert.throws(() => Cart.change(17249, 10000));
});

test("empty cart totals are zero", () => {
  assert.deepStrictEqual(Cart.totals(Cart.createCart()), { subtotal: 0, tax: 0, total: 0, items: 0 });
});

test("formatMoney renders two decimals", () => {
  assert.strictEqual(Cart.formatMoney(17249), "172.49");
  assert.strictEqual(Cart.formatMoney(5), "0.05");
});
