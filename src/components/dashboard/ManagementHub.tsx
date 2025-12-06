import ManagementCard from './ManagementCard';
import { 
  Users, UserCog, UserCheck, Shield, Trophy, ListChecks, 
  School, MapPin, Truck, Wallet, Handshake, Database, UsersRound 
} from 'lucide-react';

export default function ManagementHub() {
  const managementCards = [
    {
      icon: Users,
      title: 'Player Management',
      description: 'Manage all player profiles, stats, and roles.',
      href: '/players'
    },
    {
      icon: UserCog,
      title: 'Staff Management',
      description: 'Manage coaches, medical staff, and grounds keepers.',
      href: '/people'
    },
    {
      icon: UserCheck,
      title: 'Official Management',
      description: 'Manage umpires, scorers, and other match officials.',
      href: '/people'
    },
    {
      icon: Shield,
      title: 'Team Management',
      description: 'Create teams and manage rosters.',
      href: '/teams'
    },
    {
      icon: Trophy,
      title: 'Competition Management',
      description: 'Set up leagues, cups, and tournaments.',
      href: '/browse-leagues'
    },
    {
      icon: ListChecks,
      title: 'Fixture Management',
      description: 'Schedule and manage all available grounds.',
      href: '/matches'
    },
    {
      icon: School,
      title: 'School & Division Management',
      description: 'Manage schools, divisions, and seasons.',
      href: '/schools'
    },
    {
      icon: MapPin,
      title: 'Field & Venue Management',
      description: 'Manage all available grounds.',
      href: '/fields'
    },
    {
      icon: Truck,
      title: 'Transport Hub',
      description: 'Manage vehicles and driver assignments.',
      href: '/transport'
    },
    {
      icon: Wallet,
      title: 'Financials',
      description: 'Track income and expenses.',
      href: '/financials'
    },
    {
      icon: Handshake,
      title: 'Sponsors',
      description: 'Manage league and team sponsors.',
      href: '/sponsors'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Migrate sample data or clear records.',
      href: '/data-management'
    },
    {
      icon: UsersRound,
      title: 'User Management',
      description: 'Invite new users or manage existing user roles.',
      href: '/user-management'
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Management Hub
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Quick access to key management areas where you can add and assign resources.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {managementCards.map((card, index) => (
          <ManagementCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
