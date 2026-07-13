function initTopbar(activePage) {
  const mount = document.getElementById('topbar-mount');
  if (!mount) return;

  mount.innerHTML = `
    <div class="topbar-inner">
      <a href="index.html" class="topbar-link${activePage === 'home' ? ' active' : ''}" data-testid="nav-home" data-i18n="nav-home">Inicio</a>
      <a href="cv.html"    class="topbar-link${activePage === 'cv'   ? ' active' : ''}" data-testid="nav-cv">CV</a>
      <a href="contact.html" class="topbar-link${activePage === 'contact' ? ' active' : ''}" data-testid="nav-contact" data-i18n="nav-contact">Contacto</a>
      <a href="reports.html" class="topbar-link${activePage === 'reports' ? ' active' : ''}" data-testid="nav-reports" data-i18n="nav-reports">Reportes</a>
      <div class="topbar-spacer"></div>
      <div class="lang-switcher" data-testid="lang-switcher">
        <button class="lang-btn" id="lang-btn" aria-haspopup="listbox" aria-expanded="false" data-testid="lang-btn">
          <span id="lang-label">ES</span>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </button>
        <div class="lang-dropdown" id="lang-dropdown" role="listbox" data-testid="lang-dropdown">
          <button class="lang-option" data-lang="es" role="option" aria-selected="false" data-testid="lang-option-es">ES — Español</button>
          <button class="lang-option" data-lang="en" role="option" aria-selected="false" data-testid="lang-option-en">EN — English</button>
        </div>
      </div>
    </div>
  `;

  const btn      = document.getElementById('lang-btn');
  const dropdown = document.getElementById('lang-dropdown');

  btn.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.lang-switcher')) {
      dropdown.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}
