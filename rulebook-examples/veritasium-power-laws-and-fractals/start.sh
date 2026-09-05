#!/bin/bash
#
# Power Laws & Fractals - Project Launcher
#
# Just run: ./start.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME='veritasium-power-laws-and-fractals'
EXPERIENCE_DESCRIPTION='Interactive multi-substrate power-law and fractal validation lab'
START_COMMAND='./start.sh'

die() { echo "[start] ERROR: $*" >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || die "python3 is required"
for file in orchestrator.py visualizer/generate_report.py \
  effortless-rulebook/effortless-rulebook.json README.md; do
    [ -f "$file" ] || die "missing required file: $SCRIPT_DIR/$file"
done

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'
DIM='\033[2m'

show_menu() {
    clear
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║${NC}     🔺 ${CYAN}POWER LAWS & FRACTALS${NC} - Veritasium Edition        ${BOLD}║${NC}"
    echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}Run Tests:${NC}"
    echo -e "  ${GREEN}1)${NC}  🧪  Run ALL Platform Tests   ${YELLOW}(+ opens report)${NC}"
    echo -e "  ${GREEN}2)${NC}  🐍  Python Only"
    echo -e "  ${GREEN}3)${NC}  🐹  Go Only"
    echo -e "  ${GREEN}4)${NC}  🐘  PostgreSQL Only          ${DIM}(requires Docker)${NC}"
    echo ""
    echo -e "  ${BOLD}View:${NC}"
    echo -e "  ${GREEN}5)${NC}  📊  View Results Report      ${YELLOW}(opens in browser)${NC}"
    echo ""
    echo -e "  ${BOLD}Utilities:${NC}"
    echo -e "  ${MAGENTA}g)${NC}  🔄  Regenerate Test Data     ${DIM}(CANONICAL Python, 6dp)${NC}"
    echo -e "  ${MAGENTA}s)${NC}  📄  View SSoT JSON"
    echo -e "  ${MAGENTA}r)${NC}  📖  View README"
    echo -e "  ${MAGENTA}j)${NC}  📓  Jupyter Notebook"
    echo ""
    echo -e "  ${RED}q)${NC}  ❌  Quit"
    echo ""
    echo -e "${BOLD}────────────────────────────────────────────────────────────────${NC}"
    echo -n "  Pick an option: "
}

open_report() {
    # Generate the comprehensive HTML report and open it
    python3 "$SCRIPT_DIR/visualizer/generate_report.py"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        command -v open >/dev/null 2>&1 || die "open is required to display the report on macOS"
        open "$SCRIPT_DIR/visualizer/report.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        command -v xdg-open >/dev/null 2>&1 || die "xdg-open is required to display the report on Linux"
        xdg-open "$SCRIPT_DIR/visualizer/report.html"
    else
        die "unsupported OSTYPE '$OSTYPE'; report generated at $SCRIPT_DIR/visualizer/report.html"
    fi
}

run_all_tests() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Running ALL Platform Tests                                ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${DIM}Using existing test-input.json and answer-key.json${NC}"
    echo -e "${DIM}(Use 'g' to regenerate test data from SSoT)${NC}"
    echo ""
    python3 "$SCRIPT_DIR/orchestrator.py" --all
    echo ""
    echo -e "${CYAN}Opening results report in browser...${NC}"
    open_report
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

run_python() {
    echo ""
    echo -e "${CYAN}Running Python tests...${NC}"
    echo ""
    python3 "$SCRIPT_DIR/python/run-tests.py"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

run_golang() {
    echo ""
    echo -e "${CYAN}Running Go tests...${NC}"
    echo ""
    cd "$SCRIPT_DIR/golang"
    command -v go >/dev/null 2>&1 \
      || die "Go is required for the Go validation option; see golang/README.md"
    go run .
    cd "$SCRIPT_DIR"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

run_postgres() {
    echo ""
    echo -e "${CYAN}Running PostgreSQL tests...${NC}"
    echo ""
    command -v psql >/dev/null 2>&1 \
      || die "psql is required for PostgreSQL validation; see postgres/README.md"
    python3 "$SCRIPT_DIR/postgres/run-tests.py"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

view_report() {
    echo ""
    echo -e "${CYAN}Generating and opening results report...${NC}"
    echo ""
    # Generate and open HTML
    open_report
    echo ""
    echo -e "${GREEN}Report opened in browser!${NC}"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

regenerate_data() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Regenerating CANONICAL Test Data from SSoT                ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}This Python script generates:${NC}"
    echo -e "  • ${GREEN}test-input.json${NC}  - iterations 4-7 with raw facts only"
    echo -e "  • ${GREEN}answer-key.json${NC}  - ALL 8 iterations with computed values (6dp)"
    echo -e "  • ${GREEN}base-data.json${NC}   - iterations 0-3 for platform init"
    echo ""
    echo -e "${MAGENTA}All numeric values are rounded to 6 decimal places.${NC}"
    echo -e "${MAGENTA}These files are CANONICAL - all platforms must match them exactly.${NC}"
    echo ""
    python3 "$SCRIPT_DIR/generate-test-data.py"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

run_jupyter() {
    echo ""
    echo -e "${CYAN}Starting Jupyter Notebook...${NC}"
    echo ""
    cd "$SCRIPT_DIR/jupyter"
    command -v jupyter >/dev/null 2>&1 \
      || die "jupyter is required for the notebook option"
    jupyter notebook power-laws-and-fractals.ipynb
    cd "$SCRIPT_DIR"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

view_ssot() {
    echo ""
    echo -e "${CYAN}Source of Truth (first 50 lines):${NC}"
    echo ""
    command -v head >/dev/null 2>&1 || die "head is required to preview the SSoT"
    head -50 "$SCRIPT_DIR/effortless-rulebook/effortless-rulebook.json"
    echo ""
    echo -e "${YELLOW}Full file: effortless-rulebook/effortless-rulebook.json${NC}"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

view_readme() {
    echo ""
    command -v less >/dev/null 2>&1 || die "less is required to view README.md"
    less "$SCRIPT_DIR/README.md"
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
}

# Main loop
echo "[start] project: $PROJECT_NAME"
echo "[start] starting: $EXPERIENCE_DESCRIPTION"
echo "[start] command:  $START_COMMAND"
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1) run_all_tests ;;
        2) run_python ;;
        3) run_golang ;;
        4) run_postgres ;;
        5) view_report ;;
        g|G) regenerate_data ;;
        s|S) view_ssot ;;
        r|R) view_readme ;;
        j|J) run_jupyter ;;
        q|Q) 
            echo ""
            echo -e "${GREEN}Goodbye! 🔺${NC}"
            echo ""
            exit 0 
            ;;
        *) 
            echo -e "${YELLOW}Invalid option. Try again.${NC}"
            sleep 1
            ;;
    esac
done
