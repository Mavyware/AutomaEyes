/**
 * AutomaEyes 3D Background Engine
 * High-performance Three.js WebGL industrial visualizer:
 * - Dynamic undulating inspection terrain grid
 * - Floating 3D telecentric lens & precision workpiece wireframes
 * - Sweeping industrial laser inspection plane
 * - Reactive mouse parallax & scroll-driven spatial depth
 */
import * as THREE from 'three';

(function () {
  'use strict';

  var canvas = document.getElementById('hero-bg-3d');
  if (!canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer, scene, camera;
  var gridMesh, gridPoints, gridGeo, posAttr;
  var laserBeam, laserGlow;
  var lensGroup, chipGroup, reticleGroup;
  var particles, particleGeo, particlePositions;
  var W = window.innerWidth;
  var H = window.innerHeight;

  var mouseX = 0, mouseY = 0;
  var targetCamX = 0, targetCamY = 6;
  var scrollY = 0;
  var isRunning = true;
  var clock = new THREE.Clock();

  var ACCENT_CYAN = 0x00f0c0;
  var ACCENT_PURPLE = 0x7c5cff;
  var GRID_DARK = 0x142036;

  try {
    init();
  } catch (err) {
    console.warn('AutomaEyes: 3D Background unavailable', err);
  }

  function init() {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 1000);
    camera.position.set(0, 6, 24);

    // Ambient and directional lighting
    var ambient = new THREE.AmbientLight(0x405070, 1.6);
    scene.add(ambient);

    var dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(8, 12, 10);
    scene.add(dirLight1);

    var cyanLight = new THREE.PointLight(ACCENT_CYAN, 35, 30);
    cyanLight.position.set(-10, 5, 8);
    scene.add(cyanLight);

    var purpleLight = new THREE.PointLight(ACCENT_PURPLE, 28, 30);
    purpleLight.position.set(10, -2, 6);
    scene.add(purpleLight);

    /* ---------- 1. Dynamic Undulating Inspection Grid ---------- */
    var gridCols = 54, gridRows = 54;
    var gridW = 90, gridH = 90;
    gridGeo = new THREE.PlaneGeometry(gridW, gridH, gridCols, gridRows);
    posAttr = gridGeo.attributes.position;

    var gridMat = new THREE.MeshStandardMaterial({
      color: GRID_DARK,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      metalness: 0.4,
      roughness: 0.6
    });
    gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2.25;
    gridMesh.position.set(0, -6.5, -4);
    scene.add(gridMesh);

    // Glowing cyan intersection points on the grid
    var pMat = new THREE.PointsMaterial({
      color: ACCENT_CYAN,
      size: 0.08,
      transparent: true,
      opacity: 0.65
    });
    gridPoints = new THREE.Points(gridGeo, pMat);
    gridMesh.add(gridPoints);

    /* ---------- 2. Sweeping Industrial Laser Plane ---------- */
    var laserGeo = new THREE.PlaneGeometry(70, 0.35);
    var laserMat = new THREE.MeshBasicMaterial({
      color: ACCENT_CYAN,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.rotation.x = -Math.PI / 2.25;
    laserBeam.position.set(0, -6.4, 0);
    scene.add(laserBeam);

    // Laser glow wash
    var glowGeo = new THREE.PlaneGeometry(70, 5);
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0c0,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    laserGlow = new THREE.Mesh(glowGeo, glowMat);
    laserGlow.rotation.x = -Math.PI / 2.25;
    laserGlow.position.set(0, -6.4, 0);
    scene.add(laserGlow);

    /* ---------- 3. Floating 3D Industrial Lens (Left) ---------- */
    lensGroup = new THREE.Group();
    lensGroup.position.set(-10.5, 3.5, 3);
    scene.add(lensGroup);

    var lensBodyMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.85,
      roughness: 0.25
    });
    var lensCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 3.4, 36), lensBodyMat);
    lensCyl.rotation.x = Math.PI / 2.8;
    addWireframeEdges(lensCyl, ACCENT_CYAN, 0.5);
    lensGroup.add(lensCyl);

    var lensRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.08, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0x223048, metalness: 0.9, roughness: 0.2 })
    );
    lensRing.position.z = 1.6;
    lensRing.rotation.x = Math.PI / 2.8;
    addWireframeEdges(lensRing, 0x3d547a, 0.7);
    lensGroup.add(lensRing);

    // Lens cone optical projection (wireframe rays)
    var rayCone = new THREE.Mesh(
      new THREE.ConeGeometry(3.6, 7.5, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: ACCENT_CYAN,
        wireframe: true,
        transparent: true,
        opacity: 0.22
      })
    );
    rayCone.rotation.x = -Math.PI / 1.55;
    rayCone.position.set(0, -3.2, 3.2);
    lensGroup.add(rayCone);

    /* ---------- 4. Floating Precision SMT Workpiece (Right) ---------- */
    chipGroup = new THREE.Group();
    chipGroup.position.set(10.5, 2.8, 1);
    scene.add(chipGroup);

    var chipMat = new THREE.MeshStandardMaterial({
      color: 0x0c121e,
      metalness: 0.8,
      roughness: 0.3
    });
    var chipBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 3.4), chipMat);
    addWireframeEdges(chipBody, ACCENT_PURPLE, 0.65);
    chipGroup.add(chipBody);

    // Microchip gull-wing leads
    var leadMat = new THREE.MeshStandardMaterial({ color: 0xc8d4e5, metalness: 0.9, roughness: 0.15 });
    for (var i = 0; i < 8; i++) {
      var off = -1.2 + i * 0.34;
      var pin1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.55), leadMat);
      pin1.position.set(off, 0, 1.85);
      chipGroup.add(pin1);
      var pin2 = pin1.clone();
      pin2.position.set(off, 0, -1.85);
      chipGroup.add(pin2);
      var pin3 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.12), leadMat);
      pin3.position.set(1.85, 0, off);
      chipGroup.add(pin3);
      var pin4 = pin3.clone();
      pin4.position.set(-1.85, 0, off);
      chipGroup.add(pin4);
    }

    // Inspection Caliper Target Box around chip
    var chipBox = new THREE.BoxHelper(chipBody, ACCENT_CYAN);
    chipBox.material.transparent = true;
    chipBox.material.opacity = 0.45;
    chipGroup.add(chipBox);

    /* ---------- 5. Center Floating Telemetry Reticle (Depth) ---------- */
    reticleGroup = new THREE.Group();
    reticleGroup.position.set(0, 7.5, -6);
    scene.add(reticleGroup);

    var ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.04, 12, 64),
      new THREE.MeshBasicMaterial({ color: ACCENT_CYAN, transparent: true, opacity: 0.28 })
    );
    reticleGroup.add(ringMesh);

    var innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.03, 12, 48),
      new THREE.MeshBasicMaterial({ color: ACCENT_PURPLE, transparent: true, opacity: 0.22 })
    );
    reticleGroup.add(innerRing);

    // Crosshairs
    var chPoints = [
      new THREE.Vector3(-4.8, 0, 0), new THREE.Vector3(-3.4, 0, 0),
      new THREE.Vector3(3.4, 0, 0), new THREE.Vector3(4.8, 0, 0),
      new THREE.Vector3(0, -4.8, 0), new THREE.Vector3(0, -3.4, 0),
      new THREE.Vector3(0, 3.4, 0), new THREE.Vector3(0, 4.8, 0)
    ];
    var chGeo = new THREE.BufferGeometry().setFromPoints(chPoints);
    var chLines = new THREE.LineSegments(chGeo, new THREE.LineBasicMaterial({
      color: ACCENT_CYAN,
      transparent: true,
      opacity: 0.45
    }));
    reticleGroup.add(chLines);

    /* ---------- 6. Deep Ambient Particle Field ---------- */
    var pCount = 420;
    particlePositions = new Float32Array(pCount * 3);
    for (var p = 0; p < pCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 60;
      particlePositions[p * 3 + 1] = (Math.random() - 0.5) * 35;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
    }
    particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    var particleMat = new THREE.PointsMaterial({
      color: ACCENT_CYAN,
      size: 0.12,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ---------- Listeners ---------- */
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', function () {
      isRunning = !document.hidden;
      if (isRunning) clock.getDelta();
    });

    animate();
  }

  function addWireframeEdges(mesh, color, opacity) {
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 28),
      new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity || 0.6 })
    );
    mesh.add(edges);
    return edges;
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / W) * 2 - 1;
    mouseY = (e.clientY / H) * 2 - 1;
  }

  function onScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }

  function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    if (!W || !H) return;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isRunning) return;

    var t = clock.getElapsedTime();

    if (!reduced) {
      // 1. Undulating terrain wave calculation
      var posArray = posAttr.array;
      for (var i = 0; i < posArray.length; i += 3) {
        var vx = posArray[i];
        var vy = posArray[i + 1];
        // Dynamic wave interference formula
        posArray[i + 2] = Math.sin(vx * 0.18 + t * 1.4) * Math.cos(vy * 0.18 + t * 1.1) * 1.35
          + Math.sin((vx + vy) * 0.1 + t * 0.7) * 0.6;
      }
      posAttr.needsUpdate = true;

      // 2. Sweeping Laser Plane motion
      var laserZ = Math.sin(t * 0.75) * 16 - 4;
      laserBeam.position.z = laserZ;
      laserGlow.position.z = laserZ;
      laserBeam.material.opacity = 0.7 + 0.3 * Math.sin(t * 3.5);

      // 3. Floating Lens motion (Left)
      lensGroup.position.y = 3.5 + Math.sin(t * 0.9) * 0.45;
      lensGroup.rotation.y = Math.sin(t * 0.5) * 0.35;
      lensGroup.rotation.z = Math.cos(t * 0.4) * 0.15;

      // 4. Floating SMT Workpiece motion (Right)
      chipGroup.position.y = 2.8 + Math.sin(t * 0.8 + 1.2) * 0.4;
      chipGroup.rotation.y = t * 0.32;
      chipGroup.rotation.x = Math.sin(t * 0.5) * 0.22;

      // 5. Reticle rotation (Depth)
      reticleGroup.rotation.z = t * 0.08;
      reticleGroup.position.y = 7.5 + Math.sin(t * 0.6) * 0.3;

      // 6. Particle drift
      particles.rotation.y = t * 0.035;
      particles.rotation.x = Math.sin(t * 0.02) * 0.05;

      // 7. Parallax camera damping with mouse and scroll
      targetCamX = mouseX * 3.2;
      targetCamY = 6 - mouseY * 2.2 - scrollY * 0.003;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z = 24 + scrollY * 0.004;
      camera.lookAt(0, 2 - scrollY * 0.003, 0);
    }

    renderer.render(scene, camera);
  }
})();
