"05b-fullname-python-source.st

 The Python substrate's emitted function for FullName: read erb_calc.py,
 slice out `calc_customers_full_name` with its docstring and body.
 This is the `codegen` layer — what `inject-into-python.py` produced from
 the spec above. Inspect It; view as Text to read it comfortably."

| repoRoot erbCalcPath source start stop |
repoRoot := '/Users/eejai42/effortlessapi-app-root/users/user_ee42ai73-18a9-47d5-8f99-954b00f6c041/my-projects/effortlessly-invariant-rulesbooks'.
erbCalcPath := repoRoot , '/execution-substrates/python/erb_calc.py'.
source := erbCalcPath asFileReference contents.

start := source indexOfSubCollection: 'def calc_customers_full_name'.
stop  := source indexOfSubCollection: 'def compute_customers_fields' startingAt: start.

source copyFrom: start to: stop - 1
