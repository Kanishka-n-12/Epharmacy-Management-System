import "../css/ProgressSteps.css";

const STEPS = ["Cart", "Delivery Details", "Payments"];

export default function ProgressSteps({ current }) {
  return (
    <div className="progress-steps">
      {STEPS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "inactive";
        return (
          <div key={step} className="step-item">
            <div className={`step-circle ${state}`}>{i + 1}</div>
            <span className={`step-label ${state === "inactive" ? "inactive" : "active"}`}>
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${i < current ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}