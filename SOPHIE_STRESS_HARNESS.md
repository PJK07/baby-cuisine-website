# Sophie Stress Harness

This repo now includes a reusable stress-test harness for Chef Sophie.

## What It Does

- Simulates 10 independent customer agents.
- Exercises large, multi-item ordering conversations.
- Covers:
  - normal orders
  - typo-heavy input
  - substitutions
  - repeated edits
  - unavailable item requests
  - conflicting instructions
  - large quantities
  - mixed-language input
  - delivery ambiguity
  - cancellation or change after confirmation
- Captures:
  - transcript
  - parsed order
  - final total
  - errors
  - latency
  - clarification prompts
  - item-confirmation behavior
- Writes a Markdown report and JSON report to `scratch/`.

## Safety

- Default mode is `local-simulator`.
- It does not modify production data.
- It does not write to Supabase.
- It uses the current menu fixture in `src/app/data/products.ts`.

## Run

```bash
npm run stress:sophie
```

Outputs:

```text
scratch/sophie-stress-report.md
scratch/sophie-stress-report.json
```

## Optional Debug

```bash
npm run stress:sophie -- --debug
```

This prints each turn/response while still generating the report files.

## Notes

- The harness is intentionally deterministic and local.
- If you later want an endpoint-backed version, add a staging adapter rather than pointing it at production.

## Latest Result

Last verified run:

```text
Passed: 10 / 10
```

Latest parallel load-test run:

```text
Mode: local-simulator-parallel
Passed: 10 / 10
Anomalies: 0
```

The current harness specifically verifies:

- Single-option sizes such as `Box` are carried into the order flow.
- Quantity edits before and after confirmation are applied.
- Cancel-after-confirmation removes the last added cart line.
- One-message single-size orders such as `sourdough biscuits box, 5 boxes` preserve the requested quantity.
- Mixed-language size phrases such as `big fully blended` resolve correctly.
- Friday availability questions list exact Friday products.
- Unavailable item requests are rejected without being counted as hallucinated products.
- Conflicting allergy instructions remove the affected cart item instead of leaving an impossible order.
- Delivery and special-instruction messages are acknowledged instead of being misread as menu requests.
