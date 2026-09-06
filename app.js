// ==========================================================================
// MessHub - Frontend Application Logic & Backend API Integration
// ==========================================================================

const API_BASE_URL = "https://mess-feedback-backend-1z0s.onrender.com";

// Application State
let allMenus = [];
let selectedDayFilter = "All";
let selectedStarRating = 0;
let currentUser = null; // { name, regNo, phoneNo, role: 'student'|'admin' }
let activeLoginRole = "student"; // 'student' | 'admin'

// ==================== DOM ELEMENTS ====================
const studentTabBtn = document.getElementById("studentTabBtn");
const adminTabBtn = document.getElementById("adminTabBtn");
const studentView = document.getElementById("studentView");
const adminView = document.getElementById("adminView");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Login Elements
const loginOverlay = document.getElementById("loginOverlay");
const loginSubtitle = document.getElementById("loginSubtitle");
const loginForm = document.getElementById("loginForm");
const roleStudentBtn = document.getElementById("roleStudentBtn");
const roleAdminBtn = document.getElementById("roleAdminBtn");
const studentFieldsGroup = document.getElementById("studentFieldsGroup");
const adminFieldsGroup = document.getElementById("adminFieldsGroup");
const loginNameInput = document.getElementById("loginName");
const loginRegNoInput = document.getElementById("loginRegNo");
const loginPhoneInput = document.getElementById("loginPhone");
const adminPasscode = document.getElementById("adminPasscode");

// User Profile Pill Elements
const userProfilePill = document.getElementById("userProfilePill");
const userAvatar = document.getElementById("userAvatar");
const profileName = document.getElementById("profileName");
const profileSub = document.getElementById("profileSub");
const logoutBtn = document.getElementById("logoutBtn");

// Student View Elements
const dayFilterPills = document.getElementById("dayFilterPills");
const menuListEl = document.getElementById("menuList");
const menuSelectEl = document.getElementById("menuSelect");
const refreshMenuBtn = document.getElementById("refreshMenuBtn");

const feedbackForm = document.getElementById("feedbackForm");
const studentNameInput = document.getElementById("studentName");
const rollNoInput = document.getElementById("rollNo");
const starPicker = document.getElementById("starPicker");
const ratingInput = document.getElementById("rating");
const ratingTextDisplay = document.getElementById("ratingTextDisplay");

const heroMealCount = document.getElementById("heroMealCount");
const heroAvgRating = document.getElementById("heroAvgRating");

// Admin Elements
const menuForm = document.getElementById("menuForm");
const adminMenuListEl = document.getElementById("adminMenuList");
const summaryListEl = document.getElementById("summaryList");
const refreshSummaryBtn = document.getElementById("refreshSummaryBtn");
const adminTotalFeedbacks = document.getElementById("adminTotalFeedbacks");
const adminAvgRating = document.getElementById("adminAvgRating");
const adminTotalMenus = document.getElementById("adminTotalMenus");

// Modal Elements
const commentsModal = document.getElementById("commentsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalMealTitle = document.getElementById("modalMealTitle");
const modalCommentsContainer = document.getElementById("modalCommentsContainer");

// ==================== THEME TOGGLE ====================
themeToggleBtn.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  themeToggleBtn.innerHTML = newTheme === "dark" ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  localStorage.setItem("messhub_theme", newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem("messhub_theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggleBtn.innerHTML = savedTheme === "dark" ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';

// ==================== LOGIN & ROLE SELECTOR ====================
roleStudentBtn.addEventListener("click", () => {
  activeLoginRole = "student";
  roleStudentBtn.classList.add("active");
  roleAdminBtn.classList.remove("active");
  studentFieldsGroup.classList.remove("hidden");
  adminFieldsGroup.classList.add("hidden");
  loginSubtitle.textContent = "Please sign in with your student details to continue";
});

roleAdminBtn.addEventListener("click", () => {
  activeLoginRole = "admin";
  roleAdminBtn.classList.add("active");
  roleStudentBtn.classList.remove("active");
  studentFieldsGroup.classList.add("hidden");
  adminFieldsGroup.classList.remove("hidden");
  loginSubtitle.textContent = "Enter admin security password to access portal";
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (activeLoginRole === "student") {
    const name = loginNameInput.value.trim();
    const regNo = loginRegNoInput.value.trim();
    const phoneNo = loginPhoneInput.value.trim();

    if (!name || !regNo || !phoneNo) {
      showToast("Please fill in Name, Reg No, and Phone Number!", "error");
      return;
    }

    currentUser = { name, regNo, phoneNo, role: "student" };
  } else {
    const pin = adminPasscode.value.trim();
    if (pin !== "admin123" && pin !== "") {
      showToast("Invalid Admin Password! Default is: admin123", "error");
      return;
    }

    currentUser = { name: "System Admin", regNo: "ADMIN", phoneNo: "N/A", role: "admin" };
  }

  localStorage.setItem("messhub_session", JSON.stringify(currentUser));
  loginOverlay.classList.add("hidden");
  showToast(`Welcome back, ${currentUser.name}!`, "success");
  
  applyUserSession();
});

function applyUserSession() {
  if (!currentUser) {
    loginOverlay.classList.remove("hidden");
    userProfilePill.classList.add("hidden");
    studentTabBtn.classList.add("hidden");
    adminTabBtn.classList.add("hidden");
    studentView.classList.add("hidden");
    adminView.classList.add("hidden");
    return;
  }

  loginOverlay.classList.add("hidden");
  userProfilePill.classList.remove("hidden");

  // Populate Header Profile Pill
  userAvatar.textContent = (currentUser.name || "U")[0].toUpperCase();
  profileName.textContent = currentUser.name;
  profileSub.textContent = `${currentUser.role.toUpperCase()}${currentUser.role === 'student' ? ' • ' + currentUser.regNo : ''}`;

  // Strict Role Access Control & Tab Visibility
  if (currentUser.role === "admin") {
    // Admin ONLY access: Show Admin tab & Admin view, HIDE Student tab & Student view
    adminTabBtn.classList.remove("hidden");
    adminTabBtn.classList.add("active");

    studentTabBtn.classList.add("hidden");
    studentTabBtn.classList.remove("active");

    adminView.classList.remove("hidden");
    adminView.classList.add("active");

    studentView.classList.add("hidden");
    studentView.classList.remove("active");

    loadAdminMenuList();
    loadSummary();
  } else {
    // Student ONLY access: Show Student tab & Student view, HIDE Admin tab completely!
    studentTabBtn.classList.remove("hidden");
    studentTabBtn.classList.add("active");

    adminTabBtn.classList.add("hidden");
    adminTabBtn.classList.remove("active");

    studentView.classList.remove("hidden");
    studentView.classList.add("active");

    adminView.classList.add("hidden");
    adminView.classList.remove("active");

    // Auto-fill Student Feedback Form
    studentNameInput.value = currentUser.name;
    rollNoInput.value = currentUser.regNo;
  }
}

// Logout Action
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("messhub_session");
  loginForm.reset();
  loginOverlay.classList.remove("hidden");
  userProfilePill.classList.add("hidden");
  studentTabBtn.classList.add("hidden");
  adminTabBtn.classList.add("hidden");
  studentView.classList.add("hidden");
  adminView.classList.add("hidden");
  showToast("Logged out successfully.", "success");
});

// Check saved session on startup
const savedSession = localStorage.getItem("messhub_session");
if (savedSession) {
  try {
    currentUser = JSON.parse(savedSession);
  } catch (err) {
    currentUser = null;
  }
}

// Tab Click Handlers
studentTabBtn.addEventListener("click", () => {
  if (currentUser && currentUser.role === "student") {
    studentView.classList.remove("hidden");
    studentView.classList.add("active");
    adminView.classList.add("hidden");
  }
});

adminTabBtn.addEventListener("click", () => {
  if (currentUser && currentUser.role === "admin") {
    adminView.classList.remove("hidden");
    adminView.classList.add("active");
    studentView.classList.add("hidden");
    loadAdminMenuList();
    loadSummary();
  }
});

// ==================== TOAST NOTIFICATION UTILITY ====================
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icon = type === "success" 
    ? '<i class="fa-solid fa-circle-check"></i>' 
    : '<i class="fa-solid fa-circle-exclamation"></i>';
    
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== STAR RATING PICKER ====================
const ratingDescriptions = {
  1: "1 Star - Poor 😞",
  2: "2 Stars - Below Average 😐",
  3: "3 Stars - Average 🙂",
  4: "4 Stars - Good Tasty Meal! 😊",
  5: "5 Stars - Excellent / Loved It! 🌟"
};

const starBtns = starPicker.querySelectorAll(".star-btn");

starBtns.forEach((btn) => {
  btn.addEventListener("mouseover", () => {
    const val = parseInt(btn.getAttribute("data-val"));
    highlightStars(val);
  });

  btn.addEventListener("mouseleave", () => {
    highlightStars(selectedStarRating);
  });

  btn.addEventListener("click", () => {
    selectedStarRating = parseInt(btn.getAttribute("data-val"));
    ratingInput.value = selectedStarRating;
    highlightStars(selectedStarRating);
    ratingTextDisplay.textContent = ratingDescriptions[selectedStarRating] || "";
  });
});

function highlightStars(count) {
  starBtns.forEach((b) => {
    const bVal = parseInt(b.getAttribute("data-val"));
    if (bVal <= count) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
}

function resetStarRating() {
  selectedStarRating = 0;
  ratingInput.value = "";
  highlightStars(0);
  ratingTextDisplay.textContent = "Click stars to rate (1 to 5)";
}

// ==================== MEAL ICON HELPER ====================
function getMealBadgeHTML(mealType) {
  const lower = (mealType || "").toLowerCase();
  if (lower.includes("breakfast")) {
    return `<span class="meal-badge meal-breakfast"><i class="fa-solid fa-egg"></i> ${mealType}</span>`;
  } else if (lower.includes("lunch")) {
    return `<span class="meal-badge meal-lunch"><i class="fa-solid fa-bowl-food"></i> ${mealType}</span>`;
  } else if (lower.includes("snack")) {
    return `<span class="meal-badge meal-snacks"><i class="fa-solid fa-mug-hot"></i> ${mealType}</span>`;
  } else {
    return `<span class="meal-badge meal-dinner"><i class="fa-solid fa-utensils"></i> ${mealType}</span>`;
  }
}

// ==================== LOAD MENU (STUDENT VIEW) ====================
async function loadMenu() {
  menuListEl.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      <p>Fetching scheduled menu...</p>
    </div>`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/menu`);
    if (!res.ok) throw new Error("Failed to fetch menu from server");
    
    allMenus = await res.json();
    renderStudentMenu();
    populateMealSelect();
    
    if (heroMealCount) heroMealCount.textContent = allMenus.length;
    if (adminTotalMenus) adminTotalMenus.textContent = allMenus.length;
  } catch (err) {
    menuListEl.innerHTML = `
      <div class="loading-state">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger)"></i>
        <p>Could not load menu. Verify your backend server connection.</p>
      </div>`;
    console.error(err);
  }
}

refreshMenuBtn.addEventListener("click", loadMenu);

// Filter Pills Logic
dayFilterPills.addEventListener("click", (e) => {
  if (e.target.classList.contains("pill-btn")) {
    const dayBtns = dayFilterPills.querySelectorAll(".pill-btn");
    dayBtns.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    selectedDayFilter = e.target.getAttribute("data-day");
    renderStudentMenu();
  }
});

function renderStudentMenu() {
  let filtered = allMenus;
  if (selectedDayFilter !== "All") {
    filtered = allMenus.filter(m => m.day === selectedDayFilter);
  }

  if (!filtered.length) {
    menuListEl.innerHTML = `
      <div class="loading-state">
        <i class="fa-solid fa-calendar-xmark"></i>
        <p>No menu entries found for ${selectedDayFilter === "All" ? "any day" : selectedDayFilter}.</p>
      </div>`;
    return;
  }

  menuListEl.innerHTML = filtered.map((m) => `
    <div class="menu-card-item">
      <div class="menu-card-top">
        <div class="day-badge"><i class="fa-regular fa-calendar"></i> ${m.day}</div>
        ${getMealBadgeHTML(m.mealType)}
      </div>
      <div class="item-tags">
        ${(m.items || []).map(item => `<span class="item-tag">${item}</span>`).join("")}
      </div>
      <div class="card-action-bar">
        <button class="btn-select-meal" onclick="quickSelectMeal('${m._id}')">
          <i class="fa-solid fa-star"></i> Give Feedback
        </button>
      </div>
    </div>
  `).join("");
}

function populateMealSelect() {
  menuSelectEl.innerHTML = '<option value="">-- Choose a scheduled meal --</option>' +
    allMenus.map(m => `<option value="${m._id}">${m.day} - ${m.mealType} (${(m.items || []).slice(0, 2).join(", ")})</option>`).join("");
}

// Quick feedback handler from menu card
window.quickSelectMeal = function(menuId) {
  menuSelectEl.value = menuId;
  const formCard = document.querySelector(".feedback-card");
  if (formCard) {
    formCard.scrollIntoView({ behavior: "smooth" });
    menuSelectEl.focus();
  }
};

// ==================== SUBMIT FEEDBACK ====================
feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const menuId = menuSelectEl.value;
  const studentName = studentNameInput.value.trim();
  const rollNo = rollNoInput.value.trim();
  const rating = ratingInput.value;
  const comment = document.getElementById("comment").value.trim();

  if (!rating) {
    showToast("Please select a star rating (1 to 5)", "error");
    return;
  }

  const submitBtn = feedbackForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';

  try {
    const res = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId, studentName, rollNo, rating: Number(rating), comment }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to submit feedback");
    }

    showToast("Feedback submitted successfully. Thank you!", "success");
    document.getElementById("comment").value = "";
    menuSelectEl.value = "";
    resetStarRating();
    loadSummary(); // refresh background summary
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Feedback';
  }
});

// ==================== ADMIN: ADD MENU ITEM ====================
menuForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const day = document.getElementById("day").value;
  const mealType = document.getElementById("mealType").value;
  const itemsRaw = document.getElementById("items").value;
  const items = itemsRaw.split(",").map((i) => i.trim()).filter(Boolean);

  const submitBtn = menuForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Publishing...';

  try {
    const res = await fetch(`${API_BASE_URL}/api/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, mealType, items }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to add menu entry");
    }

    showToast("New menu entry published!", "success");
    menuForm.reset();
    loadMenu();
    loadAdminMenuList();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Publish Menu Entry';
  }
});

// ==================== ADMIN: MANAGE MENU LIST ====================
async function loadAdminMenuList() {
  adminMenuListEl.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      <p>Loading admin menu list...</p>
    </div>`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/menu`);
    const menus = await res.json();

    if (!menus.length) {
      adminMenuListEl.innerHTML = `
        <div class="loading-state">
          <p>No menu entries added yet.</p>
        </div>`;
      return;
    }

    adminMenuListEl.innerHTML = menus.map(m => `
      <div class="admin-menu-row">
        <div class="admin-menu-info">
          <span class="admin-menu-title">${m.day} - ${m.mealType}</span>
          <span class="admin-menu-sub">${(m.items || []).join(", ")}</span>
        </div>
        <button class="btn-delete" onclick="deleteMenuItem('${m._id}')" title="Delete Menu Entry">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join("");
  } catch (err) {
    adminMenuListEl.innerHTML = `<div class="loading-state"><p>Error loading menu list.</p></div>`;
  }
}

window.deleteMenuItem = async function(id) {
  if (!confirm("Are you sure you want to delete this menu entry?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/menu/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete menu entry");
    
    showToast("Menu entry deleted", "success");
    loadMenu();
    loadAdminMenuList();
    loadSummary();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
};

// ==================== ADMIN: SUMMARY & ANALYTICS ====================
async function loadSummary() {
  summaryListEl.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      <p>Calculating feedback analytics...</p>
    </div>`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/feedback/summary`);
    const summary = await res.json();

    if (!summary.length) {
      summaryListEl.innerHTML = `
        <div class="loading-state">
          <i class="fa-solid fa-chart-pie"></i>
          <p>No student feedback recorded yet.</p>
        </div>`;
      if (adminTotalFeedbacks) adminTotalFeedbacks.textContent = "0";
      if (adminAvgRating) adminAvgRating.textContent = "0.0 / 5";
      if (heroAvgRating) heroAvgRating.textContent = "--";
      return;
    }

    // Compute Overall Stats
    let totalCount = 0;
    let sumRating = 0;

    summary.forEach(s => {
      totalCount += s.totalFeedbacks;
      sumRating += (s.averageRating * s.totalFeedbacks);
    });

    const overallAvg = totalCount > 0 ? (sumRating / totalCount).toFixed(1) : "0.0";

    if (adminTotalFeedbacks) adminTotalFeedbacks.textContent = totalCount;
    if (adminAvgRating) adminAvgRating.textContent = `${overallAvg} / 5`;
    if (heroAvgRating) heroAvgRating.textContent = `${overallAvg}★`;

    summaryListEl.innerHTML = summary.map(s => {
      const fillPercentage = Math.min(100, Math.max(0, (s.averageRating / 5) * 100));
      return `
        <div class="summary-card">
          <div class="summary-top">
            <div>
              <div class="summary-meal-name">${s.day} - ${s.mealType}</div>
              <div class="item-tags" style="margin-top: 4px;">
                ${(s.items || []).map(i => `<span class="item-tag">${i}</span>`).join("")}
              </div>
            </div>
            <div class="summary-rating-pill">
              <i class="fa-solid fa-star"></i> ${s.averageRating}
            </div>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${fillPercentage}%;"></div>
          </div>

          <div class="summary-footer">
            <span><i class="fa-solid fa-users"></i> ${s.totalFeedbacks} Response(s)</span>
            <button class="btn-view-comments" onclick="openCommentsModal('${s.menuId}', '${s.day} ${s.mealType}')">
              <i class="fa-solid fa-comments"></i> View Comments
            </button>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    summaryListEl.innerHTML = `
      <div class="loading-state">
        <p>Could not load feedback summary.</p>
      </div>`;
    console.error(err);
  }
}

refreshSummaryBtn.addEventListener("click", loadSummary);

// ==================== COMMENTS MODAL ====================
window.openCommentsModal = async function(menuId, mealTitle) {
  modalMealTitle.innerHTML = `<i class="fa-solid fa-comments"></i> Feedback for ${mealTitle}`;
  commentsModal.classList.remove("hidden");
  modalCommentsContainer.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      <p>Fetching comments...</p>
    </div>`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/feedback/${menuId}`);
    const feedbacks = await res.json();

    const withComments = (feedbacks || []).filter(f => f.comment && f.comment.trim() !== "");

    if (!withComments.length) {
      modalCommentsContainer.innerHTML = `
        <div class="loading-state">
          <p>No written comments for this meal yet.</p>
        </div>`;
      return;
    }

    modalCommentsContainer.innerHTML = withComments.map(f => `
      <div class="comment-item">
        <div class="comment-meta">
          <span class="comment-student">${f.studentName} (${f.rollNo})</span>
          <span class="summary-rating-pill" style="font-size: 0.75rem;"><i class="fa-solid fa-star"></i> ${f.rating}</span>
        </div>
        <p class="comment-text">"${f.comment}"</p>
      </div>
    `).join("");
  } catch (err) {
    modalCommentsContainer.innerHTML = `<div class="loading-state"><p>Failed to load comments.</p></div>`;
  }
};

closeModalBtn.addEventListener("click", () => {
  commentsModal.classList.add("hidden");
});

commentsModal.addEventListener("click", (e) => {
  if (e.target === commentsModal) {
    commentsModal.classList.add("hidden");
  }
});

// ==================== INITIALIZATION ====================
applyUserSession();
loadMenu();
