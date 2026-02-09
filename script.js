// ============================================
// KITNA BANA - SCROLL ANIMATIONS & INTERACTIONS
// ============================================

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

let voiceTimer, typeTween, chipsTl, micPulse;

// Voice Entry: init + cleanup
function initVoiceEntry() {
  const text =
    "Aaj 12 orders, Zomato se ₹2,400 kamaya, cash ₹500 mila, petrol ₹300 laga";
  const tEl = document.getElementById("voice-transcript-text");
  if (!tEl) return;

  tEl.textContent = "";

  // Typing animation
  const obj = { i: 0 };
  typeTween = gsap.to(obj, {
    i: text.length,
    duration: 1.6,
    ease: "linear",
    onUpdate: () => (tEl.textContent = text.slice(0, Math.round(obj.i))),
  });

  // Chips pop-in
  const chips = gsap.utils.toArray("#voice-entry-screen .chip");
  gsap.set(chips, { autoAlpha: 0, y: 8 });
  chipsTl = gsap.to(chips, {
    autoAlpha: 1,
    y: 0,
    duration: 0.35,
    stagger: 0.12,
    delay: 1.0,
  });

  // Recording timer
  const timerEl = document.getElementById("rec-timer");
  if (timerEl) {
    let s = 0;
    timerEl.textContent = "00:00";
    voiceTimer = setInterval(() => {
      s++;
      const mm = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      timerEl.textContent = `${mm}:${ss}`;
    }, 1000);
  }

  // Mic pulse
  micPulse = gsap.to("#voice-entry-screen .voice-entry-icon", {
    scale: 1.1,
    repeat: -1,
    yoyo: true,
    duration: 0.5,
    ease: "sine.inOut",
    transformOrigin: "50% 50%",
  });
}

function killVoiceEntry() {
  if (voiceTimer) clearInterval(voiceTimer);
  if (typeTween) typeTween.kill();
  if (chipsTl) chipsTl.kill();
  if (micPulse) micPulse.kill();
}

// Dashboard: init chart + amount count
function initDashboard() {
  const chartPath = document.querySelector(
    "#dashboard-screen .dashboard-chart path"
  );
  if (chartPath) {
    const pathLength = chartPath.getTotalLength();
    gsap.set(chartPath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });
    gsap.to(chartPath, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: "power1.inOut",
    });
  }

  // Amount counter
  const amountEl = document.querySelector("#dashboard-screen .dashboard-amount");
  if (amountEl) {
    const target = parseInt(amountEl.textContent.replace(/[^\d]/g, ""), 10) || 0;
    gsap.fromTo(
      amountEl,
      { innerText: 0 },
      {
        innerText: target,
        duration: 1.2,
        ease: "power1.out",
        snap: { innerText: 1 },
        onUpdate: function () {
          const v = Math.floor(amountEl.innerText);
          amountEl.textContent = `₹${v.toLocaleString("en-IN")}`;
        },
      }
    );
  }
}
function killDashboard() {
  // no-op (chart anim completes each loop)
}

// ============================================
// HERO SECTION ANIMATION (single source of truth)
// ============================================

const screens = [
  "#dashboard-screen",
  "#voice-entry-screen",
  "#expense-tracking-screen",
  "#goal-progress-screen",
  "#ai-insights-screen",
];

// Hide everything initially
gsap.set(screens, {
  autoAlpha: 0,
  display: "none",
  zIndex: 1,
  pointerEvents: "none",
});

const heroTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });

// Helper to show exactly one screen, then move on
function cycleScreen(sel, hold = 2, onEnter, onExit) {
  heroTimeline
    .add(() => {
      gsap.set(screens, {
        autoAlpha: 0,
        display: "none",
        zIndex: 1,
        pointerEvents: "none",
      });
      gsap.set(sel, { display: "flex", zIndex: 2, pointerEvents: "auto" });
      if (onEnter) onEnter();
    })
    .to(sel, { autoAlpha: 1, duration: 0.6, ease: "power1.out" })
    .to(sel, { autoAlpha: 1, duration: hold }) // hold visible
    .to(sel, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power1.in",
      onComplete: onExit,
    });
}

// Sequence
cycleScreen("#dashboard-screen", 2.4, initDashboard, killDashboard);
cycleScreen("#voice-entry-screen", 3.2, initVoiceEntry, killVoiceEntry);
cycleScreen("#expense-tracking-screen", 2);
cycleScreen("#goal-progress-screen", 2);
cycleScreen("#ai-insights-screen", 2);

// ============================================
// AI ADVISOR SECTION ANIMATION (target only numeric)
// ============================================

const aiAdvisorTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".ai-advisor",
    start: "top center",
    toggleActions: "play none none none",
  },
});

const pe = document.getElementById("potential-earnings");
const dtt = document.getElementById("days-to-target");

if (pe) {
  const peTarget =
    Number(pe.dataset.target) ||
    Number((pe.textContent || "").replace(/[^\d]/g, "")) ||
    0;

  aiAdvisorTimeline.fromTo(
    pe,
    { textContent: 0 },
    {
      textContent: peTarget,
      duration: 2,
      ease: "power1.inOut",
      snap: { textContent: 1 },
      onUpdate: () => {
        const v = Math.ceil(Number(pe.textContent) || 0);
        pe.textContent = `₹${v.toLocaleString("en-IN")}`;
      },
    }
  );
}

if (dtt) {
  const dTarget =
    Number(dtt.dataset.target) ||
    Number((dtt.textContent || "").replace(/[^\d]/g, "")) ||
    0;

  aiAdvisorTimeline.fromTo(
    dtt,
    { textContent: 0 },
    {
      textContent: dTarget,
      duration: 2,
      ease: "power1.inOut",
      snap: { textContent: 1 },
      onUpdate: () => {
        const v = Math.ceil(Number(dtt.textContent) || 0);
        dtt.textContent = `${v} din`;
      },
    },
    "-=1.4"
  );
}

aiAdvisorTimeline.from(
  ".ai-subtext",
  { opacity: 0, y: 20, duration: 1, stagger: 0.3 },
  "-=1"
);

// ============================================
// TESTIMONIALS CAROUSEL
// ============================================

const swiper = new Swiper(".testimonials-slider", {
  loop: true,
  autoplay: { delay: 5000, disableOnInteraction: false },
  pagination: { el: ".swiper-pagination", clickable: true },
  spaceBetween: 30,
  centeredSlides: true,
  effect: "fade",
});

// ============================================
// SMOOTH SCROLL NAVIGATION
// ============================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: target.offsetTop - 80, autoKill: false },
        ease: "power2.inOut",
      });
    }
  });
});

// ============================================
// BUTTON INTERACTIONS
// ============================================

const downloadButtons = document.querySelectorAll("#hero-download-btn, .cta-link");
downloadButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const downloadSection = document.getElementById("download");
    if (downloadSection) {
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: downloadSection.offsetTop - 80, autoKill: false },
        ease: "power2.inOut",
      });
    }
  });
});

// QR Code click handler
const qrCode = document.querySelector(".qr-code");
if (qrCode) {
  qrCode.addEventListener("click", () => {
    // TODO: replace with your actual Play Store link
    window.open("https://play.google.com/store", "_blank");
  });
  qrCode.style.cursor = "pointer";
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================

const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  header.style.boxShadow =
    scrollTop > 50 ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none";
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  ScrollTrigger.refresh();
  console.log("Kitna Bana website initialized successfully!");
});

// Refresh ScrollTrigger on window resize
window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});