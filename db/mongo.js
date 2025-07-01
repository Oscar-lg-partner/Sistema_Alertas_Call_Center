const mongoose = require("mongoose");
require("dotenv").config(); // <- esto carga las variables de entorno
const db='mongodb+srv://oscarjimenez:EYiTswyRIXnOLE1f@cluster0.nyacqkc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Conectado a MongoDB Atlas");
}).catch((err) => {
  console.error("❌ Error al conectar a MongoDB", err);
});

const TaskSchema = new mongoose.Schema({
  title: String,
  date: Date,
  notified: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  tasks: [TaskSchema]
});

const User = mongoose.model("User", UserSchema);
module.exports = { User };
