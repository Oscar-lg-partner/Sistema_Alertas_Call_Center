const { User } = require("./db/mongo");
const nodemailer = require("nodemailer");
const { Notification } = require("electron"); // ← desde main.js

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
    host: "lgekrhqmh01.lge.com",  // tu servidor SMTP
    port: 25,                     // el puerto (en tu caso 25)
    secure: false,                // falso porque el puerto 25 no usa SSL/TLS
    auth: null                   // si no requiere login
  });
  

async function checkTasksAndNotify() {
  const now = new Date();
  const in5Min = new Date(now.getTime() + 5 * 60 * 1000); // Próximos 5 minutos

  const users = await User.find({});

  for (const user of users) {
    for (const task of user.tasks) {
      if (!task.notified && task.date <= in5Min && task.date > now) {
        // 🔔 Notificación del sistema
        new Notification({
          title: "Tarea pendiente",
          body: task.title,
        }).show();

        // 📧 Enviar email
        try {
          await transporter.sendMail({
            from: `"Recordatorio de tareas" "auto@lge.com"`,
            to: user.username, // ← suponer que username es el email
            subject: "Tarea pendiente",
            text: `Tienes una tarea pendiente: "${task.title}" para hoy a las ${task.date.toLocaleString()}`
          });
          console.log(`✅ Email enviado a ${user.username}`);
        } catch (err) {
          console.error(`❌ Error enviando email a ${user.username}:`, err.message);
        }

        // ✅ Marcar como notificado
        task.notified = true;
      }
    }
    await user.save();
  }
}

module.exports = { checkTasksAndNotify };
