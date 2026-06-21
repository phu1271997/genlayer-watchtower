import json


OWNER = "0x1111111111111111111111111111111111111111"
SUBSCRIBER = "0x2222222222222222222222222222222222222222"


def test_watchlist_crud_and_subscription(deployed_contract):
    module, env, contract = deployed_contract
    env.message.sender_address = module.Address(OWNER)
    created = json.loads(contract.create_watchlist("High Risk Agents"))
    assert created["name"] == "High Risk Agents"

    updated = json.loads(contract.add_to_watchlist(1, "agent-a"))
    assert updated["agents"] == ["agent-a"]
    updated = json.loads(contract.add_to_watchlist(1, "agent-b"))
    assert updated["agents"] == ["agent-a", "agent-b"]

    env.message.sender_address = module.Address(SUBSCRIBER)
    count = contract.subscribe_watchlist(1)
    assert count == 1
    count = contract.unsubscribe_watchlist(1)
    assert count == 0
