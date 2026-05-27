import { useMemo, useState } from "react";
import { AccessDenied } from "./components/AccessDenied";
import { Dashboard } from "./components/Dashboard";
import { FinalResult } from "./components/FinalResult";
import { FinalCertificationQuiz } from "./components/FinalCertificationQuiz";
import { LoginScreen } from "./components/LoginScreen";
import { ModuleView } from "./components/ModuleView";
import { QuizView } from "./components/QuizView";
import { ReferenceCenter } from "./components/ReferenceCenter";
import { RoleSelection } from "./components/RoleSelection";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { WelcomeScreen } from "./components/WelcomeScreen";
import {
  clearTrainingSession,
  emptyProgress,
  getTrainingSession,
  loadProgress,
  markModuleCompleted,
  resetAllLocalTrainingData,
  resetCurrentUserProgress,
  saveFinalQuizScore,
  saveQuizScore,
  saveTrainingSession,
  selectRole
} from "./lib/progress";
import type { QuizScore } from "./lib/quiz";
import type { Role } from "./training-content";
import { getModuleById, getModulesForRole } from "./training-content";
import {
  canAccessRole,
  getAccessibleRoles,
  getDefaultRoleForUser,
  isTrainingAdmin,
  type TrainingSessionUser
} from "./training-users";

type Screen =
  | "welcome"
  | "roles"
  | "dashboard"
  | "module"
  | "scenario"
  | "quiz"
  | "reference"
  | "certification"
  | "accessDenied"
  | "final";

function App() {
  const [currentUser, setCurrentUser] = useState<TrainingSessionUser | null>(() =>
    getTrainingSession()
  );
  const [currentRole, setCurrentRole] = useState<Role | null>(() => {
    const session = getTrainingSession();
    return session ? getDefaultRoleForUser(session) : null;
  });
  const [progress, setProgress] = useState(() => {
    const session = getTrainingSession();
    if (!session) {
      return { ...emptyProgress };
    }
    const role = getDefaultRoleForUser(session);
    return loadProgress(session.email, role);
  });
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [deniedRole, setDeniedRole] = useState<Role | null>(null);

  const selectedRole = currentRole;
  const isAdmin = isTrainingAdmin(currentUser);
  const accessibleRoles = currentUser ? getAccessibleRoles(currentUser) : [];
  const modules = useMemo(
    () =>
      selectedRole && currentUser && canAccessRole(currentUser, selectedRole)
        ? getModulesForRole(selectedRole)
        : [],
    [currentUser, selectedRole]
  );
  const activeModule = activeModuleId ? getModuleById(activeModuleId) : undefined;
  const canOpenActiveScenario = Boolean(
    activeModule?.scenario &&
      selectedRole &&
      (isAdmin || activeModule.scenario.role === selectedRole)
  );

  function openRole(role: Role) {
    if (!currentUser || !canAccessRole(currentUser, role)) {
      setDeniedRole(role);
      setScreen("accessDenied");
      return;
    }

    setCurrentRole(role);
    setProgress(loadProgress(currentUser.email, role));
    setActiveModuleId(null);
    setScreen("dashboard");
  }

  function handleLogin(user: TrainingSessionUser) {
    saveTrainingSession(user);
    const role = getDefaultRoleForUser(user);
    setCurrentUser(user);
    setCurrentRole(role);
    setProgress(loadProgress(user.email, role));
    setActiveModuleId(null);
    setScreen("dashboard");
  }

  function handleLogout() {
    clearTrainingSession();
    setCurrentUser(null);
    setCurrentRole(null);
    setProgress({ ...emptyProgress });
    setActiveModuleId(null);
    setScreen("dashboard");
  }

  function handleSelectRole(role: Role) {
    if (!currentUser || !canAccessRole(currentUser, role)) {
      setDeniedRole(role);
      setScreen("accessDenied");
      return;
    }

    setCurrentRole(role);
    setProgress(selectRole(role, currentUser.email));
    setScreen("dashboard");
  }

  function handleOpenModule(moduleId: string) {
    const module = getModuleById(moduleId);
    if (!module || !currentUser || !selectedRole || !canAccessRole(currentUser, selectedRole)) {
      setDeniedRole(selectedRole);
      setScreen("accessDenied");
      return;
    }

    if (!isAdmin && !module.roles.includes(selectedRole)) {
      setDeniedRole(selectedRole);
      setScreen("accessDenied");
      return;
    }

    setActiveModuleId(moduleId);
    setScreen("module");
  }

  function handleCompleteModule(moduleId: string) {
    if (!currentUser || !selectedRole) {
      return;
    }

    setProgress(markModuleCompleted(moduleId, currentUser.email, selectedRole));
  }

  function handleSaveQuizScore(moduleId: string, score: QuizScore) {
    if (!currentUser || !selectedRole) {
      return;
    }

    setProgress(saveQuizScore(moduleId, score, currentUser.email, selectedRole));
  }

  function handleSaveFinalQuizScore(score: QuizScore, examRole?: Role) {
    if (!currentUser || !selectedRole) {
      return;
    }

    const roleForScore = examRole ?? selectedRole;
    const updatedProgress = saveFinalQuizScore(score, currentUser.email, roleForScore);
    if (roleForScore === selectedRole) {
      setProgress(updatedProgress);
    }
  }

  function handleResetProgress() {
    if (!currentUser || !selectedRole) {
      return;
    }

    setProgress(resetCurrentUserProgress(currentUser.email, selectedRole));
    setActiveModuleId(null);
    setScreen("dashboard");
  }

  function handleResetAllTrainingData() {
    resetAllLocalTrainingData();
    setCurrentUser(null);
    setCurrentRole(null);
    setProgress({ ...emptyProgress });
    setActiveModuleId(null);
    setScreen("dashboard");
  }

  let content;

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (selectedRole && !canAccessRole(currentUser, selectedRole)) {
    content = (
      <AccessDenied
        requestedRole={selectedRole}
        user={currentUser}
        onBack={() => openRole(getDefaultRoleForUser(currentUser))}
      />
    );
  } else if (screen === "accessDenied") {
    content = (
      <AccessDenied
        requestedRole={deniedRole}
        user={currentUser}
        onBack={() => openRole(getDefaultRoleForUser(currentUser))}
      />
    );
  } else if (screen === "welcome") {
    content = (
      <WelcomeScreen
        hasProgress={Boolean(selectedRole)}
        onStart={() => setScreen("roles")}
        onContinue={() => setScreen(selectedRole ? "dashboard" : "roles")}
      />
    );
  } else if (screen === "roles") {
    content = (
      <RoleSelection
        selectedRole={selectedRole}
        availableRoles={accessibleRoles}
        onBack={() => setScreen("dashboard")}
        onSelectRole={handleSelectRole}
      />
    );
  } else if (selectedRole && screen === "dashboard") {
    content = (
      <Dashboard
        modules={modules}
        progress={progress}
        role={selectedRole}
        canChangeRole={isAdmin}
        onChangeRole={() => (isAdmin ? setScreen("roles") : undefined)}
        onOpenCertification={() => setScreen("certification")}
        onOpenFinal={() => setScreen("final")}
        onOpenModule={handleOpenModule}
        onOpenReference={() => setScreen("reference")}
      />
    );
  } else if (screen === "reference") {
    content = (
      <ReferenceCenter
        currentUser={currentUser}
        role={selectedRole}
        onBack={() => setScreen(selectedRole ? "dashboard" : "welcome")}
      />
    );
  } else if (screen === "certification") {
    content = (
      <FinalCertificationQuiz
        currentUser={currentUser}
        role={selectedRole}
        previousScore={progress.finalQuizScore}
        getPreviousScore={(examRole) =>
          currentUser ? loadProgress(currentUser.email, examRole).finalQuizScore : undefined
        }
        onBack={() => setScreen(selectedRole ? "dashboard" : "welcome")}
        onSubmitScore={handleSaveFinalQuizScore}
      />
    );
  } else if (activeModule && screen === "module") {
    content = (
      <ModuleView
        completed={progress.completedModules.includes(activeModule.id)}
        canOpenScenario={canOpenActiveScenario}
        module={activeModule}
        quizScore={progress.quizScores[activeModule.id]}
        onBack={() => setScreen("dashboard")}
        onComplete={() => handleCompleteModule(activeModule.id)}
        onOpenQuiz={() => setScreen("quiz")}
        onOpenScenario={() => setScreen("scenario")}
      />
    );
  } else if (activeModule?.scenario && screen === "scenario" && canOpenActiveScenario) {
    content = (
      <ScenarioSimulator
        scenario={activeModule.scenario}
        onBack={() => setScreen("module")}
        onFinish={() => {
          handleCompleteModule(activeModule.id);
          setScreen("module");
        }}
      />
    );
  } else if (activeModule?.scenario && screen === "scenario") {
    content = (
      <AccessDenied
        requestedRole={activeModule.scenario.role}
        user={currentUser}
        onBack={() => setScreen("module")}
      />
    );
  } else if (activeModule && screen === "quiz") {
    content = (
      <QuizView
        module={activeModule}
        previousScore={progress.quizScores[activeModule.id]}
        onBack={() => setScreen("module")}
        onSubmitScore={(score) => handleSaveQuizScore(activeModule.id, score)}
      />
    );
  } else if (selectedRole && screen === "final") {
    content = (
      <FinalResult
        modules={modules}
        progress={progress}
        role={selectedRole}
        onBack={() => setScreen("dashboard")}
      />
    );
  } else {
    content = (
      <RoleSelection
        selectedRole={selectedRole}
        availableRoles={accessibleRoles}
        onBack={() => setScreen("dashboard")}
        onSelectRole={handleSelectRole}
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => setScreen("dashboard")}>
          Nova Training
        </button>
        <div className="topbar-actions">
          <span className="account-badge">{currentUser.displayName}</span>
          {selectedRole ? <span className="role-badge">{selectedRole}</span> : null}
          <span className="status-pill">{accessibleRoles.length} ролей доступно</span>
          <button className="ghost-button compact" type="button" onClick={handleResetProgress}>
            Сбросить прогресс
          </button>
          <button
            className="ghost-button compact"
            type="button"
            onClick={handleResetAllTrainingData}
          >
            Сбросить все
          </button>
          <button className="ghost-button compact" type="button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>
      {content}
    </main>
  );
}

export default App;
