# RÀNG BUỘC BẤT KHẢ NHƯỢNG — 7 RULES + R13

Đây là các lỗi thực tế đã gặp khi deploy lên GenLayer Studio. Tuân thủ 100% trước khi viết hoặc sửa bất kỳ file `.py` nào. Vi phạm bất kỳ rule nào = contract chết khi deploy.

### 1️⃣ DÒNG ĐẦU TIÊN phải là `# v0.2.16`
```python
# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
```
Thiếu dòng này → Studio fallback về v0.1.0 → lỗi `Contract Queues not found`, `Contract IdlenessPhase not found`, `Contract RevealingPhase not found`.

### 2️⃣ KHÔNG gán `TreeMap()` / `DynArray()` trong `__init__`
```python
# ❌ SAI — gây AssertionError: Is right the same storage type? TreeMap <- TreeMap
def __init__(self):
    self.agents = TreeMap()

# ✅ ĐÚNG — GenVM tự khởi tạo TreeMap/DynArray rỗng
def __init__(self):
    self.penalty_pool = u256(0)
    # các field TreeMap đã là {} sẵn — KHÔNG đụng vào ở đây
```

### 3️⃣ KHÔNG dùng `float` trong chữ ký method public
```python
# ❌ SAI
@gl.public.write
def register(self, bond: float): ...
# ✅ ĐÚNG — dùng int (nhân 100 để biểu diễn cents nếu cần)
@gl.public.write
def register(self, bond: int): ...
```

### 4️⃣ CHỈ được dùng các kiểu sau trong method public
✅ `str`, `bool`, `bytes`, `int`, sized ints (`u8`..`u256`, `i8`..`i256`), `Address`, `DynArray[T]`, `TreeMap[K, V]`
❌ `float`, `list[T]`, `dict[K,V]`, generics chưa instantiate, custom class

### 5️⃣ Storage dùng `TreeMap` / `DynArray`, KHÔNG dùng `dict` / `list`
```python
class Contract(gl.Contract):
    agents: TreeMap[str, str]   # ✅
    logs: DynArray[str]         # ✅
    # agents: dict[str, int]    # ❌
    # logs: list[str]           # ❌
```

### 6️⃣ Class PHẢI tên là `Contract` và kế thừa `gl.Contract`
```python
class Contract(gl.Contract):   # ✅
    ...
# class WatchtowerContract(gl.Contract):  ❌ Studio không tìm thấy entry point
```

### 7️⃣ MỌI lời gọi `gl.nondet.*` PHẢI nằm trong `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)`
```python
# ❌ SAI — gọi trực tiếp trong code deterministic → CRASH
@gl.public.write
def audit(self):
    result = gl.nondet.exec_prompt("...")

# ✅ ĐÚNG
@gl.public.write
def audit(self):
    def leader_fn():
        return gl.nondet.exec_prompt("...", response_format="json")
    def validator_fn(leader_result) -> bool:
        return isinstance(leader_result, gl.vm.Return)
    return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
```

### R13 — CHỈ import bằng `from genlayer import *`
KHÔNG dùng `import genlayer as gl` hay `import genlayer`. GenVM sandbox tự inject object global `gl` đã cấu hình đầy đủ khi gặp `from genlayer import *`. Re-import thủ công sẽ ghi đè và gây `AttributeError: module 'genlayer' has no attribute 'Contract'`.
