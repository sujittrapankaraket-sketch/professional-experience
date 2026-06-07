// ── Three.js Wireframe Terrain ──
(function initTerrain() {
  const canvas = document.getElementById('terrainCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.018);

  const W = canvas.parentElement.clientWidth || window.innerWidth;
  const H = canvas.parentElement.clientHeight || window.innerHeight;
  renderer.setSize(W, H);

  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
  camera.position.set(0, 18, 55);
  camera.lookAt(0, -2, 0);

  // ── Terrain geometry ──
  const SEG = 120;
  const SIZE = 180;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2.8);

  // Store original positions for animation
  const positions = geo.attributes.position;
  const origY = new Float32Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    // Create mountain-like terrain using noise approximation
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const nx = x / SIZE * 4;
    const nz = z / SIZE * 4;
    // Multi-octave noise approximation
    let h = 0;
    h += Math.sin(nx * 1.2) * Math.cos(nz * 1.1) * 8;
    h += Math.sin(nx * 2.5 + 1) * Math.cos(nz * 2.3 + 0.5) * 4;
    h += Math.sin(nx * 5 + 2) * Math.cos(nz * 4.8 + 1.2) * 2;
    h += Math.sin(nx * 0.6 - 0.5) * Math.cos(nz * 0.7 + 0.3) * 6;
    // Push mountains toward center-left
    const distFromCenter = Math.sqrt((x / SIZE * 2 + 0.3) ** 2 + (z / SIZE * 2) ** 2);
    h *= Math.max(0, 1.4 - distFromCenter * 0.8);
    // Flatten foreground (near camera)
    const normZ = (z / SIZE + 0.5);
    if (normZ > 0.55) h *= Math.max(0, 1 - (normZ - 0.55) * 5);
    positions.setY(i, h);
    origY[i] = h;
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    color: 0x1a5aff,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });

  const terrain = new THREE.Mesh(geo, mat);
  scene.add(terrain);

  // Second subtle layer (slightly offset, dimmer)
  const mat2 = new THREE.MeshBasicMaterial({
    color: 0x0033cc,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const terrain2 = new THREE.Mesh(geo.clone(), mat2);
  terrain2.position.y = 0.3;
  scene.add(terrain2);

  // ── Animate ──
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.004;

    // Animate terrain vertices (flowing wave)
    const pos = terrain.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const wave = Math.sin(x * 0.06 + t) * Math.cos(z * 0.08 + t * 0.7) * 1.2;
      pos.setY(i, origY[i] + wave);
    }
    pos.needsUpdate = true;
    terrain2.geometry.attributes.position.copy(pos);
    terrain2.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth || window.innerWidth;
    const h = canvas.parentElement.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
})();

// ── Scroll reveal ──
const scrollRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      scrollRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.scroll-reveal').forEach(el => scrollRevealObserver.observe(el));

// ── Lottie TMK icon ──
(function initLottie() {
  const el = document.getElementById('lottie-tmk');
  if (!el || typeof lottie === 'undefined') return;
  lottie.loadAnimation({
    container: el,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'date-palm.json'
  });
  // Tint to blue via CSS filter
  el.style.filter = 'invert(35%) sepia(90%) saturate(600%) hue-rotate(200deg)';
})();

// ── Nav scroll effect ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Reveal on scroll ──
const reveals = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObserver.observe(el));

// ── Vertical timeline expand/collapse ──
document.querySelectorAll('.vt-item').forEach(item => {
  const btn = item.querySelector('.vt-expand-btn');
  const header = item.querySelector('.vt-header');
  const toggle = () => item.classList.toggle('expanded');
  if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  if (header) header.addEventListener('click', toggle);
});

// Auto-expand the featured item
const featured = document.querySelector('.vt-featured');
if (featured) featured.classList.add('expanded');

// ── Horizontal timeline card click → modal ──
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose   = document.getElementById('modalClose');

const htModals = {
  pre1: {
    title: 'Freelance Jobs',
    period: '2561 – 2565 (ม.4 – ปี 1)',
    images: [
      { src: 'freelance-1.jpg', caption: 'ผลงาน Graphic Design' }
    ],
    content: `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="background:rgba(37,99,235,.15);color:#60a5fa;padding:3px 12px;border-radius:50px;font-size:.72rem;font-weight:700;letter-spacing:.06em">INSTAGRAM</span>
          <span style="font-size:.85rem;color:rgba(255,255,255,.55)">@shouldme.plss</span>
        </div>
        <ul style="display:flex;flex-direction:column;gap:10px;list-style:none;padding:0">
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            เปิดเพจใน <strong style="color:#fff">Instagram</strong> เพื่อหาลูกค้า และทำการตลาดด้วยตัวเอง
          </li>
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            เริ่มต้นจากการรับทำ<strong style="color:#fff">งานเอกสาร</strong>ที่ต้องใช้คอมพิวเตอร์ ช่วงนั้นยืมโน๊ตบุ๊คของคุณป้าเพื่อทำงานพิเศษ
          </li>
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            เมื่อ <strong style="color:#fff">Canva เปิดตัว</strong> ก็เริ่มรับงาน Graphic Design เพิ่มขึ้น
          </li>
        </ul>
        <div style="margin-top:8px">
          <p style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:10px">ภาพผลงาน — คลิกเพื่อขยาย</p>
          <div class="modal-gallery">
            <img src="freelance-ig.jpg" alt="Shouldme.plss Instagram" class="gallery-thumb" onclick="openLightbox(this)" onerror="this.parentElement.innerHTML='<div style=\\'background:rgba(255,255,255,.06);border:1px dashed rgba(255,255,255,.15);border-radius:10px;padding:30px;text-align:center;font-size:.78rem;color:rgba(255,255,255,.3)\\'>[ รูปผลงาน — จะแนบภายหลัง ]</div>'"/>
          </div>
        </div>
      </div>
    `
  },
  pre2: {
    title: 'Graphic Designer',
    period: '2565 – ปัจจุบัน',
    content: `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="background:rgba(37,99,235,.15);color:#60a5fa;padding:3px 12px;border-radius:50px;font-size:.72rem;font-weight:700;letter-spacing:.06em">FREELANCE PART-TIME</span>
          <span style="font-size:.85rem;color:rgba(255,255,255,.55)">Gelate · บริษัท หวานเย็นสากล จำกัด</span>
        </div>
        <ul style="display:flex;flex-direction:column;gap:10px;list-style:none;padding:0">
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            ดูแล <strong style="color:#fff">Artwork</strong> ทั้งหมดตามความต้องการของร้าน Gelate
          </li>
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            งาน <strong style="color:#fff">Media Advertising</strong> — โฆษณาบน Social Media ทุก Campaign
          </li>
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            งาน <strong style="color:#fff">Brand Signs & Materials</strong> — ป้ายร้าน, Sticker Label, Cone Wrap, Cup Wrap, Packaging
          </li>
        </ul>
        <div style="margin-top:4px">
          <p style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:12px">ผลงาน — คลิกรูปเพื่อขยาย</p>
          <div class="gallery-slideshow" id="gelate-gallery">
            <div class="gs-track" id="gelate-track">
              <img src="gelate-3.png" class="gs-img" onclick="openLightbox(this)" alt="Gelate Brand Signs & Materials"/>
              <img src="gelate-4.png" class="gs-img" onclick="openLightbox(this)" alt="Gelate Brand Signs Blizz Cone Wrap"/>
              <img src="gelate-5.png" class="gs-img" onclick="openLightbox(this)" alt="Gelate Sticker Labels"/>
              <img src="gelate-6.png" class="gs-img" onclick="openLightbox(this)" alt="Gelate Cone Wraps Flavors"/>
            </div>
            <div class="gs-controls">
              <button class="gs-btn" onclick="slideGallery('gelate-track',-1)">‹</button>
              <button class="gs-btn" onclick="slideGallery('gelate-track', 1)">›</button>
            </div>
          </div>
        </div>
      </div>
    `
  },
  pre3: {
    title: 'Admin & Content Creator',
    period: '2565 – ปัจจุบัน',
    content: `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="background:rgba(37,99,235,.15);color:#60a5fa;padding:3px 12px;border-radius:50px;font-size:.72rem;font-weight:700;letter-spacing:.06em">PART-TIME</span>
          <span style="font-size:.85rem;color:rgba(255,255,255,.55)">Gelate · ร้านโปรเต้ (ร้านสัตว์เลี้ยง)</span>
        </div>
        <ul style="display:flex;flex-direction:column;gap:10px;list-style:none;padding:0">
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            ดูแล <strong style="color:#fff">เพจ Social Media</strong> ของร้าน Gelate และร้านโปรเต้
          </li>
          <li style="font-size:.88rem;color:rgba(255,255,255,.78);line-height:1.6;padding-left:16px;position:relative">
            <span style="position:absolute;left:0;color:#60a5fa">·</span>
            <strong style="color:#fff">คิด Content</strong> และออกแบบรูปภาพลงในช่องทางโซเชียลมีเดีย
          </li>
        </ul>
        <div style="margin-top:4px">
          <p style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:12px">ผลงาน — คลิกรูปเพื่อขยาย</p>
          <div class="gallery-slideshow">
            <div class="gs-track" id="content-track">
              <img src="content-1.png" class="gs-img" onclick="openLightbox(this)" alt="Content Gelate"/>
              <img src="content-2.png" class="gs-img" onclick="openLightbox(this)" alt="Content โปรเต้"/>
            </div>
            <div class="gs-controls">
              <button class="gs-btn" onclick="slideGallery('content-track',-1)">‹</button>
              <button class="gs-btn" onclick="slideGallery('content-track', 1)">›</button>
            </div>
          </div>
        </div>
      </div>
    `
  }
};

document.querySelectorAll('.ht-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.modal;
    const data = htModals[key];
    if (!data) return;
    modalContent.innerHTML = `
      <div style="margin-bottom:20px">
        <div style="font-size:.72rem;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${data.period}</div>
        <h3 style="font-size:1.3rem;font-weight:700;color:#fff;margin-bottom:4px">${data.title}</h3>
      </div>
      ${data.content}
    `;
    modalOverlay.classList.add('open');
  });
});

// ── Pre-grad timeline animation ──
(function initTimelineAnim() {
  const line1 = document.getElementById('htLine1');
  const line2 = document.getElementById('htLine2');
  const dotImg3 = document.getElementById('htDotImg3');
  if (!line1 || !line2 || !dotImg3) return;

  let triggered = false;
  const observer = new IntersectionObserver((entries) => {
    if (triggered) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggered = true;
        observer.disconnect();
        // Step 1: animate line 1 immediately
        setTimeout(() => line1.classList.add('animated'), 100);
        // Step 2: animate line 2 after line 1 completes (~2s)
        setTimeout(() => line2.classList.add('animated'), 2200);
        // Step 3: reveal dot-3 image after line 2 completes (~4s)
        setTimeout(() => {
          dotImg3.style.opacity = '1';
          dotImg3.style.transform = 'scale(1.1)';
          setTimeout(() => dotImg3.style.transform = 'scale(1)', 400);
        }, 4300);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(line1);
})();

// ── Album modal ──
const albums = {
  'ls-work': {
    title: 'กระบวนการทำงาน',
    sub: 'Lucas Strategy Co., Ltd. · Apr – Oct 2024',
    images: [1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(n => `ls-work/${n}.png`)
  },
  'insysc-ux-work': {
    title: 'กระบวนการทำงาน',
    sub: 'Intelligence System Corporation · Jun – Oct 2568',
    images: ['insysc-ux/1.png','insysc-ux/2.png','insysc-ux/rfid-detail.png'],
    docs: [
      { name: 'Toyota Warehouse RFID Solution', file: 'insysc-ux/docs/toyota-rfid.pdf' },
      { name: 'Warehouse Solutions — One Page 1', file: 'insysc-ux/docs/warehouse-sol-1.pdf' },
      { name: 'Warehouse Solutions — One Page 2', file: 'insysc-ux/docs/warehouse-sol-2.pdf' }
    ]
  },
  'commission': {
    title: 'Commission Display System',
    sub: 'Delivered · Real-time Commission Tracking · 5 สาขา',
    images: [1,2,3,4,5,6,7,8,9].map(n => `commission/${n}.jpg`)
  },
  'safety-wh': {
    title: 'Safety Warehouse Solution',
    sub: 'Proof of Concept · Aruba BLE + RFID',
    images: ['safety-wh/1.png','safety-wh/2.png','safety-wh/3.png','safety-wh/4.jpg','safety-wh/5.jpg']
  },
  'smart-vision': {
    title: 'Smart Vision Camera Solution',
    sub: 'Proof of Concept · Industrial Camera · QR Mapping',
    images: ['smart-vision/1.png','smart-vision/1758.jpg','smart-vision/1733.jpg','smart-vision/1735.jpg','smart-vision/2207.jpg','smart-vision/2217.jpg','smart-vision/2219.jpg']
  },
  'saas-laundry': {
    title: 'SaaS Laundry Management',
    sub: 'On-Going · Paused · In-House Product',
    images: ['saas-laundry/1.png']
  },
  'tmk-work': {
    title: 'TMK — กระบวนการทำงาน',
    sub: 'Agricultural Trading System · Jun 2568 – ปัจจุบัน',
    images: [
      'tmk-work/ui-1.png',
      'tmk-work/ui-2.png',
      'tmk-work/ui-3.png',
      'tmk-work/ui-4.png',
      'tmk-work/bpmn.png',
      'tmk-work/usecase-5.png',
      'tmk-work/usecase-9.png',
      'tmk-work/usecase-10.png'
    ]
  },
  'tmk-photos': {
    title: 'TMK — ประมวลภาพการทำงาน',
    sub: 'Agricultural Trading System · ภาพบรรยากาศและการทำงานจริง',
    images: [1,2,3,4,5,6,7,8,9,10].map(n => `tmk-photos/${n}.jpg`)
  }
};

window.openAlbum = (key) => {
  const album = albums[key];
  if (!album) return;

  const imgSection = album.images.length > 0
    ? `<div class="gs-track" id="album-track-${key}" style="margin-top:14px">
        ${album.images.map(src => `<img src="${src}" class="gs-img" onclick="openLightbox(this)" alt=""/>`).join('')}
       </div>
       <div class="gs-controls">
         <button class="gs-btn" onclick="slideGallery('album-track-${key}',-1)">‹</button>
         <button class="gs-btn" onclick="slideGallery('album-track-${key}',1)">›</button>
       </div>`
    : `<div style="margin-top:14px;background:rgba(255,255,255,.06);border:1px dashed rgba(255,255,255,.18);border-radius:10px;padding:24px;text-align:center;font-size:.8rem;color:rgba(255,255,255,.3)">[ รูปผลงาน — จะแนบภายหลัง ]</div>`;

  const docSection = album.docs && album.docs.length > 0
    ? `<div style="margin-top:16px">
        <p style="font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:10px">เอกสารประกอบ</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${album.docs.map(d => `
            <a href="${d.file}" target="_blank" style="display:inline-flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;font-size:.84rem;color:rgba(255,255,255,.8);text-decoration:none;transition:background .2s" onmouseover="this.style.background='rgba(255,255,255,.12)'" onmouseout="this.style.background='rgba(255,255,255,.06)'">
              <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1.8" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              ${d.name}
            </a>`).join('')}
        </div>
      </div>`
    : '';

  const linkBtn = album.pdf
    ? `<a href="${album.pdf}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 16px;background:rgba(37,99,235,.2);border:1px solid rgba(37,99,235,.4);border-radius:8px;font-size:.82rem;color:#93c5fd;font-weight:600;text-decoration:none">📄 ดูเอกสารวิจัย MITIJ ↗</a>`
    : album.link
    ? `<a href="${album.link}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 16px;background:rgba(37,99,235,.2);border:1px solid rgba(37,99,235,.4);border-radius:8px;font-size:.82rem;color:#93c5fd;font-weight:600;text-decoration:none">🌐 เปิดเว็บไซต์ ↗</a>`
    : '';

  modalContent.innerHTML = `
    <div style="margin-bottom:18px">
      <div style="font-size:.72rem;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${album.sub}</div>
      <h3 style="font-size:1.3rem;font-weight:700;color:#fff">${album.title}</h3>
      ${linkBtn}
    </div>
    ${imgSection}
    ${docSection}
  `;
  modalOverlay.classList.add('open');
};

// ── Slideshow scroll ──
window.slideGallery = (trackId, dir) => {
  const track = document.getElementById(trackId);
  if (!track) return;
  track.scrollBy({ left: dir * 220, behavior: 'smooth' });
};

// ── Lightbox Slideshow ──
let lbImages = [];
let lbIndex  = 0;

function lbRender() {
  const img   = document.getElementById('lightboxImg');
  const counter = document.getElementById('lbCounter');
  const dots  = document.getElementById('lbDots');
  img.src     = lbImages[lbIndex];
  counter.textContent = `${lbIndex + 1} / ${lbImages.length}`;
  dots.innerHTML = lbImages.map((_, i) =>
    `<div class="lb-dot ${i === lbIndex ? 'active' : ''}" onclick="lbGoTo(${i})"></div>`
  ).join('');
}

window.openLightbox = (clickedImg) => {
  // collect all gs-img siblings in same track
  const track = clickedImg.closest('.gs-track') || clickedImg.parentElement;
  const imgs  = track ? [...track.querySelectorAll('.gs-img')] : [clickedImg];
  lbImages    = imgs.map(i => i.src);
  lbIndex     = imgs.indexOf(clickedImg);
  if (lbIndex < 0) lbIndex = 0;
  lbRender();
  document.getElementById('lightboxOverlay').classList.add('open');
};

window.lbNav = (dir) => {
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  lbRender();
};

window.lbGoTo = (i) => { lbIndex = i; lbRender(); };

window.closeLightbox = () => {
  document.getElementById('lightboxOverlay').classList.remove('open');
};

document.addEventListener('keydown', e => {
  if (!document.getElementById('lightboxOverlay').classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  lbNav(1);
  if (e.key === 'ArrowLeft')   lbNav(-1);
});

const closeModal = () => modalOverlay.classList.remove('open');
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Smooth active nav link ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const linkObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.style.color = 'var(--blue-600)';
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => linkObserver.observe(s));
