export interface ActionLike {
  action?: string;
  id?: string;
  // Campos históricos/comuns em diferentes configurações
  code?: string;
  key?: string;
  name?: string;
  type?: string;
  // Suporte a inferência por ícone/rótulo
  icon?: string;
  label?: string;
}

function normalize(str?: string | null): string {
  if (!str) return '';
  return String(str).trim();
}

function fromCommonKeys(a: ActionLike): string | undefined {
  return (
    normalize(a.action) ||
    normalize(a.id) ||
    normalize(a.code) ||
    normalize(a.key) ||
    normalize(a.name) ||
    normalize(a.type) ||
    undefined
  );
}

function iconToAction(icon?: string): string | undefined {
  if (!icon) return undefined;
  const i = icon.trim().toLowerCase();
  // Mapeamento de ícones Material/SVG para ações canônicas
  const map: Record<string, string> = {
    delete: 'delete',
    delete_outline: 'delete',
    delete_forever: 'delete',
    remove: 'delete',
    trash: 'delete',
    edit: 'edit',
    create: 'edit',
    mode_edit: 'edit',
    visibility: 'view',
    visibility_off: 'hide',
    open_in_new: 'open',
    launch: 'open',
    add: 'add',
    add_circle: 'add',
    add_box: 'add',
    save: 'save',
    download: 'download',
    file_download: 'download',
    upload: 'upload',
    file_upload: 'upload',
    more_vert: 'more',
    more_horiz: 'more',
    info: 'info',
    warning: 'warning',
    block: 'block',
    close: 'close',
    cancel: 'cancel',
    check: 'confirm',
    done: 'confirm',
    done_all: 'confirm',
    content_copy: 'copy',
    content_paste: 'paste',
    restore: 'restore',
    refresh: 'refresh',
    search: 'search',
    filter_list: 'filter',
    settings: 'settings',
  };
  return map[i] || i; // fallback: usar o próprio nome do ícone
}

function labelToAction(label?: string): string | undefined {
  if (!label) return undefined;
  const l = label.trim().toLowerCase();
  // Normalização simples de alguns rótulos comuns em pt/en
  const map: Record<string, string> = {
    excluir: 'delete',
    deletar: 'delete',
    remover: 'delete',
    apagar: 'delete',
    delete: 'delete',
    remove: 'delete',
    editar: 'edit',
    edit: 'edit',
    visualizar: 'view',
    ver: 'view',
    view: 'view',
    salvar: 'save',
    save: 'save',
    baixar: 'download',
    download: 'download',
  };
  return map[l] || l.replace(/\s+/g, '-');
}

export function getActionId(action: ActionLike): string {
  // 1) Tentar pelas chaves padrão/históricas
  const byKey = fromCommonKeys(action);
  if (byKey) return byKey;

  // 2) Inferir pelo ícone
  const byIcon = iconToAction(action.icon);
  if (byIcon) return byIcon;

  // 3) Fallback para label
  const byLabel = labelToAction(action.label);
  if (byLabel) return byLabel;

  // 4) Evitar string vazia
  console.warn('[PraxisTable] getActionId: identificador desconhecido para ação', action);
  return 'unknown';
}
