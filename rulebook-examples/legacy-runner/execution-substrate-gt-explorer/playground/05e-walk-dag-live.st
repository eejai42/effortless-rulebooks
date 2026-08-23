"05e-walk-dag-live.st

 Generalize 05d from one function to the whole derivation DAG.

 For every entity with calc fields, for every record in that entity's
 `data`, this snippet:

   1. Strips stored calc values from the record (proves Python
      recomputes from raw inputs, not from the stored oracle).
   2. Shells out to python3 with a script that monkey-patches every
      `calc_<entity>_<field>` function in erb_calc to trace its args
      and result, then calls `compute_<entity>_fields(record)`.
   3. Compares each calc field's live-computed value against the
      rulebook's stored value (the Airtable oracle).
   4. Returns { summary: {total, passed, failed}, rows: [...] }.

 What you see in the GT inspector:

   - summary: pass/fail counts across the whole rulebook
   - rows: one dict per (entity, record), each containing
       - calcFields: { field, rulebookSays, pythonSays, match } per field
       - trace:      raw DAG trace — every calc_* call's args + result,
                     in the order Python made them
       - computed:   the full record Python returned (all fields)

 Zero edits to erb_calc.py — the monkey-patching lives inside the
 ephemeral python3 subprocess.

 Note: ACME's rulebook has one calc field. With a bigger rulebook
 (level-2 calcs that depend on level-1 calcs), the `trace` will show
 the DAG evaluating bottom-up — that's when this snippet earns its
 keep vs. 05d."

| repoRoot pythonDir rulebook ignored pyScript rows summary total passed |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
pythonDir := repoRoot , '/execution-substrates/python'.

rulebook := STONJSON fromString:
    (repoRoot , '/effortless-rulebook/effortless-rulebook.json') asFileReference contents.

"Python walker. argv layout:
   [1]=pythonDir  [2]=entityPascal  [3]=recordJson  [4]=calcFieldNamesJson
 Monkey-patches every calc_<entity_snake>_* to record args+result in a
 dict, runs compute_<entity_snake>_fields, emits one JSON blob with the
 full computed record, the DAG trace, and a PascalCase -> value map for
 just the calc fields (so Smalltalk doesn't need snake_case conversion)."
pyScript := 'import sys, json, re
sys.path.insert(0, sys.argv[1])
import erb_calc

def to_snake(s):
    return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()

entity_pascal = sys.argv[2]
entity_snake  = to_snake(entity_pascal)
record_in     = {to_snake(k): v for k, v in json.loads(sys.argv[3]).items()}
calc_fields   = json.loads(sys.argv[4])

trace = {}
prefix = f"calc_{entity_snake}_"
for attr in list(dir(erb_calc)):
    if attr.startswith(prefix):
        original = getattr(erb_calc, attr)
        def wrap(name, fn):
            def w(*args):
                r = fn(*args)
                trace.setdefault(name, []).append({"args": list(args), "result": r})
                return r
            return w
        setattr(erb_calc, attr, wrap(attr, original))

compute = getattr(erb_calc, f"compute_{entity_snake}_fields")
computed = compute(record_in)

calc_result = {pname: computed.get(to_snake(pname)) for pname in calc_fields}

print(json.dumps({
    "computed": computed,
    "trace": trace,
    "calcResult": calc_result
}, default=str), end="")'.

ignored := #('$schema' 'Name' 'Description' '_meta').
rows := OrderedCollection new.

(rulebook keys reject: [ :k | ignored includes: k ]) do: [ :entityName |
    | entityDict schema data calcFieldNames |
    entityDict := rulebook at: entityName.
    schema := entityDict at: 'schema' ifAbsent: [ #() ].
    data := entityDict at: 'data' ifAbsent: [ #() ].
    calcFieldNames := (schema
        select: [ :f | f includesKey: 'formula' ])
        collect: [ :f | f at: 'name' ].

    calcFieldNames isEmpty ifFalse: [
        data do: [ :record |
            | rawOnly proc out walkJson perField |

            "Strip stored calc values — force Python to recompute."
            rawOnly := record copy.
            calcFieldNames do: [ :cn | rawOnly removeKey: cn ifAbsent: [] ].

            proc := GtSubprocessWithInMemoryOutput new
                command: '/usr/bin/env';
                arguments: {
                    'python3'.
                    '-c'. pyScript.
                    pythonDir.
                    entityName.
                    (STONJSON toString: rawOnly).
                    (STONJSON toString: calcFieldNames asArray) };
                runAndWait;
                yourself.

            proc exitCode = 0
                ifFalse: [
                    rows add: {
                        #entity -> entityName.
                        #recordId -> (record at: 'Name' ifAbsent: [ '?' ]).
                        #error -> proc stderr.
                        #exitCode -> proc exitCode
                    } asDictionary ]
                ifTrue: [
                    walkJson := STONJSON fromString: proc stdout.
                    out := walkJson at: 'calcResult'.
                    perField := calcFieldNames collect: [ :fname |
                        | stored pythonValue |
                        stored := record at: fname ifAbsent: [ nil ].
                        pythonValue := out at: fname ifAbsent: [ nil ].
                        {
                            #field -> fname.
                            #rulebookSays -> stored.
                            #pythonSays -> pythonValue.
                            #match -> (stored = pythonValue)
                        } asDictionary ].
                    rows add: {
                        #entity -> entityName.
                        #recordId -> (record at: 'Name' ifAbsent: [ '?' ]).
                        #allMatch -> (perField allSatisfy: [ :r | r at: #match ]).
                        #calcFields -> perField.
                        #trace -> (walkJson at: 'trace').
                        #computed -> (walkJson at: 'computed')
                    } asDictionary ] ] ] ].

total := (rows inject: 0 into: [ :acc :r |
    acc + ((r at: #calcFields ifAbsent: [ #() ]) size) ]).
passed := (rows inject: 0 into: [ :acc :r |
    acc + ((r at: #calcFields ifAbsent: [ #() ])
        inject: 0 into: [ :a :c | a + ((c at: #match) ifTrue: [ 1 ] ifFalse: [ 0 ]) ]) ]).

summary := {
    #total -> total.
    #passed -> passed.
    #failed -> (total - passed).   "parens required: ->, - are both binary, left-to-right"
    #entities -> ((rows collect: [ :r | r at: #entity ifAbsent: [ nil ] ]) asSet size).
    #records -> rows size
} asDictionary.

{ #summary -> summary. #rows -> rows } asDictionary
