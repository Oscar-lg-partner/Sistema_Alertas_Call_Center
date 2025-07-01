const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  login: (u, p) => ipcRenderer.invoke("login", u, p),
  register: (u, p) => ipcRenderer.invoke("register", u, p),
  getTasks: (uid) => ipcRenderer.invoke("getTasks", uid),
  addTask: (uid, task) => ipcRenderer.invoke("addTask", uid, task),
  deleteTask: (uid, tid) => ipcRenderer.invoke("deleteTask", uid, tid),
  deleteTask: (uid, title) => ipcRenderer.invoke("deleteTask", uid, title),
  updateTask: (uid, taskId, newTask) => ipcRenderer.invoke("updateTask", uid, taskId, newTask),
  showMessage: (msg) => ipcRenderer.invoke("show-message", msg),
});
