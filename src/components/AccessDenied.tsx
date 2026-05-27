import type { Role } from "../training-content";
import type { TrainingSessionUser } from "../training-users";
import { getAccessibleRoles } from "../training-users";

interface AccessDeniedProps {
  user: TrainingSessionUser;
  requestedRole: Role | null;
  onBack: () => void;
}

export function AccessDenied({ user, requestedRole, onBack }: AccessDeniedProps) {
  return (
    <section className="access-denied" aria-labelledby="denied-title">
      <p className="eyebrow">Доступ ограничен</p>
      <h1 id="denied-title">Этот учебный маршрут недоступен</h1>
      <p>
        Аккаунт <strong>{user.email}</strong> может проходить только роли:{" "}
        <strong>{getAccessibleRoles(user).join(", ")}</strong>.
        {requestedRole ? ` Запрошенная роль: ${requestedRole}.` : ""}
      </p>
      <p>
        Это локальное учебное ограничение. Для production-доступа оно не
        используется и не заменяет настоящую авторизацию.
      </p>
      <button className="primary-button" type="button" onClick={onBack}>
        Вернуться к доступному обучению
      </button>
    </section>
  );
}
