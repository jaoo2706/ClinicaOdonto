// Tipos para os módulos
export interface Paciente {
  id?: number
  nome: string
  telefone: string
  email: string
  cpf: string
}

export interface Dentista {
  id?: number
  nome: string
  especialidade: string
  cpf: string
}

export interface Consulta {
  id?: number
  id_paciente: number
  id_dentista: number
  data: string
  hora: string
  observacoes: string
  paciente?: Paciente
  dentista?: Dentista
}

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000" // Flask roda na 5000

// ---------- PACIENTES ----------
export async function getPacientes(): Promise<Paciente[]> {
  const res = await fetch(`${API_URL}/pacientes`)
  if (!res.ok) throw new Error("Erro ao buscar pacientes")
  return res.json()
}

export async function getPaciente(id: number): Promise<Paciente> {
  const res = await fetch(`${API_URL}/pacientes/${id}`)
  if (!res.ok) throw new Error("Erro ao buscar paciente")
  return res.json()
}

export async function createPaciente(paciente: Paciente): Promise<Paciente> {
  const res = await fetch(`${API_URL}/pacientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paciente),
  })
  if (!res.ok) throw new Error("Erro ao criar/atualizar paciente")
  return res.json()
}

// Faz o mesmo que o create, porque o backend faz upsert via CPF
export async function updatePaciente(_id: number, paciente: Paciente): Promise<Paciente> {
  return createPaciente(paciente)
}

export async function deletePaciente(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/pacientes/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Erro ao excluir paciente")
}

// ---------- DENTISTAS ----------
export async function getDentistas(): Promise<Dentista[]> {
  const res = await fetch(`${API_URL}/dentistas`)
  if (!res.ok) throw new Error("Erro ao buscar dentistas")
  return res.json()
}

export async function getDentista(id: number): Promise<Dentista> {
  const res = await fetch(`${API_URL}/dentistas/${id}`)
  if (!res.ok) throw new Error("Erro ao buscar dentista")
  return res.json()
}

export async function createDentista(dentista: Dentista): Promise<Dentista> {
  const res = await fetch(`${API_URL}/dentistas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dentista),
  })
  if (!res.ok) throw new Error("Erro ao criar/atualizar dentista")
  return res.json()
}

export async function updateDentista(_id: number, dentista: Dentista): Promise<Dentista> {
  return createDentista(dentista)
}

export async function deleteDentista(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/dentistas/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Erro ao excluir dentista")
}

// ---------- CONSULTAS ----------
export async function getConsultas(): Promise<Consulta[]> {
  const res = await fetch(`${API_URL}/consultas`)
  if (!res.ok) throw new Error("Erro ao buscar consultas")
  return res.json()
}

export async function createConsulta(consulta: Consulta): Promise<Consulta> {
  const res = await fetch(`${API_URL}/consultas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consulta),
  })
  if (!res.ok) throw new Error("Erro ao criar consulta")
  return res.json()
}

export async function updateConsulta(id: number, consulta: Consulta): Promise<Consulta> {
  const res = await fetch(`${API_URL}/consultas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consulta),
  })
  if (!res.ok) throw new Error("Erro ao atualizar consulta")
  return res.json()
}

export async function deleteConsulta(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/consultas/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Erro ao excluir consulta")
}
