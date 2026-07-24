import json


def test_template_storage_and_category_catalog(deployed_contract):
    module, env, contract = deployed_contract
    env.message.sender_address = module.Address("0xadmin")
    stored = contract.set_mandate_template("TOOLING", "Tooling template")
    assert stored == "Tooling template"

    categories = json.loads(contract.get_categories())
    tooling = next(item for item in categories if item["category"] == "TOOLING")
    assert tooling["template"] == "Tooling template"
    assert tooling["rubric"]
