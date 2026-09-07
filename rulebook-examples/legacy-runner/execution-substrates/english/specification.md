# ACME, LLC Rulebook Specification

## Overview
This rulebook outlines the structure and computation methods for customer data within ACME, LLC. It defines how to derive calculated fields from raw input data, specifically focusing on customer identifiers such as `Name` and `FullName`. The computations are designed to automatically update whenever the underlying raw data changes.

## Customers Entity

### Input Fields
The following raw input fields are used to derive calculated fields:

1. **EmailAddress**
   - **Type:** String
   - **Description:** The customer's email address.

2. **FirstName**
   - **Type:** String
   - **Description:** First Name of the customer, used to create the full name.

3. **LastName**
   - **Type:** String
   - **Description:** Last Name of the customer, used to create the full name.

### Calculated Fields
The following fields are derived from the input fields:

1. **Name**
   - **Type:** Calculated
   - **Computation:** The `Name` is derived by replacing the "@" character in the `EmailAddress` with a "-". This creates a unique handle for the customer.
   - **Original Formula:** `=SUBSTITUTE({{EmailAddress}}, "@", "-")`
   - **Example:** For a customer with `EmailAddress` of `bob@gmail.com`, the computation would be:
     - `Name = SUBSTITUTE("bob@gmail.com", "@", "-")` results in `bob-gmail.com`.

2. **FullName**
   - **Type:** Calculated
   - **Computation:** The `FullName` is created by concatenating the `FirstName` and `LastName` with a space in between.
   - **Original Formula:** `={{FirstName}} & " " & {{LastName}}`
   - **Example:** For a customer with `FirstName` of `Bobby` and `LastName` of `Smith`, the computation would be:
     - `FullName = "Bobby" & " " & "Smith"` results in `Bobby Smith`.

### Summary of Derived Fields
- **Name:** A unique identifier derived from the customer's email address by replacing "@" with "-".
- **FullName:** A concatenation of the customer's first and last names, providing a complete name representation.

This specification provides a clear understanding of how to compute each derived field for the customers of ACME, LLC, ensuring that any changes to the raw input data will reflect in the calculated fields without the need for additional application code or migrations.