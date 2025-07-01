const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const handlers = require("./handlers/userHandlers");
const { checkTasksAndNotify } = require("./notifications");
const { dialog } = require("electron");
const { User } = require("./db/mongo");


function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("renderer/index.html");
  autoUpdater.checkForUpdatesAndNotify();
}

// app.whenReady().then(createWindow);
app.whenReady().then(() => {
  createWindow();

  // Ejecutar cada minuto
  setInterval(checkTasksAndNotify, 60 * 1000);
});

// IPC handlers
ipcMain.handle("login", async (e, u, p) => handlers.login(u, p));
ipcMain.handle("register", async (e, u, p) => handlers.register(u, p));
ipcMain.handle("getTasks", async (event, userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  // Convierte los objetos de Mongo a JSON planos
  const tasks = user.tasks.map(task => ({
    _id: task._id.toString(), // 👈 incluir el _id
    title: task.title,
    date: task.date?.toISOString(),
    notified: task.notified
  }));
  

  return tasks;
});

ipcMain.handle("addTask", async (e, uid, task) => handlers.addTask(uid, task));
// ipcMain.handle("deleteTask", async (e, uid, tid) => handlers.deleteTask(uid, tid));
ipcMain.handle("deleteTask", async (e, uid, taskId) => {
  const user = await User.findById(uid);
  if (!user) return;

  user.tasks = user.tasks.filter(t => t._id.toString() !== taskId.toString());
  await user.save();
});


ipcMain.handle("updateTask", async (e, uid, taskId, newTask) => {
  const user = await User.findById(uid);
  if (!user) return;

  const task = user.tasks.id(taskId); // usa .id() de mongoose para buscar por _id
  console.log("--> ",user," ---> ",task);
  
  if (task) {
    task.title = newTask.title;
    task.date = new Date(newTask.date);
    task.notified = newTask.notified || false;
    await user.save();
  }
});


ipcMain.handle("show-message", async (event, message, type = "info") => {
  const options = {
    type,
    message,
    buttons: ["OK"],
    defaultId: 0,
  };

  // Si es tipo confirmación, añade botón Cancelar
  if (type === "question") {
    options.buttons = ["Sí", "Cancelar"];
    options.cancelId = 1;
  }

  const result = await dialog.showMessageBox(options);
  return result.response === 0; // true si elige "Sí" o "OK"
});
