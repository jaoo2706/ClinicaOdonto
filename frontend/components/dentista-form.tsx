"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Dentista, createDentista, updateDentista } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DentistaFormProps {
  dentista: Dentista | null
  onSuccess: () => void
}

export default function DentistaForm({ dentista, onSuccess }: DentistaFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Dentista>({
    defaultValues: dentista || {
      nome: "",
      especialidade: "",
      cpf: "",
    },
  })

  const onSubmit = async (data: Dentista) => {
    try {
      setLoading(true)
      if (dentista && dentista.id) {
        await updateDentista(dentista.id, data)
        toast({
          title: "Sucesso",
          description: "Dentista atualizado com sucesso",
        })
      } else {
        await createDentista(data)
        toast({
          title: "Sucesso",
          description: "Dentista criado com sucesso",
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: dentista ? "Não foi possível atualizar o dentista" : "Não foi possível criar o dentista",
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
          <Label htmlFor="especialidade">Especialidade</Label>
          <Input id="especialidade" {...register("especialidade", { required: "Especialidade é obrigatória" })} />
          {errors.especialidade && <p className="text-sm text-red-500">{errors.especialidade.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {dentista ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  )
}
