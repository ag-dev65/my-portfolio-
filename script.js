"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

if (menuToggle && navigation) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const yearElement = document.querySelector("#current-year");
if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

const revealElements = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const cvLinks = document.querySelectorAll(".cv-link");
const cvStatusElements = document.querySelectorAll(".cv-status");
let cvAvailable = false;

const setCvStatus = (message) => {
  cvStatusElements.forEach((element) => {
    element.textContent = message;
  });
};

fetch("CV_1.pdf", { method: "HEAD" })
  .then((response) => {
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/pdf")) {
      return;
    }

    cvAvailable = true;
    setCvStatus("Your CV is ready to download.");
  })
  .catch(() => {
    setCvStatus("Could not check CV_1.pdf. Make sure the PDF is in the portfolio folder and serve the site locally.");
  });

cvLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!cvAvailable) {
      event.preventDefault();
      setCvStatus("CV_1.pdf is not available yet. Make sure the PDF is in the portfolio folder and serve the site locally.");
    }
  });
});

const contactForm = document.querySelector("#contact-form");
const formFeedback = document.querySelector("#form-feedback");
const contactAddress = document.querySelector(".contact-email");

if (contactForm instanceof HTMLFormElement && formFeedback && contactAddress instanceof HTMLAnchorElement) {
  contactForm.addEventListener("invalid", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      formFeedback.textContent = "Please complete all required fields and check the highlighted field.";
      formFeedback.dataset.state = "error";
    }
  }, true);

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formFeedback.removeAttribute("data-state");

    if (!contactForm.reportValidity()) {
      formFeedback.textContent = "Please complete each field with valid information before continuing.";
      formFeedback.dataset.state = "error";
      return;
    }

    const recipient = contactAddress.textContent.replace("↗", "").trim();
    if (!recipient || recipient.includes("alexonyenwenu3@gmail.com")) {
      formFeedback.textContent = "Please replace the placeholder email address in the page before using this form.";
      formFeedback.dataset.state = "error";
      return;
    }

    const formData = new FormData(contactForm);
    const subject = String(formData.get("subject") || "").trim();
    const body = [
      `From: ${String(formData.get("name") || "").trim()}`,
      `Reply email: ${String(formData.get("email") || "").trim()}`,
      "",
      String(formData.get("message") || "").trim()
    ].join("\n");
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formFeedback.textContent = "Your email app should open with a draft. The message has not been sent; review and send it there.";
    formFeedback.dataset.state = "success";
    window.location.href = mailtoUrl;
  });
}
