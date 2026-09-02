/* Signal Foundry: plain JavaScript editor logic. No React, no TypeScript, no framework-specific code. */

const canvas = document.querySelector("#simulation-canvas");
const context = canvas.getContext("2d");

const colors = {
  1: "#f2b84b",
  2: "#a78bfa",
  3: "#67e8f9",
};

const layers = [
  { id: 1, name: "Marble Run Main Parts", short: "MAIN PARTS", desc: "Structure & track" },
  { id: 2, name: "Marbles", short: "MARBLES", desc: "Dynamic bodies" },
  { id: 3, name: "Marble Interactions", short: "INTERACTIONS", desc: "Forces & triggers" },
];

const catalog = {
  Parts: [
    ["track", "Straight track", "Guided rail", 1, "━"],
    ["ramp", "Ramp", "Inclined descent", 1, "╱"],
    ["wall", "Wall", "Static barrier", 1, "▮"],
    ["platform", "Platform", "Flat support", 1, "▬"],
    ["funnel", "Funnel", "Collect & align", 1, "▽"],
  ],
  Zones: [
    ["start", "Start zone", "Spawn marbles", 1, "◎"],
    ["raceStart", "Race start", "Begin timer", 1, "▶"],
    ["raceEnd", "Race end", "Finish line", 1, "◆"],
    ["end", "End zone", "Complete run", 1, "◉"],
    ["teleporter", "Teleporter", "Linked gateway", 1, "↗"],
    ["sensor", "Sensor zone", "Detect bodies", 3, "⌁"],
  ],
  Functions: [
    ["belt", "Conveyor belt", "Apply velocity", 3, "▰"],
    ["booster", "Booster", "Impulse burst", 3, "✦"],
    ["fan", "Fan", "Directional force", 3, "≋"],
    ["magnet", "Magnet", "Attract / repel", 3, "↯"],
    ["bumper", "Bumper", "Bounce contact", 3, "●"],
    ["piston", "Piston", "Linear motion", 3, "↕"],
    ["weld", "Weld", "Join objects", 3, "⌘"],
    ["anchor", "Anchor", "Fix to world", 3, "⚑"],
  ],
};

let activeCategory = "Parts";
let activeLayer = 1;
let activeTool = "select";
let mode = "Edit";
let selectedId = null;
let objectId = 1;
let elapsed = 0;
let lastFrame = performance.now();
let dragId = null;
let objects = [];
let marbles = [];

function makeObject(type, layer, x, y) {
  const zones = ["start", "raceStart", "raceEnd", "end", "teleporter", "sensor"];
  const isZone = zones.includes(type);
  const readableName = type.replace(/([A-Z])/g, " $1");

  return {
    id: `object-${objectId++}`,
    type,
    name: readableName.charAt(0).toUpperCase() + readableName.slice(1),
    layer,
    x,
    y,
    width: type === "track" ? 150 : type === "wall" ? 20 : isZone ? 100 : 72,
    height: type === "wall" ? 120 : isZone ? 70 : type === "track" ? 18 : 34,
    rotation: type === "ramp" ? 24 : 0,
    scaleX: 1,
    scaleY: 1,
    anchored: false,
  };
}

function seedScene() {
  objects = [
    makeObject("start", 1, 120, 90),
    makeObject("ramp", 1, 250, 165),
    makeObject("track", 1, 420, 250),
    makeObject("belt", 3, 575, 310),
    makeObject("wall", 1, 720, 390),
    makeObject("raceEnd", 1, 860, 500),
    makeObject("anchor", 3, 420, 470),
  ];
}

function objectAt(x, y) {
  return [...objects].reverse().find((object) => {
    return Math.abs(object.x - x) < Math.max(28, object.width / 2)
      && Math.abs(object.y - y) < Math.max(25, object.height / 2);
  });
}

function drawObject(object) {
  const color = colors[object.layer];
  const isSelected = object.id === selectedId;
  const isZone = ["start", "raceStart", "raceEnd", "end", "teleporter", "sensor"].includes(object.type);

  context.save();
  context.translate(object.x, object.y);
  context.rotate((object.rotation * Math.PI) / 180);
  context.scale(object.scaleX, object.scaleY);
  context.strokeStyle = color;
  context.fillStyle = object.layer === 1 && !isZone ? "#394454" : color;
  context.lineWidth = 2;
  context.shadowColor = color;
  context.shadowBlur = isSelected ? 18 : 5;

  if (isZone) {
    context.globalAlpha = 0.22;
    context.setLineDash([7, 5]);
    context.strokeRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.globalAlpha = 1;
    context.setLineDash([]);
    context.fillStyle = color;
    context.font = "600 10px IBM Plex Mono";
    context.textAlign = "center";
    context.fillText(object.name.toUpperCase(), 0, 4);
  } else if (object.type === "ramp") {
    context.beginPath();
    context.moveTo(-object.width / 2, object.height / 2);
    context.lineTo(object.width / 2, object.height / 2);
    context.lineTo(object.width / 2, -object.height / 2);
    context.closePath();
    context.fill();
    context.stroke();
  } else {
    context.fillRect(-object.width / 2, -object.height / 2, object.width, object.height);
    context.strokeRect(-object.width / 2, -object.height / 2, object.width, object.height);

    if (object.type === "belt") {
      context.fillStyle = "#09101b";
      for (let x = -object.width / 2 + 10; x < object.width / 2; x += 18) {
        context.beginPath();
        context.moveTo(x, -8);
        context.lineTo(x + 8, 0);
        context.lineTo(x, 8);
        context.fill();
      }
    }
  }

  if (isSelected) {
    context.strokeStyle = "#ffffff";
    context.setLineDash([4, 4]);
    context.strokeRect(-object.width / 2 - 7, -object.height / 2 - 7, object.width + 14, object.height + 14);
    context.setLineDash([]);
    context.fillStyle = "#ffffff";
    context.font = "600 10px IBM Plex Mono";
    context.textAlign = "left";
    context.fillText(object.name, -object.width / 2, -object.height / 2 - 14);
  }

  context.restore();
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function renderCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#0b1422";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(130, 160, 190, 0.08)";
  context.lineWidth = 1;

  for (let x = 0; x < width; x += 16) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y < height; y += 16) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  objects.forEach(drawObject);

  marbles.forEach((marble) => {
    context.save();
    context.fillStyle = "#a78bfa";
    context.shadowColor = "#a78bfa";
    context.shadowBlur = 18;
    context.beginPath();
    context.arc(marble.x, marble.y, 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.globalAlpha = 0.75;
    context.beginPath();
    context.arc(marble.x - 3, marble.y - 3, 2.5, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
}

function updatePhysics(delta) {
  if (mode !== "Play") return;

  elapsed += delta;

  if (marbles.length < 5 && Math.random() < delta * 1.2) {
    marbles.push({ x: 120, y: 55, vx: 18, vy: 0 });
  }

  marbles.forEach((marble) => {
    marble.vy += 440 * delta;
    marble.x += marble.vx * delta;
    marble.y += marble.vy * delta;

    objects.forEach((object) => {
      if (object.layer !== 1) return;

      const touchingX = Math.abs(marble.x - object.x) < object.width / 2 + 10;
      const touchingY = marble.y > object.y - object.height / 2 - 10;

      if (touchingX && touchingY && marble.vy > 0) {
        marble.y = object.y - object.height / 2 - 10;
        marble.vy *= -0.5;
      }
    });

    if (marble.y > canvas.clientHeight + 20) {
      marble.x = 120;
      marble.y = 55;
      marble.vy = 0;
    }
  });
}

function animationFrame(time) {
  const delta = Math.min(0.04, (time - lastFrame) / 1000);
  lastFrame = time;
  updatePhysics(delta);
  renderCanvas();
  updateCounters();
  requestAnimationFrame(animationFrame);
}

function updateCounters() {
  document.querySelector("#object-count").textContent = objects.length;
  document.querySelector("#body-count").textContent = marbles.length;
  document.querySelector("#marble-count").textContent = String(marbles.length).padStart(2, "0");
  document.querySelector("#race-time").textContent = `${elapsed.toFixed(1)}s`;
  document.querySelector("#physics-state").textContent = mode === "Edit" ? "STANDBY" : "RUNNING";
  document.querySelector("#canvas-mode-label").textContent = mode.toUpperCase();
}

function setStatus(message) {
  document.querySelector("#canvas-status").textContent = message;
}

function renderCatalog() {
  const search = document.querySelector("#catalog-search").value.toLowerCase();
  const catalogElement = document.querySelector("#catalog");
  catalogElement.innerHTML = "";

  catalog[activeCategory]
    .filter((item) => item[1].toLowerCase().includes(search))
    .forEach(([type, label, hint, layer, icon]) => {
      const button = document.createElement("button");
      button.className = "catalog-item";
      button.innerHTML = `<span class="catalog-icon" style="color:${colors[layer]}">${icon}</span><span><b>${label}</b><small>${hint}</small></span><span class="layer-mini" style="color:${colors[layer]}">L${layer}</span>`;
      button.addEventListener("click", () => addObject(type, layer));
      catalogElement.appendChild(button);
    });
}

function renderLayers() {
  const layersElement = document.querySelector("#layers");
  layersElement.innerHTML = "";

  layers.forEach((layer) => {
    const button = document.createElement("button");
    button.className = `layer-row ${activeLayer === layer.id ? "chosen" : ""}`;
    button.innerHTML = `<span class="layer-swatch" style="background:${colors[layer.id]}"></span><span><b>${layer.name}</b><small>${layer.desc}</small></span><kbd>L${layer.id}</kbd>`;
    button.addEventListener("click", () => {
      activeLayer = layer.id;
      renderLayers();
      updateActiveLayer();
    });
    layersElement.appendChild(button);
  });
}

function updateActiveLayer() {
  document.querySelector("#active-layer-chip").textContent = `L${activeLayer}`;
  document.querySelector("#active-layer-chip").style.color = colors[activeLayer];
  document.querySelector("#active-layer-chip").style.borderColor = colors[activeLayer];
  document.querySelector("#active-layer-name").textContent = layers[activeLayer - 1].name;
}

function updateInspector() {
  const inspector = document.querySelector("#inspector-content");
  const object = objects.find((item) => item.id === selectedId);

  if (!object) {
    inspector.innerHTML = `<div class="empty-inspector"><div class="empty-icon">⌖</div><h3>Select an object</h3><p>Click an object on the canvas to inspect its transform, layer, and behavior.</p><span>Right-click opens this panel too.</span></div>`;
    return;
  }

  inspector.innerHTML = `
    <div class="object-heading">
      <div class="object-symbol" style="color:${colors[object.layer]}">□</div>
      <div><span class="eyebrow">SELECTED OBJECT</span><h3>${object.name}</h3><span class="type-line">${object.type} <i style="color:${colors[object.layer]}">L${object.layer}</i></span></div>
    </div>
    <div class="inspector-section">
      <div class="section-title">▦ IDENTITY</div>
      <label>Name<input id="object-name" value="${object.name}"></label>
      <label>Layer<select id="object-layer"><option value="1" ${object.layer === 1 ? "selected" : ""}>MAIN PARTS</option><option value="2" ${object.layer === 2 ? "selected" : ""}>MARBLES</option><option value="3" ${object.layer === 3 ? "selected" : ""}>INTERACTIONS</option></select></label>
    </div>
    <div class="inspector-section">
      <div class="section-title">↕ TRANSFORM</div>
      <div class="two-fields"><label>X<input id="object-x" type="number" value="${object.x}"></label><label>Y<input id="object-y" type="number" value="${object.y}"></label></div>
      <div class="two-fields"><label>Scale X<input id="object-scale-x" type="number" step="0.1" value="${object.scaleX}"></label><label>Scale Y<input id="object-scale-y" type="number" step="0.1" value="${object.scaleY}"></label></div>
      <label>Rotation<input id="object-rotation" type="number" value="${object.rotation}"></label>
    </div>
    <div class="inspector-section">
      <div class="section-title">✦ BEHAVIOR</div>
      <div class="toggle-row"><span>Anchored to world</span><button id="anchor-toggle" class="toggle ${object.anchored ? "on" : ""}"><span></span></button></div>
      <div class="toggle-row"><span>Visible in simulation</span><button class="toggle on"><span></span></button></div>
    </div>
    ${object.type === "start" ? `<div class="callout violet">◎ <span><b>Spawn settings</b><small>Max 5 marbles · 1.0s interval · template: violet glass</small></span></div>` : ""}
  `;

  document.querySelector("#object-name").addEventListener("input", (event) => {
    object.name = event.target.value;
  });

  document.querySelector("#object-layer").addEventListener("change", (event) => {
    object.layer = Number(event.target.value);
    updateInspector();
  });

  document.querySelector("#object-x").addEventListener("input", (event) => {
    object.x = Number(event.target.value);
  });

  document.querySelector("#object-y").addEventListener("input", (event) => {
    object.y = Number(event.target.value);
  });

  document.querySelector("#object-scale-x").addEventListener("input", (event) => {
    object.scaleX = Number(event.target.value);
  });

  document.querySelector("#object-scale-y").addEventListener("input", (event) => {
    object.scaleY = Number(event.target.value);
  });

  document.querySelector("#object-rotation").addEventListener("input", (event) => {
    object.rotation = Number(event.target.value);
  });

  document.querySelector("#anchor-toggle").addEventListener("click", () => {
    object.anchored = !object.anchored;
    updateInspector();
  });
}

function addObject(type, layer) {
  const object = makeObject(type, layer, 320, 210);
  objects.push(object);
  selectedId = object.id;
  updateInspector();
  setStatus(`${object.name} placed on ${layers[layer - 1].short}`);
}

function saveRun() {
  localStorage.setItem("marble-run-simulator", JSON.stringify({ name: "Spiral Study 01", objects }));
  setStatus("Saved · all scene state serialized");
}

function loadRun() {
  const saved = localStorage.getItem("marble-run-simulator");
  if (!saved) {
    setStatus("No saved run yet");
    return;
  }
  objects = JSON.parse(saved).objects;
  selectedId = null;
  updateInspector();
  setStatus("Run loaded from local workspace");
}

function setMode(nextMode) {
  mode = nextMode;
  if (mode === "Play" && marbles.length === 0) {
    marbles.push({ x: 120, y: 55, vx: 18, vy: 0 });
  }

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item.dataset.category === activeCategory));
    renderCatalog();
  });
});

document.querySelector("#catalog-search").addEventListener("input", renderCatalog);
document.querySelector("#save-button").addEventListener("click", saveRun);
document.querySelector("#load-button").addEventListener("click", loadRun);
document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));

document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => {
    activeTool = button.dataset.tool;
    document.querySelectorAll("[data-tool]").forEach((item) => item.classList.toggle("active", item.dataset.tool === activeTool));
    document.querySelector("#tool-name").textContent = activeTool.toUpperCase();
    setStatus(`${activeTool.toUpperCase()} tool active`);
  });
});

canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((event.clientX - rect.left) / 16) * 16;
  const y = Math.round((event.clientY - rect.top) / 16) * 16;
  const hit = objectAt(x, y);

  if (activeTool === "delete" && hit) {
    objects = objects.filter((object) => object.id !== hit.id);
    selectedId = null;
    updateInspector();
    setStatus(`${hit.name} deleted`);
    return;
  }

  selectedId = hit ? hit.id : null;
  dragId = activeTool === "move" && hit ? hit.id : null;
  updateInspector();
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragId) return;
  const object = objects.find((item) => item.id === dragId);
  const rect = canvas.getBoundingClientRect();
  if (!object) return;
  object.x = Math.round((event.clientX - rect.left) / 16) * 16;
  object.y = Math.round((event.clientY - rect.top) / 16) * 16;
  updateInspector();
});

window.addEventListener("pointerup", () => {
  dragId = null;
});

window.addEventListener("resize", resizeCanvas);

seedScene();
renderCatalog();
renderLayers();
updateActiveLayer();
updateInspector();
resizeCanvas();
requestAnimationFrame(animationFrame);
