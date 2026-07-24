from pathlib import Path
import ast


ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "contracts" / "watchtower.py"
OUTPUT = ROOT / "docs" / "api" / "watchtower.md"


def annotation_to_text(node):
    if node is None:
        return "None"
    return ast.unparse(node)


def main():
    tree = ast.parse(CONTRACT.read_text())
    methods = []

    for item in tree.body:
        if isinstance(item, ast.ClassDef) and item.name == "Contract":
            for member in item.body:
                if not isinstance(member, ast.FunctionDef):
                    continue
                if member.name.startswith("_"):
                    continue

                decorators = [ast.unparse(d) for d in member.decorator_list]
                if not any(name.startswith("gl.public.") for name in decorators):
                    continue

                args = []
                for arg in member.args.args[1:]:
                    args.append(f"{arg.arg}: {annotation_to_text(arg.annotation)}")

                methods.append(
                    {
                        "name": member.name,
                        "decorators": decorators,
                        "args": args,
                        "returns": annotation_to_text(member.returns),
                    }
                )

    lines = [
        "# Watchtower Contract API",
        "",
        "Generated from `contracts/watchtower.py`.",
        "",
    ]

    for method in methods:
        lines.append(f"## `{method['name']}`")
        lines.append("")
        lines.append(f"- decorators: `{', '.join(method['decorators'])}`")
        lines.append(f"- args: `{', '.join(method['args']) if method['args'] else 'none'}`")
        lines.append(f"- returns: `{method['returns']}`")
        lines.append("")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text("\n".join(lines))


if __name__ == "__main__":
    main()
