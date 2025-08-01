import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { CdkPortalOutlet, ComponentPortal, PortalModule, TemplatePortal } from '@angular/cdk/portal';
import {Overlay, OverlayModule, OverlayRef} from '@angular/cdk/overlay';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, fromEvent } from 'rxjs';
import { TemplateRef, Type, ViewContainerRef } from '@angular/core';
import {WINDOW_DATA, WINDOW_REF, PraxisResizableWindowRef} from './services/praxis-resizable-window.service';

@Component({
  selector: 'praxis-resizable-window',
  standalone: true,
  imports: [CommonModule, PortalModule, OverlayModule, MatIconModule, MatButtonModule],
  templateUrl: './praxis-resizable-window.component.html',
  styleUrls: ['./praxis-resizable-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PraxisResizableWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title: string = 'Janela';
  @Input() initialWidth: string = '80vw';
  @Input() initialHeight: string = '80vh';
  @Input() minWidth: string = '320px';
  @Input() minHeight: string = '400px';
  @Input() hasBackdrop: boolean = true;
  @Input() disableResize: boolean = false;
  @Input() disableMaximize: boolean = false;
  @Input() disableTransitions: boolean = false;
  @Input() enableTouch: boolean = false;
  /** Min distance (px) to start drag/resize; avoid accidental. Default 5. */
  @Input() minDragDistance: number = 5;
  @Input() enableInertia: boolean = false;
  /** Friction for inertia decay (0-1). Default 0.95. */
  @Input() inertiaFriction: number = 0.95;
  /** Multiplier for inertia speed. Default 10. */
  @Input() inertiaMultiplier: number = 10;
  /** Bounce factor on boundary (0 no bounce, 0-1 damp elastic, >1 may oscillate). Default 0. */
  @Input() bounceFactor: number = 0;
  /** Damping factor applied on bounce (0-1 reduces velocity). Default 0.8. Values with bounceFactor * bounceDamp >1 may amplify/oscillate. */
  @Input() bounceDamp: number = 0.8;
  /** Threshold for starting inertia (velocity > threshold). Default 0.1. */
  @Input() inertiaStartThreshold: number = 0.1;
  /** Threshold for stopping inertia (velocity < threshold). Default 0.01. */
  @Input() inertiaStopThreshold: number = 0.01;
  @Input() autoCenterAfterResize: boolean = false;
  @Input() data: any;

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<any>();
  @Output() resized = new EventEmitter<{ width: string; height: string }>();
  @Output() maximizedChange = new EventEmitter<boolean>();
  @Output() positionChanged = new EventEmitter<{ top: string; left: string }>();

  @ViewChild(CdkPortalOutlet) portalOutlet!: CdkPortalOutlet;
  @ViewChild('resizableContainer') resizableContainer!: ElementRef<HTMLElement>;
  
  // Queue content to attach after view init
  private pendingContentComponent?: Type<any>;
  private pendingContentTemplate?: TemplateRef<any>;
  private pendingVcr?: ViewContainerRef;
  private pendingContext?: any;
  private pendingWindowRef?: PraxisResizableWindowRef;

  private _overlayRef: OverlayRef | null = null;
  @Input() set overlayRef(value: OverlayRef | null) {
    this._overlayRef = value;
    if (value) {
      this.updateSize(this.initialWidth, this.initialHeight);
      this.attachListeners();
    }
  }
  get overlayRef(): OverlayRef | null {
    return this._overlayRef;
  }

  protected isMaximized: boolean = false;
  private originalSize: { width: string; height: string; top: string; left: string; transform: string } | null = null;
  private resizeDirection: string | null = null;
  private startX: number = 0;
  private startY: number = 0;
  private startWidth: number = 0;
  private startHeight: number = 0;
  private startLeft: number = 0;
  private startTop: number = 0;
  private globalMoveListener: (() => void) | null = null;
  private globalUpListener: (() => void) | null = null;
  private globalCancelListener: (() => void) | null = null;
  private escSubscription: Subscription | null = null;
  private backdropSubscription: Subscription | null = null;
  private minWidthPx: number = 0;
  private minHeightPx: number = 0;
  private velocityXDrag: number = 0;
  private velocityYDrag: number = 0;
  private lastTimeDrag: number = 0;
  private lastDeltaXDrag: number = 0;
  private lastDeltaYDrag: number = 0;
  private velocityXResize: number = 0;
  private velocityYResize: number = 0;
  private lastTimeResize: number = 0;
  private lastDeltaXResize: number = 0;
  private lastDeltaYResize: number = 0;
  private debounceTimeout: number | null = null;

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private injector: Injector,
    private overlay: Overlay,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.minWidthPx = this.toPx(this.minWidth, true);
    this.minHeightPx = this.toPx(this.minHeight, false);
    if (!this.overlayRef) {
      this.updateSize(this.initialWidth, this.initialHeight);
      this.attachListeners();
    }
    if (this.disableTransitions) {
      this.renderer.addClass(this.getPaneElement(), 'no-transition');
    }
  }

  ngAfterViewInit(): void {
    // Attach any pending content now that ViewChild is available
    if (this.pendingContentComponent) {
      this.attachContent(this.pendingContentComponent, this.pendingWindowRef);
      this.pendingContentComponent = undefined;
      this.pendingWindowRef = undefined;
    } else if (this.pendingContentTemplate && this.pendingVcr) {
      this.attachTemplate(this.pendingContentTemplate, this.pendingVcr, this.pendingContext);
      this.pendingContentTemplate = undefined;
      this.pendingVcr = undefined;
      this.pendingContext = undefined;
    }
    
    this.opened.emit();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.detachListeners();
    this.originalSize = null; // Clear state on destroy
    
    // Clear any pending debounce operations
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  attachContent(contentComponent: Type<any>, windowRef?: PraxisResizableWindowRef): void {
    // If portalOutlet is not yet initialized, queue the content
    if (!this.portalOutlet) {
      this.pendingContentComponent = contentComponent;
      this.pendingWindowRef = windowRef;
      return;
    }
    
    const providers = [{ provide: WINDOW_DATA, useValue: this.data }];
    if (windowRef) {
      providers.push({ provide: WINDOW_REF, useValue: windowRef });
    }
    const childInjector = Injector.create({
      parent: this.injector,
      providers
    });
    const portal = new ComponentPortal(contentComponent, undefined, childInjector);
    this.portalOutlet.attach(portal);
  }

  /** Attaches a template with context as $implicit for template variables like let-data="$implicit". */
  attachTemplate(template: TemplateRef<any>, vcr: ViewContainerRef, context?: any): void {
    // If portalOutlet is not yet initialized, queue the template
    if (!this.portalOutlet) {
      this.pendingContentTemplate = template;
      this.pendingVcr = vcr;
      this.pendingContext = context;
      return;
    }
    
    const portal = new TemplatePortal(template, vcr, { $implicit: context });
    this.portalOutlet.attach(portal);
  }

  private attachListeners(): void {
    if (this.overlayRef && this.hasBackdrop) {
      this.backdropSubscription = this.overlayRef.backdropClick().subscribe(() => this.close());
    }
    this.escSubscription = fromEvent<KeyboardEvent>(this.document, 'keydown').subscribe(e => {
      if (e.key === 'Escape') this.close();
    });
  }

  private detachListeners(): void {
    this.escSubscription?.unsubscribe();
    this.backdropSubscription?.unsubscribe();
    this.stopResize();
    this.stopMove();
  }

  private toPx(value: string, isWidth: boolean): number {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    if (value.endsWith('vw')) return num * window.innerWidth / 100;
    if (value.endsWith('vh')) return num * window.innerHeight / 100;
    return num;
  }

  private getPaneElement(): HTMLElement {
    const el = this.overlayRef ? this.overlayRef.overlayElement : this.resizableContainer?.nativeElement;
    if (!el) throw new Error('Pane element not found');
    return el;
  }

  startResize(event: MouseEvent | TouchEvent, direction: string): void {
    if (this.disableResize || this.isMaximized || (event instanceof TouchEvent && event.touches.length > 1)) return;
    if (event instanceof TouchEvent && !this.enableTouch) return;

    event.preventDefault();
    event.stopPropagation();

    this.resizeDirection = direction;
    this.startX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    this.startY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;

    const pane = this.getPaneElement();
    const rect = pane.getBoundingClientRect();
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.startLeft = rect.left;
    this.startTop = rect.top;

    this.lastTimeResize = Date.now();
    this.lastDeltaXResize = 0;
    this.lastDeltaYResize = 0;
    this.velocityXResize = 0;
    this.velocityYResize = 0;

    this.renderer.addClass(this.document.body, 'resizing');
    this.renderer.addClass(this.getPaneElement(), 'no-transition');

    const moveEvent = (event instanceof MouseEvent) ? 'mousemove' : 'touchmove';
    const upEvent = (event instanceof MouseEvent) ? 'mouseup' : 'touchend';

    this.globalMoveListener = this.renderer.listen(this.document, moveEvent, (e: MouseEvent | TouchEvent) => this.onResizeMove(e), { passive: false });
    this.globalUpListener = this.renderer.listen(this.document, upEvent, () => this.stopResize(), { passive: false });
    if (event instanceof TouchEvent) {
      this.globalCancelListener = this.renderer.listen(this.document, 'touchcancel', () => this.stopResize());
    }
  }

  private onResizeMove(event: MouseEvent | TouchEvent): void {
    if (!this.resizeDirection || (event instanceof TouchEvent && event.touches.length > 1)) return;
    if (event instanceof TouchEvent) event.preventDefault();

    const deltaX = (event instanceof MouseEvent) ? event.clientX - this.startX : event.touches[0].clientX - this.startX;
    const deltaY = (event instanceof MouseEvent) ? event.clientY - this.startY : event.touches[0].clientY - this.startY;
    if (Math.abs(deltaX) < this.minDragDistance && Math.abs(deltaY) < this.minDragDistance) return;

    const currentTime = Date.now();
    const timeDelta = currentTime - this.lastTimeResize;
    if (timeDelta > 0) {
      this.velocityXResize = (deltaX - this.lastDeltaXResize) / timeDelta;
      this.velocityYResize = (deltaY - this.lastDeltaYResize) / timeDelta;
    }
    this.lastDeltaXResize = deltaX;
    this.lastDeltaYResize = deltaY;
    this.lastTimeResize = currentTime;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newLeft = this.startLeft;
    let newTop = this.startTop;

    if (this.resizeDirection.includes('e')) newWidth += deltaX;
    if (this.resizeDirection.includes('w')) { newWidth -= deltaX; newLeft += deltaX; }
    if (this.resizeDirection.includes('s')) newHeight += deltaY;
    if (this.resizeDirection.includes('n')) { newHeight -= deltaY; newTop += deltaY; }

    newWidth = Math.max(this.minWidthPx, newWidth);
    newHeight = Math.max(this.minHeightPx, newHeight);

    const maxW = window.innerWidth - 20;
    const maxH = window.innerHeight - 20;
    newWidth = Math.min(maxW, newWidth);
    newHeight = Math.min(maxH, newHeight);

    this.updateSize(`${newWidth}px`, `${newHeight}px`);
    // Fix: Parâmetros corretos (top, left)
    this.updatePosition(`${newTop}px`, `${newLeft}px`);
  }

  private stopResize(): void {
    if (this.globalMoveListener) this.globalMoveListener();
    if (this.globalUpListener) this.globalUpListener();
    if (this.globalCancelListener) this.globalCancelListener();
    this.globalMoveListener = null;
    this.globalUpListener = null;
    this.globalCancelListener = null;
    this.resizeDirection = null;
    this.renderer.removeClass(this.document.body, 'resizing');
    this.renderer.removeClass(this.getPaneElement(), 'no-transition');
    const pane = this.getPaneElement();
    if (this.autoCenterAfterResize) {
      if (this.overlayRef) {
        this.overlayRef.updatePositionStrategy(this.overlay.position().global().centerHorizontally().centerVertically());
      } else {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const h = pane.offsetHeight;
        const w = pane.offsetWidth;
        this.updatePosition(`${(vh - h) / 2}px`, `${(vw - w) / 2}px`);
      }
    }
    const rect = pane.getBoundingClientRect();
    if (this.enableInertia && (Math.abs(this.velocityXResize) > this.inertiaStartThreshold || Math.abs(this.velocityYResize) > this.inertiaStartThreshold)) {
      this.animateResizeInertia(rect);
    } else {
      this.resized.emit({ width: `${rect.width}px`, height: `${rect.height}px` });
      this.positionChanged.emit({ top: `${rect.top}px`, left: `${rect.left}px` });
    }
    this.cdr.markForCheck();
  }

  private animateResizeInertia(initialRect: DOMRect): void {
    const pane = this.getPaneElement();
    let currentWidth = initialRect.width;
    let currentHeight = initialRect.height;
    let currentLeft = initialRect.left;
    let currentTop = initialRect.top;

    const animate = () => {
      currentWidth += this.velocityXResize * this.inertiaMultiplier * (this.resizeDirection?.includes('e') ? 1 : (this.resizeDirection?.includes('w') ? -1 : 0));
      currentHeight += this.velocityYResize * this.inertiaMultiplier * (this.resizeDirection?.includes('s') ? 1 : (this.resizeDirection?.includes('n') ? -1 : 0));
      currentLeft += this.velocityXResize * this.inertiaMultiplier * (this.resizeDirection?.includes('w') ? 1 : 0);
      currentTop += this.velocityYResize * this.inertiaMultiplier * (this.resizeDirection?.includes('n') ? 1 : 0);

      if (currentWidth < this.minWidthPx) {
        currentWidth = this.minWidthPx;
        this.velocityXResize *= -this.bounceFactor * this.bounceDamp;
      } else if (currentWidth > window.innerWidth - 20) {
        currentWidth = window.innerWidth - 20;
        this.velocityXResize *= -this.bounceFactor * this.bounceDamp;
      }

      if (currentHeight < this.minHeightPx) {
        currentHeight = this.minHeightPx;
        this.velocityYResize *= -this.bounceFactor * this.bounceDamp;
      } else if (currentHeight > window.innerHeight - 20) {
        currentHeight = window.innerHeight - 20;
        this.velocityYResize *= -this.bounceFactor * this.bounceDamp;
      }

      if (currentLeft < 0) {
        currentLeft = 0;
        this.velocityXResize *= -this.bounceFactor * this.bounceDamp;
      } else if (currentLeft > window.innerWidth - currentWidth) {
        currentLeft = window.innerWidth - currentWidth;
        this.velocityXResize *= -this.bounceFactor * this.bounceDamp;
      }

      if (currentTop < 0) {
        currentTop = 0;
        this.velocityYResize *= -this.bounceFactor * this.bounceDamp;
      } else if (currentTop > window.innerHeight - currentHeight) {
        currentTop = window.innerHeight - currentHeight;
        this.velocityYResize *= -this.bounceFactor * this.bounceDamp;
      }

      this.updateSize(`${currentWidth}px`, `${currentHeight}px`);
      // Fix: Parâmetros corretos (top, left)
      this.updatePosition(`${currentTop}px`, `${currentLeft}px`);

      this.velocityXResize *= this.inertiaFriction;
      this.velocityYResize *= this.inertiaFriction;

      if (Math.abs(this.velocityXResize) > this.inertiaStopThreshold || Math.abs(this.velocityYResize) > this.inertiaStopThreshold) {
        requestAnimationFrame(animate);
      } else {
        this.resized.emit({ width: `${currentWidth}px`, height: `${currentHeight}px` });
        this.positionChanged.emit({ top: `${currentTop}px`, left: `${currentLeft}px` });
      }
    };

    requestAnimationFrame(animate);
  }

  startMove(event: MouseEvent | TouchEvent): void {
    if (event instanceof TouchEvent && event.touches.length > 1) {
      return;
    }
    
    const target = event.target as HTMLElement;
    if (this.isMaximized || target.tagName === 'BUTTON' || !this.enableTouch && (event instanceof TouchEvent)) {
      return;
    }

    event.preventDefault();
    this.startX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    this.startY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;

    const pane = this.getPaneElement();
    const rect = pane.getBoundingClientRect();
    this.startLeft = rect.left;
    this.startTop = rect.top;

    this.lastTimeDrag = Date.now();
    this.lastDeltaXDrag = 0;
    this.lastDeltaYDrag = 0;
    this.velocityXDrag = 0;
    this.velocityYDrag = 0;

    this.renderer.addClass(this.document.body, 'dragging');
    this.renderer.addClass(this.getPaneElement(), 'no-transition');

    const moveEvent = (event instanceof MouseEvent) ? 'mousemove' : 'touchmove';
    const upEvent = (event instanceof MouseEvent) ? 'mouseup' : 'touchend';

    this.globalMoveListener = this.renderer.listen(this.document, moveEvent, (e: MouseEvent | TouchEvent) => this.onDragMove(e), { passive: false });
    this.globalUpListener = this.renderer.listen(this.document, upEvent, () => this.stopMove(), { passive: false });
    if (event instanceof TouchEvent) {
      this.globalCancelListener = this.renderer.listen(this.document, 'touchcancel', () => this.stopMove());
    }
  }

  private onDragMove(event: MouseEvent | TouchEvent): void {
    if (event instanceof TouchEvent && event.touches.length > 1) return;
    if (event instanceof TouchEvent) event.preventDefault();
    
    const currentX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    const currentY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
    const deltaX = currentX - this.startX;
    const deltaY = currentY - this.startY;
    
    if (Math.abs(deltaX) < this.minDragDistance && Math.abs(deltaY) < this.minDragDistance) {
      return;
    }

    const currentTime = Date.now();
    const timeDelta = currentTime - this.lastTimeDrag;
    if (timeDelta > 0) {
      this.velocityXDrag = (deltaX - this.lastDeltaXDrag) / timeDelta;
      this.velocityYDrag = (deltaY - this.lastDeltaYDrag) / timeDelta;
    }
    this.lastDeltaXDrag = deltaX;
    this.lastDeltaYDrag = deltaY;
    this.lastTimeDrag = currentTime;

    let newLeft = this.startLeft + deltaX;
    let newTop = this.startTop + deltaY;

    // Apply boundaries
    const originalNewLeft = newLeft;
    const originalNewTop = newTop;
    newLeft = Math.max(0, newLeft);
    newTop = Math.max(0, newTop);

    const pane = this.getPaneElement();
    const rect = pane.getBoundingClientRect();
    newLeft = Math.min(window.innerWidth - rect.width, newLeft);
    newTop = Math.min(window.innerHeight - rect.height, newTop);

    // Fix: Parâmetros corretos (top, left)
    this.updatePosition(`${newTop}px`, `${newLeft}px`);
  }

  private stopMove(): void {
    if (this.globalMoveListener) this.globalMoveListener();
    if (this.globalUpListener) this.globalUpListener();
    if (this.globalCancelListener) this.globalCancelListener();
    this.globalMoveListener = null;
    this.globalUpListener = null;
    this.globalCancelListener = null;
    this.renderer.removeClass(this.document.body, 'dragging');
    this.renderer.removeClass(this.getPaneElement(), 'no-transition');
    const pane = this.getPaneElement();
    if (this.autoCenterAfterResize) {
      if (this.overlayRef) {
        this.overlayRef.updatePositionStrategy(this.overlay.position().global().centerHorizontally().centerVertically());
      } else {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const h = pane.offsetHeight;
        const w = pane.offsetWidth;
        this.updatePosition(`${(vh - h) / 2}px`, `${(vw - w) / 2}px`);
      }
    }
    const rect = pane.getBoundingClientRect();
    if (this.enableInertia && (Math.abs(this.velocityXDrag) > this.inertiaStartThreshold || Math.abs(this.velocityYDrag) > this.inertiaStartThreshold)) {
      this.animateInertia(rect);
    } else {
      this.positionChanged.emit({ top: `${rect.top}px`, left: `${rect.left}px` });
    }
    this.cdr.markForCheck();
  }

  private animateInertia(initialRect: DOMRect): void {
    const pane = this.getPaneElement();
    let currentLeft = initialRect.left;
    let currentTop = initialRect.top;

    const animate = () => {
      currentLeft += this.velocityXDrag * this.inertiaMultiplier;
      currentTop += this.velocityYDrag * this.inertiaMultiplier;

      if (currentLeft < 0) {
        currentLeft = 0;
        this.velocityXDrag *= -this.bounceFactor * this.bounceDamp;
      } else if (currentLeft > window.innerWidth - initialRect.width) {
        currentLeft = window.innerWidth - initialRect.width;
        this.velocityXDrag *= -this.bounceFactor * this.bounceDamp;
      }

      if (currentTop < 0) {
        currentTop = 0;
        this.velocityYDrag *= -this.bounceFactor * this.bounceDamp;
      } else if (currentTop > window.innerHeight - initialRect.height) {
        currentTop = window.innerHeight - initialRect.height;
        this.velocityYDrag *= -this.bounceFactor * this.bounceDamp;
      }

      // Fix: Parâmetros corretos (top, left)
      this.updatePosition(`${currentTop}px`, `${currentLeft}px`);

      this.velocityXDrag *= this.inertiaFriction;
      this.velocityYDrag *= this.inertiaFriction;

      if (Math.abs(this.velocityXDrag) > this.inertiaStopThreshold || Math.abs(this.velocityYDrag) > this.inertiaStopThreshold) {
        requestAnimationFrame(animate);
      } else {
        this.positionChanged.emit({ top: `${currentTop}px`, left: `${currentLeft}px` });
      }
    };

    requestAnimationFrame(animate);
  }

  toggleMaximize(): void {
    if (this.disableMaximize) {
      return;
    }

    try {
      this.isMaximized = !this.isMaximized;
      this.maximizedChange.emit(this.isMaximized);

      const pane = this.getPaneElement();

      if (this.isMaximized) {
        // Always save current state before maximizing to ensure accuracy
        // Clear any stale state first
        this.originalSize = null;
        this.saveCurrentStateAsOriginal();
      
      // For overlay, directly apply styles to bypass CDK positioning strategy
      if (this.overlayRef) {
        const overlayElement = this.overlayRef.overlayElement;
        this.renderer.addClass(overlayElement, 'maximized');
        
        // Completely disable CDK positioning by setting important styles
        this.renderer.setStyle(overlayElement, 'position', 'fixed', 1); // 1 = RendererStyleFlags2.Important
        this.renderer.setStyle(overlayElement, 'top', '0px', 1);
        this.renderer.setStyle(overlayElement, 'left', '0px', 1);
        this.renderer.setStyle(overlayElement, 'right', '0px', 1);
        this.renderer.setStyle(overlayElement, 'bottom', '0px', 1);
        this.renderer.setStyle(overlayElement, 'width', 'calc(100vw - 16px)', 1);
        this.renderer.setStyle(overlayElement, 'height', 'calc(100vh - 16px)', 1);
        this.renderer.setStyle(overlayElement, 'min-width', 'calc(100vw - 16px)', 1);
        this.renderer.setStyle(overlayElement, 'min-height', 'calc(100vh - 16px)', 1);
        this.renderer.setStyle(overlayElement, 'max-width', 'calc(100vw - 16px)', 1);
        this.renderer.setStyle(overlayElement, 'max-height', 'calc(100vh - 16px)', 1);
        this.renderer.setStyle(overlayElement, 'transform', 'none', 1);
        this.renderer.setStyle(overlayElement, 'z-index', '1000', 1);
        this.renderer.setStyle(overlayElement, 'margin', '0px', 1);
        this.renderer.setStyle(overlayElement, 'padding', '0px', 1);
        
        // Also disable CDK position strategy temporarily with breathing room
        this.overlayRef.updatePositionStrategy(
          this.overlay.position().global().top('8px').left('8px')
        );
        
      }
      
      // Also apply styles to the component host element with !important
      const hostElement = this.resizableContainer.nativeElement.parentElement; // praxis-resizable-window
      if (hostElement) {
        this.renderer.setStyle(hostElement, 'width', '100%', 1);
        this.renderer.setStyle(hostElement, 'height', '100%', 1);
        this.renderer.setStyle(hostElement, 'max-width', '100%', 1);
        this.renderer.setStyle(hostElement, 'max-height', '100%', 1);
        this.renderer.setStyle(hostElement, 'position', 'relative', 1);
        this.renderer.setStyle(hostElement, 'top', '0px', 1);
        this.renderer.setStyle(hostElement, 'left', '0px', 1);
        this.renderer.setStyle(hostElement, 'margin', '0px', 1);
        this.renderer.setStyle(hostElement, 'padding', '0px', 1);
        
        // Also add maximized class to host element for CSS styling
        this.renderer.addClass(hostElement, 'maximized');
        
      } else {
        this.updateSize('100vw', '100vh');
        this.updatePosition('0px', '0px');
      }
      
        this.renderer.addClass(pane, 'maximized');
      } else {
        if (this.originalSize) {
        
        // Restore overlay element styles first
        if (this.overlayRef) {
          const overlayElement = this.overlayRef.overlayElement;
          this.renderer.removeClass(overlayElement, 'maximized');
          
          // Remove inline styles to restore original behavior
          this.renderer.removeStyle(overlayElement, 'position');
          this.renderer.removeStyle(overlayElement, 'top');
          this.renderer.removeStyle(overlayElement, 'left');
          this.renderer.removeStyle(overlayElement, 'right');
          this.renderer.removeStyle(overlayElement, 'bottom');
          this.renderer.removeStyle(overlayElement, 'width');
          this.renderer.removeStyle(overlayElement, 'height');
          this.renderer.removeStyle(overlayElement, 'max-width');
          this.renderer.removeStyle(overlayElement, 'max-height');
          this.renderer.removeStyle(overlayElement, 'min-width');
          this.renderer.removeStyle(overlayElement, 'min-height');
          this.renderer.removeStyle(overlayElement, 'transform');
          this.renderer.removeStyle(overlayElement, 'z-index');
          this.renderer.removeStyle(overlayElement, 'margin');
          this.renderer.removeStyle(overlayElement, 'padding');
          
          // Restore original CDK positioning strategy
          this.overlayRef.updatePositionStrategy(
            this.overlay.position()
              .global()
              .top(this.originalSize.top)
              .left(this.originalSize.left)
          );
          
        }
        
        // Also remove styles from the component host element
        const hostElement = this.resizableContainer.nativeElement.parentElement; // praxis-resizable-window
        if (hostElement) {
          this.renderer.removeStyle(hostElement, 'width');
          this.renderer.removeStyle(hostElement, 'height');
          this.renderer.removeStyle(hostElement, 'max-width');
          this.renderer.removeStyle(hostElement, 'max-height');
          this.renderer.removeStyle(hostElement, 'position');
          this.renderer.removeStyle(hostElement, 'top');
          this.renderer.removeStyle(hostElement, 'left');
          this.renderer.removeStyle(hostElement, 'margin');
          this.renderer.removeStyle(hostElement, 'padding');
          
          // Also remove maximized class from host element
          this.renderer.removeClass(hostElement, 'maximized');
          
        }
        
        // Then restore original size and position
        this.updateSize(this.originalSize.width, this.originalSize.height);
        this.updatePosition(this.originalSize.top, this.originalSize.left);
        this.renderer.setStyle(pane, 'transform', this.originalSize.transform);
        
          // Clear original size so it can be saved again if needed
          this.originalSize = null;
        } else {
          // TODO: Add error handling for restore without saved state
        }
        this.renderer.removeClass(pane, 'maximized');
      }
    
      this.cdr.markForCheck();
    } catch (error) {
      // Reset state on error to prevent inconsistent UI
      this.isMaximized = false;
      this.originalSize = null;
      // TODO: Implement proper error logging service
      this.cdr.markForCheck();
    }
  }

  private saveCurrentStateAsOriginal(): void {
    const pane = this.getPaneElement();
    const rect = pane.getBoundingClientRect();
    const styles = getComputedStyle(pane);
    
    // For overlay, get position from overlay element
    let actualTop = rect.top;
    let actualLeft = rect.left;
    
    if (this.overlayRef) {
      const overlayRect = this.overlayRef.overlayElement.getBoundingClientRect();
      actualTop = overlayRect.top;
      actualLeft = overlayRect.left;
    }
    
    this.originalSize = {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      top: `${actualTop}px`,
      left: `${actualLeft}px`,
      transform: styles.transform
    };
    
  }

  private updateSize(width: string, height: string): void {
    if (this.overlayRef) {
      this.overlayRef.updateSize({ width, height });
    } else {
      const pane = this.getPaneElement();
      this.renderer.setStyle(pane, 'width', width);
      this.renderer.setStyle(pane, 'height', height);
    }
  }

  private updatePosition(top: string, left: string): void {
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(
        this.overlay.position().global().top(top).left(left)
      );
    } else {
      const pane = this.getPaneElement();
      this.renderer.setStyle(pane, 'top', top);
      this.renderer.setStyle(pane, 'left', left);
    }
  }

  close(result?: any): void {
    this.closed.emit(result);
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
