# ACME, LLC Rulebook Specification

## Overview
This rulebook outlines the structure and computation methods for customer data at ACME, LLC. It includes raw input fields and derived fields that are calculated based on these inputs. The primary purpose of this rulebook is to provide a clear understanding of how to derive customer identifiers and names from their raw contact information.

## Customers Entity

### Input Fields
The following fields are classified as raw input fields:

1. **EmailAddress**
   - **Type**: String
   - **Description**: The customer's email address.

2. **FirstName**
   - **Type**: String
   - **Description**: First Name of the customer, used to create the full name.

3. **LastName**
   - **Type**: String
   - **Description**: Last Name of the customer, used to create the full name.

4. **CustomerId**
   - **Type**: String
   - **Description**: Unique identifier for the customer.

### Derived Fields

1. **Name**
   - **Type**: Calculated
   - **Description**: Identifier for the customer.
   - **Computation**: The `Name` is derived from the `EmailAddress` by replacing the "@" symbol with a hyphen ("-"). 
   - **Original Formula**: `=SUBSTITUTE({{EmailAddress}}, "@", "-")`
   - **Example**: For a customer with `EmailAddress` of `bob@gmail.com`, the computed `Name` would be `bob-gmail.com`.

2. **FullName**
   - **Type**: Calculated
   - **Description**: Full name is computed from the first and last name of the customer.
   - **Computation**: The `FullName` is constructed by concatenating the `FirstName` and `LastName` with a space in between.
   - **Original Formula**: `={{FirstName}} & " " & {{LastName}}`
   - **Example**: For a customer with `FirstName` of `Bobby` and `LastName` of `Smith`, the computed `FullName` would be `Bobby Smith`.

### Data Examples
Here are some examples of how the derived fields are computed based on the raw input fields:

- **Customer 1**:
  - **EmailAddress**: `bob@gmail.com`
  - **FirstName**: `Bobby`
  - **LastName**: `Smith`
  - **Computed Fields**:
    - **Name**: `bob-gmail.com` (derived from `bob@gmail.com`)
    - **FullName**: `Bobby Smith` (derived from `Bobby` and `Smith`)

- **Customer 2**:
  - **EmailAddress**: `jimmy@gmail.com`
  - **FirstName**: `Jimmy`
  - **LastName**: `Doe`
  - **Computed Fields**:
    - **Name**: `jimmy-gmail.com` (derived from `jimmy@gmail.com`)
    - **FullName**: `Jimmy Doe` (derived from `Jimmy` and `Doe`)

- **Customer 3**:
  - **EmailAddress**: `mary@gmail.com`
  - **FirstName**: `Mary`
  - **LastName**: `Jones`
  - **Computed Fields**:
    - **Name**: `mary-gmail.com` (derived from `mary@gmail.com`)
    - **FullName**: `Mary Jones` (derived from `Mary` and `Jones`)

This specification provides a comprehensive guide to understanding how to compute the derived fields for each customer in the ACME, LLC database.