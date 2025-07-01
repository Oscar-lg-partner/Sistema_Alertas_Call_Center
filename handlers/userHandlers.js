const { User } = require("../db/mongo");
const bcrypt = require("bcryptjs");

async function register(username, password) {
  const exists = await User.findOne({ username });
  if (exists) return { success: false, message: "Usuario ya existe" };

  const hashed = bcrypt.hashSync(password, 10);
  const newUser = new User({ username, password: hashed, tasks: [] });
  await newUser.save();
  return { success: true };
}

async function login(username, password) {
  const user = await User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.password)) {
    return { success: true, userId: user._id.toString() };
  }
  return { success: false, message: "Credenciales incorrectas" };
}

async function getTasks(userId) {
  const user = await User.findById(userId);
  return user?.tasks || [];
}

async function addTask(userId, task) {
  const user = await User.findById(userId);
  user.tasks.push(task);
  await user.save();
  return true;
}

async function deleteTask(userId, taskId) {
  const user = await User.findById(userId);
  user.tasks.id(taskId).remove();
  await user.save();
  return true;
}

module.exports = { register, login, getTasks, addTask, deleteTask };
