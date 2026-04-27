import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

export interface ProcessStep {
  number: string;
  titleKey: string;
  descKey: string;
  bulletsKey: string[];
  durationKey: string;
  bgImage: string;
}

@Component({
  selector: 'app-process-section',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './process-section.component.html',
  styleUrl: './process-section.component.scss'
})
export class ProcessSectionComponent {
  activeTab = signal<'logo' | 'website'>('logo');

  logoSteps: ProcessStep[] = [
    {
      number: '01',
      titleKey: 'process.logoSteps.step1.title',
      descKey: 'process.logoSteps.step1.desc',
      bulletsKey: ['process.logoSteps.step1.bullets.0', 'process.logoSteps.step1.bullets.1', 'process.logoSteps.step1.bullets.2', 'process.logoSteps.step1.bullets.3'],
      durationKey: 'process.logoSteps.step1.duration',
      bgImage: 'assets/images/GLYPHS_1.svg'
    },
    {
      number: '02',
      titleKey: 'process.logoSteps.step2.title',
      descKey: 'process.logoSteps.step2.desc',
      bulletsKey: ['process.logoSteps.step2.bullets.0', 'process.logoSteps.step2.bullets.1', 'process.logoSteps.step2.bullets.2', 'process.logoSteps.step2.bullets.3', 'process.logoSteps.step2.bullets.4'],
      durationKey: 'process.logoSteps.step2.duration',
      bgImage: 'assets/images/GLYPHS_2.svg'
    },
    {
      number: '03',
      titleKey: 'process.logoSteps.step3.title',
      descKey: 'process.logoSteps.step3.desc',
      bulletsKey: ['process.logoSteps.step3.bullets.0', 'process.logoSteps.step3.bullets.1', 'process.logoSteps.step3.bullets.2', 'process.logoSteps.step3.bullets.3'],
      durationKey: 'process.logoSteps.step3.duration',
      bgImage: 'assets/images/GLYPHS_3.svg'
    },
    {
      number: '04',
      titleKey: 'process.logoSteps.step4.title',
      descKey: 'process.logoSteps.step4.desc',
      bulletsKey: ['process.logoSteps.step4.bullets.0', 'process.logoSteps.step4.bullets.1', 'process.logoSteps.step4.bullets.2', 'process.logoSteps.step4.bullets.3'],
      durationKey: 'process.logoSteps.step4.duration',
      bgImage: 'assets/images/GLYPHS_4.svg'
    },
    {
      number: '05',
      titleKey: 'process.logoSteps.step5.title',
      descKey: 'process.logoSteps.step5.desc',
      bulletsKey: ['process.logoSteps.step5.bullets.0', 'process.logoSteps.step5.bullets.1', 'process.logoSteps.step5.bullets.2', 'process.logoSteps.step5.bullets.3'],
      durationKey: 'process.logoSteps.step5.duration',
      bgImage: 'assets/images/GLYPHS_5.svg'
    }
  ];

  websiteSteps: ProcessStep[] = [
    {
      number: '01',
      titleKey: 'process.websiteSteps.step1.title',
      descKey: 'process.websiteSteps.step1.desc',
      bulletsKey: ['process.websiteSteps.step1.bullets.0', 'process.websiteSteps.step1.bullets.1', 'process.websiteSteps.step1.bullets.2', 'process.websiteSteps.step1.bullets.3'],
      durationKey: 'process.websiteSteps.step1.duration',
      bgImage: 'assets/images/GLYPHS_6.svg'
    },
    {
      number: '02',
      titleKey: 'process.websiteSteps.step2.title',
      descKey: 'process.websiteSteps.step2.desc',
      bulletsKey: ['process.websiteSteps.step2.bullets.0', 'process.websiteSteps.step2.bullets.1', 'process.websiteSteps.step2.bullets.2', 'process.websiteSteps.step2.bullets.3'],
      durationKey: 'process.websiteSteps.step2.duration',
      bgImage: 'assets/images/GLYPHS_1.svg'
    },
    {
      number: '03',
      titleKey: 'process.websiteSteps.step3.title',
      descKey: 'process.websiteSteps.step3.desc',
      bulletsKey: ['process.websiteSteps.step3.bullets.0', 'process.websiteSteps.step3.bullets.1', 'process.websiteSteps.step3.bullets.2', 'process.websiteSteps.step3.bullets.3'],
      durationKey: 'process.websiteSteps.step3.duration',
      bgImage: 'assets/images/GLYPHS_2.svg'
    },
    {
      number: '04',
      titleKey: 'process.websiteSteps.step4.title',
      descKey: 'process.websiteSteps.step4.desc',
      bulletsKey: ['process.websiteSteps.step4.bullets.0', 'process.websiteSteps.step4.bullets.1', 'process.websiteSteps.step4.bullets.2', 'process.websiteSteps.step4.bullets.3'],
      durationKey: 'process.websiteSteps.step4.duration',
      bgImage: 'assets/images/GLYPHS_3.svg'
    },
    {
      number: '05',
      titleKey: 'process.websiteSteps.step5.title',
      descKey: 'process.websiteSteps.step5.desc',
      bulletsKey: ['process.websiteSteps.step5.bullets.0', 'process.websiteSteps.step5.bullets.1', 'process.websiteSteps.step5.bullets.2', 'process.websiteSteps.step5.bullets.3'],
      durationKey: 'process.websiteSteps.step5.duration',
      bgImage: 'assets/images/GLYPHS_4.svg'
    }
  ];

  get currentSteps(): ProcessStep[] {
    return this.activeTab() === 'logo' ? this.logoSteps : this.websiteSteps;
  }

  setTab(tab: 'logo' | 'website') {
    this.activeTab.set(tab);
  }
}
