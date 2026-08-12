gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  // 1. THEME SWITCHER LOGIC (Tailwind Compatible)
  const themeBtns = document.querySelectorAll(".theme-btn");
  const htmlTag = document.documentElement;

  const savedTheme = localStorage.getItem("milons-theme") || "dark";
  htmlTag.setAttribute("data-theme", savedTheme);
  themeBtns.forEach((btn) => {
    btn.classList.remove("border-accent");
    if (btn.dataset.setTheme === savedTheme) btn.classList.add("border-accent");
  });

  themeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const newTheme = e.target.dataset.setTheme;
      htmlTag.setAttribute("data-theme", newTheme);
      localStorage.setItem("milons-theme", newTheme);

      themeBtns.forEach((b) => b.classList.remove("border-accent"));
      e.target.classList.add("border-accent");
    });
  });

  // 2. MASSIVE BUTTER PRELOADER (Start -> Middle -> End)
  let progress = 0;
  const counterEl = document.querySelector(".loader-counter");
  const lineEl = document.querySelector(".loader-line");

  // Complex loading simulation
  const updateLoader = setInterval(() => {
    // Speed logic: Fast to 40%, slow through middle, fast to 100%
    let increment = 1;
    if (progress < 40) increment = Math.floor(Math.random() * 8) + 2;
    else if (progress < 70)
      increment = Math.floor(Math.random() * 2) + 1; // Slow down in middle
    else increment = Math.floor(Math.random() * 10) + 5; // Speed up at end

    progress += increment;
    if (progress >= 100) progress = 100;

    counterEl.textContent = progress.toString().padStart(3, "0");
    lineEl.style.width = `${progress}%`;

    if (progress === 100) {
      clearInterval(updateLoader);

      // Smooth Split Reveal
      const tl = gsap.timeline();
      tl.to(".loader-counter, .loader-line", {
        opacity: 0,
        duration: 0.4,
        delay: 0.3,
      })
        .to(
          ".panel-left",
          { x: "-100%", duration: 1.2, ease: "power4.inOut" },
          "-=0.1",
        )
        .to(
          ".panel-right",
          { x: "100%", duration: 1.2, ease: "power4.inOut" },
          "-=1.2",
        )
        .set("#preloader", { display: "none" })

        // Hero Content Reveal
        .to(
          ".hero-title-word",
          { y: "0%", duration: 1.2, stagger: 0.15, ease: "power4.out" },
          "-=0.8",
        )
        .to(
          ".hero-desc",
          { opacity: 1, y: -20, duration: 1, ease: "power3.out" },
          "-=0.8",
        );
    }
  }, 40);

  // 3. CURSOR & MAGNETIC HOVERS (Desktop Only)
  const cursorDot = document.querySelector(".cursor-dot");
  const hoverTargets = document.querySelectorAll(".hover-target");
  const magneticElements = document.querySelectorAll(".magnetic-element");

  // Only run cursor logic on non-touch devices
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      gsap.to(cursorDot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out",
      });
    });

    hoverTargets.forEach((target) => {
      target.addEventListener("mouseenter", () =>
        document.body.classList.add("hovering"),
      );
      target.addEventListener("mouseleave", () =>
        document.body.classList.remove("hovering"),
      );
    });

    magneticElements.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
      });
    });
  }

  // 4. ALWAYS RUNNING SYSTEM NODES
  const nodesContainer = document.getElementById("nodes-container");
  // Less nodes on mobile for performance
  const isMobile = window.innerWidth < 768;
  const nodeCount = isMobile ? 15 : 30;

  for (let i = 0; i < nodeCount; i++) {
    const node = document.createElement("div");
    node.className =
      "absolute w-1.5 h-1.5 rounded-full bg-accent opacity-50 shadow-[0_0_10px_var(--accent-color)]";
    nodesContainer.appendChild(node);

    gsap.set(node, {
      x: Math.random() * window.innerWidth,
      y: Math.random() * (window.innerHeight * 0.5),
      scale: Math.random() * 1.5 + 0.5,
    });

    animateNode(node);
  }

  function animateNode(node) {
    gsap.to(node, {
      x: `+=${Math.random() * 200 - 100}`,
      y: `+=${Math.random() * 200 - 100}`,
      duration: Math.random() * 6 + 4,
      ease: "sine.inOut",
      onComplete: () => animateNode(node),
    });
  }

  // 5. RESPONSIVE GSAP STICKY CARDS
  let mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    // Desktop: Scale down underlying cards slightly for depth
    const cards = gsap.utils.toArray(".project-card");
    cards.forEach((card, index) => {
      if (index === cards.length - 1) return;

      ScrollTrigger.create({
        trigger: card,
        start: "top 15vh",
        endTrigger: cards[index + 1],
        end: "top 18vh",
        scrub: true,
        animation: gsap.to(card, {
          scale: 0.95,
          opacity: 0.6,
          transformOrigin: "top center",
          ease: "none",
        }),
      });
    });
  });

  mm.add("(max-width: 767px)", () => {
    // Mobile: Gentle fade/push effect instead of scaling to prevent layout shifts
    const cards = gsap.utils.toArray(".project-card");
    cards.forEach((card, index) => {
      if (index === cards.length - 1) return;
      ScrollTrigger.create({
        trigger: card,
        start: "top 10vh",
        endTrigger: cards[index + 1],
        end: "top 12vh",
        scrub: true,
        animation: gsap.to(card, {
          opacity: 0.4,
          ease: "none",
        }),
      });
    });
  });

  // 6. RELAXING BACK TO TOP
  const backToTopBtn = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 600) {
      backToTopBtn.style.bottom = "30px";
    } else {
      backToTopBtn.style.bottom = "-100px";
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});
