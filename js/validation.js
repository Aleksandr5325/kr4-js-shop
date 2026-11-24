const applicationForm = document.querySelector('.order-form--page');
const applicationResult = document.getElementById('order-result');
const applicationFields = [
  document.getElementById('order-name'),
  document.getElementById('order-email'),
  document.getElementById('order-phone'),
];

const fieldErrors = applicationFields.map((field) => {
  const error = document.createElement('small');
  error.id = field.id + '-error';
  error.className = 'order-form__error';
  error.hidden = true;
  field.closest('.order-form__field').append(error);
  const hint = field.getAttribute('aria-describedby');
  field.setAttribute('aria-describedby', [hint, error.id].filter(Boolean).join(' '));
  return error;
});

function validateApplicationField(field, index) {
  const error = fieldErrors[index];
  const value = field.value.trim();
  let message = '';
  if (field.id === 'order-name' && value.length < 2) {
    message = 'Введите имя из двух или более символов.';
  } else if (field.id === 'order-email' && (!value || !field.validity.valid)) {
    message = 'Введите e-mail в формате name@example.com.';
  } else if (field.id === 'order-phone' && !field.validity.valid) {
    message = 'Введите телефон в формате +7 (900) 000-00-00.';
  }
  error.textContent = message;
  error.hidden = !message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  return !message;
}

applicationFields.forEach((field, index) => {
  field.addEventListener('input', () => {
    applicationResult.textContent = '';
    if (field.hasAttribute('aria-invalid')) validateApplicationField(field, index);
  });
});

applicationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  applicationResult.textContent = '';
  const validFields = applicationFields.map(validateApplicationField);
  const firstInvalid = validFields.indexOf(false);
  if (firstInvalid !== -1) {
    applicationFields[firstInvalid].focus();
    return;
  }
  // Остальные обязательные поля проверяет браузер.
  if (!applicationForm.reportValidity()) return;
  applicationForm.reset();
  applicationResult.textContent = 'Проверка пройдена. Учебная заявка на сервер не отправляется.';
});

applicationForm.addEventListener('reset', () => {
  applicationFields.forEach((field, index) => {
    field.removeAttribute('aria-invalid');
    fieldErrors[index].textContent = '';
    fieldErrors[index].hidden = true;
  });
  applicationResult.textContent = '';
});
applicationForm.noValidate = true;
