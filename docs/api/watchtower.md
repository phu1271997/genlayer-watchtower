# Watchtower Contract API

Generated from `contracts/watchtower.py`.

## `register_agent`

- decorators: `gl.public.write.payable`
- args: `agent_id: str, mandate: str, evidence_url: str, bond: int, agent_wallet_address: str, github_repo: str, social_url: str`
- returns: `str`

## `top_up_bond`

- decorators: `gl.public.write.payable`
- args: `agent_id: str, amount: int`
- returns: `str`

## `set_min_audit_interval_seconds`

- decorators: `gl.public.write`
- args: `value: int`
- returns: `int`

## `set_probation_length_seconds`

- decorators: `gl.public.write`
- args: `value: int`
- returns: `int`

## `set_reporter_reward_bps`

- decorators: `gl.public.write`
- args: `value: int`
- returns: `int`

## `withdraw_penalty_pool`

- decorators: `gl.public.write`
- args: `to: None, amount: int`
- returns: `int`

## `withdraw_remaining_bond`

- decorators: `gl.public.write`
- args: `agent_id: str`
- returns: `int`

## `claim`

- decorators: `gl.public.write`
- args: `none`
- returns: `int`

## `try_promote_from_probation`

- decorators: `gl.public.write`
- args: `agent_id: str`
- returns: `str`

## `file_appeal`

- decorators: `gl.public.write.payable`
- args: `agent_id: str, argument: str`
- returns: `str`

## `evaluate_appeal`

- decorators: `gl.public.write`
- args: `appeal_id: int`
- returns: `str`

## `audit`

- decorators: `gl.public.write`
- args: `agent_id: str, reporter: str`
- returns: `str`

## `get_agent`

- decorators: `gl.public.view`
- args: `agent_id: str`
- returns: `str`

## `get_audit`

- decorators: `gl.public.view`
- args: `audit_id: int`
- returns: `str`

## `get_full_audit`

- decorators: `gl.public.view`
- args: `audit_id: int`
- returns: `str`

## `get_appeal`

- decorators: `gl.public.view`
- args: `appeal_id: int`
- returns: `str`

## `list_audits_of_agent`

- decorators: `gl.public.view`
- args: `agent_id: str, start: int, limit: int`
- returns: `str`

## `get_penalty_pool`

- decorators: `gl.public.view`
- args: `none`
- returns: `int`

## `get_pending_balance`

- decorators: `gl.public.view`
- args: `owner: None`
- returns: `int`

## `get_reporter_stats`

- decorators: `gl.public.view`
- args: `owner: None`
- returns: `str`

## `get_top_reporters`

- decorators: `gl.public.view`
- args: `limit: int`
- returns: `str`
