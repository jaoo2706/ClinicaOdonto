"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Calendar, UserRound, Users } from "lucide-react"
import {
  getConsultas,
  getDentistas,
  getPacientes,
  type Consulta,
  type Paciente,
  type Dentista,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Dashboard() {
  const [proximasConsultas, setProximasConsultas] = useState<Consulta[]>([])
  const [estatisticas, setEstatisticas] = useState({
    pacientes: 0,
    dentistas: 0,
    consultas: 0,
  })

  useEffect(() => {
    async function fetchDados() {
      try {
        const [consultas, pacientes, dentistas] = await Promise.all([
          getConsultas(),
          getPacientes(),
          getDentistas(),
        ])

        // Estatísticas
        setEstatisticas({
          pacientes: pacientes.length,
          dentistas: dentistas.length,
          consultas: consultas.length,
        })

        // Enriquecer com nomes e filtrar as próximas
        const hoje = new Date()
        const proximas = consultas
          .map((consulta: any) => {
            const paciente = pacientes.find(
              (p: Paciente) => p.id === consulta.id_paciente
            )
            const dentista = dentistas.find(
              (d: Dentista) => d.id === consulta.id_dentista
            )

            return {
              ...consulta,
              paciente,
              dentista,
              dataObj: new Date(`${consulta.data}T${consulta.hora}`),
            }
          })
          .filter((c) => c.dataObj >= hoje)
          .sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime())
          .slice(0, 3)

        setProximasConsultas(proximas)
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err)
      }
    }

    fetchDados()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de gerenciamento da clínica odontológica
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/pacientes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Gerenciar cadastro de pacientes</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/consultas">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Consultas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Agendar e gerenciar consultas</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dentistas">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Dentistas</CardTitle>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Gerenciar cadastro de dentistas</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Próximas Consultas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {proximasConsultas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma consulta futura encontrada.
              </p>
            ) : (
              proximasConsultas.map((c) => (
                <div key={c.id} className="text-sm">
                  <strong>{c.paciente?.nome || `Paciente ID ${c.id_paciente}`}</strong>{" "}
                  com{" "}
                  <strong>{c.dentista?.nome || `Dentista ID ${c.id_dentista}`}</strong>
                  <br />
                  {format(
                    new Date(`${c.data}T${c.hora}`),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>{estatisticas.pacientes}</strong> pacientes cadastrados
            </p>
            <p>
              <strong>{estatisticas.dentistas}</strong> dentistas cadastrados
            </p>
            <p>
              <strong>{estatisticas.consultas}</strong> consultas agendadas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
