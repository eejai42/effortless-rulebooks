"03-find-calc-fields.st

 Pull every calculated field across the rulebook into one collection,
 tagged with its owning entity and formula. Inspect It to skim formulas;
 click a row to drill into the full field definition."

| repoRoot rulebook ignored calcFields |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
rulebook := STONJSON fromString:
    (repoRoot , '/effortless-rulebook/effortless-rulebook.json') asFileReference contents.

ignored := #('$schema' 'Name' 'Description' '_meta').
calcFields := OrderedCollection new.

(rulebook keys reject: [ :k | ignored includes: k ]) do: [ :entityName |
    | schema |
    schema := (rulebook at: entityName) at: 'schema' ifAbsent: [ #() ].
    schema do: [ :fld |
        (fld includesKey: 'formula') ifTrue: [
            calcFields add: {
                #entity -> entityName.
                #field -> (fld at: 'name').
                #datatype -> (fld at: 'datatype' ifAbsent: [ nil ]).
                #formula -> (fld at: 'formula').
                #raw -> fld
            } asDictionary ] ] ].

calcFields
