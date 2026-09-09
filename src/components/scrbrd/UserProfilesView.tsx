'use client';

import React, { useState, useMemo } from 'react';
import { Theme } from './types';
import { ROLES, SCHOOLS_REGISTRY } from './data';
import { getSchoolSquads } from './multiSquadData';
import { Shield, Search, UserCheck, Edit2, Mail, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface UserProfilesViewProps {
  theme: Theme;
  users: Array<{
    id: string;
    name: string;
    email: string;
    roles: string[];
    schoolId: string;
    assignedSquads?: string[];
    status: 'active' | 'suspended';
    phone?: string;
  }>;
  onUpdateUser: (updatedUser: any) => void;
  currentRole: string;
  activeSchoolId: string;
  onTriggerToast: (msg: string) => void;
}

export default function UserProfilesView({
  theme: D,
  users,
  onUpdateUser,
  currentRole,
  activeSchoolId,
  onTriggerToast,
}: UserProfilesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];
  const schoolSquads = useMemo(() => getSchoolSquads(activeSchoolId), [activeSchoolId]);

  // RBAC check: Can current user edit profiles?
  const canManageProfiles = ['superadmin', 'schooladmin', 'sportsmaster', 'doc', 'headmaster'].includes(currentRole);

  // Filter users based on school (non-superadmin restricted to activeSchoolId) and search
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // School scope check
      const matchesSchool = currentRole === 'superadmin' || u.schoolId === activeSchoolId || u.schoolId === 'KZN Circuit';
      if (!matchesSchool) return false;

      const matchesSearch = searchQuery === '' ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRoleFilter === 'all' || u.roles.includes(selectedRoleFilter);

      return matchesSearch && matchesRole;
    });
  }, [users, activeSchoolId, currentRole, searchQuery, selectedRoleFilter]);

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
    onTriggerToast(`User profile for ${editingUser.name} successfully updated!`);
  };

  const toggleUserRole = (roleKey: string) => {
    if (!editingUser) return;
    const currentRoles = editingUser.roles || [];
    if (currentRoles.includes(roleKey)) {
      if (currentRoles.length > 1) {
        setEditingUser({ ...editingUser, roles: currentRoles.filter((r: string) => r !== roleKey) });
      }
    } else {
      setEditingUser({ ...editingUser, roles: [...currentRoles, roleKey] });
    }
  };

  const toggleAssignedSquad = (squadId: string) => {
    if (!editingUser) return;
    const currentSquads = editingUser.assignedSquads || [];
    if (currentSquads.includes(squadId)) {
      setEditingUser({ ...editingUser, assignedSquads: currentSquads.filter((s: string) => s !== squadId) });
    } else {
      setEditingUser({ ...editingUser, assignedSquads: [...currentSquads, squadId] });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: D.lg,
          background: `linear-gradient(135deg, ${D.indigo}18 0%, ${D.surf1} 100%)`,
          border: `1px solid ${D.indigo}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>👤</span>
            <div>
              <h1 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                {activeSchool.name} · User Profiles & RBAC Directory
              </h1>
              <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '2px 0 0' }}>
                Strict RBAC Adherence · Manage institutional user accounts, role permissions, and team/squad assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: D.textMuted }} />
            <input
              type="text"
              placeholder="Search user profiles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedRoleFilter}
            onChange={e => setSelectedRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              outline: 'none',
            }}
          >
            <option value="all">All Roles ({Object.keys(ROLES).length})</option>
            {Object.entries(ROLES).map(([key, r]) => (
              <option key={key} value={key}>{r.icon} {r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RBAC Notice for Non-Admins */}
      {!canManageProfiles && (
        <div style={{ padding: '12px 16px', background: `${D.amber}15`, border: `1px solid ${D.amber}44`, borderRadius: D.md, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={16} style={{ color: D.amber }} />
          <span style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary }}>
            <strong>Restricted Access:</strong> You are viewing user profiles under strict RBAC read-only rules for your current role ({currentRole}). Profile modifications require Sportsmaster, School Admin, or Director of Cricket clearance.
          </span>
        </div>
      )}

      {/* Users Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredUsers.map(user => {
          const userSchool = SCHOOLS_REGISTRY.find(s => s.id === user.schoolId) || activeSchool;
          return (
            <div
              key={user.id}
              style={{
                background: D.surf0,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                      {user.name}
                    </h3>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                      {userSchool.name}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: D.pill,
                      background: user.status === 'active' ? `${D.emerald}20` : `${D.rose}20`,
                      color: user.status === 'active' ? D.emerald : D.rose,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {user.status}
                  </span>
                </div>

                {/* Contact info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', fontSize: '11px', fontFamily: D.mono, color: D.textSecondary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} style={{ color: D.sky }} />
                    <span>{user.email}</span>
                  </div>
                </div>

                {/* Assigned Roles Tags */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Assigned Roles & Permissions ({user.roles.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {user.roles.map(roleKey => {
                      const rObj = ROLES[roleKey] || { label: roleKey, icon: '🛡️', color: D.indigo };
                      return (
                        <span
                          key={roleKey}
                          style={{
                            padding: '3px 8px',
                            borderRadius: D.pill,
                            background: `${rObj.color || D.indigo}20`,
                            border: `1px solid ${rObj.color || D.indigo}44`,
                            color: rObj.color || D.indigo,
                            fontFamily: D.head,
                            fontSize: '10px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {rObj.icon} {rObj.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Teams / Squads */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Assigned Teams / Squads ({user.assignedSquads?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {user.assignedSquads && user.assignedSquads.length > 0 ? (
                      user.assignedSquads.map(sqId => {
                        const sq = schoolSquads.find(s => s.id === sqId);
                        return (
                          <span
                            key={sqId}
                            style={{
                              padding: '2px 6px',
                              borderRadius: D.pill,
                              background: D.surf2,
                              border: `1px solid ${D.border}`,
                              fontFamily: D.mono,
                              fontSize: '9px',
                              fontWeight: 700,
                              color: D.textPrimary,
                            }}
                          >
                            {sq?.name || sqId.replace(`${activeSchoolId}_`, '')}
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, fontStyle: 'italic' }}>
                        No direct squad assignments
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button for Sportsmaster / Admins */}
              {canManageProfiles && (
                <div style={{ paddingTop: '10px', borderTop: `1px solid ${D.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setEditingUser({ ...user, assignedSquads: user.assignedSquads || [], roles: [...user.roles] })}
                    style={{
                      padding: '6px 14px',
                      borderRadius: D.pill,
                      border: 'none',
                      background: D.indigo,
                      color: '#fff',
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Edit2 size={12} />
                    Update Teams & Permissions
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── EDIT PROFILE MODAL (Sportsmaster / Admin) ──────────────── */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Manage User Profile: {editingUser.name}
                </h3>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                  {editingUser.email} · {activeSchool.name}
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'none', border: 'none', color: D.textMuted, fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary, display: 'block', marginBottom: '6px' }}>
                  Account Status
                </label>
                <select
                  value={editingUser.status}
                  onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="suspended">Suspended (Access Revoked)</option>
                </select>
              </div>

              {/* Roles / Permissions Checkboxes */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary, display: 'block', marginBottom: '8px' }}>
                  Assigned Roles & Permissions (Multi-Role Support)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '8px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  {Object.entries(ROLES).map(([key, r]) => {
                    const isChecked = editingUser.roles.includes(key);
                    return (
                      <label
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontFamily: D.body,
                          fontSize: '11px',
                          color: D.textPrimary,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleUserRole(key)}
                          style={{ accentColor: D.indigo }}
                        />
                        <span>{r.icon} {r.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Team / Squad Assignments */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary, display: 'block', marginBottom: '8px' }}>
                  Assigned Teams / Squads (Coaching & Management)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  {schoolSquads.map(sq => {
                    const isAssigned = (editingUser.assignedSquads || []).includes(sq.id);
                    return (
                      <label
                        key={sq.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontFamily: D.mono,
                          fontSize: '10px',
                          color: D.textPrimary,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => toggleAssignedSquad(sq.id)}
                          style={{ accentColor: D.emerald }}
                        />
                        <span>{sq.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: D.pill,
                    border: `1px solid ${D.border}`,
                    background: 'transparent',
                    color: D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: D.indigo,
                    color: '#fff',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
