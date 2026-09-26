# ARCHITECTURE

Architecture specifications. **Empty until an operator populates it.**

## Precedence

When sources disagree about technical behaviour, this order applies:

1. existing code
2. existing tests
3. documented architecture
4. approved product requirements
5. game design
6. lore

The same order, for narrative continuity:

1. `lore/LORE_CANON_RULES.md`
2. `lore/LORE_CANON.md`
3. specialised documents in `lore/`
4. canon already present in the game
5. future proposals

**Lore does not justify a code change on its own.** A narrative document can
motivate work; it cannot authorise it.

## What belongs here

- Component and boundary diagrams
- Data flow and trust boundaries
- Interface and contract definitions
- Decision records, especially contradictions and how they were resolved

## The product/fiction boundary

Melodiespark INC is the real product. _Melodiespark: The Long Song_ is the
fictional setting of a game. The lore may guide design and data evolution. It
does not describe the history, operations, revenue, security posture, or
capabilities of the real company, and documentation must never imply that it
does.

## What does not belong here

- Aspirational diagrams for systems that do not exist, presented as if they do
- Generated directory trees. Use `melodie catalog --repos` for ground truth
- Design documents with no owner, input contract, output contract, failure
  behaviour, audit event, test, permission model, or rollback plan

## The completion bar

A feature is complete when it has an owner, an input contract, an output
contract, defined failure behaviour, an audit event, a test, a permission model,
and a rollback plan. Scale the number of *validated workflows*, not the number
of documented buttons.
