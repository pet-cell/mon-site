(() => {
const random = (min, max) => min + Math.random() * (max - min);

function drawPath(context, points, width, time) {
  const pulse = .5 + Math.sin(time * .000008 + points[0].x * .017 + points[0].y * .013) * .5;
  const edgeBlue = `rgb(${Math.round(8 + pulse * 7)}, ${Math.round(35 + pulse * 21)}, ${Math.round(58 + pulse * 29)})`;
  for (const pass of [
    { color: '#020a15', size: width + 3.6 },
    { color: edgeBlue, size: width + 1.5 },
    { color: '#5f2e22', size: width * .72 },
    { color: '#7c402c', size: width * .3 }
  ]) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index++) context.lineTo(points[index].x, points[index].y);
    context.strokeStyle = pass.color;
    context.lineWidth = pass.size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  }
}

function drawOpenNode(context, point, width, time) {
  const radius = width * 1.45;
  context.fillStyle = '#06172e';
  context.beginPath();
  context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  context.fill();
  const pulse = .5 + Math.sin(time * .000008 + point.x * .017 + point.y * .013) * .5;
  context.strokeStyle = `rgb(${Math.round(91 + pulse * 21)}, ${Math.round(43 + pulse * 17)}, ${Math.round(31 + pulse * 13)})`;
  context.lineWidth = Math.max(1, width * .42);
  context.stroke();
}

function boxesOverlap(first, second, gap) {
  return !(
    first.x + first.width + gap <= second.x ||
    second.x + second.width + gap <= first.x ||
    first.y + first.height + gap <= second.y ||
    second.y + second.height + gap <= first.y
  );
}

function shuffle(items) {
  return items.slice().sort(() => Math.random() - .5);
}

function createTrackDomain(width, height, side) {
  const border = .25;
  let domain;
  if (side === 'top' || side === 'bottom') {
    const domainWidth = random(width * .27, width * .34);
    const domainHeight = random(height * .08, height * .14);
    domain = {
      x: random(0, width - domainWidth),
      y: side === 'top' ? random(0, height * border - domainHeight) : random(height * (1 - border), height - domainHeight),
      width: domainWidth,
      height: domainHeight
    };
  } else {
    const domainWidth = random(width * .08, width * .14);
    const domainHeight = random(height * .27, height * .34);
    domain = {
      x: side === 'left' ? random(0, width * border - domainWidth) : random(width * (1 - border), width - domainWidth),
      y: random(0, height - domainHeight),
      width: domainWidth,
      height: domainHeight
    };
  }
  return { ...domain, side };
}

function createTrackDomains(width, height) {
  const trackCount = Math.floor(random(10, 13));
  const sides = shuffle(['top', 'right', 'bottom', 'left']);
  const capacities = { top: 3, right: 3, bottom: 3, left: 3 };
  while (sides.length < trackCount) {
    const available = shuffle(Object.keys(capacities).filter((side) => sides.filter((item) => item === side).length < capacities[side]));
    sides.push(available[0]);
  }
  for (let layoutAttempt = 0; layoutAttempt < 160; layoutAttempt++) {
    const domains = [];
    const gap = Math.min(width, height) * .012;
    let complete = true;
    for (const side of sides) {
      let domain;
      for (let attempt = 0; attempt < 450; attempt++) {
        const candidate = createTrackDomain(width, height, side);
        if (domains.every((other) => !boxesOverlap(candidate, other, gap))) {
          domain = candidate;
          break;
        }
      }
      if (!domain) {
        complete = false;
        break;
      }
      domains.push(domain);
    }
    if (complete) return domains;
  }
  throw new Error('Unable to place separate circuit tracks.');
}

function createEdgeTrack(domain) {
  const horizontal = domain.side === 'top' || domain.side === 'bottom';
  let track;
  if (horizontal) {
    const startY = random(domain.y + domain.height * .28, domain.y + domain.height * .72);
    const endY = startY < domain.y + domain.height / 2
      ? random(startY + domain.height * .22, domain.y + domain.height * .88)
      : random(domain.y + domain.height * .12, startY - domain.height * .22);
    const turnX = random(domain.x + domain.width * .3, domain.x + domain.width * .7);
    track = [{ x: domain.x, y: startY }, { x: turnX, y: startY }, { x: turnX, y: endY }, { x: domain.x + domain.width, y: endY }];
  } else {
    const startX = random(domain.x + domain.width * .28, domain.x + domain.width * .72);
    const endX = startX < domain.x + domain.width / 2
      ? random(startX + domain.width * .22, domain.x + domain.width * .88)
      : random(domain.x + domain.width * .12, startX - domain.width * .22);
    const turnY = random(domain.y + domain.height * .3, domain.y + domain.height * .7);
    track = [{ x: startX, y: domain.y }, { x: startX, y: turnY }, { x: endX, y: turnY }, { x: endX, y: domain.y + domain.height }];
  }
  let connector;
  if (Math.random() < .28) {
    if (horizontal) {
      const base = Math.random() < .5 ? [track[0], track[1]] : [track[2], track[3]];
      const x = random(base[0].x, base[1].x);
      const y = base[0].y;
      const targetY = y < domain.y + domain.height / 2 ? random(y + domain.height * .22, domain.y + domain.height * .88) : random(domain.y + domain.height * .12, y - domain.height * .22);
      connector = [{ x, y }, { x, y: targetY }];
    } else {
      const base = Math.random() < .5 ? [track[0], track[1]] : [track[2], track[3]];
      const x = base[0].x;
      const y = random(base[0].y, base[1].y);
      const targetX = x < domain.x + domain.width / 2 ? random(x + domain.width * .22, domain.x + domain.width * .88) : random(domain.x + domain.width * .12, x - domain.width * .22);
      connector = [{ x, y }, { x: targetX, y }];
    }
  }
  return { track, connector };
}

function createCircuitTracks(width, height) {
  const lineWidth = Math.max(2.1, Math.min(width, height) * .0036);
  return createTrackDomains(width, height).map((domain) => ({ ...createEdgeTrack(domain), lineWidth }));
}

function drawCircuitTracks(context, tracks, time) {
  for (const route of tracks) {
    drawPath(context, route.track, route.lineWidth, time);
    drawOpenNode(context, route.track[0], route.lineWidth, time);
    drawOpenNode(context, route.track.at(-1), route.lineWidth, time);
    if (route.connector) {
      drawPath(context, route.connector, route.lineWidth, time);
      drawOpenNode(context, route.connector.at(-1), route.lineWidth, time);
    }
  }
}

const gradientRandom = (min, max) => min + Math.random() * (max - min);

function createGradientSeeds(width, height) {
  const smallestSide = Math.min(width, height);
  return Array.from({ length: Math.floor(gradientRandom(11, 16)) }, () => {
    const radius = smallestSide * gradientRandom(.22, .3);
    const coreStop = gradientRandom(.12, .26);
    return {
      x: gradientRandom(-radius * .2, width + radius * .2),
      y: gradientRandom(-radius * .2, height + radius * .2),
      radius,
      amplitude: smallestSide * gradientRandom(.003, .008),
      speed: gradientRandom(.0000015, .000006),
      coreStop,
      transitionStart: coreStop + gradientRandom(.16, .28),
      transitionEnd: gradientRandom(.88, 1),
      phase: gradientRandom(0, Math.PI * 2)
    };
  });
}

function drawGradients(context, seeds, time, width, height) {
  for (const seed of seeds) {
    const x = seed.x + Math.cos(time * seed.speed + seed.phase) * seed.amplitude;
    const y = seed.y + Math.sin(time * seed.speed + seed.phase) * seed.amplitude;
    const gradient = context.createRadialGradient(x, y, 0, x, y, seed.radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(seed.coreStop, 'rgba(0, 0, 0, .92)');
    gradient.addColorStop(seed.transitionStart, 'rgba(0, 0, 0, .48)');
    gradient.addColorStop(seed.transitionEnd, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }
}


function initializeCanvas(canvas) {
  const context = canvas.getContext('2d');
  let resizeTimer;
  let width = 0;
  let height = 0;
  let seeds;
  let tracks;

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    seeds = createGradientSeeds(width, height);
    tracks = createCircuitTracks(width, height);
  }

  function render(time) {
    context.fillStyle = '#0a2548';
    context.fillRect(0, 0, width, height);
    drawGradients(context, seeds, time, width, height);
    drawCircuitTracks(context, tracks, time);
    requestAnimationFrame(render);
  }

  resize();
  requestAnimationFrame(render);
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
}

const frameRandom = (min, max) => min + Math.random() * (max - min);

function createCornerFrame(side, verticalPosition) {
  const visibleWidth = frameRandom(12.5, 37.5);
  const hiddenWidth = frameRandom(3, visibleWidth * .7);
  const width = visibleWidth + hiddenWidth;
  const height = frameRandom(12.5, 25);
  const y = verticalPosition === 'top'
    ? frameRandom(2, Math.max(3, 30 - height))
    : frameRandom(70, Math.max(71, 98 - height));
  return { x: side === 'left' ? -hiddenWidth : 100 - visibleWidth, y, width, height };
}

function renderFrames(scene) {
  const leftIsTop = Math.random() < .5;
  const frames = [
    createCornerFrame('left', leftIsTop ? 'top' : 'bottom'),
    createCornerFrame('right', leftIsTop ? 'bottom' : 'top')
  ];
  scene.replaceChildren(...frames.map((geometry) => {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.style.setProperty('--x', geometry.x + '%');
    frame.style.setProperty('--y', geometry.y + '%');
    frame.style.setProperty('--width', geometry.width + '%');
    frame.style.setProperty('--height', geometry.height + '%');
    frame.setAttribute('aria-hidden', 'true');
    return frame;
  }));
}

// Passer à true pour réactiver les deux rectangles décoratifs.
const SHOW_BACKGROUND_RECTANGLES = false;
if (SHOW_BACKGROUND_RECTANGLES) renderFrames(document.getElementById('scene'));
initializeCanvas(document.getElementById('background'));
})();
