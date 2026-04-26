import axios from 'axios';
import { Group, Schedule, ParsedScheduleInput } from './types';

// FIX 1: Use 127.0.0.1 to prevent Mac IPv6 localhost mismatch
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scheduleAPI = {
  parseNaturalLanguage: async (input: string): Promise<ParsedScheduleInput> => {
    const response = await api.post('/parse-schedule', { text: input });
    return response.data;
  },
  
  saveSchedule: async (schedule: Schedule) => {
    const response = await api.post('/schedule', schedule);
    return response.data;
  },
  
  getGroupSchedule: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/schedule`);
    return response.data;
  },
  
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // FIX 2: Sanitize URL to prevent double-slashes
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
    const targetUrl = `${cleanBaseUrl}/upload`;
    
    // FIX 3: Use raw axios to bypass JSON rules for file uploads.
    const response = await axios.post(targetUrl, formData);
    return response.data;
  },

  getEquipmentLogs: async () => {
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
    const response = await api.get(`${cleanBaseUrl}/equipment-logs`);
    return response.data;
  },

  // NEW: The network call to wipe the data
  clearEquipmentLogs: async () => {
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
    const response = await api.delete(`${cleanBaseUrl}/equipment-logs`);
    return response.data;
  }
};

export const groupAPI = {
  createGroup: async (name: string, members: string[]) => {
    const response = await api.post('/groups', { name, members });
    return response.data;
  },
  
  getGroups: async () => {
    const response = await api.get('/groups');
    return response.data;
  },
  
  getBestTimes: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/best-times`);
    return response.data;
  },
};