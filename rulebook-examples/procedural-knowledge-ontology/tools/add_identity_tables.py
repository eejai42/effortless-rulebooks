#!/usr/bin/env python3
"""Add the identity layer: AppUsers + PrincipalAssignments + IssuedTokens.

Magic-links is a notary: it asserts only that a bearer controls an email.
Everything about WHO that is, and WHAT they may act as, lives here in the
consuming app's rulebook -- per the magic-links doctrine.

Targeted insertion; only adds its own keys.
"""
import json, os, sys

RB = "effortless-rulebook/procedural-knowledge-ontology-rulebook.json"
IRI = "urn:effortless:pko-extension#"

def f(name, dt, typ, nullable=True, desc="", formula=None, related=None):
    d = {"name": name, "datatype": dt, "type": typ, "nullable": nullable, "Description": desc}
    if formula: d["formula"] = formula
    if related: d["RelatedTo"] = related
    return d

T = {}

T["AppUsers"] = {
 "Description": "Sign-in identities. One row per person or automation that can authenticate. EmailAddress is what a verified token asserts; everything else about the caller is resolved from here inside the database, never trusted from the token.",
 "important": True,
 "schema": [
   f("AppUserId","string","raw",False,"Stored logical identifier, e.g. 'user-maria-chen'."),
   f("Name","string","calculated",True,"Human-readable calculated display alias.","={{DisplayName}}"),
   f("EmailAddress","string","raw",True,"Verified email. The one claim magic-links vouches for, and the join key from a token back to this row."),
   f("DisplayName","string","raw",True,"Name shown in the console."),
   f("LinkedAgent","string","relationship",True,"Domain agent this sign-in identity corresponds to.","Agents"),
   f("IsEnabled","boolean","raw",True,"False disables sign-in without deleting the identity or its history."),
   f("AgentKind","string","lookup",True,"Whether the linked agent is Human, AIAgent or AutomatedPipeline.","=INDEX(Agents!{{AgentKind}}, MATCH({{LinkedAgent}}, Agents!{{AgentId}}, 0))"),
   f("Organization","string","lookup",True,"Organization inherited from the linked agent; the tenancy claim baked into issued tokens.","=INDEX(Agents!{{Organization}}, MATCH({{LinkedAgent}}, Agents!{{AgentId}}, 0))"),
   f("AssignmentCount","number","aggregation",True,"Number of principals this user may act as.","=COUNTIFS(PrincipalAssignments!{{AppUser}}, {{AppUserId}})"),
   f("HasNoPrincipal","boolean","calculated",True,"True when the user may act as no principal at all, so a successfully verified token still grants nothing. Authentication without authorization.","={{AssignmentCount}} = 0"),
   f("HoldsMultiplePrincipals","boolean","calculated",True,"True when the user may act as more than one principal, so the principal cannot be inferred from the email alone and must be chosen explicitly at sign-in.","={{AssignmentCount}} > 1"),
   f("IsNonHumanSignIn","boolean","calculated",True,"True when a non-human agent has a sign-in identity. Pipelines and AI agents authenticate too, and their tokens are scoped exactly like a person's.","=OR({{AgentKind}} = \"AIAgent\", {{AgentKind}} = \"AutomatedPipeline\")"),
   f("SemanticTypeIri","string","raw",True,"Semantic type IRI.")
 ], "data": []}

T["PrincipalAssignments"] = {
 "Description": "Which principals a user may act as. The authorization half of sign-in: a verified email proves who you are, this table decides what you may become. A user with two assignments picks one at sign-in, and the choice is verified here rather than accepted from the client.",
 "important": True,
 "schema": [
   f("PrincipalAssignmentId","string","raw",False,"Stored logical identifier, e.g. 'pa-maria-finance-analyst'."),
   f("Name","string","calculated",True,"Human-readable calculated display alias.","={{AppUser}} & \" as \" & {{Principal}}"),
   f("AppUser","string","relationship",True,"Sign-in identity being granted.","AppUsers"),
   f("Principal","string","relationship",True,"Principal the user may act as.","AccessPrincipals"),
   f("IsDefault","boolean","raw",True,"True for the principal selected when the user does not name one."),
   f("GrantedRationale","string","raw",True,"Why this user may act as this principal."),
   f("PrincipalIsAdmin","boolean","lookup",True,"Whether the assigned principal is an administrator.","=INDEX(AccessPrincipals!{{IsAdministrator}}, MATCH({{Principal}}, AccessPrincipals!{{AccessPrincipalId}}, 0))"),
   f("UserOrganization","string","lookup",True,"Organization of the signing-in user.","=INDEX(AppUsers!{{Organization}}, MATCH({{AppUser}}, AppUsers!{{AppUserId}}, 0))"),
   f("PrincipalOrganization","string","lookup",True,"Organization of the principal being assumed.","=INDEX(AccessPrincipals!{{OrganizationScope}}, MATCH({{Principal}}, AccessPrincipals!{{AccessPrincipalId}}, 0))"),
   f("IsCrossOrganizationGrant","boolean","calculated",True,"True when a user is allowed to act as a principal in a different organization. Legitimate for shared-service roles, but it crosses the tenancy boundary and should be deliberate rather than accidental.","=AND({{UserOrganization}} <> \"\", {{PrincipalOrganization}} <> \"\", {{UserOrganization}} <> {{PrincipalOrganization}})"),
   f("SemanticTypeIri","string","raw",True,"Semantic type IRI.")
 ], "data": []}

T["IssuedTokens"] = {
 "Description": "Audit trail of every token minted. A token records which user signed in, which principal they chose, and the claims that were joined from the database at mint time -- so a later question of 'what could this session see' is answerable from data rather than reconstruction.",
 "important": True,
 "schema": [
   f("IssuedTokenId","string","raw",False,"Stored logical identifier for one mint event."),
   f("Name","string","calculated",True,"Human-readable calculated display alias.","={{AppUser}} & \" as \" & {{Principal}} & \" @ \" & {{IssuedAt}}"),
   f("AppUser","string","relationship",True,"Identity that signed in.","AppUsers"),
   f("Principal","string","relationship",True,"Principal the token authorises.","AccessPrincipals"),
   f("IssuedAt","datetime","raw",True,"When the token was minted."),
   f("ExpiresAt","datetime","raw",True,"When the token stops being accepted."),
   f("Issuer","string","raw",True,"Who minted it: 'dev-mint' locally, or the magic-links tenant URL in production."),
   f("SubjectClaim","string","raw",True,"The 'sub' claim: the AppUserId the bearer is asserted to be."),
   f("ClaimsSnapshot","string","raw",True,"JSON of the additional claims joined from the database at mint time."),
   f("IsDevMinted","boolean","calculated",True,"True when issued by the local dev minter rather than a real magic-links tenant. Dev tokens are genuine RS256 tokens with a genuine keypair; they simply skip the email round-trip.","={{Issuer}} = \"dev-mint\""),
   f("SemanticTypeIri","string","raw",True,"Semantic type IRI.")
 ], "data": []}

rb = json.load(open(RB))
dup = [k for k in T if k in rb]
if dup: sys.exit(f"FATAL: already present: {dup}")
for k, v in T.items(): rb[k] = v
tmp = RB + ".tmp"
json.dump(rb, open(tmp, "w"), indent=1, ensure_ascii=False)
os.replace(tmp, RB)
print("added:", ", ".join(T))
print("tables now:", len([k for k in rb if isinstance(rb[k], dict) and "schema" in rb[k]]))
