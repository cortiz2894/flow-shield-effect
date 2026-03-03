# Force Shield VFX

A real-time force shield effect built with React Three Fiber, Three.js, and custom GLSL shaders.
This repository is a free open-source resource for the creative development community.

It includes a fully interactive **3D Playground** to explore every parameter of the shield in real time — hex grid, hit impacts, life system, reveal animation, bloom, and more.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-0.182-black?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

---

https://github.com/user-attachments/assets/568f9ea0-542c-4ffd-883d-998d49e8dbbb

---

## ✨ What is this?

**Force Shield VFX** is a production-quality WebGL shield effect built entirely with custom vertex and fragment shaders.
It is designed as a learning resource and a starting point for similar VFX in interactive 3D projects.

Key highlights:

- Fully parametric — every visual property exposed via GUI
- Written in clean, well-commented GLSL
- Organized codebase: shaders, controls, and constants are split into separate files
- Two ready-to-use scene presets (Default and Droideka)
- Zero external shader libraries — everything is hand-written

---

## 🛡 Shield Features

### Visual
- **Hex grid** — tri-planar projection with cube-face selection and seam fade
- **Fresnel glow** — edge highlight driven by view angle
- **Flow noise** — animated surface disturbance using layered simplex noise
- **Cell flash** — per-hex random flicker
- **Bottom fade** — configurable gradient that dissolves the shield toward the ground
- **Life color** — shield shifts from its base color to red as health depletes

### Hit System
- **Ring buffer** — up to 6 simultaneous hit impacts tracked in parallel
- **Expanding ring** — noisy geodesic wavefront that radiates from the impact point
- **Hex highlight zone** — cells near the impact flash on contact
- **Life damage** — each hit reduces shield health by a configurable percentage
- **Reset** — one-click life restore via GUI

### Reveal Animation
- **Noise-based dissolve** — shield materializes and dematerializes through a simplex noise mask
- **Edge glow** — emissive border traces the dissolve front
- **Manual mode** — scrub the reveal progress manually via slider

### Post-processing
- **Bloom** — luminance-threshold bloom with mipmap blur
- **Film noise** — configurable grain with blend mode and opacity controls

---

## 🎮 3D Playground

A built-in development environment for exploring the effect in context.

### Scene Controls
- Orbit camera with auto-rotate, damping, and FOV
- Real-time ambient and directional light manipulation
- HDRI environment with background blur and intensity
- Infinite grid floor with reflective plane
- GLB model import for custom scene compositions

### Presets
| Preset | Description |
|--------|-------------|
| **Default** | Floating shield sphere in a neutral scene |
| **Droideka** | Shield wrapped around a Star Wars Droideka model |

Switching presets instantly applies a curated set of shader, lighting, and scene values.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16.1 (App Router)
- **3D / WebGL:** Three.js, React Three Fiber, Drei
- **Shaders:** Custom GLSL (vertex + fragment)
- **Post-processing:** `@react-three/postprocessing`, `postprocessing`
- **GUI Controls:** Leva
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/cortiz2894/shield-vfx.git

# Navigate to the project
cd shield-vfx

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the effect.

---

## 👨‍💻 Author

**Christian Ortiz** - Creative Developer

## 🔗 Connect with me

- **Portfolio:** [cortiz.dev](https://cortiz.dev)
- **YouTube:** [@cortizdev](https://youtube.com/@cortizdev)
- **X (Twitter):** [@cortiz2894](https://twitter.com/cortiz2894)
- **LinkedIn:** [Christian Daniel Ortiz](https://linkedin.com/in/christian-daniel-ortiz)

## 📬 Contact

For inquiries, collaborations or questions: **cortiz2894@gmail.com**

---

⭐ If you found this useful, consider subscribing to my [YouTube channel](https://youtube.com/@cortizdev) for more creative development content!
