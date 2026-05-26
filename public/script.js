
const JWT_TOKEN_KEY = "dsa_jwt_token";
let currentUser = null;

async function initApp() {
  // Check if user has valid token
  const token = localStorage.getItem(JWT_TOKEN_KEY);
  
  if (token) {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        handleAuthState(true);
        return;
      } else {
        localStorage.removeItem(JWT_TOKEN_KEY);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem(JWT_TOKEN_KEY);
    }
  }
  
  // Not authenticated
  handleAuthState(false);
}

function handleAuthState(isAuthenticated) {
  const landingPage = document.getElementById("landing-page");
  const appContainer = document.getElementById("app-container");
  const userBtnContainer = document.getElementById("user-button-container");

  if (isAuthenticated && currentUser) {
    // --- AUTHENTICATED ---
    if (landingPage) landingPage.style.display = "none";
    if (appContainer) appContainer.style.display = "flex";

    // Show user info and logout button in chat header
    if (userBtnContainer) {
      const userName = currentUser.firstName || currentUser.email;
      userBtnContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="color: var(--text-secondary); font-size: 0.9rem;">${userName}</span>
          <button id="logout-btn" class="btn btn-ghost btn-sm">Logout</button>
        </div>
      `;
      document.getElementById("logout-btn").addEventListener("click", logout);
    }

    // Focus chat input
    setTimeout(() => {
      const input = document.getElementById("userInput");
      if (input) input.focus();
    }, 200);
  } else {
    // --- UNAUTHENTICATED ---
    if (appContainer) appContainer.style.display = "none";
    if (landingPage) landingPage.style.display = "block";

    // Inject nav auth buttons
    const navAuthButtons = document.getElementById("nav-auth-buttons");
    if (navAuthButtons) {
      navAuthButtons.innerHTML = `
        <button class="btn btn-ghost btn-sm" id="nav-signin-btn">Sign In</button>
        <button class="btn btn-primary btn-sm" id="nav-signup-btn">Get Started</button>
      `;
    }

    bindAuthButtons();
    runLandingAnimations();
    startTerminalAnimation();
    initScrollAnimations();
  }
}


function bindAuthButtons() {
  const signInBtns = [
    document.getElementById("nav-signin-btn"),
  ];
  const signUpBtns = [
    document.getElementById("nav-signup-btn"),
    document.getElementById("hero-signup-btn"),
    document.getElementById("cta-signup-btn"),
  ];

  signInBtns.forEach((btn) => {
    if (btn) btn.addEventListener("click", () => openAuthModal("signin"));
  });

  signUpBtns.forEach((btn) => {
    if (btn) btn.addEventListener("click", () => openAuthModal("signup"));
  });
}

function openAuthModal(mode) {
  const overlay = document.getElementById("clerk-overlay");
  const mountPoint = document.getElementById("clerk-mount-point");

  overlay.style.display = "flex";

  if (mode === "signin") {
    mountPoint.innerHTML = `
      <div class="auth-modal signin-modal">
        <div class="auth-header">
          <h2>Sign In</h2>
          <button class="close-btn" onclick="closeAuthModal()">✕</button>
        </div>
        <form id="signin-form" class="auth-form">
          <div class="form-group">
            <label for="signin-email">Email</label>
            <input type="email" id="signin-email" placeholder="your@email.com" required />
          </div>
          <div class="form-group">
            <label for="signin-password">Password</label>
            <input type="password" id="signin-password" placeholder="••••••" required />
          </div>
          <button type="submit" class="btn btn-primary btn-full">Sign In</button>
          <p class="auth-switch">Don't have an account? <a href="#" onclick="switchAuthMode('signup')">Sign Up</a></p>
        </form>
      </div>
    `;
    document.getElementById("signin-form").addEventListener("submit", handleSignIn);
  } else {
    mountPoint.innerHTML = `
      <div class="auth-modal signup-modal">
        <div class="auth-header">
          <h2>Create Account</h2>
          <button class="close-btn" onclick="closeAuthModal()">✕</button>
        </div>
        <form id="signup-form" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="signup-firstname">First Name</label>
              <input type="text" id="signup-firstname" placeholder="John" />
            </div>
            <div class="form-group">
              <label for="signup-lastname">Last Name</label>
              <input type="text" id="signup-lastname" placeholder="Doe" />
            </div>
          </div>
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input type="email" id="signup-email" placeholder="your@email.com" required />
          </div>
          <div class="form-group">
            <label for="signup-password">Password</label>
            <input type="password" id="signup-password" placeholder="••••••" required />
          </div>
          <div class="form-group">
            <label for="signup-confirm">Confirm Password</label>
            <input type="password" id="signup-confirm" placeholder="••••••" required />
          </div>
          <button type="submit" class="btn btn-primary btn-full">Create Account</button>
          <p class="auth-switch">Already have an account? <a href="#" onclick="switchAuthMode('signin')">Sign In</a></p>
        </form>
      </div>
    `;
    document.getElementById("signup-form").addEventListener("submit", handleSignUp);
  }

  // Close on overlay click
  const overlayBg = document.getElementById("clerk-overlay-bg");
  overlayBg.addEventListener("click", closeAuthModal);
}

function switchAuthMode(mode) {
  openAuthModal(mode);
}

async function handleSignIn(e) {
  e.preventDefault();
  
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem(JWT_TOKEN_KEY, data.token);
      currentUser = data.user;
      closeAuthModal();
      handleAuthState(true);
    } else {
      alert(data.error || "Sign in failed");
    }
  } catch (error) {
    console.error("Sign in error:", error);
    alert("Failed to sign in. Please try again.");
  }
}

async function handleSignUp(e) {
  e.preventDefault();
  
  const firstName = document.getElementById("signup-firstname").value;
  const lastName = document.getElementById("signup-lastname").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm").value;

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem(JWT_TOKEN_KEY, data.token);
      currentUser = data.user;
      closeAuthModal();
      handleAuthState(true);
    } else {
      alert(data.error || "Sign up failed");
    }
  } catch (error) {
    console.error("Sign up error:", error);
    alert("Failed to create account. Please try again.");
  }
}

function closeAuthModal() {
  const overlay = document.getElementById("clerk-overlay");
  const mountPoint = document.getElementById("clerk-mount-point");
  overlay.style.display = "none";
  mountPoint.innerHTML = "";
}

function logout() {
  localStorage.removeItem(JWT_TOKEN_KEY);
  currentUser = null;
  handleAuthState(false);
}

function runLandingAnimations() {
  if (typeof gsap === "undefined") {
    console.warn("GSAP is not loaded. Showing elements immediately.");
    const selectors = [
      "#hero-title",
      "#hero-subtitle",
      "#hero-actions",
      "#hero-stats",
      "#hero-terminal"
    ];
    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.opacity = "1";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.fromTo(
    "#hero-title",
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8 }
  )
    .fromTo(
      "#hero-subtitle",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7 },
      "-=0.4"
    )
    .fromTo(
      "#hero-actions",
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.3"
    )
    .fromTo(
      "#hero-stats",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.2"
    )
    .fromTo(
      "#hero-terminal",
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      "-=0.3"
    );
}

// ===================================================
// 5. SCROLL-TRIGGERED ANIMATIONS
// ===================================================
function initScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    // Show elements immediately if GSAP / ScrollTrigger is not available
    const selectors = [
      "#features-tag", "#features-title", "#features-subtitle", ".feature-card",
      "#hiw-tag", "#hiw-title", ".step-card",
      "#cta-box"
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.opacity = "1";
      });
    });
    return;
  }

  // Features Section
  gsap.fromTo(
    "#features-tag",
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      scrollTrigger: { trigger: "#features", start: "top 80%" },
    }
  );

  gsap.fromTo(
    "#features-title",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: 0.1,
      scrollTrigger: { trigger: "#features", start: "top 80%" },
    }
  );

  gsap.fromTo(
    "#features-subtitle",
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.2,
      scrollTrigger: { trigger: "#features", start: "top 80%" },
    }
  );

  gsap.fromTo(
    ".feature-card",
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: { trigger: "#features-grid", start: "top 85%" },
    }
  );

  // How It Works Section
  gsap.fromTo(
    "#hiw-tag, #hiw-title",
    { opacity: 0, y: 25 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: { trigger: "#how-it-works", start: "top 80%" },
    }
  );

  gsap.fromTo(
    ".step-card",
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: { trigger: "#steps-grid", start: "top 85%" },
    }
  );

  // CTA Section
  gsap.fromTo(
    "#cta-box",
    { opacity: 0, y: 40, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      scrollTrigger: { trigger: "#cta-section", start: "top 80%" },
    }
  );
}

// ===================================================
// 6. TERMINAL TYPEWRITER ANIMATION
// ===================================================
function startTerminalAnimation() {
  const userText = "Explain binary search tree insertion with code";
  const botText =
    "A Binary Search Tree (BST) insertion places nodes following the rule: left < parent < right. Starting from the root, we compare the value and recursively traverse left or right until we find an empty spot...";

  const userEl = document.getElementById("terminal-user-text");
  const botEl = document.getElementById("terminal-bot-text");
  const botLine = document.getElementById("terminal-bot-line");
  const cursor = document.querySelector(".terminal-cursor");

  if (!userEl || !botEl) return;

  userEl.textContent = "";
  botEl.textContent = "";

  let i = 0;

  function typeUser() {
    if (i < userText.length) {
      userEl.textContent += userText[i];
      i++;
      setTimeout(typeUser, 35 + Math.random() * 25);
    } else {
      // Hide cursor, show bot response
      if (cursor) cursor.style.display = "none";
      setTimeout(() => {
        botLine.style.opacity = "1";
        let j = 0;
        function typeBot() {
          if (j < botText.length) {
            botEl.textContent += botText[j];
            j++;
            setTimeout(typeBot, 15 + Math.random() * 10);
          }
        }
        typeBot();
      }, 600);
    }
  }

  // Start after hero animations
  setTimeout(typeUser, 1800);
}

// ===================================================
// 7. NAV SCROLL EFFECT
// ===================================================
window.addEventListener("scroll", () => {
  const nav = document.getElementById("nav");
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }
});

// ===================================================
// 8. CHAT LOGIC (Existing, preserved)
// ===================================================
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const sendBtn = document.getElementById("sendBtn");

if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";
    sendBtn.disabled = true;

    showTypingIndicator();

    try {
      const token = localStorage.getItem(JWT_TOKEN_KEY);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message }),
      });

    const data = await response.json();

      removeTypingIndicator();

      if (response.ok) {
        addMessage(data.reply, "bot");
      } else {
        addMessage(
          data.error || "Sorry, I encountered an error. Please try again.",
          "bot"
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);
      removeTypingIndicator();
      addMessage(
        "Sorry, I'm unable to connect. Please check your connection.",
        "bot"
      );
    } finally {
      sendBtn.disabled = false;
      userInput.focus();
    }
  });
}

function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.innerHTML = formatText(text);

  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function formatText(text) {
  let f = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  f = f.replace(
    /```([\s\S]*?)```/g,
    "<pre style='background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;overflow-x:auto;margin:8px 0;'><code>$1</code></pre>"
  );
  f = f.replace(
    /`([^`]+)`/g,
    "<code style='background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-size:0.85em;'>$1</code>"
  );
  f = f.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  f = f.replace(/\*(.*?)\*/g, "<em>$1</em>");
  f = f.replace(/\n/g, "<br>");

  return f;
}

function showTypingIndicator() {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot-message";
  messageDiv.id = "typing-indicator";

  const contentDiv = document.createElement("div");
  contentDiv.className = "typing-indicator";
  contentDiv.innerHTML =
    '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===================================================
// 9. BOOT
// ===================================================
initApp();
