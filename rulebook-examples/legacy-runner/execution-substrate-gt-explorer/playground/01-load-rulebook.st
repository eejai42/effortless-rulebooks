"01-load-rulebook.st

 Parse effortless-rulebook.json and open it in a live GT inspector.

 Usage:
   1. Paste into a GT Playground (Cmd+O, Cmd+P).
   2. Edit `repoRoot` if your checkout lives elsewhere.
   3. Select all, press Cmd+G (Inspect It).

 The inspector that opens is the primary exploration surface — drill into
 `Customers -> schema -> 0` to see the first field definition."

| repoRoot rulebookPath rulebook |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
rulebookPath := repoRoot , '/effortless-rulebook/effortless-rulebook.json'.
rulebook := STONJSON fromString: rulebookPath asFileReference contents.
rulebook
