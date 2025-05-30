
import type { LucideIcon } from 'lucide-react';
import { 
  Shield, Users, CalendarDays, ListChecks, Trophy, Sparkles, UsersRound, Target, LayoutGrid, Radar, School as SchoolIcon, Tv, Home, Settings, FilePenLine, UserCheck, Tractor, Map, UserCog
} from 'lucide-react';

export interface NavLink {
  href: string;
  label?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  separator?: boolean; // This might need to be revisited if used with sub-links
  subLinks?: NavLink[];
  key?: string; // Add the key property
}

const baseNavLinks: NavLink[] = [
  { href: '/', label: 'Dashboard', icon: Home, key: 'dashboard' },
  { separator: true, href: 'separator-teams', key: 'separator-teams' },
  { href: '/teams', label: 'Team Directory', icon: Shield, key: 'team-directory' },
  { href: '/players', label: 'Player Profiles', icon: Users, key: 'player-profiles' },
  { href: '/schools', label: 'School Profiles', icon: SchoolIcon, key: 'school-profiles' },
  { separator: true, href: 'separator-matches', key: 'separator-matches' },
  { href: '/fixtures', label: 'Match Fixtures', icon: CalendarDays, key: 'match-fixtures' },
  { href: '/results', label: 'Match Results', icon: ListChecks, key: 'match-results' },
  { href: '/live-scoring', label: 'Live Scoring', icon: Tv, disabled: true, key: 'live-scoring' }, // Placeholder
  { href: '/prematch', label: 'Prematch Process', icon: UsersRound, disabled: true, key: 'prematch-process' }, // Placeholder
  { separator: true, href: 'separator-awards', key: 'separator-awards' },
  { href: '/awards', label: 'Awards & Accolades', icon: Trophy, key: 'awards' },
  { href: '/suggest-role', label: 'Suggest Player Role', icon: Sparkles, key: 'suggest-player-role' },
  { separator: true, href: 'separator-charts', key: 'separator-charts' },
  { href: '/wagon-wheel', label: 'Wagon Wheel', icon: Target, disabled: true, key: 'wagon-wheel' },
  { href: '/scoring-zones', label: 'Scoring Zones', icon: LayoutGrid, disabled: true, key: 'scoring-zones' },
  { href: '/spider-chart', label: 'Spider Chart', icon: Radar, disabled: true, key: 'spider-chart' },
  { separator: true, href: 'separator-personnel', label: '', icon: Users, key: 'separator-personnel' },
  { href: '/umpire-profiles', label: 'Umpire Profiles', icon: UserCheck, disabled: false, key: 'umpire-profiles' },
  { href: '/groundskeeper-profiles', label: 'Groundskeepers', icon: Tractor, disabled: false, key: 'groundskeeper-profiles' },
  { href: '/field-directory', label: 'Field Directory', icon: Map, disabled: false, key: 'field-directory' },
  { href: '/admin/user-management', label: 'User Management', icon: UserCog, disabled: false, key: 'user-management' }, // Moved here
];

export const bottomNavLinks: NavLink[] = [
    { href: '/settings', label: 'Settings', icon: Settings, disabled: false, key: 'settings' },
    // Removed User Management from here
];

export const navLinks = baseNavLinks;

