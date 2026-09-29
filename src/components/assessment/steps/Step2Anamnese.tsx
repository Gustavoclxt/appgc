import { novoId } from "@/lib/assessment/initial-state";

import {
  Field,
  LongText,
  MultiOptionRow,
  OptionRow,
  Panel,
  RowButton,
  Select,
  SubTitle,
  TextInput,
  UnitInput,
} from "../fields";
import type { StepProps } from "./types";

const simNao = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const objetivos = [
  { value: "Emagrecimento", label: "Emagrecimento" },
  { value: "Recomposição corporal", label: "Recomposição corporal" },
  { value: "Hipertrofia", label: "Hipertrofia" },
  { value: "Longevidade", label: "Longevidade" },
];

export function Step2Anamnese({ a, set, d }: StepProps) {
  return (
    <div className="space-y-6">
      <Panel titulo="Informações gerais" meta="Anamnese de 1ª consulta">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Já fez dieta e/ou consultou nutricionista anteriormente?">
            <OptionRow value={a.jaFezDieta} onChange={(v) => set("jaFezDieta", v as typeof a.jaFezDieta)} options={simNao} />
          </Field>
          <Field label="Qual seu objetivo (motivo da consulta)?" className="sm:col-span-2">
            <MultiOptionRow values={a.objetivos} onChange={(v) => set("objetivos", v)} options={objetivos} />
          </Field>
          <Field label="No seu físico, o que mais lhe incomoda atualmente?">
            <TextInput value={a.incomodoFisico} onChange={(v) => set("incomodoFisico", v)} />
          </Field>
          <Field label="Peso desejado (Opcional - em caso de emagrecimento)">
            <UnitInput value={a.pesoDesejado} onChange={(v) => set("pesoDesejado", v)} unidade="kg" />
          </Field>
          <Field label="Qual sua maior dificuldade relacionada ao seu objetivo?">
            <TextInput value={a.maiorDificuldade} onChange={(v) => set("maiorDificuldade", v)} />
          </Field>
          <Field label="De 0 a 10, como está sua motivação?">
            <Select
              value={a.motivacao}
              onChange={(v) => set("motivacao", v)}
              options={Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: String(i) }))}
            />
          </Field>
          <Field label="O que falta para chegar em 10?" className="sm:col-span-2">
            <TextInput value={a.faltaParaDez} onChange={(v) => set("faltaParaDez", v)} />
          </Field>
        </div>
      </Panel>

      <Panel titulo="Histórico clínico">
        <div className="grid grid-cols-1 gap-5">
          <Field
            label="Histórico do peso"
            hint="Infância, adolescência, gestação, vida adulta e principais variações de peso."
          >
            <LongText value={a.historicoPeso} onChange={(v) => set("historicoPeso", v)} rows={4} />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="HMA">
              <LongText value={a.hma} onChange={(v) => set("hma", v)} />
            </Field>
            <Field label="HMP">
              <LongText value={a.hmp} onChange={(v) => set("hmp", v)} />
            </Field>
            <Field label="HMF">
              <LongText value={a.hmf} onChange={(v) => set("hmf", v)} />
            </Field>
          </div>
        </div>
        <SubTitle>Medicamentos</SubTitle>
        <div className="space-y-3">
          {a.medicamentos.map((m, i) => (
            <div key={m.id} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_0.8fr_1fr_auto]">
              <TextInput
                value={m.nome}
                placeholder="Medicamento"
                onChange={(v) =>
                  set(
                    "medicamentos",
                    a.medicamentos.map((x, j) => (j === i ? { ...x, nome: v } : x)),
                  )
                }
              />
              <TextInput
                value={m.dose}
                placeholder="Dose"
                onChange={(v) =>
                  set(
                    "medicamentos",
                    a.medicamentos.map((x, j) => (j === i ? { ...x, dose: v } : x)),
                  )
                }
              />
              <TextInput
                value={m.acao}
                placeholder="Ação"
                onChange={(v) =>
                  set(
                    "medicamentos",
                    a.medicamentos.map((x, j) => (j === i ? { ...x, acao: v } : x)),
                  )
                }
              />
              <RowButton onClick={() => set("medicamentos", a.medicamentos.filter((_, j) => j !== i))}>
                Remover
              </RowButton>
            </div>
          ))}
          <RowButton
            onClick={() =>
              set("medicamentos", [...a.medicamentos, { id: novoId(), nome: "", dose: "", acao: "" }])
            }
          >
            + Adicionar medicamento
          </RowButton>
        </div>
      </Panel>

      <Panel titulo="Exames bioquímicos, alergias e hábitos">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Possui exames bioquímicos recentes?">
            <OptionRow value={a.possuiExames} onChange={(v) => set("possuiExames", v as typeof a.possuiExames)} options={simNao} />
          </Field>
          <Field label="Tem plano de saúde?">
            <OptionRow value={a.planoSaude} onChange={(v) => set("planoSaude", v as typeof a.planoSaude)} options={simNao} />
          </Field>
          <Field label="Alergia e/ou intolerância alimentar?">
            <OptionRow value={a.alergia} onChange={(v) => set("alergia", v as typeof a.alergia)} options={simNao} />
          </Field>
          {a.alergia === "sim" && (
            <Field label="Qual?">
              <TextInput value={a.alergiaDescricao} onChange={(v) => set("alergiaDescricao", v)} />
            </Field>
          )}
          <Field label="Restrição alimentar">
            <OptionRow
              value={a.restricaoAlimentar}
              onChange={(v) => set("restricaoAlimentar", v as typeof a.restricaoAlimentar)}
              options={[
                { value: "nao", label: "Não" },
                { value: "vegetariano", label: "Vegetariano" },
                { value: "vegano", label: "Vegano" },
              ]}
            />
          </Field>
          <Field label="Usa ou já usou EAAs?">
            <OptionRow value={a.eaas} onChange={(v) => set("eaas", v as typeof a.eaas)} options={simNao} />
          </Field>
          {a.eaas === "sim" && (
            <Field label="Especifique" className="sm:col-span-2">
              <LongText value={a.eaasDescricao} onChange={(v) => set("eaasDescricao", v)} rows={2} />
            </Field>
          )}
          <Field label="Hábitos sociais" className="sm:col-span-2">
            <MultiOptionRow
              values={a.habitosSociais}
              onChange={(v) => set("habitosSociais", v)}
              options={[
                { value: "Não", label: "Não" },
                { value: "Etilista", label: "Etilista" },
                { value: "Tabagista", label: "Tabagista" },
              ]}
            />
          </Field>
        </div>
      </Panel>

      <Panel titulo="Revisão de sistemas">
        <SubTitle>Função estomacal e intestinal</SubTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Função estomacal" className="sm:col-span-2">
            <OptionRow
              value={a.funcaoEstomacal}
              onChange={(v) => set("funcaoEstomacal", v)}
              options={[
                { value: "Normal", label: "Normal" },
                { value: "Azia", label: "Azia" },
                { value: "Eructação excessiva", label: "Eructação excessiva" },
              ]}
            />
          </Field>
          <Field label="Frequência de evacuação">
            <Select
              value={a.frequenciaEvacuacao}
              onChange={(v) => set("frequenciaEvacuacao", v)}
              options={[
                "1 vez por dia",
                "2 vezes por dia",
                "3 vezes por dia",
                "1 vez por semana",
                "2 vezes por semana",
                "3 vezes por semana",
                "4 vezes por semana",
                "5 vezes por semana",
                "6 vezes por semana",
                "Dia sim, dia não",
              ].map((opcao) => ({ value: opcao, label: opcao }))}
            />
          </Field>
          <Field label="Escala de Bristol">
            <Select
              value={a.bristol}
              onChange={(v) => set("bristol", v)}
              options={Array.from({ length: 7 }, (_, i) => ({ value: `B${i + 1}`, label: `B${i + 1}` }))}
            />
          </Field>
          <Field label="Consumo de água / ingestão de líquidos">
            <TextInput value={a.consumoAgua} onChange={(v) => set("consumoAgua", v)} />
          </Field>
          <Field label="Escala Armstrong">
            <Select
              value={a.armstrong}
              onChange={(v) => set("armstrong", v)}
              options={Array.from({ length: 8 }, (_, i) => ({ value: `A${i + 1}`, label: `A${i + 1}` }))}
            />
          </Field>
        </div>

        <SubTitle>Sono</SubTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Horário que dorme">
            <TextInput type="time" value={a.horaDormir} onChange={(v) => set("horaDormir", v)} />
          </Field>
          <Field label="Horário que acorda">
            <TextInput type="time" value={a.horaAcordar} onChange={(v) => set("horaAcordar", v)} />
          </Field>
          <Field label="Qualidade">
            <OptionRow
              value={a.qualidadeSono}
              onChange={(v) => set("qualidadeSono", v)}
              options={[
                { value: "Ruim", label: "Ruim" },
                { value: "Moderada", label: "Moderada" },
                { value: "Boa", label: "Boa" },
              ]}
            />
          </Field>
        </div>
        {d.sono && (
          <p className="mt-4 rounded-[10px] bg-accent-soft/70 px-4 py-3 font-mono text-[12px] text-accent ring-1 ring-accent/15">
            Você dorme aproximadamente {d.sono.horas} horas e {d.sono.restoMinutos} minutos.
          </p>
        )}
      </Panel>
    </div>
  );
}
