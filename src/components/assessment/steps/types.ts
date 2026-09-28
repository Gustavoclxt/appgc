import type { DerivedResults } from "@/lib/assessment/calculations";
import type { Assessment } from "@/lib/assessment/types";

export interface StepProps {
  a: Assessment;
  set: <K extends keyof Assessment>(chave: K, valor: Assessment[K]) => void;
  d: DerivedResults;
}
