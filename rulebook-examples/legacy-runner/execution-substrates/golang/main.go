// ERB SDK - Go Test Runner (GENERATED - DO NOT EDIT)
// =======================================================
// This file is REGENERATED every time inject-into-golang.py runs.
// It must stay in sync with erb_sdk.go and the rulebook.
//
// Tables with computed fields: Customers
//
// IMPORTANT: This runner processes ALL tables, not just a "primary" one.
// If ANY table fails to process, the entire run fails with exit code 1.

package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	_, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "FATAL: Failed to get working directory: %v\n", err)
		os.Exit(1)
	}

	// ERB_TESTING_DIR is required — defaulting to the repo testing dir
	// silently uses the wrong domain.
	erbTesting := os.Getenv("ERB_TESTING_DIR")
	if erbTesting == "" {
		fmt.Fprintln(os.Stderr, "FATAL: ERB_TESTING_DIR is not set. main.go must be")
		fmt.Fprintln(os.Stderr, "  invoked by the orchestrator with ERB_TESTING_DIR pointing")
		fmt.Fprintln(os.Stderr, "  at the active domain's testing/ directory.")
		os.Exit(1)
	}
	blankTestsDir := filepath.Join(erbTesting, "blank-tests")
	testAnswersDir := filepath.Join(erbTesting, "golang", "test-answers")

	// Ensure output directory exists
	if err := os.MkdirAll(testAnswersDir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "FATAL: Failed to create test-answers directory: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Golang substrate: Processing 1 tables with calculated fields...")
	fmt.Println("  Expected tables: Customers")
	fmt.Println("")

	// Track success/failure for ALL tables
	var errors []string
	var totalRecords int

	// ─────────────────────────────────────────────────────────────────
	// Process Customers
	// ─────────────────────────────────────────────────────────────────
	fmt.Println("Processing Customers...")
	customersInput := filepath.Join(blankTestsDir, "customers.json")
	customersOutput := filepath.Join(testAnswersDir, "customers.json")

	customersRecords, err := LoadCustomerRecords(customersInput)
	if err != nil {
		errMsg := fmt.Sprintf("Customers: failed to load - %v", err)
		fmt.Fprintf(os.Stderr, "ERROR: %s\n", errMsg)
		errors = append(errors, errMsg)
	} else {
		var computedCustomer []Customer
		for _, r := range customersRecords {
			computedCustomer = append(computedCustomer, *r.ComputeAll())
		}

		if err := SaveCustomerRecords(customersOutput, computedCustomer); err != nil {
			errMsg := fmt.Sprintf("Customers: failed to save - %v", err)
			fmt.Fprintf(os.Stderr, "ERROR: %s\n", errMsg)
			errors = append(errors, errMsg)
		} else {
			fmt.Printf("  ✓ customers: %d records processed\n", len(computedCustomer))
			totalRecords += len(computedCustomer)
		}
	}
	fmt.Println("")

	// ─────────────────────────────────────────────────────────────────
	// Final validation - FAIL LOUDLY if any errors occurred
	// ─────────────────────────────────────────────────────────────────
	if len(errors) > 0 {
		fmt.Fprintf(os.Stderr, "\n")
		fmt.Fprintf(os.Stderr, "════════════════════════════════════════════════════════════════\n")
		fmt.Fprintf(os.Stderr, "FATAL: %d table(s) FAILED to process\n", len(errors))
		fmt.Fprintf(os.Stderr, "════════════════════════════════════════════════════════════════\n")
		for _, e := range errors {
			fmt.Fprintf(os.Stderr, "  • %s\n", e)
		}
		fmt.Fprintf(os.Stderr, "\n")
		os.Exit(1)
	}

	fmt.Println("════════════════════════════════════════════════════════════════")
	fmt.Printf("Golang substrate: ALL %d tables processed successfully (%d total records)\n", 1, totalRecords)
	fmt.Println("════════════════════════════════════════════════════════════════")
}