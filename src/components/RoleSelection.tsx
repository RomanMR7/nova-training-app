import type { Role } from "../training-content";
import { roles } from "../training-content";

const roleDescriptions: Record<Role, string> = {
  Администратор: "Настройки, роли, аудит, ledger и ручные исключения.",
  Саппорт: "Апелляции, спорные ситуации, уведомления и помощь участникам.",
  Мерчант: "API-ключи, платежные заявки и интеграционные примеры.",
  Трейдер: "Заявки, депозит, реквизиты и контроль статусов.",
  Провайдер: "Организации, реквизиты, выводы и операционные проверки."
};

interface RoleSelectionProps {
  selectedRole: Role | null;
  availableRoles?: Role[];
  onSelectRole: (role: Role) => void;
  onBack: () => void;
}

export function RoleSelection({
  selectedRole,
  availableRoles = roles,
  onSelectRole,
  onBack
}: RoleSelectionProps) {
  return (
    <section className="screen-stack" aria-labelledby="role-title">
      <div className="section-heading">
        <p className="eyebrow">Шаг 1</p>
        <h1 id="role-title">Выберите роль</h1>
        <p>
          Дашборд покажет модули, которые чаще всего нужны выбранной роли.
          Администратор может переключать маршруты, остальные сотрудники видят
          только назначенную роль.
        </p>
      </div>

      <div className="role-grid">
        {roles.map((role) => {
          const locked = !availableRoles.includes(role);
          return (
            <button
              className={`role-card ${selectedRole === role ? "is-selected" : ""} ${
                locked ? "is-locked" : ""
              }`}
              key={role}
              type="button"
              disabled={locked}
              onClick={() => onSelectRole(role)}
              aria-pressed={selectedRole === role}
            >
              <span className="role-name">{role}</span>
              <span>
                {locked
                  ? "Недоступно для текущего учебного аккаунта."
                  : roleDescriptions[role]}
              </span>
            </button>
          );
        })}
      </div>

      <button className="ghost-button" type="button" onClick={onBack}>
        Назад
      </button>
    </section>
  );
}
