// Handles the mobile menu and the light/dark theme toggle.
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector("#primary-nav");
const navLinks = document.querySelectorAll("#primary-nav a");
const themeToggle = document.querySelector("#theme-toggle");
const THEME_KEY = "portfolio-theme";

function setMenuState(isOpen) {
  primaryNav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = !primaryNav.classList.contains("is-open");
    setMenuState(isOpen);
  });

  // Close the menu after a section link is chosen.
  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });
}

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch (error) {
    // localStorage can be blocked in some browsers.
  }
  return "dark";
}

function updateThemeButton(theme) {
  if (!themeToggle) {
    return;
  }

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = themeToggle.querySelector(".theme-toggle-text");

  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", "Switch to " + nextTheme + " mode");

  if (label) {
    label.textContent = isDark ? "Light" : "Dark";
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // The theme still changes for this visit even if saving fails.
  }

  updateThemeButton(theme);
}

applyTheme(getSavedTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  });
}

/* =========================
   PROJECT MODAL
   ========================= */

(function () {
  const modal = document.getElementById("proj-modal");
  const backdrop = modal && modal.querySelector(".proj-modal-backdrop");
  const closeBtn = document.getElementById("proj-modal-close");
  const modalIcon = document.getElementById("modal-icon");
  const modalNum = document.getElementById("modal-num");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalTags = document.getElementById("modal-tags");
  const modalLink = document.getElementById("modal-link");

  // Map card emoji icons (match data-num)
  const icons = { "01": "🐍", "02": "🔢", "03": "📦", "04": "🛠️", "05": "🧠", "06": "📚" };

  function openModal(card) {
    const num = card.dataset.num || "";
    const title = card.dataset.title || "";
    const desc = card.dataset.desc || "";
    const tags = (card.dataset.tags || "").split(",").map(t => t.trim()).filter(Boolean);
    const url = card.dataset.url || "#";

    modalIcon.textContent = icons[num] || "📁";
    modalNum.textContent = "Project " + num;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalLink.href = url;

    // Rebuild tag pills
    modalTags.innerHTML = "";
    tags.forEach(tag => {
      const span = document.createElement("span");
      span.textContent = tag;
      modalTags.appendChild(span);
    });

    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";

    // Reset animation so it plays every time
    const box = modal.querySelector(".proj-modal-box");
    box.style.animation = "none";
    box.offsetHeight; // reflow
    box.style.animation = "";

    // Focus the close button for accessibility
    closeBtn.focus();
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  if (!modal) return;

  // Open when clicking a card or its CTA button
  document.querySelectorAll(".proj-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Don't re-open if they clicked a real link somehow
      if (e.target.tagName === "A") return;
      openModal(card);
    });

    // Also handle Enter/Space on the card for keyboard users
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // Close on X button
  closeBtn.addEventListener("click", closeModal);

  // Close on backdrop click
  if (backdrop) backdrop.addEventListener("click", closeModal);

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) closeModal();
  });
})();

/* =========================
   SKILLS FILTER
   ========================= */

(function () {
  const searchInput = document.getElementById("skills-search");
  const chips = document.querySelectorAll(".chip[data-filter]");
  const cards = document.querySelectorAll(".skill-card[data-tags]");
  const noResults = document.getElementById("skills-no-results");

  if (!searchInput || !chips.length || !cards.length) return;

  let activeFilter = "all";

  function applyFilter() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const tags = card.dataset.tags || "";
      const text = card.textContent.toLowerCase();

      const matchesChip = activeFilter === "all" || tags.includes(activeFilter);
      const matchesSearch = !query || text.includes(query) || tags.includes(query);

      const visible = matchesChip && matchesSearch;

      // Toggle visibility
      card.removeAttribute("hidden");
      card.classList.remove("filter-visible");

      if (visible) {
        visibleCount++;
        // Re-trigger animation
        requestAnimationFrame(() => card.classList.add("filter-visible"));
      } else {
        card.setAttribute("hidden", "");
      }
    });

    if (noResults) {
      noResults.hidden = visibleCount > 0;
    }
  }

  // Chip click handler
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      activeFilter = chip.dataset.filter;
      applyFilter();
    });
  });

  // Search input handler (debounced slightly for smoothness)
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilter, 120);
  });
})();

/* =========================
   AI CHATBOT
   ========================= */

const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");
const chatStatus = document.querySelector("#chat-status");
const chatSend = document.querySelector("#chat-send");
const vedThinking = document.querySelector("#ved-thinking");

function showThinking() {
  if (!vedThinking) return;
  vedThinking.removeAttribute("hidden");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideThinking() {
  if (!vedThinking) return;
  vedThinking.setAttribute("hidden", "");
}

function addChatMessage(message, sender) {
  const messageElement = document.createElement("p");

  messageElement.classList.add("chat-message");
  messageElement.classList.add(
    sender === "user" ? "user-message" : "assistant-message"
  );

  // textContent displays text safely instead of interpreting HTML.
  messageElement.textContent = message;

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (
  chatForm &&
  chatInput &&
  chatMessages &&
  chatStatus &&
  chatSend
) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userMessage = chatInput.value.trim();

    if (!userMessage) {
      chatStatus.textContent = "Please enter a message.";
      return;
    }

    addChatMessage(userMessage, "user");
    chatInput.value = "";
    chatSend.disabled = true;
    chatStatus.textContent = "Ved is thinking…";
    showThinking();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "The AI service is unavailable."
        );
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The AI returned an empty response.");
      }

      addChatMessage(data.reply, "assistant");
      chatStatus.textContent = "Ved is ready";
    } catch (error) {
      addChatMessage(
        error.message || "Something went wrong. Please try again.",
        "assistant"
      );

      chatStatus.textContent =
        "Message failed. Please try again.";
    } finally {
      hideThinking();
      chatSend.disabled = false;
      chatInput.focus();
    }
  });
}
