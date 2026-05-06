import { Component, signal, OnInit, OnDestroy, AfterViewInit, NgZone, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { TextSlider } from './animations/text-slider/text-slider';
import { NocteCirclesComponent } from './animations/nocte-circles/nocte-circles.component';
import { CustomCursor } from './animations/custom-cursor/custom-cursor';
import { ParticlesCircle } from './animations/particles/particlesCircle';
import { WhatIBuildContentComponent } from './components/what-i-build-content/what-i-build-content.component';
import { Ascii3dComponent } from './components/ascii-3d/ascii-3d.component';
import { ProcessSectionComponent } from './components/process-section/process-section.component';
import { ContactSectionComponent } from './components/contact-section/contact-section.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { LanguageService } from './services/language.service';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Color Theme System ───────────────────────────────────────────────────────

interface SectionColorConfig {
  selector: string;
  theme: 'light' | 'dark';
  /**
   * Décale le point de déclenchement de la transition.
   * Exprimé en fraction de la hauteur viewport (ex: 0.2 = +20vh, -0.2 = -20vh).
   */
  offset: number;
  /**
   * Largeur de la zone de fondu en pixels pour cette transition spécifique.
   * Si omis, utilise la valeur globale TRANSITION_PX.
   */
  transitionPx?: number;
}

interface ColorStop {
  scrollY: number;
  bg: [number, number, number];
  text: [number, number, number];
}

const THEMES = {
  light: { bg: [238, 238, 238] as [number, number, number], text: [28, 28, 28]   as [number, number, number] },
  dark:  { bg: [28,  28,  28]  as [number, number, number], text: [238, 238, 238] as [number, number, number] },
};

/** Largeur de la zone de fondu entre deux thèmes (en pixels). */
const TRANSITION_PX = 150;

/**
 * Configuration des transitions de couleur par section.
 *
 * - `selector`     : sélecteur CSS de la section
 * - `theme`        : thème cible quand la section est atteinte
 * - `offset`       : décalage en vh (ex: 0.2 → déclenche 20vh après le haut de la section)
 * - `transitionPx` : (optionnel) largeur du fondu en px, remplace TRANSITION_PX pour cette entrée
 */
const SECTION_COLOR_CONFIG: SectionColorConfig[] = [
  { selector: '#section-what-i-build', theme: 'dark',  offset: 0 },
  { selector: '#section-about-me',     theme: 'light', offset: -0.5 },
  { selector: '#section-my-work',      theme: 'dark',  offset: -0.5 },
  // { selector: '#section-process',      theme: 'light', offset: 0 },
  { selector: '#section-let-talk',     theme: 'light',  offset: -0.5 },
];

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TranslocoPipe,
    TextSlider,
    NocteCirclesComponent,
    CustomCursor,
    ParticlesCircle,
    WhatIBuildContentComponent,
    Ascii3dComponent,
    ProcessSectionComponent,
    ContactSectionComponent,
    LanguageSwitcherComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected readonly title = signal('Nocte_Syndikate');
  private lenis: Lenis | null = null;
  private _lastBg = '';
  private _lastText = '';
  private colorStops: ColorStop[] = [];
  private gsapTickerCallback!: (time: number) => void;
  private languageService = inject(LanguageService);

  constructor(private zone: NgZone) {}

  /**
   * Calcule les stops de couleur depuis les positions DOM réelles des sections.
   * Doit être appelé après que GSAP a mis en place ses ScrollTriggers (ngAfterViewInit)
   * et à chaque resize via l'événement 'refresh' de ScrollTrigger.
   */
  private buildColorStops(): void {
    const vh = window.innerHeight;
    const stops: ColorStop[] = [];

    // Point de départ : clair
    stops.push({ scrollY: 0, ...THEMES.light });

    // Couleur fixe pendant la phase "move/fade", transition uniquement pendant le zoom
    const heroST = ScrollTrigger.getById('hero-pin');
    const pinEnd = heroST?.end ?? (window.innerWidth <= 768 ? 800 : 2000);
    const zoomStart = pinEnd * 0.5; // move et zoom ont la même durée → zoom à 50%
    stops.push({ scrollY: zoomStart, ...THEMES.light });
    stops.push({ scrollY: pinEnd,   ...THEMES.dark  });

    // Transitions basées sur les positions DOM de chaque section
    let prevTheme: 'light' | 'dark' = 'dark';

    for (const config of SECTION_COLOR_CONFIG) {
      const el = document.querySelector<HTMLElement>(config.selector);
      if (!el) continue;

      // Position absolue dans le document (indépendante du scroll courant)
      const triggerY = el.getBoundingClientRect().top + window.scrollY + config.offset * vh;
      const half = (config.transitionPx ?? TRANSITION_PX) / 2;

      if (config.theme !== prevTheme) {
        stops.push({ scrollY: Math.max(0, triggerY - half), ...THEMES[prevTheme]    });
        stops.push({ scrollY: triggerY + half,              ...THEMES[config.theme] });
        prevTheme = config.theme;
      }
    }

    // Maintien du dernier thème jusqu'en bas de page
    stops.push({ scrollY: document.body.scrollHeight + 1000, ...THEMES[prevTheme] });

    this.colorStops = stops.sort((a, b) => a.scrollY - b.scrollY);
  }

  private updateColors(scrollY: number): void {
    const stops = this.colorStops;
    if (!stops.length) return;

    let start = stops[0];
    let end   = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (scrollY >= stops[i].scrollY && scrollY <= stops[i + 1].scrollY) {
        start = stops[i];
        end   = stops[i + 1];
        break;
      }
    }

    if (scrollY <= stops[0].scrollY)                      { start = end = stops[0]; }
    else if (scrollY >= stops[stops.length - 1].scrollY)  { start = end = stops[stops.length - 1]; }

    const progress = end.scrollY > start.scrollY
      ? (scrollY - start.scrollY) / (end.scrollY - start.scrollY)
      : 0;

    const lerp = (s: number, e: number, t: number) => Math.round(s + (e - s) * t);

    const bgR  = lerp(start.bg[0],   end.bg[0],   progress);
    const bgG  = lerp(start.bg[1],   end.bg[1],   progress);
    const bgB  = lerp(start.bg[2],   end.bg[2],   progress);
    const txtR = lerp(start.text[0], end.text[0], progress);
    const txtG = lerp(start.text[1], end.text[1], progress);
    const txtB = lerp(start.text[2], end.text[2], progress);

    const bg   = `rgb(${bgR}, ${bgG}, ${bgB})`;
    const text = `rgb(${txtR}, ${txtG}, ${txtB})`;

    if (this._lastBg !== bg) {
      document.documentElement.style.setProperty('--background-color',     bg);
      document.documentElement.style.setProperty('--background-color-rgb', `${bgR}, ${bgG}, ${bgB}`);
      this._lastBg = bg;
    }
    if (this._lastText !== text) {
      document.documentElement.style.setProperty('--primary-color',     text);
      document.documentElement.style.setProperty('--primary-color-rgb', `${txtR}, ${txtG}, ${txtB}`);
      this._lastText = text;
    }
  }

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({ duration: 1.2, smoothWheel: true, lerp: 0.09 });

      let backToTopBtn: HTMLElement | null = null;
      let heroLangEl: HTMLElement | null = null;
      let stickyLangEl: HTMLElement | null = null;

      let rafColorPending = false;
      let pendingScroll = 0;
      this.lenis.on('scroll', (e: any) => {
        pendingScroll = e.scroll;
        if (!rafColorPending) {
          rafColorPending = true;
          requestAnimationFrame(() => {
            this.updateColors(pendingScroll);
            rafColorPending = false;
          });
        }
        ScrollTrigger.update();

        if (!backToTopBtn) backToTopBtn = document.getElementById('back-to-top');
        if (!heroLangEl)   heroLangEl   = document.getElementById('lang-hero');
        if (!stickyLangEl) stickyLangEl = document.getElementById('lang-sticky');

        const isVisible = e.scroll > window.innerHeight * 1.5;
        backToTopBtn?.classList.toggle('visible', isVisible);
        heroLangEl?.classList.toggle('hidden', isVisible);
        stickyLangEl?.classList.toggle('visible', isVisible);
      });

      this.gsapTickerCallback = (time: number) => this.lenis!.raf(time * 1000);
      gsap.ticker.add(this.gsapTickerCallback);
      gsap.ticker.lagSmoothing(0);
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const circleContainer = document.querySelector('.nocte-circles-container') as HTMLElement;
      const mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
        const setInitialX = () => {
          if (circleContainer) {
            const x = window.innerWidth / 2 - 0.05 * circleContainer.offsetWidth;
            gsap.set(circleContainer, { x, opacity: 1 });
            gsap.set('.hero-section-global', { xPercent: 0, opacity: 1 });
          }
        };
        setInitialX();
        ScrollTrigger.addEventListener('refreshInit', setInitialX);

        gsap.timeline({
          scrollTrigger: {
            id: 'hero-pin',
            trigger: '.hero-pin-container',
            start: 'top top',
            end: '+=2000',
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        })
          .to('.hero-section-global',      { xPercent: -120, opacity: 0, ease: 'power1.inOut' }, 'move')
          .to('.nocte-circles-container',  { x: 0, scale: 1.5, ease: 'power1.inOut' },           'move')
          .to('.nocte-circles-container',  { scale: 30, ease: 'power3.in' },                      'zoom');

        return () => ScrollTrigger.removeEventListener('refreshInit', setInitialX);
      });

      mm.add('(max-width: 768px)', () => {
        gsap.set(circleContainer, { clearProps: 'all' });
        gsap.set('.hero-section-global', { clearProps: 'all' });
        gsap.set(circleContainer, {
          left: '50%', top: '50%', xPercent: -50, yPercent: -50,
          margin: 0, x: 0, y: 0, opacity: 0, scale: 1,
        });
        gsap.set('.hero-section-global', { xPercent: 0, opacity: 1 });

        gsap.timeline({
          scrollTrigger: {
            id: 'hero-pin',
            trigger: '.hero-pin-container',
            start: 'top top',
            end: '+=800',
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        })
          .to('.hero-section-global',     { opacity: 0, ease: 'power1.inOut' }, 'fade')
          .to('.nocte-circles-container', { opacity: 1, ease: 'power1.inOut' }, 'fade')
          .to('.nocte-circles-container', { scale: 45, ease: 'power3.in' },     'zoom');
      });

      // Construit les stops après que GSAP a mis en place les ScrollTriggers
      ScrollTrigger.refresh();
      this.buildColorStops();
      this.updateColors(window.scrollY);

      // Reconstruit automatiquement à chaque resize (GSAP émet 'refresh' après un resize)
      ScrollTrigger.addEventListener('refresh', () => {
        this.buildColorStops();
        this.updateColors(window.scrollY);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.gsapTickerCallback) gsap.ticker.remove(this.gsapTickerCallback);
    ScrollTrigger.getAll().forEach(t => t.kill());
    this.lenis?.destroy();
    this.lenis = null;
  }

  scrollToTop(): void {
    if (this.lenis) {
      this.lenis.scrollTo(0, { duration: 1.5, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollToSection(selector: string): void {
    if (this.lenis) {
      this.lenis.scrollTo(selector, { duration: 1.5 });
    } else {
      const el = document.querySelector(selector);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
