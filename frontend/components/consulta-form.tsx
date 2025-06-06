"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Consulta, type Paciente, type Dentista, createConsulta, updateConsulta } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ConsultaFormProps {
  consulta: Consulta | null
  pacientes: Paciente[]
  dentistas: Dentista[]
  onSuccess: () => void
}

export default function ConsultaForm({ consulta, pacientes, dentistas, onSuccess }: ConsultaFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Consulta>({
    defaultValues: consulta || {
      id_paciente: 0,
      id_dentista: 0,
      data: new Date().toISOString().split("T")[0],
      hora: "09:00",
      observacoes: "",
    },
  })

  // Observar os valores selecionados
  const idPaciente = watch("id_paciente")
  const idDentista = watch("id_dentista")

  const onSubmit = async (data: Consulta) => {
    try {
      setLoading(true)
      if (consulta && consulta.id) {
        await updateConsulta(consulta.id, data)
        toast({
          title: "Sucesso",
          description: "Consulta atualizada com sucesso",
        })
      } else {
        await createConsulta(data)
        toast({
          title: "Sucesso",
          description: "Consulta criada com sucesso",
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: consulta ? "Não foi possível atualizar a consulta" : "Não foi possível criar a consulta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="id_paciente">Paciente</Label>
          <Select
            value={idPaciente.toString()}
            onValueChange={(value) => setValue("id_paciente", Number.parseInt(value))}
          >
            <SelectTrigger id="id_paciente">
              <SelectValue placeholder="Selecione um paciente" />
            </SelectTrigger>
            <SelectContent>
              {pacientes.map((paciente) => (
                <SelectItem key={paciente.id} value={paciente.id?.toString() || ""}>
                  {paciente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_paciente && <p className="text-sm text-red-500">Paciente é obrigatório</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_dentista">Dentista</Label>
          <Select
            value={idDentista.toString()}
            onValueChange={(value) => setValue("id_dentista", Number.parseInt(value))}
          >
            <SelectTrigger id="id_dentista">
              <SelectValue placeholder="Selecione um dentista" />
            </SelectTrigger>
            <SelectContent>
              {dentistas.map((dentista) => (
                <SelectItem key={dentista.id} value={dentista.id?.toString() || ""}>
                  {dentista.nome} - {dentista.especialidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_dentista && <p className="text-sm text-red-500">Dentista é obrigatório</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data">Data</Label>
          <Input id="data" type="date" {...register("data", { required: "Data é obrigatória" })} />
          {errors.data && <p className="text-sm text-red-500">{errors.data.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hora">Hora</Label>
          <Input id="hora" type="time" {...register("hora", { required: "Hora é obrigatória" })} />
          {errors.hora && <p className="text-sm text-red-500">{errors.hora.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" {...register("observacoes")} rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {consulta ? "Atualizar" : "Agendar"}
        </Button>
      </div>
    </form>
  )
}
