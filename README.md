# ArchFlow AI Studio (Workflow)

> **Architectural AI Workflows for Real-World Practice**  
> Inspirado en el desglose de ingeniería inversa del video de [*Show It Better*: "3 AI workflows I actually use as an Architect"](https://www.youtube.com/watch?v=lEfSoR5JCaQ).

![ArchFlow Studio](https://img.shields.io/badge/Architecture-AI%20Workflows-3b82f6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)
![Status](https://img.shields.io/badge/Deploy-GitHub%20Pages%20Ready-10b981?style=for-the-badge)

---

## 🏛️ Los 3 Flujos de Trabajo Implementados

### 1. Google Earth 3D ➔ Toma Aérea de Dron (Photomatch Contextual)
* **Problema:** Modelar todo el entorno urbano, vegetación y topografía en software BIM (Revit/Rhino) toma días o semanas.
* **Solución IA:** Se toma una captura aérea de Google Earth 3D en la perspectiva deseada, se monta la volumetría 3D y se sintetiza con IA (Midjourney/DALL-E con `Image-to-Image`).
* **Control en la App:**
  - Reposicionamiento arrastrable del edificio sobre la topografía.
  - Control de escala, sombras de contacto proyectadas y neblina atmosférica.
  - Generador automático de prompts fotorrealistas de 24mm con formato `--ar 16:9 --style raw`.

### 2. Timelapse de Transición Día a Noche (Frame Interpolation)
* **Problema:** Renderizar animaciones cuadro a cuadro de cambios solares requiere granjas de renderizado costosas.
* **Solución IA:** Se generan dos fotogramas con cámara 100% fija: **Frame A (Día)** y **Frame B (Noche con iluminación 3000K)**. Se utiliza interpolación de video (Runway Gen-3, Kling o Luma Dream Machine) con movimiento de cámara en `0`.
* **Control en la App:**
  - Modo Split-screen interactivo (cortina antes / después).
  - Reproductor interactivo de ciclo solar 24h (mañana, mediodía cenital, golden hour y noche azulada con iluminación artificial activada).

### 3. Micro-Enhancement & Texturizado Guiado (Precision Inpainting)
* **Problema:** Los motores generativos sin control deforman la estructura, alteran las cotas y desalinean las carpinterías arquitectónicas.
* **Solución IA:** Utilizar escaladores y modelos de difusión (Magnific AI, Krea, ComfyUI) limitando estrictamente el slider de creatividad a niveles entre 1 y 3.
* **Control en la App:**
  - **Medidor de Zona Segura:** Indicador visual (Seguro 1-3, Moderado 4-6, Peligro de Alucinación 7-10).
  - Controles de micro-bump (porosidad del hormigón, vetas de madera, reflejos Fresnel en vidrios).
  - **Lente Inspector 4X:** Lupa interactiva que permite hacer zoom sobre el render para inspeccionar la calidad del micro-detalle.

---

## 🚀 Despliegue en GitHub Pages

Este proyecto está construido con estándares web modernos sin dependencias externas ni compilación previa. Se ejecuta directamente en el navegador.

1. Activa **GitHub Pages** en tu repositorio:
   - Ve a `Settings` > `Pages`.
   - Selecciona `Deploy from a branch` y elige `main` / `root`.
   - Guarda y tu sitio estará en vivo en:
     `https://alejagoguti-cpu.github.io/workflow/`

---

## 💻 Desarrollo Local

Simplemente abre el archivo `index.html` en cualquier navegador web moderno, o inicia un servidor local rápido:

```bash
# Con Python
python -m http.server 8080

# O con npx serve
npx serve .
```
