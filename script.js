/* ---------- 1. DATA ---------
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
      { name: "Brochettes", price: 600, image: "images/brochettes.jpg" },
      { name: "Ndolé with plantain", price: 2000, image: "images/ndole.jpg"},
      { name: "koki", price: 3000, image: "images/koki.jpg" }
    ]
  },
  {
    id: "la force du poulet",
    name: "La Force",
    area: "Yaoundé",
    tags: ["chicken"],
    emoji: "🍗",
    tone: "#f2b5a7",
    image: null,
    verified: false,
    dishes: [
      { name: "Chicken and chips", price: 2000, image: "images/chicken and chips.jpg" },
      { name: "Poulet dj", price: 2500, image: "images/poulet dj.jpg" }
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
      { name: "Koki", price: 1000, image: "images/koki.jpg" },
      { name: "Bobolo and fish", price: 1200, image: "images/bobolo and fish.jpg" },
      { name: "Eru and water fufu", price: 1500, image: "images/eru and water fufu.jpg" }
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
      { name: "Chicken and chips", price: 2500, image: "images/chicken and chips.jpg" },
      { name: "Half roasted chicken", price: 3500, image: "images/half roasted chicken.jpg" }
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
      { name: "Achu", price: 1200, image: "images/achu.jpg" },
      { name: "Poulet braisé", price: 1800, image: "images/poulet braise.jpg" }
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
      { name: "Brochettes", price: 500, image: "images/brochettes.jpg"},
      { name: "Fried plantain and beans", price: 700,image: "images/fried plantain and beans.jpg" },
      { name: "Soya", price: 1000, image: "images/soya.jpg" },
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
  const firstDishPhoto = restaurant.dishes.find(dish => dish.image);
  const photoSrc = restaurant.image || (firstDishPhoto && firstDishPhoto.image);

  const photo = photoSrc
    ? `<img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(restaurant.name)}" loading="lazy">`
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
    .map(dish => `
        <li>
          ${dish.image ? `<img class="menu-list__img" src="${escapeHtml(dish.image)}"
          alt="${escapeHtml(dish.name)}">` : ""}
          <span class="menu-list__name">${escapeHtml(dish.name)}</span>
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