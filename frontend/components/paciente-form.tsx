"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Paciente, createPaciente, updatePaciente } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface PacienteFormProps {
  paciente: Paciente | null
  onSuccess: () => void
}

export default function PacienteForm({ paciente, onSuccess }: PacienteFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Paciente>({
    defaultValues: paciente || {
      nome: "",
      telefone: "",
      email: "",
      cpf: "",
    },
  })

  const onSubmit = async (data: Paciente) => {
    try {
      setLoading(true)
      if (paciente && paciente.id) {
        await updatePaciente(paciente.id, data)
        toast({
          title: "Sucesso",
          description: "Paciente atualizado com sucesso",
        })
      } else {
        await createPaciente(data)
        toast({
          title: "Sucesso",
          description: "Paciente criado com sucesso",
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: paciente ? "Não foi possível atualizar o paciente" : "Não foi possível criar o paciente",
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
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" {...register("nome", { required: "Nome é obrigatório" })} />
          {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            {...register("cpf", {
              required: "CPF é obrigatório",
              pattern: {
                value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
                message: "CPF inválido. Use o formato 000.000.000-00 ou 00000000000",
              },
            })}
            placeholder="000.000.000-00"
          />
          {errors.cpf && <p className="text-sm text-red-500">{errors.cpf.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            {...register("telefone", { required: "Telefone é obrigatório" })}
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && <p className="text-sm text-red-500">{errors.telefone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido",
              },
            })}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {paciente ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  )
}
