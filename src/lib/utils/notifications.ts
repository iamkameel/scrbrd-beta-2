// Notification utility for managing alerts

export type NotificationType = 
  | 'match_reminder' 
  | 'milestone_50' 
  | 'milestone_100' 
  | 'wicket_5' 
  | 'hat_trick'
  | 'match_complete';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  matchId?: string;
  playerId?: string;
  read: boolean;
}

export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  matchId?: string,
  playerId?: string
): Notification {
  return {
    id: `notif-${Date.now()}-${Math.random()}`,
    type,
    title,
    message,
    timestamp: new Date(),
    matchId,
    playerId,
    read: false,
  };
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'match_reminder':
      return '⏰';
    case 'milestone_50':
    case 'milestone_100':
      return '🎯';
    case 'wicket_5':
    case 'hat_trick':
      return '🎳';
    case 'match_complete':
      return '✅';
    default:
      return '🔔';
  }
}
