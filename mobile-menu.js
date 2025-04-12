document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu functionality
  const menuToggle = document.querySelector(".menu-toggle")
  const mobileNav = document.querySelector(".mobile-nav")
  const overlay = document.querySelector(".overlay")
  const closeMenu = document.querySelector(".close-menu")

  function toggleMenu() {
    menuToggle.classList.toggle("active")
    mobileNav.classList.toggle("active")
    overlay.classList.toggle("active")
    document.body.classList.toggle("no-scroll")

    // Reset animation for menu items when opening
    if (mobileNav.classList.contains("active")) {
      const menuItems = document.querySelectorAll(".mobile-nav-link, .mobile-nav-subscribe")
      menuItems.forEach((item, index) => {
        item.style.animation = "none"
        setTimeout(() => {
          item.style.animation = `fadeInRight 0.5s forwards ${0.1 * (index + 1)}s`
          item.style.opacity = "0"
        }, 10)
      })
    }
  }

  menuToggle.addEventListener("click", toggleMenu)
  overlay.addEventListener("click", toggleMenu)
  if (closeMenu) {
    closeMenu.addEventListener("click", toggleMenu)
  }

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

  // Add hover effect to navigation items
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px)"
    })

    link.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
    })
  })

  // Add interactive effects to buttons
  const buttons = document.querySelectorAll(
    ".join-now-btn, .signup-btn, .demo-btn, .explore-btn, .get-started-btn, .register-btn",
  )
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)"
      this.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.15)"
    })

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
      this.style.boxShadow = ""
    })
  })

  // Add scroll animations for elements
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".feature-card, .step, .testimonial, .team-member")

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top
      const screenPosition = window.innerHeight / 1.3

      if (elementPosition < screenPosition) {
        element.classList.add("animate")
      }
    })
  }

  window.addEventListener("scroll", animateOnScroll)
  animateOnScroll() // Run once on page load
})
