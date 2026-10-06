# Unit 12 — Probability

Cambridge Lower Secondary Mathematics, Stage 9, objectives 9Sp.01, 9Sp.02, 9Sp.03 and 9Sp.04. See [source and scope](README.md).

## Key ideas

### Mutually exclusive events — 9Sp.01

Events are mutually exclusive if they cannot happen at the same time (rolling a 2 and rolling a 5 with one dice). For mutually exclusive events:

P(A or B) = P(A) + P(B).

The probabilities of all the possible mutually exclusive outcomes add up to 1. Use this to find a missing probability in a table.

### Independent and dependent events — 9Sp.02

- **Independent:** one event does not change the probability of the other (tossing a coin twice; picking with replacement). Then P(A and B) = P(A) × P(B).
- **Dependent:** the first event changes the probability of the second (picking without replacement). After the first pick, there is one fewer item, and possibly one fewer of that colour, so change the second fraction.

A tree diagram shows two stages: multiply along the branches for "and", and add the end results for "or".

### Theoretical probability of combined events — 9Sp.03

For equally likely outcomes, list every combined outcome in a sample-space diagram or tree diagram and count. Or multiply probabilities along tree branches.

### Expected frequency and experiments — 9Sp.04

Expected frequency = probability × number of trials. It is what you would expect on average, not what must happen. Compare it with the observed frequency from an experiment: a large difference over many trials suggests the theoretical probability is wrong, for example because the object is biased.

## Key facts and formulas

| Formula | What it means | When to use it |
|---|---|---|
| P(A or B) = P(A) + P(B) | Mutually exclusive events | "Or" with events that cannot happen together. |
| Sum of all outcome probabilities = 1 | Total probability | Finding a missing probability. |
| P(A and B) = P(A) × P(B) | Independent events | "And" with replacement or separate objects. |
| Without replacement: change the second fraction | Dependent events | Picking from a bag without putting back. |
| Expected frequency = P × number of trials | The average result expected | Predicting; comparing with experiments. |

## Using the methods in different situations

### Situation: a missing probability

**Example.** A spinner lands on red with probability 0.3, blue 0.25, green x and yellow 2x. 0.3 + 0.25 + x + 2x = 1, so 3x = 0.45 and x = 0.15. P(green) = 0.15 and P(yellow) = 0.3.

**Example — "or".** P(red or blue) = 0.3 + 0.25 = 0.55.

### Situation: independent events

**Example — two coins.** P(two heads) = 1/2 × 1/2 = 1/4.

**Example — with replacement.** A bag has 5 red and 3 blue counters. A counter is taken, replaced, and another taken. P(both red) = 5/8 × 5/8 = 25/64.

### Situation: dependent events (without replacement)

**Example — both red.** Same bag, without replacement. P(red first) = 5/8; then 4 red remain out of 7: P(both red) = 5/8 × 4/7 = 20/56 = 5/14.

**Example — one of each.** P(red then blue) = 5/8 × 3/7 = 15/56; P(blue then red) = 3/8 × 5/7 = 15/56. P(one of each) = 30/56 = 15/28.

**Example — check.** P(both blue) = 3/8 × 2/7 = 6/56. Total: 20/56 + 30/56 + 6/56 = 56/56 = 1.

### Situation: combined outcomes from a sample space

**Example.** Two fair four-sided dice (1 to 4) are rolled and the scores multiplied. There are 16 outcomes. A product of 4 comes from (1,4), (2,2), (4,1): P = 3/16.

### Situation: expected frequency

**Example.** P(red) on a spinner is 0.2. In 150 spins, expect 0.2 × 150 = 30 reds.

**Example — compare with an experiment.** The spinner actually lands on red 41 times in 150 spins. That is well above 30; over more spins, if the difference continues, the spinner is probably biased towards red.

**Example — a dice.** A fair dice is rolled 300 times: expect 300 × 1/6 = 50 sixes.

## Common mistakes

- Adding probabilities of events that can happen together.
- Multiplying for "or" or adding for "and".
- Forgetting to reduce both the numerator and the denominator on the second pick without replacement.
- Thinking the expected frequency must happen exactly.
- Missing one order in "one of each" problems (red then blue and blue then red).
