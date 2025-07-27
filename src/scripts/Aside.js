let lightModeEnabled = false;

const lightModeSwitch = document.getElementById("light-mode-switch");
const indicator = lightModeSwitch.querySelector(".indicator");
lightModeSwitch.addEventListener("click", () => {
  lightModeEnabled = !lightModeEnabled;

  if (lightModeEnabled) {
    document.documentElement.style.setProperty(
      "--page-primary-color",
      "var(--light-mode-primary)"
    );
    document.documentElement.style.setProperty(
      "--page-secondary-color",
      "var(--light-mode-secondary)"
    );
    document.documentElement.style.setProperty(
      "--page-accent-color",
      "var(--light-mode-accent)"
    );

    indicator.classList.add("active");
    return;
  }

  document.documentElement.style.setProperty(
    "--page-primary-color",
    "var(--dark-mode-primary)"
  );
  document.documentElement.style.setProperty(
    "--page-secondary-color",
    "var(--dark-mode-secondary)"
  );
  document.documentElement.style.setProperty(
    "--page-accent-color",
    "var(--dark-mode-accent)"
  );

  indicator.classList.remove("active");
});
