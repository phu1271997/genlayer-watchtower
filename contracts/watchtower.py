# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class Contract(gl.Contract):
    agents: TreeMap[str, str]
    penalty_pool: u256
    violation_threshold: u256

    def __init__(self):
        self.penalty_pool = u256(0)
        self.violation_threshold = u256(60)

    @gl.public.write
    def register_agent(self, agent_id: str, mandate: str,
                       evidence_url: str, bond: int) -> str:
        if agent_id in self.agents:
            return self.agents[agent_id]
            
        state = {
            "id": agent_id,
            "mandate": mandate,
            "evidence_url": evidence_url,
            "bond_remaining": int(bond),
            "status": "ACTIVE",
            "audits": [],
        }
        blob = json.dumps(state)
        self.agents[agent_id] = blob
        return blob

    @gl.public.write
    def top_up_bond(self, agent_id: str, amount: int) -> str:
        if agent_id not in self.agents:
            return "{}"
        if int(amount) <= 0:
            return self.agents[agent_id]
            
        state = json.loads(self.agents[agent_id])
        if state["status"] == "ACTIVE":
            state["bond_remaining"] = int(state["bond_remaining"]) + int(amount)
        blob = json.dumps(state)
        self.agents[agent_id] = blob
        return blob

    @gl.public.write
    def audit(self, agent_id: str, reporter: str) -> str:
        if agent_id not in self.agents:
            return "{}"
        state = json.loads(self.agents[agent_id])
        if state["status"] == "FROZEN":
            return json.dumps(state)

        mandate = state["mandate"]
        ev_url = state["evidence_url"]

        def leader_fn():
            behavior = ""
            if ev_url:
                behavior = gl.nondet.web.render(ev_url, mode="text")
            task = (
                "Ban la kiem toan vien giam ho (fiduciary watchdog).\n"
                f"MANDATE cua agent (pham vi duoc phep + nghia vu): {mandate}\n"
                f"HANH VI CONG KHAI GAN DAY cua agent (trich tu web): {behavior[:3000]}\n"
                "Hay danh gia agent co dang hanh dong TRONG pham vi mandate va vi loi ich "
                "cua chu hay khong. Phat hien dau hieu di chech, lam dung quyen, hay gian lan. "
                "severity la muc do nghiem trong 0-100; slash_ratio la % bond nen tich thu 0-100.\n"
                'CHI tra ve JSON dung dinh dang: '
                '{"verdict":"COMPLIANT|WARNING|VIOLATION","severity":0,'
                '"slash_ratio":0,"reasoning":"ly do ngan gon"}'
            )
            return gl.nondet.exec_prompt(task, response_format="json")

        def validator_fn(leader_result) -> bool:
            return isinstance(leader_result, gl.vm.Return)

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        
        try:
            report = json.loads(result) if isinstance(result, str) else result
            if not isinstance(report, dict):
                report = {"verdict": "WARNING", "severity": 0,
                          "slash_ratio": 0, "reasoning": "unparseable"}
        except Exception as e:
            report = {"verdict": "WARNING", "severity": 0,
                      "slash_ratio": 0, "reasoning": f"JSON parse error: {str(e)}"}

        # ===== deterministic =====
        severity = int(report.get("severity", 0))
        slash_ratio = int(report.get("slash_ratio", 0))
        verdict = report.get("verdict", "WARNING")
        slashed = 0
        if severity >= int(self.violation_threshold):
            state["status"] = "FROZEN"
            remaining = int(state["bond_remaining"])
            slashed = remaining * slash_ratio // 100
            state["bond_remaining"] = remaining - slashed
            self.penalty_pool = u256(int(self.penalty_pool) + slashed)

        state["audits"].append({
            "reporter": reporter,
            "verdict": verdict,
            "severity": severity,
            "slashed": slashed,
            "reasoning": report.get("reasoning", ""),
        })
        blob = json.dumps(state)
        self.agents[agent_id] = blob
        return blob

    @gl.public.view
    def get_agent(self, agent_id: str) -> str:
        if agent_id not in self.agents:
            return "{}"
        return self.agents[agent_id]

    @gl.public.view
    def get_penalty_pool(self) -> int:
        return int(self.penalty_pool)
