export interface ActionLike {
  action?: string;
  id?: string;
}

export function getActionId(action: ActionLike): string {
  return action.action ?? action.id ?? '';
}
