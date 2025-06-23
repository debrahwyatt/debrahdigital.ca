document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("services-dropdown");
  const toggle = dropdown?.querySelector(".dropdown-toggle");

  if (!dropdown || !toggle) return;

  // Only apply mobile behavior
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    let open = false;

    toggle.addEventListener("click", (e) => {
      if (!open) {
        e.preventDefault(); // block first click
        dropdown.classList.toggle("show");
        open = true;
      } else {
        // allow navigation on second click
        dropdown.classList.remove("show");
        open = false;
      }
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
        open = false;
      }
    });
  }
});
