#!/usr/bin/env python3
"""Seed AppUsers + PrincipalAssignments from the real Agents/Roles mapping."""
import json, os, subprocess
RB="effortless-rulebook/procedural-knowledge-ontology-rulebook.json"
IRI="urn:effortless:pko-extension#"
DB=os.environ.get("DATABASE_URL","postgresql://postgres@localhost:5432/erb_procedural_knowledge_ontology")

def q(sql):
    r=subprocess.run(["psql",DB,"-tAF\x1f","-c",sql],capture_output=True,text=True)
    if r.returncode: raise SystemExit(r.stderr)
    return [l.split("\x1f") for l in r.stdout.strip().split("\n") if l]

agents={a[0]:{"kind":a[1],"email":a[2],"org":a[3]} for a in
        q("select agent_id,agent_kind,contact_address,organization from vw_agents")}
roleholders=q("select role_id,current_agent from vw_roles where current_agent is not null")

rb=json.load(open(RB))
principals={p["DomainRole"]:p["AccessPrincipalId"] for p in rb["AccessPrincipals"]["data"]}

# one AppUser per agent that holds at least one role
holders={}
for rid,agent in roleholders:
    holders.setdefault(agent,[]).append(rid)

users,assigns=[],[]
for agent,rids in sorted(holders.items()):
    a=agents[agent]
    email=a["email"] or f"{agent}@pipelines.internal"   # non-humans get a service address
    users.append({
        "AppUserId":f"user-{agent}",
        "EmailAddress":email,
        "DisplayName":agent.replace("-"," ").title(),
        "LinkedAgent":agent,
        "IsEnabled":True,
        "SemanticTypeIri":IRI+"AppUser",
    })
    for i,rid in enumerate(sorted(rids)):
        pid=principals.get(rid)
        if not pid: raise SystemExit(f"FATAL: no principal for role {rid}")
        assigns.append({
            "PrincipalAssignmentId":f"pa-{agent}-{rid}",
            "AppUser":f"user-{agent}",
            "Principal":pid,
            "IsDefault":i==0,
            "GrantedRationale":f"{agent} currently holds the {rid} role in the domain model, so may act as its principal.",
            "SemanticTypeIri":IRI+"PrincipalAssignment",
        })

rb2=json.load(open(RB))   # re-read: contended file
for t,rows in (("AppUsers",users),("PrincipalAssignments",assigns),("IssuedTokens",[])):
    if rb2[t]["data"]: raise SystemExit(f"FATAL: {t} already seeded")
    rb2[t]["data"]=rows
tmp=RB+".tmp"; json.dump(rb2,open(tmp,"w"),indent=1,ensure_ascii=False); os.replace(tmp,RB)

multi=[u["AppUserId"] for u in users if sum(1 for a in assigns if a["AppUser"]==u["AppUserId"])>1]
print(f"AppUsers {len(users)}, PrincipalAssignments {len(assigns)}")
print("users holding >1 principal:",multi)
nonhuman=[u["AppUserId"] for u in users if not agents[u["LinkedAgent"]]["email"]]
print("non-human sign-ins:",nonhuman)
