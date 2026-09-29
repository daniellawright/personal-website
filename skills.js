// Keep every logo visible if JavaScript is unavailable.
document.querySelectorAll('.skill-cluster').forEach((cluster, index) => {
  const button = cluster.querySelector('.skill-hub');
  const orbit = cluster.querySelector('.skill-orbit');

  function setOpen(open) {
    cluster.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    orbit.inert = !open;
    orbit.setAttribute('aria-hidden', String(!open));
  }

  // One open group demonstrates the interaction; the others start gathered.
  setOpen(index === 0);
  button.addEventListener('click', () => {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });
  cluster.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      button.focus();
      setOpen(false);
    }
  });
});
