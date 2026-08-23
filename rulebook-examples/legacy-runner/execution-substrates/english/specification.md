# ACME, LLC Rulebook Specification Document

## Overview
This document outlines the specifications for the ACME, LLC rulebook, which is generated from an Airtable base. It details the structure of the data, including input fields and derived fields, along with the methods for computing each calculated field. The rulebook consists of three main entities: Customers, ERBVersions, and ERBCustomizations.

---

## Entity: Customers

### Input Fields
1. **CustomerId**
   - **Type:** String
   - **Description:** Unique identifier for the customer. This field is mandatory.

2. **EmailAddress**
   - **Type:** String
   - **Description:** The customer's email address. This field is optional.

3. **FirstName**
   - **Type:** String
   - **Description:** The first name of the customer. This field is optional.

4. **LastName**
   - **Type:** String
   - **Description:** The last name of the customer. This field is optional.

### Derived Fields
1. **Name**
   - **Type:** Calculated
   - **Description:** This field serves as an identifier for the customers.
   - **Computation:** The Name is derived by replacing the "@" symbol in the EmailAddress with a hyphen ("-"). 
   - **Original Formula:** `=SUBSTITUTE({{EmailAddress}}, "@", "-")`
   - **Example:** For the customer with EmailAddress `jane.smith@email.com`, the Name would be `jane.smith-email.com`.

2. **FullName**
   - **Type:** Calculated
   - **Description:** The full name is computed from the first and last names of the customer.
   - **Computation:** The FullName is constructed by concatenating the LastName and FirstName with a comma and space in between.
   - **Original Formula:** `={{LastName}} & ", " & {{FirstName}}`
   - **Example:** For a customer with LastName `Smith` and FirstName `Bobby`, the FullName would be `Smith, Bobby`.

---

## Entity: ERBVersions

### Input Fields
1. **ERBVersionId**
   - **Type:** String
   - **Description:** Unique identifier for the ERB version. This field is mandatory.

2. **BaseId**
   - **Type:** String
   - **Description:** Identifier for the base. This field is optional.

3. **Name**
   - **Type:** String
   - **Description:** Name of the ERB version. This field is optional.

4. **Message**
   - **Type:** String
   - **Description:** Message associated with the ERB version. This field is optional.

5. **Notes**
   - **Type:** String
   - **Description:** Additional notes related to the ERB version. This field is optional.

6. **CommitDate**
   - **Type:** Datetime
   - **Description:** The date and time when the ERB version was committed. This field is optional.

7. **IsPublished**
   - **Type:** Boolean
   - **Description:** Indicates whether the ERB version is published. This field is optional.

### Derived Fields
- **No derived fields are defined for the ERBVersions entity.**

---

## Entity: ERBCustomizations

### Input Fields
1. **ERBCustomizationId**
   - **Type:** String
   - **Description:** Unique identifier for the ERB customization. This field is mandatory.

2. **Name**
   - **Type:** String
   - **Description:** Name of the ERB customization. This field is optional.

3. **Title**
   - **Type:** String
   - **Description:** Title of the ERB customization. This field is optional.

4. **SQLCode**
   - **Type:** String
   - **Description:** SQL code associated with the customization. This field is optional.

5. **SQLTarget**
   - **Type:** String
   - **Description:** Target database for the SQL code. This field is optional.

6. **CustomizationType**
   - **Type:** String
   - **Description:** Type of customization (e.g., Schema, Functions, Views, RLS, Data). This field is optional.

### Derived Fields
- **No derived fields are defined for the ERBCustomizations entity.**

---

## Conclusion
This specification document provides a comprehensive overview of the ACME, LLC rulebook's structure, detailing both input and derived fields for each entity. The methods for computing derived fields are clearly explained, allowing for accurate value computation without needing to reference the original formulas.