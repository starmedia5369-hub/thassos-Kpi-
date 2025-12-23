
import { AppState } from './types';

export const syncService = {
  getApiUrl: () => {
    const ip = localStorage.getItem('server_ip') || 'localhost';
    return `http://${ip}:8088`;
  },

  setServerIp: (ip: string) => {
    localStorage.setItem('server_ip', ip);
  },

  getServerIp: () => localStorage.getItem('server_ip') || 'localhost',

  getCurrentUser: () => {
    const u = localStorage.getItem('current_user');
    return u ? JSON.parse(u) : { id: 'u1', name: 'المدير العام', role: 'admin', dept: 'executive' };
  },

  bootstrap: async () => {
    try {
      const user = syncService.getCurrentUser();
      const res = await fetch(`${syncService.getApiUrl()}/api/bootstrap`, {
        headers: { 'x-user-id': user.id }
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  syncChanges: async (lastSync: string) => {
    try {
      const user = syncService.getCurrentUser();
      const res = await fetch(`${syncService.getApiUrl()}/api/changes?since=${lastSync}`, {
        headers: { 'x-user-id': user.id }
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  upsert: async (entity: string, record: any) => {
    const user = syncService.getCurrentUser();
    try {
      const res = await fetch(`${syncService.getApiUrl()}/api/upsert`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ entity, record })
      });

      if (res.status === 409) {
        const conflict = await res.json();
        throw { type: 'conflict', server_record: conflict.server_record };
      }
      
      if (!res.ok) throw new Error('Upsert failed');
      return res.json();
    } catch (e) {
      console.warn('Sync failed, saving to local only', e);
      return { status: 'offline_saved' };
    }
  }
};
