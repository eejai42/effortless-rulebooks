"05a-fullname-rulebook-spec.st

 The rulebook's definition of FullName: its formula, datatype, description.
 This is the `spec` layer — what every substrate must agree on.
 Inspect It; you'll see a Dictionary with formula, datatype, nullable, etc."

| repoRoot rulebook fullNameField |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
rulebook := STONJSON fromString:
    (repoRoot , '/effortless-rulebook/effortless-rulebook.json') asFileReference contents.

fullNameField := ((rulebook at: 'Customers') at: 'schema')
    detect: [ :f | (f at: 'name') = 'FullName' ].

fullNameField
