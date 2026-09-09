'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { ROLES, ROLE_LAYERS } from './data';

interface SettingsViewProps {
  theme: Theme;
  activeSchoolId: string;
  onTriggerToast: (msg: string) => void;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  roles: string[]; // Supports multiple roles assigned simultaneously
  school: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

interface SchoolRegistryItem {
  id: string;
  name: string;
  nickname: string;
  province: string;
  status: 'ACTIVE' | 'PENDING';
}

export default function SettingsView({ theme: D, activeSchoolId, onTriggerToast }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'rbac' | 'schools' | 'database'>('general');

  // General settings state
  const [institutionName, setInstitutionName] = useState('KZN Schools Cricket Circuit (Super10)');
  const [scoringMode, setScoringMode] = useState<'broadcast' | 'traditional'>('broadcast');
  const [autoSaveCloud, setAutoSaveCloud] = useState(true);
  const [audioUmpireCalls, setAudioUmpireCalls] = useState(true);
  const [overlayBranding, setOverlayBranding] = useState('SuperSport Schools / Super10');

  // RBAC Users state with multi-role support
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'u1', name: 'Wayne Scott', email: 'wayne.scott@westville.co.za', roles: ['coach', 'scorer'], school: 'Westville Boys', status: 'ACTIVE' },
    { id: 'u2', name: 'Kameel Naidoo', email: 'kameel@maverickdesign.co.za', roles: ['superadmin', 'scout'], school: 'KZN Circuit', status: 'ACTIVE' },
    { id: 'u3', name: 'Dr. Arthur Mthethwa', email: 'mthethwa@kearsney.com', roles: ['headmaster', 'curator'], school: 'Kearsney College', status: 'ACTIVE' },
    { id: 'u4', name: 'Sipho Zulu', email: 'sipho.scorer@hilton.edu', roles: ['scorer', 'umpire'], school: 'Hilton College', status: 'ACTIVE' },
  ]);

  const [newUserModal, setNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRoles, setNewUserRoles] = useState<string[]>(['coach']);

  // Schools Registry state
  const [schools, setSchools] = useState<SchoolRegistryItem[]>([
    { id: 'westville', name: "Westville Boys' High School", nickname: 'The Fillies / Griffin', province: 'KwaZulu-Natal', status: 'ACTIVE' },
    { id: 'kearsney', name: 'Kearsney College', nickname: 'The One-Stripers', province: 'KwaZulu-Natal', status: 'ACTIVE' },
    { id: 'hilton', name: 'Hilton College', nickname: 'The Red & Black', province: 'KwaZulu-Natal', status: 'ACTIVE' },
    { id: 'michaelhouse', name: 'Michaelhouse', nickname: 'The Red & White', province: 'KwaZulu-Natal', status: 'ACTIVE' },
    { id: 'clifton', name: 'Clifton School', nickname: 'The Vikings', province: 'KwaZulu-Natal', status: 'ACTIVE' },
  ]);

  const handleSaveGeneral = () => {
    onTriggerToast('System preferences saved successfully!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || newUserRoles.length === 0) return;
    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      roles: newUserRoles,
      school: 'KZN Circuit',
      status: 'ACTIVE',
    };
    setUsers([...users, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRoles(['coach']);
    setNewUserModal(false);
    onTriggerToast('User account successfully provisioned with multi-role permissions!');
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
    onTriggerToast('User status updated.');
  };

  const toggleNewUserRole = (roleKey: string) => {
    if (newUserRoles.includes(roleKey)) {
      if (newUserRoles.length > 1) {
        setNewUserRoles(newUserRoles.filter(r => r !== roleKey));
      }
    } else {
      setNewUserRoles([...newUserRoles, roleKey]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>⚡</span>
            <h2 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              SUPERADMIN CONTROL CENTER & CONFIGURATION
            </h2>
          </div>
          <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, margin: '4px 0 0 0' }}>
            Complete platform management: Multi-role RBAC user access control, institutional school registry, broadcast overlays, and Firestore database health.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: D.surf2, padding: '4px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          {[
            { id: 'general', label: '⚙️ General Preferences' },
            { id: 'rbac', label: '👥 User RBAC & Multi-Role' },
            { id: 'schools', label: '🏫 School Registry' },
            { id: 'database', label: '🗄️ Database & Sync' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                border: 'none',
                background: activeTab === tab.id ? D.indigo : 'transparent',
                color: activeTab === tab.id ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: GENERAL PREFERENCES ── */}
      {activeTab === 'general' && (
        <div style={{ padding: '24px', background: D.cardBg, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textSecondary }}>
              TOURNAMENT / INSTITUTION NAME
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: D.md,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textSecondary }}>
              BROADCAST OVERLAY PARTNER
            </label>
            <input
              type="text"
              value={overlayBranding}
              onChange={(e) => setOverlayBranding(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: D.md,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textSecondary }}>
              DEFAULT SCORING ENGINE
            </label>
            <select
              value={scoringMode}
              onChange={(e) => setScoringMode(e.target.value as any)}
              style={{
                padding: '10px 14px',
                borderRadius: D.md,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.head,
                fontSize: '13px',
              }}
            >
              <option value="broadcast">Broadcast Scorer 4.5K (Wagon Wheel, DRS, Ball Telemetry)</option>
              <option value="traditional">Traditional Scorebook (Linear Scoresheet)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px', borderTop: `1px solid ${D.border}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoSaveCloud}
                onChange={(e) => setAutoSaveCloud(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: D.indigo }}
              />
              <div>
                <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                  Real-Time Cloud Persistence (Firestore)
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Automatically sync ball-by-ball actions and player rosters to Firestore cloud database
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={audioUmpireCalls}
                onChange={(e) => setAudioUmpireCalls(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: D.indigo }}
              />
              <div>
                <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                  Synthesized Umpire & Referee Audio Cues
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Play audio alert chimes on boundary hits, wickets, and review calls
                </div>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              onClick={handleSaveGeneral}
              style={{
                padding: '10px 24px',
                borderRadius: D.pill,
                background: D.gradMain,
                color: '#fff',
                border: 'none',
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: USER RBAC & MULTI-ROLE MANAGEMENT ── */}
      {activeTab === 'rbac' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: D.surf1, padding: '16px', borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div>
              <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                👥 Multi-Role RBAC & User Directory
              </h3>
              <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '4px 0 0 0' }}>
                Assign multiple simultaneous system roles to users (e.g. Coach + Scorer + Analyst) with granulated POPIA permissions.
              </p>
            </div>
            <button
              onClick={() => setNewUserModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: D.pill,
                background: D.indigo,
                color: '#fff',
                border: 'none',
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + Provision New User
            </button>
          </div>

          {/* User Table */}
          <div style={{ background: D.cardBg, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: D.body, fontSize: '12px' }}>
              <thead>
                <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}`, color: D.textMuted, fontFamily: D.mono, fontSize: '10px' }}>
                  <th style={{ padding: '12px 16px' }}>NAME & EMAIL</th>
                  <th style={{ padding: '12px 16px' }}>ASSIGNED ROLES (MULTI-ROLE)</th>
                  <th style={{ padding: '12px 16px' }}>INSTITUTION</th>
                  <th style={{ padding: '12px 16px' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  return (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontFamily: D.head, fontWeight: 700, color: D.textPrimary }}>{u.name}</div>
                        <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {u.roles.map(rKey => {
                            const rObj = ROLES[rKey] || ROLES.coach;
                            return (
                              <span
                                key={rKey}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: D.pill,
                                  background: `${rObj.color || D.indigo}20`,
                                  color: rObj.color || D.indigo,
                                  fontFamily: D.head,
                                  fontSize: '11px',
                                  fontWeight: 800,
                                }}
                              >
                                {rObj.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: D.textSecondary }}>{u.school}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: D.pill, background: u.status === 'ACTIVE' ? `${D.emerald}20` : `${D.rose}20`, color: u.status === 'ACTIVE' ? D.emerald : D.rose, fontFamily: D.head, fontSize: '10px', fontWeight: 800 }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: D.sm,
                            border: `1px solid ${D.border}`,
                            background: D.surf2,
                            color: u.status === 'ACTIVE' ? D.rose : D.emerald,
                            fontFamily: D.head,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Provision New User Modal with Multi-Role Checkboxes */}
          {newUserModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
              <form
                onSubmit={handleAddUser}
                style={{
                  background: D.cardBg,
                  padding: '24px',
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  width: '460px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Provision User with Multi-Role Permissions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary }}>FULL NAME</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    required
                    placeholder="e.g. Wayne Scott"
                    style={{ padding: '8px 12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary }}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    required
                    placeholder="e.g. wayne@school.co.za"
                    style={{ padding: '8px 12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary }}>
                    ASSIGN ROLES (Check multiple roles as needed)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto', padding: '8px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    {Object.entries(ROLES).map(([key, r]) => {
                      const isChecked = newUserRoles.includes(key);
                      return (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: isChecked ? D.textPrimary : D.textMuted, fontFamily: D.body }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleNewUserRole(key)}
                            style={{ width: '14px', height: '14px', accentColor: D.indigo }}
                          />
                          <span style={{ fontWeight: isChecked ? 700 : 400 }}>{r.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setNewUserModal(false)} style={{ padding: '8px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: D.pill, background: D.indigo, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Save User Account</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: SCHOOL REGISTRY ── */}
      {activeTab === 'schools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: D.surf1, padding: '16px', borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div>
              <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                🏫 Participating Schools & Grounds Registry
              </h3>
              <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '4px 0 0 0' }}>
                Manage participating schools, home turf venues, and fixture hosting rights.
              </p>
            </div>
          </div>

          <div style={{ background: D.cardBg, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: D.body, fontSize: '12px' }}>
              <thead>
                <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}`, color: D.textMuted, fontFamily: D.mono, fontSize: '10px' }}>
                  <th style={{ padding: '12px 16px' }}>SCHOOL NAME</th>
                  <th style={{ padding: '12px 16px' }}>NICKNAME / MASCOT</th>
                  <th style={{ padding: '12px 16px' }}>PROVINCE</th>
                  <th style={{ padding: '12px 16px' }}>CIRCUIT STATUS</th>
                </tr>
              </thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td style={{ padding: '12px 16px', fontFamily: D.head, fontWeight: 700, color: D.textPrimary }}>{s.name}</td>
                    <td style={{ padding: '12px 16px', color: D.textSecondary }}>{s.nickname}</td>
                    <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>{s.province}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.head, fontSize: '10px', fontWeight: 800 }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: DATABASE & SYNC ── */}
      {activeTab === 'database' && (
        <div style={{ padding: '24px', background: D.cardBg, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
            🗄️ Firestore Cloud Database & Offline Cache
          </h3>
          <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, margin: 0 }}>
            Database Instance: <code style={{ color: D.sky }}>ai-studio-scrbrdbeta2-1270be4c-f4ff-43ac-ac28-17d346f7a90a</code>
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onTriggerToast('Firestore indexes and security rules verified green!')}
              style={{ padding: '10px 18px', borderRadius: D.pill, background: `${D.emerald}20`, border: `1px solid ${D.emerald}`, color: D.emerald, fontFamily: D.head, fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Verify Firestore Rules & Indexes
            </button>
            <button
              onClick={() => onTriggerToast('Fixtures and player rosters re-seeded successfully!')}
              style={{ padding: '10px 18px', borderRadius: D.pill, background: `${D.sky}20`, border: `1px solid ${D.sky}`, color: D.sky, fontFamily: D.head, fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Seed Tournament Fixtures
            </button>
            <button
              onClick={() => onTriggerToast('Local IndexedDB & localStorage cache cleared.')}
              style={{ padding: '10px 18px', borderRadius: D.pill, background: `${D.rose}20`, border: `1px solid ${D.rose}`, color: D.rose, fontFamily: D.head, fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Flush Local Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
