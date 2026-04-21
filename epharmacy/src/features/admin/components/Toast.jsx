import "./css/Toast.css";

export default function Toast({ show, msg, type = "success" }) {
  return (
    <div className={`toast${show ? " show" : ""}${type === "error" ? " error" : ""}`}>
      {msg}
    </div>
  );
}