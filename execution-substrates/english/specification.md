# Specification Document for DEMO: Customer FullName Rulebook

## Overview
This rulebook outlines the schema and calculations for generating customer full names from individual first and last names. It is derived from an Airtable base named 'DEMO: Customer FullName'. The primary focus is on how to compute the `FullName` field based on the provided `FirstName` and `LastName` fields.

## Customers Table

### Input Fields
The following input fields are defined in the Customers table, which are necessary for calculating the `FullName`:

1. **CustomerId**
   - **Type**: String
   - **Description**: A unique identifier for each customer. This field is mandatory.

2. **Customer**
   - **Type**: String
   - **Description**: An identifier for the customers. This field is optional.

3. **EmailAddress**
   - **Type**: String
   - **Description**: The customer's email address. This field is optional.

4. **FirstName**
   - **Type**: String
   - **Description**: The first name of the customer, used to create the full name. This field is optional.

5. **LastName**
   - **Type**: String
   - **Description**: The last name of the customer, used to create the full name. This field is optional.

### Calculated Field

#### FullName
- **Type**: Calculated
- **Description**: The full name is computed by concatenating the last name and first name of the customer in the format "LastName, FirstName".

**Calculation Method**:
To compute the `FullName`, follow these steps:
1. Retrieve the value from the `LastName` field.
2. Append a comma followed by a space.
3. Retrieve the value from the `FirstName` field.
4. Concatenate these values to form the full name.

**Formula for Reference**:
```
={{LastName}} & ", " & {{FirstName}}
```

**Concrete Examples**:
1. For the customer with `CustomerId` "cust0001":
   - `LastName`: "Smith"
   - `FirstName`: "Jane"
   - **Computed FullName**: "Smith, Jane"

2. For the customer with `CustomerId` "cust0002":
   - `LastName`: "Doe"
   - `FirstName`: "John"
   - **Computed FullName**: "Doe, John"

3. For the customer with `CustomerId` "cust0003":
   - `LastName`: "Jones"
   - `FirstName`: "Emily"
   - **Computed FullName**: "Jones, Emily"

This specification provides a clear understanding of how to derive the `FullName` from the `FirstName` and `LastName` fields, ensuring that the values can be computed accurately without needing to reference the original formulas.