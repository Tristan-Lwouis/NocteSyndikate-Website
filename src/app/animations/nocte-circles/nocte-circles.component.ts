import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nocte-circles', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nocte-circles.component.html',
  styleUrls: ['./nocte-circles.component.scss']
})
export class NocteCirclesComponent  implements OnInit {
  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {
    const root = getComputedStyle(document.documentElement);
    const container = this.el.nativeElement.querySelector('.circleContainer');

    //Variables de controle de l'animation
    const nbCircles = parseInt(root.getPropertyValue('--nb-circles')) || 7;
    const maxSize = parseFloat(root.getPropertyValue('--max-size')) || 100;
    const scaleStep = parseFloat(root.getPropertyValue('--scale-step')) || 0.8;
    const durationBase = parseFloat(root.getPropertyValue('--duration-base')) || 100;
    const durationStep = parseFloat(root.getPropertyValue('--duration-step')) || 0.6;
    const opacityStart = parseFloat(root.getPropertyValue('--opacity-start')) || 1;
    const opacityStep = parseFloat(root.getPropertyValue('--opacity-step')) || 0.15;

    for (let i = 0; i < nbCircles; i++) {
      const circle = this.renderer.createElement('img');
      this.renderer.addClass(circle, 'circle');
      this.renderer.setAttribute(circle, 'src', 'assets/images/nocte-circles.svg');
      this.renderer.setAttribute(circle, 'alt', `circle-${i + 1}`);

      const scale = Math.pow(scaleStep, i);
      const duration = durationBase * Math.pow(durationStep, i);
      const opacity = Math.max(opacityStart - opacityStep * i, 0);

      this.renderer.setStyle(circle, 'width', `${maxSize * scale}%`);
      this.renderer.setStyle(circle, 'animation-duration', `${duration}s`);
      this.renderer.setStyle(circle, 'opacity', opacity.toString());

      this.renderer.appendChild(container, circle);
    }
  }
}
