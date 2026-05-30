const STORAGE_KEY = "panini_control_visual_v1";

const CONFIG = [
  { code: "GHA", name: "Ghana", total: 20 },
  { code: "ARG", name: "Argentina", total: 20 },
  { code: "BRA", name: "Brasil", total: 20 },
  { code: "ENG", name: "Inglaterra", total: 20 },
  { code: "FRA", name: "Francia", total: 20 },
  { code: "ESP", name: "España", total: 20 },
  { code: "GER", name: "Alemania", total: 20 },
  { code: "POR", name: "Portugal", total: 20 },
  { code: "CRO", name: "Croacia", total: 20 },
  { code: "PAN", name: "Panamá", total: 20 },

  { code: "FWC", name: "FIFA World Cup", total: 20 },
  { code: "COC", name: "Coca-Cola", total: 20 },
  { code: "ST", name: "Stadiums", total: 20 },
  { code: "LEG", name: "Legends", total: 20 }
];

let album = cargarAlbum();

function crearAlbum() {
  const data = {};

  CONFIG.forEach(section => {
    for (let i = 1; i <= section.total; i++) {
      const codigo = `${section.code}${i}`;
      data[codigo] = {
        codigo,
        section: section.code,
        tengo: false,
        repetidas: 0
      };
    }
  });

  return data;
}

function cargarAlbum() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  return crearAlbum();
}

function guardar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(album));
}

function render() {
  const container = document.getElementById("album");
  const search = document.getElementById("buscador").value.toUpperCase().trim();
  const filtro = document.getElementById("filtro").value;

  container.innerHTML = "";

  CONFIG.forEach(section => {
    const stickers = Object.values(album).filter(s => {
      const matchSection = s.section === section.code;
      const matchSearch =
        !search ||
        s.codigo.includes(search) ||
        section.name.toUpperCase().includes(search);

      const matchFiltro =
        filtro === "todos" ||
        (filtro === "tengo" && s.tengo) ||
        (filtro === "faltan" && !s.tengo) ||
        (filtro === "repetidas" && s.repetidas > 0);

      return matchSection && matchSearch && matchFiltro;
    });

    if (stickers.length === 0) return;

    const tengoSection = Object.values(album)
      .filter(s => s.section === section.code && s.tengo).length;

    const team = document.createElement("div");
    team.className = "team";

    team.innerHTML = `
      <div class="team-header">
        <h2>${section.name}</h2>
        <span>${tengoSection}/${section.total}</span>
      </div>
      <div class="grid"></div>
    `;

    const grid = team.querySelector(".grid");

    stickers.forEach(sticker => {
      const card = document.createElement("div");
      card.className =
        "sticker " +
        (sticker.tengo ? "tengo " : "") +
        (sticker.repetidas > 0 ? "repetida" : "");

      card.innerHTML = `
        <div class="code">${sticker.codigo}</div>

        <button class="check" onclick="toggleTengo('${sticker.codigo}')">
          ${sticker.tengo ? "✓" : ""}
        </button>

        <div class="rep-controls">
          <button onclick="bajarRep('${sticker.codigo}')">−</button>
          <span>${sticker.repetidas}</span>
          <button onclick="subirRep('${sticker.codigo}')">+</button>
        </div>
      `;

      grid.appendChild(card);
    });

    container.appendChild(team);
  });

  actualizarStats();
}

function toggleTengo(codigo) {
  album[codigo].tengo = !album[codigo].tengo;

  if (!album[codigo].tengo) {
    album[codigo].repetidas = 0;
  }

  guardar();
  render();
}

function subirRep(codigo) {
  album[codigo].tengo = true;
  album[codigo].repetidas++;
  guardar();
  render();
}

function bajarRep(codigo) {
  if (album[codigo].repetidas > 0) {
    album[codigo].repetidas--;
  }

  guardar();
  render();
}

function actualizarStats() {
  const stickers = Object.values(album);
  const total = stickers.length;
  const tengo = stickers.filter(s => s.tengo).length;
  const repetidas = stickers.reduce((sum, s) => sum + s.repetidas, 0);
  const faltan = total - tengo;
  const porcentaje = total === 0 ? 0 : ((tengo / total) * 100).toFixed(1);

  document.getElementById("totalTengo").textContent = tengo;
  document.getElementById("totalFaltan").textContent = faltan;
  document.getElementById("totalRepetidas").textContent = repetidas;
  document.getElementById("porcentaje").textContent = porcentaje + "%";
  document.getElementById("progressBar").style.width = porcentaje + "%";
}

function copiarFaltantes() {
  const faltantes = Object.values(album)
    .filter(s => !s.tengo)
    .map(s => s.codigo)
    .join(", ");

  navigator.clipboard.writeText("Me faltan: " + faltantes);
  alert("Faltantes copiados");
}

function copiarRepetidas() {
  const repetidas = Object.values(album)
    .filter(s => s.repetidas > 0)
    .map(s => `${s.codigo} x${s.repetidas}`)
    .join(", ");

  navigator.clipboard.writeText("Tengo repetidas: " + repetidas);
  alert("Repetidas copiadas");
}

function reiniciar() {
  if (!confirm("¿Seguro que quieres reiniciar todo?")) return;

  localStorage.removeItem(STORAGE_KEY);
  album = crearAlbum();
  render();
}

document.getElementById("buscador").addEventListener("input", render);
document.getElementById("filtro").addEventListener("change", render);

render();