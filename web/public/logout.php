<?php
require __DIR__ . '/../src/bootstrap.php';

// "Use a different account" in the desktop app flow sends ?next=/login.php?...
// so that after logout the user goes straight back to the app's login
// screen, not the homepage. Only internal paths are accepted — this must
// never become an open redirect to an external domain.
$next = (string) ($_GET['next'] ?? '');
$safeNext = '/';
if ($next !== '' && str_starts_with($next, '/') && !str_starts_with($next, '//') && !str_starts_with($next, '/\\') && !preg_match('/[\r\n\0]/', $next)) {
    $safeNext = $next;
}

Auth::logout();
redirect($safeNext);
