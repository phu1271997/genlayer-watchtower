# Watchtower Demo Script

## 5-Minute Walkthrough

1. Open the Watchtower dashboard and explain the problem:
   - autonomous agents can move money faster than human oversight
   - Watchtower gives owners an on-chain fiduciary watchdog built on GenLayer
2. Show `storage_test.py` deploying successfully in Studio as the baseline sanity check.
3. Deploy `watchtower.py` and register an agent with a real native-value bond.
4. Trigger a compliant audit and show:
   - indexed audit IDs
   - reasoning with a concrete artifact
   - no slash applied
5. Trigger a violation audit and show:
   - status changes to `FROZEN`
   - bond decreases
   - penalty pool increases
6. Use `withdraw_penalty_pool` plus `claim()` to demonstrate pull-based payout safety.
7. Close with the roadmap:
   - richer multi-source consensus
   - appeals and reporter rewards
   - categories, tokens, watchlists, and frontend overhaul
