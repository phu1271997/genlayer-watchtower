# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *


class Contract(gl.Contract):
    balances: TreeMap[Address, u256]
    allowances: TreeMap[str, u256]

    @gl.public.write
    def mint(self, to: str, amount: int) -> int:
        recipient = Address(str(to))
        self.balances[recipient] = u256(int(self.balances[recipient]) + amount) if recipient in self.balances else u256(amount)
        return int(self.balances[recipient])

    @gl.public.write
    def approve(self, spender: str, amount: int) -> int:
        key = f"{str(gl.message.sender_address).lower()}|{str(Address(str(spender))).lower()}"
        self.allowances[key] = u256(amount)
        return int(self.allowances[key])

    @gl.public.write
    def transfer(self, to: str, amount: int) -> bool:
        sender = gl.message.sender_address
        recipient = Address(str(to))
        if sender not in self.balances or int(self.balances[sender]) < amount:
            return False
        self.balances[sender] = u256(int(self.balances[sender]) - amount)
        self.balances[recipient] = u256(int(self.balances[recipient]) + amount) if recipient in self.balances else u256(amount)
        return True
