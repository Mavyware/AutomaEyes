<?php
require __DIR__ . '/../src/bootstrap.php';

$pageTitle = 'AutomaEyes: Industrial Edge AI Vision & Quality Control';
$bodyClass = 'has-story-bg';
require __DIR__ . '/../src/includes/header.php';
?>
<canvas id="story-bg"></canvas>

<main class="story" id="main-content">

  <!-- ==================== HERO SECTION ==================== -->
  <section class="story-section story-hero" data-reveal>
    <div class="hero-container">
      <div class="hero-eyebrow-wrap">
        <span class="eyebrow-pill"><span class="pulse-dot" aria-hidden="true"></span> AI QUALITY CONTROL // EDGE VISION AUTOMATION</span>
      </div>
      <h1>Real-Time Industrial AI Vision.<br><span class="grad">Zero Cloud Latency.</span></h1>
      <p class="hero-subtext">Inspect parts at line speed: sub-pixel defect segmentation, GD&amp;T measurements, and 24V PLC actuation with 100% on-premise privacy.</p>
      
      <div class="hero-actions">
        <?php if ($user): ?>
          <a href="<?= e(DOWNLOAD_PAGE) ?>" class="btn btn-primary btn-lg">
            <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download for Windows
          </a>
          <a href="/welcome.php" class="btn btn-ghost btn-lg">Go to Account</a>
        <?php else: ?>
          <a href="<?= e(DOWNLOAD_PAGE) ?>" class="btn btn-primary btn-lg">
            <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download for Windows
          </a>
          <a href="#demo" class="btn btn-ghost btn-lg">Explore Live Simulator</a>
        <?php endif; ?>
      </div>

      <div class="hero-telemetry" aria-label="Edge Performance Metrics">
        <div class="telemetry-pill">
          <span class="label">INFERENCE SPEED</span>
          <span class="val font-mono"><b class="grad">12.4&nbsp;ms</b> / frame</span>
        </div>
        <div class="telemetry-divider" aria-hidden="true"></div>
        <div class="telemetry-pill">
          <span class="label">DIMENSIONAL ACCURACY</span>
          <span class="val font-mono"><b>&plusmn;0.02&nbsp;mm</b> GD&amp;T</span>
        </div>
        <div class="telemetry-divider" aria-hidden="true"></div>
        <div class="telemetry-pill">
          <span class="label">DATA PRIVACY</span>
          <span class="val font-mono"><b>100%</b> Air-Gapped Local</span>
        </div>
      </div>
    </div>
  </section>


  <!-- ==================== INTERACTIVE INSPECTION SIMULATOR ==================== -->
  <section class="demo-section" id="demo">
    <div class="section-head">
      <h2>Interactive Inspection Simulator</h2>
      <p>Select an industrial part, toggle between Golden (OK) and Defective (NG) samples, inspect sub-pixel segmentation masks and GD&amp;T dimensions, and test the 24V PLC solenoid pulse.</p>
    </div>

    <div class="demo-container">
      <div class="demo-viewport-box">
        <div class="demo-viewport-header">
          <div class="camera-status">
            <span class="pulse-dot" aria-hidden="true"></span>
            <span>LIVE SENSOR // 120&nbsp;FPS // BASLER GIGE VISION</span>
          </div>
          <div class="camera-lens-info">
            <span>TELECENTRIC OPTICS 0.5X &middot; CALIBRATED 10.4 &mu;m/px</span>
          </div>
        </div>

        <canvas id="demo-canvas" width="680" height="420" role="img" aria-label="Interactive real-time machine vision inspection view"></canvas>

        <div class="demo-viewport-footer">
          <span class="reticle-coords font-mono">RETICLE: X: 340.00 Y: 210.00 &middot; GAIN: 2.4 dB</span>
          <span class="frame-tag font-mono">INSPECTION CELL #01</span>
        </div>
      </div>

      <div class="demo-controls-panel">
        <div class="control-block">
          <label for="demo-part-select" class="control-label">MANUFACTURED WORKPIECE</label>
          <select id="demo-part-select" class="demo-select">
            <option value="pcb">SMT Electronic Board (PCB-A)</option>
            <option value="stamping">Automotive Stamped Bracket</option>
            <option value="vial">Pharmaceutical Glass Vial</option>
            <option value="bolt">High-Tensile Flange Bolt M8</option>
          </select>
        </div>

        <div class="control-block">
          <span class="control-label">PART CONDITION SAMPLE</span>
          <div class="sample-toggle-group" role="group" aria-label="Part sample selection">
            <button type="button" id="demo-sample-ok" class="sample-btn active">
              <span class="dot-ok" aria-hidden="true"></span>
              Golden Sample (OK)
            </button>
            <button type="button" id="demo-sample-ng" class="sample-btn">
              <span class="dot-ng" aria-hidden="true"></span>
              Defective Part (NG)
            </button>
          </div>
        </div>

        <div class="control-block">
          <span class="control-label">AI OVERLAY LAYERS</span>
          <div class="layer-toggles">
            <label class="toggle-row">
              <input type="checkbox" id="demo-toggle-mask" checked>
              <span>Sub-Pixel YOLOv11 Segmentation Mask</span>
            </label>
            <label class="toggle-row">
              <input type="checkbox" id="demo-toggle-gdt" checked>
              <span>GD&amp;T Caliper Tolerance Limits (USL / LSL)</span>
            </label>
          </div>
        </div>

        <div class="telemetry-card">
          <div class="telemetry-row">
            <span>INSPECTION VERDICT</span>
            <span id="demo-status-badge" class="status-badge status-pass">PASS</span>
          </div>
          <div class="telemetry-row">
            <span>DEFECT CONFIDENCE</span>
            <span id="demo-conf-val" class="font-mono tabular-nums">0.982</span>
          </div>
          <div class="telemetry-row">
            <span>CYCLE LATENCY</span>
            <span id="demo-latency-val" class="font-mono tabular-nums">11.8&nbsp;ms</span>
          </div>
          <div class="telemetry-row">
            <span>GD&amp;T DIMENSION</span>
            <span id="demo-gdt-val" class="font-mono">Within ISO-1101 Class A</span>
          </div>
        </div>

        <div class="plc-actuation-block">
          <span class="control-label">24V PLC / FIELDBUS REJECT TEST</span>
          <div class="plc-status-box">
            <div class="plc-status-indicator font-mono">
              <span class="plc-terminal font-mono">[MODBUS 502]</span>
              <span id="demo-coil-bit" class="font-mono">COIL 0002: HIGH (1)</span>
            </div>
            <div id="demo-plc-status" class="plc-status-text">LINE ADVANCING -> CONVEYOR RUN</div>
          </div>
          <button type="button" id="demo-plc-pulse" class="btn btn-outline btn-block">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Fire 24V Solenoid Pulse (120&nbsp;ms)
          </button>
        </div>
      </div>
    </div>
  </section>


  <!-- ==================== CORE CAPABILITIES (BENTO GRID) ==================== -->
  <section class="features-section" id="features">
    <div class="section-head">
      <h2>Engineered for High-Speed Factory Production</h2>
      <p>Built specifically for manufacturing engineers, quality managers, and automation technicians who need dependable machine vision without vendor lock-in.</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        </div>
        <h3>YOLOv11 Polygon Segmentation</h3>
        <p>Go beyond coarse rectangular boxes. AutomaEyes segments the sub-pixel organic boundaries of hairline cracks, solder shorts, metal flash, and burrs directly on NVIDIA GPUs or multi-core CPUs.</p>
        <span class="feature-tag">SUB-PIXEL CONTOURS</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
        <h3>Sub-Millimeter GD&amp;T Calipers</h3>
        <p>Calibrated pixel-to-metric conversions calculate hole diameters, roundness ovality, wall thicknesses, and parallelism against upper and lower engineering tolerance limits (USL / LSL).</p>
        <span class="feature-tag">&plusmn;0.02&nbsp;MM ACCURACY</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3>100% Air-Gapped Local Privacy</h3>
        <p>Your CAD drawings, proprietary workpieces, and inspection photos run entirely on your shop-floor Windows machine. Zero cloud uploads, zero external telemetry, and no recurring API fees.</p>
        <span class="feature-tag">ZERO CLOUD CALLS</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <h3>Built-In Labeling &amp; Leak Prevention</h3>
        <p>Annotate polygons, circles, and bounding boxes directly inside the desktop app. Reproducible train/val/test splits occur before augmentation to eliminate data leakage and inflated accuracy scores.</p>
        <span class="feature-tag">NO-CODE ANNOTATION</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </div>
        <h3>GigE &amp; USB3 Industrial Cameras</h3>
        <p>Connect standard factory camera hardware: Basler, FLIR, IDS, Hikrobot, standard DirectShow webcams, and RTSP IP streams. Supports hardware photoelectric trigger sync.</p>
        <span class="feature-tag">GIGE VISION &amp; RTSP</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
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
      <h2>From Camera Exposure to Solenoid Ejection</h2>
      <p>Click any stage below or scroll through to see the live 3D inspection workflow, defect localization, and hardware actuation trigger.</p>
    </div>

    <!-- 3D Pipeline Visualizer (Interactive Canvas + Clickable Rail) -->
    <div class="story3d" id="story3d">
      <div class="story3d-pin">
        <div id="story3d-canvas"></div>

        <div class="story3d-head">
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

        <div class="overlay" id="ov-frame"><span class="frame-tag font-mono">DETECTION FRAME</span></div>

        <div class="overlay" id="ov-panel">
          <div class="row"><span>Model</span><b>objectv1.pt</b></div>
          <div class="row"><span>Confidence</span><b class="tabular-nums">0.94</b></div>
          <div class="row"><span>FPS</span><b class="tabular-nums">41</b></div>
          <div class="row"><span>Status</span><b class="ok">scanning</b></div>
        </div>

        <div class="overlay" id="ov-defect">
          <div class="dot" aria-hidden="true"></div>
          <div class="tag font-mono">DEFECT &middot; BURR &middot; 0.3&nbsp;mm</div>
        </div>

        <div class="overlay" id="ov-output">
          <div class="tag font-mono">OUTPUT PIN 7 &rarr; HIGH &middot; REJECT ACTUATED</div>
        </div>
      </div>
    </div>

    <!-- Scrollytelling Step Narrative -->
    <div class="scrolly" id="scrolly" style="--steps:7">
      <div class="scrolly-inner">
        <div class="scrolly-grid">

          <div class="scrolly-copy">
            <div class="step-rail" id="step-rail" aria-hidden="true"></div>
            <ol class="step-list">

              <li class="step-item" data-step="0" data-label="Connect">
                <div class="step-copy">
                  <span class="step-index font-mono">[01] Connect</span>
                  <h2>Your Data, Your Private GitHub</h2>
                  <p>Sign in and connect your own GitHub or GitLab account. Every project, dataset, and trained model weights file lives in a private repository you control. There is zero proprietary cloud storage on our side.</p>
                  <ul>
                    <li>Private or public repositories, your choice</li>
                    <li>Git LFS versioned datasets: no vendor lock-in</li>
                    <li>Revoke access from GitHub settings at any time</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="1" data-label="Dataset">
                <div class="step-copy">
                  <span class="step-index font-mono">[02] Dataset</span>
                  <h2>Trained on Photos of Your Own Workpieces</h2>
                  <p>Create a model (detection, polygon segmentation, classification, or OCR) and import photos of the parts you actually manufacture. Generic models cannot resolve your plant's specific micro-tolerances.</p>
                  <ul>
                    <li>YOLOv11 segmentation, detection, and classification</li>
                    <li>Define custom class labels and inspection zones</li>
                    <li>Incrementally add more sample images anytime</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="2" data-label="Annotate">
                <div class="step-copy">
                  <span class="step-index font-mono">[03] Annotate</span>
                  <h2>Label Workpieces Without Leaving the App</h2>
                  <p>Polygon tools for complex parts, bounding boxes for rapid sorting, and circles for round bores and pins. Precise geometry is what makes millimeter GD&amp;T measurement accurate.</p>
                  <ul>
                    <li>Built-in labeling tool: no separate web app needed</li>
                    <li>Direct pipeline handoff: zero manual export steps</li>
                    <li>Keyboard-driven hotkeys engineered for fast bulk labeling</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="3" data-label="Split">
                <div class="step-copy">
                  <span class="step-index font-mono">[04] Split &amp; Augment</span>
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
                  <span class="step-index font-mono">[05] Train &amp; Evaluate</span>
                  <h2>Deterministic Local GPU Training</h2>
                  <p>Model training executes locally using PyTorch with CUDA or DirectML acceleration. Evaluation metrics include per-class confusion matrices, precision-recall curves, and mAP@50-95 scores.</p>
                  <ul>
                    <li>Real-time loss curves and training telemetry</li>
                    <li>Automated validation against unseen holdout test sets</li>
                    <li>ONNX and TensorRT quantization export for edge inference</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="5" data-label="Workflow">
                <div class="step-copy">
                  <span class="step-index font-mono">[06] Inspection Rules</span>
                  <h2>Configure Tolerances &amp; GD&amp;T Rules</h2>
                  <p>Chain vision models with mechanical tolerances, 1D/2D barcode decoders, OCR text matchers, and presence/absence checks. Set upper and lower tolerance limits with automatic calibration-drift warning.</p>
                  <ul>
                    <li>GD&amp;T calipers: ovality, pitch, angle, and wall thickness</li>
                    <li>Optical character recognition for lot codes and expiration dates</li>
                    <li>Multi-camera synchronization over industrial Ethernet switches</li>
                  </ul>
                </div>
              </li>

              <li class="step-item" data-step="6" data-label="Actuate">
                <div class="step-copy">
                  <span class="step-index font-mono">[07] PLC Actuation</span>
                  <h2>Direct Hardware &amp; Fieldbus Signal</h2>
                  <p>When an NG part is detected, AutomaEyes immediately pulses your 24V reject diverter via Modbus TCP, RTU RS485, or USB relay controllers. Test individual coils and timing directly from the UI before running the line.</p>
                  <ul>
                    <li>Native Modbus TCP and RTU without external protocol gateways</li>
                    <li>Arduino and ESP32 USB serial relay support with bundled C++ firmware</li>
                    <li>Real-time quality records exported to CSV, SQLite, and Excel</li>
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
                <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="45" y="50" width="150" height="95" rx="10" stroke="#00f0c0" stroke-width="2"/>
                  <circle cx="120" cy="97" r="28" stroke="#7c5cff" stroke-width="2"/>
                  <circle cx="120" cy="97" r="11" fill="#7c5cff"/>
                  <rect x="155" y="65" width="14" height="10" rx="3" fill="#00f0c0"/>
                  <path d="M100 40h40M120 40v10" stroke="#2b3348" stroke-width="2"/>
                </svg>
              </div>
              <div class="stage-hud">
                <span class="font-mono">AUTOMAEYE // EDGE UNIT</span>
                <span id="hud-step" class="font-mono tabular-nums">[01]</span>
              </div>
              <p class="drag-hint" id="drag-hint">Drag to inspect workpiece</p>
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
      <h2>Industrial Hardware &amp; PLC Integration</h2>
      <p>Connect AutomaEyes straight to your factory floor. No proprietary protocol bridges required.</p>
    </div>

    <div class="hardware-grid">
      <div class="hardware-card">
        <div class="card-badge font-mono">MODBUS TCP / RTU</div>
        <h3>Industrial PLCs</h3>
        <p>Direct communication with Siemens S7-1200/1500, Omron Sysmac, Mitsubishi MELSEC, Schneider, and Delta. Reads line triggers and writes pass/fail coil bits in real time.</p>
        <div class="code-snippet font-mono">
          <code>Modbus TCP // Port 502<br>Coil 0001: Machine Running<br>Coil 0002: Inspection PASS<br>Coil 0003: REJECT Trigger (100ms)</code>
        </div>
      </div>

      <div class="hardware-card">
        <div class="card-badge font-mono">USB SERIAL RELAYS</div>
        <h3>Arduino &amp; ESP32 Actuation</h3>
        <p>Use standard Arduino Uno/Mega or ESP32 boards with the bundled C++ firmware. Directly drive 24V optoisolated relays, pneumatic air-blast valves, or reject kicker pistons.</p>
        <div class="code-snippet font-mono">
          <code>// USB Serial @ 115200 baud<br>REJECT_PIN = 7;<br>digitalWrite(REJECT_PIN, HIGH);<br>delay(PULSE_MS); // 120ms pulse</code>
        </div>
      </div>

      <div class="hardware-card">
        <div class="card-badge font-mono">DIGITAL 24V I/O</div>
        <h3>Hardware Photoelectric Triggers</h3>
        <p>Synchronize camera shutter with conveyor workpiece arrival. High-speed optoisolators eliminate frame jitter and guarantee parts are centered under optics.</p>
        <div class="code-snippet font-mono">
          <code>Photo-eye Sensor &rarr; 24V Trigger IN<br>Hardware Latency: &lt; 1.8 ms<br>Camera Shutter: 1/2000s Sync<br>Jitter Envelope: &plusmn;0.4 ms</code>
        </div>
      </div>

      <div class="hardware-card">
        <div class="card-badge font-mono">SCADA &amp; MES EXPORT</div>
        <h3>Automated Quality Logs &amp; Excel</h3>
        <p>Continuously archive shift inspection results, dimensional records, and defect images to local SQLite, CSV, or formatted Excel (.xlsx) spreadsheets for statistical process control (SPC).</p>
        <div class="code-snippet font-mono">
          <code>Shift Yield: 99.42% OK<br>Hourly Log: /exports/shift_01.xlsx<br>SPC Data: Mean Ø 12.018mm<br>Cp / Cpk: 1.64 / 1.58</code>
        </div>
      </div>
    </div>
  </section>


  <!-- ==================== BENCHMARKS ==================== -->
  <section class="benchmarks-section" id="benchmarks">
    <div class="section-head">
      <span class="eyebrow">Production Benchmarks</span>
      <h2>Edge AI vs. Cloud Vision Latency</h2>
      <p>Why manufacturing quality control demands on-premise edge computing instead of remote cloud APIs.</p>
    </div>

    <div class="benchmarks-container">
      <div class="benchmark-table">
        <div class="bench-row bench-header">
          <div class="bench-col">Inference Architecture</div>
          <div class="bench-col">Cycle Latency</div>
          <div class="bench-col">Conveyor Speed Limit</div>
          <div class="bench-col">Monthly Cloud Fee (1 Part/Sec)</div>
        </div>

        <div class="bench-row bench-highlight">
          <div class="bench-col">
            <b>AutomaEyes TensorRT (Edge GPU)</b>
            <span class="bench-sub">NVIDIA RTX 4060 / 3060 Local</span>
          </div>
          <div class="bench-col">
            <span class="bench-badge ok font-mono tabular-nums">12.4&nbsp;ms</span>
          </div>
          <div class="bench-col">
            <span class="bench-val font-mono tabular-nums">Up to 80&nbsp;parts/sec</span>
          </div>
          <div class="bench-col">
            <span class="bench-price font-mono">$0 / month (Unlimited)</span>
          </div>
        </div>

        <div class="bench-row">
          <div class="bench-col">
            <b>AutomaEyes ONNX (Edge CPU)</b>
            <span class="bench-sub">Intel Core i7 / AMD Ryzen Local</span>
          </div>
          <div class="bench-col">
            <span class="bench-badge ok font-mono tabular-nums">42.1&nbsp;ms</span>
          </div>
          <div class="bench-col">
            <span class="bench-val font-mono tabular-nums">Up to 24&nbsp;parts/sec</span>
          </div>
          <div class="bench-col">
            <span class="bench-price font-mono">$0 / month (Unlimited)</span>
          </div>
        </div>

        <div class="bench-row bench-fail">
          <div class="bench-col">
            <b>Typical Cloud Vision APIs</b>
            <span class="bench-sub">AWS / Azure / GCP Cloud Endpoints</span>
          </div>
          <div class="bench-col">
            <span class="bench-badge danger font-mono tabular-nums">450 to 850&nbsp;ms</span>
          </div>
          <div class="bench-col">
            <span class="bench-val fail font-mono">&lt; 1.5&nbsp;parts/sec (Too slow)</span>
          </div>
          <div class="bench-col">
            <span class="bench-price danger font-mono tabular-nums">$2,160 / month ($0.0015/req)</span>
          </div>
        </div>
      </div>

      <div class="bench-callout">
        <div class="callout-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="callout-content">
          <h4>Zero Network Downtime Guarantee</h4>
          <p>If your factory internet connection drops, AutomaEyes keeps inspecting at full 60&nbsp;FPS without missing a single part. Critical manufacturing lines cannot depend on cloud availability.</p>
        </div>
      </div>
    </div>
  </section>


  <!-- ==================== FAQ SECTION ==================== -->
  <section class="faq-section" id="faq">
    <div class="section-head">
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
          <p>Yes. AutomaEyes includes high-speed ONNX runtime optimization for Intel and AMD multi-core CPUs, delivering 20 to 45&nbsp;ms per frame. For high-speed lines requiring &gt;50 inspections per second, an NVIDIA RTX GPU with TensorRT acceleration is recommended.</p>
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
    <p>AutomaEyes runs locally on Windows 10/11 next to your factory cameras. The installer bundles Python, PyTorch, and ONNX runtime so your shop floor is operational in minutes.</p>
    <div class="download-panel">
      <a href="<?= e(DOWNLOAD_PAGE) ?>" class="btn btn-primary btn-lg">
        <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Download for Windows
      </a>
      <?php if (!$user): ?>
        <a href="/login.php" class="btn btn-ghost">Already installed? Sign in to link your account</a>
      <?php else: ?>
        <a href="/welcome.php" class="btn btn-ghost">Go to your connected account</a>
      <?php endif; ?>
      <span class="platform-note font-mono">WINDOWS 10/11 &middot; 64-BIT<?php if ($v = Release::version()): ?> &middot; v<?= e($v) ?><?php endif; ?> &middot; NO EXTRA RUNTIMES REQUIRED</span>
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
