// ---------- helper: redirect with fade animation ----------
function redirectWithAnimation(url) {
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = url;
  }, 500);
}

// ---------- LOGIN PAGE ----------
function initLoginPage() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "admin@cheerio.tech" && password === "admin123") {
      errorBox.textContent = "";
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("role", "admin");
      localStorage.setItem("lastActivity", Date.now().toString());
      redirectWithAnimation("dashboard.html");
    } else {
      errorBox.textContent = "Invalid credentials.";
    }
  });
}

// ---------- DASHBOARD PAGE ----------
function initDashboardPage() {
  const main = document.querySelector(".main");
  if (!main) return;

  // --- dark mode toggle ---
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️";
    }
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  // --- session expiry (15 minutes) ---
  const SESSION_LIMIT = 15 * 60 * 1000;
  function startSessionTimer() {
    localStorage.setItem("lastActivity", Date.now().toString());
  }
  function checkSession() {
    const last = parseInt(localStorage.getItem("lastActivity") || "0", 10);
    if (!last) return;
    if (Date.now() - last > SESSION_LIMIT) {
      alert("Your session has expired. Please login again.");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("role");
      redirectWithAnimation("login.html");
    }
  }
  document.addEventListener("mousemove", startSessionTimer);
  document.addEventListener("keydown", startSessionTimer);
  setInterval(checkSession, 5000);

  // --- logout popup ---
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const logoutConfirm = document.getElementById("logoutConfirm");
  const logoutCancel = document.getElementById("logoutCancel");

  if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener("click", () => {
      logoutModal.style.display = "flex";
    });
  }
  if (logoutCancel) {
    logoutCancel.addEventListener("click", () => {
      logoutModal.style.display = "none";
    });
  }
  if (logoutConfirm) {
    logoutConfirm.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("role");
      logoutModal.style.display = "none";
      redirectWithAnimation("login.html");
    });
  }

  // --- charts (line + donut) ---
  if (typeof Chart !== "undefined") {
    const perfCanvas = document.getElementById("performanceChart");
    if (perfCanvas) {
      const perfCtx = perfCanvas.getContext("2d");
      new Chart(perfCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Delivered",
              data: [65000, 70000, 83000, 92000, 105000, 118000],
              borderWidth: 2,
              tension: 0.3,
              fill: false
            },
            {
              label: "Opened",
              data: [42000, 48000, 61000, 72000, 84000, 95000],
              borderWidth: 2,
              tension: 0.3,
              fill: false
            },
            {
              label: "Sent",
              data: [68000, 72000, 85000, 96000, 108000, 121000],
              borderWidth: 2,
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12 } },
            tooltip: { mode: "index", intersect: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    const channelCanvas = document.getElementById("channelChart");
    if (channelCanvas) {
      const chCtx = channelCanvas.getContext("2d");
      new Chart(chCtx, {
        type: "doughnut",
        data: {
          labels: ["Email", "SMS", "WhatsApp", "Push", "Social"],
          datasets: [
            {
              data: [45, 25, 20, 7, 3],
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }

  // --- message sender + character counter + logs ---
  const messageInput = document.getElementById("messageInput");
  const charCount = document.getElementById("charCount");
  const sendBtn = document.getElementById("sendBtn");
  const logContainer = document.getElementById("logContainer");

  if (messageInput && charCount) {
    messageInput.addEventListener("input", () => {
      charCount.textContent = messageInput.value.length;
    });
  }

  function addLogEntry(text) {
    if (!logContainer) return;
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = text;
    logContainer.prepend(entry);

    // also save in localStorage (simple history)
    const history = JSON.parse(localStorage.getItem("messageHistory") || "[]");
    history.unshift({ text, time: new Date().toLocaleString() });
    localStorage.setItem("messageHistory", JSON.stringify(history.slice(0, 20)));
  }

  function loadHistory() {
    if (!logContainer) return;
    const history = JSON.parse(localStorage.getItem("messageHistory") || "[]");
    history.forEach((item) => {
      const entry = document.createElement("div");
      entry.className = "log-entry";
      entry.textContent = `${item.text}  (${item.time})`;
      logContainer.appendChild(entry);
    });
  }
  loadHistory();

  if (sendBtn && logContainer) {
    sendBtn.addEventListener("click", () => {
      const message = (messageInput.value || "").trim();
      const channels = [
        ...document.querySelectorAll("input[type='checkbox']:checked")
      ].map((c) => c.value);

      if (!message) {
        alert("Message cannot be empty.");
        return;
      }
      if (channels.length === 0) {
        alert("Please select at least one channel.");
        return;
      }

      channels.forEach((channel) => {
        

        setTimeout(() => {
          addLogEntry(`✅ Message sent successfully to ${channel}!`);
        }, 700);
      });

      messageInput.value = "";
      charCount.textContent = "0";
      document.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        cb.checked = false;
      });
    });
  }
}

// ---------- INIT ----------
initLoginPage();
initDashboardPage();
