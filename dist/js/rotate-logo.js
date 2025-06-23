document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logo");
  if (!logo) return;

  let rotation = 0;
  let speed = 0;
  let lastTime = performance.now();
  let isAnimating = false;

  const decayRate = 0.000074;
  const maxSpeed = 1;

  const animate = (time) => {
    const delta = time - lastTime;
    lastTime = time;

    if (Math.abs(speed) > 0.001) {
      rotation += speed * delta;

      const decayStep = decayRate * delta;
      speed -= Math.sign(speed) * Math.min(Math.abs(speed), decayStep);

      logo.style.transform = `rotateY(${rotation}deg)`;
      requestAnimationFrame(animate);
    } else {
      speed = 0;
      isAnimating = false;
    }
  };

  logo.addEventListener("click", (event) => {
    const rect = logo.getBoundingClientRect();
    const clickX = event.clientX;
    const midpoint = rect.left + rect.width / 2;

    if (clickX >= midpoint) {
      speed += 0.4;
    } else {
      speed -= 0.4;
    }

    speed = Math.max(Math.min(speed, maxSpeed), -maxSpeed);

    if (!isAnimating) {
      isAnimating = true;
      lastTime = performance.now();
      requestAnimationFrame(animate);
    }
  });
});
