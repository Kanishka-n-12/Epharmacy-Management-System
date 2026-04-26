import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  fetchNotificationCount,
  markAsRead,
  createNotification,
  fetchSentNotifications,
  broadcastNotification,
} from "../slice/notificationThunks";
import { fetchUsers } from "../../users/slice/userThunks";

import "../css/Notification.css";

const TAB_INBOX = "inbox";
const TAB_SENT  = "sent";
const TAB_SEND  = "send";

function isUnreadStatus(status) {
  return typeof status === "string" && status.toUpperCase() === "UNREAD";
}

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { list, sentList, count } = useSelector((s) => s.notifications);
  const { users }                 = useSelector((s) => s.users);
  const { isAuthenticated }       = useSelector((s) => s.auth);

  const role    = localStorage.getItem("role");
  const isAdmin = role === "ROLE_ADMIN";

  const [open, setOpen]               = useState(false);
  const [tab, setTab]                 = useState(TAB_INBOX);
  const panelRef                      = useRef(null);


  const [phone, setPhone]             = useState("");
  const [message, setMessage]         = useState("");
  const [phoneError, setPhoneError]   = useState("");
  const [msgError, setMsgError]       = useState("");
  const [sending, setSending]         = useState(false);
  const [sendSuccess, setSendSuccess] = useState("");

  const [broadcastMsg, setBroadcastMsg]         = useState("");
const [broadcastErr, setBroadcastErr]         = useState("");
const [broadcastSuccess, setBroadcastSuccess] = useState("");
const [broadcasting, setBroadcasting]         = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotificationCount());
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    function onOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) dispatch(fetchUsers());
  }, [dispatch, isAuthenticated, isAdmin]);

  function togglePanel() {
    const next = !open;
    setOpen(next);
    if (next) {
      dispatch(fetchNotifications());
      if (isAdmin) dispatch(fetchSentNotifications());
    }
  }

  function switchTab(t) {
  setTab(t);
  if (t === TAB_SENT && isAdmin) dispatch(fetchSentNotifications());
  if (t === TAB_SEND) {
    setPhone(""); setMessage("");
    setPhoneError(""); setMsgError(""); setSendSuccess("");
    setBroadcastMsg(""); setBroadcastErr(""); setBroadcastSuccess("");
  }
}

  function handleMarkRead(n) {
    if (!isUnreadStatus(n.status)) return;
    dispatch(markAsRead(n.id));
  }

  async function handleSend() {
    let valid = true;
    setPhoneError(""); setMsgError(""); setSendSuccess("");

    if (!phone.trim()) {
      setPhoneError("Phone number is required."); valid = false;
    } else if (!/^\d{10}$/.test(phone.trim())) {
      setPhoneError("Enter a valid 10-digit phone number."); valid = false;
    }
    if (!message.trim()) {
      setMsgError("Message is required."); valid = false;
    } else if (message.trim().length < 3) {
      setMsgError("Message must be at least 3 characters."); valid = false;
    }
    if (!valid) return;

    const targetUser = Array.isArray(users)
      ? users.find((u) => u.phone === phone.trim() || u.phone === `+91${phone.trim()}`)
      : null;

    if (!targetUser) { setPhoneError("No user found with this phone number."); return; }

    setSending(true);
    try {
      await dispatch(createNotification({
        id: targetUser.userId,
        data: { message: message.trim() },
      })).unwrap();

      setSendSuccess(`Sent successfully to ${targetUser.name || phone}!`);
      setPhone(""); setMessage("");
      dispatch(fetchSentNotifications());
    } catch (err) {
      setMsgError(err?.message || "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleBroadcast() {
  setBroadcastErr(""); setBroadcastSuccess("");
  if (!broadcastMsg.trim()) { setBroadcastErr("Message is required."); return; }
  if (broadcastMsg.trim().length < 3) { setBroadcastErr("Message must be at least 3 characters."); return; }

  setBroadcasting(true);
  try {
    await dispatch(broadcastNotification({ message: broadcastMsg.trim() })).unwrap();
    setBroadcastSuccess("Broadcast sent to all users!");
    setBroadcastMsg("");
    dispatch(fetchSentNotifications());
  } catch (err) {
    setBroadcastErr(err?.message || "Broadcast failed. Try again.");
  } finally {
    setBroadcasting(false);
  }
}


  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch { return dateStr; }
  }

  function renderNotifItem(n, isSentTab = false) {
    const unread = !isSentTab && isUnreadStatus(n.status);

  
    const statusLabel = isSentTab
      ? "SENT"
      : (n.status ? n.status.toUpperCase() : "READ");

    const pillClass = isSentTab
      ? "pill-sent"
      : (unread ? "pill-unread" : "pill-read");

    return (
      <div
        key={n.id}
        className={`notif-item ${unread ? "unread" : "read"}`}
        onClick={() => !isSentTab && handleMarkRead(n)}
      >
        <div className="notif-item-dot" />
        <div className="notif-item-content">

          <div className="notif-item-top-row">
            <p className="notif-item-msg">{n.message}</p>
            {(isAdmin || unread) && (
              <span className={`notif-status-pill ${pillClass}`}>
                {statusLabel}
              </span>
            )}
          </div>

          <div className="notif-item-meta">
            {n.date     && <span>📅 {formatDate(n.date)}</span>}
            {n.sender   && !isSentTab && <span>👤 {n.sender}</span>}
            {n.receiver && isSentTab  && <span>📨 To: {n.receiver}</span>}
          </div>

          {unread && tab === TAB_INBOX && (
            <span className="notif-unread-chip">Tap to mark read</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <div className="notif-bell" onClick={togglePanel}>
        <i className="bi bi-bell" />
        {count > 0 && <span className="notif-badge">{count > 99 ? "99+" : count}</span>}
      </div>

      <div className={`notif-sidebar ${open ? "open" : ""}`}>

        <div className="notif-header">
          <h5>Notifications</h5>
          <button onClick={() => setOpen(false)} className="notif-close-btn">✖</button>
        </div>

        <div className="notif-tabs">
          <button
            className={`notif-tab ${tab === TAB_INBOX ? "active" : ""}`}
            onClick={() => switchTab(TAB_INBOX)}
          >
            Inbox
            {count > 0 && <span className="notif-tab-badge">{count}</span>}
          </button>

          {isAdmin && (
            <>
              <button
                className={`notif-tab ${tab === TAB_SENT ? "active" : ""}`}
                onClick={() => switchTab(TAB_SENT)}
              >
                Sent
              </button>
              <button
                className={`notif-tab ${tab === TAB_SEND ? "active" : ""}`}
                onClick={() => switchTab(TAB_SEND)}
              >
                ✉ Send
              </button>
            </>
          )}
        </div>

        <div className="notif-body">

          {tab === TAB_INBOX && (
            list.length === 0
              ? <div className="notif-empty"><span>🔔</span><p>No notifications yet</p></div>
              : list.map((n) => renderNotifItem(n, false))
          )}

          {tab === TAB_SENT && isAdmin && (
            !sentList || sentList.length === 0
              ? <div className="notif-empty"><span>📭</span><p>No sent notifications</p></div>
              : sentList.map((n) => renderNotifItem(n, true))  // ✅ isSentTab=true
          )}

          {tab === TAB_SEND && isAdmin && (
  <div className="notif-compose">
    <p className="notif-compose-hint">
      Send to a specific user by phone number.
    </p>

    <div className="notif-field">
      <label className="notif-label">Recipient Phone <span className="req">*</span></label>
      <input
        className={`notif-input${phoneError ? " notif-input-err" : ""}`}
        type="tel"
        placeholder="10-digit mobile number"
        maxLength={10}
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value.replace(/\D/g, ""));
          if (phoneError) setPhoneError("");
          if (sendSuccess) setSendSuccess("");
        }}
      />
      {phoneError && <div className="notif-err">{phoneError}</div>}
    </div>

    <div className="notif-field">
      <label className="notif-label">Message <span className="req">*</span></label>
      <textarea
        className={`notif-textarea${msgError ? " notif-input-err" : ""}`}
        placeholder="Type your notification message…"
        rows={4}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (msgError) setMsgError("");
          if (sendSuccess) setSendSuccess("");
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {msgError ? <div className="notif-err">{msgError}</div> : <span />}
        <span style={{ fontSize: 10, color: "#aaa" }}>{message.length}/500</span>
      </div>
    </div>

    {sendSuccess && <div className="notif-success">{sendSuccess}</div>}

    <button className="notif-send-btn" onClick={handleSend} disabled={sending}>
      {sending ? "Sending…" : "Send Notification"}
    </button>

    <hr style={{ margin: "16px 0", borderColor: "#eee" }} />

    <p className="notif-compose-hint" style={{ fontWeight: 600 }}>
      📢 Broadcast to All Users
    </p>

    <div className="notif-field">
      <label className="notif-label">Broadcast Message <span className="req">*</span></label>
      <textarea
        className={`notif-textarea${broadcastErr ? " notif-input-err" : ""}`}
        placeholder="Type announcement or offer for all users…"
        rows={4}
        value={broadcastMsg}
        onChange={(e) => {
          setBroadcastMsg(e.target.value);
          if (broadcastErr) setBroadcastErr("");
          if (broadcastSuccess) setBroadcastSuccess("");
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {broadcastErr ? <div className="notif-err">{broadcastErr}</div> : <span />}
        <span style={{ fontSize: 10, color: "#aaa" }}>{broadcastMsg.length}/500</span>
      </div>
    </div>

    {broadcastSuccess && <div className="notif-success">{broadcastSuccess}</div>}

    <button className="notif-send-btn" onClick={handleBroadcast} disabled={broadcasting}
      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
      {broadcasting ? "Broadcasting…" : "📢 Broadcast to All"}
    </button>
  </div>
)}
        </div>
      </div>
    </div>
  );
}