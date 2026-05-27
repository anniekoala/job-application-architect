# Finance

This project is the home for personal finance and investment analysis.

## Current Scope

- Track current investment / cash / insurance / equity-compensation status
- Keep the status dashboard factual and easy to audit
- Support future rebalance decisions with separate analysis memos
- Keep private holding data local
- Use online research only for public market information and public analysis frameworks

## Contents

- `investment-dashboard/`: current portfolio status dashboard
- `docs/conversation-summary.md`: summary of the working decisions from the conversation
- `docs/rebalance-framework.md`: decision framework for raising cash and reducing market exposure
- `skills/`: project-level skills and external skill references
- `reports/`: future monthly rebalance / investment memos
- `data-sources/`: notes on statement folders and data import expectations

## Design Boundary

The dashboard is the source of status:

- What assets exist
- Where they sit
- Current value
- Account type
- RSU / ESPP and IUL facts
- Recent performance and personal return where available

Analysis reports are the decision layer:

- What to sell
- What to keep
- What to avoid touching
- What market context matters
- What information is missing before acting

## Privacy Rule

Personal holdings, statements, cost basis, account values, and tax information should stay local.

Online research should use only public market data, public company information, and public frameworks.
