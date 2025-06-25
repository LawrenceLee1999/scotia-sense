import { useAuth } from "../hooks/useAuth";
import TeamAdminPanel from "../components/TeamAdminPanel";

export default function TeamAdminDashboard() {
  const { teamId } = useAuth();

  return (
    <div className="container mb-5 mt-5">
      <h2>Team Admin Dashboard</h2>
      <p className="text-muted">Manage your team and invite users below.</p>
      {teamId ? (
        <TeamAdminPanel teamId={teamId} />
      ) : (
        <p>❗ No team assigned.</p>
      )}
    </div>
  );
}
