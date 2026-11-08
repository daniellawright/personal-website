// One-time Nyan Cat flyover when the page first loads.
// The cat flies just above the divider line at the bottom of the hero section.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function fly() {
    const cat = new Image();
    cat.className = 'nyan-cat';
    cat.alt = '';
    cat.setAttribute('aria-hidden', 'true');

    // Only add it to the page once the GIF has loaded so it never pops in mid-flight.
    cat.addEventListener('load', () => {
      const lane = document.createElement('div');
      lane.className = 'nyan-lane';
      lane.appendChild(cat);
      document.body.appendChild(lane);

      // Sit the cat on the hero divider, but keep it on screen on short windows.
      const catHeight = cat.offsetHeight;
      const hero = document.getElementById('home');
      const lineY = hero
        ? hero.getBoundingClientRect().bottom + window.scrollY
        : window.scrollY + window.innerHeight * 0.6;
      const lowestY = window.scrollY + window.innerHeight - 8;
      lane.style.height = `${catHeight}px`;
      lane.style.top = `${Math.max(0, Math.min(lineY, lowestY) - catHeight - 2)}px`;

      cat.addEventListener('animationend', () => lane.remove());
    });
    cat.src = 'images/nyan-cat.gif';
  }

  // Wait for layout to settle (images, fonts) so the divider's position is final.
  if (document.readyState === 'complete') fly();
  else window.addEventListener('load', fly);
})();
