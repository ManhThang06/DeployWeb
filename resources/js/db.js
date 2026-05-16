import Dexie from 'dexie';

export const db = new Dexie('NoteAppDB');

db.version(1).stores({
    notes: '++id, server_id, title, content, updated_at, sync_status', // sync_status: 'synced', 'pending_create', 'pending_update', 'pending_delete'
    labels: '++id, server_id, name'
});
