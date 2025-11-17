# UX/Usability Checklist: Random Exercise Generator with Tag Quotas

**Purpose**: Pre-implementation sanity check for UX/Usability requirements quality
**Created**: 2025-11-15
**Feature**: [spec.md](../spec.md)

**Note**: This checklist tests requirements clarity, completeness, and consistency. Check items off as you verify each requirement quality aspect. This is NOT an implementation verification checklist.

---

## QuotaForm & Random Generation Workflow

- [ ] CHK001 Are quota input field types explicitly specified (e.g., dropdown for tags, number input for counts)? [Clarity] [Spec §FR-001]

- [ ] CHK002 Is the "Generate Random Workout" button's enabled/disabled states clearly defined across all scenarios (empty pool, insufficient exercises, valid quotas)? [Completeness] [Spec §US1-AC2, Edge Cases]

- [ ] CHK003 Are validation error messages for quota inputs specified with exact wording or clear patterns (e.g., "Not enough [tag] exercises. Need X, have Y.")? [Clarity] [Spec §US1-AC2]

- [ ] CHK004 Is the behavior when user sets quota = 0 or negative numbers explicitly specified? [Completeness] [Spec §Edge Cases, plan.md validation.js]

- [ ] CHK005 Are the quota form's layout and presentation format specified (inline form vs. modal)? [Clarity] [Spec §Assumptions "UI Location"]

## Reroll & Pin Interactions

- [ ] CHK006 Are reroll button disabled states consistently defined across all scenarios (only 1 exercise available, pinned exercise, no alternatives)? [Consistency] [Spec §US2-AC3, §FR-006]

- [ ] CHK007 Is visual feedback for pin toggle explicitly specified with both states (pinned icon vs. unpinned icon, e.g., filled 📌 vs. outline 📍)? [Clarity] [Spec §US3-AC1, §US3-AC3]

- [ ] CHK008 Is the response time requirement for pin toggle (<100ms) testable and realistic? [Testability] [Spec §SC-004]

- [ ] CHK009 Are hover states and tooltips specified for reroll and pin buttons? [Completeness] [Gap - consider adding]

- [ ] CHK010 Is the reroll "avoid recently shown" behavior clearly quantified (e.g., "last 2-3 shown")? [Clarity] [Spec §Assumptions "Reroll Avoidance"]

## Regenerate Workout Workflow

- [ ] CHK011 Is the "Regenerate Workout" button's availability clearly specified (enabled when at least 1 unpinned exercise exists)? [Clarity] [Spec §US3-AC2]

- [ ] CHK012 Is confirmation dialog behavior specified before regenerating (prevent accidental data loss)? [Completeness] [quickstart.md suggests "confirmation dialog"]

- [ ] CHK013 Are pinned exercise positions preserved during regeneration, or can their order change? [Clarity] [Spec §US3-AC2 says "remain in the same positions"]

## Quota Templates UI

- [ ] CHK014 Is the template save workflow clearly specified (trigger button location, naming input method, save confirmation)? [Clarity] [Spec §US4-AC1]

- [ ] CHK015 Is the template selection UI format specified (dropdown vs. list vs. other)? [Clarity] [Spec §US4-AC2 mentions "dropdown"]

- [ ] CHK016 Is template deletion confirmation behavior specified to prevent accidental deletion? [Completeness] [Spec §US4-AC3 mentions "confirmation dialog"]

## Error States & Empty States

- [ ] CHK017 Is the empty exercise pool state clearly specified with user guidance (e.g., "Create workout plans first to build exercise pool")? [Clarity] [quickstart.md mentions tooltip]

- [ ] CHK018 Are localStorage error scenarios addressed with user-facing messages (quota exceeded, disabled localStorage)? [Completeness] [quickstart.md troubleshooting mentions warnings]

- [ ] CHK019 Is the behavior when a saved template references non-existent tags explicitly specified? [Completeness] [Spec §Edge Cases "Tag no longer exists"]

## Visual Feedback & Performance Expectations

- [ ] CHK020 Are all performance targets realistic and testable (<30s workflow, <2s generation, <100ms pin toggle, <10s template load)? [Testability] [Spec §Success Criteria]

---

## Summary

**Total Items**: 20
**Focus**: UX/Usability requirements quality
**Depth**: Pre-implementation sanity check (lightweight)

**Instructions**:
1. Review each checklist item
2. Mark `[x]` if requirement is clear, complete, consistent, and testable
3. If item reveals gap or ambiguity, update spec.md or plan.md accordingly
4. Consider adding items marked `[Gap - consider adding]` to spec

**Traceability Legend**:
- `[Clarity]` - Is the requirement unambiguous?
- `[Completeness]` - Are all scenarios covered?
- `[Consistency]` - Does it align with other requirements?
- `[Testability]` - Can it be objectively verified?
- `[Gap]` - Missing requirement (consider adding)
