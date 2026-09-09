'use client';

import React, { useState } from 'react';
import { Theme } from './types';

interface NotificationsViewProps {
  theme: Theme;
  onNavigate: (page: string) => void;
}

interface AlertItem {
  id: string;
  category: "match" | "medical" | "logistics" | "grounds" | "fixture";
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  targetPage?: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  { id: "a1", category: "match", title: "Live Match Update", body: "Westville U19A vs Kearsney College: 142/3 (14.2 ov). J. Whitfield 67* (44b). Run rate: 9.91 rpo.", time: "2 mins ago", read: false, actionLabel: "Open Broadcast Scorer →", targetPage: "matches" },
  { id: "a2", category: "medical", title: "Physio Clearance Notice", body: "Theo Pretorius (Hamstring Strain) progressed to Stage 3 Skill Re-Integration. Cleared for light batting drills.", time: "45 mins ago", read: false, actionLabel: "View Rehab Plan →", targetPage: "injuries" },
  { id: "a3", category: "logistics", title: "Transport Dispatch Confirmed", body: "Iveco 35-Seater Coach (ND 849-211) scheduled for DHS Away Match on Saturday. Departs 06:30 sharp from Westville Oval gates.", time: "2 hours ago", read: false, actionLabel: "View Passenger Manifest →", targetPage: "logistics" },
  { id: "a4", category: "grounds", title: "Pitch Condition Alert", body: "Bowden's Field Strip #2 moisture recorded at 17.0%. Compaction rolling complete. Outfield cut to 4.0mm.", time: "3 hours ago", read: true, actionLabel: "Inspect Pitch Data →", targetPage: "fields" },
  { id: "a5", category: "fixture", title: "Fixture Reschedule Notice", body: "Westville U13A vs Michaelhouse Prep adjusted to start at 10:00 AM on Roy Couzens Oval to allow visiting team travel.", time: "5 hours ago", read: true, actionLabel: "View Master Calendar →", targetPage: "calendar" },
];

export default function NotificationsView({ theme: D, onNavigate }: NotificationsViewProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const toggleRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: !a.read } : a));
  };

  const filteredAlerts = categoryFilter === "all"
    ? alerts
    : alerts.filter(a => a.category === categoryFilter);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "match": return { col: D.emerald, icon: "🏏", label: "MATCH EVENT" };
      case "medical": return { col: D.rose, icon: "⚕️", label: "MEDICAL" };
      case "logistics": return { col: D.amber, icon: "🚌", label: "FLEET & BUS" };
      case "grounds": return { col: D.teal, icon: "🌿", label: "CURATOR" };
      default: return { col: D.sky, icon: "📅", label: "FIXTURE" };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
              System Alerts & Institutional Notifications
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            Real-time feed of live match milestones, medical clearances, bus manifests, and weather ground advisories
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✓ Mark All As Read
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'match', 'medical', 'logistics', 'grounds', 'fixture'].map(cat => {
          const isSel = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                border: `1px solid ${isSel ? D.indigo : D.border}`,
                background: isSel ? D.indigo : D.surf1,
                color: isSel ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat === 'all' ? `All Alerts (${alerts.length})` : cat}
            </button>
          );
        })}
      </div>

      {/* Alerts Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredAlerts.map(a => {
          const badge = getCategoryBadge(a.category);
          return (
            <div
              key={a.id}
              style={{
                padding: '16px 18px',
                borderRadius: D.lg,
                background: !a.read ? `${D.indigo}10` : D.surf1,
                border: `1px solid ${!a.read ? D.indigo + '44' : D.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: '260px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: D.md, background: badge.col + '22', border: `1px solid ${badge.col}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {badge.icon}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: badge.col }}>
                      {badge.label}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      {a.time}
                    </span>
                    {!a.read && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: D.indigo }} />
                    )}
                  </div>

                  <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>
                    {a.title}
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>
                    {a.body}
                  </div>

                  {a.actionLabel && a.targetPage && (
                    <button
                      onClick={() => onNavigate(a.targetPage!)}
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '6px',
                        padding: '4px 10px',
                        borderRadius: D.sm,
                        background: `${D.indigo}18`,
                        border: `1px solid ${D.indigo}44`,
                        color: D.sky,
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {a.actionLabel}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleRead(a.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: D.sm,
                  background: 'transparent',
                  border: `1px solid ${D.border}`,
                  color: D.textMuted,
                  fontFamily: D.mono,
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                {a.read ? 'Mark Unread' : 'Mark Read'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
