import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

type Vec2 = { x: number; y: number };

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// Ease-out cubic (donne un effet “accélère puis ralentit”)
function easeOutCubic(t: number): number {
  const u = 1 - clamp01(t);
  return 1 - u * u * u;
}

class Particle {
  x: number;
  y: number;

  vel: { x: number; y: number; min: number; max: number };
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;

    this.vel = {
      x: randFloat(-20, 20) / 100,
      y: randFloat(-20, 20) / 100,
      min: randFloat(2, 10),
      max: randFloat(10, 100) / 10,
    };
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  update(windowWidth: number, windowHeight: number, particleSpeed: number, velocityDamp: number) {
    const forceDirection: Vec2 = {
      x: randFloat(-1, 1),
      y: randFloat(-1, 1),
    };

    if (Math.abs(this.vel.x + forceDirection.x) < this.vel.max) {
      this.vel.x += forceDirection.x;
    }
    if (Math.abs(this.vel.y + forceDirection.y) < this.vel.max) {
      this.vel.y += forceDirection.y;
    }

    this.x += this.vel.x * particleSpeed;
    this.y += this.vel.y * particleSpeed;

    if (Math.abs(this.vel.x) > this.vel.min) this.vel.x *= velocityDamp;
    if (Math.abs(this.vel.y) > this.vel.min) this.vel.y *= velocityDamp;

    // wrap-around
    if (this.x > windowWidth) this.x = 0;
    else if (this.x < 0) this.x = windowWidth;

    if (this.y > windowHeight) this.y = 0;
    else if (this.y < 0) this.y = windowHeight;
  }
}

@Component({
  selector: 'app-particlesCircle',
  standalone: true,
  imports: [],
  templateUrl: './particlesCircle.html',
  styleUrl: './particlesCircle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticlesCircle implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() numberParticlesStart = 100;
  @Input() particleSpeed = 0.2;
  @Input() velocity = 1;
  @Input() circleWidth = 310;
  @Input() particleColor = 'rgba(0, 0, 0, 0.05)';

  @Input() cycleEveryMs = 8_000; // toutes les 15s
  @Input() fadeDurationMs = 2_000; // ease sur 3s
  @Input() fadeRgb: `${number},${number},${number}` = '238,238,238'; //Couleur de fade -> BackgroundColor

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId: number | null = null;

  private width = 0;
  private height = 0;
  private dpr = 1;

  // ✅ état cycle
  private phase: 'RUN' | 'FADE' = 'RUN';
  private cycleStartMs = 0;
  private fadeStartMs = 0;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.ctx = ctx;
    this.resizeCanvas();
    this.reset();

    this.zone.runOutsideAngular(() => {
      this.cycleStartMs = performance.now();
      this.loop();
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
    this.reset();
    // on repart proprement
    this.phase = 'RUN';
    this.cycleStartMs = performance.now();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    this.dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    this.width = rect.width;
    this.height = rect.height;

    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    canvas.width = Math.floor(this.width * this.dpr);
    canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private reset() {
    this.particles = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.initParticles();
  }

  private initParticles() {
    for (let i = 0; i < this.numberParticlesStart; i++) {
      const angle = Math.random() * 360;
      const x = this.width * 0.5 + Math.cos(angle) * this.circleWidth;
      const y = this.height * 0.5 - Math.sin(angle) * this.circleWidth;
      this.particles.push(new Particle(x, y, this.particleColor));
    }
  }

  /** Voile progressif (0 → pas de voile, 1 → opaque total) */
  private applyFade(progress01: number) {
    const p = clamp01(progress01);
    if (p <= 0) return;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = `rgba(${this.fadeRgb}, ${p})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  private loop = () => {
    const now = performance.now();

    if (this.phase === 'RUN') {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.update(this.width, this.height, this.particleSpeed, this.velocity);
        p.render(this.ctx);
      }

      // Toutes les 15s : on lance le fade
      if (now - this.cycleStartMs >= this.cycleEveryMs) {
        this.phase = 'FADE';
        this.fadeStartMs = now;
      }
    } else {
      // FADE sur 3s avec easing
      const t = (now - this.fadeStartMs) / this.fadeDurationMs;
      const eased = easeOutCubic(t);

      this.applyFade(eased);

      // ✅ Quand c’est totalement effacé : reset + restart
      if (t >= 1) {
        // on force une frame “opaque total” pour être sûr qu'il reste rien
        this.applyFade(1);

        this.reset();

        this.phase = 'RUN';
        this.cycleStartMs = now;
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}
