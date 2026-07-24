# Watchtower

Watchtower la ung dung GenLayer dong vai tro watchdog uy thac cho cac AI agent tu hanh. Chu so huu dang ky agent voi mandate bang ngon ngu tu nhien va mot khoan bond, sau do cong dong co the kich hoat cac cuoc audit on-chain de so sanh hanh vi cong khai cua agent voi nghia vu duoc giao.

## Diem khac biet

- Doc duoc bang chung web truc tiep bang `gl.nondet.web.render(...)`
- Danh gia su phu hop cua hanh vi bang consensus-backed prompt execution
- Slash / freeze mot cach deterministic sau khi ket luan nondeterministic da duoc rang buoc bang semantic validation

## Moc release hien tai

- `v2.M1`: refactor storage, bond native co gia tri thuc, claim theo pull pattern, hardening prompt
- `v2.M6`: them architecture docs, ADR, test mo rong, CI va API docs sinh tu contract

## Phat trien local

```bash
npm install
npm run dev
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python3 -m pytest tests -q
npm run build
python3 scripts/generate_api_docs.py
```

## Tai lieu quan trong

- [README.md](./README.md): ban tieng Anh cho reviewer quoc te
- [ARCHITECTURE.md](./ARCHITECTURE.md): so do luong va state machine
- [ECONOMICS.md](./ECONOMICS.md): bond, slash, claim, attack cost
- [SECURITY.md](./SECURITY.md): STRIDE va hardening hien tai
- [docs/DEPLOY.md](./docs/DEPLOY.md): quy trinh deploy Studio
