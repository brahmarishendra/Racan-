document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu functionality
  const menuToggle = document.querySelector(".menu-toggle")
  const mobileNav = document.querySelector(".mobile-nav")
  const overlay = document.querySelector(".overlay")

  function toggleMenu() {
    menuToggle.classList.toggle("active")
    mobileNav.classList.toggle("active")
    overlay.classList.toggle("active")
    document.body.classList.toggle("no-scroll")
  }

  menuToggle.addEventListener("click", toggleMenu)
  overlay.addEventListener("click", toggleMenu)

  // Close menu when clicking on a mobile nav link
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      toggleMenu()

      // Handle smooth scrolling for anchor links
      const targetId = this.getAttribute("href")
      if (targetId.startsWith("#") && targetId !== "#") {
        const targetElement = document.querySelector(targetId)
        if (targetElement) {
          setTimeout(() => {
            window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: "smooth",
            })
          }, 300)
        }
      }
    })
  })
})
