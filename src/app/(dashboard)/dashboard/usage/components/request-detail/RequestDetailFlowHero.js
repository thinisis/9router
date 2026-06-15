"use client";

import { translate } from "@/i18n/runtime";

const FLOW_STEPS = [
  { key: "client-in", icon: "computer", label: "Client" },
  { key: "provider", icon: "hub", label: "Provider" },
  { key: "client-out", icon: "reply", label: "Client" },
];

export default function RequestDetailFlowHero() {
  return (
    <div className="request-detail-flow" data-i18n-skip>
      <div
        className="request-detail-flow__track"
        aria-label={translate("Replay request flow — matches log files")}
      >
        {FLOW_STEPS.map((step, index) => (
          <div key={step.key} className="request-detail-flow__segment">
            <div className="request-detail-flow__step">
              <span className="material-symbols-outlined request-detail-flow__icon" aria-hidden>
                {step.icon}
              </span>
              <span className="request-detail-flow__label">{translate(step.label)}</span>
            </div>
            {index < FLOW_STEPS.length - 1 ? (
              <span className="material-symbols-outlined request-detail-flow__arrow" aria-hidden>
                arrow_forward
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="request-detail-flow__caption">
        {translate("Replay request flow — matches log files")}
      </p>
    </div>
  );
}