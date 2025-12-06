"use client";

import { useEffect, useState } from "react";
import { usePermissionView } from "@/contexts/PermissionViewContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { fetchLiveMatches, fetchMatches } from "@/lib/firestore";
import { Match } from "@/types/firestore";
import { USER_ROLES } from "@/lib/roles";
import { SmartDailyBriefing } from "@/components/dashboard/SmartDailyBriefing";

// Dashboard Components
import AdminDashboard from "@/components/dashboards/admin-dashboard";
import CoachDashboard from "@/components/dashboards/coach-dashboard";
import DriverDashboard from "@/components/dashboards/driver-dashboard";
import GroundskeeperDashboard from "@/components/dashboards/groundskeeper-dashboard";
import GuardianDashboard from "@/components/dashboards/guardian-dashboard";
import MedicalDashboard from "@/components/dashboards/medical-dashboard";
import PlayerDashboard from "@/components/dashboards/player-dashboard";
import SpectatorDashboard from "@/components/dashboards/spectator-dashboard";
import SportsmasterDashboard from "@/components/dashboards/sportsmaster-dashboard";
import TrainerDashboard from "@/components/dashboards/trainer-dashboard";
import UmpireScorerDashboard from "@/components/dashboards/umpire-scorer-dashboard";

export default function HomePage() {
  const { currentRole } = usePermissionView();
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [live, recent] = await Promise.all([
          fetchLiveMatches(),
          fetchMatches(5)
        ]);
        setLiveMatches(live);
        setRecentMatches(recent.filter(m => m.status === 'completed'));
      } catch (error) {
        console.error("Failed to load home page data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const tickerMatches = [...liveMatches, ...recentMatches];

  const renderDashboard = () => {
    switch (currentRole) {
      // Administrative
      case USER_ROLES.SYSTEM_ARCHITECT:
      case USER_ROLES.ADMIN:
        return <AdminDashboard />;
      case USER_ROLES.SPORTSMASTER:
        return <SportsmasterDashboard />;
      case USER_ROLES.SCHOOL_ADMIN:
        return <AdminDashboard />;

      // Team Staff
      case USER_ROLES.COACH:
      case USER_ROLES.ASSISTANT_COACH:
      case USER_ROLES.TEAM_MANAGER:
        return <CoachDashboard />;
      case USER_ROLES.CAPTAIN:
        return <PlayerDashboard />;

      // Players & Spectators
      case USER_ROLES.PLAYER:
        return <PlayerDashboard />;
      case USER_ROLES.GUARDIAN:
        return <GuardianDashboard />;
      case USER_ROLES.SPECTATOR:
        return <SpectatorDashboard />;

      // Support & Medical
      case USER_ROLES.TRAINER:
        return <TrainerDashboard />;
      case USER_ROLES.PHYSIOTHERAPIST:
      case USER_ROLES.DOCTOR:
      case USER_ROLES.FIRST_AID:
        return <MedicalDashboard />;

      // Officials & Ground Staff
      case USER_ROLES.UMPIRE:
      case USER_ROLES.SCORER:
        return <UmpireScorerDashboard />;
      case USER_ROLES.GROUNDS_KEEPER:
        return <GroundskeeperDashboard />;
      case USER_ROLES.DRIVER:
        return <DriverDashboard />;
        
      default:
        return <SpectatorDashboard />;
    }
  };

  return (
    <div className="pb-16">
      {/* Live Ticker */}
      {tickerMatches.length > 0 && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-3 overflow-hidden whitespace-nowrap relative mb-8">
          <div className="inline-block animate-ticker pl-[100%]">
            {tickerMatches.map((match) => (
              <span key={match.id} className="inline-flex items-center mr-12">
                <span className="font-semibold mr-2">
                  {match.homeTeamName || 'Home'} vs {match.awayTeamName || 'Away'}
                </span>
                <span className="mr-2">
                  <Badge variant={match.status === 'live' ? 'destructive' : 'default'}>
                    {match.status === 'live' ? 'LIVE' : 'RESULT'}
                  </Badge>
                </span>
                <span className="text-muted-foreground">
                  {match.status === 'live' ? 
                    `${match.liveScore?.innings?.runs || 0}/${match.liveScore?.innings?.wickets || 0}` : 
                    match.result || 'Match Completed'}
                </span>
              </span>
            ))}
          </div>
          <style jsx>{`
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
            .animate-ticker {
              animation: ticker 30s linear infinite;
            }
          `}</style>
        </div>
      )}

      {/* Hero / Welcome Section */}
      <div className="px-4 md:px-8 mb-8">
        <h1 className="text-4xl font-extrabold mb-2">
          Welcome back, <span className="text-primary">{user?.displayName || 'Guest'}</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          {currentRole} Dashboard
        </p>
      </div>

      {/* Smart Daily Briefing */}
      <div className="px-4 md:px-8">
        <SmartDailyBriefing userName={user?.displayName?.split(' ')[0]} role={currentRole} />
      </div>

      {/* Dashboard Content */}
      <div className="px-4 md:px-8">
        {renderDashboard()}
      </div>
    </div>
  );
}
