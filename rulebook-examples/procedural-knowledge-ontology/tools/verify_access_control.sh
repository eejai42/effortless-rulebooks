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
S=tok("user-elena-garcia","principal-process-steward")
checks=[]
def chk(name,cond,detail=""):
    checks.append((name,bool(cond),detail))

s,me=call("/api/me",A);          chk("analyst /api/me",           s==200 and not me["isAdministrator"], f"{len(me.get('tables',[]))} tables")
s,adm=call("/api/me",S);         chk("admin /api/me is admin",    s==200 and adm["isAdministrator"], f"{len(adm.get('tables',[]))} tables")
chk("admin reaches more tables", len(adm["tables"])>len(me["tables"]), f"{len(adm['tables'])} > {len(me['tables'])}")

s,ag=call("/api/my/agents",A)
orgs=sorted({r["organization"] for r in ag["rows"]})
chk("tenancy cut on agents",     orgs==["acme-finance"], f"orgs={orgs} rows={ag['count']}")
chk("column cut: contact_address absent", "contact_address" not in (ag["rows"][0] if ag["rows"] else {}))

s,cr=call("/api/my/change_requests",A)
ids=[r["change_request_id"] for r in cr["rows"]]
chk("inference cut on change_requests", ids==["cr-policy-delivery"], f"ids={ids}")

s,_=call("/api/my/issued_tokens",A);         chk("out-of-schema table refused", s==404)
s,_=call("/api/admin/access/model",A);       chk("admin API refused to analyst", s==403)
s,m=call("/api/admin/access/model",S);       chk("admin API serves admin", s==200 and int(m["live"]["policies"])>0, f"live={m.get('live')}")
s,_=call("/api/me");                          chk("no token refused", s==401)

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
