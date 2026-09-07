"05c-fullname-python-output.st

 The Python substrate's actual computed FullName values for the test
 records. Read from test-answers/customers.json (snake_case keys — Python's
 convention, not the rulebook's). This is the `output` layer, compared at
 conformance time against the Airtable oracle.

 Inspect It; each row is a Dictionary you can drill into. To verify
 against the rulebook formula, mentally concatenate first_name + ' ' +
 last_name per row."

| repoRoot answers projection |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
answers := STONJSON fromString:
    (repoRoot , '/execution-substrates/python/test-answers/customers.json') asFileReference contents.

projection := answers collect: [ :row |
    {
        #customer_id -> (row at: 'customer_id' ifAbsent: [ nil ]).
        #first_name  -> (row at: 'first_name'  ifAbsent: [ nil ]).
        #last_name   -> (row at: 'last_name'   ifAbsent: [ nil ]).
        #full_name   -> (row at: 'full_name'   ifAbsent: [ nil ])
    } asDictionary ].

projection
