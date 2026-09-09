'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { Shield, CheckCircle2, AlertTriangle, RotateCcw, Save, Users, Zap } from 'lucide-react';

interface FieldPlacementEditorModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onSavePreset?: (presetName: string, positions: FieldPosition[]) => void;
}

export interface FieldPosition {
  id: string;
  name: string;
  x: number; // percentage 0 to 100 on canvas
  y: number; // percentage 0 to 100 on canvas
  zone: 'circle' | 'deep' | 'slip';
}

const PRESETS: Record<string, FieldPosition[]> = {
  powerplay: [
    { id: 'wk', name: 'Wicketkeeper', x: 50, y: 55, zone: 'slip' },
    { id: 's1', name: '1st Slip', x: 55, y: 56, zone: 'slip' },
    { id: 's2', name: '2nd Slip', x: 60, y: 58, zone: 'slip' },
    { id: 'gully', name: 'Gully', x: 68, y: 52, zone: 'circle' },
    { id: 'point', name: 'Point', x: 75, y: 40, zone: 'circle' },
    { id: 'cover', name: 'Cover', x: 68, y: 28, zone: 'circle' },
    { id: 'mid_off', name: 'Mid-Off', x: 58, y: 22, zone: 'circle' },
    { id: 'mid_on', name: 'Mid-On', x: 42, y: 22, zone: 'circle' },
    { id: 'mid_wicket', name: 'Mid-Wicket', x: 32, y: 32, zone: 'circle' },
    { id: 'sq_leg', name: 'Square Leg', x: 24, y: 45, zone: 'circle' },
    { id: 'third_man', name: 'Third Man', x: 82, y: 75, zone: 'deep' },
    // Only 2 outside allowed in P1
  ],
  attacking: [
    { id: 'wk', name: 'Wicketkeeper', x: 50, y: 55, zone: 'slip' },
    { id: 's1', name: '1st Slip', x: 55, y: 56, zone: 'slip' },
    { id: 's2', name: '2nd Slip', x: 60, y: 58, zone: 'slip' },
    { id: 's3', name: '3rd Slip', x: 65, y: 61, zone: 'slip' },
    { id: 'gully', name: 'Gully', x: 70, y: 52, zone: 'circle' },
    { id: 'point', name: 'Point', x: 76, y: 42, zone: 'circle' },
    { id: 'cover', name: 'Cover', x: 65, y: 30, zone: 'circle' },
    { id: 'mid_off', name: 'Mid-Off', x: 56, y: 22, zone: 'circle' },
    { id: 'mid_on', name: 'Mid-On', x: 44, y: 22, zone: 'circle' },
    { id: 'mid_wicket', name: 'Mid-Wicket', x: 30, y: 35, zone: 'circle' },
    { id: 'fine_leg', name: 'Fine Leg', x: 35, y: 82, zone: 'deep' },
  ],
  death: [
    { id: 'wk', name: 'Wicketkeeper', x: 50, y: 55, zone: 'slip' },
    { id: 'third_man', name: 'Deep 3rd Man', x: 82, y: 78, zone: 'deep' },
    { id: 'sweeper', name: 'Sweeper Cover', x: 85, y: 30, zone: 'deep' },
    { id: 'long_off', name: 'Long Off', x: 62, y: 12, zone: 'deep' },
    { id: 'long_on', name: 'Long On', x: 38, y: 12, zone: 'deep' },
    { id: 'deep_mid_wicket', name: 'Deep Mid-Wicket', x: 18, y: 28, zone: 'deep' },
    { id: 'deep_square', name: 'Deep Sq Leg', x: 14, y: 48, zone: 'deep' },
    { id: 'fine_leg', name: 'Deep Fine Leg', x: 26, y: 82, zone: 'deep' },
    { id: 'point', name: 'Infield Point', x: 72, y: 40, zone: 'circle' },
    { id: 'mid_wicket', name: 'Infield Mid-Wicket', x: 32, y: 38, zone: 'circle' },
    { id: 'mid_off', name: 'Mid-Off', x: 52, y: 25, zone: 'circle' },
  ],
  spin_choke: [
    { id: 'wk', name: 'Wicketkeeper', x: 50, y: 55, zone: 'slip' },
    { id: 'slip', name: 'Slip', x: 55, y: 56, zone: 'slip' },
    { id: 'silly_point', name: 'Silly Point', x: 57, y: 44, zone: 'circle' },
    { id: 'short_leg', name: 'Short Leg', x: 43, y: 44, zone: 'circle' },
    { id: 'cover', name: 'Cover', x: 68, y: 32, zone: 'circle' },
    { id: 'mid_off', name: 'Mid-Off', x: 55, y: 25, zone: 'circle' },
    { id: 'mid_on', name: 'Mid-On', x: 45, y: 25, zone: 'circle' },
    { id: 'mid_wicket', name: 'Mid-Wicket', x: 35, y: 32, zone: 'circle' },
    { id: 'long_off', name: 'Long Off', x: 68, y: 12, zone: 'deep' },
    { id: 'long_on', name: 'Long On', x: 32, y: 12, zone: 'deep' },
    { id: 'deep_sq', name: 'Deep Backward Sq', x: 15, y: 60, zone: 'deep' },
  ],
};

export default function FieldPlacementEditorModal({
  theme: D,
  isOpen,
  onClose,
  onSavePreset,
}: FieldPlacementEditorModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('powerplay');
  const [positions, setPositions] = useState<FieldPosition[]>(PRESETS.powerplay);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setPositions(PRESETS[presetKey] || PRESETS.powerplay);
  };

  // Count fielders outside circle (radius > approx 35% from center 50,50)
  const outsideCount = positions.filter(p => {
    const dx = p.x - 50;
    const dy = p.y - 48;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist > 28 && p.zone !== 'slip';
  }).length;

  const isPowerplayLegal = outsideCount <= 2;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10020,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '880px',
        maxHeight: '92vh',
        background: D.surf1,
        border: `1px solid ${D.borderMed}`,
        borderRadius: D.xl,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden',
        color: D.textPrimary,
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: D.surf0,
          borderBottom: `1px solid ${D.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: D.md,
              background: `${D.emerald}20`,
              border: `1px solid ${D.emerald}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>
              🛡️
            </div>
            <div>
              <h2 style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800, margin: 0 }}>
                Interactive 11-Man Field Placement Editor
              </h2>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                Cricket Captain tactical presets & Powerplay restriction compliance validation
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Preset Bar */}
        <div style={{
          padding: '12px 20px',
          background: D.surf0,
          borderBottom: `1px solid ${D.border}`,
          display: 'flex',
          gap: '8px',
          alignItem: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, alignSelf: 'center', marginRight: '8px' }}>
            TACTICAL PRESETS:
          </span>
          {[
            { id: 'powerplay', label: '⚡ Powerplay Ring (Max 2 Out)' },
            { id: 'attacking', label: '🔥 Attacking Slips (3 Slips + Gully)' },
            { id: 'death', label: '🎯 Death Overs (Boundary Block)' },
            { id: 'spin_choke', label: '🌀 Spin Choke (Infield Web)' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                background: selectedPreset === p.id ? `${D.emerald}25` : D.surf2,
                border: `1.5px solid ${selectedPreset === p.id ? D.emerald : D.border}`,
                color: selectedPreset === p.id ? D.emerald : D.textPrimary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Body: Oval Canvas & Position Sidebar */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0', overflow: 'hidden' }}>
          {/* Cricket Oval Graphical Canvas */}
          <div style={{
            position: 'relative',
            background: 'radial-gradient(circle, #166534 0%, #14532d 50%, #052e16 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'hidden',
          }}>
            {/* Boundary Oval */}
            <div style={{
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              border: '2px dashed rgba(255,255,255,0.3)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* 30-Yard Circle */}
              <div style={{
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.4)',
                position: 'absolute',
                top: '90px',
                left: '90px',
              }} />

              {/* Pitch Strip in center */}
              <div style={{
                width: '36px',
                height: '90px',
                background: '#d4d4d8',
                borderRadius: '4px',
                position: 'absolute',
                top: '155px',
                left: '182px',
                border: '1px solid #71717a',
              }} />

              {/* Render Fielders */}
              {positions.map((f, idx) => (
                <div
                  key={f.id}
                  title={`${f.name} (${f.zone})`}
                  style={{
                    position: 'absolute',
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: f.zone === 'slip' ? '#f59e0b' : f.zone === 'circle' ? '#38bdf8' : '#10b981',
                    border: '2px solid #ffffff',
                    color: '#030712',
                    fontFamily: D.mono,
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    cursor: 'grab',
                    zIndex: 10,
                  }}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Compliance Badge Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              padding: '8px 12px',
              borderRadius: D.md,
              background: 'rgba(3, 7, 18, 0.8)',
              border: `1px solid ${isPowerplayLegal ? D.emerald : D.rose}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: D.head,
              fontSize: '11px',
            }}>
              {isPowerplayLegal ? (
                <CheckCircle2 size={16} color={D.emerald} />
              ) : (
                <AlertTriangle size={16} color={D.rose} />
              )}
              <div>
                <div style={{ fontWeight: 800, color: isPowerplayLegal ? D.emerald : D.rose }}>
                  {isPowerplayLegal ? 'Legal Powerplay Field' : 'Field Violation Alert!'}
                </div>
                <div style={{ color: D.textMuted, fontSize: '10px' }}>
                  {outsideCount} fielders outside 30yd ring (Max 2 allowed)
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Position List */}
          <div style={{
            background: D.surf0,
            borderLeft: `1px solid ${D.border}`,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
          }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
              FIELDING ROLES ({positions.length}/11)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {positions.map((pos, idx) => (
                <div
                  key={pos.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: D.sm,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: pos.zone === 'slip' ? `${D.amber}33` : pos.zone === 'circle' ? `${D.sky}33` : `${D.emerald}33`,
                      color: pos.zone === 'slip' ? D.amber : pos.zone === 'circle' ? D.sky : D.emerald,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700 }}>
                      {pos.name}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: D.mono,
                    fontSize: '9px',
                    color: D.textMuted,
                    textTransform: 'uppercase',
                  }}>
                    {pos.zone}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (onSavePreset) onSavePreset(selectedPreset, positions);
                onClose();
              }}
              style={{
                marginTop: 'auto',
                width: '100%',
                padding: '10px',
                borderRadius: D.md,
                background: D.emerald,
                color: '#fff',
                border: 'none',
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Save size={15} />
              <span>Apply Field Setting</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
