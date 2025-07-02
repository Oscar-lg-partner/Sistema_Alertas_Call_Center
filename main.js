const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const handlers = require("./handlers/userHandlers");
const { checkTasksAndNotify } = require("./notifications");
const { User } = require("./db/mongo");

let mainWindow;

// Función para mostrar mensaje en el renderer vía IPC
async function showMessageInRenderer(message, type = "info") {
  return mainWindow.webContents.invoke("show-message", message, type);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("renderer/index.html");
}

app.whenReady().then(() => {
  createWindow();
   
  mainWindow.webContents.once('did-finish-load', async () => {
    autoUpdater.checkForUpdatesAndNotify();
    await mainWindow.webContents.executeJavaScript(`
      window.api.showMessage("autoUpdater.checkForUpdatesAndNotify() ejecutado correctamente");
    `);
  });

  // Ejecutar tarea periódica
  setInterval(checkTasksAndNotify, 60 * 1000);
});

// Eventos del autoUpdater
autoUpdater.on('update-available', async () => {
  await mainWindow.webContents.executeJavaScript(`
    window.api.showMessage("updatae aqui");
  `);
  await showMessageInRenderer("¡Nueva actualización disponible!");
});

autoUpdater.on('update-downloaded', async () => {
  const respuesta = await showMessageInRenderer(
    "Hay una nueva versión de la aplicación. ¿Quieres reiniciar ahora para actualizar?",
    "question"
  );
  if (respuesta) {
    autoUpdater.quitAndInstall();
  }
});

autoUpdater.on('error', (error) => {
  console.error("❌ Error al actualizar:", error);
});

// -------------------------
// IPC Handlers
// -------------------------
ipcMain.handle("login", async (e, u, p) => handlers.login(u, p));
ipcMain.handle("register", async (e, u, p) => handlers.register(u, p));

ipcMain.handle("getTasks", async (event, userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  return user.tasks.map(task => ({
    _id: task._id.toString(),
    title: task.title,
    date: task.date?.toISOString(),
    notified: task.notified
  }));
});

ipcMain.handle("addTask", async (e, uid, task) => handlers.addTask(uid, task));

ipcMain.handle("deleteTask", async (e, uid, taskId) => {
  const user = await User.findById(uid);
  if (!user) return;

  user.tasks = user.tasks.filter(t => t._id.toString() !== taskId.toString());
  await user.save();
});

ipcMain.handle("updateTask", async (e, uid, taskId, newTask) => {
  const user = await User.findById(uid);
  if (!user) return;

  const task = user.tasks.id(taskId);
  if (task) {
    task.title = newTask.title;
    task.date = new Date(newTask.date);
    task.notified = newTask.notified || false;
    await user.save();
  }
});

// Este handler sí usa el dialog nativo para mensajes que vienen desde el renderer
ipcMain.handle("show-message", async (event, message, type = "info") => {
  const options = {
    type,
    message,
    buttons: ["OK"],
    defaultId: 0,
  };

  if (type === "question") {
    options.buttons = ["Sí", "Cancelar"];
    options.cancelId = 1;
  }

  const result = await dialog.showMessageBox(options);
  return result.response === 0;
});
