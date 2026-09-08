<?php
require __DIR__ . '/../src/bootstrap.php';

$pageTitle = 'AutomaEyes — Industrial Edge AI Vision & Quality Control';
$bodyClass = 'has-story-bg';
require __DIR__ . '/../src/includes/header.php';
?>
<canvas id="story-bg"></canvas>

<main class="story">

  <!-- ==================== HERO SECTION ==================== -->
  <section class="story-section story-hero" id="hero" data-reveal>
    <div class="hero-container">
      <div class="hero-eyebrow-wrap">
        <span class="eyebrow-pill"><span class="pulse-dot"></span> AI QUALITY CONTROL // EDGE VISION AUTOMATION</span>
      </div>
      <h1>Real-Time Industrial AI Vision.<br><span class="grad">Zero Cloud Latency.</span></h1>
      <p class="hero-subtext">AutomaEyes inspects manufactured parts at line speed: sub-pixel defect segmentation, GD&amp;T tolerance measurements, and direct 24V PLC/Modbus actuation. Train on your own parts, on your own factory PC &mdash; with 100% on-premise air-gapped privacy.</p>
      
      <div class="hero-actions">
        <?php if ($user): ?>
          <a href="<?= e(DOWNLOAD_PAGE) ?>" class="btn btn-primary btn-lg">
            <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download for Windows
          </a>
          <a href="/welcome.php" class="btn btn-ghost btn-lg">Open Dashboard</a>
        <?php else: ?>
          <a href="<?= e(DOWNLOAD_PAGE) ?>" class="btn btn-primary btn-lg">
            <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download Free for Windows
          </a>
          <a href="#demo" class="btn btn-ghost btn-lg">Explore Live Simulator</a>
        <?php endif; ?>
        <a href="https://github.com/Code8Byte/test-ai" target="_blank" rel="noopener" class="btn btn-ghost btn-lg">
          <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
      </div>

      <!-- Live Factory Telemetry Strip -->
      <div class="hero-telemetry">
        <div class="telemetry-item">
          <span class="telemetry-val">60+ FPS</span>
          <span class="telemetry-lbl">YOLOv11 TensorRT &amp; ONNX</span>
        </div>
        <div class="telemetry-divider"></div>
        <div class="telemetry-item">
          <span class="telemetry-val">&lt; 15 ms</span>
          <span class="telemetry-lbl">Edge Inference Latency</span>
        </div>
        <div class="telemetry-divider"></div>
        <div class="telemetry-item">
          <span class="telemetry-val">&plusmn;0.02 mm</span>
          <span class="telemetry-lbl">Sub-Pixel GD&amp;T Calipers</span>
        </div>
        <div class="telemetry-divider"></div>
        <div class="telemetry-item">
          <span class="telemetry-val">Modbus &amp; 24V</span>
          <span class="telemetry-lbl">Direct Hardware Eject</span>
        </div>
      </div>
    </div>
    <div class="scroll-cue"><span class="line"></span>[Explore Live Simulator]</div>
  </section>


  <!-- ==================== INTERACTIVE DEFECT INSPECTOR SIMULATOR ==================== -->
  <section class="demo-section" id="demo">
    <div class="section-head">
      <span class="eyebrow">Interactive Simulator</span>
      <h2>Test AutomaEyes in Your Browser</h2>
      <p>Select an industrial part, toggle between Golden (OK) and Defective (NG) samples, inspect sub-pixel segmentation masks and GD&amp;T dimensions, and test the 24V PLC solenoid pulse.</p>
    </div>

    <div class="demo-container" id="inspection-simulator">
      <!-- Top Part Selector Tabs -->
      <div class="demo-part-tabs">
        <button type="button" class="demo-tab-btn is-active" data-part="pcb">
          <span class="tab-code">01</span>
          <span class="tab-label">PCB Assembly</span>
          <span class="tab-chip">SMT Electronics</span>
        </button>
        <button type="button" class="demo-tab-btn" data-part="stamping">
          <span class="tab-code">02</span>
          <span class="tab-label">Chassis Stamping</span>
          <span class="tab-chip">Automotive Metal</span>
        </button>
        <button type="button" class="demo-tab-btn" data-part="vial">
          <span class="tab-code">03</span>
          <span class="tab-label">Pharmaceutical Vial</span>
          <span class="tab-chip">Sterile Packaging</span>
        </button>
        <button type="button" class="demo-tab-btn" data-part="bolt">
          <span class="tab-code">04</span>
          <span class="tab-label">M10 Threaded Bolt</span>
          <span class="tab-chip">Machined Fastener</span>
        </button>
      </div>

      <!-- Main Visualizer Grid -->
      <div class="demo-grid">
        <!-- Visual Viewport Canvas -->
        <div class="demo-viewport-wrap">
          <div class="viewport-hud-top">
            <div class="hud-item"><span class="hud-k">MODEL:</span> <span class="hud-v" id="demo-model-badge">yolo11n-seg-pcb</span></div>
            <div class="hud-item"><span class="hud-k">INPUT:</span> <span class="hud-v" id="demo-camera-badge">GigE 1080p @ 60 FPS</span></div>
            <div class="hud-item"><span class="hud-k">CYCLE:</span> <span class="hud-v ok" id="demo-cycle-time">14.8 ms</span></div>
          </div>

          <svg id="demo-svg-viewport" viewBox="0 0 600 380" preserveAspectRatio="xMidYMid meet" aria-label="Inspection Camera Simulation"></svg>

          <div class="viewport-hud-bottom">
            <div class="verdict-wrap">
              <span class="verdict-badge verdict-reject" id="demo-verdict-tag">REJECT</span>
              <span class="verdict-conf" title="Model Confidence">CONF: <b id="demo-confidence">98.7%</b></span>
            </div>
            <div class="signal-wrap">
              <span class="signal-pin" id="demo-output-signal">PIN 7 &rarr; HIGH (ACTUATE REJECT FLAP)</span>
            </div>
          </div>
        </div>

        <!-- Controls & Telemetry Side Panel -->
        <div class="demo-panel">
          <div class="panel-section">
            <span class="panel-title">Inspection Mode</span>
            <div class="mode-switch">
              <button type="button" class="mode-btn" id="demo-toggle-ok">
                <span class="mode-icon pass-dot"></span> Golden Part [PASS]
              </button>
              <button type="button" class="mode-btn is-active" id="demo-toggle-ng">
                <span class="mode-icon reject-dot"></span> Defective [REJECT]
              </button>
            </div>
          </div>

          <div class="panel-section">
            <span class="panel-title">AI Overlay Layers</span>
            <div class="layer-toggles">
              <label class="layer-chk">
                <input type="checkbox" id="chk-layer-boxes" checked>
                <span class="chk-custom"></span>
                <span>Bounding Boxes &amp; Class Tags</span>
              </label>
              <label class="layer-chk">
                <input type="checkbox" id="chk-layer-masks" checked>
                <span class="chk-custom"></span>
                <span>Polygon Segmentation Masks</span>
              </label>
              <label class="layer-chk">
                <input type="checkbox" id="chk-layer-dims" checked>
                <span class="chk-custom"></span>
                <span>GD&amp;T Caliper Dimensions (mm)</span>
              </label>
            </div>
          </div>

          <div class="panel-section">
            <span class="panel-title">Inspection Findings</span>
            <p class="demo-summary" id="demo-summary-text">Solder bridge on IC-1 and missing R14 chip resistor violate assembly tolerance.</p>
            <div class="stat-mini-grid">
              <div class="stat-box">
                <span class="stat-k">Defects</span>
                <span class="stat-v" id="demo-defect-count">3</span>
              </div>
              <div class="stat-box">
                <span class="stat-k">Precision</span>
                <span class="stat-v">&plusmn;0.02 mm</span>
              </div>
              <div class="stat-box">
                <span class="stat-k">Cloud Lag</span>
                <span class="stat-v ok">0.0 ms</span>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <span class="panel-title">Hardware Actuation</span>
            <div class="actuator-control">
              <button type="button" class="btn btn-ghost btn-block" id="btn-actuate-solenoid">
                <span class="solenoid-indicator" id="solenoid-indicator"></span>
                <span>Test 24V Reject Solenoid Pulse</span>
              </button>
            </div>
            <ul class="demo-event-log" id="demo-event-log"></ul>
          </div>
        </div>
      </div>
    </div>
  </section>


  <!-- ==================== CORE CAPABILITIES ==================== -->
  <section class="features-section" id="features">
    <div class="section-head">
      <span class="eyebrow">Core Capabilities</span>
      <h2>Engineered for High-Speed Factory Production</h2>
      <p>Built specifically for manufacturing engineers, quality managers, and automation technicians who need dependable machine vision without vendor lock-in.</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        </div>
        <h3>YOLOv11 Polygon Segmentation</h3>
        <p>Go beyond coarse rectangular boxes. AutomaEyes segments the sub-pixel organic boundaries of hairline cracks, solder shorts, metal flash, and burrs directly on NVIDIA GPUs or multi-core CPUs.</p>
        <span class="feature-tag">SUB-PIXEL CONTOURS</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
        <h3>Sub-Millimeter GD&amp;T Calipers</h3>
        <p>Calibrated pixel-to-metric conversions calculate hole diameters, roundness ovality, wall thicknesses, and parallelism against upper and lower engineering tolerance limits (USL / LSL).</p>
        <span class="feature-tag">&plusmn;0.02 MM ACCURACY</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3>100% Air-Gapped Local Privacy</h3>
        <p>Your CAD drawings, proprietary workpieces, and inspection photos run entirely on your shop-floor Windows machine. Zero cloud uploads, zero external telemetry, and no recurring API fees.</p>
        <span class="feature-tag">ZERO CLOUD CALLS</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <h3>Built-In Labeling &amp; Leak Prevention</h3>
        <p>Annotate polygons, circles, and bounding boxes directly inside the desktop app. Reproducible train/val/test splits occur before augmentation to eliminate data leakage and inflated accuracy scores.</p>
        <span class="feature-tag">NO-CODE ANNOTATION</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </div>
        <h3>GigE &amp; USB3 Industrial Cameras</h3>
        <p>Connect standard factory camera hardware: Basler, FLIR, IDS, Hikrobot, standard DirectShow webcams, and RTSP IP streams. Supports hardware photoelectric trigger sync.</p>
        <span class="feature-tag">GIGE VISION &amp; RTSP</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
        </div>
        <h3>Git-Backed Version Control</h3>
        <p>Every dataset, evaluation curve, confusion matrix, and trained weights file (.pt, .onnx) commits to your private GitHub repository with Git LFS. Roll back to any known-good model version with ease.</p>
        <span class="feature-tag">GIT LFS REPOSITORIES</span>
      </div>
    </div>
  </section>


  <!-- ==================== HOW IT WORKS (3D DIGITAL TWIN & PIPELINE) ==================== -->
  <section class="how-it-works-section" id="how-it-works">
    <div class="section-head">
      <span class="eyebrow">Vision Pipeline</span>
      <h2>From Camera Exposure to Solenoid Ejection</h2>
      <p>Click any stage below or scroll through to see the live 3D inspection workflow, defect localization, and hardware actuation trigger.</p>
    </div>

    <!-- 3D Pipeline Visualizer (Interactive Canvas + Clickable Rail) -->
    <div class="story3d" id="story3d">
      <div class="story3d-pin">
        <div id="story3d-canvas"></div>

        <div class="story3d-head">
          <span class="eyebrow">Real-Time Processing</span>
          <h2>Autonomous Edge Inspection</h2>
        </div>

        <div class="story3d-rail" aria-label="Pipeline Stages">
          <div class="item" data-i="0" title="Click to inspect stage 01"><span class="num">01</span><span class="label">Camera Input</span></div>
          <div class="item" data-i="1" title="Click to inspect stage 02"><span class="num">02</span><span class="label">Detection Frame</span></div>
          <div class="item" data-i="2" title="Click to inspect stage 03"><span class="num">03</span><span class="label">Live Inspection</span></div>
          <div class="item" data-i="3" title="Click to inspect stage 04"><span class="num">04</span><span class="label">Defect Flagged</span></div>
          <div class="item" data-i="4" title="Click to inspect stage 05"><span class="num">05</span><span class="label">Output to Line</span></div>
        </div>

        <div class="story3d-track"><div class="story3d-fill" id="story3d-fill"></div></div>

        <div class="overlay" id="ov-frame"><span class="frame-tag">DETECTION FRAME</span></div>

        <div class="overlay" id="ov-panel">
          <div class="row"><span>Model</span><b>yolo11n-seg.pt</b></div>
          <div class="row"><span>Confidence</span><b>0.96</b></div>
          <div class="row"><span>Cycle</span><b>13.8 ms</b></div>
          <div class="row"><span>Status</span><b class="ok">SCANNING</b></div>
        </div>

        <div class="overlay" id="ov-defect">
          <div class="dot"></div>
          <div class="tag">DEFECT · BENT CONTACT · 0.35mm</div>
        </div>

        <div class="overlay" id="ov-output">
          <div class="tag">OUTPUT PIN 7 &rarr; HIGH · REJECT ACTUATED</div>
        </div>
      </div>
    </div>

    <!-- Edge Unit Digital Twin & 7 Setup Steps -->
    <div class="scrolly" id="scrolly" style="--steps:7">
      <div class="scrolly-inner">
        <div class="scrolly-grid">

          <div class="scrolly-copy">
            <div class="step-rail" id="step-rail" aria-hidden="true"></div>
            <ol class="step-list">

              <li class="step-item" data-step="0" data-label="Connect">
                <div class="step-copy">
                  <span class="step-index">[01] Connect</span>
                  <h2>Your Data, Your Private GitHub</h2>
                  <p>Sign in and connect your own GitHub or GitLab account. Every project, dataset, and trained model weights file lives in a private repository you control. There is zero proprietary cloud storage on our side.</p>
                  <ul>
                    <li>Private or public repositories, your choice</li>
                    <li>Git LFS versioned datasets &mdash; no vendor lock-in</li>
                    <li>Revoke access from GitHub settings at any time</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="1" data-label="Dataset">
                <div class="step-copy">
                  <span class="step-index">[02] Dataset</span>
                  <h2>Trained on Photos of Your Own Workpieces</h2>
                  <p>Create a model &mdash; detection, polygon segmentation, classification, or OCR &mdash; and import photos of the parts you actually manufacture. Generic models cannot resolve your plant's specific micro-tolerances.</p>
                  <ul>
                    <li>YOLOv11 segmentation, detection, and classification</li>
                    <li>Define custom class labels and inspection zones</li>
                    <li>Incrementally add more sample images anytime</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="2" data-label="Annotate">
                <div class="step-copy">
                  <span class="step-index">[03] Annotate</span>
                  <h2>Label Workpieces Without Leaving the App</h2>
                  <p>Polygon tools for complex parts, bounding boxes for rapid sorting, and circles for round bores and pins. Precise geometry is what makes millimeter GD&amp;T measurement accurate.</p>
                  <ul>
                    <li>Built-in labeling tool &mdash; no separate web app needed</li>
                    <li>Direct pipeline handoff &mdash; zero manual export steps</li>
                    <li>Keyboard-driven hotkeys engineered for fast bulk labeling</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="3" data-label="Split">
                <div class="step-copy">
                  <span class="step-index">[04] Split &amp; Augment</span>
                  <h2>Split First, Augment Second</h2>
                  <p>Divide data into training, validation, and test partitions before applying augmentations. Augmenting the validation set leaks duplicate patterns and gives a false illusion of high accuracy.</p>
                  <ul>
                    <li>Deterministic seed for reproducible evaluation runs</li>
                    <li>Safe industrial augmentations: brightness, rotation, blur</li>
                    <li>Leak-prone options are strictly blocked by default</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="4" data-label="Train">
                <div class="step-copy">
                  <span class="step-index">[05] Train &amp; Test</span>
                  <h2>Train Locally and Verify with Real Metrics</h2>
                  <p>Training runs locally on your PC. When finished, inspect the independent test set: Precision-Recall curves, confusion matrix, F1 scores, and live prediction heatmaps.</p>
                  <ul>
                    <li>Live epoch loss and mAP50-95 progress curves</li>
                    <li>Per-class precision readouts and false-negative tallies</li>
                    <li>Every training run committed as an immutable version</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="5" data-label="Workflow">
                <div class="step-copy">
                  <span class="step-index">[06] Workflow</span>
                  <h2>Assemble the 4-Stage Quality Check</h2>
                  <p>Modelled on industrial machine vision: capture trigger, part positioning, AI inspection, and communication. Includes calibration drift alerts and fail-safe logic on first NG.</p>
                  <ul>
                    <li>Sub-millimeter GD&amp;T with per-class tolerance limits</li>
                    <li>1D/2D DataMatrix barcode reading and OCR verification</li>
                    <li>Color verification, surface scratch, and count checks</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="6" data-label="Output">
                <div class="step-copy">
                  <span class="step-index">[07] Output</span>
                  <h2>Trigger Pneumatic Rejectors &amp; PLCs</h2>
                  <p>Map every defect class to a real industrial signal. Arduino and ESP32 over USB with the included C++ sketch; industrial PLCs over Modbus RTU or Modbus TCP without custom PLC firmware.</p>
                  <ul>
                    <li>Siemens, Omron, Mitsubishi, and Delta PLC support</li>
                    <li>Built-in test button to verify physical solenoid wiring</li>
                    <li>Automated shift yield and measurement reports to Excel</li>
                  </ul>
                </div>
              </li>

            </ol>
          </div>

          <div class="scrolly-stage">
            <div class="stage-frame" id="stage-frame">
              <div id="scene-mount"></div>
              <div class="annotations" id="annotations"></div>
              <div class="stage-fallback" id="stage-fallback">
                <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="45" y="50" width="150" height="95" rx="10" stroke="#00f0c0" stroke-width="2"/>
                  <circle cx="120" cy="97" r="28" stroke="#7c5cff" stroke-width="2"/>
                  <circle cx="120" cy="97" r="11" fill="#7c5cff"/>
                  <rect x="155" y="65" width="14" height="10" rx="3" fill="#00f0c0"/>
                  <path d="M100 40h40M120 40v10" stroke="#2b3348" stroke-width="2"/>
                </svg>
              </div>
              <div class="stage-hud">
                <span>AUTOMAEYE // INDUSTRIAL EDGE UNIT</span>
                <span id="hud-step">[01]</span>
              </div>
              <p class="drag-hint" id="drag-hint">Drag to rotate 3D unit</p>
            </div>
          </div>

        </div>
        <div class="scrolly-progress"><span id="scrolly-bar"></span></div>
      </div>
    </div>
  </section>


  <!-- ==================== HARDWARE & PLC MATRIX ==================== -->
  <section class="hardware-section" id="hardware">
    <div class="section-head">
      <span class="eyebrow">Fieldbus &amp; Control</span>
      <h2>Industrial Hardware &amp; PLC Integration</h2>
      <p>Connect AutomaEyes straight to your factory floor. No proprietary protocol bridges required.</p>
    </div>

    <div class="hardware-grid">
      <div class="hardware-card">
        <div class="card-badge">MODBUS TCP / RTU</div>
        <h3>Industrial PLCs</h3>
        <p>Direct communication with Siemens S7-1200/1500, Omron Sysmac, Mitsubishi MELSEC, Schneider, and Delta. Reads line triggers and writes pass/fail coil bits in real time.</p>
        <div class="code-snippet">
          <code>Modbus TCP // Port 502<br>Coil 0001: Machine Running<br>Coil 0002: Inspection PASS<br>Coil 0003: REJECT Trigger (100ms)</code>
        </div>
      </div>

      <div class="hardware-card">
        <div class="card-badge">USB SERIAL RELAYS</div>
        <h3>Arduino &amp; ESP32 Actuation</h3>
        <p>Use standard Arduino Uno/Mega or ESP32 boards with the bundled C++ firmware. Directly drive 24V optoisolated relays, pneumatic air-blast valves, or reject kicker pistons.</p>
        <div class="code-snippet">
          <code>// USB Serial @ 115200 baud<br>REJECT_PIN = 7;<br>digitalWrite(REJECT_PIN, HIGH);<br>delay(PULSE_MS); // 120ms pulse</code>
        </div>
      </div>

      <div class="hardware-card">
        <div class="card-badge">DIGITAL 24V I/O</div>
        <h3>Hardware Photoelectric Triggers</h3>
        <p>Synchronize camera shutter with conveyor workpiece arrival. High-speed optoisolators eliminate frame jitter and guarantee parts are centered under optics.</p>
        <div class="code-snippet">
          <code>Photo-eye Sensor &rarr; 24V Trigger IN<br>Hardware Latency: &lt; 1.8 ms<br>Camera Shutter: 1/2000s Sync<br>Jitter Envelope: &plusmn;0.4 ms</code>
        </div>
      </div>

      <div class="hardware-card">
        <div class="card-badge">SCADA &amp; MES EXPORT</div>
        <h3>Automated Quality Logs &amp; Excel</h3>
        <p>Continuously archive shift inspection results, dimensional records, and defect images to local SQLite, CSV, or formatted Excel (.xlsx) spreadsheets for statistical process control (SPC).</p>
        <div class="code-snippet">
          <code>Shift Yield: 99.42% OK<br>Hourly Log: /exports/shift_01.xlsx<br>SPC Data: Mean Ø 12.018mm<br>Cp / Cpk: 1.64 / 1.58</code>
        </div>
      </div>
    </div>
  </section>


  <!-- ==================== BENCHMARKS ==================== -->
  <section class="benchmarks-section" id="benchmarks">
    <div class="section-head">
      <span class="eyebrow">Performance &amp; Speed</span>
      <h2>Edge AI vs. Cloud Vision Latency</h2>
      <p>Why manufacturing quality control demands on-premise edge computing instead of remote cloud APIs.</p>
    </div>

    <div class="benchmarks-container">
      <div class="benchmark-table">
        <div class="bench-row bench-header">
          <div class="bench-col">Inference Architecture</div>
          <div class="bench-col">Cycle Latency</div>
          <div class="bench-col">Conveyor Speed Limit</div>
          <div class="bench-col">Monthly Cost (1 Part/Sec)</div>
        </div>

        <div class="bench-row bench-highlight">
          <div class="bench-col">
            <b>AutomaEyes TensorRT (Edge GPU)</b>
            <span class="bench-sub">NVIDIA RTX 4060 / 3060 Local</span>
          </div>
          <div class="bench-col">
            <span class="bench-badge ok">12.4 ms</span>
          </div>
          <div class="bench-col">
            <span class="bench-val">Up to 80 parts/sec</span>
          </div>
          <div class="bench-col">
            <span class="bench-price">$0 / month (Unlimited)</span>
          </div>
        </div>

        <div class="bench-row">
          <div class="bench-col">
            <b>AutomaEyes ONNX (Edge CPU)</b>
            <span class="bench-sub">Intel Core i7 / AMD Ryzen Local</span>
          </div>
          <div class="bench-col">
            <span class="bench-badge ok">42.1 ms</span>
          </div>
          <div class="bench-col">
            <span class="bench-val">Up to 24 parts/sec</span>
          </div>
          <div class="bench-col">
            <span class="bench-price">$0 / month (Unlimited)</span>
          </div>
        </div>

        <div class="bench-row bench-fail">
          <div class="bench-col">
            <b>Typical Cloud Vision APIs</b>
            <span class="bench-sub">AWS / Azure / GCP Cloud Endpoints</span>
          </div>
          <div class="bench-col">
            <span class="bench-badge danger">450 &ndash; 850 ms</span>
          </div>
          <div class="bench-col">
            <span class="bench-val fail">&lt; 1.5 parts/sec (Too slow)</span>
          </div>
          <div class="bench-col">
            <span class="bench-price danger">$2,160 / month ($0.0015/req)</span>
          </div>
        </div>
      </div>

      <div class="bench-callout">
        <div class="callout-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="callout-content">
          <h4>Zero Network Downtime Guarantee</h4>
          <p>If your factory internet connection drops, AutomaEyes keeps inspecting at full 60 FPS without missing a single part. Critical manufacturing lines cannot depend on cloud availability.</p>
        </div>
      </div>
    </div>
  </section>


  <!-- ==================== FAQ SECTION ==================== -->
  <section class="faq-section" id="faq">
    <div class="section-head">
      <span class="eyebrow">Knowledgebase</span>
      <h2>Frequently Asked Questions</h2>
      <p>Answers to common questions about factory deployment, hardware compatibility, and data security.</p>
    </div>

    <div class="faq-accordion">
      <details class="faq-item">
        <summary class="faq-summary">
          <span class="faq-question">Does AutomaEyes require an active internet connection on the factory floor?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>No. AutomaEyes is 100% on-premise and operates completely air-gapped. All model training, inference, camera frame acquisition, and PLC communications run on your local Windows PC. Internet access is only needed if you choose to synchronize models with a private GitHub repository.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">
          <span class="faq-question">Which industrial camera interfaces and lenses are supported?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>AutomaEyes supports GigE Vision, USB3 Vision, DirectShow webcams, microscope feeds, and RTSP industrial IP cameras. It works with standard C-mount lenses, telecentric lenses (for zero-perspective dimensional measurement), and high-frequency LED ring and backlights.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">
          <span class="faq-question">Can I run AutomaEyes on an industrial PC without a dedicated GPU?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>Yes. AutomaEyes includes high-speed ONNX runtime optimization for Intel and AMD multi-core CPUs, delivering 20–45ms per frame. For high-speed lines requiring &gt;50 inspections per second, an NVIDIA RTX GPU with TensorRT acceleration is recommended.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">
          <span class="faq-question">How does AutomaEyes trigger pneumatic reject cylinders or diverter gates?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>AutomaEyes supports three actuation mechanisms: (1) Direct Modbus TCP or RTU coil commands to your PLC, (2) USB connection to an Arduino or ESP32 board driving a 24V relay module (C++ firmware included), or (3) Custom Python/JavaScript webhook scripts. You can configure pulse duration and delay to match conveyor transit distance.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">
          <span class="faq-question">Where are my datasets, images, and model weights stored?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>All data stays on your local filesystem under your project directories. When connected to GitHub, weight files and image datasets are stored in your private Git repository using Git LFS. There is no cloud storage or telemetry on our servers.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">
          <span class="faq-question">Is AutomaEyes open-source and free to deploy commercially?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>Yes. AutomaEyes is licensed under the permissive MIT open-source license. You can deploy it across unlimited manufacturing lines and commercial inspection cells without per-seat fees or recurring software subscriptions.</p>
        </div>
      </details>
    </div>
  </section>


  <!-- ==================== DOWNLOAD & OUTRO ==================== -->
  <section class="story-section story-outro" id="download" data-reveal>
    <h2>The Complete Industrial AI Pipeline.<br><span class="grad">Ready for Your Production Line.</span></h2>
    <p>AutomaEyes runs locally on Windows 10/11 next to your factory cameras. The installer bundles Python, PyTorch, and ONNX runtime &mdash; so your shop floor is operational in minutes.</p>
    <div class="download-panel">
      <a href="<?= e(DOWNLOAD_PAGE) ?>" class="btn btn-primary btn-lg">
        <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Download AutomaEyes for Windows
      </a>
      <?php if (!$user): ?>
        <a href="/login.php" class="btn btn-ghost">Already installed? Sign in to link your account</a>
      <?php else: ?>
        <a href="/welcome.php" class="btn btn-ghost">Go to your connected account</a>
      <?php endif; ?>
      <span class="platform-note">WINDOWS 10/11 &middot; 64-BIT<?php if ($v = Release::version()): ?> &middot; v<?= e($v) ?><?php endif; ?> &middot; NO EXTRA RUNTIMES REQUIRED</span>
    </div>
  </section>

</main>

<script src="/assets/js/story.js"></script>
<script src="/assets/js/interactive-demo.js"></script>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
<script type="module" src="/assets/js/scene.js"></script>
<script type="module" src="/assets/js/story3d.js"></script>
<?php require __DIR__ . '/../src/includes/footer.php'; ?>
