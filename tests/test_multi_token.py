import json


class FakeToken:
    def __init__(self):
        self.balances = {}

    def mint(self, owner, amount):
        self.balances[str(owner)] = self.balances.get(str(owner), 0) + amount

    def transfer_from(self, from_address, to_address, amount):
        if self.balances.get(str(from_address), 0) < amount:
            return False
        self.balances[str(from_address)] -= amount
        self.balances[str(to_address)] = self.balances.get(str(to_address), 0) + amount
        return True

    def transfer(self, to_address, amount):
        vault_key = "0x0000000000000000000000000000000000000001"
        if self.balances.get(vault_key, 0) < amount:
            return False
        self.balances[vault_key] -= amount
        self.balances[str(to_address)] = self.balances.get(str(to_address), 0) + amount
        return True

    def balance_of(self, owner):
        return self.balances.get(str(owner), 0)


OWNER = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
TOKEN = "0x00000000000000000000000000000000000000aa"


def test_register_and_claim_token_bond(deployed_contract):
    module, env, contract = deployed_contract
    token = FakeToken()
    token.mint(OWNER, 1_000)
    env.evm_contracts[TOKEN] = token

    env.message.sender_address = module.Address("0xadmin")
    contract.add_supported_token(TOKEN)

    env.message.sender_address = module.Address(OWNER)
    registered = json.loads(
        contract.register_agent_with_token(
            "token-agent",
            "This token agent may only move approved positions and must never send value outside policy controls.",
            "https://example.com/token",
            "OTHER",
            TOKEN,
            500,
        )
    )
    assert registered["bond_token"] == TOKEN
    assert registered["bond_remaining"] == 500

    token_key = contract._token_balance_key(module.Address(TOKEN), module.Address(OWNER))
    contract.pending_balance_token_of[token_key] = module.u256(120)
    claimed = contract.claim_token(TOKEN)
    assert claimed == 120
    assert token.balance_of(OWNER) == 620
