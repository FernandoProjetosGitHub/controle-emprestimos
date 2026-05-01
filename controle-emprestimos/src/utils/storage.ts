const BACKUP_SUFFIX = "_backup";
const ARCHIVE_SUFFIX = "_arquivados";

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
