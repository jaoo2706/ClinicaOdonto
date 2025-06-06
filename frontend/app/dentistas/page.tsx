"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { type Dentista, getDentistas, deleteDentista } from "@/lib/api"
import DentistaForm from "@/components/dentista-form"
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

export default function DentistasPage() {
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDentista, setEditingDentista] = useState<Dentista | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dentistaToDelete, setDentistaToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadDentistas()
  }, [])

  async function loadDentistas() {
    try {
      setLoading(true)
      const data = await getDentistas()
      setDentistas(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dentistas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (dentista: Dentista) => {
    setEditingDentista(dentista)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (dentistaToDelete === null) return

    try {
      await deleteDentista(dentistaToDelete)
      setDentistas(dentistas.filter((d) => d.id !== dentistaToDelete))
      toast({
        title: "Sucesso",
        description: "Dentista excluído com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o dentista",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDentistaToDelete(null)
    }
  }

  const confirmDelete = (id: number) => {
    setDentistaToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmitSuccess = () => {
    loadDentistas()
    setIsFormOpen(false)
    setEditingDentista(null)
  }

  const filteredDentistas = dentistas.filter(
    (dentista) =>
      dentista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentista.cpf.includes(searchTerm) ||
      dentista.especialidade.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dentistas</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de dentistas da clínica</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDentista(null)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Dentista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingDentista ? "Editar Dentista" : "Novo Dentista"}</DialogTitle>
            </DialogHeader>
            <DentistaForm dentista={editingDentista} onSuccess={handleFormSubmitSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center mb-4">
        <Input
          placeholder="Buscar por nome, CPF ou especialidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDentistas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    {searchTerm ? "Nenhum dentista encontrado" : "Nenhum dentista cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDentistas.map((dentista) => (
                  <TableRow key={dentista.id}>
                    <TableCell className="font-medium">{dentista.nome}</TableCell>
                    <TableCell>{dentista.cpf}</TableCell>
                    <TableCell>{dentista.especialidade}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(dentista)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => confirmDelete(dentista.id!)}
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
              Tem certeza que deseja excluir este dentista? Esta ação não pode ser desfeita.
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
