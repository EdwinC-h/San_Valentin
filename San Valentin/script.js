const heart = document.getElementById("heart");
const ground = document.getElementById("ground");
const treeContainer = document.getElementById("tree-container");
const tree = document.getElementById("tree");

heart.addEventListener("click", () => {
  heart.style.pointerEvents = "none";
  // ocultar el texto inicial "para Paula"
  const intro = document.getElementById('intro');
  if (intro) intro.classList.add('hidden');

  // 1. Corazón → semilla
  heart.classList.add("seed");

  // 2. Crear suelo desde el centro
  setTimeout(() => {
    ground.classList.add("show");
  }, 400);

  // 3. Caída
  setTimeout(() => {
    heart.classList.add("fall");
  }, 500);

  // 3.5 La semilla desaparece al tocar el suelo
  setTimeout(() => {
    heart.classList.add("hide");
  }, 1200);

  // 4. Crece el tronco DESDE EL SUELO
  setTimeout(() => {
    tree.classList.add("grow");
    // Mostrar título justo cuando empieza a crecer
    const growTitle = document.getElementById('grow-title');
    if (growTitle) {
      growTitle.classList.add('visible');
      // ocultar el título después de unos segundos
      setTimeout(() => growTitle.classList.remove('visible'), 3000);
    }
    // No revelamos mensaje aún; esperaré al desplazamiento del árbol para mostrar texto y contador.
    // (se hará más abajo en onMoveEnd)
  }, 1200);

  setTimeout(() => {
    growLeaves();
  }, 2100); // después del grow del tronco

  // Mover árbol a la derecha después de que crecen las hojas
  setTimeout(() => {
    // cuando termine la transición del movimiento, mostrar título de San Valentín
    const onMoveEnd = (e) => {
      if (!e.propertyName || e.propertyName.includes('transform')) {
        const valTitle = document.getElementById('valentine-title');
        if (valTitle) {
          valTitle.classList.add('visible');
          animateValentineTitle(valTitle);
        }
        // ahora que el árbol se desplazó y dejó espacio, revelamos el mensaje y el contador
        if (typeof revealMessage === 'function') revealMessage();
        // y empezamos el texto tipo máquina de escribir
        startTypewriter();
        treeContainer.removeEventListener('transitionend', onMoveEnd);
      }
    };
    treeContainer.addEventListener('transitionend', onMoveEnd);
    treeContainer.classList.add("move-left");
  }, 3600);

  // Dispersar hojas volando
  setTimeout(() => {
    blowAwayLeaves();
  }, 4600);

  
});

/*ESTE APARTADO YA ES SOLO PARA LAS HOJAS*/
function growLeaves() {
  const leaves = document.getElementById("leaves");
  leaves.innerHTML = "";

  const colors = [
    "#ff1744",
    "#f34e1c",
    "#ff758f",
    "#ffb3c1",
    "#fd7899",
    "#db1717",
  ];

  const W = leaves.offsetWidth || 200;
  const H = leaves.offsetHeight || 160;

  // Función implícita del corazón (forma base)
  function inHeart(x, y) {
    const v = Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
    return v <= 0;
  }

  // Normalizado → píxel
  function toPixel(nx, ny) {
    const px = W / 2 + nx * (W / 2) * 0.95;
    const py = H / 2 - ny * (H / 2) * 0.95 + 6;
    return { px, py };
  }

  const TOTAL = 700;       // densidad general
  let placed = 20;
  let attempts = 50;
  const MAX_ATTEMPTS = TOTAL * 90;

  // =========================
  // CUERPO PRINCIPAL
  // =========================
  while (placed < TOTAL && attempts < MAX_ATTEMPTS) {
    attempts++;

    // Bias hacia el centro (clave para forma natural)
    let nx =
      Math.sign(Math.random() - 0.55) *
      Math.pow(Math.random(), 0.55) *
      1.5;

    let ny =
      Math.sign(Math.random() - 0.5) *
      Math.pow(Math.random(), 0.6) *
      0.75;

    ny *= 14; // ligera compresión vertical (no aplastado)

    if (!inHeart(nx, ny)) continue;

    // Suavizar bordes extremos
    const edge = nx * nx + ny * ny;
    if (edge > 1.3 && Math.random() < 0.45) continue;

    const { px, py } = toPixel(nx, ny);

    // Dispersión MUY leve
    const jitter = 6;
    const jx = (Math.random() - 0.5) * jitter;
    const jy = (Math.random() - 0.5) * jitter;

    const leaf = document.createElement("div");
    leaf.classList.add("leaf");
    leaf.style.left = `${px + jx}px`;
    leaf.style.top = `${py + jy}px`;
    leaf.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    const scale = 0.45 + Math.random() * 0.6;
    leaf.style.transform = `
      rotate(${Math.random() * 360}deg)
      scale(${scale})
    `;
    leaf.style.animationDelay = `${Math.random() * 1400}ms`;
    leaf.style.animationDuration = `${0.5 + Math.random() * 1.2}s`;

    leaves.appendChild(leaf);
    placed++;
  }

  // =========================
  // HOJAS GRANDES SUELTAS (ORGÁNICO)
  // =========================
  for (let i = 0; i < 26; i++) {
    let nx = (Math.random() * 2 - 1) * 1.02;
    let ny = (Math.random() * 2 - 1) * 0.9;
    ny *= 0.9;

    if (!inHeart(nx, ny)) continue;

    const { px, py } = toPixel(nx, ny);

    const leaf = document.createElement("div");
    leaf.classList.add("leaf");
    leaf.style.left = `${px}px`;
    leaf.style.top = `${py}px`;
    leaf.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    leaf.style.transform = `
      rotate(${Math.random() * 360}deg)
      scale(${0.85 + Math.random() * 0.6})
    `;
    leaf.style.animationDelay = `${Math.random() * 1000}ms`;
    leaf.style.animationDuration = `${0.6 + Math.random() * 1.6}s`;

    leaves.appendChild(leaf);
  }
}

// Función para dispersar hojas volando por el viento (infinitas y aleatorias)
function blowAwayLeaves() {
  const colors = [
    "#ff1744",
    "#f34e1c",
    "#ff758f",
    "#ffb3c1",
    "#fd7899",
    "#db1717",
    "#ff6b6b",
    "#ff8787"
  ];

  // Crear hojas de forma continua e infinita
  const spawnLeaves = () => {
    // Número aleatorio de hojas a crear (2-5)
    const leafCount = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < leafCount; i++) {
      const flyingLeaf = document.createElement("div");
      flyingLeaf.classList.add("flying-leaf");
      
      // Elegir animación aleatoria
      const animations = ["blow", "blow2", "blow3", "blow4", "blow5"];
      flyingLeaf.classList.add(animations[Math.floor(Math.random() * animations.length)]);
      
      // Posición inicial desde diferentes lados del árbol usando ángulos
      const treeX = window.innerWidth / 2 + 240; // árbol está 280px a la derecha
      const treeY = window.innerHeight * 0.45; // altura del árbol
      
      // Ángulo aleatorio alrededor del árbol
      const angle = Math.random() * Math.PI * 2;
      // Distancia desde 0 (centro) hasta 120 (bordes)
      const distance = Math.random() * 150;
      
      flyingLeaf.style.left = `${treeX + Math.cos(angle) * distance}px`;
      flyingLeaf.style.top = `${treeY + Math.sin(angle) * distance}px`;
      flyingLeaf.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      // Tamaño aleatorio (10-20px)
      const size = 10 + Math.random() * 5;
      flyingLeaf.style.width = `${size}px`;
      flyingLeaf.style.height = `${size}px`;
      
      // Ajustar pseudo-elementos al tamaño
      const computedSize = size;
      flyingLeaf.style.setProperty('--leaf-size', `${computedSize}px`);
      
      document.body.appendChild(flyingLeaf);
      
      // Remover la hoja después de la animación
      setTimeout(() => {
        flyingLeaf.remove();
      }, 3000);
    }
    
    // Siguiente generación de hojas en tiempo aleatorio (300ms a 1200ms)
    const nextSpawn = 300 + Math.random() * 900;
    setTimeout(spawnLeaves, nextSpawn);
  };
  
  // Iniciar la espiral infinita
  spawnLeaves();
}

// -------------------------------------------------------------
// Efecto máquina de escribir para texto en el lado izquierdo
function typeWriter(text, element, speed = 500) {
  let i = 0;
  // cursor ya añadido en CSS, lo creamos dinámicamente
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  element.appendChild(cursor);

  function writing() {
    if (i < text.length) {
      const ch = text[i];
      if (ch === '\n') {
        const br = document.createElement('br');
        cursor.parentNode.insertBefore(br, cursor);
      } else {
        cursor.insertAdjacentText('beforebegin', ch);
      }
      i++;
      setTimeout(writing, speed);
    }
  }
  writing();
}

// helper para iniciar el efecto de máquina de escribir cuando se desee
function startTypewriter() {
  const tw = document.getElementById('typewriter');
  if (tw) {
    const mensaje = 'Para el amor de mi vida: \nSi pudiera elegir a una persona para pasar el resto\nde mi vida, serías tú. \nTe amo mucho mi amor.';
    typeWriter(mensaje, tw, 120);
  }
}
// animación de título de San Valentín: letra a letra con brillo y escritura
function animateValentineTitle(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  const chars = Array.from(text);
  chars.forEach((ch, idx) => {
    const span = document.createElement('span');
    // mantener espacios visibles y separados
    if (ch === ' ') {
      span.textContent = '\u00A0'; // non‑breaking space
      span.classList.add('space');
    } else {
      span.textContent = ch;
    }
    el.appendChild(span);
  });

  const spans = Array.from(el.querySelectorAll('span'));
  let delay = 0;
  spans.forEach((s, i) => {
    delay += 80; // velocidad del bolígrafo
    setTimeout(() => {
      s.classList.add('write');
      // después de que haya aparecido, añadir clase visible para brillo
      setTimeout(() => s.classList.add('visible'), 400);
    }, delay);
  });
}
// Contador de tiempo desde 11 de septiembre de 2021
function updateLoveCounter() {
  const start = new Date(2021, 8, 13, 0, 0, 0); // monthIndex 8 = septiembre
  const el = document.getElementById('counter');
  if (!el) return;

  function calc() {
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prev = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prev.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }

    // siempre generamos un <br> entre el conteo de días y la hora;
    // la hoja de estilos decide si se muestra o no (visible en móviles pequeños)
    el.innerHTML = `${years} años, ${months} meses, ${days} días<br>— ${hours}h ${minutes}m ${seconds}s`;
  }

  calc();
  setInterval(calc, 1000);
}

// Iniciar el contador al cargar el script
updateLoveCounter();

// Animación letra por letra para el texto del mensaje
function revealMessage() {
  const msg = document.querySelector('#message');
  if (!msg) return;
  const label = msg.querySelector('.label');
  if (!label) return;

    // Leer el texto desde data-text para evitar que aparezca inicialmente
    const text = (label.dataset && label.dataset.text) ? label.dataset.text : label.textContent.trim();
  label.innerHTML = '';

  // Crear spans por palabra (mantener un espacio al final)
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const span = document.createElement('span');
    span.className = 'word';
    // añadir un espacio al final para mantener separación visual
    span.textContent = (w === '') ? ' ' : w + (i < words.length - 1 ? ' ' : '');
    label.appendChild(span);
    // si estamos en dispositivo muy estrecho, insertar salto de línea después de "ti"
    if (
      (window.innerWidth <= 390 && window.innerHeight <= 844) &&
      w.toLowerCase().trim() === 'ti'
    ) {
      const br = document.createElement('br');
      label.appendChild(br);
    }
  }

  // Añadir clase show para activar transiciones del contador
  setTimeout(() => msg.classList.add('show'), 10);

  // Mostrar palabras una a una
  const spans = Array.from(label.querySelectorAll('span'));
  let delay = 0;
  for (let i = 0; i < spans.length; i++) {
    const s = spans[i];
    const inc = 260 + Math.random() * 160; // velocidad por palabra
    delay += inc;
    setTimeout(() => s.classList.add('visible'), delay);
  }
  // Después de que terminen de aparecer las palabras, mostrar el contador
  setTimeout(() => {
    msg.classList.add('show-counter');
  }, delay + 300);
}
