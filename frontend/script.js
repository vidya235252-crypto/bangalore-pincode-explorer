(() => {
  "use strict";

  const API_BASE = "http://localhost:8000";
  const RECENT_KEY = "bpe_recent_searches";
  const MAX_RECENT = 6;

  const POPULAR_PINCODES = [
    "560001",
    "560034",
    "560038",
    "560066",
    "560100",
    "560102",
  ];

  const els = {
    input: document.getElementById("pincode-input"),
    searchBtn: document.getElementById("search-btn"),
    clearBtn: document.getElementById("clear-btn"),
    hint: document.getElementById("input-hint"),
    resultCards: document.getElementById("result-cards"),
    popularChips: document.getElementById("popular-chips"),
    recentSection: document.getElementById("recent"),
    recentChips: document.getElementById("recent-chips"),
    indexCount: document.getElementById("index-count"),
    states: {
      initial: document.getElementById("state-initial"),
      loading: document.getElementById("state-loading"),
      invalid: document.getElementById("state-invalid"),
      notfound: document.getElementById("state-notfound"),
      servererror: document.getElementById("state-servererror"),
      success: document.getElementById("state-success"),
    },
  };

  function showState(name) {
    Object.entries(els.states).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  function isValidPincodeFormat(value) {
    return /^[0-9]{6}$/.test(value);
  }

  function renderAreaCards(pincode, areas) {
    els.resultCards.innerHTML = "";
    areas.forEach((area) => {
      const card = document.createElement("div");
      card.className = "area-card";
      card.innerHTML = `
        <div class="postmark" aria-hidden="true">
          <span class="pin-label">PIN</span>
          <span class="pin-value">${pincode}</span>
        </div>
        <div class="details">
          <p class="area-name">${escapeHtml(area.name)}</p>
          <p class="area-meta">${escapeHtml(area.district)}, ${escapeHtml(area.state)}</p>
        </div>
        <button class="copy-btn" type="button" data-pincode="${pincode}">Copy</button>
      `;
      els.resultCards.appendChild(card);
    });

    els.resultCards.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard
          .writeText(btn.dataset.pincode)
          .then(() => {
            const original = btn.textContent;
            btn.textContent = "Copied!";
            setTimeout(() => {
              btn.textContent = original;
            }, 1200);
          })
          .catch(() => {});
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function searchPincode(rawValue) {
    const pincode = rawValue.trim();

    if (!isValidPincodeFormat(pincode)) {
      showState("invalid");
      return;
    }

    showState("loading");

    let response;
    try {
      response = await fetch(`${API_BASE}/api/pincodes/${pincode}`);
    } catch (networkError) {
      showState("servererror");
      return;
    }

    if (response.status === 200) {
      const data = await response.json();
      renderAreaCards(data.pincode, data.areas);
      showState("success");
      saveRecentSearch(pincode);
      renderRecentChips();
      return;
    }

    if (response.status === 400) {
      showState("invalid");
      return;
    }

    if (response.status === 404) {
      showState("notfound");
      return;
    }

    showState("servererror");
  }

  function handleSearchClick() {
    searchPincode(els.input.value);
  }

  function handleInputChange() {
    const digitsOnly = els.input.value.replace(/[^0-9]/g, "").slice(0, 6);
    els.input.value = digitsOnly;

    els.clearBtn.hidden = digitsOnly.length === 0;

    if (digitsOnly.length === 0) {
      els.hint.textContent = "";
    } else if (digitsOnly.length < 6) {
      els.hint.textContent = `${digitsOnly.length}/6 digits`;
    } else {
      els.hint.textContent = "Press Enter or Search";
    }
  }

  function handleKeydown(event) {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  }

  function handleClear() {
    els.input.value = "";
    els.hint.textContent = "";
    els.clearBtn.hidden = true;
    els.input.focus();
    showState("initial");
  }

  function getRecentSearches() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveRecentSearch(pincode) {
    try {
      let recents = getRecentSearches().filter((p) => p !== pincode);
      recents.unshift(pincode);
      recents = recents.slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
    } catch (err) {}
  }

  function renderChipRow(container, pincodes) {
    container.innerHTML = "";
    pincodes.forEach((pincode) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = pincode;
      chip.addEventListener("click", () => {
        els.input.value = pincode;
        handleInputChange();
        searchPincode(pincode);
      });
      container.appendChild(chip);
    });
  }

  function renderRecentChips() {
    const recents = getRecentSearches();
    if (recents.length === 0) {
      els.recentSection.hidden = true;
      return;
    }
    els.recentSection.hidden = false;
    renderChipRow(els.recentChips, recents);
  }

  async function loadIndexCount() {
    els.indexCount.textContent = "verified Bangalore pincode dataset";
  }

  function init() {
    renderChipRow(els.popularChips, POPULAR_PINCODES);
    renderRecentChips();
    loadIndexCount();
    showState("initial");

    els.searchBtn.addEventListener("click", handleSearchClick);
    els.input.addEventListener("input", handleInputChange);
    els.input.addEventListener("keydown", handleKeydown);
    els.clearBtn.addEventListener("click", handleClear);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
