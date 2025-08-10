export type DeviceKind = 'mobile' | 'tablet' | 'desktop';
export type OverlayPattern =
  | 'modal'
  | 'drawer'
  | 'page'
  | 'bottom-sheet'
  | 'full-screen-dialog';

export interface OverlayDecisionContext {
  device: DeviceKind;
  fieldCount: number;
  dependencyCount: number;
}

export interface OverlayDecision {
  pattern: OverlayPattern;
  config?: Record<string, unknown>;
  reason?: string;
}

export interface OverlayRange {
  min?: number;
  max?: number;
}

export interface OverlayRuleMatch {
  device?: DeviceKind[];
  fieldCount?: OverlayRange;
  dependencyCount?: OverlayRange;
  any?: OverlayRuleMatch[];
}

export interface OverlayRule {
  match: OverlayRuleMatch;
  use: OverlayDecision;
}

export interface OverlayThresholds {
  fieldCount: {
    small_max: number;
    medium_max: number;
  };
  dependencyCount: {
    low_max: number;
    medium_max: number;
  };
}

export interface OverlayDecisionMatrix {
  version: string;
  description?: string;
  thresholds: OverlayThresholds;
  rules_ordered: OverlayRule[];
  fallback: OverlayDecision;
  ui_hints?: Record<string, unknown>;
}

export interface OverlayDecider {
  decide(ctx: OverlayDecisionContext): OverlayDecision;
  explain?(ctx: OverlayDecisionContext): string;
}
