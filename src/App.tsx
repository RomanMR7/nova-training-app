import { useEffect, useMemo, useState } from "react";
import { AccessDenied } from "./components/AccessDenied";
import { AdminPanel } from "./components/AdminPanel";
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
  markSimulationCompleted,
  resetAllLocalTrainingData,
  resetCurrentUserProgress,
  saveFinalQuizScore,
  saveProgress,
  saveQuizScore,
  saveTrainingSession,
  selectRole
} from "./lib/progress";
import type { QuizScore } from "./lib/quiz";
import {
  isSupabaseConfigured,
  loadSupabaseProgress,
  refreshTrainingEmployeeSession,
  refreshSupabaseSession,
  saveSupabaseProgress
} from "./lib/supabase";
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
  | "admin"
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
  const [syncStatus, setSyncStatus] = useState("");
  const [sessionReady, setSessionReady] = useState(() => {
    const session = getTrainingSession();
    return !(session?.source === "supabase" && isSupabaseConfigured());
  });

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
  const isRemoteMode = Boolean(
    currentUser?.source === "supabase" && isSupabaseConfigured()
  );

  function syncLabel() {
    if (isRemoteMode) {
      return syncStatus || "Supabase sync включен";
    }

    return "Offline demo: прогресс локально";
  }

  async function getFreshUserForSync(
    user: TrainingSessionUser
  ): Promise<TrainingSessionUser> {
    if (user.source !== "supabase" || !isSupabaseConfigured()) {
      return user;
    }

    const freshUser = await refreshSupabaseSession(user);
    if (
      freshUser.supabaseAccessToken !== user.supabaseAccessToken ||
      freshUser.supabaseRefreshToken !== user.supabaseRefreshToken
    ) {
      saveTrainingSession(freshUser);
      setCurrentUser(freshUser);
    }

    return freshUser;
  }

  async function loadProgressForRole(user: TrainingSessionUser, role: Role) {
    const localProgress = loadProgress(user.email, role);
    setProgress(localProgress);

    if (user.source !== "supabase" || !isSupabaseConfigured()) {
      setSyncStatus("Offline demo: прогресс хранится только в этом браузере.");
      return localProgress;
    }

    try {
      setSyncStatus("Загрузка прогресса из Supabase...");
      const freshUser = await getFreshUserForSync(user);
      const remoteProgress = await loadSupabaseProgress(freshUser, role);
      const cachedProgress = saveProgress(remoteProgress, freshUser.email, role);
      setProgress(cachedProgress);
      setSyncStatus("Прогресс синхронизирован с Supabase.");
      return cachedProgress;
    } catch (error) {
      setSyncStatus(
        error instanceof Error
          ? `Supabase недоступен: ${error.message}`
          : "Supabase недоступен. Показан локальный кэш."
      );
      return localProgress;
    }
  }

  async function persistProgressForRole(
    user: TrainingSessionUser,
    role: Role,
    nextProgress: ReturnType<typeof saveProgress>
  ) {
    if (user.source !== "supabase" || !isSupabaseConfigured()) {
      setSyncStatus("Offline demo: прогресс сохранен локально.");
      return;
    }

    try {
      setSyncStatus("Сохранение прогресса в Supabase...");
      const freshUser = await getFreshUserForSync(user);
      await saveSupabaseProgress(freshUser, role, nextProgress);
      setSyncStatus("Прогресс сохранен в Supabase.");
    } catch (error) {
      setSyncStatus(
        error instanceof Error
          ? `Не удалось сохранить в Supabase: ${error.message}`
          : "Не удалось сохранить в Supabase. Локальный кэш сохранен."
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function validateRemoteSession() {
      if (!currentUser || currentUser.source !== "supabase") {
        setSessionReady(true);
        return;
      }

      try {
        setSyncStatus("Проверка Supabase-сессии...");
        const verifiedUser = await refreshTrainingEmployeeSession(currentUser);
        if (cancelled) {
          return;
        }

        saveTrainingSession(verifiedUser);
        setCurrentUser(verifiedUser);
        const safeRole =
          currentRole && canAccessRole(verifiedUser, currentRole)
            ? currentRole
            : getDefaultRoleForUser(verifiedUser);
        setCurrentRole(safeRole);
        await loadProgressForRole(verifiedUser, safeRole);
      } catch {
        if (!cancelled) {
          clearTrainingSession();
          setCurrentUser(null);
          setCurrentRole(null);
          setProgress({ ...emptyProgress });
          setSyncStatus("");
        }
      } finally {
        if (!cancelled) {
          setSessionReady(true);
        }
      }
    }

    void validateRemoteSession();

    return () => {
      cancelled = true;
    };
    // Verify stored Supabase profile once before trusting role data from localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openRole(role: Role) {
    if (!currentUser || !canAccessRole(currentUser, role)) {
      setDeniedRole(role);
      setScreen("accessDenied");
      return;
    }

    setCurrentRole(role);
    setProgress(loadProgress(currentUser.email, role));
    setActiveModuleId(null);
    setScreen("dashboard");
    await loadProgressForRole(currentUser, role);
  }

  async function handleLogin(user: TrainingSessionUser) {
    saveTrainingSession(user);
    const role = getDefaultRoleForUser(user);
    setCurrentUser(user);
    setCurrentRole(role);
    setProgress(loadProgress(user.email, role));
    setActiveModuleId(null);
    setScreen("dashboard");
    await loadProgressForRole(user, role);
  }

  function handleLogout() {
    clearTrainingSession();
    setCurrentUser(null);
    setCurrentRole(null);
    setProgress({ ...emptyProgress });
    setActiveModuleId(null);
    setScreen("dashboard");
    setSessionReady(true);
  }

  async function handleSelectRole(role: Role) {
    if (!currentUser || !canAccessRole(currentUser, role)) {
      setDeniedRole(role);
      setScreen("accessDenied");
      return;
    }

    setCurrentRole(role);
    setProgress(selectRole(role, currentUser.email));
    setScreen("dashboard");
    await loadProgressForRole(currentUser, role);
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

    const nextProgress = markModuleCompleted(moduleId, currentUser.email, selectedRole);
    setProgress(nextProgress);
    void persistProgressForRole(currentUser, selectedRole, nextProgress);
  }

  function handleSaveQuizScore(moduleId: string, score: QuizScore) {
    if (!currentUser || !selectedRole) {
      return;
    }

    const nextProgress = saveQuizScore(moduleId, score, currentUser.email, selectedRole);
    setProgress(nextProgress);
    void persistProgressForRole(currentUser, selectedRole, nextProgress);
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
    void persistProgressForRole(currentUser, roleForScore, updatedProgress);
  }

  function handleCompleteScenario(moduleId: string, scenarioId: string) {
    if (!currentUser || !selectedRole) {
      return;
    }

    markSimulationCompleted(scenarioId, currentUser.email, selectedRole);
    const nextProgress = markModuleCompleted(moduleId, currentUser.email, selectedRole);
    setProgress(nextProgress);
    void persistProgressForRole(currentUser, selectedRole, nextProgress);
  }

  function handleResetProgress() {
    if (!currentUser || !selectedRole) {
      return;
    }

    const nextProgress = resetCurrentUserProgress(currentUser.email, selectedRole);
    setProgress(nextProgress);
    setActiveModuleId(null);
    setScreen("dashboard");
    void persistProgressForRole(currentUser, selectedRole, nextProgress);
  }

  function handleResetAllTrainingData() {
    resetAllLocalTrainingData();
    setCurrentUser(null);
    setCurrentRole(null);
    setProgress({ ...emptyProgress });
    setActiveModuleId(null);
    setScreen("dashboard");
    setSessionReady(true);
  }

  let content;

  if (!sessionReady) {
    return (
      <main className="login-shell">
        <section className="login-panel" aria-label="Проверка учебной сессии">
          <div className="login-copy">
            <div className="brand-lockup large">
              <img
                alt=""
                className="brand-mark"
                src="./anchor-pay-logo.png"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div>
                <p className="eyebrow">Учебный тренажер рабочего места</p>
                <h1>Anchor Pay</h1>
              </div>
            </div>
            <p className="lead">
              Проверяем учебную Supabase-сессию и назначенную роль. Данные роли
              берутся из Supabase, а не из локально изменяемого состояния браузера.
            </p>
          </div>
        </section>
      </main>
    );
  }

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
        canOpenAdminPanel={isAdmin}
        onOpenAdminPanel={() => setScreen("admin")}
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
  } else if (screen === "admin") {
    content = isAdmin ? (
      <AdminPanel
        currentUser={currentUser}
        onBack={() => setScreen(selectedRole ? "dashboard" : "welcome")}
      />
    ) : (
      <AccessDenied
        requestedRole="ADMIN"
        user={currentUser}
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
          handleCompleteScenario(activeModule.id, activeModule.scenario!.id);
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
        storageLabel={
          isRemoteMode
            ? "Сводка синхронизируется с Supabase для администратора обучения."
            : "Сводка хранится локально в браузере и не отправляется во внешние сервисы."
        }
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
          <img
            alt=""
            className="brand-mark small"
            src="./anchor-pay-logo.png"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span>Anchor Pay</span>
        </button>
        <div className="topbar-actions">
          <span className="account-badge">{currentUser.displayName}</span>
          {selectedRole ? <span className="role-badge">{selectedRole}</span> : null}
          <span className="status-pill">{accessibleRoles.length} ролей доступно</span>
          <span className="status-pill sync-pill">{syncLabel()}</span>
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
