const cartStorageKey = 'mellshop-cart-v1';
const cartMoney = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartStorageKey));
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => item && Number.isInteger(item.quantity) &&
      item.quantity > 0 && item.quantity <= 99 && products.some((product) => product.id === item.id));
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

function addToCart(id) {
  const items = readCart();
  const item = items.find((item) => item.id === id);
  if (item) item.quantity = Math.min(99, item.quantity + 1);
  else items.push({ id, quantity: 1 });
  return saveCart(items);
}

function countCartItems() {
  return readCart().reduce((count, item) => count + item.quantity, 0);
}

function cartSubtotal(items) {
  return items.reduce((sum, item) => {
    const product = products.find((product) => product.id === item.id);
    const unitPrice = Math.round(product.price * (100 - product.discountPercent));
    return sum + unitPrice * item.quantity;
  }, 0);
}

const cartList = document.getElementById('cart-items');
if (cartList) {
  const total = document.getElementById('cart-total');
  const promoResult = document.getElementById('promo-result');
  let promoApplied = false;

  function cartButton(label, action, item, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button--secondary';
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = item.id;
    button.setAttribute('aria-label', label + ' · ' + title);
    return button;
  }

  function renderCart() {
    const items = readCart();
    const rows = items.map((item) => {
      const product = products.find((product) => product.id === item.id);
      const row = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = product.title + ' × ' + item.quantity + ' · ' + cartMoney.format(cartSubtotal([item]) / 100);
      row.append(label, cartButton('Уменьшить', 'decrease', item, product.title),
        cartButton('Увеличить', 'increase', item, product.title),
        cartButton('Удалить', 'remove', item, product.title));
      return row;
    });
    cartList.replaceChildren(...rows);
    document.getElementById('cart-summary').hidden = !items.length;
    document.getElementById('cart-empty').hidden = Boolean(items.length);
    const subtotal = cartSubtotal(items);
    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
    total.textContent = 'Всего игрушек: ' + countCartItems() +
      '. Скидка по промокоду: ' + cartMoney.format(discount / 100) +
      '. К оплате: ' + cartMoney.format((subtotal - discount) / 100);
  }

  cartList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const items = readCart();
    const id = Number(button.dataset.id);
    const item = items.find((item) => item.id === id);
    if (!item) return;
    const action = button.dataset.action;
    if (action === 'increase') item.quantity = Math.min(99, item.quantity + 1);
    if (action === 'decrease') item.quantity -= 1;

    const nextItems = items.filter((entry) => entry.quantity > 0 &&
      (action !== 'remove' || entry.id !== id));
    if (!saveCart(nextItems)) {
      total.textContent = 'Не удалось сохранить изменение корзины.';
      return;
    }
    renderCart();
    const replacement = cartList.querySelector('[data-id="' + id + '"][data-action="' + action + '"]');
    (replacement || cartList.querySelector('button') || document.querySelector('main a[href="catalog.html"]')).focus();
  });

  document.getElementById('promo-form').addEventListener('submit', (event) => {
    event.preventDefault();
    promoApplied = document.getElementById('promo-code').value.trim().toUpperCase() === 'MELL10';
    promoResult.textContent = promoApplied ? 'Промокод применён. Скидка 10%.' : 'Промокод не найден.';
    renderCart();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === cartStorageKey || event.key === null) renderCart();
  });
  renderCart();
}
