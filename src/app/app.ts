import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TextSlider } from "./animations/text-slider/text-slider";
import { NocteCirclesComponent } from "./animations/nocte-circles/nocte-circles.component";
import { CustomCursor } from "./animations/custom-cursor/custom-cursor";
import { ParticlesCircle } from "./animations/particles/particlesCircle";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TextSlider, NocteCirclesComponent, CustomCursor, ParticlesCircle],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('Nocte_Syndikate');
}