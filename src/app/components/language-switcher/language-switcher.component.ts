import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent {
  public languageService = inject(LanguageService);

  get currentLang() {
    return this.languageService.getActiveLanguage();
  }

  setLanguage(lang: 'en' | 'fr') {
    if (this.currentLang !== lang) {
      this.languageService.setLanguage(lang);
    }
  }
}
