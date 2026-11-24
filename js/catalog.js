const searchInput = document.getElementById('catalog-search');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const productsContainer = document.querySelector('[data-products-container]');
const catalogCount = document.querySelector('.catalog-count');
const cartCount = document.querySelector('[data-cart-count]');
const catalogEmpty = document.querySelector('.catalog-empty');
const catalogState = { query: '', category: 'all', sortType: 'default' };

function createCardElement(tag, className, text = '') {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function updateCartButton(button, product, quantity) {
  button.textContent = quantity ? 'В корзине: ' + quantity : 'В корзину';
  button.setAttribute('aria-label', quantity
    ? 'Добавить ещё: ' + product.title + '. В корзине: ' + quantity
    : 'В корзину: ' + product.title);
}

function createProductCard(product, quantity) {
  const card = createCardElement('article', 'product-card');
  const price = calculateFinalPrice(product.price, product.discountPercent);
  if (product.discountPercent > 0) card.classList.add('product-card--discount');
  if (product.href === 'product.html') card.classList.add('product-card--featured');

  if (product.badge) {
    const badge = createCardElement('span', 'product-card__badge', product.badge);
    if (product.discountPercent > 0) badge.classList.add('product-card__badge--sale');
    if (product.badge === 'Новинка') badge.classList.add('product-card__badge--new');
    card.append(badge);
  }

  const picture = document.createElement('picture');
  const webp = document.createElement('source');
  const photo = createCardElement('img', 'product-card__image');
  const path = 'images/' + product.image;
  const sizes = '(min-width: 1280px) 230px, (min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw';
  function imageVariants(extension) {
    return path + '-320.' + extension + ' 320w, ' +
      path + '-480.' + extension + ' 480w, ' + path + '.' + extension + ' 800w';
  }
  webp.type = 'image/webp';
  webp.srcset = imageVariants('webp');
  webp.sizes = sizes;
  photo.src = path + '.jpg';
  photo.srcset = imageVariants('jpg');
  photo.sizes = sizes;
  photo.alt = product.alt;
  photo.width = 800;
  photo.height = 800;
  photo.loading = 'lazy';
  picture.append(webp, photo);

  const priceElement = createCardElement('p', 'product-card__price', formatPrice(price));
  if (product.discountPercent > 0) {
    priceElement.append(createCardElement('s', 'product-card__old-price', formatPrice(product.price)));
  }
  const link = createCardElement('a', 'button button--secondary product-card__button',
    product.href === 'product.html' ? 'Подробнее' : 'Заказать');
  link.href = product.href === 'product.html' ? product.href : 'order.html?product=' + product.id;
  const cartButton = createCardElement('button', 'button button--primary');
  cartButton.type = 'button';
  cartButton.dataset.action = 'add-to-cart';
  cartButton.dataset.productId = product.id;
  updateCartButton(cartButton, product, quantity);
  const actions = createCardElement('div', 'catalog-card-actions');
  actions.append(cartButton, link);
  card.append(picture,
    createCardElement('p', 'product-card__category', product.categoryLabel),
    createCardElement('h3', 'product-card__title', product.title),
    createCardElement('p', 'product-card__description', product.description),
    priceElement, actions);
  return card;
}

function updateCatalog() {
  const matching = searchProducts(products, catalogState.query);
  const preparedProducts = [...filterProductsByCategory(matching, catalogState.category)];
  if (catalogState.sortType === 'title-asc') {
    preparedProducts.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }
  if (catalogState.sortType.startsWith('price-')) {
    const direction = catalogState.sortType === 'price-desc' ? -1 : 1;
    const priceOf = (product) => calculateFinalPrice(product.price, product.discountPercent);
    preparedProducts.sort((a, b) => direction * (priceOf(a) - priceOf(b)));
  }

  const items = readCart();
  const cards = preparedProducts.map((product) => {
    const item = items.find((entry) => entry.id === product.id);
    return createProductCard(product, item?.quantity);
  });
  productsContainer.replaceChildren(...cards);
  catalogCount.textContent = 'Найдено товаров: ' + preparedProducts.length;
  catalogEmpty.hidden = preparedProducts.length > 0;
}

searchInput.addEventListener('input', () => {
  catalogState.query = searchInput.value;
  updateCatalog();
});
categoryFilter.addEventListener('change', () => {
  catalogState.category = categoryFilter.value;
  updateCatalog();
});
sortSelect.addEventListener('change', () => {
  catalogState.sortType = sortSelect.value;
  updateCatalog();
});

productsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="add-to-cart"]');
  if (!button) return;
  const product = findProductById(products, Number(button.dataset.productId));
  if (!product) return;
  const saved = addToCart(product.id);
  if (saved) {
    cartCount.textContent = countCartItems();
    const item = readCart().find((item) => item.id === product.id);
    updateCartButton(button, product, item?.quantity);
  }
  document.getElementById('cart-notice').textContent = saved
    ? product.title + ' · В корзине: ' + countCartItems()
    : 'Не удалось сохранить корзину. Проверьте настройки браузера.';
});
cartCount.textContent = countCartItems();
updateCatalog();
