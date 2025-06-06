"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, Loader2, Calendar } from "lucide-react"
import {
  type Consulta,
  type Paciente,
  type Dentista,
  getConsultas,
  deleteConsulta,
  getPacientes,
  getDentistas,
} from "@/lib/api"
import ConsultaForm from "@/components/consulta-form"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [consultaToDelete, setConsultaToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDentista, setFilterDentista] = useState<string>("")
  const [filterPaciente, setFilterPaciente] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [consultasData, pacientesData, dentistasData] = await Promise.all([
        getConsultas(),
        getPacientes(),
        getDentistas(),
      ])

      // Enriquecer as consultas com dados de pacientes e dentistas
      const consultasEnriquecidas = consultasData.map((consulta) => {
        const paciente = pacientesData.find((p) => p.id === consulta.id_paciente)
        const dentista = dentistasData.find((d) => d.id === consulta.id_dentista)
        return {
          ...consulta,
          paciente,
          dentista,
        }
      })

      setConsultas(consultasEnriquecidas)
      setPacientes(pacientesData)
      setDentistas(dentistasData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (consulta: Consulta) => {
    setEditingConsulta(consulta)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (consultaToDelete === null) return

    try {
      await deleteConsulta(consultaToDelete)
      setConsultas(consultas.filter((c) => c.id !== consultaToDelete))
      toast({
        title: "Sucesso",
        description: "Consulta excluída com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a consulta",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setConsultaToDelete(null)
    }
  }

  const confirmDelete = (id: number) => {
    setConsultaToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmitSuccess = () => {
    loadData()
    setIsFormOpen(false)
    setEditingConsulta(null)
  }

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString)
      return format(data, "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dataString
    }
  }

  const filteredConsultas = consultas.filter((consulta) => {
    const matchesSearch =
      (consulta.paciente?.nome.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (consulta.dentista?.nome.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      consulta.observacoes.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDentista = filterDentista ? consulta.id_dentista === Number.parseInt(filterDentista) : true
    const matchesPaciente = filterPaciente ? consulta.id_paciente === Number.parseInt(filterPaciente) : true

    return matchesSearch && matchesDentista && matchesPaciente
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultas</h1>
          <p className="text-muted-foreground">Gerencie as consultas da clínica</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingConsulta(null)}>
              <Calendar className="mr-2 h-4 w-4" /> Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingConsulta ? "Editar Consulta" : "Nova Consulta"}</DialogTitle>
            </DialogHeader>
            <ConsultaForm
              consulta={editingConsulta}
              pacientes={pacientes}
              dentistas={dentistas}
              onSuccess={handleFormSubmitSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:max-w-xs"
        />

        <Select value={filterDentista} onValueChange={setFilterDentista}>
          <SelectTrigger className="md:max-w-xs">
            <SelectValue placeholder="Filtrar por dentista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os dentistas</SelectItem>
            {dentistas.map((dentista) => (
              <SelectItem key={dentista.id} value={dentista.id?.toString() || ""}>
                {dentista.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPaciente} onValueChange={setFilterPaciente}>
          <SelectTrigger className="md:max-w-xs">
            <SelectValue placeholder="Filtrar por paciente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pacientes</SelectItem>
            {pacientes.map((paciente) => (
              <SelectItem key={paciente.id} value={paciente.id?.toString() || ""}>
                {paciente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Nenhuma consulta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsultas.map((consulta) => (
                  <TableRow key={consulta.id}>
                    <TableCell>{consulta.paciente?.nome || `Paciente ID: ${consulta.id_paciente}`}</TableCell>
                    <TableCell>{consulta.dentista?.nome || `Dentista ID: ${consulta.id_dentista}`}</TableCell>
                    <TableCell>{formatarData(consulta.data)}</TableCell>
                    <TableCell>{consulta.hora}</TableCell>
                    <TableCell className="max-w-xs truncate">{consulta.observacoes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(consulta)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => confirmDelete(consulta.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
