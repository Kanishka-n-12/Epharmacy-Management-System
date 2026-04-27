import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ToastMessage({ message, type = "success", onDone }) {
  const [visible, setVisible] = useState(false);
  const [currentMsg, setCurrentMsg] = useState("");
  

  const bgMap = { success: "#198754", danger: "#dc3545", warning: "#fd7e14" };

  useEffect(() => {
    if (!message) return;

    setCurrentMsg(message);   
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!visible || !currentMsg) return null;


  return createPortal(
    <div style={{
      position: "fixed", bottom: 40, left: "50%",
      transform: "translateX(-50%)",
      background: bgMap[type] || bgMap.danger,
      color: "#fff", padding: "12px 28px",
      borderRadius: 25, fontSize: 13, fontWeight: 600,
      zIndex: 99999, whiteSpace: "nowrap",
      boxShadow: "0 6px 20px rgba(0,0,0,0.22)"
    }}>
      {currentMsg}
    </div>,
    document.body   
  );
}