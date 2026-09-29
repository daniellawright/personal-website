(() => {
  const toggle = document.querySelector('.sound-toggle');
  if (typeof Audio !== 'function' || !toggle) return;

  // Change these filenames to choose a sound for each group of links.
  const soundGroups = [
    { selector: '.logo', file: 'sound-effects/newRecord.wav' },
    { selector: '.social-link, .company-logo-link', file: 'sound-effects/newArtifact.wav' },
    { selector: '.nav a', file: 'sound-effects/select.wav' },
  ];
  const sounds = soundGroups.map(group => {
    const audio = new Audio(new URL(group.file, document.baseURI).href);
    audio.preload = 'auto';
    audio.volume = 0.2;
    return { ...group, audio };
  });
  const soundSelector = sounds.map(sound => sound.selector).join(', ');
  const storageKey = 'portfolio-icon-sounds';
  let enabled = true;
  let unlocked = false;
  let unlocking;
  let activeAudio;
  let lastPlayed = -Infinity;

  try {
    enabled = localStorage.getItem(storageKey) !== 'off';
  } catch { /* Sound controls also work without storage. */ }

  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = enabled ? 'Mute sound effects' : 'Unmute sound effects';
  }

  function stopSound() {
    if (!activeAudio) return;
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = undefined;
  }

  function playSound(audio) {
    if (!enabled || !unlocked || document.hidden) return;
    const now = performance.now();
    if (now - lastPlayed < 160) return;
    lastPlayed = now;
    // Keep quick movements between links from stacking several recordings.
    stopSound();
    activeAudio = audio;
    audio.currentTime = 0;
    audio.play().catch(() => { /* A blocked or missing sound must not affect navigation. */ });
  }

  function playForElement(element) {
    const sound = sounds.find(item => element.matches(item.selector));
    if (sound) playSound(sound.audio);
  }

  function unlockAudio() {
    if (!enabled || unlocked) return Promise.resolve();
    if (unlocking) return unlocking;
    // Prime each player silently during the first real gesture, including on Safari.
    unlocking = Promise.allSettled(sounds.map(async ({ audio }) => {
      audio.muted = true;
      try {
        await audio.play();
      } finally {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }
    })).then(() => {
      unlocked = true;
      unlocking = undefined;
    });
    return unlocking;
  }

  function handleGesture(event) {
    if (!event.isTrusted || event.repeat) return;
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
    unlockAudio().then(() => {
      const element = event.target.closest?.(soundSelector);
      if (element && event.type === 'pointerdown') playForElement(element);
    });
  }
  document.addEventListener('pointerdown', handleGesture, { capture: true, passive: true });
  document.addEventListener('keydown', handleGesture, { capture: true });

  document.querySelectorAll(soundSelector).forEach(element => {
    element.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') playForElement(element);
    });
    element.addEventListener('focus', () => {
      if (element.matches(':focus-visible')) playForElement(element);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSound();
  });

  toggle.addEventListener('click', async () => {
    enabled = !enabled;
    updateToggle();
    try { localStorage.setItem(storageKey, enabled ? 'on' : 'off'); } catch {}
    if (!enabled) stopSound();
    else {
      await unlockAudio();
      playSound(sounds.find(sound => sound.selector === '.nav a').audio);
    }
  });

  updateToggle();
  toggle.hidden = false;
})();
