import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TextSlider } from "./animations/text-slider/text-slider";
import { NocteCirclesComponent } from "./animations/nocte-circles/nocte-circles.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TextSlider, NocteCirclesComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Nocte_Syndikate');
}
