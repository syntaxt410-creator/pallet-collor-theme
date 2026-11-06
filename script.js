// Daftar 65 Kode Warna Hex Lengkap
const colorList = [
  "#FF5CAB", "#0080FF", "#5B0015", "#10BBC3", "#068187", "#FAF7F2",
  "#00F0FF", "#39FF14", "#0080FF", "#FEA24F", "#051A2D", "#C6B39A",
  "#BC6CFF", "#8000FF", "#FF206E", "#A60E35", "#FFE3B3", "#BD3A3C",
  "#FFB86B", "#00FFFF", "#222222", "#030712", "#F88F22", "#3B1319",
  "#0B0F2B", "#FF0080", "#FBFF12", "#11012E", "#FBB931", "#7B694E",
  "#000000", "#30C0B7", "#41E4D4", "#2D0C62", "#EA6113", "#2B0B0F",
  "#7F3AED", "#498099", "#FF0022", "#FF018F", "#9A8472", "#F5EFC6",
  "#C6FF34", "#EE227D", "#121212", "#FFCC00", "#C8B39A", "#4D0E12",
  "#FC2B30", "#FD8083", "#FFD000", "#E9ECEF", "#E0D1B8", "#231815",
  "#DA0090", "#852467", "#FFFFFF", "#212529", "#EFE3CE", "#25344F",
  "#12003E", "#3B0855", "#FB5607", "#8338EC", "#F6F0E6"
];

// Set untuk menyimpan index warna yang dicentang
const selectedIndexes = new Set();

// Elemen DOM
const paletteGrid = document.getElementById("paletteGrid");
const selectionBar = document.getElementById("selectionBar");
const selectedCount = document.getElementById("selectedCount");
const btnCopyImage = document.getElementById("btnCopyImage");
const btnDownloadImage = document.getElementById("btnDownloadImage");
const btnClearSelection = document.getElementById("btnClearSelection");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");
const toastDot = document.getElementById("toastDot");

let toastTimer = null;

// Fungsi Menghitung RGB dari HEX
function hexToRgb(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map(char => char + char).join("");
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Menampilkan Toast
function showToast(message, colorHex = "#00f0ff") {
  if (toastTimer) clearTimeout(toastTimer);
  toastMsg.textContent = message;
  toastDot.style.background = colorHex;
  toastDot.style.color = colorHex;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// Fungsi Salin Teks
function copyText(text, hexColor) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${text} berhasil disalin!`, hexColor);
  }).catch(() => {
    showToast(`Gagal menyalin kode`, hexColor);
  });
}

// Update Tampilan Toolbar Seleksi
function updateSelectionBar() {
  const count = selectedIndexes.size;
  selectedCount.textContent = count;
  if (count > 0) {
    selectionBar.classList.add("show");
  } else {
    selectionBar.classList.remove("show");
  }
}

// Generate Gambar dari Pilihan Warna menggunakan Canvas Murni
function generatePaletteCanvas() {
  const selectedList = Array.from(selectedIndexes).map(i => colorList[i]);
  if (selectedList.length === 0) return null;

  const count = selectedList.length;
  const swatchWidth = 140;
  const swatchHeight = 120;
  const padding = 24;
  const gap = 16;
  const cols = Math.min(count, 5);
  const rows = Math.ceil(count / cols);

  const canvas = document.createElement("canvas");
  canvas.width = padding * 2 + cols * swatchWidth + (cols - 1) * gap;
  canvas.height = padding * 2 + rows * (swatchHeight + 35) + (rows - 1) * gap;

  const ctx = canvas.getContext("2d");

  // Latar belakang canvas gelap elegan
  ctx.fillStyle = "#0c0e14";
  ctx.roundRect(0, 0, canvas.width, canvas.height, 16);
  ctx.fill();

  // Render masing-masing swatch warna
  selectedList.forEach((hex, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = padding + col * (swatchWidth + gap);
    const y = padding + row * (swatchHeight + 35 + gap);

    // Kotak warna
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.roundRect(x, y, swatchWidth, swatchHeight, 10);
    ctx.fill();

    // Border halus swatch
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label Kode HEX
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(hex.toUpperCase(), x + swatchWidth / 2, y + swatchHeight + 22);
  });

  return canvas;
}

// Salin Gambar ke Clipboard
btnCopyImage.addEventListener("click", () => {
  const canvas = generatePaletteCanvas();
  if (!canvas) return;

  canvas.toBlob((blob) => {
    if (!blob) {
      showToast("Gagal memproses gambar");
      return;
    }
    // API ClipboardItem untuk format PNG
    if (navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]).then(() => {
        showToast("Gambar swatch warna berhasil disalin ke clipboard!");
      }).catch(() => {
        // Fallback jika browser membatasi izin clipboard gambar
        downloadCanvasImage(canvas);
        showToast("Clipboard gambar dibatasi, gambar otomatis diunduh!");
      });
    } else {
      downloadCanvasImage(canvas);
    }
  });
});

// Download Canvas PNG
function downloadCanvasImage(canvas) {
  const link = document.createElement("a");
  link.download = `color-palette-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

btnDownloadImage.addEventListener("click", () => {
  const canvas = generatePaletteCanvas();
  if (canvas) {
    downloadCanvasImage(canvas);
    showToast("Gambar palet warna berhasil diunduh!");
  }
});

// Batalkan Semua Pilihan
btnClearSelection.addEventListener("click", () => {
  selectedIndexes.clear();
  document.querySelectorAll(".color-card.selected").forEach(card => {
    card.classList.remove("selected");
  });
  updateSelectionBar();
});

// Render Kartu ke Grid
function renderPalette() {
  paletteGrid.innerHTML = "";

  colorList.forEach((hex, index) => {
    const { r, g, b } = hexToRgb(hex);
    const rgbString = `rgb(${r}, ${g}, ${b})`;

    const card = document.createElement("div");
    card.className = "color-card";
    card.dataset.index = index;

    card.innerHTML = `
      <div class="swatch-display" style="background-color: ${hex};">
        <button class="check-toggle" title="Pilih warna untuk disalin gambarnya" aria-label="Pilih swatch">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>

      <div class="color-details">
        <button class="btn-code-hex" style="color: ${hex};" title="Klik untuk menyalin HEX">
          ${hex.toUpperCase()}
        </button>
        <span class="color-rgb">${rgbString}</span>
        <button class="btn-copy-bar" title="Klik untuk menyalin HEX">
          <svg viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          Salin
        </button>
      </div>
    `;

    // 1. Aksi Tombol Centang Checklist
    const checkBtn = card.querySelector(".check-toggle");
    checkBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Mencegah klik menyebar
      if (selectedIndexes.has(index)) {
        selectedIndexes.delete(index);
        card.classList.remove("selected");
      } else {
        selectedIndexes.add(index);
        card.classList.add("selected");
      }
      updateSelectionBar();
    });

    // 2. Aksi Klik Khusus Tombol Kode HEX
    const hexBtn = card.querySelector(".btn-code-hex");
    hexBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      copyText(hex.toUpperCase(), hex);
    });

    // 3. Aksi Klik Khusus Tombol "Salin"
    const copyBarBtn = card.querySelector(".btn-copy-bar");
    copyBarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      copyText(hex.toUpperCase(), hex);
    });

    paletteGrid.appendChild(card);
  });
}

// Inisialisasi awal
document.addEventListener("DOMContentLoaded", renderPalette);
