import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-what-i-build-content',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './what-i-build-content.html',
  styleUrl: './what-i-build-content.scss'
})
export class WhatIBuildContentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('stickyContainer') stickyContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('cardsContainer') cardsContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('glyphsBackground') glyphsBackground!: ElementRef<HTMLDivElement>;

  private scrollHandler = () => this.onScroll();
  private tiltCleanups: (() => void)[] = [];

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.onScroll(); // État initial
      this.initTilt();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollHandler);
    // Nettoyage de tous les listeners de tilt
    this.tiltCleanups.forEach(fn => fn());
  }

  private initTilt() {
    const cards = this.cardsContainer.nativeElement.querySelectorAll<HTMLElement>('.card');
    const MAX_TILT    = 3;     // degrés max
    const PERSPECTIVE = '300px';
    const DAMPING     = 0.1;  // plus petit = plus lent/fluide (0.05 très doux, 0.15 réactif)

    cards.forEach(card => {
      // Valeurs courantes (lissées) et cibles
      let currentRotX = 0, currentRotY = 0, currentScale = 1;
      let targetRotX  = 0, targetRotY  = 0, targetScale  = 1;
      let rafId: number | null = null;

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      const animate = () => {
        // Interpolation vers la cible
        currentRotX  = lerp(currentRotX,  targetRotX,  DAMPING);
        currentRotY  = lerp(currentRotY,  targetRotY,  DAMPING);
        currentScale = lerp(currentScale, targetScale, DAMPING);

        card.style.transform = `perspective(${PERSPECTIVE}) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) scale3d(${currentScale}, ${currentScale}, ${currentScale})`;

        // On continue la boucle tant qu'on n'est pas arrivé à destination
        const diffX     = Math.abs(currentRotX  - targetRotX);
        const diffY     = Math.abs(currentRotY  - targetRotY);
        const diffScale = Math.abs(currentScale - targetScale);
        if (diffX > 0.01 || diffY > 0.01 || diffScale > 0.001) {
          rafId = requestAnimationFrame(animate);
        } else {
          rafId = null;
          // Snap final propre
          currentRotX  = targetRotX;
          currentRotY  = targetRotY;
          currentScale = targetScale;
        }
      };

      const startLoop = () => {
        if (rafId === null) rafId = requestAnimationFrame(animate);
      };

      const onEnter = () => {
        targetScale = 1.04;
        startLoop();
      };

      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        targetRotY =  x * MAX_TILT * 2;
        targetRotX = -y * MAX_TILT * 2;
        startLoop();
      };

      const onLeave = () => {
        targetRotX  = 0;
        targetRotY  = 0;
        targetScale = 1;
        startLoop();
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      this.tiltCleanups.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
        if (rafId !== null) cancelAnimationFrame(rafId);
      });
    });
  }

  private onScroll() {
    const wrapper = this.scrollWrapper.nativeElement;
    const cards = this.cardsContainer.nativeElement;
    
    // Le header est utilisé pour connaître la hauteur de l'offset initial - 200
    const header = wrapper.querySelector('.sticky-header');
    const headerHeight = header ? header.getBoundingClientRect().height - 200 : 0;

    const wrapperRect = wrapper.getBoundingClientRect();
    
    // Le conteneur commence à scroller horizontalement quand il devient sticky, 
    // c'est à dire quand il atteint 'top: 25vh'
    const stickyTop = window.innerHeight * 0.25;

    // Calcul exact du moment où le sticky-container commence et arrête de coller
    const startStickingWrapperTop = stickyTop - headerHeight;
    const stickyHeight = window.innerHeight * 0.50; // 50vh
    const stopStickingWrapperTop = stickyTop + stickyHeight - wrapperRect.height ;

    // La distance réelle sur laquelle le scroll horizontal doit s'opérer
    const scrollableDistance = startStickingWrapperTop - stopStickingWrapperTop;

    let progress = 0;
    if (scrollableDistance > 0) {
      progress = (startStickingWrapperTop - wrapperRect.top) / scrollableDistance;
    }

    // On s'assure que progress reste entre 0 et 1
    progress = Math.max(0, Math.min(1, progress));

    // Distance totale à déplacer horizontalement
    const maxTranslate = cards.scrollWidth - window.innerWidth;
    
    if (maxTranslate > 0) {
      cards.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
    }

    // Effet parallax sur le background :
    // Le background fait 150vh, donc on a 50vh de "réserve" en bas.
    // On le fait remonter de 0 à -50vh en fonction de la progression du scroll.
    if (this.glyphsBackground) {
      this.glyphsBackground.nativeElement.style.transform =
       `translate3d(0, ${-progress * 50}vh, 0) 
        rotate(${-progress * 25}deg) 
        scale(${1.3 - (progress * 0.3)})`;
    }
  }
}
