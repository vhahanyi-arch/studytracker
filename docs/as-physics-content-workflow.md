# AS Physics content workflow

User-approved follow-up, 19 September 2026. Applies alongside the original question-engine brief.

1. Use the supplied 2025–2027 Cambridge 9702 syllabus and its checked objective record. Keep scope at AS Level and flag ambiguous wording.
2. Draft each topic separately using the established `sq` / `validateUnitSet` architecture: six questions in each of three tiers. Verify at least 3,000 iterations per tier before porting; check physical validity, arithmetic, decimals, meaningful variation, conditional branches and marking ambiguity.
3. Port only a passing draft. Strictly compile the actual engine, run the compiled-production regression, and verify registration and page enablement. Record actual results and limitations in the topic verification report.
4. Deliver a student revision reference alongside every topic in `docs/as-physics-notes/`: objective-aligned concepts and a distinct formula section with every relevant formula, symbol meanings, SI units and conditions of use. Topics 1–5 have retrospective references.
5. Immediately commit the verified topic, reference and report locally. Inspect the diff and stage only owned changes; do not blindly stage whole shared directories. Suggested message: `AS Physics: verify and enable Topic N — [topic name]`.
6. Before a large edit to a shared file, first preserve owned work in a local commit. In particular, coordinate carefully around `app/page.tsx`, which another track may edit.
7. Do not push or deploy. The other track manages integration and deployment. Local verification does not imply deployment or browser integration testing.

Existing Topics 1–5 were preserved together in local commit `786bc53` because they had accumulated before this workflow was adopted. Future completed topics should each have their own checkpoint.
