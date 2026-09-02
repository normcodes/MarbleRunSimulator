/*
  Marble Run Simulator — standalone editor engine.
  The toolbar uses the Coolicons line language: 24px grid, 2px strokes,
  generous hit areas, and explicit state instead of placeholder glyphs.
*/

const canvas = document.querySelector("#simulation-canvas");
const context = canvas.getContext("2d");
const inspectorElement = document.querySelector("#inspector-content");
const canvasWrap = document.querySelector("#canvas-wrap");

const WORLD = {
  width: 960,
  height: 620,
  grid: 16,
};

const colors = {
  1: "#f3bc54",
  2: "#b89dff",
  3: "#68d9e9",
};

const layers = [
  { id: 1, name: "Marble Run Main Parts", short: "MAIN PARTS", desc: "Structure & track" },
  { id: 2, name: "Marbles", short: "MARBLES", desc: "Dynamic bodies" },
  { id: 3, name: "Marble Interactions", short: "INTERACTIONS", desc: "Forces & triggers" },
];

const iconPaths = {
  search: '<path d="M10.75 19.25C15.4444 19.25 19.25 15.4444 19.25 10.75C19.25 6.05558 15.4444 2.25 10.75 2.25C6.05558 2.25 2.25 6.05558 2.25 10.75C2.25 15.4444 6.05558 19.25 10.75 19.25Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.75 16.75L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M6 12H12M12 12H18M12 12V18M12 12V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  minus: '<path d="M6 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  move: '<path d="M12 21V12M12 21L15 18M12 21L9 18M12 12V3M12 12H3M12 12H21M12 3L9 6M12 3L15 6M3 12L6 15M3 12L6 9M21 12L18 9M21 12L18 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  scale: '<path d="M10 19H5V14M14 5H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  rotate: '<path d="M14 16H19V21M10 8H5V3M19.4176 9.0034C18.8569 7.61566 17.9181 6.41304 16.708 5.53223C15.4979 4.65141 14.0652 4.12752 12.5723 4.02051C11.0794 3.9135 9.58606 4.2274 8.2627 4.92661C6.93933 5.62582 5.83882 6.68254 5.08594 7.97612M4.58203 14.9971C5.14272 16.3848 6.08146 17.5874 7.29157 18.4682C8.50169 19.349 9.93588 19.8725 11.4288 19.9795C12.9217 20.0865 14.4138 19.7726 15.7371 19.0734C17.0605 18.3742 18.1606 17.3175 18.9134 16.0239" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  link: '<path d="M9.1718 14.8288L14.8287 9.17192M7.05086 11.293L5.63664 12.7072C4.07455 14.2693 4.07409 16.8022 5.63619 18.3643C7.19829 19.9264 9.7317 19.9259 11.2938 18.3638L12.7065 16.9498M11.2929 7.05L12.7071 5.63579C14.2692 4.07369 16.8016 4.07397 18.3637 5.63607C19.9258 7.19816 19.9257 9.73085 18.3636 11.2929L16.9501 12.7071" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  anchor: '<path d="M9.23047 9H7.2002C6.08009 9 5.51962 9 5.0918 9.21799C4.71547 9.40973 4.40973 9.71547 4.21799 10.0918C4 10.5196 4 11.0801 4 12.2002V17.8002C4 18.9203 4 19.4801 4.21799 19.9079C4.40973 20.2842 4.71547 20.5905 5.0918 20.7822C5.5192 21 6.07902 21 7.19694 21H16.8031C17.921 21 18.48 21 18.9074 20.7822C19.2837 20.5905 19.5905 20.2842 20 19.9079C20 19.4805 20 18.9215 20 17.8036V12.1969C20 11.079 20 10.5192 19.7822 10.0918C19.5905 9.71547 19.2837 9.40973 18.9074 9.21799C18.4796 9 17.9203 9 16.8002 9H14.7689M9.23047 9H14.7689M9.23047 9C9.10302 9 9 8.89668 9 8.76923V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V8.76923C15 8.89668 14.8964 9 14.7689 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  delete: '<path d="M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  play: '<path d="M5 17.3336V6.66698C5 5.78742 5 5.34715 5.18509 5.08691C5.34664 4.85977 5.59564 4.71064 5.87207 4.67499C6.18868 4.63415 6.57701 4.84126 7.35254 5.25487L17.3525 10.5882L17.3562 10.5898C18.2132 11.0469 18.642 11.2756 18.7826 11.5803C18.9053 11.8462 18.9053 12.1531 18.7826 12.4189C18.6418 12.7241 18.212 12.9537 17.3525 13.4121L7.35254 18.7454C6.57645 19.1593 6.1888 19.3657 5.87207 19.3248C5.59564 19.2891 5.34664 19.1401 5.18509 18.9129C5 18.6527 5 18.2132 5 17.3336Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  save: '<path d="M17 21.0002L7 21M17 21.0002L17.8031 21C18.921 21 19.48 21 19.9074 20.7822C20.2837 20.5905 20.5905 20.2843 20.7822 19.908C21 19.4806 21 18.921 21 17.8031V9.21955C21 8.77072 21 8.54521 20.9521 8.33105C20.9095 8.14 20.8393 7.95652 20.7432 7.78595C20.6366 7.59674 20.487 7.43055 20.1929 7.10378L17.4377 4.04241C17.0969 3.66374 16.9242 3.47181 16.7168 3.33398C16.5303 3.21 16.3242 3.11858 16.1073 3.06287C15.8625 3 15.5998 3 15.075 3H6.2002C5.08009 3 4.51962 3 4.0918 3.21799C3.71547 3.40973 3.40973 3.71547 3.21799 4.0918C3 4.51962 3 5.08009 3 6.2002V17.8002C3 18.9203 3 19.4796 3.21799 19.9074C3.40973 20.2837 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H7M17 21.0002V17.1969C17 16.079 17 15.5192 16.7822 15.0918C16.5905 14.7155 16.2837 14.4097 15.9074 14.218C15.4796 14 14.9203 14 13.8002 14H10.2002C9.08009 14 8.51962 14 8.0918 14.218C7.71547 14.4097 7.40973 14.7155 7.21799 15.0918C7 15.5196 7 16.0801 7 17.2002V21M15 7H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  undo: '<path d="M9 7L4 12L9 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 12H14C17.3137 12 20 14.6863 20 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  redo: '<path d="M15 7L20 12L15 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12H10C6.68629 12 4 14.6863 4 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  pause: '<path d="M8 5V19M16 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  expand: '<path d="M10 19H5V14M14 5H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  grid: '<path d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  layers: '<path d="M4 7L12 3L20 7L12 11L4 7ZM4 12L12 16L20 12M4 17L12 21L20 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  select: '<path d="M5 3L18.5 10.5L12.5 12.5L10.5 18.5L5 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  download: '<path d="M12 3V15M12 15L7 10M12 15L17 10M5 21H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  settings: '<path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="currentColor" stroke-width="2"/><path d="M19.4 15C19.6 14.5 19.7 14 19.7 13.5L21 12L19.7 10.5C19.7 10 19.6 9.5 19.4 9L19.7 7.2L17.7 6.1L16.2 7C15.8 6.7 15.4 6.5 14.9 6.3L14.4 4.5H9.6L9.1 6.3C8.6 6.5 8.2 6.7 7.8 7L6.3 6.1L4.3 7.2L4.6 9C4.4 9.5 4.3 10 4.3 10.5L3 12L4.3 13.5C4.3 14 4.4 14.5 4.6 15L4.3 16.8L6.3 17.9L7.8 17C8.2 17.3 8.6 17.5 9.1 17.7L9.6 19.5H14.4L14.9 17.7C15.4 17.5 15.8 17.3 16.2 17L17.7 17.9L19.7 16.8L19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
};

function icon(name, label = "") {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"${label ? ` role="img" aria-label="${label}"` : ""}>${iconPaths[name] || iconPaths.select}</svg>`;
}

document.querySelectorAll("[data-icon]").forEach((element) => {
  element.innerHTML = icon(element.dataset.icon);
});

const catalog = {
  Parts: [
    { type: "track", label: "Straight track", hint: "Guided rail", layer: 1, icon: "ruler" },
    { type: "ramp", label: "Ramp", hint: "Inclined descent", layer: 1, icon: "move" },
    { type: "wall", label: "Wall", hint: "Static barrier", layer: 1, icon: "anchor" },
    { type: "platform", label: "Platform", hint: "Flat support", layer: 1, icon: "grid" },
    { type: "funnel", label: "Funnel", hint: "Collect & align", layer: 1, icon: "download" },
    { type: "bumper", label: "Bumper", hint: "Bounce contact", layer: 1, icon: "plus" },
  ],
  Zones: [
    { type: "start", label: "Start zone", hint: "Spawn marbles", layer: 2, icon: "play" },
    { type: "raceStart", label: "Race start", hint: "Begin timer", layer: 1, icon: "play" },
    { type: "raceEnd", label: "Race end", hint: "Finish line", layer: 1, icon: "check" },
    { type: "end", label: "End zone", hint: "Complete run", layer: 1, icon: "anchor" },
    { type: "teleporter", label: "Teleporter", hint: "Linked gateway", layer: 1, icon: "link" },
    { type: "sensor", label: "Sensor zone", hint: "Detect bodies", layer: 3, icon: "search" },
  ],
  Functions: [
    { type: "belt", label: "Conveyor belt", hint: "Apply velocity", layer: 3, icon: "move" },
    { type: "booster", label: "Booster", hint: "Impulse burst", layer: 3, icon: "play" },
    { type: "fan", label: "Fan", hint: "Directional airflow", layer: 3, icon: "rotate" },
    { type: "magnet", label: "Magnet", hint: "Attract / repel", layer: 3, icon: "link" },
    { type: "piston", label: "Piston", hint: "Timed stroke", layer: 3, icon: "move" },
    { type: "weld", label: "Weld", hint: "Join selected parts", layer: 3, icon: "weld" },
    { type: "anchor", label: "Anchor", hint: "Fix to world", layer: 3, icon: "anchor" },
  ],
};

const solidTypes = new Set(["track", "ramp", "wall", "platform", "funnel", "bumper", "belt", "booster", "piston"]);
const zoneTypes = new Set(["start", "raceStart", "raceEnd", "end", "teleporter", "sensor"]);
const interactionTypes = new Set(["belt", "booster", "fan", "magnet", "piston", "weld", "anchor"]);

const state = {
  activeCategory: "Parts",
  activeLayer: 1,
  activeTool: "select",
  inspectorTab: "inspector",
  mode: "Edit",
  zoom: 1,
  selectedId: null,
  objectId: 1,
  elapsed: 0,
  spawnClock: 0,
  finished: 0,
  lastFrame: performance.now(),
  objects: [],
  marbles: [],
  welds: [],
  history: [],
  redo: [],
  pointer: null,
  drag: null,
  toastTimer: null,
  savedAt: null,
  scene: {
    gravity: 720,
    bounce: 0.56,
    friction: 0.92,
    maxMarbles: 5,
    spawnInterval: 1.2,
    spawnEnabled: true,
    showGrid: true,
    snap: 16,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function snap(value, amount = state.scene.snap) {
  return Math.round(value / amount) * amount;
}

function snapAngle(value) {
  let angle = snap(value, 5) % 360;
  if (angle > 180) angle -= 360;
  if (angle <= -180) angle += 360;
  return angle;
}

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value) {
  return (value * 180) / Math.PI;
}

function readableName(type) {
  return type.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function makeObject(type, layer, x, y) {
  const zone = zoneTypes.has(type);
  const object = {
    id: `object-${state.objectId++}`,
    type,
    name: readableName(type),
    layer,
    x,
    y,
    width: type === "track" ? 168 : type === "wall" ? 24 : type === "fan" ? 44 : type === "piston" ? 52 : zone ? 106 : 78,
    height: type === "wall" ? 124 : type === "fan" ? 44 : type === "piston" ? 72 : zone ? 70 : type === "bumper" ? 42 : 34,
    rotation: type === "ramp" ? 24 : type === "fan" ? -90 : 0,
    scaleX: 1,
    scaleY: 1,
    anchored: type !== "start" && type !== "raceStart" && type !== "raceEnd" && type !== "end",
    welded: false,
    visible: true,
    force: type === "fan" ? 520 : type === "booster" ? 700 : type === "magnet" ? 260 : 0,
    radius: type === "fan" ? 145 : type === "magnet" ? 120 : 0,
    angle: type === "fan" ? -90 : 0,
    speed: type === "piston" ? 1.2 : type === "belt" ? 70 : 0,
    travel: type === "piston" ? 76 : 0,
    bounce: type === "bumper" ? 0.92 : 0.56,
    homeX: x,
    homeY: y,
  };

  if (type === "start") {
    object.layer = 2;
    object.spawnMax = 5;
    object.spawnInterval = 1.2;
    object.spawnSpeed = 20;
    object.spawnAngle = 90;
    object.spawnEnabled = true;
    object.marbleTemplate = "violet glass";
    object.anchored = true;
  }

  return object;
}

function seedScene() {
  state.objects = [
    makeObject("start", 2, 118, 86),
    makeObject("ramp", 1, 260, 176),
    makeObject("track", 1, 430, 268),
    makeObject("fan", 3, 560, 220),
    makeObject("piston", 3, 620, 350),
    makeObject("bumper", 1, 760, 360),
    makeObject("platform", 1, 700, 488),
    makeObject("raceEnd", 1, 850, 500),
  ];
  state.objects.find((object) => object.type === "start").anchored = true;
}

const STORAGE_KEY = "marble-run-simulator";

function snapshot() {
  return JSON.stringify({
    version: 2,
    objectId: state.objectId,
    objects: state.objects,
    welds: state.welds,
    scene: state.scene,
  });
}
function restoreSnapshot(serialized) {
  const saved = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
  if (!saved || !Array.isArray(saved.objects) || !saved.scene) throw new Error("Saved run is incomplete");
  state.objectId = Number.isFinite(saved.objectId) ? saved.objectId : Math.max(1, ...saved.objects.map((object) => object.id + 1));
  state.objects = saved.objects.map((object) => ({ ...object }));
  state.welds = Array.isArray(saved.welds) ? saved.welds.map((weld) => ({ ...weld })) : [];
  state.scene = { ...state.scene, ...saved.scene };
  state.selectedId = null;
  state.marbles = [];
  renderLayers();
  renderInspector();
  renderCanvas();
}

function recordHistory() {
  state.history.push(snapshot());
  if (state.history.length > 40) state.history.shift();
  state.redo = [];
}

function undo() {
  if (!state.history.length) {
    showToast("Nothing to undo");
    return;
  }
  state.redo.push(snapshot());
  restoreSnapshot(state.history.pop());
  showToast("Last edit undone");
}

function redo() {
  if (!state.redo.length) {
    showToast("Nothing to redo");
    return;
  }
  state.history.push(snapshot());
  restoreSnapshot(state.redo.pop());
  showToast("Edit restored");
}

function getSelectedObject() {
  return state.objects.find((object) => object.id === state.selectedId) || null;
}

function objectAt(x, y) {
  return [...state.objects]
    .reverse()
    .filter((object) => object.visible)
    .find((object) => {
      const angle = degreesToRadians(-(object.rotation || 0));
      const dx = x - object.x;
      const dy = y - object.y;
      const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
      const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
      const halfW = object.width * object.scaleX / 2 + 12;
      const halfH = object.height * object.scaleY / 2 + 12;
      return Math.abs(localX) <= halfW && Math.abs(localY) <= halfH;
    });
}

function getViewport() {
  const width = canvas.clientWidth || WORLD.width;
  const height = canvas.clientHeight || WORLD.height;
  const fit = Math.min(width / WORLD.width, height / WORLD.height);
  const scale = fit * state.zoom;
  return {
    width,
    height,
    scale,
    offsetX: (width - WORLD.width * scale) / 2,
    offsetY: (height - WORLD.height * scale) / 2,
  };
}

function screenToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  const viewport = getViewport();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return {
    x: (x - viewport.offsetX) / viewport.scale,
    y: (y - viewport.offsetY) / viewport.scale,
  };
}

function worldToScreen(x, y) {
  const viewport = getViewport();
  return {
    x: viewport.offsetX + x * viewport.scale,
    y: viewport.offsetY + y * viewport.scale,
  };
}

function roundedRectPath(target, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  target.beginPath();
  target.moveTo(x + r, y);
  target.arcTo(x + width, y, x + width, y + height, r);
  target.arcTo(x + width, y + height, x, y + height, r);
  target.arcTo(x, y + height, x, y, r);
  target.arcTo(x, y, x + width, y, r);
  target.closePath();
}

function drawObject(object) {
  const color = colors[object.layer] || colors[3];
  const selected = object.id === state.selectedId;
  const zone = zoneTypes.has(object.type);
  const interaction = interactionTypes.has(object.type);
  const animatedX = object.type === "piston" ? object.homeX + Math.cos(degreesToRadians(object.rotation)) * Math.sin(state.elapsed * object.speed * Math.PI * 2) * object.travel / 2 : object.x;
  const animatedY = object.type === "piston" ? object.homeY + Math.sin(degreesToRadians(object.rotation)) * Math.sin(state.elapsed * object.speed * Math.PI * 2) * object.travel / 2 : object.y;

  context.save();
  context.translate(animatedX, animatedY);
  context.rotate(degreesToRadians(object.rotation));
  context.scale(object.scaleX, object.scaleY);
  context.lineWidth = 2;
  context.strokeStyle = color;
  context.fillStyle = object.layer === 1 && !zone ? "#25374a" : `${color}28`;
  context.shadowColor = selected ? color : "transparent";
  context.shadowBlur = selected ? 18 : 0;

  if (zone) {
    context.globalAlpha = 0.92;
    context.setLineDash([8, 6]);
    context.strokeStyle = color;
    context.strokeRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.setLineDash([]);
    context.globalAlpha = 1;
    context.fillStyle = color;
    context.font = "600 10px IBM Plex Mono";
    context.textAlign = "center";
    context.fillText(object.name.toUpperCase(), 0, 4);
    if (object.type === "start") {
      context.beginPath();
      context.arc(0, -17, 9, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(-3, -20);
      context.lineTo(4, -17);
      context.lineTo(-3, -14);
      context.stroke();
    }
  } else if (object.type === "ramp") {
    context.beginPath();
    context.moveTo(-object.width / 2, object.height / 2);
    context.lineTo(object.width / 2, object.height / 2);
    context.lineTo(object.width / 2, -object.height / 2);
    context.closePath();
    context.fill();
    context.stroke();
    context.strokeStyle = `${color}88`;
    context.beginPath();
    context.moveTo(-object.width / 2 + 12, object.height / 2 - 6);
    context.lineTo(object.width / 2 - 10, -object.height / 2 + 5);
    context.stroke();
  } else if (object.type === "funnel") {
    context.beginPath();
    context.moveTo(-object.width / 2, -object.height / 2);
    context.lineTo(object.width / 2, -object.height / 2);
    context.lineTo(13, object.height / 2);
    context.lineTo(-13, object.height / 2);
    context.closePath();
    context.fill();
    context.stroke();
  } else if (object.type === "bumper") {
    context.beginPath();
    context.arc(0, 0, object.width / 2, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.arc(-7, -7, 4, 0, Math.PI * 2);
    context.fillStyle = "#ffffffaa";
    context.fill();
  } else if (object.type === "fan") {
    const radius = 21;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fillStyle = `${color}22`;
    context.fill();
    context.strokeStyle = color;
    context.stroke();
    context.rotate(state.elapsed * 1.5);
    for (let i = 0; i < 4; i += 1) {
      context.rotate(Math.PI / 2);
      context.beginPath();
      context.moveTo(0, 0);
      context.quadraticCurveTo(14, -5, 8, -17);
      context.quadraticCurveTo(2, -12, 0, 0);
      context.fillStyle = `${color}88`;
      context.fill();
      context.stroke();
    }
    context.rotate(-state.elapsed * 1.5);
    context.beginPath();
    context.arc(0, 0, 4, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  } else if (object.type === "piston") {
    const travel = Math.sin(state.elapsed * object.speed * Math.PI * 2) * object.travel / 2;
    context.fillStyle = `${color}25`;
    context.strokeStyle = color;
    context.fillRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.strokeRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.fillStyle = color;
    context.fillRect(-object.width / 2 + 8, -10 + travel, object.width - 16, 20);
    context.strokeRect(-object.width / 2 + 8, -10 + travel, object.width - 16, 20);
    context.strokeStyle = `${color}aa`;
    context.beginPath();
    context.moveTo(0, -object.height / 2 + 7);
    context.lineTo(0, object.height / 2 - 7);
    context.stroke();
  } else if (object.type === "belt") {
    context.fillStyle = `${color}42`;
    context.fillRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.strokeRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.fillStyle = color;
    for (let x = -object.width / 2 + 10; x < object.width / 2 - 3; x += 18) {
      context.beginPath();
      context.moveTo(x, -7);
      context.lineTo(x + 8, 0);
      context.lineTo(x, 7);
      context.fill();
    }
  } else if (object.type === "booster") {
    context.fillStyle = `${color}35`;
    roundedRectPath(context, -object.width / 2, -object.height / 2, object.width, object.height, 8);
    context.fill();
    context.stroke();
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(-12, 0);
    context.lineTo(-3, -9);
    context.lineTo(-3, -3);
    context.lineTo(12, -3);
    context.lineTo(3, 9);
    context.lineTo(3, 3);
    context.lineTo(-12, 3);
    context.closePath();
    context.fill();
  } else if (object.type === "magnet") {
    context.beginPath();
    context.arc(0, 0, 22, Math.PI * 0.18, Math.PI * 0.82);
    context.strokeStyle = color;
    context.lineWidth = 7;
    context.stroke();
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-18, 10);
    context.lineTo(-18, 17);
    context.moveTo(18, 10);
    context.lineTo(18, 17);
    context.stroke();
  } else {
    context.fillRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.strokeRect(-object.width / 2, -object.height / 2, object.width, object.height);
    if (object.type === "track" || object.type === "platform") {
      context.strokeStyle = `${color}99`;
      context.beginPath();
      context.moveTo(-object.width / 2 + 8, -2);
      context.lineTo(object.width / 2 - 8, -2);
      context.stroke();
    }
  }

  if (object.anchored) {
    context.strokeStyle = "#ffffffaa";
    context.beginPath();
    context.moveTo(object.width / 2 - 10, -object.height / 2 + 8);
    context.lineTo(object.width / 2 - 10, -object.height / 2 + 17);
    context.moveTo(object.width / 2 - 14, -object.height / 2 + 12);
    context.lineTo(object.width / 2 - 6, -object.height / 2 + 12);
    context.stroke();
  }

  if (object.welded) {
    context.strokeStyle = varColor("#b89dff");
    context.beginPath();
    context.arc(0, 0, Math.min(object.width, object.height) / 2 + 6, 0, Math.PI * 2);
    context.stroke();
  }

  context.restore();
}

function varColor(color) {
  return color;
}

function drawFanField(object) {
  const direction = degreesToRadians(object.angle);
  const radius = object.radius;
  context.save();
  context.translate(object.x, object.y);
  context.rotate(direction);
  context.strokeStyle = `${colors[3]}${state.activeTool === "select" ? "45" : "88"}`;
  context.fillStyle = `${colors[3]}0b`;
  context.setLineDash([5, 7]);
  context.beginPath();
  context.moveTo(15, -radius * 0.42);
  context.lineTo(radius, 0);
  context.lineTo(15, radius * 0.42);
  context.closePath();
  context.fill();
  context.stroke();
  context.setLineDash([]);
  for (let i = 0; i < 3; i += 1) {
    const x = 36 + i * 30 + Math.sin(state.elapsed * 2 + i) * 8;
    context.beginPath();
    context.moveTo(x, -10);
    context.quadraticCurveTo(x + 12, 0, x, 10);
    context.stroke();
  }
  context.restore();
}

function drawSelectionHandles(object) {
  if (!object) return;
  const halfW = object.width * object.scaleX / 2;
  const halfH = object.height * object.scaleY / 2;
  const selectedColor = state.activeTool === "rotate" ? colors[3] : colors[1];

  context.save();
  context.translate(object.x, object.y);
  context.rotate(degreesToRadians(object.rotation));
  context.strokeStyle = selectedColor;
  context.fillStyle = "#0c1724";
  context.lineWidth = 1.5;
  context.setLineDash([5, 4]);
  context.strokeRect(-halfW - 8, -halfH - 8, halfW * 2 + 16, halfH * 2 + 16);
  context.setLineDash([]);

  if (state.activeTool === "rotate") {
    const ring = Math.max(halfW, halfH) + 29;
    context.strokeStyle = `${colors[3]}cc`;
    context.setLineDash([3, 5]);
    context.beginPath();
    context.arc(0, 0, ring, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = colors[3];
    context.beginPath();
    context.arc(0, -ring, 7, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#e9fbff";
    context.beginPath();
    context.arc(0, -ring, 3, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "#b5d7e5";
    context.font = "600 10px IBM Plex Mono";
    context.textAlign = "center";
    context.fillText(`${Math.round(object.rotation)}° · snap 5°`, 0, -ring - 15);
  }

  if (state.activeTool === "scale") {
    context.fillStyle = colors[1];
    [[-halfW - 8, -halfH - 8], [halfW + 8, -halfH - 8], [halfW + 8, halfH + 8], [-halfW - 8, halfH + 8]].forEach(([x, y]) => {
      context.fillRect(x - 5, y - 5, 10, 10);
      context.strokeRect(x - 5, y - 5, 10, 10);
    });
    context.fillStyle = "#b5d7e5";
    context.font = "600 10px IBM Plex Mono";
    context.textAlign = "center";
    context.fillText(`${Math.round(object.scaleX * 100)}% × ${Math.round(object.scaleY * 100)}%`, 0, halfH + 27);
  }

  context.restore();
}

function renderCanvas() {
  const width = canvas.clientWidth || WORLD.width;
  const height = canvas.clientHeight || WORLD.height;
  const ratio = window.devicePixelRatio || 1;
  const viewport = getViewport();

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#0b121d";
  context.fillRect(0, 0, width, height);

  context.save();
  context.translate(viewport.offsetX, viewport.offsetY);
  context.scale(viewport.scale, viewport.scale);

  if (state.scene.showGrid) {
    context.strokeStyle = "rgba(142, 177, 204, 0.09)";
    context.lineWidth = 1 / viewport.scale;
    for (let x = 0; x <= WORLD.width; x += state.scene.snap) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, WORLD.height);
      context.stroke();
    }
    for (let y = 0; y <= WORLD.height; y += state.scene.snap) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(WORLD.width, y);
      context.stroke();
    }
  }

  state.welds.forEach((weld) => {
    const from = state.objects.find((object) => object.id === weld.from);
    const to = state.objects.find((object) => object.id === weld.to);
    if (!from || !to) return;
    context.strokeStyle = `${colors[3]}88`;
    context.lineWidth = 2 / viewport.scale;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.setLineDash([]);
  });

  state.objects.filter((object) => object.visible).forEach((object) => {
    if (object.type === "fan") drawFanField(object);
  });
  state.objects.filter((object) => object.visible).forEach(drawObject);

  if (!state.objects.length) {
    context.fillStyle = "#7890a5";
    context.textAlign = "center";
    context.font = "600 12px IBM Plex Mono";
    context.fillText("DRAG A PART FROM THE BUILD KIT", WORLD.width / 2, WORLD.height / 2 - 8);
    context.fillStyle = "#50677c";
    context.font = "10px IBM Plex Mono";
    context.fillText("or click a catalog item to place it on the grid", WORLD.width / 2, WORLD.height / 2 + 15);
  }

  state.marbles.forEach(drawMarble);
  drawSelectionHandles(getSelectedObject());
  context.restore();

  if (state.mode === "Play") {
    canvasWrap.dataset.tool = state.activeTool;
  }

  void ratio;
}

function drawMarble(marble) {
  context.save();
  const color = marble.template === "amber steel" ? colors[1] : marble.template === "cyan alloy" ? colors[3] : colors[2];
  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = 18;
  context.beginPath();
  context.arc(marble.x, marble.y, marble.radius, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffffcc";
  context.shadowBlur = 0;
  context.beginPath();
  context.arc(marble.x - marble.radius * 0.35, marble.y - marble.radius * 0.35, marble.radius * 0.24, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  canvas.height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  renderCanvas();
}

function objectPosition(object) {
  if (object.type !== "piston") return { x: object.x, y: object.y };
  const offset = Math.sin(state.elapsed * object.speed * Math.PI * 2) * object.travel / 2;
  return {
    x: object.homeX + Math.cos(degreesToRadians(object.rotation)) * offset,
    y: object.homeY + Math.sin(degreesToRadians(object.rotation)) * offset,
  };
}

function applyInteractionForces(marble, delta) {
  state.objects.forEach((object) => {
    const position = objectPosition(object);
    const dx = marble.x - position.x;
    const dy = marble.y - position.y;
    const distance = Math.hypot(dx, dy);

    if (object.type === "fan" && distance < object.radius) {
      const falloff = 1 - distance / object.radius;
      const direction = degreesToRadians(object.angle);
      marble.vx += Math.cos(direction) * object.force * falloff * delta;
      marble.vy += Math.sin(direction) * object.force * falloff * delta;
      marble.airflow = Math.min(1, marble.airflow + delta * 4);
    }

    if (object.type === "magnet" && distance > 0 && distance < object.radius) {
      const falloff = 1 - distance / object.radius;
      marble.vx += (dx / distance) * object.force * falloff * delta;
      marble.vy += (dy / distance) * object.force * falloff * delta;
    }

    if (object.type === "booster" && distance < 34 && marble.boostCooldown <= 0) {
      const direction = degreesToRadians(object.rotation);
      marble.vx += Math.cos(direction) * object.force;
      marble.vy += Math.sin(direction) * object.force;
      marble.boostCooldown = 0.7;
    }

    if (object.type === "belt" && distance < object.width / 2 + 18) {
      const direction = degreesToRadians(object.rotation);
      marble.vx += Math.cos(direction) * object.speed * delta;
      marble.vy += Math.sin(direction) * object.speed * delta;
    }
  });
}

function collideWithObject(marble, object) {
  if (!solidTypes.has(object.type) || object.visible === false) return;
  const position = objectPosition(object);
  const angle = degreesToRadians(-(object.rotation || 0));
  const dx = marble.x - position.x;
  const dy = marble.y - position.y;
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
  const halfW = object.width * object.scaleX / 2;
  const halfH = object.height * object.scaleY / 2;
  const closestX = clamp(localX, -halfW, halfW);
  const closestY = clamp(localY, -halfH, halfH);
  let normalX = localX - closestX;
  let normalY = localY - closestY;
  let distance = Math.hypot(normalX, normalY);

  if (distance === 0) {
    const horizontal = halfW - Math.abs(localX);
    const vertical = halfH - Math.abs(localY);
    if (horizontal < vertical) {
      normalX = localX < 0 ? -1 : 1;
      normalY = 0;
      distance = horizontal;
    } else {
      normalX = 0;
      normalY = localY < 0 ? -1 : 1;
      distance = vertical;
    }
  }

  if (distance >= marble.radius) return;

  const normalLength = Math.hypot(normalX, normalY) || 1;
  normalX /= normalLength;
  normalY /= normalLength;
  const worldNormalX = normalX * Math.cos(-angle) - normalY * Math.sin(-angle);
  const worldNormalY = normalX * Math.sin(-angle) + normalY * Math.cos(-angle);
  const overlap = marble.radius - distance + 0.25;
  marble.x += worldNormalX * overlap;
  marble.y += worldNormalY * overlap;

  const velocityAlongNormal = marble.vx * worldNormalX + marble.vy * worldNormalY;
  if (velocityAlongNormal < 0) {
    const restitution = object.type === "bumper" ? object.bounce : state.scene.bounce;
    marble.vx -= (1 + restitution) * velocityAlongNormal * worldNormalX;
    marble.vy -= (1 + restitution) * velocityAlongNormal * worldNormalY;
    marble.vx *= state.scene.friction;
    marble.vy *= state.scene.friction;
  }
}

function collideMarbles() {
  for (let firstIndex = 0; firstIndex < state.marbles.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < state.marbles.length; secondIndex += 1) {
      const first = state.marbles[firstIndex];
      const second = state.marbles[secondIndex];
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const distance = Math.hypot(dx, dy);
      const minimumDistance = first.radius + second.radius;
      if (distance === 0 || distance >= minimumDistance) continue;

      const nx = dx / distance;
      const ny = dy / distance;
      const overlap = (minimumDistance - distance) / 2;
      first.x -= nx * overlap;
      first.y -= ny * overlap;
      second.x += nx * overlap;
      second.y += ny * overlap;

      const relativeVelocity = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
      if (relativeVelocity > 0) continue;
      const impulse = -(1 + 0.86) * relativeVelocity / 2;
      first.vx -= impulse * nx;
      first.vy -= impulse * ny;
      second.vx += impulse * nx;
      second.vy += impulse * ny;
    }
  }
}

function findSpawn() {
  return state.objects.find((object) => object.type === "start" && object.visible);
}

function spawnMarble() {
  const start = findSpawn();
  if (!start || state.marbles.length >= Math.min(state.scene.maxMarbles, start.spawnMax || state.scene.maxMarbles) || !state.scene.spawnEnabled || start.spawnEnabled === false) return false;
  const position = objectPosition(start);
  const template = start.marbleTemplate || "violet glass";
  state.marbles.push({
    x: position.x,
    y: position.y + 24,
    vx: Math.cos(degreesToRadians(start.spawnAngle ?? 90)) * (start.spawnSpeed ?? 18),
    vy: Math.sin(degreesToRadians(start.spawnAngle ?? 90)) * (start.spawnSpeed ?? 18),
    radius: 10,
    template,
    airflow: 0,
    boostCooldown: 0,
  });
  return true;
}

function resetSimulation() {
  state.elapsed = 0;
  state.spawnClock = 0;
  state.finished = 0;
  state.marbles = [];
  if (state.scene.spawnEnabled) spawnMarble();
}

function updatePhysics(delta) {
  if (state.mode !== "Play") return;
  state.elapsed += delta;
  state.spawnClock += delta;

  const start = findSpawn();
  const spawnInterval = start ? start.spawnInterval : state.scene.spawnInterval;
  while (state.spawnClock >= spawnInterval) {
    state.spawnClock -= spawnInterval;
    spawnMarble();
  }

  state.marbles.forEach((marble) => {
    marble.airflow = Math.max(0, marble.airflow - delta * 2);
    marble.boostCooldown -= delta;
    marble.vy += state.scene.gravity * delta;
    applyInteractionForces(marble, delta);
    marble.vx *= 0.999;
    marble.vy *= 0.999;
    marble.x += marble.vx * delta;
    marble.y += marble.vy * delta;
    state.objects.forEach((object) => collideWithObject(marble, object));

    if (marble.x < marble.radius) {
      marble.x = marble.radius;
      marble.vx = Math.abs(marble.vx) * 0.7;
    }
    if (marble.x > WORLD.width - marble.radius) {
      marble.x = WORLD.width - marble.radius;
      marble.vx = -Math.abs(marble.vx) * 0.7;
    }
  });

  collideMarbles();

  state.marbles = state.marbles.filter((marble) => {
    if (marble.y > WORLD.height + 35) {
      state.finished += 1;
      return false;
    }
    return true;
  });
}

function updateCounters() {
  document.querySelector("#object-count").textContent = state.objects.length;
  document.querySelector("#body-count").textContent = state.marbles.length;
  document.querySelector("#marble-count").textContent = String(state.marbles.length).padStart(2, "0");
  document.querySelector("#finished-count").textContent = String(state.finished).padStart(2, "0");
  document.querySelector("#race-time").textContent = `${state.elapsed.toFixed(1)}s`;
  document.querySelector("#physics-state").textContent = state.mode === "Edit" ? "STANDBY" : state.mode === "Play" ? "RUNNING" : "PAUSED";
  document.querySelector("#canvas-mode-label").textContent = state.mode.toUpperCase();
  document.querySelector("#zoom-label").textContent = `${Math.round(state.zoom * 100)}%`;
}

function setStatus(message) {
  const status = document.querySelector("#canvas-status");
  if (status) status.textContent = message;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function renderCatalog() {
  const search = document.querySelector("#catalog-search").value.trim().toLowerCase();
  const catalogElement = document.querySelector("#catalog");
  catalogElement.innerHTML = "";

  catalog[state.activeCategory]
    .filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(search))
    .forEach((item) => {
      const button = document.createElement("button");
      button.className = "catalog-item";
      button.innerHTML = `<span class="catalog-icon" style="color:${colors[item.layer]}"><span class="ui-icon">${icon(item.icon)}</span></span><span><b>${item.label}</b><small>${item.hint}</small></span><span class="layer-mini" style="color:${colors[item.layer]}">L${item.layer}</span>`;
      button.addEventListener("click", () => addObject(item.type, item.layer));
        button.draggable = true;
      button.addEventListener("dragstart", (event) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("application/x-marble-tool", JSON.stringify({ type: item.type, layer: item.layer }));
      });
      catalogElement.appendChild(button);
    });
}

function renderLayers() {
  const layersElement = document.querySelector("#layers");
  layersElement.innerHTML = "";
  layers.forEach((layer) => {
    const button = document.createElement("button");
    button.className = `layer-row ${state.activeLayer === layer.id ? "chosen" : ""}`;
    button.innerHTML = `<span class="layer-swatch" style="background:${colors[layer.id]};color:${colors[layer.id]}"></span><span><b>${layer.name}</b><small>${layer.desc}</small></span><kbd>L${layer.id}</kbd>`;
    button.addEventListener("click", () => {
      state.activeLayer = layer.id;
      renderLayers();
      updateActiveLayer();
    });
    layersElement.appendChild(button);
  });
}

function updateActiveLayer() {
  document.querySelector("#active-layer-chip").textContent = `L${state.activeLayer}`;
  document.querySelector("#active-layer-chip").style.color = colors[state.activeLayer];
  document.querySelector("#active-layer-chip").style.borderColor = colors[state.activeLayer];
  document.querySelector("#active-layer-name").textContent = layers[state.activeLayer - 1].name;
}

function field(label, fieldName, value, type = "number", extra = "") {
  return `<label>${label}<input data-field="${fieldName}" type="${type}" value="${value}" ${extra}></label>`;
}

function rangeField(label, fieldName, value, min, max, step) {
  const normalizedValue = Number((Math.round(value / step) * step).toFixed(4));
  return `<label>${label}<div class="range-field"><input data-field="${fieldName}" type="range" min="${min}" max="${max}" step="${step}" value="${normalizedValue}"><input data-field="${fieldName}" type="number" min="${min}" max="${max}" step="${step}" value="${normalizedValue}"></div></label>`;
}

function toggleRow(label, fieldName, enabled) {
  return `<div class="toggle-row"><span>${label}</span><button class="toggle ${enabled ? "on" : ""}" data-toggle="${fieldName}" aria-pressed="${enabled}"><span></span></button></div>`;
}

function renderSceneSettings() {
  inspectorElement.innerHTML = `
    <div class="settings-hero">
      <span class="eyebrow">SCENE CONTROL</span>
      <h3>Run settings</h3>
      <p>These values are live. Change them, switch back to Inspector, and keep building without losing the scene.</p>
    </div>
    <div class="setting-card">
      <h4><span class="ui-icon">${icon("settings")}</span>Simulation</h4>
      ${rangeField("Gravity", "scene.gravity", state.scene.gravity, 0, 1400, 10)}
      ${rangeField("Bounce", "scene.bounce", state.scene.bounce, 0, 1, 0.01)}
      ${rangeField("Surface friction", "scene.friction", state.scene.friction, 0.5, 1, 0.01)}
    </div>
    <div class="setting-card">
      <h4><span class="ui-icon">${icon("play")}</span>Spawning</h4>
      ${rangeField("Max marbles", "scene.maxMarbles", state.scene.maxMarbles, 1, 12, 1)}
      ${rangeField("Default interval (s)", "scene.spawnInterval", state.scene.spawnInterval, 0.2, 5, 0.1)}
      ${toggleRow("Allow automatic spawn", "scene.spawnEnabled", state.scene.spawnEnabled)}
    </div>
    <div class="setting-card">
      <h4><span class="ui-icon">${icon("grid")}</span>Editor grid</h4>
      ${rangeField("Snap size (px)", "scene.snap", state.scene.snap, 4, 32, 4)}
      ${toggleRow("Show construction grid", "scene.showGrid", state.scene.showGrid)}
    </div>
    <div class="setting-card">
      <h4><span class="ui-icon">${icon("mouse")}</span>Shortcuts</h4>
      <div class="shortcut-grid"><div>Move <kbd>M</kbd></div><div>Scale <kbd>S</kbd></div><div>Rotate <kbd>R</kbd></div><div>Weld <kbd>W</kbd></div><div>Anchor <kbd>A</kbd></div><div>Delete <kbd>⌫</kbd></div></div>
    </div>
  `;
}

function renderInspector() {
  if (state.inspectorTab === "scene") {
    renderSceneSettings();
    return;
  }

  const object = getSelectedObject();
  if (!object) {
    inspectorElement.innerHTML = `<div class="empty-inspector"><div class="empty-icon"><span class="ui-icon">${icon("select")}</span></div><h3>Select an object</h3><p>Click a part, then edit its values here. Dragging works directly on the canvas.</p><span>Rotate shows a circular 5° snap handle. Scale shows corner handles.</span></div>`;
    return;
  }

  const extraSettings = object.type === "fan" ? `
    <div class="inspector-section"><div class="section-title"><span class="ui-icon">${icon("rotate")}</span>AIRFLOW</div>
      ${rangeField("Force", "force", object.force, 0, 1400, 10)}
      ${rangeField("Radius", "radius", object.radius, 40, 260, 5)}
      ${field("Direction (degrees)", "angle", object.angle, "number", "min=-180 max=180 step=5")}
      <div class="callout cyan"><span class="ui-icon">${icon("move")}</span><span><b>Air field is live</b><small>Marbles inside the cone receive a directional force.</small></span></div>
    </div>` : "";
  const pistonSettings = object.type === "piston" ? `
    <div class="inspector-section"><div class="section-title"><span class="ui-icon">${icon("move")}</span>PISTON MOTION</div>
      ${rangeField("Stroke", "travel", object.travel, 0, 180, 4)}
      ${rangeField("Speed (Hz)", "speed", object.speed, 0.1, 4, 0.1)}
      ${field("Direction (degrees)", "rotation", object.rotation, "number", "step=5")}
      <div class="callout violet"><span class="ui-icon">${icon("rotate")}</span><span><b>Timed stroke</b><small>The piston moves continuously while Play is active.</small></span></div>
    </div>` : "";
  const startSettings = object.type === "start" ? `
    <div class="inspector-section"><div class="section-title"><span class="ui-icon">${icon("play")}</span>SPAWN SETTINGS</div>
      ${rangeField("Max marbles", "spawnMax", object.spawnMax, 1, 12, 1)}
      ${rangeField("Interval (s)", "spawnInterval", object.spawnInterval, 0.2, 5, 0.1)}
      ${rangeField("Launch speed", "spawnSpeed", object.spawnSpeed, 0, 600, 5)}
      ${field("Launch direction (degrees)", "spawnAngle", object.spawnAngle, "number", "min=-180 max=180 step=5")}
      <label>Marble template<select data-field="marbleTemplate"><option ${object.marbleTemplate === "violet glass" ? "selected" : ""}>violet glass</option><option ${object.marbleTemplate === "amber steel" ? "selected" : ""}>amber steel</option><option ${object.marbleTemplate === "cyan alloy" ? "selected" : ""}>cyan alloy</option></select></label>
      ${toggleRow("Enable this emitter", "spawnEnabled", object.spawnEnabled)}
    </div>` : "";

  inspectorElement.innerHTML = `
    <div class="object-heading"><div class="object-symbol" style="color:${colors[object.layer]}"><span class="ui-icon">${icon(object.type === "fan" ? "rotate" : object.type === "piston" ? "move" : object.type === "start" ? "play" : object.type === "weld" ? "link" : "grid")}</span></div><div><span class="eyebrow">SELECTED OBJECT</span><h3>${object.name}</h3><span class="type-line">${object.type} <i style="color:${colors[object.layer]}">L${object.layer}</i></span></div></div>
    <div class="inspector-section"><div class="section-title"><span class="ui-icon">${icon("settings")}</span>IDENTITY</div>
      ${field("Name", "name", object.name, "text")}
      <label>Layer<select data-field="layer"><option value="1" ${object.layer === 1 ? "selected" : ""}>MAIN PARTS</option><option value="2" ${object.layer === 2 ? "selected" : ""}>MARBLES</option><option value="3" ${object.layer === 3 ? "selected" : ""}>INTERACTIONS</option></select></label>
    </div>
    <div class="inspector-section"><div class="section-title"><span class="ui-icon">${icon("move")}</span>TRANSFORM</div>
      <div class="two-fields">${field("X", "x", Math.round(object.x), "number", "step=1")}${field("Y", "y", Math.round(object.y), "number", "step=1")}</div>
      <div class="two-fields">${field("Scale X", "scaleX", object.scaleX.toFixed(2), "number", "min=0.25 max=4 step=0.05")}${field("Scale Y", "scaleY", object.scaleY.toFixed(2), "number", "min=0.25 max=4 step=0.05")}</div>
      ${field("Rotation (5° snap)", "rotation", Math.round(object.rotation), "number", "step=5")}
    </div>
    ${extraSettings}${pistonSettings}${startSettings}
    <div class="inspector-section"><div class="section-title"><span class="ui-icon">${icon("anchor")}</span>BEHAVIOR</div>
      ${toggleRow("Anchored to world", "anchored", object.anchored)}
      ${toggleRow("Welded connection", "welded", object.welded)}
      ${toggleRow("Visible in simulation", "visible", object.visible)}
    </div>
  `;
}

function updateObjectField(object, fieldName, value) {
  const numericFields = new Set(["x", "y", "scaleX", "scaleY", "rotation", "layer", "force", "radius", "angle", "speed", "travel", "bounce", "spawnMax", "spawnInterval", "spawnSpeed", "spawnAngle"]);
  const parsed = numericFields.has(fieldName) ? Number(value) : value;
  if (numericFields.has(fieldName) && !Number.isFinite(parsed)) return;

  if (fieldName === "layer") {
    object.layer = clamp(parsed, 1, 3);
    renderLayers();
    updateActiveLayer();
  } else if (fieldName === "rotation" || fieldName === "angle") {
    object[fieldName] = snapAngle(parsed);
    if (fieldName === "rotation" && object.type === "piston") object.homeX = object.x;
  } else if (fieldName === "scaleX" || fieldName === "scaleY") {
    object[fieldName] = clamp(parsed, 0.25, 4);
  } else if (fieldName === "spawnInterval") {
    object.spawnInterval = clamp(parsed, 0.2, 5);
  } else if (fieldName === "spawnMax") {
    object.spawnMax = clamp(Math.round(parsed), 1, 12);
  } else if (fieldName === "spawnSpeed") {
    object.spawnSpeed = clamp(parsed, 0, 600);
  } else if (fieldName === "spawnAngle") {
    object.spawnAngle = snapAngle(parsed);
  } else if (fieldName === "speed") {
    object.speed = clamp(parsed, 0.1, 4);
  } else if (fieldName === "travel") {
    object.travel = clamp(parsed, 0, 180);
  } else {
    object[fieldName] = parsed;
  }

  if (fieldName === "x" || fieldName === "y") {
    object.x = snap(object.x);
    object.y = snap(object.y);
    if (object.type === "piston") {
      object.homeX = object.x;
      object.homeY = object.y;
    }
  }

  setStatus(`${object.name} updated`);
  renderCanvas();
  updateCounters();
}

function updateSceneField(fieldName, value) {
  const key = fieldName.replace("scene.", "");
  if (key === "showGrid" || key === "spawnEnabled") state.scene[key] = Boolean(value);
  else if (key === "maxMarbles" || key === "snap") state.scene[key] = Math.round(Number(value));
  else state.scene[key] = Number(value);
  state.scene.maxMarbles = clamp(state.scene.maxMarbles, 1, 12);
  state.scene.snap = clamp(state.scene.snap, 4, 32);
  renderCanvas();
  setStatus("Scene settings updated");
}

function handleInspectorInput(event) {
  const target = event.target;
  if (!target.dataset.field) return;
  const selected = getSelectedObject();
  if (target.dataset.field.startsWith("scene.")) {
    updateSceneField(target.dataset.field, target.value);
    document.querySelectorAll(`[data-field="${target.dataset.field}"]`).forEach((input) => {
      if (input !== target) input.value = target.value;
    });
    return;
  }
  if (selected) {
    updateObjectField(selected, target.dataset.field, target.value);
    document.querySelectorAll(`[data-field="${target.dataset.field}"]`).forEach((input) => {
      if (input !== target && target.type === "range") input.value = target.value;
    });
  }
}

function handleInspectorClick(event) {
  const tab = event.target.closest("[data-inspector-tab]");
  if (tab) {
    state.inspectorTab = tab.dataset.inspectorTab;
    document.querySelectorAll("[data-inspector-tab]").forEach((item) => item.classList.toggle("active", item === tab));
    renderInspector();
    return;
  }

  const toggle = event.target.closest("[data-toggle]");
  if (!toggle) return;
  const fieldName = toggle.dataset.toggle;
  const selected = getSelectedObject();
  if (fieldName.startsWith("scene.")) {
    updateSceneField(fieldName, !state.scene[fieldName.replace("scene.", "")]);
    renderInspector();
  }
  else if (selected) {
    recordHistory();
    selected[fieldName] = !selected[fieldName];
    renderInspector();
    renderCanvas();
  }
}

function addObject(type, layer, position = null) {
  recordHistory();
  const x = position ? snap(clamp(position.x, 30, WORLD.width - 30)) : snap(WORLD.width * 0.42);
  const y = position ? snap(clamp(position.y, 30, WORLD.height - 30)) : snap(WORLD.height * 0.36);
  const object = makeObject(type, layer, x, y);
  state.objects.push(object);
  state.selectedId = object.id;
  state.inspectorTab = "inspector";
  document.querySelectorAll("[data-inspector-tab]").forEach((item) => item.classList.toggle("active", item.dataset.inspectorTab === "inspector"));
  renderInspector();
  renderCanvas();
  setStatus(`${object.name} placed · drag to position`);
}

function deleteObject(object) {
  recordHistory();
  state.objects = state.objects.filter((item) => item.id !== object.id);
  state.welds = state.welds.filter((weld) => weld.from !== object.id && weld.to !== object.id);
  state.selectedId = null;
  renderInspector();
  renderCanvas();
  setStatus(`${object.name} deleted`);
}

function setTool(tool) {
  state.activeTool = tool;
  document.querySelectorAll("[data-tool]").forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
  document.querySelector("#tool-name").textContent = tool.toUpperCase();
  canvasWrap.dataset.tool = tool;
  const messages = {
    select: "Select tool active · click or drag a part",
    move: "Move tool active · drag a part",
    scale: "Scale tool active · drag a corner handle",
    rotate: "Rotate tool active · drag the circular handle · 5° snap",
    weld: "Weld tool active · click two parts to join them",
    anchor: "Anchor tool active · click a part to pin it",
    delete: "Delete tool active · click a part to remove it",
  };
  setStatus(messages[tool]);
  renderCanvas();
}

function angleFromObject(object, point) {
  return radiansToDegrees(Math.atan2(point.y - object.y, point.x - object.x));
}

function isRotateHandleHit(object, point) {
  const radius = Math.max(object.width * object.scaleX, object.height * object.scaleY) / 2 + 29;
  const handleAngle = degreesToRadians(object.rotation - 90);
  const hx = object.x + Math.cos(handleAngle) * radius;
  const hy = object.y + Math.sin(handleAngle) * radius;
  return Math.hypot(point.x - hx, point.y - hy) < 18;
}

function isScaleHandleHit(object, point) {
  const angle = degreesToRadians(-object.rotation);
  const dx = point.x - object.x;
  const dy = point.y - object.y;
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
  const halfW = object.width * object.scaleX / 2 + 8;
  const halfH = object.height * object.scaleY / 2 + 8;
  const onX = Math.abs(Math.abs(localX) - halfW) < 16;
  const onY = Math.abs(Math.abs(localY) - halfH) < 16;
  return onX && onY;
}

function startDrag(object, point, kind) {
  recordHistory();
  state.drag = {
    objectId: object.id,
    kind,
    startPoint: point,
    startX: object.x,
    startY: object.y,
    startRotation: object.rotation,
    startScaleX: object.scaleX,
    startScaleY: object.scaleY,
    startAngle: angleFromObject(object, point),
  };
  canvasWrap.classList.add("dragging");
}

function handlePointerDown(event) {
  const point = screenToWorld(event);
  state.pointer = point;
  const selected = getSelectedObject();
  const hit = objectAt(point.x, point.y);

  if (state.activeTool === "delete") {
    if (hit) deleteObject(hit);
    return;
  }

  if (state.activeTool === "anchor") {
    if (hit) {
      recordHistory();
      hit.anchored = !hit.anchored;
      state.selectedId = hit.id;
      renderInspector();
      renderCanvas();
      setStatus(`${hit.name} ${hit.anchored ? "anchored" : "released"}`);
    }
    return;
  }

  if (state.activeTool === "weld") {
    if (!hit) return;
    if (!state.selectedId || state.selectedId === hit.id) {
      state.selectedId = hit.id;
      renderInspector();
      renderCanvas();
      setStatus("Weld ready · click a second part");
      return;
    }
    recordHistory();
    const existing = state.welds.find((weld) => (weld.from === state.selectedId && weld.to === hit.id) || (weld.from === hit.id && weld.to === state.selectedId));
    if (!existing) state.welds.push({ from: state.selectedId, to: hit.id });
    const first = state.objects.find((object) => object.id === state.selectedId);
    if (first) first.welded = true;
    hit.welded = true;
    state.selectedId = hit.id;
    renderInspector();
    renderCanvas();
    setStatus("Weld created · parts move as a connected pair visually");
    return;
  }

  if (state.activeTool === "rotate" && selected && isRotateHandleHit(selected, point)) {
    startDrag(selected, point, "rotate");
    return;
  }

  if (state.activeTool === "scale" && selected && isScaleHandleHit(selected, point)) {
    startDrag(selected, point, "scale");
    return;
  }

  if (hit) {
    state.selectedId = hit.id;
    renderInspector();
    if (state.activeTool === "rotate") startDrag(hit, point, "rotate");
    else if (state.activeTool === "scale") startDrag(hit, point, "scale");
    else if (state.activeTool === "move" || state.activeTool === "select") startDrag(hit, point, "move");
    renderCanvas();
  } else {
    state.selectedId = null;
    renderInspector();
    renderCanvas();
  }
}

function handlePointerMove(event) {
  if (!state.drag) return;
  const point = screenToWorld(event);
  const object = state.objects.find((item) => item.id === state.drag.objectId);
  if (!object) return;

  if (state.drag.kind === "move") {
    object.x = snap(state.drag.startX + point.x - state.drag.startPoint.x);
    object.y = snap(state.drag.startY + point.y - state.drag.startPoint.y);
    if (object.type === "piston") {
      object.homeX = object.x;
      object.homeY = object.y;
    }
  }

  if (state.drag.kind === "rotate") {
    const delta = angleFromObject(object, point) - state.drag.startAngle;
    object.rotation = snapAngle(state.drag.startRotation + delta);
    if (object.type === "fan") object.angle = object.rotation;
  }

  if (state.drag.kind === "scale") {
    const angle = degreesToRadians(-object.rotation);
    const dx = point.x - object.x;
    const dy = point.y - object.y;
    const localX = Math.abs(dx * Math.cos(angle) - dy * Math.sin(angle));
    const localY = Math.abs(dx * Math.sin(angle) + dy * Math.cos(angle));
    object.scaleX = clamp(localX / (object.width / 2), 0.25, 4);
    object.scaleY = clamp(localY / (object.height / 2), 0.25, 4);
  }

  renderCanvas();
  if (state.inspectorTab === "inspector") updateInspectorValuesWithoutRerender(object);
}

function updateInspectorValuesWithoutRerender(object) {
  ["x", "y", "scaleX", "scaleY", "rotation", "angle", "force", "radius", "speed", "travel", "spawnSpeed", "spawnAngle"].forEach((fieldName) => {
    const input = inspectorElement.querySelector(`[data-field="${fieldName}"]`);
    if (input) input.value = fieldName.includes("scale") ? object[fieldName].toFixed(2) : Math.round(object[fieldName] * 100) / 100;
  });
}

function handlePointerUp() {
  if (!state.drag) return;
  state.drag = null;
  canvasWrap.classList.remove("dragging");
  renderInspector();
  setStatus(`${getSelectedObject()?.name || "Object"} transform applied`);
}

function setMode(nextMode) {
  if (state.mode === nextMode) return;
  state.mode = nextMode;
  if (nextMode === "Play") resetSimulation();
  if (nextMode === "Paused") state.marbles = state.marbles;
  if (nextMode === "Edit") state.marbles = [];
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === nextMode));
  setStatus(nextMode === "Play" ? "Simulation running · collisions enabled" : nextMode === "Paused" ? "Simulation paused" : "Edit mode · changes are live");
  renderCanvas();
}

function formatSavedAt(iso) {
  if (!iso) return "Not saved";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not saved";
  return `Saved ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function updateSaveStatus(text = formatSavedAt(state.savedAt)) {
  const element = document.querySelector("#save-status");
  if (element) element.textContent = text;
}
function readSavedRun() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved?.version === 2 ? saved : null;
  } catch (error) {
    console.warn("Saved run could not be read", error);
    return null;
  }
}
function saveRun() {
  const savedAt = new Date().toISOString();
  const payload = {
    version: 2,
    savedAt,
    objectId: state.objectId,
    objects: state.objects,
    welds: state.welds,
    scene: state.scene,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    state.savedAt = savedAt;
    updateSaveStatus();
    showToast("Run saved to this browser");
    setStatus(`Saved · ${state.objects.length} objects and scene settings stored`);
  } catch (error) {
    showToast("This browser blocked local saving");
    setStatus("Save failed · browser storage is unavailable");
  }
}
function loadRun() {
  const saved = readSavedRun();
  if (!saved) {
    showToast("No compatible saved run yet");
    setStatus("Nothing to load · save this run first");
    return;
  }
  try {
    recordHistory();
    restoreSnapshot(saved);
    state.savedAt = saved.savedAt || null;
    updateSaveStatus();
    showToast("Saved run loaded");
    setStatus("Loaded · scene restored from this browser");
  } catch (error) {
    showToast("Saved run could not be loaded");
    setStatus("Load failed · saved scene is invalid");
  }
}
function loadSavedRunOnBoot() {
  const saved = readSavedRun();
  if (!saved) return false;
  try {
    restoreSnapshot(saved);
    state.savedAt = saved.savedAt || null;
    updateSaveStatus();
    return true;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

function changeZoom(direction) {
  state.zoom = clamp(state.zoom + direction * 0.1, 0.7, 1.5);
  updateCounters();
  renderCanvas();
}

function focusCatalog() {
  document.querySelector("#catalog-search").focus();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) canvasWrap.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function handleKeyboard(event) {
  if (event.target.matches("input, select")) return;
  const shortcuts = { v: "select", m: "move", s: "scale", r: "rotate", w: "weld", a: "anchor" };
  if (shortcuts[event.key.toLowerCase()]) {
    setTool(shortcuts[event.key.toLowerCase()]);
    event.preventDefault();
  }
  if (event.key === "Backspace" || event.key === "Delete") {
    const selected = getSelectedObject();
    if (selected) deleteObject(selected);
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.shiftKey ? redo() : undo();
    event.preventDefault();
  }
}

function animationFrame(time) {
  const delta = Math.min(0.04, (time - state.lastFrame) / 1000);
  state.lastFrame = time;
  updatePhysics(delta);
  renderCanvas();
  updateCounters();
  requestAnimationFrame(animationFrame);
}

document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeCategory = button.dataset.category;
    document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item === button));
    renderCatalog();
  });
});

document.querySelector("#catalog-search").addEventListener("input", renderCatalog);
document.querySelector("#catalog-focus").addEventListener("click", focusCatalog);
document.querySelector("#save-button").addEventListener("click", saveRun);
document.querySelector("#load-button").addEventListener("click", loadRun);
document.querySelector("#undo-button").addEventListener("click", undo);
document.querySelector("#redo-button").addEventListener("click", redo);
document.querySelector("#help-button").addEventListener("click", () => showToast("Select a part, then edit values in Inspector"));
document.querySelector("#fullscreen-button").addEventListener("click", toggleFullscreen);
document.querySelectorAll("[data-zoom]").forEach((button) => button.addEventListener("click", () => changeZoom(button.dataset.zoom === "in" ? 1 : -1)));
document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
document.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => setTool(button.dataset.tool)));
inspectorElement.addEventListener("input", handleInspectorInput);
inspectorElement.addEventListener("change", handleInspectorInput);
document.querySelector(".inspector-tabs").addEventListener("click", handleInspectorClick);
inspectorElement.addEventListener("click", handleInspectorClick);
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const point = screenToWorld(event);
  const hit = objectAt(point.x, point.y);
  if (!hit) return;
  state.activeTool = "select";
  document.querySelectorAll("[data-tool]").forEach((button) => button.classList.toggle("active", button.dataset.tool === "select"));
  document.querySelector("#tool-name").textContent = "SELECT";
  state.selectedId = hit.id;
  state.inspectorTab = "inspector";
  document.querySelectorAll("[data-inspector-tab]").forEach((item) => item.classList.toggle("active", item.dataset.inspectorTab === "inspector"));
  renderInspector();
  renderCanvas();
  setStatus(`${hit.name} inspector opened`);
});
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("dragover", (event) => event.preventDefault());
canvas.addEventListener("drop", (event) => {
  event.preventDefault();
  const raw = event.dataTransfer.getData("application/x-marble-tool");
  if (!raw) return;
  const item = JSON.parse(raw);
  addObject(item.type, item.layer, screenToWorld(event));
});
window.addEventListener("pointerup", handlePointerUp);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", handleKeyboard);

loadSavedRunOnBoot();
renderCatalog();
renderLayers();
updateActiveLayer();
renderInspector();
resizeCanvas();
updateCounters();
requestAnimationFrame(animationFrame);
