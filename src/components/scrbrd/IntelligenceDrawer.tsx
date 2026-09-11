'use client';

import React, { useState } from 'react';
import { Theme, SchoolRegistryItem } from './types';
import { Sparkles, AlertTriangle, TrendingUp, ShieldCheck, X, Check, ChevronRight, Activity } from 'lucide-react';

interface IntelligenceDrawerProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  activeSchool: SchoolRegistryItem;
  currentRole: string;
  onNavigate: (page: string) => void;
}

export default function IntelligenceDrawer({
  theme: D,
  isOpen,
  onClose,
  activeSchool,
  currentRole,
  onNavigate,
}: IntelligenceDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'tactical' | 'medical' | 'logistics'>('all');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const insights = [
    {
      id: 'ins_1',
      category: 'tactical',
      level: 'high',
      title: 'Powerplay Vulnerability Alert (DHS)',
      description: 'DHS 1st XI have conceded 42% of wickets in overs 1–6 this season. Recommend aggressive slip cordon and opening seam pace.',
      impact: '+18% Win Equity',
      actionLabel: 'View Matchup Analytics',
      actionPage: 'analytics',
    },
    {
      id: 'ins_2',
      category: 'medical',
      level: 'warning',
      title: 'Bowler Overload Threshold Exceeded',
      description: 'K. Pillay has bowled 31.4 overs over the past 7 days across 1st XI and Academy fixtures. Workload risk is currently at 86% (Critical).',
      impact: 'RTP Intervention Needed',
      actionLabel: 'Inspect Bowler Monitor',
      actionPage: 'injuries',
    },
    {
      id: 'ins_3',
      category: 'tactical',
      level: 'positive',
      title: 'Spin Rotation Efficiency Improvement',
      description: 'K. Naidoo has lowered his dot-ball percentage from 46% to 34% against left-arm orthodox spin over the last 4 matches.',
      impact: '+12.4 Strike Rate',
      actionLabel: 'Inspect Skills Radar',
      actionPage: 'skills',
    },
    {
      id: 'ins_4',
      category: 'logistics',
      level: 'warning',
      title: 'Transport Capacity Mismatch',
      description: 'Saturday U15A away fixture at Hilton College has 22 confirmed travelers but allocated Mercedes Sprinter capacity is 18 seats.',
      impact: '4 Over Capacity',
      actionLabel: 'Resolve Fleet Booking',
      actionPage: 'logistics',
    },
    {
      id: 'ins_5',
      category: 'tactical',
      level: 'info',
      title: 'Curator Turf Moisture Signal',
      description: 'Bowden\'s Oval surface reading: 14% soil moisture with compact hardness. Average 1st innings total this term is 248. Toss advantage favors batting first.',
      impact: 'Pitch Rating 8.6/10',
      actionLabel: 'View Curator Telemetry',
      actionPage: 'fields',
    },
  ];

  const filteredInsights = insights.filter((item) => {
    if (resolvedIds.includes(item.id)) return false;
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const markResolved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvedIds((prev) => [...prev, id]);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        background: 'rgba(6, 9, 16, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: D.isDark ? '#0f172a' : '#ffffff',
          borderLeft: `1px solid ${D.borderMed}`,
          boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${D.border}`,
            background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${D.indigo}25, ${D.emerald}25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: D.indigo,
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: D.head,
                  fontSize: '17px',
                  fontWeight: 800,
                  color: D.textPrimary,
                  margin: 0,
                }}
              >
                SCRBRD Intelligence Feed
              </h2>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                {activeSchool.shortName} · Role Context: <strong style={{ color: D.textSecondary }}>{currentRole}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${D.border}`,
              background: 'transparent',
              color: D.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Material 3 Filter Chips */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${D.border}`,
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {(['all', 'tactical', 'medical', 'logistics'] as const).map((cat) => {
            const isSelected = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: isSelected ? `1px solid ${D.indigo}` : `1px solid ${D.border}`,
                  background: isSelected ? `${D.indigo}20` : 'transparent',
                  color: isSelected ? D.indigo : D.textSecondary,
                  fontFamily: D.body,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat === 'all' ? 'All Signals' : cat}
              </button>
            );
          })}
        </div>

        {/* Content stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredInsights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: D.textMuted }}>
              <ShieldCheck size={36} color={D.emerald} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 600, color: D.textPrimary }}>All Signals Clear</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                No active operational anomalies or alerts for this filter.
              </div>
            </div>
          ) : (
            filteredInsights.map((item) => {
              const isWarning = item.level === 'warning';
              const isPositive = item.level === 'positive';
              const accentColor = isWarning ? D.amber : isPositive ? D.emerald : D.indigo;

              return (
                <div
                  key={item.id}
                  style={{
                    background: D.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '16px',
                    border: `1px solid ${D.border}`,
                    borderLeft: `4px solid ${accentColor}`,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isWarning ? (
                        <AlertTriangle size={16} color={accentColor} />
                      ) : isPositive ? (
                        <TrendingUp size={16} color={accentColor} />
                      ) : (
                        <Activity size={16} color={accentColor} />
                      )}
                      <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>
                        {item.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => markResolved(item.id, e)}
                      title="Dismiss insight"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: D.textMuted,
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <Check size={16} />
                    </button>
                  </div>

                  <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, margin: 0, lineHeight: 1.5 }}>
                    {item.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                      paddingTop: '8px',
                      borderTop: `1px solid ${D.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: D.mono,
                        fontSize: '11px',
                        fontWeight: 700,
                        color: accentColor,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: `${accentColor}15`,
                      }}
                    >
                      {item.impact}
                    </span>

                    <button
                      onClick={() => {
                        onNavigate(item.actionPage);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        color: D.indigo,
                        fontFamily: D.body,
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{item.actionLabel}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${D.border}`,
            background: D.isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: D.mono,
            color: D.textMuted,
          }}
        >
          <span>Auto-refresh: Realtime</span>
          <span>Powered by Gemini 3.5 & SCRBRD FSM</span>
        </div>
      </div>
    </div>
  );
}
