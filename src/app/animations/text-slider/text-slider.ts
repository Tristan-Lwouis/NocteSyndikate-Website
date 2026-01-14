import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-slider.html',
  styleUrl: './text-slider.scss',
})
export class TextSlider {
  @Input() text: string = "NOCTE SYNDIKATE - CREATIVE WEB AGENCY / ";
  @Input() duration: number = 20; // Vitesse en secondes (plus c'est bas, plus c'est rapide)
}
