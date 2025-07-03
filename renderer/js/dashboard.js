let userId = localStorage.getItem("userId");
let tasks = [];
let editIndex = null;

async function loadTasks() {
  tasks = await window.api.getTasks(userId);
  renderTasks();
}

function renderTasks() {
  const table = document.getElementById("taskTable");
  const search = document.getElementById("search").value.toLowerCase();
  table.innerHTML = "";

  tasks
    .filter(task => task.title.toLowerCase().includes(search))
    .forEach((task, index) => {
      const row = table.insertRow();

      // Si la tarea fue notificada, aplica estilo
      if (task.notified) {
        row.classList.add("table-success"); // color verde claro de Bootstrap
      }

      const titleCell = row.insertCell(0);
      const dateCell = row.insertCell(1);
      const actions = row.insertCell(2);

      titleCell.innerHTML = task.title;

      dateCell.innerHTML = `
        ${new Date(task.date).toLocaleString()}
        ${task.notified ? '<i class="bi bi-bell text-success ms-2" title="Ya fue notificada"></i>' : ''}
      `;

      actions.innerHTML = `
        <button class="btn btn-sm btn-outline-primary me-2" onclick="editTask(${index})">
          <i class="bi bi-pencil-square"></i> Editar
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${index})">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      `;
    });
}


async function add() {
  const titleInput = document.getElementById("title");
  const dateInput = document.getElementById("date");
  const title = titleInput.value.trim();
  const date = dateInput.value;

  if (!title || !date) {
    await window.api.showMessage("Por favor completa título y fecha");
    return;
  }

  const newTask = { title, date, notified: false };
  tasks.push(newTask);
  await window.api.addTask(userId, newTask);
  renderTasks();

  titleInput.value = "";
  dateInput.value = "";
}

async function deleteTask(index) {
    const confirmed = await window.api.showMessage("¿Seguro que deseas eliminar esta tarea?", "question");
    if (!confirmed) return;
  
    const task = tasks[index];
    tasks.splice(index, 1);
    await window.api.deleteTask(userId, task._id); // Asumiendo que cada task tiene un _id
    renderTasks();
  }
  

//   edit
function openEditModal(index) {
    editIndex = index;
    const task = tasks[index];
    document.getElementById("editTitle").value = task.title;
    document.getElementById("editDate").value = task.date.slice(0, 16); // para input datetime-local
    document.getElementById("editModal").style.display = "block";
  }
  
  function closeModal() {
    document.getElementById("editModal").style.display = "none";
  }
  
  async function saveEdit() {
    const newTitle = document.getElementById("editTitle").value.trim();
    const newDate = document.getElementById("editDate").value;
  
    if (!newTitle || !newDate) {
      await window.api.showMessage("Título y fecha son obligatorios");
      return;
    }
  
    const task = tasks[editIndex]; // para obtener el _id
  
    const updatedTask = {
      title: newTitle,
      date: newDate,
      notified: false
    };
    console.log("===> ",task," ===> ",task._id);
    
    await window.api.updateTask(userId, task._id, updatedTask);
    await window.api.showMessage("Tarea actualizada con éxito");
  
    // Actualiza el array local
    tasks[editIndex] = { ...task, ...updatedTask };
  
    // Actualiza solo la fila en la tabla HTML
    updateTableRow(editIndex);
  
    closeModal();
  }
  
  function updateTableRow(index) {
    console.log("entra cada minuto");
    
    const table = document.getElementById("taskTable");
    const task = tasks[index];
  
    // Elimina la fila actual
    table.deleteRow(index);
  
    // Inserta una nueva fila en la misma posición
    const row = table.insertRow(index);
  
    if (task.notified) {
      row.classList.add("table-success");
    }
  
    const titleCell = row.insertCell(0);
    const dateCell = row.insertCell(1);
    const actions = row.insertCell(2);
  
    titleCell.innerHTML = task.title;
  
    dateCell.innerHTML = `
      ${new Date(task.date).toLocaleString()}
      ${task.notified ? '<i class="bi bi-bell-fill text-success ms-2" title="Ya fue notificada"></i>' : ''}
    `;
  
    actions.innerHTML = `
      <button class="btn btn-sm btn-outline-primary me-2" onclick="editTask(${index})">
        <i class="bi bi-pencil-square"></i> Editar
      </button>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${index})">
        <i class="bi bi-trash"></i> Eliminar
      </button>
    `;
  }
  
  
  
  function editTask(index) {
    openEditModal(index); // esta es la función que abre el modal con los datos
  }

// Carga inicial
loadTasks();

setInterval(() => {
  const now = new Date();

  tasks.forEach(async (task, index) => {
    const taskDate = new Date(task.date);

    console.log(!task.notified, "<-- && ", taskDate, "<=", now, "-->", taskDate <= now);

    if (!task.notified && taskDate <= now) {
      console.log("notifications");

      new Notification("Recordatorio", { body: task.title });
      task.notified = true;
      await window.api.updateTask(userId, task._id, task);
      updateTableRow(index);
    }
  });
}, 5000);

