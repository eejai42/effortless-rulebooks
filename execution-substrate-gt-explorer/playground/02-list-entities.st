"02-list-entities.st

 Summarize the entities defined in the rulebook: name, field count, and a
 breakdown of raw vs. calculated fields. Inspect It on the final expression
 to get a table-ish view you can drill into per row."

| repoRoot rulebook ignored entities |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
rulebook := STONJSON fromString:
    (repoRoot , '/effortless-rulebook/effortless-rulebook.json') asFileReference contents.

"Rulebook top-level contains metadata keys plus one key per entity. Filter out
 the metadata keys so what remains is the entity set."
ignored := #('$schema' 'Name' 'Description' '_meta').

entities := (rulebook keys reject: [ :k | ignored includes: k ]) collect: [ :name |
    | schema countByType |
    schema := (rulebook at: name) at: 'schema' ifAbsent: [ #() ].
    countByType := Dictionary new.
    schema do: [ :fld |
        | t |
        t := fld at: 'type' ifAbsent: [ '(none)' ].
        countByType at: t put: (countByType at: t ifAbsent: [ 0 ]) + 1 ].
    {
        #entity -> name.
        #fieldCount -> schema size.
        #byType -> countByType
    } asDictionary ].

entities
