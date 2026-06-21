# Reporter Rewards

- Default reward rate: `1000` bps (10%)
- On a successful slash:
  - reporter reward = `slashed * reporter_reward_bps / 10000`
  - remainder stays in `penalty_pool`
- Rewards are credited to `pending_balance_of[reporter]`
- Appeals that overturn a ruling reduce the reporter’s accounting total and increment `reporter_overturned_count_of`

## Leaderboard Score

```text
score = reporter_total_rewarded - (reporter_overturned_count * 100)
```

This keeps the board simple while still penalizing inaccurate slash reports.
