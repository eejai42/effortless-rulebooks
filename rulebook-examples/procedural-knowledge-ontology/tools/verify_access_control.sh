#!/usr/bin/env bash
# Prove the access-control layer enforces, end to end, through the HTTP API.
#
# This is the acceptance test for the whole feature. It signs in as a real
# principal, reads through that principal's own schema, and asserts each of
# the three cuts independently -- plus the negative cases, because a layer
# that never refuses anything is not access control.
set -uo pipefail
BASE="${PKO_BASE:-http://localhost:8099}"
pass=0; fail=0
ok(){ printf '  \033[32mok\033[0m   %s\n' "$1"; pass=$((pass+1)); }
no(){ printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=$((fail+1)); }

echo "== access control acceptance =="
python3 - "$BASE" <<'PY'
import json,sys,urllib.request as u
B=sys.argv[1]
def call(p,tok=None,data=None):
    r=u.Request(B+p, method="POST" if data is not None else "GET")
    if tok: r.add_header("Authorization","Bearer "+tok)
    body=None
    if data is not None:
        r.add_header("Content-Type","application/json"); body=json.dumps(data).encode()
    try:
        with u.urlopen(r,body) as resp: return resp.status, json.load(resp)
    except u.HTTPError as e:
        try: return e.code, json.load(e)
        except Exception: return e.code, {}

def tok(uid,pid):
    s,b=call("/api/auth/sign-in",data={"appUserId":uid,"principalId":pid})
    assert s==200, f"sign-in failed: {s} {b}"
    return b["token"]

A=tok("user-maria-chen","principal-finance-analyst")
C=tok("user-devon-okafor","principal-controller")
F=tok("user-priya-raman","principal-cfo")
K=tok("user-close-pipeline","principal-close-automation")
S=tok("user-elena-garcia","principal-process-steward")
checks=[]
def chk(name,cond,detail=""):
    checks.append((name,bool(cond),detail))

def me(t):
    s,b=call("/api/me",t); assert s==200, b; return b

mA,mC,mF,mK,mS = me(A),me(C),me(F),me(K),me(S)

# --- the cut is per-JOB, not two tiers ---------------------------------------
sizes={"analyst":len(mA["tables"]),"controller":len(mC["tables"]),
       "cfo":len(mF["tables"]),"close-automation":len(mK["tables"]),
       "steward":len(mS["tables"])}
chk("each role differs in reach", len(set([sizes["analyst"],sizes["cfo"],sizes["close-automation"]]))==3, str(sizes))
chk("no operating role exceeds 10 tables",
    max(sizes["analyst"],sizes["controller"],sizes["cfo"],sizes["close-automation"])<=10, str(sizes))
chk("admin reaches far more", sizes["steward"] > 5*sizes["close-automation"],
    f"{sizes['steward']} vs {sizes['close-automation']}")

# --- horizontal cut: tables absent, not empty --------------------------------
s,_=call("/api/my/send_intents",F);      chk("cfo cannot reach send_intents", s==404)
s,_=call("/api/my/step_executions",F);   chk("cfo cannot reach step_executions", s==404)
s,_=call("/api/my/recipients",K);        chk("pipeline cannot reach recipients", s==404)
s,_=call("/api/my/change_requests",K);   chk("pipeline cannot reach change_requests", s==404)

# --- field cut ---------------------------------------------------------------
s,st=call("/api/my/steps",K)
cols=set(st["rows"][0]) if st.get("rows") else set()
chk("pipeline steps view is narrow", 0 < len(cols) <= 12, f"{len(cols)} cols")
chk("no stewardship diagnostics leaked",
    not (cols & {"unwarranted_boundary_count","stale_binding_count",
                 "undeclared_control_version_key"}), f"{len(cols)} cols")

# --- vertical cut still enforcing -------------------------------------------
s,cr=call("/api/my/change_requests",C)
ids=[r["change_request_id"] for r in cr.get("rows",[])]
chk("inference cut on change_requests", ids==["cr-policy-delivery"], f"ids={ids}")
s,pv=call("/api/my/procedure_versions",A)
vids=sorted(r["procedure_version_id"] for r in pv.get("rows",[]))
chk("superseded versions hidden", "close-v1.0.0" not in vids, f"{vids}")

# --- register is scoped ------------------------------------------------------
s,reg=call("/api/register",F)
chk("register scoped to principal", s==200 and set(reg)==set(mF["tables"]),
    f"{len(reg)} tables")

# --- tabs computed from grants ----------------------------------------------
chk("tabs differ per role", mF["tabs"]!=mK["tabs"], f"cfo={mF['tabs']} pipeline={mK['tabs']}")
chk("every principal has >=1 screen", all(len(x["tabs"])>0 for x in (mA,mC,mF,mK,mS)))

# --- negatives ---------------------------------------------------------------
s,_=call("/api/admin/access/model",A);   chk("admin API refused to analyst", s==403)
s,m=call("/api/admin/access/model",S);   chk("admin API serves admin", s==200)
s,_=call("/api/me");                      chk("no token refused", s==401)
try:
    tok("user-maria-chen","principal-cfo"); chk("unassigned principal refused", False, "MINTED!")
except AssertionError:
    chk("unassigned principal refused", True)

bad=0
for n,c,d in checks:
    print(("  ok   " if c else "  FAIL ")+n+(f"   [{d}]" if d else ""))
    bad += 0 if c else 1
print(f"\n{len(checks)-bad}/{len(checks)} passed")
sys.exit(1 if bad else 0)
PY
rc=$?
echo
if [ $rc -eq 0 ]; then echo "ACCESS CONTROL: enforcing"; else echo "ACCESS CONTROL: NOT ENFORCING"; fi
exit $rc
