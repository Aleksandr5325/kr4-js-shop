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

function cartDiscount(subtotal, hasPromo) {
  return hasPromo ? Math.round(subtotal * 0.1) : 0;
}

const cartList = document.getElementById('cart-items');
if (cartList) {
  const total = document.getElementById('cart-total');
  const promoResult = document.getElementById('promo-result');
  const checkout = document.getElementById('cart-checkout');
  let promoApplied = false;

  function cartButton(label, action, item, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button--secondary';
    button.textContent = action === 'increase' ? '+' : action === 'decrease' ? '−' : 'Удалить';
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
      const image = document.createElement('img');
      image.src = 'images/' + product.image + '-320.webp';
      image.alt = '';
      image.width = 80;
      image.height = 80;

      const title = document.createElement('strong');
      title.textContent = product.title;
      const price = document.createElement('span');
      price.textContent = cartMoney.format(cartSubtotal([item]) / 100);
      const info = document.createElement('div');
      info.className = 'cart-item__info';
      info.append(title, price);

      const quantity = document.createElement('span');
      quantity.textContent = item.quantity;
      quantity.setAttribute('aria-label', 'Количество: ' + item.quantity);
      const actions = document.createElement('div');
      actions.className = 'cart-item__actions';
      actions.append(cartButton('Уменьшить', 'decrease', item, product.title), quantity,
        cartButton('Увеличить', 'increase', item, product.title),
        cartButton('Удалить', 'remove', item, product.title));
      row.append(image, info, actions);
      return row;
    });
    cartList.replaceChildren(...rows);
    document.getElementById('cart-summary').hidden = !items.length;
    document.getElementById('cart-empty').hidden = Boolean(items.length);
    document.getElementById('cart-selection').hidden = !items.length;
    const subtotal = cartSubtotal(items);
    const discount = cartDiscount(subtotal, promoApplied);
    document.getElementById('cart-subtotal').textContent = cartMoney.format(subtotal / 100);
    document.getElementById('cart-discount').textContent = cartMoney.format(discount / 100);
    total.textContent = cartMoney.format((subtotal - discount) / 100);
    checkout.href = 'order.html?from=cart' + (promoApplied ? '&promo=MELL10' : '');
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
