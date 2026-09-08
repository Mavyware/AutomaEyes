/**
 * AutomaEyes 3D Background Engine
 * Scroll-Driven Three.js WebGL Industrial Visualizer:
 * - 3D movement and transformations are physically driven by user scroll progress
 * - No infinite repeating loops: each scroll gesture advances the 3D scene
 * - Interactive mouse parallax perspective
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
  var currentScroll = 0;
  var targetScroll = 0;
  var maxScroll = 1;
  var isRunning = true;

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

    /* ---------- 2. Scroll-Linked Industrial Laser Plane ---------- */
    var laserGeo = new THREE.PlaneGeometry(70, 0.35);
    var laserMat = new THREE.MeshBasicMaterial({
      color: ACCENT_CYAN,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.rotation.x = -Math.PI / 2.25;
    laserBeam.position.set(0, -6.4, -14);
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
    laserGlow.position.set(0, -6.4, -14);
    scene.add(laserGlow);

    /* ---------- 3. Telecentric Inspection Lens (Left) ---------- */
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

    /* ---------- 4. Precision SMT Workpiece (Right) ---------- */
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

    /* ---------- 5. Center Telemetry Reticle (Depth) ---------- */
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
    });

    onScroll();
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
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScroll = window.pageYOffset || document.documentElement.scrollTop;
  }

  function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    if (!W || !H) return;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
    onScroll();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isRunning) return;

    // Smooth lerp damping for scroll: animations progress WITH user scroll
    currentScroll += (targetScroll - currentScroll) * 0.08;
    var sp = Math.max(0, Math.min(1, currentScroll / maxScroll));

    if (!reduced) {
      // 1. Undulating terrain wave: phase is physically driven by scroll progress
      var posArray = posAttr.array;
      var wavePhase = sp * Math.PI * 4.5;
      for (var i = 0; i < posArray.length; i += 3) {
        var vx = posArray[i];
        var vy = posArray[i + 1];
        posArray[i + 2] = Math.sin(vx * 0.18 + wavePhase) * Math.cos(vy * 0.18 + wavePhase * 0.75) * 1.5;
      }
      posAttr.needsUpdate = true;

      // 2. Industrial Laser Plane: sweeps across the grid as user scrolls from top to bottom
      var laserZ = -14 + sp * 28;
      laserBeam.position.z = laserZ;
      laserGlow.position.z = laserZ;

      // 3. Telecentric Lens (Left): rotates and tilts proportionally to scroll
      lensGroup.position.x = -10.5 + sp * 2.5;
      lensGroup.position.y = 3.5 - sp * 1.8;
      lensGroup.rotation.y = sp * Math.PI * 1.6;
      lensGroup.rotation.z = Math.sin(sp * Math.PI) * 0.32;

      // 4. Precision SMT Workpiece (Right): spins 360 degrees as user scrolls through page
      chipGroup.position.x = 10.5 - sp * 2.0;
      chipGroup.position.y = 2.8 - sp * 1.5;
      chipGroup.rotation.y = sp * Math.PI * 2.2;
      chipGroup.rotation.x = 0.2 + Math.sin(sp * Math.PI) * 0.38;

      // 5. Reticle rotation & depth zoom
      reticleGroup.rotation.z = sp * Math.PI * 2;
      reticleGroup.scale.setScalar(Math.max(0.65, 1 - sp * 0.35));

      // 6. Particle cloud: advances along Z axis with scroll depth
      particles.position.z = sp * 22;
      particles.rotation.y = sp * 0.6;

      // 7. Parallax camera tracking: smooth mouse perspective + scroll depth
      targetCamX = mouseX * 3.2;
      targetCamY = 6 - mouseY * 2.0 - sp * 4.5;
      camera.position.x += (targetCamX - camera.position.x) * 0.06;
      camera.position.y += (targetCamY - camera.position.y) * 0.06;
      camera.position.z = 24 - sp * 6;
      camera.lookAt(0, 2 - sp * 3.5, 0);
    }

    renderer.render(scene, camera);
  }
})();
