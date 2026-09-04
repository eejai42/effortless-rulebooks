#!/usr/bin/env python3
"""Add the Phase 2 launch contract to the root governing rulebook once."""

from __future__ import annotations

import argparse
import json
import re
from collections import OrderedDict
from pathlib import Path
from typing import Any


NON_HTTP_LAUNCHES = {
    "domain-legacy-runner": {
        "name": "legacy-runner",
        "experience": "Transitional CLI orchestration and optional legacy admin portal",
        "command": "./start.sh",
    },
    "domain-veritasium-power-laws-and-fractals": {
        "name": "veritasium-power-laws-and-fractals",
        "experience": "Interactive multi-substrate power-law and fractal validation lab",
        "command": "./start.sh",
    },
    "domain-naked-claude-vs-effortless-claude": {
        "name": "naked-claude-vs-effortless-claude",
        "experience": "Interactive experiment orchestrator comparing naked and Effortless Claude",
        "command": "./orchestrate.sh",
    },
}

LAUNCH_OVERRIDES = {
    "domain-talismans-special-solutions": {
        "primary": "http://localhost:5173",
        "health": "http://localhost:8088/api/health",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("rulebook", type=Path)
    parser.add_argument("repo_root", type=Path)
    return parser.parse_args()


def read_json(path: Path) -> OrderedDict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        value = json.load(handle, object_pairs_hook=OrderedDict)
    if not isinstance(value, OrderedDict):
        raise SystemExit(f"Expected a JSON object: {path}")
    return value


def field(
    name: str,
    datatype: str,
    field_type: str,
    nullable: bool,
    description: str,
    **extra: Any,
) -> OrderedDict[str, Any]:
    result: OrderedDict[str, Any] = OrderedDict(
        (
            ("name", name),
            ("datatype", datatype),
            ("type", field_type),
            ("nullable", nullable),
            ("Description", description),
        )
    )
    result.update(extra)
    return result


def strip_shell_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def launch_declarations(script: Path) -> dict[str, str | None]:
    raw: dict[str, str] = {}
    for source_line in script.read_text(encoding="utf-8").splitlines():
        line = re.sub(r"^(?:export|readonly)\s+", "", source_line.strip())
        match = re.match(r"^([A-Z][A-Z0-9_]*)=(.*)$", line)
        if not match or "$(" in match.group(2) or "`" in match.group(2):
            continue
        raw.setdefault(match.group(1), match.group(2))

    resolving: set[str] = set()

    def resolve(name: str) -> str:
        if name in resolving:
            raise SystemExit(f"Cyclic shell declaration in {script}: {name}")
        if name not in raw:
            return f"${{{name}}}"
        resolving.add(name)
        value = strip_shell_quotes(raw[name])
        value = re.sub(
            r"\$\{([A-Z][A-Z0-9_]*):-([^}]*)\}",
            lambda match: resolve(match.group(1))
            if match.group(1) in raw and match.group(1) != name
            else match.group(2),
            value,
        )
        value = re.sub(
            r"\$\{([A-Z][A-Z0-9_]*)\}",
            lambda match: resolve(match.group(1)),
            value,
        )
        value = re.sub(
            r"\$([A-Z][A-Z0-9_]*)",
            lambda match: resolve(match.group(1)),
            value,
        )
        resolving.remove(name)
        return value

    result: dict[str, str | None] = {}
    for name in (
        "PROJECT_NAME",
        "EXPERIENCE_DESCRIPTION",
        "START_COMMAND",
        "PRIMARY_URL",
        "HEALTH_URL",
    ):
        value = resolve(name) if name in raw else None
        if value is not None and "$" in value:
            raise SystemExit(f"Unresolved {name} declaration in {script}: {value}")
        result[name] = value
    return result


def schema_launch_profiles() -> list[OrderedDict[str, Any]]:
    return [
        field("ProjectLaunchProfileId", "string", "raw", False, "PK: launch-<domain>."),
        field(
            "Domain",
            "string",
            "relationship",
            False,
            "FK to the governed repository project.",
            RelatedTo="RulebookDomains",
            isReversed=False,
            prefersSingleRecordLink=True,
            InverseField="LaunchProfiles",
        ),
        field("WorkingDirectory", "string", "raw", False, "Exact repository-relative working directory."),
        field("StartCommand", "string", "raw", False, "Exact command a visitor runs from WorkingDirectory."),
        field("ExperienceDescription", "string", "raw", False, "What the launch command starts."),
        field("PrerequisiteNotes", "string", "raw", False, "Explicit setup or dependency requirements."),
        field("ExperienceKind", "string", "raw", False, "web | editor | rulespeak | rulebook | cli."),
        field("IsStartRequired", "boolean", "raw", False, "False only for intentional non-project containers."),
        field("RequiresLocalUrl", "boolean", "raw", False, "Whether this experience must expose a localhost URL."),
        field(
            "Name",
            "string",
            "calculated",
            True,
            "Order 1. Human display alias.",
            formula='=CONCAT({{Domain}}, " launch")',
        ),
        field(
            "LocalServices",
            "string",
            "relationship",
            True,
            "Reverse relationship: localhost services started by this profile.",
            RelatedTo="ProjectLocalServices",
            isReversed=True,
            InverseField="LaunchProfile",
        ),
        field(
            "PrimaryServiceCount",
            "number",
            "aggregation",
            True,
            "Order 1. Number of services marked primary.",
            formula="=SUMIFS(ProjectLocalServices!{{IsPrimaryFlag}}, ProjectLocalServices!{{LaunchProfile}}, ProjectLaunchProfiles!{{ProjectLaunchProfileId}})",
        ),
        field(
            "ServiceCount",
            "number",
            "aggregation",
            True,
            "Order 1. Number of modeled localhost services.",
            formula="=COUNTIFS(ProjectLocalServices!{{LaunchProfile}}, ProjectLaunchProfiles!{{ProjectLaunchProfileId}})",
        ),
        field(
            "HasCompleteInstructions",
            "boolean",
            "calculated",
            True,
            "Order 1. Working directory, command, and experience are explicit.",
            formula='=AND({{WorkingDirectory}} <> "", {{StartCommand}} <> "", {{ExperienceDescription}} <> "")',
        ),
        field(
            "HasPrimaryService",
            "boolean",
            "calculated",
            True,
            "Order 2. Exactly one local service is primary.",
            formula="={{PrimaryServiceCount}} = 1",
        ),
        field(
            "IsLaunchContractComplete",
            "boolean",
            "calculated",
            True,
            "Order 3. Instructions are complete and URL-bearing experiences have one primary service.",
            formula="=AND({{HasCompleteInstructions}}, OR(NOT({{RequiresLocalUrl}}), {{HasPrimaryService}}))",
        ),
    ]


def schema_local_services() -> list[OrderedDict[str, Any]]:
    return [
        field("ProjectLocalServiceId", "string", "raw", False, "PK: <domain>:<service-role>."),
        field(
            "LaunchProfile",
            "string",
            "relationship",
            False,
            "FK to the launch profile that owns this service.",
            RelatedTo="ProjectLaunchProfiles",
            isReversed=False,
            prefersSingleRecordLink=True,
            InverseField="LocalServices",
        ),
        field("ServiceRole", "string", "raw", False, "primary | editor-ui | editor-api."),
        field("LocalUrl", "string", "raw", False, "Explicit localhost URL exposed by the service."),
        field("HealthUrl", "string", "raw", False, "Explicit localhost URL used to confirm reachability."),
        field("SortOrder", "integer", "raw", False, "Display order within the launch profile."),
        field("IsPrimaryFlag", "integer", "raw", False, "1 only for the profile's primary visitor experience."),
        field(
            "Name",
            "string",
            "calculated",
            True,
            "Order 1. Human display alias.",
            formula='=CONCAT({{LaunchProfile}}, " ", {{ServiceRole}})',
        ),
        field(
            "HasHealthUrl",
            "boolean",
            "calculated",
            True,
            "Order 1. A health URL is explicitly modeled.",
            formula='={{HealthUrl}} <> ""',
        ),
        field(
            "IsHttpService",
            "boolean",
            "calculated",
            True,
            "Order 1. The service uses local HTTP.",
            formula='=OR(LEFT({{LocalUrl}}, 7) = "http://", LEFT({{LocalUrl}}, 8) = "https://")',
        ),
        field(
            "IsComplete",
            "boolean",
            "calculated",
            True,
            "Order 1. Both launch and health URLs are explicit.",
            formula='=AND({{LocalUrl}} <> "", {{HealthUrl}} <> "")',
        ),
    ]


def main() -> None:
    args = parse_args()
    rulebook_path = args.rulebook.resolve(strict=True)
    repo_root = args.repo_root.resolve(strict=True)
    expected = repo_root / "effortless-rulebook" / "effortless-rulebook.json"
    if rulebook_path != expected:
        raise SystemExit(f"Expected root governing rulebook: {expected}")

    rulebook = read_json(rulebook_path)
    for table_name in ("ProjectLaunchProfiles", "ProjectLocalServices"):
        if table_name in rulebook:
            raise SystemExit(f"{table_name} already exists; this migration is intentionally one-shot")

    domains = rulebook["RulebookDomains"]["data"]
    profiles: list[OrderedDict[str, Any]] = []
    services: list[OrderedDict[str, Any]] = []

    for domain in domains:
        domain_id = domain["DomainId"]
        relative_path = domain["RelativePath"].rstrip("/") or "."
        script = repo_root / relative_path / "start.sh" if relative_path != "." else repo_root / "start.sh"
        manual = NON_HTTP_LAUNCHES.get(domain_id)
        if manual is not None:
            declared = {
                "PROJECT_NAME": manual["name"],
                "EXPERIENCE_DESCRIPTION": manual["experience"],
                "START_COMMAND": manual["command"],
                "PRIMARY_URL": None,
                "HEALTH_URL": None,
            }
        else:
            if not script.is_file():
                raise SystemExit(f"Missing launch script for modeled project: {script}")
            declared = launch_declarations(script)

        override = LAUNCH_OVERRIDES.get(domain_id, {})
        primary_url = override.get("primary", declared["PRIMARY_URL"])
        health_url = override.get("health", declared["HEALTH_URL"])
        if bool(primary_url) != bool(health_url):
            raise SystemExit(f"Primary/health declaration mismatch for {domain_id}")
        if not declared["PROJECT_NAME"] or not declared["EXPERIENCE_DESCRIPTION"] or not declared["START_COMMAND"]:
            raise SystemExit(f"Incomplete launch declarations for {domain_id}: {declared}")

        if primary_url is None:
            experience_kind = "cli"
        elif "rulespeak" in primary_url:
            experience_kind = "rulespeak"
        elif primary_url.endswith(".json"):
            experience_kind = "rulebook"
        elif domain_id == "domain-traffic-ticket-contest":
            experience_kind = "editor"
        else:
            experience_kind = "web"

        profile_id = f"launch-{domain_id}"
        is_start_required = not domain["IsIntentionalException"]
        requires_local_url = primary_url is not None
        prerequisite_notes = (
            "Docker, Node.js, npm, and the generated editor artifacts are required."
            if domain_id == "domain-root"
            else (
                "Python 3, lsof, and the named authoritative artifact are required."
                if experience_kind in {"rulespeak", "rulebook"}
                else "Run from the named project directory; the launcher reports every missing command, database, or artifact."
            )
        )
        primary_count = 1 if primary_url is not None else 0
        service_count = primary_count
        if domain_id == "domain-root":
            service_count = 3

        profiles.append(
            OrderedDict(
                (
                    ("ProjectLaunchProfileId", profile_id),
                    ("Domain", domain_id),
                    ("WorkingDirectory", relative_path),
                    ("StartCommand", declared["START_COMMAND"]),
                    ("ExperienceDescription", declared["EXPERIENCE_DESCRIPTION"]),
                    ("PrerequisiteNotes", prerequisite_notes),
                    ("ExperienceKind", experience_kind),
                    ("IsStartRequired", is_start_required),
                    ("RequiresLocalUrl", requires_local_url),
                    ("Name", f"{domain_id} launch"),
                    ("PrimaryServiceCount", primary_count),
                    ("ServiceCount", service_count),
                    ("HasCompleteInstructions", True),
                    ("HasPrimaryService", primary_count == 1),
                    ("IsLaunchContractComplete", True),
                )
            )
        )

        if primary_url is not None and health_url is not None:
            services.append(
                OrderedDict(
                    (
                        ("ProjectLocalServiceId", f"{domain_id}:primary"),
                        ("LaunchProfile", profile_id),
                        ("ServiceRole", "primary"),
                        ("LocalUrl", primary_url),
                        ("HealthUrl", health_url),
                        ("SortOrder", 1),
                        ("IsPrimaryFlag", 1),
                        ("Name", f"{profile_id} primary"),
                        ("HasHealthUrl", True),
                        ("IsHttpService", True),
                        ("IsComplete", True),
                    )
                )
            )

        if domain_id == "domain-root":
            services.extend(
                (
                    OrderedDict(
                        (
                            ("ProjectLocalServiceId", "domain-root:editor-ui"),
                            ("LaunchProfile", profile_id),
                            ("ServiceRole", "editor-ui"),
                            ("LocalUrl", "http://localhost:42442"),
                            ("HealthUrl", "http://localhost:42442"),
                            ("SortOrder", 2),
                            ("IsPrimaryFlag", 0),
                            ("Name", f"{profile_id} editor-ui"),
                            ("HasHealthUrl", True),
                            ("IsHttpService", True),
                            ("IsComplete", True),
                        )
                    ),
                    OrderedDict(
                        (
                            ("ProjectLocalServiceId", "domain-root:editor-api"),
                            ("LaunchProfile", profile_id),
                            ("ServiceRole", "editor-api"),
                            ("LocalUrl", "http://localhost:42441/api/docs"),
                            ("HealthUrl", "http://localhost:42441/api/view-health"),
                            ("SortOrder", 3),
                            ("IsPrimaryFlag", 0),
                            ("Name", f"{profile_id} editor-api"),
                            ("HasHealthUrl", True),
                            ("IsHttpService", True),
                            ("IsComplete", True),
                        )
                    ),
                )
            )

    domain_schema = rulebook["RulebookDomains"]["schema"]
    if any(item["name"] == "LaunchProfiles" for item in domain_schema):
        raise SystemExit("RulebookDomains.LaunchProfiles already exists")
    domain_schema.append(
        field(
            "LaunchProfiles",
            "string",
            "relationship",
            True,
            "Reverse relationship: explicit launch instructions for this governed row.",
            RelatedTo="ProjectLaunchProfiles",
            isReversed=True,
            InverseField="Domain",
        )
    )

    launch_profile_table = OrderedDict(
        (
            ("Description", "One explicit launch contract for every governed project or intentional container."),
            ("schema", schema_launch_profiles()),
            ("data", profiles),
        )
    )
    local_service_table = OrderedDict(
        (
            ("Description", "Explicit localhost services and health endpoints owned by project launch profiles."),
            ("schema", schema_local_services()),
            ("data", services),
        )
    )

    rebuilt: OrderedDict[str, Any] = OrderedDict()
    for key, value in rulebook.items():
        rebuilt[key] = value
        if key == "RulebookDomains":
            rebuilt["ProjectLaunchProfiles"] = launch_profile_table
            rebuilt["ProjectLocalServices"] = local_service_table
    rulebook = rebuilt

    kind_field = next(
        item
        for item in rulebook["ProjectLayoutSlots"]["schema"]
        if item["name"] == "Kind"
    )
    kind_field["Description"] = (
        "file | directory | executable | manifest | rulebook | rulebook-table | "
        "readme-final-section | transpiler | init-db | one-of-directories | "
        "start-script-syntax | start-script-restart | start-script-urls | start-script-health."
    )

    metadata = rulebook["ProjectMetadata"]["data"][0]
    metadata["EntryPoint"] = "./start.sh"

    stories = {row["UserStoryId"]: row for row in rulebook["UserStories"]["data"]}
    for story_id in ("us-046", "us-047"):
        stories[story_id]["Status"] = "done"
        stories[story_id]["DevProgressPercent"] = 100
    stories["us-054"] = OrderedDict(
        (
            ("UserStoryId", "us-054"),
            ("ReqId", "US-054"),
            (
                "StoryText",
                "As an explorer, I want launch instructions and localhost health contracts modeled as first-class rulebook rows, so the application never scrapes shell text or invents a URL.",
            ),
            ("BuildPhase", "phase-2"),
            ("Epic", "cat-launch-contract"),
            ("Feature", "feat-launch-links"),
            ("EffortClass", "G2"),
            ("Status", "done"),
            ("DevProgressPercent", 100),
        )
    )
    rulebook["UserStories"]["data"].append(stories["us-054"])

    criteria = {
        row["AcceptanceCriterionId"]: row
        for row in rulebook["AcceptanceCriteria"]["data"]
    }
    for criterion_id in (
        "us-046-ac1",
        "us-046-ac2",
        "us-046-ac3",
        "us-047-ac1",
        "us-047-ac2",
        "us-048-ac1",
    ):
        criteria[criterion_id]["IsMet"] = True
    rulebook["AcceptanceCriteria"]["data"].extend(
        (
            OrderedDict(
                (
                    ("AcceptanceCriterionId", "us-054-ac1"),
                    ("UserStory", "us-054"),
                    ("Criterion", "Every RulebookDomains row has exactly one ProjectLaunchProfiles row."),
                    ("IsMet", True),
                )
            ),
            OrderedDict(
                (
                    ("AcceptanceCriterionId", "us-054-ac2"),
                    ("UserStory", "us-054"),
                    ("Criterion", "Every URL-bearing launch profile has exactly one primary ProjectLocalServices row with an explicit health URL."),
                    ("IsMet", True),
                )
            ),
            OrderedDict(
                (
                    ("AcceptanceCriterionId", "us-054-ac3"),
                    ("UserStory", "us-054"),
                    ("Criterion", "The strict scanner witnesses syntax, restart behavior, URL declarations, and health contracts without probing fallback paths."),
                    ("IsMet", True),
                )
            ),
        )
    )

    cr17 = next(
        row
        for row in rulebook["ConsistencyRules"]["data"]
        if row["ConsistencyRuleId"] == "cr-17"
    )
    cr17["CheckMechanism"] = (
        "ProjectSlotWitnesses records executable start.sh presence plus bash syntax, "
        "declared-port restart behavior, modeled URL declarations, and explicit health contracts."
    )

    with rulebook_path.open("w", encoding="utf-8") as handle:
        json.dump(rulebook, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print(
        f"Added {len(profiles)} launch profiles and {len(services)} local services; "
        "reconciled US-046, US-047, US-048-ac1, and US-054."
    )


if __name__ == "__main__":
    main()
