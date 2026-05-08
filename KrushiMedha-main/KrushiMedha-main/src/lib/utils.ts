import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppActivity, AppNotification } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function logActivity(activity: Omit<AppActivity, 'id' | 'timestamp'>) {
  try {
    const saved = localStorage.getItem('krsi_activities');
    const activities: AppActivity[] = saved ? JSON.parse(saved) : [];
    
    const newActivity: AppActivity = {
      ...activity,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };
    
    // Keep last 50 activities
    const updated = [newActivity, ...activities].slice(0, 50);
    localStorage.setItem('krsi_activities', JSON.stringify(updated));
    
    // Dispatch custom event to notify components (like Profile) to refresh
    window.dispatchEvent(new CustomEvent('krsi_activity_logged'));
  } catch (e) {
    console.error('Failed to log activity', e);
  }
}

export function logNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
  try {
    const isSmsEnabled = localStorage.getItem('krsi_sms_enabled') === 'true';
    if (!isSmsEnabled) return;

    const saved = localStorage.getItem('krsi_notifications');
    const notifications: AppNotification[] = saved ? JSON.parse(saved) : [];
    
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const updated = [newNotif, ...notifications].slice(0, 50);
    localStorage.setItem('krsi_notifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('krsi_notifications_updated'));
  } catch (e) {
    console.error('Failed to log notification', e);
  }
}
