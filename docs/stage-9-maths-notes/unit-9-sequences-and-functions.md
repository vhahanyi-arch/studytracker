# Unit 9 — Sequences and functions

Cambridge Lower Secondary Mathematics, Stage 9, objectives 9As.01, 9As.02 and 9As.03. See [source and scope](README.md).

## Key ideas

### Linear and quadratic sequences — 9As.01

Find the differences between consecutive terms:

- if the first differences are all the same, the sequence is **linear**;
- if the first differences change but the **second differences** (differences of the differences) are all the same, the sequence is **quadratic**.

Sequences can come from spatial patterns, such as the number of tiles in growing square patterns, as well as from term-to-term rules.

### nth term rules — 9As.02

- **Linear:** nth term = dn + (first term − d), where d is the common difference.
- **Simple quadratic:** compare with the square numbers n² = 1, 4, 9, 16, 25, … When the second difference is 2, the nth term starts with n². Subtract n² from each term; if what is left is constant c, the nth term is n² + c. If the second difference is 2a, start with an².

### Functions with indices — 9As.03

A function can include powers: x → x² + 1, x → 2x³. To find an output, substitute (indices before multiplying). To find an input from an output, use inverse operations in reverse order; the inverse of squaring is square-rooting, and the inverse of cubing is cube-rooting. A squared input gives two possible inputs, positive and negative.

## Key facts and formulas

| Fact or formula | What it means | When to use it |
|---|---|---|
| Constant first difference: linear | Same jump each time | Identifying the type. |
| Constant second difference: quadratic | The jumps change steadily | Identifying the type. |
| Linear nth term = dn + (first term − d) | d is the common difference | Linear sequences. |
| Second difference 2a: nth term starts an² | Compare with square numbers | Simple quadratic sequences. |
| Inverse of x²: ±√; inverse of x³: ∛ | Undoing powers | Inputs from outputs. |

## Using the methods in different situations

### Situation: identifying the type

**Example.** 3, 7, 11, 15: differences 4, 4, 4: linear. 2, 5, 10, 17: differences 3, 5, 7, second differences 2, 2: quadratic. 2, 4, 8, 16: differences 2, 4, 8: neither (it doubles; a geometric sequence).

### Situation: nth term of a linear sequence

**Example.** 7, 12, 17, 22: d = 5, so nth term = 5n + 2. The 40th term is 202.

**Example — decreasing.** 30, 26, 22, 18: d = −4, so nth term = −4n + 34, or 34 − 4n.

### Situation: nth term of a simple quadratic sequence

**Example.** 2, 5, 10, 17, 26: second difference 2, so start with n². Subtract n² (1, 4, 9, 16, 25): each leaves 1. nth term = n² + 1.

**Example.** 4, 7, 12, 19, 28: second difference 2; terms − n² = 3, 3, 3, 3, 3. nth term = n² + 3.

**Example — a coefficient.** 3, 12, 27, 48: differences 9, 15, 21; second difference 6 = 2 × 3, so start with 3n². The terms are exactly 3n² (3, 12, 27, 48), so the nth term is 3n².

**Example — use it.** For n² + 1, the 10th term is 101. Is 50 a term? n² + 1 = 50 gives n = 7, so yes, the 7th.

### Situation: a pattern of tiles

**Example.** Pattern n is an n by n square of tiles with one extra tile on top: 2, 5, 10, 17 tiles. The nth term is n² + 1, so pattern 12 has 145 tiles.

### Situation: functions with powers

**Example — outputs.** For f: x → x² + 1, an input of 3 gives 10; an input of −3 also gives 10.

**Example — input from output.** For x → 2x³, the output is 54. Reverse: 54 ÷ 2 = 27, then ∛27 = 3. The input was 3.

**Example — two inputs.** For x → x² − 5, the output is 31. Reverse: 31 + 5 = 36, then ±√36: the input was 6 or −6.

## Common mistakes

- Calling a sequence quadratic because its first differences change: check that the second differences are constant.
- Writing n² + c when the second difference is not 2.
- Forgetting the negative square root when reversing a squaring function.
- Working out 2x³ as (2x)³: only x is cubed.
