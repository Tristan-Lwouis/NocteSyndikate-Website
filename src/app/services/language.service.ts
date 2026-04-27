import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translocoService = inject(TranslocoService);
  private readonly STORAGE_KEY = 'nocte_lang';

  initLanguage(): void {
    if (typeof window === 'undefined') {
      this.translocoService.setActiveLang('en');
      return;
    }

    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedLang && (savedLang === 'en' || savedLang === 'fr')) {
      this.translocoService.setActiveLang(savedLang);
    } else {
      const browserLang = navigator.language || (navigator as any).userLanguage || '';
      if (browserLang.toLowerCase().startsWith('fr')) {
        this.translocoService.setActiveLang('fr');
      } else {
        this.translocoService.setActiveLang('en');
      }
    }
  }

  setLanguage(lang: 'en' | 'fr'): void {
    this.translocoService.setActiveLang(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  getActiveLanguage(): string {
    return this.translocoService.getActiveLang();
  }

  toggleLanguage(): void {
    const current = this.getActiveLanguage();
    this.setLanguage(current === 'fr' ? 'en' : 'fr');
  }
}
