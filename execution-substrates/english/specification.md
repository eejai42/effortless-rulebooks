# ACME, LLC Rulebook Specification

## Overview
This rulebook outlines the structure and computation of customer data for ACME, LLC. It includes raw input fields and derived fields that are calculated based on those inputs. The primary focus is on the customer ledger, which contains essential contact information and calculated identifiers for each customer.

## Customers Entity

### Input Fields
The following are the raw input fields for the Customers entity:

1. **CustomerId**
   - **Type:** String
   - **Description:** A unique identifier for the customer.

2. **EmailAddress**
   - **Type:** String
   - **Description:** The customer's email address.

3. **FirstName**
   - **Type:** String
   - **Description:** The first name of the customer, used to create the full name.

4. **LastName**
   - **Type:** String
   - **Description:** The last name of the customer, used to create the full name.

### Derived Fields

1. **Name**
   - **Type:** Calculated
   - **Computation:** The `Name` is derived from the `EmailAddress` by replacing the "@" character with a "-". 
   - **Original Formula:** `=SUBSTITUTE({{EmailAddress}}, "@", "-")`
   - **Example:** For a customer with `EmailAddress` of `bob@gmail.com`, the computation would be:
     - `Name = SUBSTITUTE("bob@gmail.com", "@", "-")` results in `bob-gmail.com`.

2. **FullName**
   - **Type:** Calculated
   - **Computation:** The `FullName` is created by concatenating the `FirstName` and `LastName` with a space in between.
   - **Original Formula:** `={{FirstName}} & " " & {{LastName}}`
   - **Example:** For a customer with `FirstName` of "Bobby" and `LastName` of "Smith", the computation would be:
     - `FullName = "Bobby" & " " & "Smith"` results in `Bobby Smith`.

### Summary of Computation
- The `Name` field is a transformation of the `EmailAddress`, specifically changing the "@" symbol to a hyphen.
- The `FullName` field is a straightforward concatenation of the `FirstName` and `LastName` fields, separated by a space.

By following the above specifications, one can accurately compute the `Name` and `FullName` for each customer in the ACME, LLC customer ledger based on the provided raw input fields.