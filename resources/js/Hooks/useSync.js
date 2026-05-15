import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/db';
import axios from 'axios';

export default function useSync() {
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const isSyncingRef = useRef(false);
    const lastSyncTime = useRef(0);

    const syncData = useCallback(async () => {
        // Prevent syncing too frequently (at most once every 5 seconds)
        const now = Date.now();
        if (now - lastSyncTime.current < 5000) return;
        
        if (!window.navigator.onLine || isSyncingRef.current) return;
        
        isSyncingRef.current = true;
        setIsSyncing(true);
        lastSyncTime.current = now;

        let errorCount = 0;
        const MAX_ERRORS = 5;

        try {
            const pendingNotes = await db.notes
                .filter(note => note.sync_status !== 'synced')
                .toArray();

            if (pendingNotes.length === 0) return;

            for (const note of pendingNotes) {
                if (errorCount >= MAX_ERRORS) {
                    console.warn('Too many sync errors, pausing sync.');
                    break;
                }

                // Double check online status during loop
                if (!window.navigator.onLine) break;

                try {
                    let res;
                    if (note.sync_status === 'pending_update') {
                        if (!note.server_id) {
                             res = await axios.post(route('notes.store'), {
                                title: note.title,
                                content: note.content
                            });
                        } else {
                            res = await axios.post(route('notes.update', note.server_id), {
                                title: note.title,
                                content: note.content,
                                _method: 'PATCH'
                            });
                        }
                    } else if (note.sync_status === 'pending_create') {
                        res = await axios.post(route('notes.store'), {
                            title: note.title,
                            content: note.content
                        });
                    } else if (note.sync_status === 'pending_delete') {
                        if (note.server_id) {
                            await axios.delete(route('notes.destroy', note.server_id));
                        }
                        await db.notes.delete(note.id);
                        continue;
                    }
                    
                    const serverNote = res?.data || note;
                    await db.notes.update(note.id, { 
                        server_id: serverNote.id || note.server_id,
                        sync_status: 'synced' 
                    });
                } catch (err) {
                    errorCount++;
                    console.error('Failed to sync note:', note.id, err.message);
                    
                    // Stop if CSRF token expired (Page Expired)
                    if (err.response?.status === 419) {
                        console.error('Session expired (419). Reloading might be necessary.');
                        setIsOnline(false);
                        break;
                    }

                    // If it's a real network error, stop syncing for now
                    if (!err.response && !window.navigator.onLine) {
                        setIsOnline(false);
                        break;
                    }
                    
                    // If it's a 404, the note might be gone from server
                    if (err.response?.status === 404) {
                        if (note.sync_status === 'pending_delete') {
                            await db.notes.delete(note.id);
                        } else {
                            await db.notes.update(note.id, { sync_status: 'synced' });
                        }
                    }
                }
            }
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
        }
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Delay sync slightly to ensure connection is stable
            setTimeout(syncData, 1000);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync if online
        if (window.navigator.onLine) {
            syncData();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncData]);

    const saveNote = useCallback(async (noteData, id = null) => {
        const effectivelyOnline = isOnline && window.navigator.onLine;

        if (effectivelyOnline) {
            try {
                const url = id ? route('notes.update', id) : route('notes.store');
                const payload = id ? { ...noteData, _method: 'PATCH' } : noteData;
                const res = await axios.post(url, payload);
                
                const syncedNote = {
                    ...res.data,
                    server_id: res.data.id,
                    sync_status: 'synced'
                };

                await db.notes.put(syncedNote);
                return syncedNote;
            } catch (err) {
                console.error('Server save failed, falling back to local', err.message);
                
                if (err.response?.status === 419) {
                    setIsOnline(false);
                } else if (!err.response) {
                    setIsOnline(false);
                }
            }
        }

        // Offline or server failed
        const localNote = {
            ...noteData,
            server_id: id,
            sync_status: id ? 'pending_update' : 'pending_create',
            updated_at: new Date().toISOString()
        };
        
        const existing = id ? await db.notes.where('server_id').equals(id).first() : null;
        if (existing) {
            localNote.id = existing.id;
        }

        const localId = await db.notes.put(localNote);
        return { ...localNote, id: localId };
    }, [isOnline]);

    return { isOnline, isSyncing, syncData, saveNote };
}
