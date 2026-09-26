import './style.css';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name';

const API_URL = 'https://fakestoreapi.com/products';
function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`No se encontró el elemento ${selector}.`);
  return element;
}

const productGrid = getElement<HTMLDivElement>('#product-grid');
const statusMessage = getElement<HTMLParagraphElement>('#status-message');
const resultCount = getElement<HTMLSpanElement>('#result-count');
const searchInput = getElement<HTMLInputElement>('#search-input');
const categorySelect = getElement<HTMLSelectElement>('#category-select');
const sortSelect = getElement<HTMLSelectElement>('#sort-select');
const filtersForm = getElement<HTMLFormElement>('#filters');

let products: Product[] = [];

function formatCategory(category: string): string {
  return category.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('es'));
}

function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('article');
  card.className = 'product-card';

  const imageFrame = document.createElement('div');
  imageFrame.className = 'product-image-frame';

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.title;
  image.loading = 'lazy';
  imageFrame.append(image);

  const details = document.createElement('div');
  details.className = 'product-details';

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = formatCategory(product.category);

  const title = document.createElement('h3');
  title.textContent = product.title;

  const rating = document.createElement('p');
  rating.className = 'product-rating';
  rating.innerHTML = `<span aria-hidden="true">★</span> ${product.rating.rate.toFixed(1)} <span class="rating-count">(${product.rating.count} reseñas)</span>`;

  const bottom = document.createElement('div');
  bottom.className = 'product-bottom';

  const price = document.createElement('p');
  price.className = 'product-price';
  price.textContent = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(product.price);

  const addButton = document.createElement('button');
  addButton.className = 'add-button';
  addButton.type = 'button';
  addButton.setAttribute('aria-label', `Agregar ${product.title} a favoritos`);
  addButton.setAttribute('aria-pressed', 'false');
  addButton.textContent = '+';
  addButton.addEventListener('click', () => {
    const isSelected = addButton.getAttribute('aria-pressed') === 'true';
    addButton.setAttribute('aria-pressed', String(!isSelected));
    addButton.textContent = isSelected ? '+' : '✓';
    addButton.setAttribute('aria-label', `${isSelected ? 'Agregar' : 'Quitar'} ${product.title} ${isSelected ? 'a' : 'de'} favoritos`);
  });

  bottom.append(price, addButton);
  details.append(category, title, rating, bottom);
  card.append(imageFrame, details);
  return card;
}

function renderProducts(): void {
  const query = searchInput.value.trim().toLocaleLowerCase('es');
  const category = categorySelect.value;
  const sort = sortSelect.value as SortOption;

  const visibleProducts = products
    .filter((product) => category === 'all' || product.category === category)
    .filter((product) => `${product.title} ${product.description} ${product.category}`.toLocaleLowerCase('es').includes(query));

  if (sort === 'price-asc') visibleProducts.sort((first, second) => first.price - second.price);
  if (sort === 'price-desc') visibleProducts.sort((first, second) => second.price - first.price);
  if (sort === 'name') visibleProducts.sort((first, second) => first.title.localeCompare(second.title, 'es'));

  productGrid.replaceChildren(...visibleProducts.map(createProductCard));
  resultCount.textContent = `(${visibleProducts.length})`;
  statusMessage.textContent = visibleProducts.length === 0 ? 'No encontramos productos con esos filtros.' : '';
}

function populateCategories(): void {
  const categories = [...new Set(products.map((product) => product.category))].sort((first, second) => first.localeCompare(second, 'es'));
  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = formatCategory(category);
    categorySelect.append(option);
  }
}

async function loadProducts(): Promise<void> {
  statusMessage.textContent = 'Cargando productos...';
  productGrid.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

    products = (await response.json()) as Product[];
    populateCategories();
    renderProducts();
  } catch {
    statusMessage.textContent = 'No fue posible cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.';
    const retryButton = document.createElement('button');
    retryButton.className = 'retry-button';
    retryButton.type = 'button';
    retryButton.textContent = 'Intentar de nuevo';
    retryButton.addEventListener('click', loadProducts);
    statusMessage.append(' ', retryButton);
  } finally {
    productGrid.setAttribute('aria-busy', 'false');
  }
}

filtersForm.addEventListener('submit', (event) => event.preventDefault());
searchInput.addEventListener('input', renderProducts);
categorySelect.addEventListener('change', renderProducts);
sortSelect.addEventListener('change', renderProducts);

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
});

void loadProducts();