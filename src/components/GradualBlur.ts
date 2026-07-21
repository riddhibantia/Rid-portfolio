/**
 * GradualBlur.ts
 *
 * Vanilla TypeScript port of the GradualBlur React component from React Bits.
 * Creates smooth, gradient-blurred overlays using multiple layered backdrop-filters.
 */

export interface GradualBlurOptions {
  position?: 'top' | 'bottom' | 'left' | 'right';
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  animated?: boolean | 'scroll';
  duration?: string;
  easing?: string;
  opacity?: number;
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
  responsive?: boolean;
  target?: 'parent' | 'page';
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  preset?: keyof typeof PRESETS;
  hoverIntensity?: number;
  onAnimationComplete?: () => void;
  // Responsive overrides
  mobileHeight?: string;
  tabletHeight?: string;
  desktopHeight?: string;
  mobileWidth?: string;
  tabletWidth?: string;
  desktopWidth?: string;
}

const DEFAULT_CONFIG: Required<Omit<GradualBlurOptions, 'preset' | 'onAnimationComplete' | 'width' | 'style' | 'className' | 'mobileHeight' | 'tabletHeight' | 'desktopHeight' | 'mobileWidth' | 'tabletWidth' | 'desktopWidth'>> = {
  position: 'bottom',
  strength: 2,
  height: '6rem',
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  hoverIntensity: 0
};

const PRESETS = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
} as const;

const CURVE_FUNCTIONS = {
  linear: (p: number) => p,
  bezier: (p: number) => p * p * (3 - 2 * p),
  'ease-in': (p: number) => p * p,
  'ease-out': (p: number) => 1 - Math.pow(1 - p, 2),
  'ease-in-out': (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
} as const;

const getGradientDirection = (position: 'top' | 'bottom' | 'left' | 'right') => {
  const directions = {
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right'
  };
  return directions[position] || 'to bottom';
};

export class GradualBlur {
  private element: HTMLDivElement;
  private containerRef: HTMLDivElement;
  private isHovered = false;
  private config: Required<GradualBlurOptions> & { style?: Partial<CSSStyleDeclaration>, className?: string };
  private activeHeight: string;
  private activeWidth?: string;
  private observer?: IntersectionObserver;
  private resizeListener?: () => void;

  constructor(parent: HTMLElement, options: GradualBlurOptions = {}) {
    const presetConfig = options.preset && PRESETS[options.preset] ? PRESETS[options.preset] : {};
    
    // Merge options
    this.config = {
      ...DEFAULT_CONFIG,
      ...presetConfig,
      ...options,
      style: options.style || {},
      className: options.className || '',
      mobileHeight: options.mobileHeight || '',
      tabletHeight: options.tabletHeight || '',
      desktopHeight: options.desktopHeight || '',
      mobileWidth: options.mobileWidth || '',
      tabletWidth: options.tabletWidth || '',
      desktopWidth: options.desktopWidth || ''
    } as any;

    this.activeHeight = this.config.height;
    this.activeWidth = this.config.width;

    // Create DOM structure
    this.element = document.createElement('div');
    this.element.className = `gradual-blur ${this.config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${this.config.className}`;
    
    this.containerRef = document.createElement('div');
    this.containerRef.className = 'gradual-blur-inner';
    this.containerRef.style.position = 'relative';
    this.containerRef.style.width = '100%';
    this.containerRef.style.height = '100%';
    
    this.element.appendChild(this.containerRef);
    parent.appendChild(this.element);

    this.init();
  }

  private init() {
    this.setupResponsive();
    this.setupIntersection();
    this.renderBlurLayers();
    this.setupHover();
    this.applyContainerStyle();
  }

  private setupResponsive() {
    if (!this.config.responsive) return;

    const calc = () => {
      const w = window.innerWidth;
      
      // Calculate height
      let h = this.config.height;
      if (w <= 480 && this.config.mobileHeight) h = this.config.mobileHeight;
      else if (w <= 768 && this.config.tabletHeight) h = this.config.tabletHeight;
      else if (w <= 1024 && this.config.desktopHeight) h = this.config.desktopHeight;
      this.activeHeight = h;

      // Calculate width
      let wd = this.config.width;
      if (w <= 480 && this.config.mobileWidth) wd = this.config.mobileWidth;
      else if (w <= 768 && this.config.tabletWidth) wd = this.config.tabletWidth;
      else if (w <= 1024 && this.config.desktopWidth) wd = this.config.desktopWidth;
      this.activeWidth = wd;

      this.applyContainerStyle();
    };

    // Simple debounce
    let timeoutId: number;
    this.resizeListener = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(calc, 100);
    };

    calc();
    window.addEventListener('resize', this.resizeListener);
  }

  private setupIntersection() {
    if (this.config.animated !== 'scroll') {
      this.element.style.opacity = '1';
      return;
    }

    this.element.style.opacity = '0';
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.element.style.opacity = '1';
        if (this.config.onAnimationComplete) {
          const durationMs = parseFloat(this.config.duration) * (this.config.duration.includes('ms') ? 1 : 1000);
          setTimeout(() => {
            if (this.config.onAnimationComplete) this.config.onAnimationComplete();
          }, durationMs);
        }
        this.observer?.disconnect();
      }
    }, { threshold: 0.1 });

    this.observer.observe(this.element);
  }

  private renderBlurLayers() {
    this.containerRef.innerHTML = '';
    const increment = 100 / this.config.divCount;
    const currentStrength = this.isHovered && this.config.hoverIntensity 
      ? this.config.strength * this.config.hoverIntensity 
      : this.config.strength;

    const curveFunc = CURVE_FUNCTIONS[this.config.curve] || CURVE_FUNCTIONS.linear;

    for (let i = 1; i <= this.config.divCount; i++) {
      let progress = i / this.config.divCount;
      progress = curveFunc(progress);

      let blurValue: number;
      if (this.config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength;
      } else {
        blurValue = 0.0625 * (progress * this.config.divCount + 1) * currentStrength;
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(this.config.position);

      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.inset = '0';
      div.style.maskImage = `linear-gradient(${direction}, ${gradient})`;
      div.style.webkitMaskImage = `linear-gradient(${direction}, ${gradient})`;
      div.style.backdropFilter = `blur(${blurValue.toFixed(3)}rem)`;
      (div.style as any)['-webkit-backdrop-filter'] = `blur(${blurValue.toFixed(3)}rem)`;
      div.style.opacity = String(this.config.opacity);
      
      if (this.config.animated && this.config.animated !== 'scroll') {
        div.style.transition = `backdrop-filter ${this.config.duration} ${this.config.easing}`;
      }

      this.containerRef.appendChild(div);
    }
  }

  private setupHover() {
    if (!this.config.hoverIntensity) return;

    this.element.style.pointerEvents = 'auto';
    this.element.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.renderBlurLayers();
    });
    this.element.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.renderBlurLayers();
    });
  }

  private applyContainerStyle() {
    const isVertical = ['top', 'bottom'].includes(this.config.position);
    const isHorizontal = ['left', 'right'].includes(this.config.position);
    const isPageTarget = this.config.target === 'page';

    this.element.style.position = isPageTarget ? 'fixed' : 'absolute';
    this.element.style.pointerEvents = this.config.hoverIntensity ? 'auto' : 'none';
    this.element.style.zIndex = String(isPageTarget ? this.config.zIndex + 100 : this.config.zIndex);

    if (this.config.animated) {
      this.element.style.transition = `opacity ${this.config.duration} ${this.config.easing}`;
    }

    // Positions & dimensions
    if (isVertical) {
      this.element.style.height = this.activeHeight;
      this.element.style.width = this.activeWidth || '100%';
      this.element.style[this.config.position] = '0';
      this.element.style.left = '0';
      this.element.style.right = '0';
      // Clear horizontal positions
      this.element.style.top = this.config.position === 'top' ? '0' : '';
      this.element.style.bottom = this.config.position === 'bottom' ? '0' : '';
    } else if (isHorizontal) {
      this.element.style.width = this.activeWidth || this.activeHeight;
      this.element.style.height = '100%';
      this.element.style[this.config.position] = '0';
      this.element.style.top = '0';
      this.element.style.bottom = '0';
      // Clear vertical positions
      this.element.style.left = this.config.position === 'left' ? '0' : '';
      this.element.style.right = this.config.position === 'right' ? '0' : '';
    }

    // Apply inline style overrides
    if (this.config.style) {
      Object.assign(this.element.style, this.config.style);
    }
  }

  public destroy() {
    this.observer?.disconnect();
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.element.remove();
  }
}
