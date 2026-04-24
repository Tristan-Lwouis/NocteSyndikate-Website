import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TextSlider } from "./animations/text-slider/text-slider";
import { NocteCirclesComponent } from "./animations/nocte-circles/nocte-circles.component";
import { CustomCursor } from "./animations/custom-cursor/custom-cursor";
import { ParticlesCircle } from "./animations/particles/particlesCircle";
import { WhatIBuildContentComponent } from "./components/what-i-build-content/what-i-build-content.component";
import Lenis from "lenis"; // Smooth scroll

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TextSlider, NocteCirclesComponent, CustomCursor, ParticlesCircle, WhatIBuildContentComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App implements OnInit {
  protected readonly title = signal('Nocte_Syndikate');

  ngOnInit(): void {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      lerp: 0.08
    });

    // Étapes de couleurs de BG
    const colorStops = [
      { vh: 0, bg: [238, 238, 238], text: [28, 28, 28] },     // 0vh (début, clair)
      // { vh: 1, bg: [28, 28, 28], text: [238, 238, 238] },     // 100vh (sombre)
      // { vh: 3.7, bg: [28, 28, 28], text: [238, 238, 238] },   // Reste sombre jusqu'à 370vh
      // { vh: 4, bg: [238, 238, 238], text: [28, 28, 28] }      // 400vh (retour au clair)
    ];

    const updateColors = (scrollY: number) => {
      const vh = window.innerHeight;
      const currentVh = scrollY / vh;
      
      let start = colorStops[0];
      let end = colorStops[colorStops.length - 1];

      for (let i = 0; i < colorStops.length - 1; i++) {
        if (currentVh >= colorStops[i].vh && currentVh <= colorStops[i+1].vh) {
          start = colorStops[i];
          end = colorStops[i+1];
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

      const currentBg = `rgb(${lerp(start.bg[0], end.bg[0], progress)}, ${lerp(start.bg[1], end.bg[1], progress)}, ${lerp(start.bg[2], end.bg[2], progress)})`;
      const currentText = `rgb(${lerp(start.text[0], end.text[0], progress)}, ${lerp(start.text[1], end.text[1], progress)}, ${lerp(start.text[2], end.text[2], progress)})`;

      document.documentElement.style.setProperty('--background-color', currentBg);
      document.documentElement.style.setProperty('--primary-color', currentText);
    };

    lenis.on('scroll', (e: any) => {
      updateColors(e.scroll);
    });

    // Initialisation directe pour que les couleurs soient déjà définies avant le premier scroll
    updateColors(window.scrollY);

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }
}