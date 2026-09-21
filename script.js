/* ---------- 1. DATA ----------
   This is SAMPLE data. Replace it with real, checked information.
   Set verified: true once you have checked a restaurant yourself.
   Set image: "images/photo.jpg" only with a real photo of that place.
   tags used by the filters: "traditional", "chicken"
*/
const restaurants = [
  {
    id: "o-terroir",
    name: "Ô Terroir",
    area: "Mvog-Ada",
    tags: ["traditional"],
    emoji: "🍛",
    tone: "#f5d98b",
    image: null,
    verified: false,
    dishes: [
      { name: "Beignets-haricots", price: 600 },
      { name: "Ndolé with plantain", price: 2000 },
      { name: "Poisson braisé", price: 3000 }
    ]
  },
  {
    id: "la-force",
    name: "La Force",
    area: "Yaoundé",
    tags: ["chicken"],
    emoji: "🍗",
    tone: "#f2b5a7",
    image: null,
    verified: false,
    dishes: [
      { name: "Grilled chicken with miondo", price: 2000 },
      { name: "Poulet DG", price: 2500 }
    ]
  },
  {
    id: "sample-essos",
    name: "Chez Tantine (sample)",
    area: "Essos",
    tags: ["traditional"],
    emoji: "🥘",
    tone: "#b9dcb8",
    image: null,
    verified: false,
    dishes: [
      { name: "Koki with plantain", price: 1000 },
      { name: "Bobolo and fish", price: 1200 },
      { name: "Eru with water fufu", price: 1500 }
    ]
  },
  {
    id: "sample-bastos",
    name: "Poulet Bastos (sample)",
    area: "Bastos",
    tags: ["chicken"],
    emoji: "🍗",
    tone: "#f7c99a",
    image: null,
    verified: false,
    dishes: [
      { name: "Chicken and chips", price: 2500 },
      { name: "Half grilled chicken", price: 3500 }
    ]
  },
  {
    id: "sample-melen",
    name: "Mama Melen (sample)",
    area: "Melen",
    tags: ["traditional", "chicken"],
    emoji: "🍲",
    tone: "#c9d9ee",
    image: null,
    verified: false,
    dishes: [
      { name: "Sauce jaune with rice", price: 1200 },
      { name: "Poulet braisé", price: 1800 }
    ]
  },
  {
    id: "sample-mokolo",
    name: "Mokolo Snack Stop (sample)",
    area: "Mokolo",
    tags: [],
    emoji: "🍢",
    tone: "#e6c3dc",
    image: null,
    verified: false,
    dishes: [
      { name: "Brochettes", price: 500 },
      { name: "Fried plantain and beans", price: 700 },
      { name: "Soya", price: 1000 }
    ]
  }
];


/* ---------- 2. HELPERS ---------- */

function formatPrice(amount) {
  return amount.toLocaleString("en-US") + " F";
}

function startingPrice(restaurant) {
  return Math.min(...restaurant.dishes.map(dish => dish.price));
}

function normalize(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


/* ---------- 3. DRAWING THE CARDS ---------- */
const grid = document.getElementById("restaurant-grid");
const emptyMessage = document.getElementById("empty");
const resultCount = document.getElementById("result-count");

function cardHtml(restaurant) {
  const photo = restaurant.image
    ? `<img src="${escapeHtml(restaurant.image)}" alt="${escapeHtml(restaurant.name)}" loading="lazy">`
    : `<div class="card__placeholder" aria-hidden="true">${restaurant.emoji}</div>
       <span class="card__photo-note">Photo coming soon</span>`;

  const sampleNote = restaurant.verified
    ? ""
    : `<p class="card__sample">Sample info, not verified yet</p>`;

  return `
    <article class="card">
      <div class="card__photo" style="--tone: ${restaurant.tone}">
        ${photo}
        <div class="price-tag">
          <span class="price-tag__from">From</span>
          <span class="price-tag__amount">${formatPrice(startingPrice(restaurant))}</span>
        </div>
      </div>
      <div class="card__body">
        <h3 class="card__name">${escapeHtml(restaurant.name)}</h3>
        <p class="card__area">📍 ${escapeHtml(restaurant.area)}</p>
        ${sampleNote}
        <button class="btn" type="button" data-menu="${restaurant.id}">View menu</button>
      </div>
    </article>
  `;
}
function render(list) {
  grid.innerHTML = list.map(cardHtml).join("");
  emptyMessage.hidden = list.length > 0;

  if (list.length === 0) {
    resultCount.textContent = "";
  } else if (list.length === 1) {
    resultCount.textContent = "1 restaurant";
  } else {
    resultCount.textContent = list.length + " restaurants";
  }
}


/* ---------- 4. SEARCH + FILTERS ---------- */
const searchInput = document.getElementById("search-input");
const chips = document.querySelectorAll(".chip");

const filters = {
  all: () => true,
  budget: restaurant => startingPrice(restaurant) <= 1500,
  traditional: restaurant => restaurant.tags.includes("traditional"),
  chicken: restaurant => restaurant.tags.includes("chicken")
};

let activeFilter = "all";

function matchesSearch(restaurant, query) {
  if (!query) return true;
  const searchable = [
    restaurant.name,
    restaurant.area,
    ...restaurant.dishes.map(dish => dish.name)
  ].join(" ");
  return normalize(searchable).includes(query);
}

function update() {
  const query = normalize(searchInput.value.trim());
  const results = restaurants.filter(
    restaurant => filters[activeFilter](restaurant) && matchesSearch(restaurant, query)
  );
  render(results);
}

searchInput.addEventListener("input", update);

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter;
    chips.forEach(other => {
      const isActive = other === chip;
      other.classList.toggle("is-active", isActive);
      other.setAttribute("aria-pressed", String(isActive));
    });
    update();
  });
});

document.getElementById("reset").addEventListener("click", () => {
  searchInput.value = "";
  chips[0].click();
});

document.getElementById("header-search").addEventListener("click", () => {
  setTimeout(() => searchInput.focus(), 0);
});


/* ---------- 5. MENU POPUP ---------- */
const dialog = document.getElementById("menu-dialog");
const menuTitle = document.getElementById("menu-title");
const menuArea = document.getElementById("menu-area");
const menuList = document.getElementById("menu-list");
const menuNote = document.getElementById("menu-note");

function openMenu(id) {
  const restaurant = restaurants.find(item => item.id === id);
  if (!restaurant) return;

  menuTitle.textContent = restaurant.name;
  menuArea.textContent = "📍 " + restaurant.area;

  menuList.innerHTML = restaurant.dishes
    .map(dish => `<li>
        <span>${escapeHtml(dish.name)}</span>
        <span class="menu-list__price">${formatPrice(dish.price)}</span>
      </li>`)
    .join("");

  menuNote.hidden = restaurant.verified;
  menuNote.textContent = "Sample menu. Dishes and prices are placeholders until we verify them.";

  dialog.showModal();
}

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-menu]");
  if (button) openMenu(button.dataset.menu);
});

document.getElementById("menu-close").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});


/* ---------- START ---------- */
update();