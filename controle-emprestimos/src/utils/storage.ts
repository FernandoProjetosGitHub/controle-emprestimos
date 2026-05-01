const BACKUP_SUFFIX = "_backup";
const ARCHIVE_SUFFIX = "_arquivados";
const DATA_KEYS = ["clientes", "emprestimos"] as const;

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

export function saveList<T>(key: string, value: T[]) {
  const serialized = JSON.stringify(value);
  localStorage.setItem(key, serialized);
  localStorage.setItem(`${key}${BACKUP_SUFFIX}`, serialized);
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
  const data = DATA_KEYS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: loadList(key),
      [`${key}${BACKUP_SUFFIX}`]: loadList(`${key}${BACKUP_SUFFIX}`),
      [`${key}${ARCHIVE_SUFFIX}`]: loadList(`${key}${ARCHIVE_SUFFIX}`),
    }),
    {
      versao: 1,
      exportadoEm: new Date().toISOString(),
    } as Record<string, unknown>,
  );

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

export async function importBackup(file: File) {
  const content = await file.text();
  const data = JSON.parse(content) as Record<string, unknown>;

  DATA_KEYS.forEach((key) => {
    const value = data[key];
    const archivedValue = data[`${key}${ARCHIVE_SUFFIX}`];

    if (Array.isArray(value)) {
      saveList(key, value);
    }

    if (Array.isArray(archivedValue)) {
      saveList(`${key}${ARCHIVE_SUFFIX}`, archivedValue);
    }
  });
}
