// Portfolio V2 - JavaScript
$(document).ready(function () {
  // =============== CUSTOM CURSOR ===============
  const cursor = $(".cursor");
  const cursorFollower = $(".cursor-follower");

  $(document).on("mousemove", function (e) {
    cursor.css({
      left: e.clientX + "px",
      top: e.clientY + "px",
    });

    cursorFollower.css({
      left: e.clientX + "px",
      top: e.clientY + "px",
    });
  });

  $("a, button").hover(
    function () {
      cursor.css("transform", "translate(-50%, -50%) scale(1.5)");
      cursorFollower.css("transform", "translate(-50%, -50%) scale(1.5)");
    },
    function () {
      cursor.css("transform", "translate(-50%, -50%) scale(1)");
      cursorFollower.css("transform", "translate(-50%, -50%) scale(1)");
    },
  );

  // =============== NAVBAR SCROLL EFFECT ===============
  $(window).on("scroll", function () {
    const navbar = $("#navbar");
    if ($(window).scrollTop() > 50) {
      navbar.addClass("scrolled");
    } else {
      navbar.removeClass("scrolled");
    }
  });

  // =============== MOBILE MENU TOGGLE ===============
  $("#hamburger").on("click", function () {
    $(this).toggleClass("active");
    $("#navMenu").toggleClass("active");

    // Animate hamburger bars
    const spans = $(this).find("span");
    if ($(this).hasClass("active")) {
      spans.eq(0).css("transform", "rotate(45deg) translateY(8px)");
      spans.eq(1).css("opacity", "0");
      spans.eq(2).css("transform", "rotate(-45deg) translateY(-8px)");
    } else {
      spans.css({
        transform: "none",
        opacity: "1",
      });
    }
  });

  // =============== SMOOTH SCROLL & ACTIVE NAV ===============
  $(".nav-link").on("click", function (e) {
    e.preventDefault();
    const target = $(this).attr("href");
    const offset = 80;

    $("html, body").animate(
      {
        scrollTop: $(target).offset().top - offset,
      },
      800,
    );

    // Close mobile menu
    $("#navMenu").removeClass("active");
    $("#hamburger").removeClass("active");
    $("#hamburger span").css({
      transform: "none",
      opacity: "1",
    });

    // Update active link
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });

  // Update active nav on scroll
  $(window).on("scroll", function () {
    let current = "";
    $("section").each(function () {
      const sectionTop = $(this).offset().top;
      const sectionHeight = $(this).height();
      if ($(window).scrollTop() >= sectionTop - 100) {
        current = $(this).attr("id");
      }
    });

    $(".nav-link").removeClass("active");
    $('.nav-link[href="#' + current + '"]').addClass("active");
  });

  // =============== TYPING EFFECT ===============
  const titles = [
    "Python/Java FullStack Engineer",
    "Backend Developer",
    "Frontend Developer",
    "AI/ML Engineer",
    "Microservices Architect",
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  function typeEffect() {
    const currentTitle = titles[titleIndex];
    const typingText = $(".typing-text");

    if (isDeleting) {
      typingText.text(currentTitle.substring(0, charIndex - 1));
      charIndex--;
    } else {
      typingText.text(currentTitle.substring(0, charIndex + 1));
      charIndex++;
    }

    if (!isDeleting && charIndex === currentTitle.length) {
      isDeleting = true;
      setTimeout(typeEffect, pauseTime);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(typeEffect, speed);
  }

  typeEffect();

  // =============== COUNTER ANIMATION ===============
  function animateCounter(element) {
    const target = parseInt($(element).data("target"));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        $(element).text(target);
        clearInterval(timer);
      } else {
        $(element).text(Math.floor(current));
      }
    }, 16);
  }

  // Trigger counters when in view
  const countersAnimated = {};
  $(window).on("scroll", function () {
    $(".stat-number[data-target]").each(function () {
      const elementTop = $(this).offset().top;
      const elementBottom = elementTop + $(this).outerHeight();
      const viewportTop = $(window).scrollTop();
      const viewportBottom = viewportTop + $(window).height();

      if (elementBottom > viewportTop && elementTop < viewportBottom) {
        const id = $(this).closest(".stat-card").index();
        if (!countersAnimated[id]) {
          countersAnimated[id] = true;
          animateCounter(this);
        }
      }
    });
  });

  // =============== SKILL BARS ANIMATION ===============
  const skillsAnimated = {};
  $(window).on("scroll", function () {
    $(".skill-progress").each(function () {
      const elementTop = $(this).offset().top;
      const elementBottom = elementTop + $(this).outerHeight();
      const viewportTop = $(window).scrollTop();
      const viewportBottom = viewportTop + $(window).height();

      if (elementBottom > viewportTop && elementTop < viewportBottom) {
        const id = $(this).closest(".skill-item").index();
        const categoryId = $(this).closest(".skill-category").index();
        const uniqueId = categoryId + "-" + id;

        if (!skillsAnimated[uniqueId]) {
          skillsAnimated[uniqueId] = true;
          const progress = $(this).data("progress");
          $(this).css("width", progress + "%");
        }
      }
    });
  });

  // =============== SCROLL ANIMATIONS ===============
  function revealOnScroll() {
    $("[data-aos]").each(function () {
      const elementTop = $(this).offset().top;
      const elementBottom = elementTop + $(this).outerHeight();
      const viewportTop = $(window).scrollTop();
      const viewportBottom = viewportTop + $(window).height();

      if (elementBottom > viewportTop && elementTop < viewportBottom - 100) {
        $(this).addClass("aos-animate");
      }
    });
  }

  // Add AOS styles
  $("<style>")
    .text(
      `
            [data-aos] {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease, transform 0.8s ease;
            }
            
            [data-aos].aos-animate {
                opacity: 1;
                transform: translateY(0);
            }
        `,
    )
    .appendTo("head");

  $(window).on("scroll", revealOnScroll);
  revealOnScroll(); // Initial check

  // =============== CONTACT FORM ===============
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();

    const name = $("#name").val();
    const email = $("#email").val();
    const subject = $("#subject").val();
    const message = $("#message").val();

    // Show loading state
    const submitBtn = $(this).find(".submit-btn");
    const originalHTML = submitBtn.html();
    submitBtn.html(
      '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>',
    );
    submitBtn.prop("disabled", true);

    // Simulate form submission (replace with actual form submission)
    setTimeout(function () {
      // Success message
      alert("Message sent successfully! I will get back to you soon.");

      // Reset form
      $("#contactForm")[0].reset();

      // Reset button
      submitBtn.html(originalHTML);
      submitBtn.prop("disabled", false);

      // In production, replace with actual AJAX call:
      /*
            $.ajax({
                url: 'your-backend-endpoint.php',
                method: 'POST',
                data: {
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                },
                success: function(response) {
                    alert('Message sent successfully!');
                    $('#contactForm')[0].reset();
                },
                error: function() {
                    alert('Failed to send message. Please try again.');
                },
                complete: function() {
                    submitBtn.html(originalHTML);
                    submitBtn.prop('disabled', false);
                }
            });
            */
    }, 2000);
  });

  // =============== BACK TO TOP BUTTON ===============
  const backToTop = $("#backToTop");

  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 300) {
      backToTop.addClass("visible");
    } else {
      backToTop.removeClass("visible");
    }
  });

  backToTop.on("click", function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      800,
    );
  });

  // =============== PARALLAX EFFECT ===============
  $(window).on("scroll", function () {
    const scrolled = $(window).scrollTop();
    $(".gradient-orb").css("transform", "translateY(" + scrolled * 0.5 + "px)");
  });

  // =============== PROJECT CARDS TILT EFFECT ===============
  $(".project-card").on("mousemove", function (e) {
    const card = $(this);
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.css(
      "transform",
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`,
    );
  });

  $(".project-card").on("mouseleave", function () {
    $(this).css("transform", "perspective(1000px) rotateX(0) rotateY(0)");
  });

  // =============== DOWNLOAD RESUME ===============
  window.downloadResume = function () {
    // Create a link to download resume
    const link = document.createElement("a");
    link.href = "path-to-your-resume.pdf"; // Update with actual path
    link.download = "Pankaj_Shah_Resume.pdf";
    link.click();
  };

  // =============== COPY EMAIL TO CLIPBOARD ===============
  window.copyEmail = function () {
    const email = "pshah9360@gmail.com";
    navigator.clipboard.writeText(email).then(function () {
      alert("Email copied to clipboard!");
    });
  };

  // =============== LAZY LOAD IMAGES ===============
  $("img[data-src]").each(function () {
    const img = $(this);
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          img.attr("src", img.data("src"));
          img.removeAttr("data-src");
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(this);
  });

  // =============== THEME TOGGLE (Optional) ===============
  window.toggleTheme = function () {
    $("body").toggleClass("light-theme");
    // Save preference
    const theme = $("body").hasClass("light-theme") ? "light" : "dark";
    localStorage.setItem("theme", theme);
  };

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    $("body").addClass("light-theme");
  }

  // =============== CONSOLE MESSAGE ===============
  console.log(
    "%c👋 Hi there!",
    "font-size: 20px; font-weight: bold; color: #6366f1;",
  );
  console.log(
    "%cLooking for a talented Full-Stack Engineer?",
    "font-size: 14px; color: #8b5cf6;",
  );
  console.log(
    "%cLet's work together! Contact me at pshah9360@gmail.com",
    "font-size: 14px; color: #ec4899;",
  );

  // =============== PERFORMANCE MONITORING ===============
  window.addEventListener("load", function () {
    const loadTime =
      window.performance.timing.domContentLoadedEventEnd -
      window.performance.timing.navigationStart;
    console.log("Page loaded in " + loadTime + "ms");
  });

  // =============== DISABLE CUSTOM CURSOR ON MOBILE ===============
  if (window.matchMedia("(max-width: 768px)").matches) {
    cursor.hide();
    cursorFollower.hide();
  }

  // =============== LIGHTBOX FUNCTIONALITY ===============
  $(".achievement-overlay").on("click", function () {
    const imgSrc = $(this).siblings("img").attr("src");
    const altText = $(this).siblings("img").attr("alt");

    $("#lightbox-image").attr("src", imgSrc).attr("alt", altText);
    $("#lightbox").addClass("active");
  });

  $(".lightbox-close").on("click", function () {
    $("#lightbox").removeClass("active");
  });

  $("#lightbox").on("click", function (e) {
    if (e.target === this) {
      $(this).removeClass("active");
    }
  });

  // =============== PRELOADER (Optional) ===============
  $(window).on("load", function () {
    $(".preloader").fadeOut("slow");
  });

  // =============== INITIALIZE ===============
  console.log("Portfolio V2 Initialized ✓");
});
