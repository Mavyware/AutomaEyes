/**
 * AutomaEyes Interactive Edge Inspection Simulator
 * Demonstrates real-time industrial AI vision:
 * - Sub-pixel polygon segmentation
 * - Sub-millimeter GD&T caliper tolerance verification
 * - Direct 24V PLC solenoid pulse actuation
 */
(function () {
  'use strict';

  var PARTS = {
    pcb: {
      name: 'SMT Electronic Board (PCB-A)',
      target: 'Solder short bridge between QFP IC pins 14 & 15',
      cycleTime: '11.8 ms',
      tolerance: 'Min clearance 0.40 mm',
      okStats: { status: 'PASS', confidence: '0.982', value: 'Clearance: 0.48 mm (OK)', gdt: 'Within ISO-1101 Class A' },
      ngStats: { status: 'REJECT', confidence: '0.994', value: 'Short bridge: 0.12 mm (FAIL)', gdt: 'USL Exceeded: +0.28 mm flash' },
      render: function (ctx, W, H, isNg, showMask, showGdt, scanProgress, isScanning) {
        // PCB Substrate
        ctx.fillStyle = '#0f261c';
        ctx.fillRect(40, 40, W - 80, H - 80);
        ctx.strokeStyle = '#1a4734';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, W - 80, H - 80);

        // Ground planes and copper traces
        ctx.strokeStyle = '#2b6e51';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(60, 80); ctx.lineTo(140, 80); ctx.lineTo(180, 120);
        ctx.moveTo(60, 180); ctx.lineTo(130, 180); ctx.lineTo(160, 150);
        ctx.moveTo(420, 90); ctx.lineTo(360, 90); ctx.lineTo(330, 120);
        ctx.stroke();

        // QFP IC Package
        var cx = W / 2, cy = H / 2;
        ctx.fillStyle = '#14171d';
        ctx.strokeStyle = '#384252';
        ctx.lineWidth = 2;
        ctx.fillRect(cx - 70, cy - 70, 140, 140);
        ctx.strokeRect(cx - 70, cy - 70, 140, 140);

        // Pin 1 Mark & Laser Text
        ctx.fillStyle = '#00f0c0';
        ctx.beginPath(); ctx.arc(cx - 50, cy - 50, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7a889b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('AE-ARM9', cx - 24, cy - 6);
        ctx.fillText('REV 3.2', cx - 22, cy + 12);

        // IC Gull-wing Pins
        var numPins = 10;
        var pinSpacing = 12;
        var pinW = 6, pinLen = 22;
        for (var i = 0; i < numPins; i++) {
          var offset = -((numPins - 1) * pinSpacing) / 2 + i * pinSpacing;
          ctx.fillStyle = '#c5cfdb';
          // Top & Bottom pins
          ctx.fillRect(cx + offset - pinW / 2, cy - 70 - pinLen, pinW, pinLen);
          ctx.fillRect(cx + offset - pinW / 2, cy + 70, pinW, pinLen);
          // Left & Right pins
          ctx.fillRect(cx - 70 - pinLen, cy + offset - pinW / 2, pinLen, pinW);
          ctx.fillRect(cx + 70, cy + offset - pinW / 2, pinLen, pinW);
        }

        // Defect: Solder Bridge between Right Pins 4 and 5
        var defectX = cx + 70 + 4;
        var defectY = cy - pinSpacing / 2;
        var defectDiscovered = !isScanning || scanProgress >= 0.46;

        if (isNg) {
          ctx.fillStyle = '#d0d8e2';
          ctx.beginPath();
          ctx.ellipse(defectX + 4, defectY, 8, 10, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // YOLO Polygon Segmentation Mask
          if (showMask && defectDiscovered) {
            ctx.fillStyle = 'rgba(255, 68, 102, 0.35)';
            ctx.strokeStyle = '#ff4466';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(defectX - 2, defectY - 12);
            ctx.lineTo(defectX + 12, defectY - 10);
            ctx.lineTo(defectX + 14, defectY + 10);
            ctx.lineTo(defectX - 1, defectY + 12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Defect Tag Callout
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            ctx.fillText('NG: SOLDER_BRIDGE (0.994)', defectX + 26, defectY - 10);
            ctx.strokeStyle = '#ff4466';
            ctx.beginPath();
            ctx.moveTo(defectX + 12, defectY);
            ctx.lineTo(defectX + 24, defectY - 10);
            ctx.stroke();
          }
        } else if (showMask && defectDiscovered) {
          // OK Inspection Bounding Polygons
          ctx.strokeStyle = 'rgba(0, 240, 192, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - 75 - pinLen, cy - 75 - pinLen, 150 + pinLen * 2, 150 + pinLen * 2);
          ctx.fillStyle = '#00f0c0';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText('OK: PINS_CLEAR (0.982)', cx - 60, cy - 78 - pinLen);
        }

        // GD&T Tolerancing Calipers
        if (showGdt && (!isScanning || scanProgress >= 0.52)) {
          var y1 = cy - pinSpacing;
          var y2 = cy;
          var gx = cx + 70 + pinLen + 20;
          ctx.strokeStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx - 8, y1); ctx.lineTo(gx + 8, y1);
          ctx.moveTo(gx - 8, y2); ctx.lineTo(gx + 8, y2);
          ctx.moveTo(gx, y1); ctx.lineTo(gx, y2);
          ctx.stroke();

          ctx.fillStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.font = '10px "JetBrains Mono", monospace';
          var gapText = isNg ? 'd = 0.12 mm (< 0.40 USL)' : 'd = 0.48 mm (OK)';
          ctx.fillText(gapText, gx + 12, (y1 + y2) / 2 + 16);
        }
      }
    },

    stamping: {
      name: 'Automotive Stamped Bracket',
      target: 'Bore diameter ovality and burr flash on mounting hole',
      cycleTime: '9.4 ms',
      tolerance: 'Ø 24.00 mm ± 0.05 mm (GD&T Roundness)',
      okStats: { status: 'PASS', confidence: '0.991', value: 'Ø 24.02 mm (Ovality: 0.012 mm)', gdt: 'Parallelism: 0.008 mm' },
      ngStats: { status: 'REJECT', confidence: '0.988', value: 'Ø 24.16 mm (Ovality: 0.14 mm)', gdt: 'Burr Flash: +0.22 mm (FAIL)' },
      render: function (ctx, W, H, isNg, showMask, showGdt, scanProgress, isScanning) {
        var cx = W / 2, cy = H / 2;
        // Stamped metal plate body
        ctx.fillStyle = '#1c222e';
        ctx.strokeStyle = '#414f66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - 160, cy - 100, 320, 200, 16);
        ctx.fill();
        ctx.stroke();

        // Brushed metal grain texture simulation
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (var x = cx - 150; x < cx + 150; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, cy - 90);
          ctx.lineTo(x + 20, cy + 90);
          ctx.stroke();
        }

        // Left & Right Mount Slots
        ctx.fillStyle = '#0b0e14';
        ctx.beginPath(); ctx.roundRect(cx - 130, cy - 25, 24, 50, 10); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(cx + 106, cy - 25, 24, 50, 10); ctx.fill(); ctx.stroke();

        // Center Precision Bore
        var r = 55;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#0b0e14';
        ctx.fill();
        ctx.strokeStyle = '#586985';
        ctx.stroke();

        var defectDiscovered = !isScanning || scanProgress >= 0.48;

        // Defect: Metal Stamping Burr & Hole Ovality
        if (isNg) {
          ctx.fillStyle = '#7a8ea8';
          ctx.beginPath();
          ctx.moveTo(cx + r - 2, cy - 15);
          ctx.lineTo(cx + r - 16, cy - 2);
          ctx.lineTo(cx + r - 2, cy + 12);
          ctx.closePath();
          ctx.fill();

          if (showMask && defectDiscovered) {
            ctx.fillStyle = 'rgba(255, 68, 102, 0.4)';
            ctx.strokeStyle = '#ff4466';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx + r + 2, cy - 20);
            ctx.lineTo(cx + r - 20, cy - 2);
            ctx.lineTo(cx + r + 2, cy + 18);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            ctx.fillText('NG: DIE_BURR_FLASH (0.988)', cx + r + 14, cy - 8);
          }
        }

        // GD&T Diameter Caliper Reticle
        if (showGdt && (!isScanning || scanProgress >= 0.52)) {
          ctx.strokeStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Diametrical Dimension Line
          ctx.beginPath();
          ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
          ctx.moveTo(cx - r, cy - 6); ctx.lineTo(cx - r, cy + 6);
          ctx.moveTo(cx + r, cy - 6); ctx.lineTo(cx + r, cy + 6);
          ctx.stroke();

          ctx.fillStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.font = '11px "JetBrains Mono", monospace';
          var text = isNg ? 'Ø 24.16 mm [FAIL > 24.05]' : 'Ø 24.02 mm [PASS ±0.05]';
          ctx.fillText(text, cx - 65, cy - 12);
        }
      }
    },

    vial: {
      name: 'Pharmaceutical Glass Vial',
      target: 'Liquid meniscus fill volume & rim micro-fissures',
      cycleTime: '8.1 ms',
      tolerance: 'Fill height 45.0 mm ± 1.5 mm; Zero cracks',
      okStats: { status: 'PASS', confidence: '0.997', value: 'Fill: 44.8 mm (10.02 mL)', gdt: 'Meniscus: Level (Tilt 0.2°)' },
      ngStats: { status: 'REJECT', confidence: '0.991', value: 'Underfill: 38.2 mm (FAIL)', gdt: 'Hairline Fissure at Neck' },
      render: function (ctx, W, H, isNg, showMask, showGdt, scanProgress, isScanning) {
        var cx = W / 2, cy = H / 2;
        var vw = 110, vh = 220;

        // Vial Outer Glass
        ctx.fillStyle = 'rgba(30, 45, 60, 0.4)';
        ctx.strokeStyle = '#607996';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Neck and Body
        ctx.moveTo(cx - 30, cy - vh / 2);
        ctx.lineTo(cx + 30, cy - vh / 2);
        ctx.lineTo(cx + 30, cy - vh / 2 + 30);
        ctx.lineTo(cx + vw / 2, cy - vh / 2 + 50);
        ctx.lineTo(cx + vw / 2, cy + vh / 2 - 12);
        ctx.arcTo(cx + vw / 2, cy + vh / 2, cx, cy + vh / 2, 12);
        ctx.arcTo(cx - vw / 2, cy + vh / 2, cx - vw / 2, cy + vh / 2 - 12, 12);
        ctx.lineTo(cx - vw / 2, cy - vh / 2 + 50);
        ctx.lineTo(cx - 30, cy - vh / 2 + 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Liquid Fill
        var fillLevel = isNg ? 50 : 120;
        var fillY = cy + vh / 2 - 12 - fillLevel;
        ctx.fillStyle = isNg ? 'rgba(255, 68, 102, 0.25)' : 'rgba(0, 240, 192, 0.25)';
        ctx.beginPath();
        ctx.moveTo(cx - vw / 2 + 4, fillY);
        ctx.lineTo(cx + vw / 2 - 4, fillY);
        ctx.lineTo(cx + vw / 2 - 4, cy + vh / 2 - 12);
        ctx.arcTo(cx + vw / 2 - 4, cy + vh / 2 - 2, cx, cy + vh / 2 - 2, 10);
        ctx.arcTo(cx - vw / 2 + 4, cy + vh / 2 - 2, cx - vw / 2 + 4, cy + vh / 2 - 12, 10);
        ctx.closePath();
        ctx.fill();

        var crackDiscovered = !isScanning || scanProgress >= 0.28;
        var fillDiscovered = !isScanning || scanProgress >= 0.62;

        // Defect: Hairline Crack on Glass Shoulder
        if (isNg) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx + 32, cy - vh / 2 + 36);
          ctx.lineTo(cx + 44, cy - vh / 2 + 48);
          ctx.lineTo(cx + 40, cy - vh / 2 + 56);
          ctx.stroke();

          if (showMask && crackDiscovered) {
            ctx.fillStyle = 'rgba(255, 68, 102, 0.45)';
            ctx.strokeStyle = '#ff4466';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx + 40, cy - vh / 2 + 46, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            ctx.fillText('NG: GLASS_FISSURE', cx + 64, cy - vh / 2 + 44);
            ctx.fillText('UNDERFILL: -6.8 mm', cx + 64, fillY + 6);
          }
        }

        // GD&T Meniscus Fill Height Caliper
        if (showGdt && fillDiscovered) {
          var calX = cx - vw / 2 - 20;
          ctx.strokeStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(calX, cy + vh / 2 - 12);
          ctx.lineTo(calX, fillY);
          ctx.moveTo(calX - 6, cy + vh / 2 - 12); ctx.lineTo(calX + 6, cy + vh / 2 - 12);
          ctx.moveTo(calX - 6, fillY); ctx.lineTo(calX + 6, fillY);
          ctx.stroke();

          ctx.fillStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.font = '10px "JetBrains Mono", monospace';
          var hText = isNg ? 'h=38.2mm (LSL 43.5)' : 'h=44.8mm (OK)';
          ctx.fillText(hText, calX - 95, (fillY + cy + vh / 2 - 12) / 2);
        }
      }
    },

    bolt: {
      name: 'High-Tensile Flange Bolt M8',
      target: 'Thread pitch crest stripping and flank angle runout',
      cycleTime: '10.2 ms',
      tolerance: 'Pitch 1.25 mm ± 0.02 mm; Thread angle 60°',
      okStats: { status: 'PASS', confidence: '0.993', value: 'Pitch: 1.248 mm (Nominal)', gdt: 'Total Runout: 0.014 mm' },
      ngStats: { status: 'REJECT', confidence: '0.996', value: 'Stripped Thread #4 & #5', gdt: 'Pitch crest flattened 0.35 mm' },
      render: function (ctx, W, H, isNg, showMask, showGdt, scanProgress, isScanning) {
        var cx = W / 2, cy = H / 2;
        var boltW = 56;
        var boltH = 190;

        // Bolt Hex Flange Head
        ctx.fillStyle = '#262d3d';
        ctx.strokeStyle = '#50617d';
        ctx.lineWidth = 2;
        ctx.fillRect(cx - 50, cy - boltH / 2, 100, 26);
        ctx.strokeRect(cx - 50, cy - boltH / 2, 100, 26);

        // Circular Flange Collar
        ctx.fillRect(cx - 60, cy - boltH / 2 + 26, 120, 10);
        ctx.strokeRect(cx - 60, cy - boltH / 2 + 26, 120, 10);

        // Bolt Thread Shaft
        var shaftTop = cy - boltH / 2 + 36;
        var threads = 12;
        var tHeight = 11;
        var defectDiscovered = !isScanning || scanProgress >= 0.50;

        for (var t = 0; t < threads; t++) {
          var ty = shaftTop + t * tHeight;
          var isDamaged = isNg && (t === 4 || t === 5);

          ctx.fillStyle = isDamaged ? '#452b32' : '#1e2430';
          ctx.strokeStyle = isDamaged ? '#ff4466' : '#50617d';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(cx - boltW / 2, ty);
          ctx.lineTo(cx - boltW / 2 - (isDamaged ? 2 : 8), ty + tHeight / 2);
          ctx.lineTo(cx - boltW / 2, ty + tHeight);
          ctx.lineTo(cx + boltW / 2, ty + tHeight);
          ctx.lineTo(cx + boltW / 2 + (isDamaged ? 1 : 8), ty + tHeight / 2);
          ctx.lineTo(cx + boltW / 2, ty);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          if (isDamaged && showMask && defectDiscovered) {
            ctx.fillStyle = 'rgba(255, 68, 102, 0.4)';
            ctx.fillRect(cx - boltW / 2 - 12, ty - 2, boltW + 24, tHeight + 4);
          }
        }

        if (isNg && showMask && defectDiscovered) {
          ctx.fillStyle = '#ff4466';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText('NG: STRIPPED_CREST_T4', cx + boltW / 2 + 18, shaftTop + 4.5 * tHeight);
        }

        if (showGdt && (!isScanning || scanProgress >= 0.58)) {
          ctx.strokeStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.lineWidth = 1.5;
          var gx = cx + boltW / 2 + 12;
          ctx.beginPath();
          ctx.moveTo(gx, shaftTop + 2 * tHeight);
          ctx.lineTo(gx, shaftTop + 3 * tHeight);
          ctx.moveTo(gx - 4, shaftTop + 2 * tHeight); ctx.lineTo(gx + 4, shaftTop + 2 * tHeight);
          ctx.moveTo(gx - 4, shaftTop + 3 * tHeight); ctx.lineTo(gx + 4, shaftTop + 3 * tHeight);
          ctx.stroke();

          ctx.fillStyle = isNg ? '#ff4466' : '#00f0c0';
          ctx.font = '10px "JetBrains Mono", monospace';
          var pText = isNg ? 'p = 0.88 mm (FAIL)' : 'p = 1.25 mm (OK)';
          ctx.fillText(pText, gx + 8, shaftTop + 2.5 * tHeight + 3);
        }
      }
    }
  };

  function initSimulator() {
    var canvas = document.getElementById('demo-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var currentPartKey = 'pcb';
    var isNg = false;
    var showMask = true;
    var showGdt = true;
    var solenoidActive = false;
    var solenoidTimer = null;

    var partSelect = document.getElementById('demo-part-select');
    var btnOk = document.getElementById('demo-sample-ok');
    var btnNg = document.getElementById('demo-sample-ng');
    var toggleMask = document.getElementById('demo-toggle-mask');
    var toggleGdt = document.getElementById('demo-toggle-gdt');
    var btnSolenoid = document.getElementById('demo-plc-pulse');
    var btnTriggerScan = document.getElementById('demo-trigger-scan');
    var cameraStatusText = document.getElementById('demo-camera-status-text');
    var statusBadge = document.getElementById('demo-status-badge');
    var confVal = document.getElementById('demo-conf-val');
    var latencyVal = document.getElementById('demo-latency-val');
    var gdtVal = document.getElementById('demo-gdt-val');
    var plcStatus = document.getElementById('demo-plc-status');
    var coilBit = document.getElementById('demo-coil-bit');

    var animFrameId = null;
    var isLooping = false;
    var demoSection = document.getElementById('demo');

    // Single-pass laser scan state: starts at up frame (0.0) -> down frame (1.0)
    var isScanning = false;
    var scanStartTime = 0;
    var scanDuration = 1150; // 1.15s clean telecentric pass
    var scanProgress = 1.0;  // 0.0 = top, 1.0 = bottom
    var laserOpacity = 0.0;
    var laserFadeStart = 0;
    var hasScannedOnce = false;

    var isHoveringCanvas = false;
    var mouseCanvasX = 340;
    var mouseCanvasY = 210;

    function triggerScan(force) {
      if (isScanning && !force) return;
      isScanning = true;
      scanStartTime = performance.now();
      scanProgress = 0.0;
      laserOpacity = 1.0;
      laserFadeStart = 0;

      if (cameraStatusText) {
        cameraStatusText.textContent = 'LINE SCAN IN PROGRESS // TELECENTRIC SWEEP';
      }

      updateTelemetry();

      if (!isLooping) {
        isLooping = true;
        animFrameId = requestAnimationFrame(loop);
      }
    }

    function onScrollCheck() {
      if (!demoSection) return;
      var rect = demoSection.getBoundingClientRect();
      var windowH = window.innerHeight;

      // Section entered active viewing zone (top within bottom 72% of viewport)
      var inView = rect.top < windowH * 0.72 && rect.bottom > windowH * 0.20;

      if (inView) {
        if (!hasScannedOnce) {
          hasScannedOnce = true;
          triggerScan();
        }
      } else if (rect.bottom < -120 || rect.top > windowH + 120) {
        // Scrolled completely past or above; reset so re-entering triggers once again
        hasScannedOnce = false;
      }
    }
    window.addEventListener('scroll', onScrollCheck, { passive: true });
    // Check initial position in case page was loaded scrolled to simulator
    onScrollCheck();

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    function render() {
      var W = canvas.width;
      var H = canvas.height;
      var now = performance.now();

      // Advance single-pass scan animation (never stops midway when scrolling stops!)
      if (isScanning) {
        var elapsed = now - scanStartTime;
        var p = Math.min(1.0, elapsed / scanDuration);
        scanProgress = p;
        laserOpacity = 1.0;

        if (p >= 1.0) {
          isScanning = false;
          scanProgress = 1.0; // Completed at bottom frame
          laserFadeStart = now;
          if (cameraStatusText) {
            cameraStatusText.textContent = 'LIVE SENSOR // 120 FPS // BASLER GIGE VISION';
          }
        }
      } else if (laserFadeStart > 0) {
        // Smoothly dissolve laser line so it doesn't stay frozen on workpiece
        var fadeElapsed = now - laserFadeStart;
        laserOpacity = Math.max(0, 1.0 - (fadeElapsed / 280));
        if (laserOpacity <= 0) {
          laserFadeStart = 0;
        }
      } else {
        laserOpacity = 0.0;
      }

      ctx.save();
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      var grid = 24 * dpr;
      for (var x = 0; x < W; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (var y = 0; y < H; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Camera Crosshair Overlay (tracks mouse on hover, centers otherwise)
      var rx = isHoveringCanvas ? mouseCanvasX * dpr : W / 2;
      var ry = isHoveringCanvas ? mouseCanvasY * dpr : H / 2;
      ctx.strokeStyle = isHoveringCanvas ? 'rgba(0, 240, 192, 0.28)' : 'rgba(0, 240, 192, 0.14)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(rx, 16 * dpr); ctx.lineTo(rx, H - 16 * dpr);
      ctx.moveTo(16 * dpr, ry); ctx.lineTo(W - 16 * dpr, ry);
      ctx.stroke();
      ctx.setLineDash([]);

      // Render Selected Part with dynamic scan revelation
      var part = PARTS[currentPartKey];
      if (part) {
        part.render(ctx, W, H, isNg, showMask, showGdt, scanProgress, isScanning);
      }

      // Single-pass laser sweep from up frame (0%) to down frame (100%)
      var sweepEl = document.querySelector('.sim-laser-sweep');
      if (laserOpacity > 0.005) {
        var scanY = 10 * dpr + scanProgress * (H - 20 * dpr);

        if (sweepEl) {
          sweepEl.style.setProperty('--laser-y', (scanProgress * 100).toFixed(1) + '%');
          sweepEl.style.setProperty('--laser-opacity', laserOpacity.toFixed(2));
        }

        ctx.save();
        ctx.globalAlpha = laserOpacity;

        // Laser beam line
        ctx.strokeStyle = '#00f0c0';
        ctx.lineWidth = 2.5 * dpr;
        ctx.shadowColor = '#00f0c0';
        ctx.shadowBlur = 14 * dpr;
        ctx.beginPath();
        ctx.moveTo(16 * dpr, scanY);
        ctx.lineTo(W - 16 * dpr, scanY);
        ctx.stroke();

        // Laser soft light wash
        var lGrad = ctx.createLinearGradient(0, scanY - 24 * dpr, 0, scanY + 24 * dpr);
        lGrad.addColorStop(0, 'rgba(0, 240, 192, 0)');
        lGrad.addColorStop(0.5, 'rgba(0, 240, 192, 0.18)');
        lGrad.addColorStop(1, 'rgba(0, 240, 192, 0)');
        ctx.fillStyle = lGrad;
        ctx.fillRect(16 * dpr, scanY - 24 * dpr, W - 32 * dpr, 48 * dpr);

        // Leading edge emitter sparkles
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0c0';
        ctx.shadowBlur = 8 * dpr;
        ctx.beginPath();
        ctx.arc(20 * dpr, scanY, 3 * dpr, 0, Math.PI * 2);
        ctx.arc(W - 20 * dpr, scanY, 3 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (sweepEl) {
        sweepEl.style.setProperty('--laser-opacity', '0');
      }

      // Solenoid 24V Mechanical Reject Ejector Kick Visual
      if (solenoidActive) {
        ctx.save();
        var ramWidth = 140 * dpr;
        var ramHeight = 36 * dpr;
        var ramY = H / 2 - ramHeight / 2;

        ctx.fillStyle = '#ff4466';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * dpr;
        ctx.shadowColor = '#ff4466';
        ctx.shadowBlur = 20 * dpr;
        ctx.fillRect(W - ramWidth, ramY, ramWidth, ramHeight);
        ctx.strokeRect(W - ramWidth, ramY, ramWidth, ramHeight);

        // Impact spark lines
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2 * dpr;
        for (var s = 0; s < 6; s++) {
          ctx.beginPath();
          ctx.moveTo(W - ramWidth, ramY + (s * 6 + 3) * dpr);
          ctx.lineTo(W - ramWidth - 25 * dpr - Math.random() * 15 * dpr, ramY + (s * 6 - 5 + Math.random() * 16) * dpr);
          ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + (11 * dpr) + 'px "JetBrains Mono", monospace';
        ctx.fillText('24V SOLENOID ACTUATED', W - ramWidth + 12 * dpr, H / 2 + 4 * dpr);
        ctx.restore();
      }

      // Camera Timestamp & Frame HUD
      ctx.fillStyle = 'rgba(124, 140, 165, 0.75)';
      ctx.font = (10 * dpr) + 'px "JetBrains Mono", monospace';
      var frameStatus = isScanning
        ? 'FRAME SCAN: ' + Math.round(scanProgress * 100) + '% // TELECENTRIC PROFILOMETER'
        : 'OPTICS: BASLER GIGE 5.0MP // EXPOSURE: 1/2000s // ILLUM: COAXIAL 6500K';
      ctx.fillText(frameStatus, 16 * dpr, 24 * dpr);
      ctx.fillText('ONNX TENSORRT ACCELERATED // ZERO JITTER ENVELOPE // 120 FPS', 16 * dpr, H - 16 * dpr);

      ctx.restore();
      updateTelemetry();
    }

    function loop() {
      if (!isLooping) return;
      render();
      animFrameId = requestAnimationFrame(loop);
    }

    function updateTelemetry() {
      var part = PARTS[currentPartKey];
      var stats = isNg ? part.ngStats : part.okStats;

      if (isScanning && scanProgress < 0.90) {
        if (statusBadge) {
          statusBadge.textContent = 'SCANNING...';
          statusBadge.className = 'status-badge status-scanning';
        }
        if (confVal) confVal.textContent = (0.500 + scanProgress * 0.48).toFixed(3);
        if (latencyVal) latencyVal.textContent = (scanProgress * 11.8).toFixed(1) + ' ms';
        if (gdtVal) gdtVal.textContent = 'Acquiring point cloud...';
        if (plcStatus) {
          plcStatus.innerHTML = '<span class="conveyor-track">&gt;&gt;&gt;</span> LASER SWEEP ACTIVE &rarr; FRAME BUFFER ' + Math.round(scanProgress * 100) + '%';
        }
        return;
      }

      if (statusBadge) {
        statusBadge.textContent = stats.status;
        statusBadge.className = 'status-badge ' + (isNg ? 'status-reject' : 'status-pass');
      }
      if (confVal) confVal.textContent = stats.confidence;
      if (latencyVal) latencyVal.textContent = part.cycleTime;
      if (gdtVal) gdtVal.textContent = stats.gdt;

      if (coilBit) {
        coilBit.textContent = isNg ? 'COIL 0003: HIGH (1)' : 'COIL 0002: HIGH (1)';
      }
      if (plcStatus) {
        if (solenoidActive) {
          plcStatus.innerHTML = '<span class="conveyor-track" style="color:#ff5d6c;">[PULSE 120MS]</span> SOLENOID ENERGIZED &rarr; REJECT ACTUATED';
          plcStatus.className = 'plc-status-text plc-active';
        } else {
          if (isNg) {
            plcStatus.innerHTML = '<span class="conveyor-track" style="color:#ff4466;">[REJECT READY]</span> COIL 0003 ARMED &rarr; REJECT ON TRIGGER';
            plcStatus.className = 'plc-status-text';
          } else {
            plcStatus.innerHTML = '<span class="conveyor-track">&gt;&gt;&gt;</span> LINE ADVANCING &rarr; CONVEYOR RUN';
            plcStatus.className = 'plc-status-text';
          }
        }
      }
    }

    function fireSolenoid() {
      solenoidActive = true;
      clearTimeout(solenoidTimer);
      solenoidTimer = setTimeout(function () {
        solenoidActive = false;
      }, 350);
    }

    // Interactive Controls & Triggers
    if (btnTriggerScan) {
      btnTriggerScan.addEventListener('click', function () {
        triggerScan(true);
      });
    }

    // Clicking canvas triggers fresh scan pass
    canvas.addEventListener('click', function () {
      triggerScan(true);
    });

    if (partSelect) {
      partSelect.addEventListener('change', function () {
        currentPartKey = partSelect.value;
        triggerScan(true);
      });
    }

    if (btnOk) {
      btnOk.addEventListener('click', function () {
        isNg = false;
        btnOk.classList.add('active');
        if (btnNg) btnNg.classList.remove('active');
        triggerScan(true);
      });
    }

    if (btnNg) {
      btnNg.addEventListener('click', function () {
        isNg = true;
        btnNg.classList.add('active');
        if (btnOk) btnOk.classList.remove('active');
        triggerScan(true);
      });
    }

    if (toggleMask) {
      toggleMask.addEventListener('change', function () {
        showMask = toggleMask.checked;
      });
    }

    if (toggleGdt) {
      toggleGdt.addEventListener('change', function () {
        showGdt = toggleGdt.checked;
      });
    }

    if (btnSolenoid) {
      btnSolenoid.addEventListener('click', function () {
        fireSolenoid();
      });
    }

    // Interactive Canvas Mouse Reticle Tracking
    canvas.addEventListener('mouseenter', function () {
      isHoveringCanvas = true;
    });
    canvas.addEventListener('mouseleave', function () {
      isHoveringCanvas = false;
    });
    canvas.addEventListener('mousemove', function (e) {
      isHoveringCanvas = true;
      var rect = canvas.getBoundingClientRect();
      mouseCanvasX = Math.max(10, Math.min(rect.width - 10, e.clientX - rect.left));
      mouseCanvasY = Math.max(10, Math.min(rect.height - 10, e.clientY - rect.top));

      var px = (mouseCanvasX / rect.width) * 680;
      var py = (mouseCanvasY / rect.height) * 420;
      var reticleEl = document.querySelector('.reticle-coords');
      if (reticleEl) {
        reticleEl.textContent = 'RETICLE: X: ' + px.toFixed(2) + ' Y: ' + py.toFixed(2) + ' · GAIN: 2.4 dB';
      }
    });

    // Bento Card Interactive Spotlight Tracking
    document.querySelectorAll('.bento-card, .features-grid > div, .control-block').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        el.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });
    });

    window.addEventListener('resize', resize);
    resize();

    // IntersectionObserver for performance
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !isLooping) {
        isLooping = true;
        animFrameId = requestAnimationFrame(loop);
      } else if (!visible && isLooping && !isScanning) {
        isLooping = false;
        if (animFrameId) cancelAnimationFrame(animFrameId);
      }
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
  } else {
    initSimulator();
  }
})();
