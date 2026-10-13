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
- Mantenha o fluxo principal em seis etapas, com Dados/Anamnese juntos e Relatório/PDF juntos, para reduzir a navegação.
- Centralize a estrutura do painel clínico final para manter tela, cópia e PDF com os mesmos blocos e ordem.
- Preserve a cópia do relatório em formatos HTML semântico e texto puro para compatibilidade com editores ricos e simples.
- Keep adjusted-weight and hydration decisions in deriveResults so all displays and exports consume the same unrounded result.
- Keep training-day global selection transitions in training-days.ts so training and rest controls remain consistent and testable.
- Keep PDF branding colors in report-theme.ts so print presentation uses centralized tokens.
- Keep decimal-place limiting of numeric inputs in numeric.ts so every decimal field enforces the same precision.
- Keep atypical-day meals and composition in separate session-only route state; reuse the dietary calculation helper so habitual totals are never mixed with atypical totals.
- Keep weight-goal math in weight-projection.ts/weight-goals.ts and session-only state; format its results through weight-goals-report.ts for the final report, rich copy and unified PDF so all outputs stay consistent.
- Reuse WeightGoalsChart for the weight-goal input screen and final report so both display the same trajectory and comparison markers.
- Group imported anthropometry through anthropometry-groups.ts, retaining original rows and separate evaluation dates to avoid conflating assessments.
- Reuse WeightReferenceCards and cardsMetasReferencia for module and final-screen reference cards so both consume existing weight-goal results without new calculations.
- Keep shift-range selection in MultiOptionRow/selection-range.ts and apply preference-group rules (Nenhum/Todos) only through aplicarSelecaoPreferencia, so every button row — training days, habits and food preferences — behaves identically.
