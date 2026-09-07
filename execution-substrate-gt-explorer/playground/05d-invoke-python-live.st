"05d-invoke-python-live.st

 Actually *run* the Python function calc_customers_full_name on each
 customer row in the rulebook, and compare the live result against the
 rulebook's stored FullName. No edits to erb_calc.py — the function is
 imported inside a python3 -c one-liner spawned as a subprocess.

 Closes the loop started by 05a/05b/05c:
   05a = the spec     (formula + datatype, from the rulebook)
   05b = the codegen  (the emitted Python function, as text)
   05c = the answers  (stored precomputed values in test-answers/)
   05d = the proof    (execute 05b now, here, per row, and check)

 Rows where #match is false are the interesting ones.

 Dependencies:
   - python3 on PATH
   - GtSubprocessWithInMemoryOutput (bundled with GT — not stock Pharo)

 Note: this spawns one subprocess per row. Fine for 3 customers;
 if you ever need to run thousands, batch all rows into a single
 python3 invocation instead."

| repoRoot pythonDir rulebook customers pyScript results |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
pythonDir := repoRoot , '/execution-substrates/python'.

rulebook := STONJSON fromString:
    (repoRoot , '/effortless-rulebook/effortless-rulebook.json') asFileReference contents.
customers := (rulebook at: 'Customers') at: 'data'.

"The Python one-liner. Arguments arrive in sys.argv[1..3] as:
   [pythonDir, first_name, last_name]
 end='' suppresses the trailing newline so stdout is directly comparable
 to the rulebook's stored FullName string."
pyScript := 'import sys; sys.path.insert(0, sys.argv[1]); from erb_calc import calc_customers_full_name; print(calc_customers_full_name(sys.argv[2], sys.argv[3]), end="")'.

results := customers collect: [ :row |
    | first last proc computed stored |
    first  := row at: 'FirstName' ifAbsent: [ '' ].
    last   := row at: 'LastName'  ifAbsent: [ '' ].
    stored := row at: 'FullName'  ifAbsent: [ nil ].

    proc := GtSubprocessWithInMemoryOutput new
        command: '/usr/bin/env';
        arguments: { 'python3'. '-c'. pyScript. pythonDir. first. last };
        runAndWait;
        yourself.
    computed := proc stdout.

    {
        #customer     -> (row at: 'CustomerId').
        #inputs       -> (first , ' / ' , last).
        #rulebookSays -> stored.
        #pythonSays   -> computed.
        #match        -> (stored = computed).
        #exitCode     -> proc exitCode.
        #stderr       -> proc stderr
    } asDictionary ].

results
