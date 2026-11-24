console.log('Скрипт запущен');
document.querySelector('#result').textContent = 'JavaScript работает';

const item = { title: 'Лампа', price: 1200, isAvailable: true };
let amount = 1;
amount += 1;
item.price = 1100;
console.log(amount, typeof item.price, item.title, item.price);

for (const raw of ['1100', 'abc', '']) {
  const value = Number(raw);
  const valid = raw.trim() !== '' && Number.isFinite(value);
  console.log(raw, value, valid);
}

const price = 1000;
const discountPercent = 10;
const isAvailable = true;
const finalPrice = price - price * discountPercent / 100;

if (!isAvailable) {
  console.log('Товара нет в наличии');
} else if (finalPrice < price) {
  console.log('Товар доступен со скидкой', finalPrice);
} else {
  console.log('Товар доступен по полной цене', price);
}

function discountedPrice(price, percent) {
  const discount = price * percent / 100;
  return price - discount;
}

console.log(discountedPrice(500, 20), discountedPrice(500, 0));
