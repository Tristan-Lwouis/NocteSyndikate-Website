import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';

@Component({
  selector: 'app-what-i-build-content',
  standalone: true,
  imports: [],
  templateUrl: './what-i-build-content.html',
  styleUrl: './what-i-build-content.scss'
})
export class WhatIBuildContentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('stickyContainer') stickyContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('cardsContainer') cardsContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('glyphsBackground') glyphsBackground!: ElementRef<HTMLDivElement>;

  private scrollHandler = () => this.onScroll();

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.onScroll(); // État initial
    });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  private onScroll() {
    const wrapper = this.scrollWrapper.nativeElement;
    const cards = this.cardsContainer.nativeElement;
    
    // Le header est utilisé pour connaître la hauteur de l'offset initial
    const header = wrapper.querySelector('.sticky-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;

    const wrapperRect = wrapper.getBoundingClientRect();
    
    // Le conteneur commence à scroller horizontalement quand il devient sticky, 
    // c'est à dire quand il atteint 'top: 25vh'
    const stickyTop = window.innerHeight * 0.25;

    // Calcul exact du moment où le sticky-container commence et arrête de coller
    const startStickingWrapperTop = stickyTop - headerHeight;
    const stickyHeight = window.innerHeight * 0.50; // 50vh
    const stopStickingWrapperTop = stickyTop + stickyHeight - wrapperRect.height;

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
      this.glyphsBackground.nativeElement.style.transform = `translate3d(0, ${-progress * 50}vh, 0)`;
    }
  }
}
