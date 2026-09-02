# Marble Run Simulator 

## Implementation Blueprint

> **Platform requirement:** This project will be a browser-based application built with standard **HTML**, **CSS**, and **JavaScript**. HTML defines the editor, toolbox, properties panels, authentication screens, and dashboard. CSS provides the visual system and responsive layout. JavaScript controls drag-and-drop construction, selection, transforms, layers, physics, welds, anchors, simulation controls, saving, loading, and account behavior.

## 1. Product concept

**Marble Run Simulator** is a visual construction editor and physics simulator. Users assemble a marble run by dragging parts from a left-hand toolbox onto a central canvas. A right-hand inspector provides Unity-like object settings. The editor supports three explicit layers, with each layer controlling object behavior rather than merely controlling visual order.

The experience should feel like a compact game editor: users build in edit mode, press Play to release marbles, adjust mechanisms while paused, and save complete marble runs to their account. A run contains the complete scene, including objects, transforms, layer assignments, connections, spawn settings, race settings, and simulation configuration.

## 2. Exact layer model

The application must always include the following three layers in this order. The names and meanings should be visible in a Layers panel.

| Layer | Name | Purpose | Default behavior |
|---|---|---|---|
| 1 | Marble Run Main Parts | Static or mechanically fixed structure such as walls, ramps, tracks, floors, platforms, gates, start/end markers, race zones, and teleporters | Collides with Layer 2 and Layer 3. Normally does not move unless explicitly animated by a supported mechanism. |
| 2 | Marbles | Marbles and marble-like dynamic bodies. Any ordinary object placed here becomes a marble body | Collides with Layer 1 and Layer 3. Does not collide with other Layer 2 bodies by default, although a per-object setting may enable marble-to-marble collision. Objects placed here spawn at the exact location where they were dropped. |
| 3 | Marble Interactions | Objects intended to interact with marbles but not with walls, teleporters, zones, or other Layer 1 structure; examples include conveyor belts, boosters, magnets, fans, bumpers, sensors, and triggers | Interacts with and may collide with Layer 2. It does not collide with Layer 1. It may be configured to collide with another Layer 3 object only when a mechanism explicitly requires it. |

### 2.1 Layer behavior is authoritative

The selected layer determines how a newly created object behaves. The object type does not override the layer unless the user explicitly changes a special behavior setting. For example, a square dragged into Layer 2 is not treated as a wall. It becomes a dynamic marble-like body, spawns at its placed position, responds to gravity, and can be pushed by other bodies unless it is welded or anchored.

A Layer 1 wall remains structural and collides with marbles. A Layer 3 belt affects marbles but is configured not to collide with the walls around it. This separation prevents interaction mechanisms from accidentally becoming part of the track structure.

### 2.2 Collision matrix

The JavaScript physics adapter should implement the following default matrix.

| Collision pair | Default result | Explanation |
|---|---:|---|
| Layer 1 ↔ Layer 1 | Off by default | Main structure should not create unwanted internal physics reactions. A per-object structural collision toggle may enable it when needed. |
| Layer 1 ↔ Layer 2 | On | Walls, ramps, floors, and other main parts collide with marbles. |
| Layer 1 ↔ Layer 3 | Off | Belts and other marble-interaction devices pass through or ignore the walls and track structure. |
| Layer 2 ↔ Layer 2 | Off by default | Marbles behave as independent spawned bodies unless the user enables marble-to-marble collisions. |
| Layer 2 ↔ Layer 3 | On | Belts, boosters, fans, sensors, and similar devices can affect marbles. |
| Layer 3 ↔ Layer 3 | Off by default | Mechanisms do not interfere with each other unless a mechanism-specific setting enables it. |

The collision matrix must be applied in the physics engine and also respected by interaction logic. A Layer 3 conveyor belt, for example, can apply velocity to a marble on contact while remaining non-colliding with a Layer 1 wall.

## 3. Editor layout

The editor uses a three-column workspace with a compact top bar.

| Region | Content |
|---|---|
| Top bar | Project title, current run name, Undo, Redo, Save, Play/Pause, Reset, simulation speed, account menu |
| Left sidebar | Toolbox tabs for Parts, Zones, and Functions; layer selector; searchable object catalog |
| Center canvas | Grid-backed marble-run workspace with pan, zoom, snapping, selection outlines, connection previews, and simulation rendering |
| Right sidebar | Tool controls and Unity-like inspector. It changes according to the active tool or selected object. |
| Bottom status bar | Active layer, selected object, coordinates, zoom level, simulation status, and validation warnings |

The title must be presented as **Marble Run Simulator** with the smaller creator line **made by Norm** beneath or beside it.

## 4. Toolbox tabs

### 4.1 Parts tab

The Parts tab contains the main construction pieces that normally belong in Layer 1. Examples include straight track, curved track, ramp, wall, floor, platform, funnel, divider, bridge, blocker, door, chute, and decorative support. Each item has a thumbnail, name, short description, and default layer badge.

When a user drags a part onto the canvas, the editor creates a new object at the exact drop coordinates. The part remains attached to the pointer until released, and a translucent preview shows its final footprint and collision shape.

### 4.2 Zones tab

The Zones tab contains special scene zones and race controls. It must include at least:

| Zone | Purpose |
|---|---|
| Start Zone | Defines where marbles may spawn. Right-click settings include maximum marble count, spawn speed, spawn interval, marble template, direction, and whether spawning begins automatically. |
| Race Start | Marks the official beginning of a race timer. It may be separate from the physical spawn area. |
| Race End | Marks the finish line or finish area. It records the first marble to arrive and optionally the full finishing order. |
| End Zone | Defines a destination area where marbles stop, disappear, reset, or trigger a completion event. |
| Teleporter | Sends a marble to a linked teleporter. Teleporters belong to the main scene/system group and may collide with Layer 2 while remaining excluded from Layer 3 collision. |
| Sensor Zone | Detects marbles entering or leaving an area without acting as a physical wall. |

Zones should be visually distinct through translucent colored regions and labels. Start and race markers must remain easy to identify when the simulation is running.

### 4.3 Functions tab

The Functions tab contains mechanisms that affect marbles or apply motion. They normally belong in Layer 3 unless their purpose is structural.

| Function | Behavior |
|---|---|
| Conveyor Belt | Applies a configurable velocity to marbles traveling across its surface. It ignores Layer 1 collision by default. |
| Booster | Applies an impulse or target velocity to a marble. |
| Fan | Applies directional force within a radius or rectangular field. |
| Magnet | Attracts or repels marbles according to strength, range, and polarity. |
| Bumper | Applies a bounce impulse on contact with Layer 2. |
| Sensor | Detects marble contact and can trigger a connected mechanism. |
| Axle | A connection tool. Drag the axle handle on top of an object, then connect it to an object below or to an attachment point. Rotating the axle turns the connected object. |
| Piston | A motion controller. Drag the piston onto a block to mark that block as the object to move; right-click the piston to edit its movement settings. |
| Weld | A connection tool that joins compatible movable objects together. |
| Anchor | A structural connection that fixes an object to the background. |

## 5. Tools and object manipulation

The right-side tool rail must include **Move**, **Scale**, **Rotate**, **Connect**, and **Delete**. The Scale tool must support independent axis scaling rather than only uniform scaling. Its inspector exposes separate X and Y values, with an optional lock icon that can be turned off.

The Move tool supports pointer dragging, arrow-key nudging, grid snapping, and numeric X/Y entry. Rotate supports snapping increments and numeric angle entry. All transforms must update both the visual object and its physics body.

Objects use clear selection outlines. The selected object receives handles, an object label, and a small layer badge. Multi-select may be added after the basic editor is complete, but single-object selection, precise dragging, and right-click editing are required for the first version.

## 6. Right-click settings inspector

Right-clicking any object opens a compact contextual inspector on the right side. The panel should not navigate away from the canvas. It contains common settings plus object-specific settings.

| Inspector section | Example fields |
|---|---|
| Identity | Object name, type, layer, visibility, locked state |
| Transform | X, Y, rotation, scale X, scale Y, depth/order |
| Physics | Static/dynamic, mass, friction, restitution, gravity scale, collision toggles |
| Layer behavior | Effective collision pairs, marble-to-marble toggle, interaction enabled |
| Spawn | Spawn enabled, spawn count, spawn delay, initial velocity |
| Motion | Speed, direction, acceleration, limits, loop, easing, pause behavior |
| Zone | Zone size, trigger mode, reset/stop/destroy behavior, linked destination |
| Race | Race-start or race-end role, timer behavior, finish order, reset rules |
| Connections | Welded objects, axle parent/child, piston target, anchor status |

For a Start Zone, the inspector must include **maximum marble spawn**, **marble spawn speed**, spawn interval, spawn direction, and the selected marble template. For a Piston, the inspector must include target object, axis, travel distance, movement speed, direction, loop mode, delay, easing, and whether it operates only during Play mode.

## 7. Weld and anchor rules

The revised connection rules are strict.

> **Welds cannot weld an object to the background. Only Anchors can attach an object to the background.**

A Weld joins one object to another object. It is valid when the user selects or connects two scene objects. If a part is simply placed on top of the background, it is not automatically welded. It remains independent and may move if its layer and physics settings allow movement.

An Anchor attaches an object to the background. Anchors are the only way to make a movable object fixed to the world. When an anchored object is moved, the editor should show a small anchor icon and the object should no longer respond to gravity or external forces unless the anchor is disabled.

The editor must reject a weld-to-background operation with an explanatory message: **“Welds connect objects to objects. Use Anchor to attach this object to the background.”**

Welded objects inherit the combined motion of the connected assembly. If a Layer 2 square is welded to another Layer 2 object, the group behaves as one dynamic body. If an object is anchored, its connected assembly becomes fixed unless the connection graph explicitly permits a rotating axle or piston joint.

## 8. Axles and pistons

An Axle is a rotational joint. The user drags the axle handle onto the top of an object and connects the lower end to the object or assembly underneath. The editor displays a vertical connector preview before release. When the simulation plays, the axle rotates around its selected pivot.

Axle settings include rotation speed, direction, torque, angle limits, oscillation mode, loop mode, start angle, and whether the axle transfers rotation to all welded descendants. The axle must not automatically weld objects; it creates a rotational relationship only.

A Piston is a linear motion controller. The user drags it onto a block, and the targeted block receives a highlighted outline labeled **Piston Target**. Right-clicking the piston opens its settings panel. The piston moves the target along a selected axis and can operate continuously, ping-pong, once, or when triggered by a sensor.

## 9. Simulation modes

The top bar has three primary states: **Edit**, **Play**, and **Paused**. In Edit mode, objects can be placed and transformed. In Play mode, dynamic objects simulate and controls such as belts, axles, pistons, zones, teleporters, and race timers operate. In Paused mode, the current physics state is frozen so the user can inspect objects and settings.

The Reset button returns the scene to its saved or initial edit-state transforms, clears spawned marbles, resets zone states, resets race timing, and restores mechanism state. A separate **Reset to Last Save** option should be available in the project menu.

The simulator should show a race HUD only when a Race Start and Race End exist. It may display elapsed time, marble count, finished count, and finishing order. If a scene has a Start Zone but no Race Start, it remains a marble simulation without a race timer.

## 10. Save, load, and accounts

Users must be able to create an account with a username and password without email verification. If the username already exists, registration must stop and show: **“That username already exists. Please sign in or choose another username.”**

The account flow consists of Sign Up, Sign In, Sign Out, and Dashboard. After signing in, the user can access only their own saved marble runs. The dashboard displays saved runs as cards with run name, last updated time, thumbnail, object count, and actions for Open, Duplicate, Rename, and Delete.

Deleting a marble run requires a confirmation dialog. The dialog must name the run and provide Cancel and Delete permanently controls. Loading a run opens the editor with the complete saved state restored.

For a real deployment, passwords must never be stored as plain text. The JavaScript client should submit credentials to a server endpoint over HTTPS, and the server should store a salted password hash and issue a secure session. The no-verification requirement means no email or phone confirmation is required; it does not mean that password storage can be insecure.

## 11. Saved run data model

A saved run should serialize the scene into JSON similar to the following structure:

```js
{
  "id": "run_123",
  "ownerId": "user_456",
  "name": "First Spiral Run",
  "version": 1,
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-01T00:00:00.000Z",
  "settings": {
    "gravity": { "x": 0, "y": 980 },
    "gridSize": 16,
    "simulationSpeed": 1
  },
  "objects": [
    {
      "id": "obj_1",
      "type": "wall",
      "layer": 1,
      "transform": { "x": 320, "y": 240, "rotation": 0, "scaleX": 2, "scaleY": 1 },
      "physics": { "bodyType": "static", "mass": 1, "friction": 0.6, "restitution": 0.2 },
      "connections": []
    }
  ],
  "connections": [],
  "zones": [],
  "race": {
    "raceStartId": null,
    "raceEndId": null
  }
}
```

The `layer` field is mandatory for every object. The loader must validate layer values, connection references, object IDs, transforms, and zone references before opening a run. Invalid or unsupported data should produce a recoverable warning rather than crashing the editor.

## 12. HTML structure

The initial HTML document should be organized into semantic application regions:

```html
<body>
  <header id="topbar"></header>
  <main class="app-shell">
    <aside id="left-sidebar" aria-label="Toolbox and layers"></aside>
    <section id="workspace" aria-label="Marble run canvas">
      <canvas id="simulation-canvas"></canvas>
      <div id="canvas-overlay"></div>
    </section>
    <aside id="right-sidebar" aria-label="Tools and object inspector"></aside>
  </main>
  <footer id="statusbar"></footer>
  <dialog id="auth-dialog"></dialog>
  <dialog id="confirm-delete-dialog"></dialog>
</body>
```

The canvas may use the HTML Canvas API for the physics scene, while normal HTML elements handle controls and panels. A DOM overlay can render selection handles, labels, and accessible interaction affordances above the canvas.

## 13. CSS visual direction

The visual style should be dark, clean, and technical without becoming sterile. Use a charcoal application shell, deep navy canvas, light gray typography, and restrained accent colors for the three layers: amber for Layer 1, violet for Layer 2, and cyan for Layer 3. Objects should use subtle shadows, rounded panels, clear focus states, and compact spacing.

The canvas grid should be low-contrast so it helps alignment without overpowering the run. Layer badges, collision previews, anchor icons, weld lines, axle pivots, and piston targets must remain legible during both edit and play modes. CSS custom properties should centralize theme values, spacing, panel widths, and layer colors.

## 14. JavaScript architecture

Use modular JavaScript rather than one large script. The recommended modules are:

| Module | Responsibility |
|---|---|
| `app.js` | Application startup and mode switching |
| `state.js` | Central scene, selection, layer, account, and UI state |
| `canvas.js` | Pan, zoom, pointer coordinates, grid, rendering |
| `toolbox.js` | Toolbox tabs, drag previews, object creation |
| `selection.js` | Selection, transform handles, multi-step pointer interactions |
| `inspector.js` | Context menus, right-click settings, property updates |
| `layers.js` | Layer selection, visibility, locking, and layer rules |
| `physics.js` | Physics bodies, collision filters, contacts, forces, and reset |
| `connections.js` | Welds, anchors, axles, pistons, and connection validation |
| `zones.js` | Start, end, race, sensor, and teleporter behavior |
| `persistence.js` | Serialize, save, load, rename, duplicate, and delete runs |
| `auth.js` | Sign up, sign in, session state, and sign out |
| `dashboard.js` | Saved-run cards and account dashboard actions |
| `history.js` | Undo and redo snapshots |

The central state should be the single source of truth. UI panels dispatch actions such as `CREATE_OBJECT`, `SET_LAYER`, `UPDATE_TRANSFORM`, `CREATE_WELD`, `CREATE_ANCHOR`, `SET_PISTON_TARGET`, `SAVE_RUN`, and `LOAD_RUN`. Rendering and physics synchronization then react to the updated state.

## 15. Validation and safeguards

The editor should prevent invalid actions instead of silently producing broken scenes. It must reject a weld that targets the background, warn when a piston has no target, warn when a Start Zone has no marble template, and show a clear message when a Race End exists without a Race Start.

Before saving, the application should validate that every object has a unique ID, a valid layer, a supported type, finite transform values, and valid connection references. The save button should remain available even when warnings exist, but fatal validation errors should block saving until corrected.

## 16. Recommended implementation order

| Phase | Deliverable |
|---|---|
| 1 | HTML shell, CSS theme, top bar, three-column editor, and empty canvas |
| 2 | Toolbox tabs, layer selector, drag-and-drop object placement, selection, move, rotate, and non-uniform scale |
| 3 | Object model, layer-aware collision filters, marble spawning, walls, ramps, and Play/Pause/Reset |
| 4 | Right-click inspector, Start Zone, End Zone, Race Start, Race End, and teleporter behavior |
| 5 | Layer 3 functions: belt, booster, fan, bumper, and sensor |
| 6 | Weld, Anchor, Axle, and Piston systems with validation and inspector settings |
| 7 | Account screens, secure username/password authentication, dashboard, and run ownership |
| 8 | Save/load/rename/duplicate/delete, thumbnails, validation, undo/redo, polish, and testing |

## 17. Acceptance criteria

The first complete version is successful when a user can register with a unique username and password, sign in without verification, open a personal dashboard, create a marble run, drag objects from Parts, Zones, and Functions, choose the active layer, place a Layer 2 square that behaves as a marble-like dynamic object, place Layer 1 walls that collide with Layer 2, place Layer 3 belts that affect Layer 2 but ignore Layer 1, and edit object settings through right-click.

It must also be possible to configure a Start Zone with maximum marble spawn and marble spawn speed, define Race Start and Race End, connect an axle to rotate a supported object, use a piston to move a selected block, weld objects together, anchor an object to the background, and receive an error when attempting to use a weld on the background. Finally, the user must be able to save the run, sign out, sign back in, load the run later, and delete it from the dashboard.

## 18. Product summary

**Marble Run Simulator** should be built as an HTML/CSS/JavaScript application with a true editor-style workflow. The critical design principle is that layers define physical behavior: Layer 1 is the structural run, Layer 2 is the marble-like dynamic layer, and Layer 3 contains mechanisms that interact with marbles without colliding with the main structure. Welds connect objects only, while Anchors attach objects to the background. Every object remains editable through the right-click inspector, and every complete run is saved as owned project data accessible from the user dashboard.

### References

No external references were required for this product blueprint; the specification is based on the requested behavior and product requirements.
