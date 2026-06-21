# Multi-Token Bonds

- Native bonds remain supported through payable registration.
- Admins can allowlist ERC20 tokens for bonded registration.
- Token balances use `agent_bond_token_of` plus `pending_balance_token_of`.
- `claim_token(token)` follows the same pull-withdrawal idea as native `claim()`.
