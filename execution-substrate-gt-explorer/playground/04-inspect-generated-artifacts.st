"04-inspect-generated-artifacts.st

 Gather every substrate's `test-answers/customers.json` into one dictionary,
 keyed by substrate name. Drill into a key to see that substrate's output;
 flip between keys to diff peers by eye.

 Tip: replace the final expression with `substratesDir` to browse the
 folder tree instead of the answers map."

| repoRoot substratesDir testAnswers |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
substratesDir := (repoRoot , '/execution-substrates') asFileReference.

testAnswers := Dictionary new.
substratesDir directories do: [ :subDir |
    | answersFile |
    answersFile := subDir / 'test-answers' / 'customers.json'.
    answersFile exists ifTrue: [
        testAnswers
            at: subDir basename
            put: (STONJSON fromString: answersFile contents) ] ].

testAnswers
