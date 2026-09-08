<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand-col">
        <a href="/" class="brand footer-brand" aria-label="AutomaEyes Home">
          <span class="brand-mark" aria-hidden="true">
            <img src="/assets/img/logo-64.png" width="28" height="28" alt="">
          </span>
          <span class="brand-name">Automa<span class="accent">Eyes</span></span>
        </a>
        <p class="footer-desc">
          Real-time industrial AI vision for automated manufacturing. Sub-millimeter GD&amp;T measurements, YOLOv11 segmentation, and direct PLC reject actuation with 100% on-premise privacy.
        </p>
        <div class="footer-badges">
          <span class="pill-badge"><span class="pulse-dot" aria-hidden="true"></span> Edge Engine: Operational</span>
          <span class="pill-badge">Air-Gapped Privacy</span>
        </div>
      </div>

      <div class="footer-col">
        <span class="footer-heading">Platform</span>
        <ul class="footer-links">
          <li><a href="/#features">Core Features</a></li>
          <li><a href="/#demo">Interactive Simulator</a></li>
          <li><a href="/#how-it-works">5-Stage Vision Pipeline</a></li>
          <li><a href="/#hardware">Hardware &amp; PLC Fieldbus</a></li>
          <li><a href="/#benchmarks">Speed Benchmarks</a></li>
          <li><a href="/#faq">Industrial FAQ</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <span class="footer-heading">Fieldbus &amp; Vision</span>
        <ul class="footer-links">
          <li><a href="/#hardware">Modbus TCP / RTU (RS485)</a></li>
          <li><a href="/#hardware">Arduino &amp; ESP32 USB Relays</a></li>
          <li><a href="/#hardware">Siemens, Omron &amp; Mitsubishi</a></li>
          <li><a href="/#features">GigE &amp; USB3 Industrial Cameras</a></li>
          <li><a href="/#features">YOLOv11 Polygon Segmentation</a></li>
          <li><a href="/#features">GD&amp;T Calibrated Calipers</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <span class="footer-heading">Open Source &amp; Code</span>
        <ul class="footer-links">
          <li><a href="https://github.com/Code8Byte/test-ai" target="_blank" rel="noopener">GitHub Repository</a></li>
          <li><a href="https://github.com/Code8Byte/test-ai/releases" target="_blank" rel="noopener">Release Notes</a></li>
          <li><a href="/#download">Windows 64-Bit Installer</a></li>
          <li><a href="https://github.com/Code8Byte/test-ai/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">Contributing Guide</a></li>
          <li><a href="https://github.com/Code8Byte/test-ai/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-copy">
        &copy; <?= date('Y') ?> AutomaEyes. Real-Time Industrial AI Vision for Automated Quality Control.
      </div>
      <div class="footer-sub-links">
        <span class="footer-meta-pill">WINDOWS 10/11 &middot; 64-BIT</span>
        <a href="<?= e(DOWNLOAD_PAGE) ?>" class="footer-link-highlight">Download Installer</a>
        <a href="https://github.com/Code8Byte/test-ai" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </div>
</footer>

<script>
// Mobile Navigation Toggle
(function () {
  var toggleBtn = document.getElementById('nav-toggle-btn');
  var navMenu = document.getElementById('nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', function () {
      var expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('is-open', !expanded);
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      });
    });
  }

  // Scrollspy active state sync using IntersectionObserver
  var navLinks = document.querySelectorAll('.site-nav-menu a');
  var sections = document.querySelectorAll('section[id]');
  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            var isActive = href === '#' + id || href === '/#' + id;
            link.classList.toggle('is-active', isActive);
            link.setAttribute('aria-current', isActive ? 'true' : 'false');
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(function (sec) { observer.observe(sec); });
  }
})();
</script>
</body>
</html>
