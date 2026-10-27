// Cart logic for the Cozy Home POS. All money is in integer cents to avoid float rounding.
(function (root) {
  const TAX_RATE = 0.15;

  function createCart() {
    return { lines: [] };
  }

  function addItem(cart, product, qty = 1) {
    if (!Number.isInteger(qty) || qty <= 0) throw new Error("qty must be a positive integer");
    const line = cart.lines.find((l) => l.id === product.id);
    if (line) line.qty += qty;
    else cart.lines.push({ id: product.id, name: product.name, price: product.price, qty });
    return cart;
  }

  function setQty(cart, id, qty) {
    if (!Number.isInteger(qty) || qty < 0) throw new Error("qty must be a non-negative integer");
    if (qty === 0) return removeItem(cart, id);
    const line = cart.lines.find((l) => l.id === id);
    if (line) line.qty = qty;
    return cart;
  }

  function removeItem(cart, id) {
    cart.lines = cart.lines.filter((l) => l.id !== id);
    return cart;
  }

  function clear(cart) {
    cart.lines = [];
    return cart;
  }

  function totals(cart, taxRate = TAX_RATE) {
    const subtotal = cart.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const tax = Math.round(subtotal * taxRate);
    return { subtotal, tax, total: subtotal + tax, items: cart.lines.reduce((n, l) => n + l.qty, 0) };
  }

  function change(total, tendered) {
    if (tendered < total) throw new Error("tendered amount is less than total");
    return tendered - total;
  }

  function formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }

  const api = { TAX_RATE, createCart, addItem, setQty, removeItem, clear, totals, change, formatMoney };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Cart = api;
})(this);
