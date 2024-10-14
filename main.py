from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  

# Configuração do banco de dados MySQL
db_config = {
    'user': 'task_user',
    'password': '040914',  
    'host': 'localhost',  
    'database': 'task_manager'
}

# Função para conectar ao banco de dados
def get_db_connection():
    return mysql.connector.connect(**db_config)

# Endpoint para login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Verifica as credenciais no banco de dados
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()

    if user:
        return jsonify({'message': 'Login bem-sucedido!'}), 200
    else:
        return jsonify({'message': 'Credenciais inválidas!'}), 401

# Endpoint para gerenciar tarefas
@app.route('/tasks', methods=['GET', 'POST'])
def manage_tasks():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        data = request.get_json()
        new_task = (data['title'], 'Iniciar')  
        cursor.execute("INSERT INTO tasks (title, status) VALUES (%s, %s)", new_task)
        conn.commit()
        return jsonify(new_task), 201  # Retorna a nova tarefa criada

    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(tasks)  # Retorna a lista de tarefas

# Endpoint para remover uma tarefa
@app.route('/tasks/<int:index>', methods=['DELETE'])  
def delete_task(index):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tasks WHERE id = %s", (index,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'message': 'Tarefa removida com sucesso!'}), 200

# Endpoint para atualizar o status da tarefa
@app.route('/tasks/<int:index>', methods=['PUT'])  
def update_task_status(index):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE tasks SET status = %s WHERE id = %s", (data['status'], index))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'message': 'Status da tarefa atualizado com sucesso!'}), 200

if __name__ == "__main__":
     app.run(debug=True, port=8000)  