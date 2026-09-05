#!/usr/bin/env python3
"""
Rulebook to Golang Generator

Reads the canonical rulebook JSON and generates Golang structs
with calculation methods.

Usage:
    python rulebook-to-golang.py

Input:  effortless-rulebook/effortless-rulebook.json
Output: golang/pkg/rulebook/ package with generated code
"""

import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional
import re

# Add parent directory to path to import generators
sys.path.insert(0, str(Path(__file__).parent.parent))

from generators.parser import RulebookParser, Table, Field
from generators.translator import FormulaTranslator, Language


class GolangGenerator:
    """Generates Golang code from rulebook"""

    def __init__(self, rulebook_path: str, output_dir: str):
        self.parser = RulebookParser(rulebook_path)
        self.translator = FormulaTranslator(Language.GOLANG)
        self.output_dir = Path(output_dir)
        self.timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')

    def generate(self):
        """Generate all Golang code"""
        print(f"Generating Golang code from {self.parser.model_name}...")

        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Generate files
        self._generate_go_mod()
        self._generate_models()
        self._generate_data()
        self._generate_utils()

        print(f"✓ Generated Golang package at {self.output_dir}")

    def _generate_go_mod(self):
        """Generate go.mod file"""
        # Go up one level from pkg/rulebook to project root
        go_mod_path = self.output_dir.parent.parent / 'go.mod'
        code = f'''module github.com/yourorg/fractal-analysis

go 1.21
'''
        with open(go_mod_path, 'w') as f:
            f.write(code)
        print(f"  Generated {go_mod_path}")

    def _generate_models(self):
        """Generate models.go with all table structs"""
        code_parts = [
            self._file_header("Data Models"),
            "package rulebook",
            "",
            "import (",
            '    "math"',
            ")",
            ""
        ]

        # Generate struct for each table
        for table_name in self.parser.get_table_names():
            table = self.parser.get_table(table_name)
            code_parts.append(self._generate_table_struct(table))

        self._write_file('models.go', '\n\n'.join(code_parts))

    def _generate_table_struct(self, table: Table) -> str:
        """Generate a struct for a table"""
        struct_name = self._to_struct_name(table.name)
        raw_fields = table.get_raw_fields()
        calc_fields = table.get_calculated_fields()

        parts = []

        # Struct comment
        parts.append(f'// {struct_name} represents {table.description}')
        parts.append(f'type {struct_name} struct {{')

        # Raw fields
        for f in raw_fields:
            go_type = self._get_golang_type(f)
            field_name = self._to_pascal_case(f.name)
            json_tag = self._to_snake_case(f.name)
            parts.append(f'    {field_name} {go_type} `json:"{json_tag}"`')

        # Cached calculated fields (private)
        for f in calc_fields:
            go_type = self._get_golang_type(f)
            field_name = f'cached{self._to_pascal_case(f.name)}'
            parts.append(f'    {field_name} *{go_type}')

        parts.append('}')
        parts.append('')

        # Calculation methods
        calc_order = table.get_calculation_order()
        for f in calc_order:
            method = self._generate_calculation_method(f, table, struct_name)
            parts.append(method)
            parts.append('')

        return '\n'.join(parts)

    def _generate_calculation_method(self, f: Field, table: Table, struct_name: str) -> str:
        """Generate a calculation method for a field"""
        method_name = f'Calculate{self._to_pascal_case(f.name)}'
        cached_field = f'cached{self._to_pascal_case(f.name)}'
        return_type = self._get_golang_type(f)

        # Determine required parameters
        params = []
        if f.field_type == 'lookup':
            related_table = self._find_related_table(f, table)
            if related_table:
                related_struct = self._to_struct_name(related_table)
                params.append(f'{related_table}Dict map[string]*{related_struct}')
        elif f.field_type == 'aggregation':
            child_table = self._find_child_table(f)
            if child_table:
                child_struct = self._to_struct_name(child_table)
                params.append(f'{child_table} []*{child_struct}')

        param_str = ', '.join(params)

        # Generate method
        receiver = struct_name[0].lower()
        body_lines = [
            f'// {method_name} calculates {f.description}',
            f'// Formula: {f.formula}',
            f'func ({receiver} *{struct_name}) {method_name}({param_str}) {return_type} {{',
            f'    if {receiver}.{cached_field} == nil {{',
        ]

        # Translate formula with context
        calculated_field_names = {cf.name for cf in table.get_calculated_fields()}
        all_calculated_fields = {}
        for tname in self.parser.get_table_names():
            t = self.parser.get_table(tname)
            all_calculated_fields[tname] = {cf.name for cf in t.get_calculated_fields()}

        context = {
            'table_name': table.name,
            'is_calculated_field': f.field_type in ['calculated', 'aggregation'],
            'calculated_fields': calculated_field_names,
            'all_calculated_fields': all_calculated_fields,
            'receiver': receiver
        }

        try:
            translated = self.translator.translate(f.formula, context)
            body_lines.append(f'        result := {translated}')
            body_lines.append(f'        {receiver}.{cached_field} = &result')
        except Exception as e:
            body_lines.append(f'        // Error translating formula: {e}')
            body_lines.append(f'        var zero {return_type}')
            body_lines.append(f'        {receiver}.{cached_field} = &zero')

        body_lines.append(f'    }}')
        body_lines.append(f'    return *{receiver}.{cached_field}')
        body_lines.append(f'}}')

        return '\n'.join(body_lines)

    def _generate_data(self):
        """Generate data.go with sample data loader"""
        code_parts = [
            self._file_header("Sample Data"),
            "package rulebook",
            "",
            "",
            "// LoadSampleData loads sample data from rulebook",
            "func LoadSampleData() map[string]interface{} {",
            "    data := make(map[string]interface{})"
        ]

        for table_name in self.parser.get_table_names():
            table = self.parser.get_table(table_name)
            struct_name = self._to_struct_name(table.name)

            code_parts.append(f"")
            code_parts.append(f"    // {table.description}")
            code_parts.append(f"    data[\"{table_name}\"] = []*{struct_name}{{")

            for row in table.data:
                raw_fields = {f.name: row.get(f.name) for f in table.get_raw_fields() if f.name in row}

                field_strs = []
                for key, value in raw_fields.items():
                    pascal_key = self._to_pascal_case(key)
                    if value is None:
                        continue
                    elif isinstance(value, str):
                        field_strs.append(f'{pascal_key}: "{value}"')
                    elif isinstance(value, bool):
                        field_strs.append(f'{pascal_key}: {str(value).lower()}')
                    else:
                        field_strs.append(f'{pascal_key}: {value}')

                code_parts.append(f"        &{struct_name}{{{', '.join(field_strs)}}},")

            code_parts.append("    },")

        code_parts.append("")
        code_parts.append("    return data")
        code_parts.append("}")

        self._write_file('data.go', '\n'.join(code_parts))

    def _generate_utils(self):
        """Generate utils.go with helper functions"""
        code_parts = [
            self._file_header("Utility Functions"),
            "package rulebook",
            "",
            "import \"math\"",
            "",
            "",
            "// BuildSystemsDict builds a map of systems keyed by SystemID",
            "func BuildSystemsDict(systems []*System) map[string]*System {",
            "    dict := make(map[string]*System)",
            "    for _, s := range systems {",
            "        dict[s.SystemID] = s",
            "    }",
            "    return dict",
            "}",
            ""
        ]

        # Generate calculate functions for each table
        for table_name in self.parser.get_table_names():
            table = self.parser.get_table(table_name)
            class_name = self._to_struct_name(table.name)

            calc_fields = table.get_calculated_fields()
            if not calc_fields:
                continue

            # Determine parameters
            needs_systems_dict = any(self._find_related_table(f, table) == 'systems' for f in calc_fields)
            needs_scales = any(self._find_child_table(f) == 'scales' for f in calc_fields)

            params = [f"{table_name} []*{class_name}"]
            if needs_systems_dict:
                params.append("systemsDict map[string]*System")
            if needs_scales:
                params.append("scales []*Scale")

            func_name = f"CalculateAll{class_name}s"
            code_parts.append(f"")
            code_parts.append(f"// {func_name} calculates all derived fields for all {table_name}")
            code_parts.append(f"func {func_name}({', '.join(params)}) {{")
            code_parts.append(f"    for _, item := range {table_name} {{")

            # Generate method calls
            calc_order = table.get_calculation_order()
            for f in calc_order:
                method_name = f'Calculate{self._to_pascal_case(f.name)}'

                method_params = []
                if f.field_type == 'lookup' and self._find_related_table(f, table):
                    method_params.append('systemsDict')
                elif f.field_type == 'aggregation' and self._find_child_table(f):
                    method_params.append('scales')

                param_str = f"({', '.join(method_params)})" if method_params else "()"
                code_parts.append(f"        item.{method_name}{param_str}")

            code_parts.append("    }")
            code_parts.append("}")

        # Add validation function
        code_parts.extend([
            "",
            "",
            "// ValidateSystem checks if empirical slope matches theoretical slope",
            "func ValidateSystem(stats *SystemStats, tolerance float64) bool {",
            "    if stats.cachedSlopeError == nil {",
            "        return false",
            "    }",
            "    error := *stats.cachedSlopeError",
            "    return math.Abs(error) < tolerance",
            "}",
            ""
        ])

        self._write_file('utils.go', '\n'.join(code_parts))

    def _file_header(self, title: str) -> str:
        """Generate file header comment"""
        return f'''//
// {title}
//
// Auto-generated from rulebook
// Model: {self.parser.model_name}
// Generated: {self.timestamp}
//
// DO NOT EDIT THIS FILE MANUALLY
// Regenerate by running: python rulebook-to-golang.py
//'''

    def _to_struct_name(self, table_name: str) -> str:
        """Convert table name to Golang struct name"""
        if table_name == 'systems':
            return 'System'
        elif table_name == 'scales':
            return 'Scale'
        elif table_name == 'system_stats':
            return 'SystemStats'
        return self._to_pascal_case(table_name)

    def _to_pascal_case(self, name: str) -> str:
        """Convert to PascalCase"""
        return self.translator._to_pascal_case(name)

    def _to_snake_case(self, name: str) -> str:
        """Convert to snake_case"""
        return self.translator._to_snake_case(name)

    def _get_golang_type(self, field: Field) -> str:
        """Get Golang type for a field"""
        type_map = {
            'string': 'string',
            'number': 'float64',
            'decimal': 'float64',
            'integer': 'int',
        }
        return type_map.get(field.datatype, 'string')

    def _find_related_table(self, field: Field, table: Table) -> Optional[str]:
        """Find which table this lookup field relates to"""
        if not field.formula:
            return None

        # Extract from INDEX formula
        match = re.search(r'INDEX\s*\(\s*(\w+)!', field.formula, re.IGNORECASE)
        if match:
            return match.group(1)

        # Check relationship fields
        for f in table.fields:
            if f.field_type == 'relationship':
                if re.search(rf'\{{\{{{f.name}\}}\}}', field.formula):
                    return f.related_to

        return None

    def _find_child_table(self, field: Field) -> Optional[str]:
        """Find which table this aggregation operates on"""
        if not field.formula:
            return None

        match = re.search(r'(COUNTIF|MINIFS|MAXIFS)\((\w+)!', field.formula, re.IGNORECASE)
        if match:
            return match.group(2)
        return None

    def _write_file(self, filename: str, content: str):
        """Write content to a file"""
        filepath = self.output_dir / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  Generated {filepath}")


def main():
    """Main entry point"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    rulebook_path = project_root / 'effortless-rulebook' / 'effortless-rulebook.json'
    output_dir = script_dir / 'pkg' / 'rulebook'

    if not rulebook_path.exists():
        print(f"Error: Rulebook not found at {rulebook_path}")
        sys.exit(1)

    generator = GolangGenerator(str(rulebook_path), str(output_dir))
    generator.generate()

    print("\n✓ Golang code generation complete!")
    print(f"\nUsage:")
    print(f"  import \"github.com/yourorg/fractal-analysis/pkg/rulebook\"")
    print(f"  data := rulebook.LoadSampleData()")


if __name__ == '__main__':
    main()
