export function unwrapList<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object') {
    const d = (body as { data?: unknown }).data;
    if (Array.isArray(d)) return d as T[];
    if (d && typeof d === 'object' && 'data' in (d as object)) {
      const inner = (d as { data?: unknown }).data;
      if (Array.isArray(inner)) return inner as T[];
    }
  }
  return [];
}

export interface PermissionRow {
  id: string;
  name: string;
  module: string;
  description?: string;
}

export interface GroupRow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  users_count: number;
  permissions: PermissionRow[];
  permission_ids: string[];
  parent_group_ids: string[];
}

function pickPerm(raw: Record<string, unknown>): PermissionRow {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    module: String(raw.module ?? 'general'),
    description: raw.description != null ? String(raw.description) : undefined,
  };
}

export function normalizePermission(raw: unknown): PermissionRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id;
  if (id == null || id === '') return null;
  return pickPerm(r);
}

export function normalizeGroup(raw: unknown): GroupRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id;
  if (id == null || id === '') return null;
  const permsRaw = r.permissions ?? r.permission_list;
  let permissions: PermissionRow[] = [];
  if (Array.isArray(permsRaw)) {
    permissions = permsRaw.map((p) => normalizePermission(p)).filter(Boolean) as PermissionRow[];
  }
  const pidRaw = r.permission_ids ?? r.permissionIds;
  let permission_ids: string[] = [];
  if (Array.isArray(pidRaw)) {
    permission_ids = pidRaw.map((x) => String(x));
  }
  if (permissions.length && !permission_ids.length) {
    permission_ids = permissions.map((p) => p.id);
  }
  const pg = r.parent_group_ids ?? r.member_of_group_ids ?? r.included_group_ids;
  let parent_group_ids: string[] = [];
  if (Array.isArray(pg)) {
    parent_group_ids = pg.map((x) => String((x as { id?: unknown })?.id ?? x));
  }
  const parents = r.parent_groups ?? r.member_groups;
  if (Array.isArray(parents) && !parent_group_ids.length) {
    parent_group_ids = parents
      .map((x) => (typeof x === 'object' && x && 'id' in x ? String((x as { id: unknown }).id) : ''))
      .filter(Boolean);
  }
  return {
    id: String(id),
    name: String(r.name ?? ''),
    description: String(r.description ?? ''),
    is_active: Boolean(r.is_active ?? r.isActive ?? true),
    users_count: Number(r.users_count ?? r.usersCount ?? r.members_count ?? 0),
    permissions,
    permission_ids,
    parent_group_ids,
  };
}

export function selectedIdsForEditor(g: GroupRow): string[] {
  if (g.permissions.length) return g.permissions.map((p) => p.id);
  return [...g.permission_ids];
}

export function enrichGroupPermissions(groups: GroupRow[], all: PermissionRow[]): GroupRow[] {
  const pmap = new Map(all.map((p) => [p.id, p]));
  return groups.map((g) => {
    if (g.permissions.length) return g;
    if (!g.permission_ids.length) return g;
    const permissions = g.permission_ids.map((id) => pmap.get(id)).filter(Boolean) as PermissionRow[];
    return { ...g, permissions };
  });
}

export function effectivePermissionKeys(groups: GroupRow[], selectedGroupIds: string[]): Set<string> {
  const keys = new Set<string>();
  for (const id of selectedGroupIds) {
    const g = groups.find((x) => x.id === id);
    if (!g) continue;
    const fromPerms = g.permissions.map((p) => p.name).filter(Boolean);
    fromPerms.forEach((k) => keys.add(k));
    if (!fromPerms.length && g.permission_ids.length) {
      g.permission_ids.forEach((pid) => keys.add(`id:${pid}`));
    }
  }
  return keys;
}
