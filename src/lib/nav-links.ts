
import type { LucideIcon } from 'lucide-react';
import {
  Shield, Users, CalendarDays, ListChecks, Trophy, Sparkles, UsersRound, Target, LayoutGrid, Radar, School as SchoolIcon, Tv, Home, Settings, FilePenLine, UserCheck, Tractor, Map, UserCog
} from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  separator?: boolean; // This might need to be revisited if used with sub-links
  subLinks?: NavLink[];
}

export const navLinks: NavLink[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { separator: true, href: '#', label: '', icon: Home }, // Placeholder for separator logic
  { href: '/teams', label: 'Team Directory', icon: Shield },
  { href: '/players', label: 'Player Profiles', icon: Users },
  { href: '/schools', label: 'School Profiles', icon: SchoolIcon },
  { separator: true, href: '#', label: '', icon: Home },
  { href: '/fixtures', label: 'Match Fixtures', icon: CalendarDays },
  { href: '/results', label: 'Match Results', icon: ListChecks },
  { href: '/live-scoring', label: 'Live Scoring', icon: Tv, disabled: true }, // Placeholder
  { href: '/prematch', label: 'Prematch Process', icon: UsersRound, disabled: true }, // Placeholder
  { separator: true, href: '#', label: '', icon: Home },
  { href: '/awards', label: 'Awards & Accolades', icon: Trophy },
  { href: '/suggest-role', label: 'Suggest Player Role', icon: Sparkles },
  { separator: true, href: '#', label: '', icon: Home },
  { href: '/wagon-wheel', label: 'Wagon Wheel', icon: Target, disabled: true },
  { href: '/scoring-zones', label: 'Scoring Zones', icon: LayoutGrid, disabled: true },
  { href: '/spider-chart', label: 'Spider Chart', icon: Radar, disabled: true },
  { separator: true, href: '#', label: '', icon: Home },
  { href: '/scorer-profiles', label: 'Scorer Profiles', icon: FilePenLine, disabled: false },
  { href: '/umpire-profiles', label: 'Umpire Profiles', icon: UserCheck, disabled: false },
  { href: '/groundskeeper-profiles', label: 'Groundskeepers', icon: Tractor, disabled: false },
  { href: '/field-directory', label: 'Field Directory', icon: Map, disabled: false },
  { href: '/admin/user-management', label: 'User Management', icon: UserCog, disabled: false }, // Moved here
];

export const bottomNavLinks: NavLink[] = [
    { href: '/settings', label: 'Settings', icon: Settings, disabled: false },
    // Removed User Management from here
];

