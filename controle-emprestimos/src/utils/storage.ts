const BACKUP_SUFFIX = "_backup";
const ARCHIVE_SUFFIX = "_arquivados";
const DATA_KEYS = ["clientes", "emprestimos"] as const;
const STORAGE_EVENT = "controle-emprestimos-storage";

export type AppData = {
  clientes: unknown[];
  emprestimos: unknown[];
  clientes_arquivados: unknown[];
  emprestimos_arquivados: unknown[];
};

export function getStorageEventName() {
  return STORAGE_EVENT;
}

export function loadList<T>(key: string): T[] {
  const primary = localStorage.getItem(key);
  const backup = localStorage.getItem(`${key}${BACKUP_SUFFIX}`);
  const source = primary ?? backup;

  if (!source) return [];

  try {
    return JSON.parse(source) as T[];
  } catch {
    if (!backup || backup === source) return [];
    return JSON.parse(backup) as T[];
  }
}

export function saveList<T>(key: string, value: T[], notify = true) {
  const serialized = JSON.stringify(value);
  localStorage.setItem(key, serialized);
  localStorage.setItem(`${key}${BACKUP_SUFFIX}`, serialized);
  if (notify) {
    window.dispatchEvent(
      new CustomEvent(STORAGE_EVENT, { detail: { key, origin: "local" } }),
    );
  }
}

export function archiveItem<T>(key: string, item: T) {
  const archiveKey = `${key}${ARCHIVE_SUFFIX}`;
  const current = loadList<T & { arquivadoEm?: string }>(archiveKey);

  saveList(archiveKey, [
    ...current,
    {
      ...item,
      arquivadoEm: new Date().toISOString(),
    },
  ]);
}

export function loadArchivedList<T>(key: string): T[] {
  return loadList<T>(`${key}${ARCHIVE_SUFFIX}`);
}

export function restoreArchivedItems<T extends { id: string }>(key: string) {
  const archivedKey = `${key}${ARCHIVE_SUFFIX}`;
  const active = loadList<T>(key);
  const archived = loadList<T & { arquivadoEm?: string }>(archivedKey);

  const activeIds = new Set(active.map((item) => item.id));
  const restored = archived
    .filter((item) => !activeIds.has(item.id))
    .map((item) => {
      const restoredItem = { ...item };
      delete restoredItem.arquivadoEm;
      return restoredItem as T;
    });

  if (restored.length === 0) return 0;

  saveList(key, [...active, ...restored]);
  saveList(archivedKey, []);

  return restored.length;
}

export function exportBackup() {
  const data = {
    versao: 1,
    exportadoEm: new Date().toISOString(),
    ...loadAppData(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `controle-emprestimos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function loadAppData(): AppData {
  return {
    clientes: loadList("clientes"),
    emprestimos: loadList("emprestimos"),
    clientes_arquivados: loadArchivedList("clientes"),
    emprestimos_arquivados: loadArchivedList("emprestimos"),
  };
}

export function saveAppData(data: Partial<AppData>) {
  if (Array.isArray(data.clientes)) saveList("clientes", data.clientes, false);
  if (Array.isArray(data.emprestimos)) saveList("emprestimos", data.emprestimos, false);
  if (Array.isArray(data.clientes_arquivados)) {
    saveList(`${DATA_KEYS[0]}${ARCHIVE_SUFFIX}`, data.clientes_arquivados, false);
  }
  if (Array.isArray(data.emprestimos_arquivados)) {
    saveList(`${DATA_KEYS[1]}${ARCHIVE_SUFFIX}`, data.emprestimos_arquivados, false);
  }
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, { detail: { origin: "external" } }),
  );
}

export async function importBackup(file: File) {
  const content = await file.text();
  const data = JSON.parse(content) as Record<string, unknown>;
  const requiredKeys = [
    "clientes",
    "emprestimos",
    "clientes_arquivados",
    "emprestimos_arquivados",
  ];

  const hasInvalidKey = requiredKeys.some((key) => !Array.isArray(data[key]));
  if (hasInvalidKey) {
    throw new Error("Backup invalido");
  }

  saveAppData({
    clientes: data.clientes as unknown[],
    emprestimos: data.emprestimos as unknown[],
    clientes_arquivados: data.clientes_arquivados as unknown[],
    emprestimos_arquivados: data.emprestimos_arquivados as unknown[],
  });
}
