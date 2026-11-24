function formatPrice(price) {
  return `${price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} руб.`;
}

function calculateDiscount(price, discountPercent) {
  return price * discountPercent / 100;
}

function calculateFinalPrice(price, discountPercent) {
  return price - calculateDiscount(price, discountPercent);
}

function getProductStatus(product) {
  return product.isAvailable ? 'В наличии' : 'Нет в наличии';
}

function createProductSummary(product) {
  const total = calculateFinalPrice(product.price, product.discountPercent);
  return `${product.title}: ${formatPrice(total)}. Статус: ${getProductStatus(product)}.`;
}

// Методы массива используют callback для обработки каждого товара.
function getProductTitles(products) {
  return products.map((product) => product.title);
}

function getAvailableProducts(products) {
  return products.filter((product) => product.isAvailable);
}

function searchProducts(products, query) {
  const normalizedQuery = query.trim().toLowerCase();
  return products.filter((product) => product.title.toLowerCase().includes(normalizedQuery));
}

function filterProductsByCategory(products, category) {
  return category === 'all' ? products : products.filter((product) => product.category === category);
}

function sortProductsByPrice(products, direction = 'asc') {
  const multiplier = direction === 'desc' ? -1 : 1;
  return [...products].sort((first, second) => multiplier * (first.price - second.price));
}

function findProductById(products, id) {
  return products.find((product) => product.id === id);
}

function calculateTotalPrice(products) {
  return products.reduce((sum, product) => sum + product.price, 0);
}

function countAvailableProducts(products) {
  return getAvailableProducts(products).length;
}

function calculateAveragePrice(products) {
  return products.length ? Math.round(calculateTotalPrice(products) / products.length) : 0;
}

function getPreparedProducts(products, query, category, sortDirection) {
  const matching = searchProducts(products, query);
  const filtered = filterProductsByCategory(matching, category);
  return sortProductsByPrice(filtered, sortDirection);
}

// Учебная диагностика подключается только на странице лаборатории.
const productOutputElement = document.querySelector('.product-output');
if (productOutputElement) {
  console.log('Файл main.js подключён');
  console.table(products);
  console.log('Названия:', getProductTitles(products));
  console.table(getAvailableProducts(products));
  console.table(searchProducts(products, 'кот'));
  console.table(filterProductsByCategory(products, 'games'));
  console.table(sortProductsByPrice(products, 'asc'));
  console.log('Товар с id 4:', findProductById(products, 4));
  console.log('Сумма цен:', calculateTotalPrice(products));
  console.log('В наличии:', countAvailableProducts(products));
  console.log('Средняя цена:', calculateAveragePrice(products));
  console.table(getPreparedProducts(products, 'ш', 'games', 'asc'));

  document.querySelector('.js-message').textContent = 'Массив товаров и функции обработки данных подключены.';
  document.getElementById('lab-product-example').textContent = createProductSummary(findProductById(products, 4));
  productOutputElement.textContent = [
    `Всего товаров: ${products.length}`,
    `Товаров в наличии: ${countAvailableProducts(products)}`,
    `Средняя цена до скидок: ${formatPrice(calculateAveragePrice(products))}`,
    `Результатов поиска «кот»: ${searchProducts(products, 'кот').length}`,
  ].join('\n');
}

// Модалка заявки есть только на главной странице.
if (document.getElementById('order-dialog')) {
  // Получаем модальное окно по id.
  const orderDialog = document.getElementById('order-dialog');

  // Получаем все кнопки заказа в карточках товаров.
  const orderButtons = document.querySelectorAll('.product-card__button');

  // Получаем кнопку закрытия модального окна.
  const closeDialogButton = document.getElementById('close-order-dialog');

  // Получаем скрытое поле, в которое будет записан выбранный товар.
  const selectedProductInput = document.getElementById('selected-product');

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название товара из data-атрибута.
      const productName = button.dataset.product;

      // Записываем название товара в скрытое поле формы.
      selectedProductInput.value = productName;

      // Открываем модальное окно.
      successMessage.hidden = true;
      orderDialog.showModal();
    });
  });

  // Закрываем модальное окно по кнопке «Закрыть».
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });

  // Получаем форму заявки.
  const orderForm = document.getElementById('order-form');

  // Получаем сообщение об успешной отправке.
  const successMessage = document.getElementById('success-message');

  // Для каждого поля создаём текст ошибки и связываем его с полем.
  const fields = Array.from(orderForm.querySelectorAll('input, select, textarea')).filter((field) => field.willValidate);
  const errors = new Map();
  fields.forEach((field) => {
    const error = document.createElement('small');
    error.className = 'order-form__error';
    error.id = `${field.id}-error`;
    error.hidden = true;
    field.closest('.order-form__field').append(error);
    const descriptions = field.getAttribute('aria-describedby');
    field.setAttribute('aria-describedby', [descriptions, error.id].filter(Boolean).join(' '));
    errors.set(field, error);
    field.addEventListener('input', () => {
      if (field.validity.valid) {
        field.removeAttribute('aria-invalid');
        error.hidden = true;
      }
    });
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Учебный проект: сервер не подключён.
    let firstInvalid = null;
    fields.forEach((field) => {
      const error = errors.get(field);
      if (field.validity.valid) {
        field.removeAttribute('aria-invalid');
        error.hidden = true;
      } else {
        field.setAttribute('aria-invalid', 'true');
        error.textContent = field.validationMessage;
        error.hidden = false;
        firstInvalid ??= field;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus(); // Диктор прочитает подпись и связанное пояснение.
      return;
    }
    orderDialog.close();
    successMessage.hidden = false;
    orderForm.reset();
  });
}
