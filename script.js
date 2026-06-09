// =====================================================
// Gallery — populate from the real filenames
// =====================================================
const photos = [
  "20260403_183550.jpg",
  "20260406_164957.jpg",
  "20260406_172038(0).jpg",
  "20260406_172040.jpg",
  "20260406_172041.jpg",
  "20260406_172138.jpg",
  "20260409_152922.jpg",
  "20260422_162214.jpg",
  "20260422_162220.jpg",
  "20260422_162227.jpg",
  "20260517_125424.jpg",
  "20260522_134944.jpg",
  "20260524_092325.jpg",
  "20260524_092411.jpg",
  "20260526_181203.jpg",
  "20260530_171148.jpg",
  "20260530_172338.jpg",
  "20260531_140051.jpg",
  "20260531_140116.jpg",
  "20260531_154147.jpg",
  "20260531_154424.jpg",
  "20260531_154508.jpg",
  "IMG-20260321-WA0127.jpg",
  "IMG_20260510_165449031_HDR_PORTRAIT.jpg"
];

(function buildGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  photos.forEach(function(name) {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const img = document.createElement('img');
    // encode only special chars that break URLs — keep parentheses encoded
    img.src = 'photos/' + encodeURIComponent(name);
    img.alt = 'Phionah';
    img.loading = 'lazy';

    // fallback: hide broken images gracefully
    img.onerror = function() { item.style.display = 'none'; };

    item.appendChild(img);
    container.appendChild(item);
  });
})();

// =====================================================
// 3D Heart — Three.js + GSAP (with safety guards)
// =====================================================
(function initHeart() {
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
    console.warn('Three.js or GSAP not loaded — heart animation skipped');
    return;
  }

  const heartContainer = document.getElementById('heart-container');
  if (!heartContainer) return;

  // Hidden SVG heart path to sample points from
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 600 552');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  const pathEl = document.createElementNS(svgNS, 'path');
  pathEl.setAttribute('d', 'M300,107.77C284.68,55.67,239.76,0,162.31,0,64.83,0,0,82.08,0,171.71c0,.48,0,.95,0,1.43-.52,19.5,0,217.94,299.87,379.69v0l0,0,.05,0,0,0,0,0v0C600,391.08,600.48,192.64,600,173.14c0-.48,0-.95,0-1.43C600,82.08,535.17,0,437.69,0,360.24,0,315.32,55.67,300,107.77');
  svg.appendChild(pathEl);
  document.body.appendChild(svg);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  cam.position.z = 500;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  heartContainer.appendChild(renderer.domElement);

  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  const len = pathEl.getTotalLength();
  const verts = [];

  for (let i = 0; i < len; i += 0.12) {
    const pt = pathEl.getPointAtLength(i);
    const v = new THREE.Vector3(
      pt.x + (Math.random() - 0.5) * 28,
      -pt.y + (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 65
    );
    verts.push(v);
    tl.from(v, {
      x: 300, y: -276, z: 0,
      ease: 'power2.inOut',
      duration: 'random(2,5)'
    }, i * 0.002);
  }

  const geo = new THREE.BufferGeometry().setFromPoints(verts);
  const mat = new THREE.PointsMaterial({ color: 0xff2a75, blending: THREE.AdditiveBlending, size: 3.5 });
  const pts = new THREE.Points(geo, mat);
  pts.position.x -= 300;
  pts.position.y += 276;
  scene.add(pts);

  gsap.fromTo(scene.rotation, { y: -0.2 }, { y: 0.2, repeat: -1, yoyo: true, ease: 'power2.inOut', duration: 3 });

  (function loop() {
    requestAnimationFrame(loop);
    geo.setFromPoints(verts);
    renderer.render(scene, cam);
  })();

  window.addEventListener('resize', function() {
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// =====================================================
// Balloon / Firework canvas animation
// =====================================================
(function initBalloons() {
  const c = document.getElementById('balloon-canvas');
  if (!c) return;

  let w = c.width = window.innerWidth;
  let h = c.height = window.innerHeight;
  const ctx = c.getContext('2d');
  let hw = w / 2, hh = h / 2;

  const opts = {
    strings: ['HAPPY', 'BIRTHDAY!', 'Wifey ❤️'],
    charSize: 38,
    charSpacing: 38,
    lineHeight: 48,
    fireworkPrevPoints: 10,
    fireworkBaseLineWidth: 5,
    fireworkAddedLineWidth: 8,
    fireworkSpawnTime: 200,
    fireworkBaseReachTime: 30,
    fireworkAddedReachTime: 30,
    fireworkCircleBaseSize: 20,
    fireworkCircleAddedSize: 10,
    fireworkCircleBaseTime: 30,
    fireworkCircleAddedTime: 30,
    fireworkCircleFadeBaseTime: 10,
    fireworkCircleFadeAddedTime: 5,
    fireworkBaseShards: 5,
    fireworkAddedShards: 5,
    fireworkShardPrevPoints: 3,
    fireworkShardBaseVel: 4,
    fireworkShardAddedVel: 2,
    fireworkShardBaseSize: 3,
    fireworkShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    letterContemplatingWaitTime: 360,
    balloonSpawnTime: 20,
    balloonBaseInflateTime: 10,
    balloonAddedInflateTime: 10,
    balloonBaseSize: 20,
    balloonAddedSize: 20,
    balloonBaseVel: 0.4,
    balloonAddedVel: 0.4,
    balloonBaseRadian: -(Math.PI / 2 - 0.5),
    balloonAddedRadian: -1
  };

  const Tau = Math.PI * 2;
  const TauQ = Tau / 4;
  const totalW = opts.charSpacing * Math.max(...opts.strings.map(s => s.length));
  const letters = [];

  ctx.font = opts.charSize + 'px Verdana';

  function Letter(ch, x, y) {
    this.char = ch;
    this.x = x; this.y = y;
    this.dx = -ctx.measureText(ch).width / 2;
    this.dy = opts.charSize / 2;
    this.fireworkDy = y - hh;
    const hue = (x / totalW) * 360;
    this.color      = `hsl(${hue},80%,55%)`;
    this.alphaColor = `hsla(${hue},80%,55%,ALF)`;
    this.lightColor = `hsl(${hue},80%,75%)`;
    this.lightAlpha = `hsla(${hue},80%,LIT%,ALF)`;
    this.reset();
  }

  Letter.prototype.reset = function() {
    this.phase = 'firework';
    this.tick = 0;
    this.spawned = false;
    this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
    this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
  };

  Letter.prototype.step = function() {
    if (this.phase === 'firework') {
      if (!this.spawned) {
        if (++this.tick >= this.spawningTime) { this.tick = 0; this.spawned = true; }
      } else {
        ++this.tick;
        const lp = this.tick / this.reachTime;
        const ap = Math.sin(lp * TauQ);
        const x = lp * this.x;
        const y = hh + ap * this.fireworkDy;
        if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
        this.prevPoints.push([x, y, lp * this.lineWidth]);
        const lwp = 1 / (this.prevPoints.length - 1);
        for (let i = 1; i < this.prevPoints.length; i++) {
          const p = this.prevPoints[i], p2 = this.prevPoints[i - 1];
          ctx.strokeStyle = this.alphaColor.replace('ALF', i / this.prevPoints.length);
          ctx.lineWidth = p[2] * lwp * i;
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        }
        if (this.tick >= this.reachTime) {
          this.phase = 'contemplate';
          this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
          this.circleCompleteTime = (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) | 0;
          this.circleCreating = true; this.circleFading = false;
          this.circleFadeTime = (opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random()) | 0;
          this.tick = 0; this.tick2 = 0; this.shards = [];
          const sc = (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0;
          const ang = Tau / sc, cos = Math.cos(ang), sin = Math.sin(ang);
          let sx = 1, sy = 0;
          for (let i = 0; i < sc; i++) {
            const sx1 = sx; sx = sx * cos - sy * sin; sy = sy * cos + sx1 * sin;
            this.shards.push(new Shard(this.x, this.y, sx, sy, this.alphaColor));
          }
        }
      }
    } else if (this.phase === 'contemplate') {
      ++this.tick;
      if (this.circleCreating) {
        ++this.tick2;
        const pr = this.tick2 / this.circleCompleteTime;
        const arm = -Math.cos(pr * Math.PI) / 2 + 0.5;
        ctx.beginPath();
        ctx.fillStyle = this.lightAlpha.replace('LIT', 50 + 50 * pr).replace('ALF', pr);
        ctx.arc(this.x, this.y, arm * this.circleFinalSize, 0, Tau); ctx.fill();
        if (this.tick2 > this.circleCompleteTime) { this.tick2 = 0; this.circleCreating = false; this.circleFading = true; }
      } else if (this.circleFading) {
        ctx.fillStyle = this.lightColor; ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        ++this.tick2;
        const pr = this.tick2 / this.circleFadeTime;
        const arm = -Math.cos(pr * Math.PI) / 2 + 0.5;
        ctx.beginPath();
        ctx.fillStyle = this.lightAlpha.replace('LIT', 100).replace('ALF', 1 - arm);
        ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau); ctx.fill();
        if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
      } else {
        ctx.fillStyle = this.lightColor; ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }
      for (let i = 0; i < this.shards.length; i++) {
        this.shards[i].step();
        if (!this.shards[i].alive) { this.shards.splice(i--, 1); }
      }
      if (this.tick > opts.letterContemplatingWaitTime) {
        this.phase = 'balloon'; this.tick = 0; this.spawning = true;
        this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
        this.inflating = false;
        this.inflateTime = (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) | 0;
        this.size = (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;
        const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
        const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
        this.vx = Math.cos(rad) * vel; this.vy = Math.sin(rad) * vel;
      }
    } else if (this.phase === 'balloon') {
      ctx.strokeStyle = this.lightColor;
      if (this.spawning) {
        ++this.tick; ctx.fillStyle = this.lightColor; ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        if (this.tick >= this.spawnTime) { this.tick = 0; this.spawning = false; this.inflating = true; }
      } else if (this.inflating) {
        ++this.tick;
        const pr = this.tick / this.inflateTime;
        this.cx = this.x; this.cy = this.y - this.size * pr;
        ctx.fillStyle = this.alphaColor.replace('ALF', pr);
        ctx.beginPath(); balloon(this.cx, this.cy, this.size * pr); ctx.fill();
        ctx.beginPath(); ctx.moveTo(this.cx, this.cy); ctx.lineTo(this.cx, this.y); ctx.stroke();
        ctx.fillStyle = this.lightColor; ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        if (this.tick >= this.inflateTime) { this.tick = 0; this.inflating = false; }
      } else {
        this.cx += this.vx; this.cy += (this.vy += opts.upFlow);
        ctx.fillStyle = this.color;
        ctx.beginPath(); balloon(this.cx, this.cy, this.size); ctx.fill();
        ctx.beginPath(); ctx.moveTo(this.cx, this.cy); ctx.lineTo(this.cx, this.cy + this.size); ctx.stroke();
        ctx.fillStyle = this.lightColor; ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);
        if (this.cy + this.size < -hh || this.cx < -hw || this.cx > hw) this.phase = 'done';
      }
    }
  };

  function Shard(x, y, vx, vy, color) {
    const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
    this.vx = vx * vel; this.vy = vy * vel; this.x = x; this.y = y;
    this.prevPoints = [[x, y]]; this.color = color; this.alive = true;
    this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
  }
  Shard.prototype.step = function() {
    this.x += this.vx; this.y += (this.vy += opts.gravity);
    if (this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift();
    this.prevPoints.push([this.x, this.y]);
    const lwp = this.size / this.prevPoints.length;
    for (let k = 0; k < this.prevPoints.length - 1; k++) {
      const p = this.prevPoints[k], p2 = this.prevPoints[k + 1];
      ctx.strokeStyle = this.color.replace('ALF', k / this.prevPoints.length);
      ctx.lineWidth = k * lwp;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
    }
    if (this.prevPoints[0][1] > hh) this.alive = false;
  };

  function balloon(x, y, s) {
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s / 2, y - s / 2, x - s / 4, y - s, x, y - s);
    ctx.bezierCurveTo(x + s / 4, y - s, x + s / 2, y - s / 2, x, y);
  }

  // Build letter objects
  for (let i = 0; i < opts.strings.length; i++) {
    for (let j = 0; j < opts.strings[i].length; j++) {
      letters.push(new Letter(
        opts.strings[i][j],
        j * opts.charSpacing + opts.charSpacing / 2 - (opts.strings[i].length * opts.charSize) / 2,
        i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length * opts.lineHeight) / 2
      ));
    }
  }

  (function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(hw, hh);
    let done = true;
    letters.forEach(function(l) { l.step(); if (l.phase !== 'done') done = false; });
    ctx.restore();
    if (done) letters.forEach(function(l) { l.reset(); });
  })();

  window.addEventListener('resize', function() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    hw = w / 2; hh = h / 2;
    ctx.font = opts.charSize + 'px Verdana';
  });
})();
