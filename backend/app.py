from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)
# Configuração do banco de dados
DB_HOST = 'localhost'
DB_NAME = 'clinica'
DB_USER = 'clinica_user'
DB_PASSWORD = 'clinica123'

# Conectar ao PostgreSQL
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=8080
    )
    return conn

# ----------------------------- Pacientes -----------------------------
@app.route('/pacientes', methods=['POST'])
def criar_ou_atualizar_paciente():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Verifica se já existe paciente com o mesmo CPF
    cur.execute('SELECT id FROM pacientes WHERE cpf = %s;', (data['cpf'],))
    paciente = cur.fetchone()
    
    if paciente:
        # Atualizar
        cur.execute('''
            UPDATE pacientes
            SET nome=%s, telefone=%s, email=%s
            WHERE cpf=%s;
        ''', (data['nome'], data.get('telefone'), data.get('email'), data['cpf']))
        mensagem = 'Paciente atualizado'
    else:
        # Inserir
        cur.execute('''
            INSERT INTO pacientes (nome, telefone, email, cpf)
            VALUES (%s, %s, %s, %s);
        ''', (data['nome'], data.get('telefone'), data.get('email'), data['cpf']))
        mensagem = 'Paciente criado'
    
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'mensagem': mensagem}), 201

@app.route('/pacientes', methods=['GET'])
def listar_pacientes():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, nome, telefone, email, cpf FROM pacientes;')
    pacientes = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([
        {'id': p[0], 'nome': p[1], 'telefone': p[2], 'email': p[3], 'cpf': p[4]}
        for p in pacientes
    ])

@app.route('/pacientes/<int:id>', methods=['DELETE'])
def deletar_paciente(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM pacientes WHERE id=%s;', (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'mensagem': 'Paciente deletado'})

# ----------------------------- Dentistas -----------------------------
@app.route('/dentistas', methods=['POST'])
def criar_ou_atualizar_dentista():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Verifica se já existe dentista com o mesmo CPF
    cur.execute('SELECT id FROM dentistas WHERE cpf = %s;', (data['cpf'],))
    dentista = cur.fetchone()
    
    if dentista:
        # Atualizar
        cur.execute('''
            UPDATE dentistas
            SET nome=%s, especialidade=%s
            WHERE cpf=%s;
        ''', (data['nome'], data.get('especialidade'), data['cpf']))
        mensagem = 'Dentista atualizado'
    else:
        # Inserir
        cur.execute('''
            INSERT INTO dentistas (nome, especialidade, cpf)
            VALUES (%s, %s, %s);
        ''', (data['nome'], data.get('especialidade'), data['cpf']))
        mensagem = 'Dentista criado'
    
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'mensagem': mensagem}), 201

@app.route('/dentistas', methods=['GET'])
def listar_dentistas():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, nome, especialidade, cpf FROM dentistas;')
    dentistas = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([
        {'id': d[0], 'nome': d[1], 'especialidade': d[2], 'cpf': d[3]}
        for d in dentistas
    ])

@app.route('/dentistas/<int:id>', methods=['DELETE'])
def deletar_dentista(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM dentistas WHERE id=%s;', (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'mensagem': 'Dentista deletado'})

# ----------------------------- Consultas -----------------------------
@app.route('/consultas', methods=['POST'])
def criar_consulta():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO consultas (id_paciente, id_dentista, data, hora, observacoes)
        VALUES (%s, %s, %s, %s, %s) RETURNING id;
    ''', (data['id_paciente'], data['id_dentista'], data['data'], data['hora'], data.get('observacoes')))
    consulta_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'id': consulta_id}), 201

@app.route('/consultas', methods=['GET'])
def listar_consultas():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
    SELECT consultas.id, consultas.id_paciente, pacientes.nome, consultas.id_dentista, dentistas.nome, consultas.data, consultas.hora, consultas.observacoes
    FROM consultas
    JOIN pacientes ON consultas.id_paciente = pacientes.id
    JOIN dentistas ON consultas.id_dentista = dentistas.id;
''')
    consultas = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([
        {
        'id': c[0],
        'id_paciente': c[1],
        'paciente': c[2],
        'id_dentista': c[3],
        'dentista': c[4],
        'data': str(c[5]),
        'hora': str(c[6]),
        'observacoes': c[7]
    }
        for c in consultas
    ])

@app.route('/consultas/<int:id>', methods=['DELETE'])
def deletar_consulta(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM consultas WHERE id=%s;', (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'mensagem': 'Consulta deletada'})

# ----------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True)
