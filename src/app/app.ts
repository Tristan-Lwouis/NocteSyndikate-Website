import { Component, signal, OnInit, OnDestroy, AfterViewInit, NgZone, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
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
  private gsapTickerCallback!: (time: number) => void;
  private languageService = inject(LanguageService);

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true,
        lerp: 0.09,
      });

      const colorStops = [
        { vh: 0, bg: [238, 238, 238], text: [28, 28, 28] },
        { vh: 1.2, bg: [238, 238, 238], text: [28, 28, 28] },
        { vh: 3, bg: [28, 28, 28], text: [238, 238, 238] },
        { vh: 5.9, bg: [28, 28, 28], text: [238, 238, 238] },
        { vh: 6.3, bg: [238, 238, 238], text: [28, 28, 28] },
        { vh: 7.2, bg: [238, 238, 238], text: [28, 28, 28] },
        { vh: 7.8, bg: [28, 28, 28], text: [238, 238, 238] },
        { vh: 10.5, bg: [28, 28, 28], text: [238, 238, 238] },
        { vh: 11.3, bg: [238, 238, 238], text: [28, 28, 28] },
        { vh: 15.0, bg: [238, 238, 238], text: [28, 28, 28] },
      ];

      const updateColors = (scrollY: number) => {
        const vh = window.innerHeight;
        const currentVh = scrollY / vh;

        let start = colorStops[0];
        let end = colorStops[colorStops.length - 1];

        for (let i = 0; i < colorStops.length - 1; i++) {
          if (currentVh >= colorStops[i].vh && currentVh <= colorStops[i + 1].vh) {
            start = colorStops[i];
            end = colorStops[i + 1];
            break;
          }
        }

        if (currentVh < colorStops[0].vh) {
          start = end = colorStops[0];
        } else if (currentVh > colorStops[colorStops.length - 1].vh) {
          start = end = colorStops[colorStops.length - 1];
        }

        let progress = 0;
        if (end.vh > start.vh) {
          progress = (currentVh - start.vh) / (end.vh - start.vh);
        }

        const lerp = (s: number, e: number, t: number) => Math.round(s + (e - s) * t);

        const bgR = lerp(start.bg[0], end.bg[0], progress);
        const bgG = lerp(start.bg[1], end.bg[1], progress);
        const bgB = lerp(start.bg[2], end.bg[2], progress);
        const txtR = lerp(start.text[0], end.text[0], progress);
        const txtG = lerp(start.text[1], end.text[1], progress);
        const txtB = lerp(start.text[2], end.text[2], progress);

        const currentBg = `rgb(${bgR}, ${bgG}, ${bgB})`;
        const currentText = `rgb(${txtR}, ${txtG}, ${txtB})`;
        const currentBgRgb = `${bgR}, ${bgG}, ${bgB}`;
        const currentTextRgb = `${txtR}, ${txtG}, ${txtB}`;

        if (this._lastBg !== currentBg) {
          document.documentElement.style.setProperty('--background-color', currentBg);
          document.documentElement.style.setProperty('--background-color-rgb', currentBgRgb);
          this._lastBg = currentBg;
        }

        if (this._lastText !== currentText) {
          document.documentElement.style.setProperty('--primary-color', currentText);
          document.documentElement.style.setProperty('--primary-color-rgb', currentTextRgb);
          this._lastText = currentText;
        }
      };

      let rafColorPending = false;
      this.lenis.on('scroll', (e: any) => {
        if (!rafColorPending) {
          rafColorPending = true;
          requestAnimationFrame(() => {
            updateColors(e.scroll);
            rafColorPending = false;
          });
        }
        ScrollTrigger.update();

        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
          if (e.scroll > window.innerHeight * 1.5) {
            backToTopBtn.classList.add('visible');
          } else {
            backToTopBtn.classList.remove('visible');
          }
        }
      });

      updateColors(window.scrollY);

      this.gsapTickerCallback = (time: number) => {
        this.lenis!.raf(time * 1000);
      };
      gsap.ticker.add(this.gsapTickerCallback);
      gsap.ticker.lagSmoothing(0);
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const circleContainer = document.querySelector('.nocte-circles-container') as HTMLElement;

      const setInitialX = () => {
        if (circleContainer) {
          const x = window.innerWidth / 2 - 0.05 * circleContainer.offsetWidth;
          gsap.set(circleContainer, { x });
        }
      };

      setInitialX();
      ScrollTrigger.addEventListener('refreshInit', setInitialX);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero-pin-container',
          start: 'top top',
          end: '+=2000',
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        '.hero-section-global',
        { xPercent: -120, opacity: 0, ease: 'power1.inOut' },
        'move',
      )
        .to(
          '.nocte-circles-container',
          { x: 0, scale: 1.5, ease: 'power1.inOut' },
          'move',
        )
        .to(
          '.nocte-circles-container',
          { scale: 30, ease: 'power3.in' },
          'zoom',
        );
    });
  }

  ngOnDestroy(): void {
    if (this.gsapTickerCallback) {
      gsap.ticker.remove(this.gsapTickerCallback);
    }
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
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
