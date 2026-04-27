import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input,
} from '@angular/core';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';

@Component({
  selector: 'app-ascii-3d',
  standalone: true,
  imports: [],
  templateUrl: './ascii-3d.component.html',
  styleUrl: './ascii-3d.component.scss',
})
export class Ascii3dComponent implements AfterViewInit, OnDestroy {
  /** Chemin vers le modèle 3D (.glb / .gltf) dans le dossier public/assets */
  @Input() modelPath = 'assets/3d/Crane.glb';

  /** Jeu de caractères ASCII (du plus sombre au plus clair) */
  @Input() asciiCharset = '@#S%?+:, ';

  /** Taille des cellules ASCII — plus petit = plus de détail */
  @Input() asciiResolution = 0.19;

  /** Activer le suivi du curseur */
  @Input() followCursor = true;

  /** Intensité du mouvement flottant */
  @Input() floatIntensity = 0.1;

  /** Scale du modèle 3D (taille normalisée) */
  @Input() modelScale = 2.5;

  /** Couleur des caractères ASCII (CSS color) */
  @Input() charColor = 'rgba(255, 255, 255, 0.92)';

  /** Champ de vision de la caméra en degrés */
  @Input() cameraPerspective = 50;

  /** Police des caractères ASCII */
  @Input() charFont = "'Courier New', monospace";

  /** Graisse des caractères ASCII (CSS font-weight) */
  @Input() charWeight = 'normal';

  @ViewChild('asciiContainer', { static: true })
  private containerRef!: ElementRef<HTMLDivElement>;

  // Three.js core
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private asciiEffect!: AsciiEffect;
  private model: THREE.Group | null = null;
  private modelBaseY = 0; // Position Y après centrage, pour ne pas l'écraser avec le float

  // Animation
  private animationId = 0;
  private clock = new THREE.Clock();

  // Interaction — positions lissées
  private mouse = { x: 0, y: 0 };
  private targetRotation = { x: 0, y: 0 };
  private currentRotation = { x: 0, y: 0 };
  /** Damping / inertie du suivi souris (plus petit = plus fluide) */
  @Input() damping = 0.08;

  // Resize & Visibility
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private isVisible = false;

  // Bound handlers (pour le cleanup)
  private boundMouseMove = (e: MouseEvent) => this.onMouseMove(e);

  constructor(private zone: NgZone) {}

  // ─── Lifecycle ───────────────────────────────────────────────

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initScene();
      this.loadModel();
      this.initListeners();
      this.animate();
    });
  }

  ngOnDestroy(): void {
    // Stop animation
    cancelAnimationFrame(this.animationId);

    // Remove observers
    window.removeEventListener('mousemove', this.boundMouseMove);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    // Dispose Three.js resources
    this.disposeScene();
  }

  // ─── Init ────────────────────────────────────────────────────

  private initScene(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(this.cameraPerspective, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 4);

    // Lighting — assez contrasté pour un bon rendu ASCII
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(4, 4, 5);
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-3, -2, -3);
    this.scene.add(fillLight);

    // WebGL Renderer (caché — sert de source pour l'AsciiEffect)
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(1); // 1 suffit pour l'ASCII
    this.renderer.setClearColor(0x000000, 0); // Fond transparent

    // AsciiEffect
    this.asciiEffect = new AsciiEffect(this.renderer, this.asciiCharset, {
      invert: true,
      resolution: this.asciiResolution,
    });
    this.asciiEffect.setSize(width, height);
    this.asciiEffect.domElement.style.color = this.charColor;
    this.asciiEffect.domElement.style.fontFamily = this.charFont;
    this.asciiEffect.domElement.style.fontWeight = this.charWeight;
    this.asciiEffect.domElement.style.backgroundColor = 'transparent';
    this.asciiEffect.domElement.style.pointerEvents = 'none';

    // Centrer le <pre> généré par AsciiEffect dans son conteneur
    this.asciiEffect.domElement.style.display = 'flex';
    this.asciiEffect.domElement.style.alignItems = 'center';
    this.asciiEffect.domElement.style.justifyContent = 'center';

    // Ajouter au DOM
    container.appendChild(this.asciiEffect.domElement);
  }

  private loadModel(): void {
    const loader = new GLTFLoader();

    loader.load(
      this.modelPath,
      (gltf) => {
        this.model = gltf.scene;

        // Appliquer un matériau uniforme pour un meilleur rendu ASCII
        this.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshPhongMaterial({
              color: 0xffffff,
              flatShading: false,
              shininess: 0,
            });
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });

        // Centrer et ajuster la taille du modèle
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = this.modelScale / maxDim; // Taille normalisée via @Input
        this.model.scale.setScalar(scale);

        // Recalculer le bounding box APRÈS scaling pour un centrage exact
        const scaledBox = new THREE.Box3().setFromObject(this.model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        this.model.position.sub(scaledCenter);
        this.modelBaseY = this.model.position.y; // Sauvegarder la position centrée

        this.scene.add(this.model);
      },
      undefined,
      (error) => {
        console.error('[Ascii3D] Erreur de chargement du modèle :', error);
      },
    );
  }

  // ─── Interaction ─────────────────────────────────────────────

  private initListeners(): void {
    // Mouse tracking
    if (this.followCursor) {
      window.addEventListener('mousemove', this.boundMouseMove, { passive: true });
    }

    // Resize via ResizeObserver (plus performant que window resize)
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.containerRef.nativeElement);

    // IntersectionObserver pour stopper le rendu quand le composant n'est pas visible
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    });
    this.intersectionObserver.observe(this.containerRef.nativeElement);
  }

  private onMouseMove(event: MouseEvent): void {
    // Normaliser entre -1 et 1
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cibles de rotation (amplitude limitée pour un effet subtil)
    this.targetRotation.y = this.mouse.x * 0.6;
    this.targetRotation.x = -this.mouse.y * 0.4;

  }

  private onResize(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.asciiEffect.setSize(width, height);
  }

  // ─── Animation Loop ──────────────────────────────────────────

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.isVisible) return; // Optimisation : on ne calcule/rend rien si ce n'est pas à l'écran

    const elapsed = this.clock.getElapsedTime();

    if (this.model) {
      // Lerp smooth vers la rotation cible (suivi souris avec inertie)
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * this.damping;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * this.damping;

      // Mouvement flottant subtil (sin wave)
      const floatY = Math.sin(elapsed * 0.8) * this.floatIntensity;
      const floatRotZ = Math.sin(elapsed * 0.5) * 0.03;
      const floatRotX = Math.cos(elapsed * 0.6) * 0.02;

      // Appliquer rotations combinées
      this.model.rotation.x = this.currentRotation.x + floatRotX;
      this.model.rotation.y = this.currentRotation.y + floatRotZ;
      this.model.position.y = this.modelBaseY + floatY;
    }

    // Rendu via AsciiEffect
    this.asciiEffect.render(this.scene, this.camera);
  };

  // ─── Cleanup ─────────────────────────────────────────────────

  private disposeScene(): void {
    // Disposer toutes les géométries et matériaux de la scène
    this.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });

    // Disposer le renderer
    this.renderer.dispose();

    // Retirer le DOM de l'AsciiEffect
    const container = this.containerRef.nativeElement;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}
