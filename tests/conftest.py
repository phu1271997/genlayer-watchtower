import importlib.util
import sys
import types
from pathlib import Path

import pytest


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = REPO_ROOT / "contracts" / "watchtower.py"


class FakeU256(int):
    def __new__(cls, value=0):
        numeric = int(value)
        if numeric < 0:
            raise ValueError("u256 cannot be negative")
        return int.__new__(cls, numeric)


class FakeAddress(str):
    def __new__(cls, value="0x0"):
        return str.__new__(cls, str(value))


class FakeTreeMap(dict):
    @classmethod
    def __class_getitem__(cls, _item):
        return cls


class FakeDecorator:
    def __call__(self, fn):
        return fn

    @property
    def payable(self):
        return self


class FakeMessage:
    def __init__(self):
        self.sender_address = FakeAddress("0xadmin")
        self.value = FakeU256(0)


class FakeNondetWeb:
    def __init__(self, env):
        self.env = env

    def render(self, url, mode="text"):
        self.env.render_calls.append((url, mode))
        return self.env.rendered_pages.get((url, mode), "")


class FakeNondet:
    def __init__(self, env):
        self.env = env
        self.web = FakeNondetWeb(env)

    def exec_prompt(self, prompt, response_format="json"):
        self.env.prompts.append(prompt)
        if not self.env.prompt_outputs:
            raise AssertionError("No prompt outputs queued")
        output = self.env.prompt_outputs.pop(0)
        if callable(output):
            return output(prompt, response_format)
        return output


class FakeVM:
    class UserError(Exception):
        pass

    class Return(str):
        pass

    def __init__(self, env):
        self.env = env

    def run_nondet_unsafe(self, leader_fn, validator_fn):
        leader_result = leader_fn()
        if not validator_fn(leader_result):
            raise self.UserError("semantic validation failed")
        return leader_result


class FakeEqPrinciple:
    def __init__(self, env):
        self.env = env

    def prompt_comparative(self, fn, principle):
        self.env.principles.append(principle)
        if self.env.prompt_comparative_impl is None:
            raise RuntimeError("prompt_comparative unavailable")
        return self.env.prompt_comparative_impl(fn, principle)


class FakePublic:
    def __init__(self):
        self.write = FakeDecorator()
        self.view = FakeDecorator()


class FakeEvm:
    def __init__(self, env):
        self.env = env

    def contract_interface(self, cls):
        env = self.env

        class Wrapped(cls):
            def __init__(self, address):
                self.address = FakeAddress(address)

            def emit_transfer(self, value, on="finalized"):
                env.transfers.append(
                    {"to": str(self.address), "value": int(value), "on": on}
                )

        Wrapped.__name__ = cls.__name__
        return Wrapped


class FakeContractBase:
    pass


class FakeGenLayerEnv:
    def __init__(self):
        self.message = FakeMessage()
        self.rendered_pages = {}
        self.render_calls = []
        self.prompt_outputs = []
        self.prompt_comparative_impl = None
        self.prompts = []
        self.principles = []
        self.transfers = []
        self.current_time = 1_700_000_000

        self.gl = types.SimpleNamespace()
        self.gl.Contract = FakeContractBase
        self.gl.public = FakePublic()
        self.gl.message = self.message
        self.gl.nondet = FakeNondet(self)
        self.gl.vm = FakeVM(self)
        self.gl.eq_principle = FakeEqPrinciple(self)
        self.gl.evm = FakeEvm(self)

    def install(self):
        module = types.ModuleType("genlayer")
        module.gl = self.gl
        module.u256 = FakeU256
        module.Address = FakeAddress
        module.TreeMap = FakeTreeMap
        module.DynArray = list
        module.__all__ = ["gl", "u256", "Address", "TreeMap", "DynArray"]
        sys.modules["genlayer"] = module
        return module


@pytest.fixture
def deployed_contract():
    env = FakeGenLayerEnv()
    env.install()

    module_name = "watchtower_under_test"
    if module_name in sys.modules:
        del sys.modules[module_name]

    spec = importlib.util.spec_from_file_location(module_name, CONTRACT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)

    module.time.time = lambda: env.current_time

    contract_cls = module.Contract
    contract = contract_cls.__new__(contract_cls)
    for field_name, annotation in getattr(contract_cls, "__annotations__", {}).items():
        if annotation is FakeTreeMap:
            setattr(contract, field_name, FakeTreeMap())

    contract_cls.__init__(contract)
    return module, env, contract
