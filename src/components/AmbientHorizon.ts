export function renderAmbientHorizon(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'ambient-horizon-container';
  container.setAttribute('aria-hidden', 'true');

  container.innerHTML = `
    <svg class="ambient-horizon-svg" viewBox="0 0 1200 700" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Filter for soft ambient incandescent glow -->
        <filter id="horizonGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="36" result="blurWide" />
          <feGaussianBlur stdDeviation="14" result="blurMid" />
          <feMerge>
            <feMergeNode in="blurWide" />
            <feMergeNode in="blurMid" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Subtle underglow underneath the curve -->
        <radialGradient id="curveUnderglow" cx="65%" cy="65%" r="55%">
          <stop offset="0%" stop-color="var(--horizon-underglow)" stop-opacity="1" />
          <stop offset="50%" stop-color="var(--horizon-underglow)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="transparent" stop-opacity="0" />
        </radialGradient>

        <!-- Gradient for the luminous arc edge itself -->
        <linearGradient id="horizonArcGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="var(--horizon-core)" stop-opacity="0.0" />
          <stop offset="25%" stop-color="var(--horizon-core)" stop-opacity="0.3" />
          <stop offset="60%" stop-color="var(--horizon-core)" stop-opacity="0.95" />
          <stop offset="85%" stop-color="var(--horizon-core)" stop-opacity="0.75" />
          <stop offset="100%" stop-color="var(--horizon-core)" stop-opacity="0.05" />
        </linearGradient>
      </defs>

      <!-- Diffused atmospheric warmth below the curve -->
      <ellipse cx="850" cy="560" rx="550" ry="320" fill="url(#curveUnderglow)" transform="rotate(-12 850 560)" />

      <!-- Deep wide glow curve: starts lower left, bends gracefully across, leaves mid-right -->
      <path d="M 0 680 C 450 670, 850 560, 1200 310" 
            stroke="var(--horizon-glow)" 
            stroke-width="48" 
            stroke-linecap="round"
            filter="url(#horizonGlowFilter)" />

      <!-- Medium glow stroke -->
      <path d="M 0 680 C 450 670, 850 560, 1200 310" 
            stroke="var(--horizon-glow)" 
            stroke-width="16" 
            stroke-linecap="round"
            filter="url(#horizonGlowFilter)" />

      <!-- Razor sharp incandescent horizon line -->
      <path d="M 0 680 C 450 670, 850 560, 1200 310" 
            stroke="url(#horizonArcGradient)" 
            stroke-width="2.2" 
            stroke-linecap="round" />
    </svg>
  `;

  return container;
}
