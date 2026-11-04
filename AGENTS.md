<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Centralize a seleção de exames do relatório em um helper compartilhado para manter a prévia e o PDF idênticos.
- Centralize a formatação do diário alimentar em um helper compartilhado para manter a prévia e o PDF idênticos.
- Centralize a organização da anamnese do relatório em um helper compartilhado para manter prévia, PDF e cópia consistentes.
- Mantenha o fluxo principal em cinco etapas, com Dados/Anamnese juntos e Relatório/PDF juntos, para reduzir a navegação.
- Centralize a estrutura do painel clínico final para manter tela, cópia e PDF com os mesmos blocos e ordem.
- Resolve the summary's measured weight through anthropometry-groups and consume the existing derived cardio range in clinical-dashboard so screen, copy and PDF agree without changing energy calculations.
- Preserve a cópia do relatório em formatos HTML semântico e texto puro para compatibilidade com editores ricos e simples.
- Keep adjusted-weight and hydration decisions in deriveResults so all displays and exports consume the same unrounded result.
- Keep TMB equation dispatch and required-input validation in calculateTMB, using deriveResults body weight and fat-free mass, so energy, reports and exports share unrounded estimates without fallback to a different equation.
- Keep training-day global selection transitions in training-days.ts so training and rest controls remain consistent and testable.
- Keep PDF branding colors in report-theme.ts so print presentation uses centralized tokens.
- Keep decimal-place limiting of numeric inputs in numeric.ts so every decimal field enforces the same precision.
- Keep atypical-day meals and composition in separate session-only route state; reuse the dietary calculation helper so habitual totals are never mixed with atypical totals.
- Keep weight-goal math in weight-projection.ts/weight-goals.ts and session-only state; format its results through weight-goals-report.ts for the final report, rich copy and unified PDF so all outputs stay consistent.
- Reuse WeightGoalsChart for the weight-goal input screen and final report so both display the same trajectory and comparison markers.
- Group imported anthropometry through anthropometry-groups.ts, retaining original rows and separate evaluation dates to avoid conflating assessments.
- Format anthropometry labels and measurement values through anthropometry-groups, passing the diagram category so abbreviated imported body-site names retain their measurement context without modifying source data.
- Reuse WeightReferenceCards and cardsMetasReferencia for module and final-screen reference cards so both consume existing weight-goal results without new calculations.
- Keep shift-range selection in MultiOptionRow/selection-range.ts and apply preference-group rules (Nenhum/Todos) only through aplicarSelecaoPreferencia, so every button row — training days, habits and food preferences — behaves identically.
- Keep the meal-location choices in food-diary.ts (LOCAIS_REFEICAO + opcoesDeLocal) so the 24h recall, the atypical day and every export share one option list, and so a value outside the list stays visible instead of silently resetting to empty.
- Keep the cardio heart-rate panel in its own Step6Cardio component rendered after the weight-goals module so it always sits last on the energy step, whether or not the weight-goal module is active.

- Embed Unicode report fonts through pdf-font.ts and wrap every laboratory-table cell in pdf-report.ts so clinical units remain intact and columns never overlap.
- Pass the session-only atypical composition separately to the unified PDF exporter and format it with composicaoParaRelatorio so habitual and atypical totals stay independent.
- Keep form-specific review guidance in analysis-guidance.ts and factual inputs in buildResumo; normalize AI output through analysis-result.ts without truncating relevant findings/actions so shared screen, copy and PDF consumers retain clinical coverage.
- Keep laboratory PDF import in ExamUpload, writing to the existing session assessment state, so moving the upload control does not change downstream display, analysis or exports.
- Keep anthropometric body-site mapping in anthropometry-body and render each dated group's original measurements through AnthropometryBody; diagrams are presentation-only and never calculate or infer values. Silhouettes are per-sex CDN image assets chosen by the assessment sex, with landmark coordinates calibrated per figure.
- Build the report's block order once in report-structure.ts (form order, including the atypical-day recall) so screen, copy and PDF render identical sections.
- Build the patient-facing timeline PDF from patient-timeline.ts using the existing weight-goal results, so it never recomputes projections differently from the clinical report.
- Build the Jornada de Recomposição Corporal once in jornada.ts (screen component and jornada-pdf.ts only render it) so screen and PDF never diverge.
