const effectsModule = (function () {
  const initCursor = () => {
    const dot = document.querySelector(".cursor-dot");
    const outline = document.querySelector(".cursor-outline");
    if (!dot || !outline) return;

    window.addEventListener("mousemove", (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      dot.style.left = `${posX}px`;
      dot.style.top = `${posY}px`;

      // Légère inertie sur l'outline
      setTimeout(() => {
        outline.style.left = `${posX}px`;
        outline.style.top = `${posY}px`;
      }, 50);
    });

    document.querySelectorAll("a, button, .product-card").forEach((el) => {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("cursor-hover"),
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("cursor-hover"),
      );
    });
  };

  const initScrollReveal = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observer.observe(el);
    });
  };

  const initParallax = () => {
    const heroImg = document.querySelector(".parallax-bg");
    if (!heroImg) return;
    window.addEventListener("scroll", () => {
      const scroll = window.pageYOffset;
      heroImg.style.transform = `translateY(${scroll * 0.4}px)`;
    });
  };

  return { initCursor, initScrollReveal, initParallax };
})();
