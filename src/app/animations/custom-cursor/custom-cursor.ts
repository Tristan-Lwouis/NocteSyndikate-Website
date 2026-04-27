import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type ClickBurst = {
  id: number;
  x: number;
  y: number;
  rotation: number;
};

@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-cursor.html',
  styleUrl: './custom-cursor.scss',
})
export class CustomCursor implements OnInit, OnDestroy {

  enabled = true;
  // Angles des rayons du burst (effet comics)
  rayAngles = Array.from({ length: 12 }, (_, i) => i * 30);

  // position "réelle" de la souris
  mouseX = 0;
  mouseY = 0;

  // position "lissée" du curseur (pour effet smooth)
  cursorX = 0;
  cursorY = 0;

  // bursts de clic
  bursts: ClickBurst[] = [];
  private burstId = 0;

  private rafId: number | null = null;

  private cursorEl: HTMLElement | null = null;

  constructor(private zone: NgZone) { }

  ngOnInit(): void {
    // Désactive sur devices tactiles + si l'utilisateur préfère réduire les animations
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.enabled = !(isTouch || reducedMotion);

    if (!this.enabled) return;

    // Cache le curseur natif
    document.documentElement.classList.add('custom-cursor-enabled');

    // Lance la boucle d'animation en dehors d'Angular (perf)
    this.zone.runOutsideAngular(() => {
      const loop = () => {
        // Lerp : suit la souris en douceur
        const ease = 0.22;
        this.cursorX += (this.mouseX - this.cursorX) * ease;
        this.cursorY += (this.mouseY - this.cursorY) * ease;

        // Mise à jour du DOM directement, SANS passer par Angular (évite detectChanges à 60fps)
        if (!this.cursorEl) {
          this.cursorEl = document.querySelector('.cursor-wrapper');
        }
        if (this.cursorEl) {
          this.cursorEl.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;
        }

        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    document.documentElement.classList.remove('custom-cursor-enabled');
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.enabled) return;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (!this.enabled) return;

    // crée un burst "comics"
    const burst: ClickBurst = {
      id: ++this.burstId,
      x: e.clientX,
      y: e.clientY,
      rotation: Math.random() * 360
    };

    this.bursts = [...this.bursts, burst];

    // supprime après l'anim
    window.setTimeout(() => {
      this.bursts = this.bursts.filter(b => b.id !== burst.id);
    }, 240);
  }
}
