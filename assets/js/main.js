const mainModule = (function () {
  const initNavbar = () => {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    });

    // Mobile Menu
    const menuBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("close-menu-btn");
    const overlay = document.getElementById("mobile-menu");

    if (menuBtn && closeBtn && overlay) {
      menuBtn.addEventListener("click", () => {
        overlay.classList.add("active");
        document.body.classList.add("no-scroll");
      });
      closeBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
        document.body.classList.remove("no-scroll");
      });
    }
  };

  const removeLoader = () => {
    // Simule un temps de chargement pour s'assurer que les polices/images sont prêtes
    setTimeout(() => {
      document.body.classList.remove("loading");
      // Trigger les animations initiales
      document
        .querySelectorAll(".hero-content .reveal")
        .forEach((el) => el.classList.add("active"));
    }, 500);
  };

  return { initNavbar, removeLoader };
})();
