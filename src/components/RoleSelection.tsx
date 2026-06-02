import type { Role } from "../training-content";
import { roles } from "../training-content";

const roleDescriptions: Record<Role, string> = {
  ADMIN: "Полный доступ: пользователи, верификация, мерчанты, ордера, кошельки и валюты.",
  TEAMLEAD_MANAGER: "Организация: teamlead-команда, участники, инвайт-коды и ордера организации.",
  TRADER_MANAGER: "Trader-команда: трейдеры, устройства и ордера команды.",
  TRADER: "Реквизиты, устройства, свои ордера, кошелек и выводы.",
  MERCHANT: "Shop: свои ордера, выводы и апелляции без создания shop.",
  MERCHANT_MANAGER: "Создание и редактирование shop'ов, подготовка merchant flow.",
  HEAD_SUPPORT: "Read-only пользователи и участие в верификации.",
  SUPPORT: "Read-only пользователи и участие в верификации."
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
          Дашборд покажет модули по новой PSP-модели. ADMIN может переключать
          маршруты, остальные учебные аккаунты видят только назначенную роль.
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
