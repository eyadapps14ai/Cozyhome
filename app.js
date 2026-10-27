(function () {
  const $ = (id) => document.getElementById(id);
  const money = Cart.formatMoney;
  const cart = Cart.createCart();
  let category = "All";
  let query = "";
  let saleNo = 1;

  function renderCategories() {
    const cats = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
    $("categories").innerHTML = "";
    cats.forEach((c) => {
      const b = document.createElement("button");
      b.textContent = c;
      b.className = "chip" + (c === category ? " active" : "");
      b.onclick = () => { category = c; renderCategories(); renderGrid(); };
      $("categories").appendChild(b);
    });
  }

  function renderGrid() {
    const q = query.toLowerCase();
    const items = PRODUCTS.filter((p) =>
      (category === "All" || p.category === category) && p.name.toLowerCase().includes(q));
    $("grid").innerHTML = "";
    items.forEach((p) => {
      const b = document.createElement("button");
      b.className = "product";
      b.innerHTML = `<span class="emoji"></span><span class="name"></span><span class="price"></span>`;
      b.querySelector(".emoji").textContent = p.emoji;
      b.querySelector(".name").textContent = p.name;
      b.querySelector(".price").textContent = money(p.price);
      b.onclick = () => { Cart.addItem(cart, p); renderCart(); };
      $("grid").appendChild(b);
    });
    if (!items.length) $("grid").innerHTML = `<p class="empty">No products match.</p>`;
  }

  function renderCart() {
    $("lines").innerHTML = "";
    cart.lines.forEach((l) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="lname"></span>
        <span class="qty"><button aria-label="Decrease">−</button><b></b><button aria-label="Increase">+</button></span>
        <span class="lprice"></span><button class="remove" aria-label="Remove">×</button>`;
      li.querySelector(".lname").textContent = l.name;
      li.querySelector("b").textContent = l.qty;
      li.querySelector(".lprice").textContent = money(l.price * l.qty);
      const [dec, inc] = li.querySelectorAll(".qty button");
      dec.onclick = () => { Cart.setQty(cart, l.id, l.qty - 1); renderCart(); };
      inc.onclick = () => { Cart.setQty(cart, l.id, l.qty + 1); renderCart(); };
      li.querySelector(".remove").onclick = () => { Cart.removeItem(cart, l.id); renderCart(); };
      $("lines").appendChild(li);
    });
    const t = Cart.totals(cart);
    $("subtotal").textContent = money(t.subtotal);
    $("tax").textContent = money(t.tax);
    $("total").textContent = money(t.total);
    $("empty").hidden = cart.lines.length > 0;
    ["pay-card", "pay-cash", "clear"].forEach((id) => ($(id).disabled = !cart.lines.length));
  }

  function showReceipt(method, tendered) {
    const t = Cart.totals(cart);
    const rows = cart.lines.map((l) =>
      `<tr><td>${l.qty} × ${escapeHtml(l.name)}</td><td>${money(l.price * l.qty)}</td></tr>`).join("");
    const cashRows = method === "Cash"
      ? `<tr><td>Tendered</td><td>${money(tendered)}</td></tr><tr><td>Change</td><td>${money(Cart.change(t.total, tendered))}</td></tr>`
      : "";
    $("receipt").innerHTML = `
      <h3>Cozy Home</h3>
      <p>Sale #${String(saleNo).padStart(4, "0")} · ${new Date().toLocaleString()}</p>
      <table>${rows}
        <tr class="sep"><td>Subtotal</td><td>${money(t.subtotal)}</td></tr>
        <tr><td>Tax</td><td>${money(t.tax)}</td></tr>
        <tr class="grand"><td>Total</td><td>${money(t.total)}</td></tr>
        <tr><td>Paid by</td><td>${method}</td></tr>${cashRows}
      </table>
      <p>Thank you for shopping with us!</p>`;
    $("receipt-dialog").showModal();
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  $("search").oninput = (e) => { query = e.target.value; renderGrid(); };
  $("clear").onclick = () => { Cart.clear(cart); renderCart(); };
  $("pay-card").onclick = () => showReceipt("Card");
  $("pay-cash").onclick = () => {
    $("cash-due").textContent = money(Cart.totals(cart).total);
    $("tendered").value = "";
    $("cash-error").textContent = "";
    $("cash-dialog").showModal();
  };
  $("cash-confirm").onclick = (e) => {
    const tendered = Math.round(parseFloat($("tendered").value) * 100);
    const total = Cart.totals(cart).total;
    if (!Number.isFinite(tendered) || tendered < total) {
      e.preventDefault();
      $("cash-error").textContent = "Amount must be at least the total due.";
      return;
    }
    $("cash-dialog").close();
    showReceipt("Cash", tendered);
  };
  $("print").onclick = () => window.print();
  $("new-sale").onclick = () => {
    $("receipt-dialog").close();
    Cart.clear(cart);
    saleNo += 1;
    renderCart();
  };

  $("taxrate").textContent = Math.round(Cart.TAX_RATE * 100) + "%";
  renderCategories();
  renderGrid();
  renderCart();
})();
