/**
 * AutomaEyes - Interactive Industrial Defect Inspector Simulator
 *
 * Demonstrates real-time edge vision inspection right in the browser:
 * - 4 Industrial parts: PCB Assembly, Automotive Stamping, Pharma Vial, Machined Bolt
 * - OK (Golden Part) vs NG (Defect Detected) modes
 * - Toggleable AI layers: Bounding Boxes, Segmentation Masks, GD&T Calipers
 * - Real-time animated laser scan line
 * - Interactive 24V Solenoid Actuator Pulse Simulation (GPIO Pin 7)
 * - Industrial HUD telemetry (Cycle Time, Confidence, Verdict, Defect Log)
 */
(function () {
  'use strict';

  var container = document.getElementById('inspection-simulator');
  if (!container) return;

  // Industrial Parts Database
  var PARTS = {
    pcb: {
      name: 'PCB Electronic Assembly',
      category: 'SMT Electronics',
      camera: 'GigE 1080p @ 60 FPS',
      model: 'yolo11n-seg-pcb',
      dimensions: '120.0 x 85.0 mm',
      ok: {
        verdict: 'PASS',
        verdictClass: 'pass',
        statusText: 'ALL IPC-A-610 FILLET CHECKS CONFORMING',
        confidence: '99.4%',
        cycleTime: '13.2 ms',
        defectCount: 0,
        defects: [],
        outputPin: 'PIN 4 -> HIGH (CONVEYOR ADVANCE)',
        summary: '8/8 IC pins seated, 4/4 SMD chip resistors verified, solder meniscus nominal.'
      },
      ng: {
        verdict: 'REJECT',
        verdictClass: 'reject',
        statusText: 'SHORT CIRCUIT & MISSING COMPONENT DETECTED',
        confidence: '98.7%',
        cycleTime: '14.8 ms',
        defectCount: 3,
        defects: [
          { type: 'Solder Bridge', loc: 'IC-1 Pins 3-4', severity: 'CRITICAL', metric: '0.42mm short' },
          { type: 'Missing Component', loc: 'Resistor R14', severity: 'HIGH', metric: 'Empty pad' },
          { type: 'Component Skew', loc: 'Capacitor C7', severity: 'MEDIUM', metric: '18.4° offset' }
        ],
        outputPin: 'PIN 7 -> HIGH (ACTUATE REJECT FLAP)',
        summary: 'Solder bridge on IC-1 and missing R14 chip resistor violate assembly tolerance.'
      }
    },
    stamping: {
      name: 'Automotive Stamped Bracket',
      category: 'Sheet Metal & Chassis',
      camera: 'USB3 4K Industrial @ 45 FPS',
      model: 'yolo11n-seg-metal',
      dimensions: '210.0 x 140.0 mm',
      ok: {
        verdict: 'PASS',
        verdictClass: 'pass',
        statusText: 'ALL GD&T TOLERANCES WITHIN ENVELOPE',
        confidence: '99.1%',
        cycleTime: '15.6 ms',
        defectCount: 0,
        defects: [],
        outputPin: 'PIN 4 -> HIGH (ROBOT GRIPPER READY)',
        summary: 'Center bore Ø 12.02mm (spec: 12.00 ±0.05), flange flatness within 0.08mm.'
      },
      ng: {
        verdict: 'REJECT',
        verdictClass: 'reject',
        statusText: 'FATIGUE CRACK & HOLE OVALITY EXCEEDS LIMIT',
        confidence: '97.9%',
        cycleTime: '16.2 ms',
        defectCount: 2,
        defects: [
          { type: 'Hairline Crack', loc: 'Bend Radius R8', severity: 'CRITICAL', metric: '4.8mm length' },
          { type: 'Bore Ovality NG', loc: 'Center Hole', severity: 'HIGH', metric: 'Ø 12.38mm (+0.33mm)' }
        ],
        outputPin: 'PIN 7 -> HIGH (ACTUATE REJECT FLAP)',
        summary: 'Micro-crack at primary bend and center hole ovality exceed safety envelope.'
      }
    },
    vial: {
      name: 'Pharmaceutical Sterile Vial',
      category: 'Medical & Packaging',
      camera: 'GigE High-Speed Line Scan',
      model: 'yolo11n-seg-pharma',
      dimensions: '75.0 x Ø 24.0 mm',
      ok: {
        verdict: 'PASS',
        verdictClass: 'pass',
        statusText: 'STERILE CRIMP SEAL & FILL LEVEL NOMINAL',
        confidence: '99.8%',
        cycleTime: '11.4 ms',
        defectCount: 0,
        defects: [],
        outputPin: 'PIN 4 -> HIGH (PACKAGING LINE)',
        summary: 'Fill meniscus at 50.2mm (spec: 50.0 ±1.0), crimp gap 0.12mm (<0.30mm limit).'
      },
      ng: {
        verdict: 'REJECT',
        verdictClass: 'reject',
        statusText: 'CRIMP SEAL LEAK GAP & LIQUID UNDERFILL',
        confidence: '99.2%',
        cycleTime: '12.3 ms',
        defectCount: 2,
        defects: [
          { type: 'Seal Crimp Gap', loc: 'Alu Cap Flange', severity: 'CRITICAL', metric: '0.84mm gap' },
          { type: 'Liquid Underfill', loc: 'Meniscus Line', severity: 'HIGH', metric: '-8.6mm (-14%)' }
        ],
        outputPin: 'PIN 7 -> HIGH (ACTUATE REJECT FLAP)',
        summary: 'Aluminum cap not fully crimped; container integrity compromised.'
      }
    },
    bolt: {
      name: 'Precision M10 Threaded Bolt',
      category: 'Machining & Fasteners',
      camera: 'Telecentric Lens Macro 60 FPS',
      model: 'yolo11n-seg-fasteners',
      dimensions: '60.0 x Ø 16.0 mm',
      ok: {
        verdict: 'PASS',
        verdictClass: 'pass',
        statusText: 'THREAD PITCH & CREST PROFILES NOMINAL',
        confidence: '99.5%',
        cycleTime: '12.8 ms',
        defectCount: 0,
        defects: [],
        outputPin: 'PIN 4 -> HIGH (AUTO BINNING 01)',
        summary: 'Thread pitch 1.50mm nominal, crest burr index 0, total length 50.04mm.'
      },
      ng: {
        verdict: 'REJECT',
        verdictClass: 'reject',
        statusText: 'THREAD BURR FLASH & PITCH DISTORTION',
        confidence: '98.3%',
        cycleTime: '13.9 ms',
        defectCount: 2,
        defects: [
          { type: 'Thread Flank Burr', loc: 'Pitch Crest #4', severity: 'HIGH', metric: '0.38mm protrusion' },
          { type: 'Pitch Distort', loc: 'Lead Thread #2', severity: 'HIGH', metric: '1.74mm (+0.24mm)' }
        ],
        outputPin: 'PIN 7 -> HIGH (ACTUATE REJECT FLAP)',
        summary: 'Machining flash on thread crest #4 will cause cross-threading during assembly.'
      }
    }
  };

  // State
  var state = {
    part: 'pcb',
    isNg: true,
    showBoxes: true,
    showMasks: true,
    showDimensions: true,
    actuating: false,
    log: []
  };

  // DOM Elements
  var partTabs = container.querySelectorAll('[data-part]');
  var toggleOkBtn = container.querySelector('#demo-toggle-ok');
  var toggleNgBtn = container.querySelector('#demo-toggle-ng');
  var chkBoxes = container.querySelector('#chk-layer-boxes');
  var chkMasks = container.querySelector('#chk-layer-masks');
  var chkDims = container.querySelector('#chk-layer-dims');
  var btnTrigger = container.querySelector('#btn-actuate-solenoid');

  var canvasSvg = container.querySelector('#demo-svg-viewport');
  var hudVerdict = container.querySelector('#demo-verdict-tag');
  var hudCycleTime = container.querySelector('#demo-cycle-time');
  var hudConfidence = container.querySelector('#demo-confidence');
  var hudDefects = container.querySelector('#demo-defect-count');
  var hudOutput = container.querySelector('#demo-output-signal');
  var hudSummary = container.querySelector('#demo-summary-text');
  var hudModel = container.querySelector('#demo-model-badge');
  var hudCamera = container.querySelector('#demo-camera-badge');
  var logList = container.querySelector('#demo-event-log');
  var solenoidLight = container.querySelector('#solenoid-indicator');

  function addLog(msg, type) {
    var now = new Date();
    var timeStr = ('0' + now.getHours()).slice(-2) + ':' +
                  ('0' + now.getMinutes()).slice(-2) + ':' +
                  ('0' + now.getSeconds()).slice(-2) + '.' +
                  ('00' + now.getMilliseconds()).slice(-3);

    state.log.unshift({ time: timeStr, text: msg, type: type || 'info' });
    if (state.log.length > 5) state.log.pop();

    if (logList) {
      logList.innerHTML = state.log.map(function (item) {
        var cl = item.type === 'error' ? 'log-error' : (item.type === 'success' ? 'log-success' : 'log-info');
        return '<li class="' + cl + '"><span class="log-time">[' + item.time + ']</span> ' + item.text + '</li>';
      }).join('');
    }
  }

  function renderVectorGraphics() {
    if (!canvasSvg) return;

    var part = state.part;
    var isNg = state.isNg;
    var showB = state.showBoxes;
    var showM = state.showMasks;
    var showD = state.showDimensions;

    var html = '';

    // Technical Grid Background
    html += '<defs>' +
      '<pattern id="tech-grid" width="20" height="20" patternUnits="userSpaceOnUse">' +
      '<path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(30, 36, 51, 0.45)" stroke-width="0.8"/>' +
      '</pattern>' +
      '<linearGradient id="laser-grad" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="rgba(0, 240, 192, 0)"/>' +
      '<stop offset="50%" stop-color="rgba(0, 240, 192, 0.35)"/>' +
      '<stop offset="100%" stop-color="rgba(0, 240, 192, 0.85)"/>' +
      '</linearGradient>' +
      '<filter id="glow-danger" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur stdDeviation="3" result="blur" />' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '</defs>';

    html += '<rect width="100%" height="100%" fill="url(#tech-grid)" />';

    // 1. PCB ASSEMBLY DRAWING
    if (part === 'pcb') {
      html += '<!-- PCB Substrate -->';
      html += '<rect x="60" y="40" width="480" height="300" rx="14" fill="#0d1b18" stroke="#1d4036" stroke-width="2.5"/>';
      html += '<circle cx="80" cy="60" r="7" fill="#060c0b" stroke="#00f0c0" stroke-width="1.5"/>';
      html += '<circle cx="520" cy="60" r="7" fill="#060c0b" stroke="#00f0c0" stroke-width="1.5"/>';
      html += '<circle cx="80" cy="320" r="7" fill="#060c0b" stroke="#00f0c0" stroke-width="1.5"/>';
      html += '<circle cx="520" cy="320" r="7" fill="#060c0b" stroke="#00f0c0" stroke-width="1.5"/>';

      // Traces
      html += '<path d="M 120 180 L 190 180 L 220 150 L 250 150" stroke="#16503f" stroke-width="2" fill="none"/>';
      html += '<path d="M 120 200 L 180 200 L 210 230 L 250 230" stroke="#16503f" stroke-width="2" fill="none"/>';
      html += '<path d="M 370 190 L 420 190 L 450 160 L 490 160" stroke="#16503f" stroke-width="2" fill="none"/>';

      // IC Chip (U1)
      html += '<rect x="250" y="140" width="110" height="110" rx="4" fill="#141720" stroke="#333c52" stroke-width="2"/>';
      html += '<circle cx="265" cy="155" r="3" fill="#8993a8"/>';
      html += '<text x="305" y="198" fill="#8993a8" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">AE-EDGE</text>';
      html += '<text x="305" y="214" fill="#55607a" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">QFN-32</text>';

      // IC Pins
      for (var p = 0; p < 5; p++) {
        var py = 155 + p * 18;
        html += '<rect x="236" y="' + py + '" width="14" height="6" fill="#c9a24a" rx="1"/>';
        html += '<rect x="360" y="' + py + '" width="14" height="6" fill="#c9a24a" rx="1"/>';
      }

      // Resistors R11, R12, R13, R14
      html += '<rect x="130" y="100" width="34" height="16" fill="#1b212f" stroke="#c9a24a" stroke-width="1.5" rx="2"/>';
      html += '<text x="147" y="93" fill="#8993a8" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">R11</text>';

      html += '<rect x="180" y="100" width="34" height="16" fill="#1b212f" stroke="#c9a24a" stroke-width="1.5" rx="2"/>';
      html += '<text x="197" y="93" fill="#8993a8" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">R12</text>';

      html += '<rect x="400" y="100" width="34" height="16" fill="#1b212f" stroke="#c9a24a" stroke-width="1.5" rx="2"/>';
      html += '<text x="417" y="93" fill="#8993a8" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">R13</text>';

      // R14 (Golden vs NG Missing)
      if (isNg) {
        // Missing component pads
        html += '<rect x="450" y="101" width="8" height="14" fill="#7a6225"/>';
        html += '<rect x="474" y="101" width="8" height="14" fill="#7a6225"/>';
        html += '<text x="466" y="93" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">R14 [EMPTY]</text>';
      } else {
        html += '<rect x="450" y="100" width="34" height="16" fill="#1b212f" stroke="#c9a24a" stroke-width="1.5" rx="2"/>';
        html += '<text x="467" y="93" fill="#8993a8" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">R14</text>';
      }

      // Capacitor C7 (Golden vs NG Skewed)
      if (isNg) {
        html += '<g transform="translate(150, 260) rotate(22)">';
        html += '<rect x="-18" y="-9" width="36" height="18" fill="#936d39" stroke="#b08b52" stroke-width="1.5" rx="2"/>';
        html += '</g>';
        html += '<text x="150" y="295" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">C7 [SKEWED]</text>';
      } else {
        html += '<rect x="132" y="250" width="36" height="18" fill="#936d39" stroke="#b08b52" stroke-width="1.5" rx="2"/>';
        html += '<text x="150" y="280" fill="#8993a8" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">C7</text>';
      }

      // Solder Bridge Defect on IC-1 Pins 3-4 (NG only)
      if (isNg) {
        html += '<path d="M 234 191 Q 230 199 234 207 Q 248 202 248 195 Z" fill="#ff5d6c" filter="url(#glow-danger)" opacity="0.85"/>';
      }

      // OVERLAY LAYERS
      if (isNg) {
        // Defect 1: Solder Bridge
        if (showB) {
          html += '<rect x="226" y="185" width="28" height="28" fill="none" stroke="#ff5d6c" stroke-width="2" stroke-dasharray="3,2"/>';
          html += '<rect x="226" y="172" width="108" height="14" fill="#10141f" stroke="#ff5d6c" stroke-width="1"/>';
          html += '<text x="230" y="183" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">SOLDER_BRIDGE 98.4%</text>';
        }
        if (showM) {
          html += '<polygon points="232,189 248,193 248,205 233,205" fill="rgba(255, 93, 108, 0.4)" stroke="#ff5d6c" stroke-width="1.2"/>';
        }

        // Defect 2: Missing R14
        if (showB) {
          html += '<rect x="444" y="94" width="46" height="28" fill="none" stroke="#ff5d6c" stroke-width="2" stroke-dasharray="4,2"/>';
          html += '<rect x="444" y="80" width="100" height="14" fill="#10141f" stroke="#ff5d6c" stroke-width="1"/>';
          html += '<text x="448" y="91" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">MISSING_R14 96.1%</text>';
        }

        // Defect 3: Skewed C7
        if (showD) {
          html += '<line x1="120" y1="260" x2="185" y2="260" stroke="#7c5cff" stroke-width="1" stroke-dasharray="2,2"/>';
          html += '<line x1="128" y1="269" x2="172" y2="251" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<text x="180" y="278" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="9">θ = 18.4° (MAX: 5°)</text>';
        }
      } else {
        // OK Golden Part Overlays
        if (showB) {
          html += '<rect x="245" y="135" width="120" height="120" fill="none" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<rect x="245" y="122" width="86" height="14" fill="#10141f" stroke="#00f0c0" stroke-width="1"/>';
          html += '<text x="249" y="133" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">IC_QFN32 99.7%</text>';

          html += '<rect x="445" y="95" width="44" height="26" fill="none" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<rect x="445" y="82" width="70" height="14" fill="#10141f" stroke="#00f0c0" stroke-width="1"/>';
          html += '<text x="449" y="93" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">R14_OK 99.1%</text>';
        }
        if (showD) {
          html += '<line x1="60" y1="355" x2="540" y2="355" stroke="#00f0c0" stroke-width="1"/>';
          html += '<line x1="60" y1="350" x2="60" y2="360" stroke="#00f0c0" stroke-width="1"/>';
          html += '<line x1="540" y1="350" x2="540" y2="360" stroke="#00f0c0" stroke-width="1"/>';
          html += '<text x="300" y="367" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">PCB WIDTH: 120.00 mm [NOMINAL]</text>';
        }
      }
    }

    // 2. AUTOMOTIVE STAMPING BRACKET
    else if (part === 'stamping') {
      html += '<!-- Metal Stamped Part -->';
      html += '<path d="M 100 80 L 460 80 Q 500 80 500 120 L 500 240 Q 500 280 460 280 L 220 280 L 160 320 L 100 320 Q 80 320 80 300 L 80 100 Q 80 80 100 80 Z" ' +
              'fill="#182030" stroke="#36435c" stroke-width="2.5"/>';

      // Inner Cutout Hole
      html += '<ellipse cx="290" cy="180" rx="' + (isNg ? '48' : '40') + '" ry="40" fill="#060c0b" stroke="' + (isNg ? '#ff5d6c' : '#00f0c0') + '" stroke-width="2"/>';
      html += '<circle cx="140" cy="140" r="14" fill="#060c0b" stroke="#36435c" stroke-width="1.5"/>';
      html += '<circle cx="440" cy="140" r="14" fill="#060c0b" stroke="#36435c" stroke-width="1.5"/>';

      // Bend Line
      html += '<line x1="220" y1="80" x2="220" y2="280" stroke="#485775" stroke-width="1.5" stroke-dasharray="6,4"/>';

      if (isNg) {
        // Hairline Crack at Bend
        html += '<path d="M 220 120 Q 212 135 224 148 Q 215 160 220 172" stroke="#ff5d6c" stroke-width="2.5" fill="none" filter="url(#glow-danger)"/>';

        if (showB) {
          html += '<rect x="200" y="110" width="38" height="70" fill="none" stroke="#ff5d6c" stroke-width="2" stroke-dasharray="4,2"/>';
          html += '<rect x="200" y="96" width="104" height="14" fill="#10141f" stroke="#ff5d6c" stroke-width="1"/>';
          html += '<text x="204" y="107" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">FATIGUE_CRACK 97.4%</text>';
        }

        if (showM) {
          html += '<polygon points="218,118 226,145 222,175 212,145" fill="rgba(255, 93, 108, 0.45)" stroke="#ff5d6c" stroke-width="1"/>';
        }

        if (showD) {
          // Bore Dimension Caliper NG
          html += '<line x1="242" y1="180" x2="338" y2="180" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<line x1="242" y1="172" x2="242" y2="188" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<line x1="338" y1="172" x2="338" y2="188" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<text x="290" y="174" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">Ø 12.38 mm [NG: +0.33]</text>';
        }
      } else {
        if (showD) {
          html += '<line x1="250" y1="180" x2="330" y2="180" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<line x1="250" y1="172" x2="250" y2="188" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<line x1="330" y1="172" x2="330" y2="188" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<text x="290" y="174" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">Ø 12.02 mm [±0.05 OK]</text>';
        }
        if (showB) {
          html += '<rect x="75" y="75" width="430" height="250" fill="none" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<rect x="75" y="62" width="115" height="14" fill="#10141f" stroke="#00f0c0" stroke-width="1"/>';
          html += '<text x="79" y="73" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">STAMPING_FORM 99.2%</text>';
        }
      }
    }

    // 3. PHARMACEUTICAL VIAL
    else if (part === 'vial') {
      html += '<!-- Glass Vial & Aluminum Seal -->';
      // Vial Body
      html += '<rect x="230" y="110" width="140" height="210" rx="10" fill="#101824" stroke="#2a374d" stroke-width="2"/>';

      // Liquid Content
      var fillY = isNg ? 230 : 175; // NG is underfilled
      html += '<rect x="233" y="' + fillY + '" width="134" height="' + (318 - fillY) + '" rx="6" fill="#0c3230" stroke="#00f0c0" stroke-width="1"/>';
      html += '<line x1="233" y1="' + fillY + '" x2="367" y2="' + fillY + '" stroke="' + (isNg ? '#ff5d6c' : '#00f0c0') + '" stroke-width="2"/>';

      // Aluminum Crimp Cap
      var capGap = isNg ? 16 : 4; // NG has loose crimp gap
      html += '<rect x="260" y="' + (70 - capGap) + '" width="80" height="36" rx="4" fill="#2d3748" stroke="#60708b" stroke-width="2"/>';
      html += '<rect x="275" y="' + (58 - capGap) + '" width="50" height="14" fill="#4a5568" rx="2"/>';

      // DataMatrix Code on Vial Body
      html += '<rect x="270" y="250" width="60" height="50" fill="#060c0b" stroke="#334155" stroke-width="1.5"/>';
      html += '<rect x="276" y="256" width="12" height="12" fill="#00f0c0"/>';
      html += '<rect x="312" y="256" width="12" height="12" fill="#00f0c0"/>';
      html += '<rect x="294" y="274" width="12" height="12" fill="#00f0c0"/>';
      html += '<rect x="276" y="282" width="12" height="12" fill="#00f0c0"/>';
      html += '<rect x="312" y="282" width="12" height="12" fill="#00f0c0"/>';

      if (isNg) {
        if (showD) {
          // Cap gap caliper
          html += '<line x1="355" y1="66" x2="355" y2="105" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<line x1="345" y1="66" x2="365" y2="66" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<line x1="345" y1="105" x2="365" y2="105" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<text x="375" y="88" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="9">GAP: 0.84 mm [NG]</text>';

          // Underfill caliper
          html += '<line x1="215" y1="175" x2="215" y2="230" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<line x1="205" y1="175" x2="225" y2="175" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<line x1="205" y1="230" x2="225" y2="230" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<text x="110" y="206" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="9">FILL: -8.6 mm [NG]</text>';
        }
        if (showB) {
          html += '<rect x="250" y="48" width="100" height="60" fill="none" stroke="#ff5d6c" stroke-width="2" stroke-dasharray="4,2"/>';
          html += '<rect x="250" y="34" width="104" height="14" fill="#10141f" stroke="#ff5d6c" stroke-width="1"/>';
          html += '<text x="254" y="45" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">CAP_SEAL_NG 98.9%</text>';
        }
      } else {
        if (showD) {
          html += '<line x1="215" y1="175" x2="215" y2="318" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<line x1="205" y1="175" x2="225" y2="175" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<line x1="205" y1="318" x2="225" y2="318" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<text x="115" y="250" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="9">FILL: 50.2 mm [OK]</text>';
        }
        if (showB) {
          html += '<rect x="255" y="60" width="90" height="50" fill="none" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<rect x="255" y="47" width="95" height="14" fill="#10141f" stroke="#00f0c0" stroke-width="1"/>';
          html += '<text x="259" y="58" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">CRIMP_SEAL_OK 99.8%</text>';
        }
      }
    }

    // 4. PRECISION MACHINED BOLT
    else if (part === 'bolt') {
      html += '<!-- Machined Hex Bolt -->';
      // Hex Head
      html += '<polygon points="80,150 140,110 200,150 200,230 140,270 80,230" fill="#252d3d" stroke="#485671" stroke-width="2.5"/>';
      html += '<circle cx="140" cy="190" r="30" fill="none" stroke="#36435c" stroke-width="1.5"/>';
      html += '<text x="140" y="194" fill="#6d7d9b" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">8.8</text>';

      // Bolt Shank & Threads
      html += '<rect x="200" y="160" width="80" height="60" fill="#1a202c" stroke="#3a475f" stroke-width="2"/>';

      // Thread Ridges
      var threadCount = 10;
      for (var t = 0; t < threadCount; t++) {
        var tx = 280 + t * 24;
        html += '<path d="M ' + tx + ' 160 L ' + (tx + 12) + ' 148 L ' + (tx + 24) + ' 160 L ' + (tx + 24) + ' 220 L ' + (tx + 12) + ' 232 L ' + tx + ' 220 Z" ' +
                'fill="#222b3b" stroke="#42506b" stroke-width="1.5"/>';
      }

      // Thread Burr Defect on 4th Crest
      if (isNg) {
        html += '<path d="M 374 148 L 378 136 L 386 148 Z" fill="#ff5d6c" filter="url(#glow-danger)"/>';

        if (showB) {
          html += '<rect x="360" y="128" width="36" height="34" fill="none" stroke="#ff5d6c" stroke-width="2" stroke-dasharray="4,2"/>';
          html += '<rect x="360" y="114" width="102" height="14" fill="#10141f" stroke="#ff5d6c" stroke-width="1"/>';
          html += '<text x="364" y="125" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">THREAD_BURR 98.6%</text>';
        }

        if (showD) {
          html += '<line x1="304" y1="246" x2="346" y2="246" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<line x1="304" y1="238" x2="304" y2="254" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<line x1="346" y1="238" x2="346" y2="254" stroke="#ff5d6c" stroke-width="1.5"/>';
          html += '<text x="325" y="265" fill="#ff5d6c" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">PITCH: 1.74 mm [NG: +0.24]</text>';
        }
      } else {
        if (showD) {
          html += '<line x1="304" y1="246" x2="328" y2="246" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<line x1="304" y1="238" x2="304" y2="254" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<line x1="328" y1="238" x2="328" y2="254" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<text x="316" y="265" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">PITCH: 1.50 mm [NOMINAL]</text>';
        }
        if (showB) {
          html += '<rect x="200" y="145" width="320" height="90" fill="none" stroke="#00f0c0" stroke-width="1.5"/>';
          html += '<rect x="200" y="132" width="105" height="14" fill="#10141f" stroke="#00f0c0" stroke-width="1"/>';
          html += '<text x="204" y="143" fill="#00f0c0" font-family="JetBrains Mono, monospace" font-size="8" font-weight="bold">THREAD_FORM 99.4%</text>';
        }
      }
    }

    // Animated Laser Scan Bar
    html += '<rect class="laser-scanner" x="0" y="0" width="100%" height="24" fill="url(#laser-grad)"/>';
    html += '<line class="laser-beam" x1="0" y1="24" x2="600" y2="24" stroke="#00f0c0" stroke-width="2"/>';

    canvasSvg.innerHTML = html;
  }

  function updateHUD() {
    var part = PARTS[state.part];
    var data = state.isNg ? part.ng : part.ok;

    if (hudVerdict) {
      hudVerdict.textContent = data.verdict;
      hudVerdict.className = 'verdict-badge verdict-' + data.verdictClass;
    }
    if (hudCycleTime) hudCycleTime.textContent = data.cycleTime;
    if (hudConfidence) hudConfidence.textContent = data.confidence;
    if (hudDefects) hudDefects.textContent = data.defectCount;
    if (hudOutput) hudOutput.textContent = data.outputPin;
    if (hudSummary) hudSummary.textContent = data.summary;
    if (hudModel) hudModel.textContent = part.model;
    if (hudCamera) hudCamera.textContent = part.camera;

    if (toggleOkBtn && toggleNgBtn) {
      toggleOkBtn.classList.toggle('is-active', !state.isNg);
      toggleNgBtn.classList.toggle('is-active', state.isNg);
    }

    renderVectorGraphics();
  }

  // Actuate Solenoid Simulation
  function actuateSolenoid() {
    if (state.actuating) return;
    state.actuating = true;

    if (btnTrigger) {
      btnTrigger.classList.add('is-firing');
      btnTrigger.disabled = true;
    }

    if (solenoidLight) {
      solenoidLight.classList.add('is-active');
    }

    addLog('TEST ACTUATOR: Manual solenoid pulse command dispatched via USB Serial', 'info');
    addLog('GPIO PIN 7 -> HIGH (120ms relay hold pulse active)', 'error');

    setTimeout(function () {
      if (solenoidLight) solenoidLight.classList.remove('is-active');
      addLog('GPIO PIN 7 -> LOW (Relay reset nominal · Eject cycle complete)', 'success');
      state.actuating = false;
      if (btnTrigger) {
        btnTrigger.classList.remove('is-firing');
        btnTrigger.disabled = false;
      }
    }, 450);
  }

  // Event Listeners
  partTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var p = tab.getAttribute('data-part');
      if (p && PARTS[p]) {
        state.part = p;
        partTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        addLog('Loaded workpiece profile: ' + PARTS[p].name + ' (' + PARTS[p].model + ')', 'info');
        updateHUD();
      }
    });
  });

  if (toggleOkBtn) {
    toggleOkBtn.addEventListener('click', function () {
      state.isNg = false;
      addLog('Camera switched to Golden Reference Part [PASS // OK]', 'success');
      updateHUD();
    });
  }

  if (toggleNgBtn) {
    toggleNgBtn.addEventListener('click', function () {
      state.isNg = true;
      addLog('Camera fed Defective Part [REJECT // NG FLAG ACTIVE]', 'error');
      updateHUD();
    });
  }

  if (chkBoxes) {
    chkBoxes.addEventListener('change', function () {
      state.showBoxes = chkBoxes.checked;
      renderVectorGraphics();
    });
  }

  if (chkMasks) {
    chkMasks.addEventListener('change', function () {
      state.showMasks = chkMasks.checked;
      renderVectorGraphics();
    });
  }

  if (chkDims) {
    chkDims.addEventListener('change', function () {
      state.showDimensions = chkDims.checked;
      renderVectorGraphics();
    });
  }

  if (btnTrigger) {
    btnTrigger.addEventListener('click', function () {
      actuateSolenoid();
    });
  }

  // Initial Boot
  addLog('AutomaEyes Industrial Simulator Initialized', 'success');
  addLog('Camera link established: 1080p @ 60 FPS GigE Vision', 'info');
  updateHUD();

})();
