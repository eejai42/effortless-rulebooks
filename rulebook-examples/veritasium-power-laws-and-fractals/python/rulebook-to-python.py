#!/usr/bin/env python3
"""
Rulebook to Python Generator

Reads the canonical rulebook JSON and generates Python dataclasses
with calculation methods.

Usage:
    python rulebook-to-python.py

Input:  effortless-rulebook/effortless-rulebook.json
Output: python/rulebook/ package with generated code
"""

import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

# Add parent directory to path to import generators
sys.path.insert(0, str(Path(__file__).parent.parent))

from generators.parser import RulebookParser, Table, Field
from generators.translator import FormulaTranslator, Language


class PythonGenerator:
    """Generates Python code from rulebook"""

    def __init__(self, rulebook_path: str, output_dir: str):
        self.parser = RulebookParser(rulebook_path)
        self.translator = FormulaTranslator(Language.PYTHON)
        self.output_dir = Path(output_dir)
        self.timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')

    def generate(self):
        """Generate all Python code"""
        print(f"Generating Python code from {self.parser.model_name}...")

        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Generate files
        self._generate_init()
        self._generate_models()
        self._generate_data()
        self._generate_utils()

        print(f"✓ Generated Python package at {self.output_dir}")

    def _generate_init(self):
        """Generate __init__.py"""
        # Build list of class names
        class_names = [self._to_class_name(name) for name in self.parser.get_table_names()]

        # Build list of calculate functions
        calc_funcs = [f'calculate_all_{name}' for name in self.parser.get_table_names()
                      if self.parser.get_table(name).get_calculated_fields()]

        code_parts = [
            f'"""',
            f'{self.parser.model_name} - Python Implementation',
            f'',
            f'This package provides Python dataclasses for analyzing fractal',
            f'and power-law systems.',
            f'"""',
            f'',
            f'from .models import {", ".join(class_names)}',
            f'from .data import load_sample_data',
            f'from .utils import build_systems_dict, {", ".join(calc_funcs)}, validate_system',
            f'',
            f'__all__ = [',
            f'    {", ".join(f"\"{name}\"" for name in class_names)},',
            f'    "load_sample_data",',
            f'    "build_systems_dict", {", ".join(f"\"{name}\"" for name in calc_funcs)}, "validate_system"',
            f']',
            ''
        ]

        self._write_file('__init__.py', '\n'.join(code_parts))

    def _generate_models(self):
        """Generate models.py with all table classes"""
        imports = [
            "from dataclasses import dataclass, field",
            "from typing import Optional, Dict, List",
            "import math",
            ""
        ]

        code_parts = [
            self._file_header("Data Models"),
            "\n".join(imports)
        ]

        # Generate class for each table
        for table_name in self.parser.get_table_names():
            table = self.parser.get_table(table_name)
            code_parts.append(self._generate_table_class(table))

        self._write_file('models.py', '\n\n'.join(code_parts))

    def _generate_table_class(self, table: Table) -> str:
        """Generate a dataclass for a table"""
        class_name = self._to_class_name(table.name)
        raw_fields = table.get_raw_fields()
        calc_fields = table.get_calculated_fields()

        # Build class definition
        parts = []

        # Class docstring
        parts.append(f'@dataclass')
        parts.append(f'class {class_name}:')
        parts.append(f'    """')
        parts.append(f'    {table.description}')
        parts.append(f'    """')

        # Raw fields
        for f in raw_fields:
            py_type = self._get_python_type(f)
            field_name = self._to_snake_case(f.name)
            parts.append(f'    {field_name}: {py_type}')

        # Cached calculated fields (private)
        for f in calc_fields:
            py_type = self._get_python_type(f)
            field_name = self._to_snake_case(f.name)
            parts.append(f'    _{field_name}: Optional[{py_type}] = field(default=None, repr=False)')

        parts.append('')

        # Calculation methods
        calc_order = table.get_calculation_order()
        for f in calc_order:
            method = self._generate_calculation_method(f, table)
            parts.append(method)
            parts.append('')

        return '\n'.join(parts)

    def _generate_calculation_method(self, f: Field, table: Table) -> str:
        """Generate a calculation method for a field"""
        method_name = f'calculate_{self._to_snake_case(f.name)}'
        field_name = self._to_snake_case(f.name)
        return_type = self._get_python_type(f)

        # Determine required parameters based on field type
        params = ['self']
        if f.field_type == 'lookup':
            # Lookups need access to related table
            related_table = self._find_related_table(f, table)
            if related_table:
                params.append(f'{related_table}_dict: Dict[str, {self._to_class_name(related_table)}]')
        elif f.field_type == 'aggregation':
            # Aggregations need access to child table
            child_table = self._find_child_table(f)
            if child_table:
                params.append(f'{child_table}: List[{self._to_class_name(child_table)}]')

        param_str = ', '.join(params)

        # Generate method body
        body_lines = [
            f'    def {method_name}({param_str}) -> {return_type}:',
            f'        """',
            f'        {f.description}',
            f'        Formula: {f.formula}',
            f'        """',
        ]

        # Add caching logic
        body_lines.append(f'        if self._{field_name} is None:')

        # Translate formula
        # Build a set of calculated field names in this table
        calculated_field_names = {cf.name for cf in table.get_calculated_fields()}

        # Also build calculated fields for all tables (for MINIFS/MAXIFS aggregations)
        all_calculated_fields = {}
        for tname in self.parser.get_table_names():
            t = self.parser.get_table(tname)
            all_calculated_fields[tname] = {cf.name for cf in t.get_calculated_fields()}

        context = {
            'table_name': table.name,
            'is_calculated_field': f.field_type in ['calculated', 'aggregation'],
            'calculated_fields': calculated_field_names,
            'all_calculated_fields': all_calculated_fields
        }

        try:
            translated = self.translator.translate(f.formula, context)
            # Handle special cases for better Python code
            if f.field_type == 'aggregation':
                # Aggregation already returns the value
                body_lines.append(f'            self._{field_name} = {translated}')
            elif f.field_type == 'lookup':
                # Lookup might return None
                body_lines.append(f'            result = {translated}')
                body_lines.append(f'            self._{field_name} = result if result is not None else 0.0')
            else:
                # Regular calculation
                body_lines.append(f'            self._{field_name} = {translated}')

        except Exception as e:
            body_lines.append(f'            # Error translating formula: {e}')
            body_lines.append(f'            self._{field_name} = 0.0')

        body_lines.append(f'        return self._{field_name}')

        return '\n'.join(body_lines)

    def _generate_data(self):
        """Generate data.py with sample data loader"""
        code_parts = [
            self._file_header("Sample Data"),
            "from typing import Dict, List",
            "from .models import System, Scale, SystemStats",
            "",
            "",
            "def load_sample_data() -> Dict[str, List]:",
            "    \"\"\"Load sample data from rulebook\"\"\"",
            "    data = {}"
        ]

        # Generate data for each table
        for table_name in self.parser.get_table_names():
            table = self.parser.get_table(table_name)
            class_name = self._to_class_name(table.name)

            code_parts.append(f"")
            code_parts.append(f"    # {table.description}")
            code_parts.append(f"    data['{table_name}'] = [")

            for row in table.data:
                # Only include raw fields in constructor
                raw_fields = {f.name: row.get(f.name) for f in table.get_raw_fields() if f.name in row}

                # Convert to Python code
                field_strs = []
                for key, value in raw_fields.items():
                    snake_key = self._to_snake_case(key)
                    if value is None:
                        field_strs.append(f'{snake_key}=None')
                    elif isinstance(value, str):
                        field_strs.append(f'{snake_key}="{value}"')
                    else:
                        field_strs.append(f'{snake_key}={value}')

                code_parts.append(f"        {class_name}({', '.join(field_strs)}),")

            code_parts.append("    ]")

        code_parts.append("")
        code_parts.append("    return data")

        self._write_file('data.py', '\n'.join(code_parts))

    def _generate_utils(self):
        """Generate utils.py with helper functions"""
        code_parts = [
            self._file_header("Utility Functions"),
            "from typing import Dict, List",
            "from .models import System, Scale, SystemStats",
            "",
            "",
            "def build_systems_dict(systems: List[System]) -> Dict[str, System]:",
            "    \"\"\"Build a dictionary of systems keyed by system_id\"\"\"",
            "    return {s.system_id: s for s in systems}",
            ""
        ]

        # Generate calculate_all functions for each table
        for table_name in self.parser.get_table_names():
            table = self.parser.get_table(table_name)
            class_name = self._to_class_name(table.name)

            # Skip if no calculated fields
            calc_fields = table.get_calculated_fields()
            if not calc_fields:
                continue

            # Determine what parameters the function needs
            needs_systems_dict = any(self._find_related_table(f, table) == 'systems' for f in calc_fields)
            needs_scales = any(self._find_child_table(f) == 'scales' for f in calc_fields)

            params = [f"{table_name}: List[{class_name}]"]
            if needs_systems_dict:
                params.append("systems_dict: Dict[str, System]")
            if needs_scales:
                params.append("scales: List[Scale]")

            func_name = f"calculate_all_{table_name}"
            code_parts.append(f"")
            code_parts.append(f"def {func_name}({', '.join(params)}):")
            code_parts.append(f"    \"\"\"Calculate all derived fields for all {table_name}\"\"\"")
            code_parts.append(f"    for item in {table_name}:")
            code_parts.append(f"        # Calculate in dependency order")

            # Generate method calls in dependency order
            calc_order = table.get_calculation_order()
            for f in calc_order:
                method_name = f'calculate_{self._to_snake_case(f.name)}'

                # Determine what parameters this specific method needs
                method_params = []
                if f.field_type == 'lookup' and self._find_related_table(f, table):
                    related_table = self._find_related_table(f, table)
                    method_params.append(f'{related_table}_dict')
                elif f.field_type == 'aggregation' and self._find_child_table(f):
                    child_table = self._find_child_table(f)
                    method_params.append(child_table)

                param_str = f"({', '.join(method_params)})" if method_params else "()"
                code_parts.append(f"        item.{method_name}{param_str}")

        # Add validation function
        code_parts.extend([
            "",
            "",
            "def validate_system(stats: SystemStats, tolerance: float = 0.001) -> bool:",
            "    \"\"\"Check if empirical slope matches theoretical slope within tolerance\"\"\"",
            "    return abs(stats._slope_error or 0) < tolerance",
            ""
        ])

        self._write_file('utils.py', '\n'.join(code_parts))

    def _file_header(self, title: str) -> str:
        """Generate file header comment"""
        return f'''"""
{title}

Auto-generated from rulebook
Model: {self.parser.model_name}

DO NOT EDIT THIS FILE MANUALLY
Regenerate by running: python rulebook-to-python.py
"""'''

    def _to_class_name(self, table_name: str) -> str:
        """Convert table name to Python class name"""
        # Remove trailing 's' and convert to PascalCase
        if table_name == 'systems':
            return 'System'
        elif table_name == 'scales':
            return 'Scale'
        elif table_name == 'system_stats':
            return 'SystemStats'
        return table_name.title()

    def _to_snake_case(self, name: str) -> str:
        """Convert to snake_case and escape Python keywords"""
        snake_name = self.translator._to_snake_case(name)
        return self._escape_python_keyword(snake_name)

    def _escape_python_keyword(self, name: str) -> str:
        """Escape Python reserved keywords by appending underscore"""
        python_keywords = {
            'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del',
            'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if',
            'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
            'raise', 'return', 'try', 'while', 'with', 'yield', 'True', 'False', 'None'
        }
        if name in python_keywords:
            return f'{name}_'
        return name

    def _get_python_type(self, field: Field) -> str:
        """Get Python type annotation for a field"""
        base_type = {
            'string': 'str',
            'number': 'float',
            'decimal': 'float',
            'integer': 'int',
        }.get(field.datatype, 'str')

        # Make nullable if not primary key
        if not field.is_primary_key and field.datatype in ['number', 'decimal', 'integer']:
            return f'Optional[{base_type}]'

        return base_type

    def _find_related_table(self, field: Field, table: Table) -> Optional[str]:
        """Find which table this lookup field relates to"""
        if not field.formula:
            return None

        # For INDEX formulas like: =INDEX(systems!{{Field}}, MATCH(scales!{{Key}}, systems!{{KeyField}}, 0))
        # Extract the table name from the INDEX function's first argument
        import re
        # Match INDEX(tablename!{{...}}, ...) pattern
        match = re.search(r'INDEX\s*\(\s*(\w+)!', field.formula, re.IGNORECASE)
        if match:
            return match.group(1)

        # Also try to find from relationship fields referenced in the formula
        for f in table.fields:
            if f.field_type == 'relationship':
                # Check if the relationship field is mentioned in the formula
                # Match patterns like scales!{{System}} or MATCH(..., {{System}}, ...)
                if re.search(rf'\{{\{{{f.name}\}}\}}', field.formula):
                    return f.related_to

        return None

    def _find_child_table(self, field: Field) -> Optional[str]:
        """Find which table this aggregation operates on"""
        if not field.formula:
            return None

        # Extract table name from formula like COUNTIF(scales!{{System}}, ...)
        import re
        match = re.search(r'(COUNTIF|MINIFS|MAXIFS)\((\w+)!', field.formula, re.IGNORECASE)
        if match:
            return match.group(2)
        return None

    def _write_file(self, filename: str, content: str):
        """Write content to a file"""
        filepath = self.output_dir / filename
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  Generated {filepath}")


def main():
    """Main entry point"""
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    rulebook_path = project_root / 'effortless-rulebook' / 'effortless-rulebook.json'
    output_dir = script_dir / 'rulebook'

    # Check if rulebook exists
    if not rulebook_path.exists():
        print(f"Error: Rulebook not found at {rulebook_path}")
        sys.exit(1)

    # Generate
    generator = PythonGenerator(str(rulebook_path), str(output_dir))
    generator.generate()

    print("\n✓ Python code generation complete!")
    print(f"\nUsage:")
    print(f"  from rulebook import System, Scale, SystemStats, load_sample_data")
    print(f"  data = load_sample_data()")


if __name__ == '__main__':
    main()
