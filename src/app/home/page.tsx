"use client";

import { usePermissionView } from "@/contexts/PermissionViewContext";
import { useAuth } from "@/contexts/AuthContext";
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
