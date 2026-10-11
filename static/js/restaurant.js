document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('.menu-card');
  filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.toggle('is-active', item === filter));
    cards.forEach((card) => { card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter; });
  }));

  const menu = [...cards].map((card) => ({
    id: card.querySelector('[data-add]').dataset.add,
    name: card.querySelector('h3').textContent,
    price: Number(card.querySelector('.menu-card-top strong').textContent.replace(/[^\d.]/g, '')),
  }));
  let cart = new Map();
  try {
    const saved = JSON.parse(localStorage.getItem('thyme-cart') || '[]');
    saved.forEach(({ id, quantity }) => { if (menu.some((item) => item.id === id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 25) cart.set(id, quantity); });
  } catch { cart = new Map(); }

  const list = document.querySelector('#basket-items');
  const totalLabel = document.querySelector('#basket-total');
  const countLabel = document.querySelector('#basket-count');
  const orderForm = document.querySelector('#order-form');
  const orderButton = orderForm.querySelector('button[type="submit"]');
  const orderStatus = document.querySelector('#order-feedback');
  const price = (value) => `₹${value.toLocaleString('en-IN')}`;
  const renderCart = () => {
    let total = 0;
    let count = 0;
    list.replaceChildren();
    if (!cart.size) {
      const empty = document.createElement('p');
      empty.className = 'empty-basket';
      empty.textContent = 'Your basket is waiting for something tasty.';
      list.append(empty);
    }
    cart.forEach((quantity, id) => {
      const item = menu.find((row) => row.id === id);
      if (!item) return;
      count += quantity;
      total += item.price * quantity;
      const row = document.createElement('div');
      row.className = 'basket-row';
      row.innerHTML = `<span>${item.name}<br><small>${price(item.price)} each</small></span><span class="quantity-controls"><button type="button" data-change="-1" data-id="${id}" aria-label="Remove one ${item.name}">−</button><b>${quantity}</b><button type="button" data-change="1" data-id="${id}" aria-label="Add one ${item.name}">+</button></span>`;
      list.append(row);
    });
    countLabel.textContent = count;
    totalLabel.textContent = price(total);
    orderButton.disabled = !cart.size;
    try { localStorage.setItem('thyme-cart', JSON.stringify([...cart].map(([id, quantity]) => ({ id, quantity })))); } catch { /* The in-page basket still works. */ }
  };
  document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.add;
    cart.set(id, Math.min(25, (cart.get(id) || 0) + 1));
    button.classList.add('is-added');
    button.innerHTML = 'Added <span>✓</span>';
    window.setTimeout(() => { button.classList.remove('is-added'); button.innerHTML = 'Add to basket <span>＋</span>'; }, 850);
    renderCart();
  }));
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-change]');
    if (!button) return;
    const next = (cart.get(button.dataset.id) || 0) + Number(button.dataset.change);
    if (next < 1) cart.delete(button.dataset.id); else cart.set(button.dataset.id, next);
    renderCart();
  });
  renderCart();

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelector('#order-cart').value = JSON.stringify([...cart].map(([id, quantity]) => ({ id, quantity })));
    orderButton.disabled = true;
    orderStatus.className = 'inline-status';
    orderStatus.textContent = 'Saving your order…';
    try {
      const response = await fetch(orderForm.action, { method: 'POST', body: new FormData(orderForm), headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Please check the order details.');
      orderStatus.textContent = `Order #${result.order_id} saved · total ${price(Number(result.total))}. Thank you!`;
      cart.clear();
      renderCart();
      orderForm.reset();
    } catch (error) {
      orderStatus.classList.add('error');
      orderStatus.textContent = error.message || 'Could not save your order. Please try again.';
      orderButton.disabled = !cart.size;
    }
  });

  const reservationTime = document.querySelector('#booking-time');
  if (reservationTime) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    reservationTime.min = now.toISOString().slice(0, 16);
  }
  const feedbackRating = document.querySelector('.rating-picker');
  feedbackRating?.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const radios = [...feedbackRating.querySelectorAll('input')];
    let index = radios.findIndex((radio) => radio.checked);
    index = (index + (event.key === 'ArrowRight' ? 1 : radios.length - 1)) % radios.length;
    radios[index].checked = true;
    radios[index].focus();
    event.preventDefault();
  });
});
