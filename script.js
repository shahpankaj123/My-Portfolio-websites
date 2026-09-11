document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => document.body.classList.add("page-ready"));

  const cursor = document.querySelector(".cursor");
  const cursorFollower = document.querySelector(".cursor-follower");
  const navbar = document.querySelector("#navbar");
  const navMenu = document.querySelector("#navMenu");
  const hamburger = document.querySelector("#hamburger");
  const themeToggle = document.querySelector("#themeToggle");

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-theme", isDark);
    if (themeToggle) {
      themeToggle.innerHTML = `<i class="fas fa-${isDark ? "sun" : "moon"}" aria-hidden="true"></i>`;
      themeToggle.setAttribute(
        "aria-label",
        `Switch to ${isDark ? "light" : "dark"} theme`,
      );
    }
  };

  const savedTheme = localStorage.getItem("portfolio-theme");
  applyTheme(savedTheme || "light");
  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-theme")
      ? "light"
      : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);
  });

  const closeMenu = () => {
    navMenu?.classList.remove("active");
    hamburger?.classList.remove("active");
    hamburger?.querySelectorAll("span").forEach((bar) => {
      bar.style.transform = "none";
      bar.style.opacity = "1";
    });
  };

  if (
    cursor &&
    cursorFollower &&
    !window.matchMedia("(max-width: 500px)").matches
  ) {
    window.addEventListener("pointermove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursorFollower.style.left = `${event.clientX}px`;
      cursorFollower.style.top = `${event.clientY}px`;
    });

    document
      .querySelectorAll("a, button, .project-card, .achievement-overlay")
      .forEach((element) => {
        element.addEventListener("mouseenter", () =>
          cursorFollower.classList.add("is-hovering"),
        );
        element.addEventListener("mouseleave", () =>
          cursorFollower.classList.remove("is-hovering"),
        );
      });
  }

  hamburger?.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("active");
    navMenu?.classList.toggle("active", isOpen);
    const bars = hamburger.querySelectorAll("span");
    bars[0].style.transform = isOpen ? "rotate(45deg) translateY(5px)" : "none";
    bars[1].style.opacity = isOpen ? "0" : "1";
    bars[2].style.transform = isOpen
      ? "rotate(-45deg) translateY(-5px)"
      : "none";
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document
        .querySelector(link.getAttribute("href"))
        ?.scrollIntoView({ behavior: "smooth" });
      closeMenu();
    });
  });

  const updateScrollState = () => {
    const scrollTop = window.scrollY;
    navbar?.classList.toggle("scrolled", scrollTop > 50);
    document
      .querySelector("#backToTop")
      ?.classList.toggle("visible", scrollTop > 400);

    let currentSection = "home";
    document.querySelectorAll("section[id]").forEach((section) => {
      if (scrollTop >= section.offsetTop - 140) currentSection = section.id;
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${currentSection}`,
      );
    });
  };
  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  const titles = [
    "Python/Java FullStack Engineer",
    "Backend Developer",
    "Frontend Developer",
    "AI/ML Engineer",
    "Microservices Architect",
    "System Design",
  ];
  const typingText = document.querySelector(".typing-text");
  let titleIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  const typeTitle = () => {
    if (!typingText) return;
    const title = titles[titleIndex];
    characterIndex += deleting ? -1 : 1;
    typingText.textContent = title.slice(0, characterIndex);
    if (!deleting && characterIndex === title.length) {
      deleting = true;
      setTimeout(typeTitle, 1800);
      return;
    }
    if (deleting && characterIndex === 0) {
      deleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
    }
    setTimeout(typeTitle, deleting ? 42 : 85);
  };
  typeTitle();

  const animateCounter = (element) => {
    const target = Number(element.dataset.target);
    const start = performance.now();
    const duration = 1100;
    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      element.textContent = String(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        if (element.matches("[data-reveal]"))
          element.classList.add("is-visible");
        if (element.matches("[data-aos]")) element.classList.add("aos-animate");
        const delay = element.dataset.aosDelay;
        if (delay) element.style.transitionDelay = `${delay}ms`;
        if (element.matches(".stat-number[data-target]"))
          animateCounter(element);
        if (element.matches(".skill-progress"))
          element.style.width = `${element.dataset.progress}%`;
        observer.unobserve(element);
      });
    },
    { threshold: 0.15 },
  );

  document
    .querySelectorAll("section:not(.hero) .section-header")
    .forEach((header) => header.setAttribute("data-reveal", ""));
  document
    .querySelectorAll(
      "[data-aos], [data-reveal], .stat-number[data-target], .skill-progress",
    )
    .forEach((element) => revealObserver.observe(element));

  const heroImage = document.querySelector(".hero-image");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (
    heroImage &&
    !reducedMotion &&
    window.matchMedia("(min-width: 801px)").matches
  ) {
    heroImage.addEventListener("pointermove", (event) => {
      const bounds = heroImage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
      heroImage.style.setProperty("--photo-x", `${x}px`);
      heroImage.style.setProperty("--photo-y", `${y}px`);
    });
    heroImage.addEventListener("pointerleave", () => {
      heroImage.style.setProperty("--photo-x", "0px");
      heroImage.style.setProperty("--photo-y", "0px");
    });
  }

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(max-width: 800px)").matches) return;
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -4;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 4;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document
    .querySelector("#backToTop")
    ?.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );

  const showNotification = (message) => {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `<div class="notification-content"><i class="fas fa-circle-check"></i><span>${message}</span></div><button class="notification-close" aria-label="Close notification">&times;</button>`;
    document.body.append(notification);
    const remove = () => {
      notification.classList.add("removing");
      setTimeout(() => notification.remove(), 250);
    };
    notification
      .querySelector(".notification-close")
      .addEventListener("click", remove);
    setTimeout(remove, 5000);
  };

  document
    .querySelector("#contactForm")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector(".submit-btn");
      const original = button.innerHTML;
      button.disabled = true;
      button.innerHTML =
        '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
        });
        const result = await response.json();
        if (!result.success) throw new Error("Submission failed");
        form.reset();
        showNotification(
          "Message sent successfully! I will get back to you soon.",
        );
      } catch (error) {
        showNotification(
          "Unable to send the message right now. Please try again.",
        );
      } finally {
        button.disabled = false;
        button.innerHTML = original;
      }
    });

  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  document.querySelectorAll(".achievement-overlay").forEach((overlay) => {
    overlay.addEventListener("click", () => {
      const image = overlay.parentElement.querySelector("img");
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add("active");
    });
  });
  document
    .querySelector(".lightbox-close")
    ?.addEventListener("click", () => lightbox.classList.remove("active"));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.classList.remove("active");
  });

  document.querySelectorAll("img[data-src]").forEach((image) => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      image.src = image.dataset.src;
      image.removeAttribute("data-src");
      observer.disconnect();
    });
    imageObserver.observe(image);
  });

  window.downloadResume = () => {
    window.location.href = "pankaj_shah_2026_cv.pdf";
  };
  window.copyEmail = () =>
    navigator.clipboard
      ?.writeText("pshah9360@gmail.com")
      .then(() => showNotification("Email copied to clipboard!"));
});
