<?php
/** @var string $pageTitle */
/** @var string|null $bodyClass */
$user = Auth::user();
$appVersion = Release::version() ?: '0.3.2';
?><!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($pageTitle ?? (APP_NAME . ': Industrial Edge AI Quality Control')) ?></title>
<meta name="description" content="AutomaEyes: High-Speed Edge AI Vision for Factory Quality Control. Real-time defect detection, sub-millimeter GD&T measurements, Modbus/PLC actuation, and 100% local privacy.">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="<?= e($bodyClass ?? '') ?>">
<header class="site-header" id="site-header">
  <div class="header-inner">
    <a href="/" class="brand" aria-label="AutomaEyes Home">
      <span class="brand-mark" aria-hidden="true">
        <img src="/assets/img/logo-64.png" width="30" height="30" alt="">
      </span>
      <span class="brand-name">Automa<span class="accent">Eyes</span></span>
      <span class="brand-tag" title="Industrial Release">v<?= e($appVersion) ?></span>
    </a>

    <nav class="site-nav-menu" id="nav-menu" aria-label="Primary Navigation">
      <a class="nav-link" href="/#features">Features</a>
      <a class="nav-link" href="/#demo">Live Demo</a>
      <a class="nav-link" href="/#how-it-works">Pipeline</a>
      <a class="nav-link" href="/#hardware">Hardware &amp; PLC</a>
      <a class="nav-link" href="/#benchmarks">Benchmarks</a>
      <a class="nav-link" href="/#faq">FAQ</a>
    </nav>

    <div class="site-nav-actions">
      <?php if ($user): ?>
        <a class="nav-user-badge" href="/welcome.php" title="View connected account">
          <span class="pulse-dot"></span>
          <span class="nav-user"><?= e(explode(' ', $user['name'])[0]) ?></span>
        </a>
        <a class="btn btn-ghost btn-sm" href="/logout.php">Log out</a>
        <a class="btn btn-primary btn-sm" href="<?= e(DOWNLOAD_PAGE) ?>">Download</a>
      <?php else: ?>
        <a class="btn btn-ghost btn-sm" href="/login.php">Log in</a>
        <a class="btn btn-primary btn-sm" href="<?= e(DOWNLOAD_PAGE) ?>">
          <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>Download</span>
        </a>
      <?php endif; ?>

      <button class="nav-hamburger" id="nav-toggle-btn" aria-label="Toggle Navigation Menu" aria-expanded="false" aria-controls="nav-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </div>
</header>
