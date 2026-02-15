const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => observer.observe(el));

const menuBtn = document.querySelector(".menu-toggle");
const nav = document.getElementById("navMenu");

menuBtn?.addEventListener("click", () => {
  const expanded = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!expanded));
  nav?.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    menuBtn?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("open");
  });
});

const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const rateDate = document.getElementById("rateDate");

const formatDateForDisplay = (dateObj) => {
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear());
  return `${day}-${month}-${year}`;
};

const setFallbackRateDate = () => {
  const today = new Date();
  rateDate.textContent = `Rate board date: ${formatDateForDisplay(today)}`;
};

if (rateDate) {
  setFallbackRateDate();
}

const rateMap = [
  ["giridih", "chota", "rate-giridih-chota"],
  ["giridih", "mota", "rate-giridih-mota"],
  ["giridih", "chicks", "rate-giridih-chicks"],
  ["deoghar", "chota", "rate-deoghar-chota"],
  ["deoghar", "mota", "rate-deoghar-mota"],
  ["deoghar", "chicks", "rate-deoghar-chicks"],
  ["barhi", "chota", "rate-barhi-chota"],
  ["barhi", "mota", "rate-barhi-mota"],
  ["barhi", "chicks", "rate-barhi-chicks"],
  ["chatra", "chota", "rate-chatra-chota"],
  ["chatra", "mota", "rate-chatra-mota"],
  ["chatra", "chicks", "rate-chatra-chicks"],
  ["jamua", "chota", "rate-jamua-chota"],
  ["jamua", "mota", "rate-jamua-mota"],
  ["jamua", "chicks", "rate-jamua-chicks"]
];

const applyRatesToPage = (data) => {
  if (!data) return;

  if (rateDate && data.rate_board_date) {
    const parsedDate = new Date(data.rate_board_date);
    if (!Number.isNaN(parsedDate.getTime())) {
      rateDate.textContent = `Rate board date: ${formatDateForDisplay(parsedDate)}`;
    }
  }

  rateMap.forEach(([office, type, elementId]) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const officeData = data?.offices?.[office];
    if (!officeData) return;
    const key = type === "chota"
      ? "chota_per_kg"
      : type === "mota"
        ? "mota_per_kg"
        : "chicks_per_piece";
    if (officeData[key]) {
      el.textContent = officeData[key];
    }
  });
};

const ratesApiUrl = window.AKELA_CONFIG?.ratesApiUrl || "";

const isValidRatesPayload = (data) => {
  if (!data || typeof data !== "object") return false;
  if (!data.offices || typeof data.offices !== "object") return false;
  return ["giridih", "deoghar", "barhi", "chatra", "jamua"]
    .every((office) => typeof data.offices[office] === "object");
};

const fetchJsonWithTimeout = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

const loadRates = async () => {
  if (ratesApiUrl) {
    try {
      const apiResponse = await fetchJsonWithTimeout(`${ratesApiUrl}?t=${Date.now()}`);
      const apiData = apiResponse?.data || apiResponse;
      if (isValidRatesPayload(apiData)) {
        applyRatesToPage(apiData);
        return;
      }
    } catch {
      // Continue to local JSON fallback when API is unavailable.
    }
  }

  try {
    const jsonData = await fetchJsonWithTimeout("rates.json");
    if (isValidRatesPayload(jsonData)) {
      applyRatesToPage(jsonData);
    }
  } catch {
    // Keep hardcoded fallback values when remote and local JSON cannot be loaded.
  }
};

loadRates();

if (contactForm && formNote) {
  contactForm.addEventListener("submit", () => {
    formNote.textContent = "Submitting your enquiry...";
  });
}

const productsToggle = document.getElementById("productsToggle");
const productsCards = document.getElementById("productsCards");

if (productsToggle && productsCards) {
  productsToggle.addEventListener("click", () => {
    const expanded = productsCards.classList.toggle("expanded");
    productsToggle.setAttribute("aria-expanded", String(expanded));
    productsToggle.textContent = expanded ? "View Less" : "View More";
  });
}




