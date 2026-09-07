"05-rulebook-views.st

 One file, one Inspect-It, all five layers of 05a-05e available as
 moldable GT views on a single object graph.

 Installs three classes in package 'ERB-GT':
   ERBRulebook   - top level, loaded from effortless-rulebook.json
   ERBEntity     - one per entity in the rulebook
   ERBField      - one per field in an entity's schema

 Tabs per class:

   ERBRulebook
     - Entities       table of entities (name, field/calc/row counts)
     - Calc Fields    every calc field across the rulebook + formula
     - Walk DAG       live: run Python against every row in every entity
                      with calc fields, diff vs. the rulebook's stored
                      values   (supersedes 05e)
     - Meta           the _meta block
     - Raw JSON       the underlying Dictionary

   ERBEntity
     - Schema         fields table
     - Calculated     calc fields + formulas
     - Data           data rows, dynamic columns   (supersedes 05c)
     - Walk DAG       live DAG walk scoped to this entity
     - Raw            underlying Dictionary

   ERBField
     - Formula        Excel-style formula text   (supersedes 05a)
     - References     {{Field}} references extracted from formula
     - Python Source  the function sliced out of erb_calc.py
                                                  (supersedes 05b)
     - Python Live    invoke that function against each row of the
                      parent entity, diff vs. rulebook store
                                                  (supersedes 05d)
     - Raw            underlying Dictionary

 Dependencies: python3 on PATH, GtSubprocessWithInMemoryOutput (GT-bundled).
 Re-running the snippet re-compiles the classes in place."

"================ ERBField ================"
Object subclass: #ERBField
    instanceVariableNames: 'raw entity'
    classVariableNames: ''
    package: 'ERB-GT'.

ERBField compile: 'raw ^ raw' classified: 'accessing'.
ERBField compile: 'raw: aDict raw := aDict' classified: 'accessing'.
ERBField compile: 'entity ^ entity' classified: 'accessing'.
ERBField compile: 'entity: anEntity entity := anEntity' classified: 'accessing'.

ERBField compile: 'name
    ^ raw at: ''name'' ifAbsent: [ ''(unnamed)'' ]' classified: 'accessing'.
ERBField compile: 'type
    ^ raw at: ''type'' ifAbsent: [ ''(none)'' ]' classified: 'accessing'.
ERBField compile: 'datatype
    ^ raw at: ''datatype'' ifAbsent: [ nil ]' classified: 'accessing'.
ERBField compile: 'formula
    ^ raw at: ''formula'' ifAbsent: [ nil ]' classified: 'accessing'.
ERBField compile: 'description
    ^ raw at: ''Description'' ifAbsent: [ '''' ]' classified: 'accessing'.
ERBField compile: 'isCalculated
    ^ self formula notNil' classified: 'testing'.

ERBField compile: 'referencedFieldNames
    "Extract {{Field}} references from this field''s formula."
    | f names start open close |
    f := self formula ifNil: [ ^ #() ].
    names := OrderedCollection new.
    start := 1.
    [ start < f size ] whileTrue: [
        open := f indexOf: ${ startingAt: start.
        (open = 0 or: [ open >= f size or: [ (f at: open + 1) ~= ${ ] ])
            ifTrue: [ ^ names asArray ].
        close := f indexOf: $} startingAt: open + 2.
        close = 0 ifTrue: [ ^ names asArray ].
        names add: (f copyFrom: open + 2 to: close - 1).
        start := close + 2 ].
    ^ names asArray' classified: 'inspection'.

ERBField compile: 'pythonFunctionName
    "e.g. FullName on Customers -> calc_customers_full_name"
    ^ ''calc_'' ,
      (ERBRulebook toSnake: self entity name) ,
      ''_'' ,
      (ERBRulebook toSnake: self name)' classified: 'python'.

ERBField compile: 'pythonSource
    "Slice erb_calc.py for this field''s generated function."
    | source fnName start stop |
    self isCalculated ifFalse: [ ^ ''(not a calculated field)'' ].
    source := self entity rulebook erbCalcPath asFileReference contents.
    fnName := self pythonFunctionName.
    start := source indexOfSubCollection: ''def '' , fnName.
    start = 0 ifTrue: [ ^ ''(function '' , fnName , '' not found in erb_calc.py)'' ].
    stop := source indexOfSubCollection: ''def '' startingAt: start + 4.
    stop = 0 ifTrue: [ stop := source size + 1 ].
    ^ source copyFrom: start to: stop - 1' classified: 'python'.

ERBField compile: 'printOn: aStream
    aStream
        nextPutAll: ''field('';
        nextPutAll: self name;
        nextPutAll: '': '';
        nextPutAll: self type;
        nextPutAll: '')''' classified: 'printing'.

ERBField compile: 'gtFormulaFor: aView
    <gtView>
    self isCalculated ifFalse: [ ^ aView empty ].
    ^ aView textEditor
        title: ''Formula'';
        priority: 10;
        text: [ self formula ]' classified: 'gt - views'.

ERBField compile: 'gtReferencesFor: aView
    <gtView>
    self isCalculated ifFalse: [ ^ aView empty ].
    ^ aView list
        title: ''References'';
        priority: 20;
        items: [ self referencedFieldNames ]' classified: 'gt - views'.

ERBField compile: 'gtPythonSourceFor: aView
    <gtView>
    self isCalculated ifFalse: [ ^ aView empty ].
    ^ aView textEditor
        title: ''Python Source'';
        priority: 30;
        text: [ self pythonSource ]' classified: 'gt - views'.

ERBField compile: 'gtPythonLiveFor: aView
    <gtView>
    "Project this field''s column out of the parent entity''s DAG walk."
    self isCalculated ifFalse: [ ^ aView empty ].
    ^ aView columnedList
        title: ''Python Live'';
        priority: 40;
        items: [
            (self entity walkDagLive) collect: [ :row |
                | perField mine |
                perField := row at: #calcFields ifAbsent: [ #() ].
                mine := perField detect: [ :c | (c at: #field) = self name ]
                    ifNone: [ Dictionary new ].
                {
                    #record -> (row at: #recordId ifAbsent: [ ''?'' ]).
                    #rulebookSays -> (mine at: #rulebookSays ifAbsent: [ nil ]).
                    #pythonSays -> (mine at: #pythonSays ifAbsent: [ nil ]).
                    #match -> (mine at: #match ifAbsent: [ false ])
                } asDictionary ] ];
        column: ''Record'' text: [ :r | r at: #record ] width: 180;
        column: ''Rulebook'' text: [ :r | (r at: #rulebookSays) printString ];
        column: ''Python'' text: [ :r | (r at: #pythonSays) printString ];
        column: ''Match'' text: [ :r | (r at: #match) ifTrue: [ ''PASS'' ] ifFalse: [ ''FAIL'' ] ] width: 80' classified: 'gt - views'.

ERBField compile: 'gtRawFor: aView
    <gtView>
    ^ aView forward
        title: ''Raw'';
        priority: 90;
        object: [ raw ];
        view: #gtItemsFor:' classified: 'gt - views'.

"================ ERBEntity ================"
Object subclass: #ERBEntity
    instanceVariableNames: 'name raw rulebook'
    classVariableNames: ''
    package: 'ERB-GT'.

ERBEntity compile: 'name ^ name' classified: 'accessing'.
ERBEntity compile: 'name: aString name := aString' classified: 'accessing'.
ERBEntity compile: 'raw ^ raw' classified: 'accessing'.
ERBEntity compile: 'raw: aDict raw := aDict' classified: 'accessing'.
ERBEntity compile: 'rulebook ^ rulebook' classified: 'accessing'.
ERBEntity compile: 'rulebook: aRulebook rulebook := aRulebook' classified: 'accessing'.

ERBEntity compile: 'description
    ^ raw at: ''Description'' ifAbsent: [ '''' ]' classified: 'accessing'.
ERBEntity compile: 'schemaRaw
    ^ raw at: ''schema'' ifAbsent: [ #() ]' classified: 'accessing'.
ERBEntity compile: 'dataRaw
    ^ raw at: ''data'' ifAbsent: [ #() ]' classified: 'accessing'.
ERBEntity compile: 'fields
    ^ self schemaRaw collect: [ :f |
        ERBField new raw: f; entity: self; yourself ]' classified: 'accessing'.
ERBEntity compile: 'calculatedFields
    ^ self fields select: [ :f | f isCalculated ]' classified: 'accessing'.

ERBEntity compile: 'walkDagLive
    "For each row, run compute_<entity_snake>_fields via subprocess.
     Returns OrderedCollection of per-row dicts: #recordId, #allMatch,
     #calcFields (per-field comparison), #trace (DAG node args+result),
     #computed (full computed record), #entity."
    | calcFieldNames pyScript results |
    calcFieldNames := (self calculatedFields collect: [ :f | f name ]) asArray.
    calcFieldNames isEmpty ifTrue: [ ^ #() ].
    pyScript := ERBRulebook dagWalkerPythonScript.
    results := OrderedCollection new.
    self dataRaw do: [ :record |
        | rawOnly proc walkJson perField |
        rawOnly := record copy.
        calcFieldNames do: [ :cn | rawOnly removeKey: cn ifAbsent: [] ].
        proc := GtSubprocessWithInMemoryOutput new
            command: ''/usr/bin/env'';
            arguments: {
                ''python3''. ''-c''. pyScript.
                rulebook pythonDir.
                name.
                (STONJSON toString: rawOnly).
                (STONJSON toString: calcFieldNames) };
            runAndWait;
            yourself.
        proc exitCode = 0
            ifFalse: [
                results add: {
                    #entity -> name.
                    #recordId -> (record at: ''Name'' ifAbsent: [ ''?'' ]).
                    #error -> proc stderr.
                    #exitCode -> proc exitCode
                } asDictionary ]
            ifTrue: [
                walkJson := STONJSON fromString: proc stdout.
                perField := calcFieldNames collect: [ :fname |
                    | stored pythonValue |
                    stored := record at: fname ifAbsent: [ nil ].
                    pythonValue := (walkJson at: ''calcResult'') at: fname ifAbsent: [ nil ].
                    {
                        #field -> fname.
                        #rulebookSays -> stored.
                        #pythonSays -> pythonValue.
                        #match -> (stored = pythonValue)
                    } asDictionary ].
                results add: {
                    #entity -> name.
                    #recordId -> (record at: ''Name'' ifAbsent: [ ''?'' ]).
                    #allMatch -> (perField allSatisfy: [ :r | r at: #match ]).
                    #calcFields -> perField.
                    #trace -> (walkJson at: ''trace'').
                    #computed -> (walkJson at: ''computed'')
                } asDictionary ] ].
    ^ results' classified: 'live'.

ERBEntity compile: 'printOn: aStream
    aStream
        nextPutAll: ''entity('';
        nextPutAll: name;
        nextPutAll: '', '';
        print: self schemaRaw size;
        nextPutAll: '' fields, '';
        print: self dataRaw size;
        nextPutAll: '' rows)''' classified: 'printing'.

ERBEntity compile: 'gtSchemaFor: aView
    <gtView>
    ^ aView columnedList
        title: ''Schema'';
        priority: 10;
        items: [ self fields ];
        column: ''Name'' text: [ :f | f name ];
        column: ''Type'' text: [ :f | f type ] width: 100;
        column: ''Datatype'' text: [ :f | f datatype ifNil: [ '''' ] ] width: 100;
        column: ''Formula'' text: [ :f | f formula ifNil: [ '''' ] ]' classified: 'gt - views'.

ERBEntity compile: 'gtCalcFieldsFor: aView
    <gtView>
    | calc |
    calc := self calculatedFields.
    calc isEmpty ifTrue: [ ^ aView empty ].
    ^ aView columnedList
        title: ''Calculated'';
        priority: 15;
        items: [ calc ];
        column: ''Field'' text: [ :f | f name ] width: 200;
        column: ''Formula'' text: [ :f | f formula ]' classified: 'gt - views'.

ERBEntity compile: 'gtDataFor: aView
    <gtView>
    "Build a columned list whose columns are the entity''s field names."
    | rows columnNames |
    rows := self dataRaw.
    rows isEmpty ifTrue: [ ^ aView empty ].
    columnNames := self fields collect: [ :f | f name ].
    ^ columnNames inject: (aView columnedList
            title: ''Data'';
            priority: 20;
            items: [ rows ])
        into: [ :builder :col |
            builder column: col text: [ :row |
                (row at: col ifAbsent: [ '''' ]) printString ] ]' classified: 'gt - views'.

ERBEntity compile: 'gtWalkDagFor: aView
    <gtView>
    self calculatedFields isEmpty ifTrue: [ ^ aView empty ].
    ^ aView columnedList
        title: ''Walk DAG'';
        priority: 25;
        items: [ self walkDagLive ];
        column: ''Record'' text: [ :r | r at: #recordId ifAbsent: [ ''?'' ] ] width: 200;
        column: ''Match'' text: [ :r |
            (r at: #allMatch ifAbsent: [ false ])
                ifTrue: [ ''PASS'' ] ifFalse: [ ''FAIL'' ] ] width: 80;
        column: ''Fields'' text: [ :r | (r at: #calcFields ifAbsent: [ #() ]) size ] width: 80' classified: 'gt - views'.

ERBEntity compile: 'gtRawFor: aView
    <gtView>
    ^ aView forward
        title: ''Raw'';
        priority: 90;
        object: [ raw ];
        view: #gtItemsFor:' classified: 'gt - views'.

"================ ERBRulebook ================"
Object subclass: #ERBRulebook
    instanceVariableNames: 'raw path'
    classVariableNames: ''
    package: 'ERB-GT'.

ERBRulebook class compile: 'fromPath: aPathString
    ^ self new
        path: aPathString;
        raw: (STONJSON fromString: aPathString asFileReference contents);
        yourself' classified: 'instance creation'.

ERBRulebook class compile: 'toSnake: aString
    "PascalCase -> snake_case. Shared helper for Python function naming."
    ^ String streamContents: [ :stream |
        1 to: aString size do: [ :i |
            | ch |
            ch := aString at: i.
            (ch isLetter and: [ ch isUppercase and: [ i > 1 ] ])
                ifTrue: [ stream nextPut: $_ ].
            stream nextPut: ch asLowercase ] ]' classified: 'helpers'.

ERBRulebook class compile: 'dagWalkerPythonScript
    "Argv: [1]=pythonDir [2]=entityPascal [3]=recordJson [4]=calcFieldsJson.
     Monkey-patches every calc_<entity_snake>_* in erb_calc to record
     args+result, then invokes compute_<entity_snake>_fields. Emits one
     JSON blob with computed record, full DAG trace, and a PascalCase->value
     map for just the calc fields."
    ^ ''import sys, json, re
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
}, default=str), end="")''' classified: 'python walker'.

ERBRulebook compile: 'raw ^ raw' classified: 'accessing'.
ERBRulebook compile: 'raw: aDict raw := aDict' classified: 'accessing'.
ERBRulebook compile: 'path ^ path' classified: 'accessing'.
ERBRulebook compile: 'path: aString path := aString' classified: 'accessing'.

ERBRulebook compile: 'name
    ^ raw at: ''Name'' ifAbsent: [ ''(unnamed rulebook)'' ]' classified: 'accessing'.
ERBRulebook compile: 'description
    ^ raw at: ''Description'' ifAbsent: [ '''' ]' classified: 'accessing'.
ERBRulebook compile: 'meta
    ^ raw at: ''_meta'' ifAbsent: [ Dictionary new ]' classified: 'accessing'.

ERBRulebook compile: 'repoRoot
    "Derived from the rulebook JSON path:
       .../REPO/effortless-rulebook/effortless-rulebook.json -> .../REPO"
    ^ path asFileReference parent parent fullName' classified: 'paths'.
ERBRulebook compile: 'pythonDir
    ^ self repoRoot , ''/execution-substrates/python''' classified: 'paths'.
ERBRulebook compile: 'erbCalcPath
    ^ self pythonDir , ''/erb_calc.py''' classified: 'paths'.

ERBRulebook compile: 'entityNames
    | ignored |
    ignored := #(''$schema'' ''Name'' ''Description'' ''_meta'').
    ^ (raw keys reject: [ :k | ignored includes: k ]) asArray' classified: 'accessing'.

ERBRulebook compile: 'entities
    ^ self entityNames collect: [ :n |
        ERBEntity new
            name: n;
            raw: (raw at: n);
            rulebook: self;
            yourself ]' classified: 'accessing'.

ERBRulebook compile: 'entityNamed: aString
    ^ self entities detect: [ :e | e name = aString ]' classified: 'accessing'.

ERBRulebook compile: 'allCalculatedFields
    ^ self entities flatCollect: [ :e | e calculatedFields ]' classified: 'accessing'.

ERBRulebook compile: 'walkDagLive
    "Walk every entity''s DAG. Each row dict is tagged with #entity."
    ^ self entities flatCollect: [ :e | e walkDagLive ]' classified: 'live'.

ERBRulebook compile: 'printOn: aStream
    aStream
        nextPutAll: ''rulebook('';
        nextPutAll: self name;
        nextPutAll: '', '';
        print: self entityNames size;
        nextPutAll: '' entities)''' classified: 'printing'.

ERBRulebook compile: 'gtEntitiesFor: aView
    <gtView>
    ^ aView columnedList
        title: ''Entities'';
        priority: 10;
        items: [ self entities ];
        column: ''Name'' text: [ :e | e name ];
        column: ''Fields'' text: [ :e | e schemaRaw size ] width: 80;
        column: ''Calc'' text: [ :e | e calculatedFields size ] width: 60;
        column: ''Rows'' text: [ :e | e dataRaw size ] width: 80' classified: 'gt - views'.

ERBRulebook compile: 'gtCalcFieldsFor: aView
    <gtView>
    ^ aView columnedList
        title: ''Calc Fields'';
        priority: 20;
        items: [ self allCalculatedFields ];
        column: ''Entity'' text: [ :f | f entity name ] width: 160;
        column: ''Field'' text: [ :f | f name ] width: 200;
        column: ''Formula'' text: [ :f | f formula ]' classified: 'gt - views'.

ERBRulebook compile: 'gtWalkDagFor: aView
    <gtView>
    ^ aView columnedList
        title: ''Walk DAG'';
        priority: 30;
        items: [ self walkDagLive ];
        column: ''Entity'' text: [ :r | r at: #entity ifAbsent: [ ''?'' ] ] width: 160;
        column: ''Record'' text: [ :r | r at: #recordId ifAbsent: [ ''?'' ] ] width: 180;
        column: ''Match'' text: [ :r |
            (r at: #allMatch ifAbsent: [ false ])
                ifTrue: [ ''PASS'' ] ifFalse: [ ''FAIL'' ] ] width: 80;
        column: ''Fields'' text: [ :r | (r at: #calcFields ifAbsent: [ #() ]) size ] width: 80' classified: 'gt - views'.

ERBRulebook compile: 'gtMetaFor: aView
    <gtView>
    ^ aView forward
        title: ''Meta'';
        priority: 50;
        object: [ self meta ];
        view: #gtItemsFor:' classified: 'gt - views'.

ERBRulebook compile: 'gtRawFor: aView
    <gtView>
    ^ aView forward
        title: ''Raw JSON'';
        priority: 90;
        object: [ raw ];
        view: #gtItemsFor:' classified: 'gt - views'.

"================ Load & return ================"
| repoRoot rulebookPath |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
rulebookPath := repoRoot , '/effortless-rulebook/effortless-rulebook.json'.
ERBRulebook fromPath: rulebookPath
