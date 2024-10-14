document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    fetch('http://localhost:8000/login', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('login-form').style.display = 'none'; 
            document.getElementById('task-form').style.display = 'block'; 
            loadTasks(); 
            document.getElementById('task-list').style.display = 'block'; 
        } else {
            alert('Credenciais inválidas!');
        }
    })
    .catch(error => console.error('Erro:', error));
});

document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const taskTitle = document.getElementById('task-title').value.trim();

   // Validação: Limita o comprimento do título
   if (taskTitle.length > 50) {
       alert("O título da tarefa não pode ter mais de 50 caracteres!");
       return;
   }

   // Chamada AJAX para adicionar uma nova tarefa
   fetch('http://localhost:8000/tasks', { // URL local para teste
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ title: taskTitle })
   })
   .then(response => response.json())
   .then(data => {
       document.getElementById('task-title').value = ''; 
       loadTasks(); 
   })
   .catch(error => console.error('Erro:', error));
});

// Função para carregar tarefas existentes
function loadTasks() {
   fetch('http://localhost:8000/tasks') 
   .then(response => response.json())
   .then(data => {
       const taskList = document.getElementById('task-list');
       taskList.innerHTML = ''; 

       data.forEach((task) => {
           const li = document.createElement('li');

           // Seleção de status da tarefa
           const statusSelect = document.createElement('select');
           const statuses = ['Pendente', 'Completa'];
           statuses.forEach(status => {
               const option = document.createElement('option');
               option.value = status;
               option.textContent = status;
               option.selected = task.status === status; 
               statusSelect.appendChild(option);
           });

           // Atualiza o status quando selecionado
           statusSelect.onchange = function() {
               updateTaskStatus(task.id, statusSelect.value); 
           };

           // Exibe o título da tarefa
           const titleSpan = document.createElement('span');
           titleSpan.className = 'task-title';
           titleSpan.textContent = task.title;

           li.appendChild(statusSelect);
           li.appendChild(titleSpan);

           // Botão para remover tarefa
           const removeButton = document.createElement('button');
           removeButton.textContent = 'Remover';
           removeButton.className = 'remove';
           removeButton.onclick = function() {
               removeTask(task.id); 
           };

           li.appendChild(removeButton);
           taskList.appendChild(li);
       });
   })
   .catch(error => console.error('Erro:', error));
}

// Função para remover uma tarefa
function removeTask(id) {
   fetch(`http://localhost:8000/tasks/${id}`, { 
       method: 'DELETE'
   })
   .then(response => {
       if (response.ok) {
           loadTasks(); 
       } else {
           console.error('Erro ao remover a tarefa');
       }
   })
   .catch(error => console.error('Erro:', error));
}

// Função para atualizar o status da tarefa
function updateTaskStatus(id, status) {
   fetch(`http://localhost:8000/tasks/${id}`, { 
       method: 'PUT',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ status }) 
   })
   .then(response => {
       if (response.ok) {
           loadTasks(); 
       } else {
           console.error('Erro ao atualizar o status da tarefa');
       }
   })
   .catch(error => console.error('Erro:', error));
}

// Carrega as tarefas quando a página é carregada
window.onload = loadTasks;