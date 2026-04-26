
import api from "../../../api";
const base = "/notifications"
export async function getNotifications() {
  const res = await api.get(base);
  return res.data;
}

export async function broadcastNotification(data) {
    const { res } = await api.post("/notifications/broadcast", data);
    return res;
}

export async function getNotificationCount() {
  const res = await api.get(base+"/count");
  return res.data;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`${base}/${id}/read`);
  return res.data;
}

export async function getSentNotifications() {
  const res = await api.get(base+"/sent");
  return res.data;
}

export async function sendNotification(data, id) {
  const res = await api.post(`${base}/${id}`, data);
  return res.data;
}