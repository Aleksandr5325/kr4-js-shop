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

const summary = createProductSummary(product);
console.log('Файл main.js подключён');
console.log('Товар:', product);
console.log('Цена:', formatPrice(product.price));
console.log('Скидка:', calculateDiscount(product.price, product.discountPercent));
console.log('Итоговая цена:', calculateFinalPrice(product.price, product.discountPercent));
console.log('Статус:', getProductStatus(product));
console.log(summary);
console.log('Доступен со скидкой:', product.isAvailable && product.discountPercent > 0);

const messageElement = document.querySelector('.js-message');
const productOutputElement = document.querySelector('.product-output');

if (messageElement && productOutputElement) {
  messageElement.textContent = 'JavaScript подключён корректно.';
  productOutputElement.textContent = summary;
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
