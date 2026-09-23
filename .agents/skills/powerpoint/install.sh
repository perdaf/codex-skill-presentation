#!/usr/bin/env bash

# PowerPoint Skill V4.6.1 candidate — Installer & Doctor
# Portable across macOS Bash 3.2+; no user-specific path is embedded here.

set -u

EXIT_USAGE=64
MODE="install"
INSTALL_CODEX=1
INSTALL_ANTIGRAVITY=1
BLOCKERS=0
WARNINGS=0

SOURCE_STATUS="UNKNOWN"
SOURCE_VERSION="UNKNOWN"
CODEX_STATUS="NOT CHECKED"
ANTIGRAVITY_STATUS="NOT CHECKED"
CODEX_VERSION="UNKNOWN"
ANTIGRAVITY_VERSION="UNKNOWN"
CODEX_REAL="UNAVAILABLE"
ANTIGRAVITY_REAL="UNAVAILABLE"
SAME_SOURCE="UNKNOWN"
NODE_STATUS="MISSING / REQUIRED"
NODE_VERSION="MISSING"
NPM_STATUS="MISSING / REQUIRED"
NPM_VERSION="MISSING"
PPTXGEN_STATUS="MISSING / REQUIRED"
PPTXGEN_VERSION="MISSING"
PYTHON_STATUS="MISSING / OPTIONAL"
PYTHON_VERSION="MISSING"
PYTHON_ENVIRONMENT="NOT REQUIRED"
PYYAML_STATUS="MISSING / OPTIONAL"
PYTHON_VALIDATORS="NOT REQUIRED"
LIBREOFFICE_STATUS="MISSING / OPTIONAL"
FIREFOX_STATUS="MISSING / OPTIONAL"
CHROME_STATUS="MISSING / OPTIONAL"
SWIFT_STATUS="MISSING / OPTIONAL"
WEB_OFFLINE_STATUS="NOT READY"
WEB_RENDERER_STATUS="MISSING / REQUIRED (Firefox or Chromium)"

usage() {
  cat <<'EOF'
Usage: ./install.sh [OPTION]

Prepare and diagnose the PowerPoint skill from this repository.

  (no option)          Install/check Codex and Antigravity symlinks
  --check              Read-only doctor; never installs or modifies anything
  --codex-only         Configure only Codex
  --antigravity-only   Configure only Antigravity
  --help               Show this help
EOF
}

case "$#" in
  0) ;;
  1)
    case "$1" in
      --check) MODE="check" ;;
      --codex-only) INSTALL_ANTIGRAVITY=0 ;;
      --antigravity-only) INSTALL_CODEX=0 ;;
      --help) usage; exit 0 ;;
      *) printf 'ERROR: unknown option: %s\n\n' "$1" >&2; usage >&2; exit "$EXIT_USAGE" ;;
    esac
    ;;
  *) printf 'ERROR: expected at most one option.\n\n' >&2; usage >&2; exit "$EXIT_USAGE" ;;
esac

resolve_script_path() {
  local source_path="$1"
  local source_dir link_value
  while [ -L "$source_path" ]; do
    source_dir=$(cd -P "$(dirname "$source_path")" 2>/dev/null && pwd) || return 1
    link_value=$(readlink "$source_path") || return 1
    case "$link_value" in
      /*) source_path="$link_value" ;;
      *) source_path="$source_dir/$link_value" ;;
    esac
  done
  source_dir=$(cd -P "$(dirname "$source_path")" 2>/dev/null && pwd) || return 1
  printf '%s/%s\n' "$source_dir" "$(basename "$source_path")"
}

SCRIPT_PATH=$(resolve_script_path "${BASH_SOURCE[0]}") || {
  printf 'ERROR: unable to resolve install.sh location.\n' >&2
  exit 1
}
SKILL_DIR=$(cd -P "$(dirname "$SCRIPT_PATH")" 2>/dev/null && pwd) || {
  printf 'ERROR: unable to resolve the skill directory.\n' >&2
  exit 1
}

if [ -z "${HOME:-}" ] || [ "$HOME" = "/" ]; then
  printf 'ERROR: HOME must identify a user home directory.\n' >&2
  exit 1
fi

CODEX_LINK="$HOME/.codex/skills/powerpoint"
ANTIGRAVITY_LINK="$HOME/.gemini/config/skills/powerpoint"
APPLICATIONS_DIR=${POWERPOINT_APPLICATIONS_DIR:-/Applications}
SYSTEM_BIN_DIR=${POWERPOINT_SYSTEM_BIN_DIR:-/usr/bin}

blocker() {
  BLOCKERS=$((BLOCKERS + 1))
  printf 'ERROR: %s\n' "$1" >&2
}

warning() {
  WARNINGS=$((WARNINGS + 1))
  printf 'WARNING: %s\n' "$1" >&2
}

read_version() {
  local directory="$1"
  local package_file="$directory/package.json"
  [ -f "$package_file" ] || return 1
  sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$package_file" | sed -n '1p'
}

canonical_directory() {
  local directory="$1"
  [ -d "$directory" ] || return 1
  (cd -P "$directory" 2>/dev/null && pwd)
}

validate_frontmatter() {
  local skill_file="$1"
  local closing name description
  [ "$(sed -n '1p' "$skill_file")" = "---" ] || return 1
  closing=$(awk 'NR > 1 && $0 == "---" { print NR; exit }' "$skill_file")
  [ -n "$closing" ] || return 1
  name=$(awk 'NR == 1 && $0 == "---" { in_yaml=1; next } in_yaml && $0 == "---" { exit } in_yaml && $0 ~ /^name:[[:space:]]*/ { sub(/^name:[[:space:]]*/, ""); print; exit }' "$skill_file")
  description=$(awk 'NR == 1 && $0 == "---" { in_yaml=1; next } in_yaml && $0 == "---" { exit } in_yaml && $0 ~ /^description:[[:space:]]*/ { sub(/^description:[[:space:]]*/, ""); print; exit }' "$skill_file")
  [ "$name" = "powerpoint" ] && [ -n "$description" ]
}

validate_source() {
  local relative
  SOURCE_STATUS="OK"

  if [ ! -f "$SKILL_DIR/SKILL.md" ]; then
    SOURCE_STATUS="INVALID"
    blocker "SKILL.md is missing from $SKILL_DIR"
  elif ! validate_frontmatter "$SKILL_DIR/SKILL.md"; then
    SOURCE_STATUS="INVALID"
    blocker "invalid SKILL.md: YAML frontmatter must be delimited by --- and contain name: powerpoint plus a description"
  fi

  if [ ! -f "$SKILL_DIR/package.json" ]; then
    SOURCE_STATUS="INVALID"
    blocker "package.json is required by the JavaScript engines"
  else
    SOURCE_VERSION=$(read_version "$SKILL_DIR")
    if [ -z "$SOURCE_VERSION" ]; then
      SOURCE_VERSION="UNKNOWN"
      SOURCE_STATUS="INVALID"
      blocker "the version could not be read from package.json"
    else
      printf 'Detected PowerPoint Skill version: V%s\n' "$SOURCE_VERSION"
    fi
  fi

  for relative in \
    assets references scripts tests \
    assets/mandatory-pipeline.js \
    assets/targeted-edit.js \
    assets/teaching.js \
    assets/visual-intelligence.js \
    assets/presentation-format.js \
    assets/gamma-export.js \
    assets/v46-pipeline.js \
    assets/web-interactions.js \
    assets/web-presentation-engine.js \
    assets/web-presentation-runtime.js \
    assets/web-targeted-edit.js \
    assets/web-validation.js \
    references/web-presentation-engine.md \
    references/gamma-export.md \
    scripts/render-presentation.js \
    scripts/render-web-presentation.js; do
    if [ ! -e "$SKILL_DIR/$relative" ]; then
      SOURCE_STATUS="INVALID"
      blocker "essential skill component is missing: $relative"
    fi
  done

  if [ -f "$SKILL_DIR/package.json" ] && ! grep -q '"pptxgenjs"[[:space:]]*:' "$SKILL_DIR/package.json"; then
    SOURCE_STATUS="INVALID"
    blocker "package.json does not declare the required pptxgenjs dependency"
  fi

  if [ "$SOURCE_STATUS" = "OK" ]; then
    WEB_OFFLINE_STATUS="READY"
  fi
}

detect_node_tools() {
  local node_major npm_major lock_version
  if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version 2>/dev/null || printf 'UNKNOWN')
    node_major=$(printf '%s' "$NODE_VERSION" | sed 's/^v//' | awk -F. '{print $1}')
    case "$node_major" in
      ''|*[!0-9]*) NODE_STATUS="INVALID / REQUIRED"; blocker "unable to parse the Node.js version: $NODE_VERSION" ;;
      *)
        if [ "$node_major" -lt 18 ]; then
          NODE_STATUS="TOO OLD / REQUIRED"
          blocker "Node.js 18 or newer is required; found $NODE_VERSION"
        else
          NODE_STATUS="AVAILABLE / REQUIRED"
        fi
        ;;
    esac
  else
    blocker "node is missing (Node.js 18+ is required)"
  fi

  if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version 2>/dev/null || printf 'UNKNOWN')
    NPM_STATUS="AVAILABLE / REQUIRED"
    if [ -f "$SKILL_DIR/package-lock.json" ]; then
      lock_version=$(sed -n 's/^[[:space:]]*"lockfileVersion"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$SKILL_DIR/package-lock.json" | sed -n '1p')
      npm_major=$(printf '%s' "$NPM_VERSION" | awk -F. '{print $1}')
      if [ "$lock_version" = "3" ]; then
        case "$npm_major" in
          ''|*[!0-9]*) ;;
          *)
            if [ "$npm_major" -lt 7 ]; then
              NPM_STATUS="TOO OLD / REQUIRED"
              blocker "npm 7 or newer is required for package-lock.json lockfileVersion 3"
            fi
            ;;
        esac
      fi
    fi
  else
    blocker "npm is missing"
  fi
}

dependencies_ready() {
  local declared_version resolved_version
  [ "$NODE_STATUS" = "AVAILABLE / REQUIRED" ] || return 1
  [ "$NPM_STATUS" = "AVAILABLE / REQUIRED" ] || return 1
  [ -f "$SKILL_DIR/node_modules/pptxgenjs/package.json" ] || return 1
  (cd "$SKILL_DIR" && node -e "require('pptxgenjs')" >/dev/null 2>&1) || return 1
  declared_version=$(sed -n 's/^[[:space:]]*"pptxgenjs"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$SKILL_DIR/package.json" | sed -n '1p')
  resolved_version=$(read_version "$SKILL_DIR/node_modules/pptxgenjs" || true)
  [ -n "$declared_version" ] && [ "$resolved_version" = "$declared_version" ] || return 1
}

read_pptxgen_version() {
  read_version "$SKILL_DIR/node_modules/pptxgenjs"
}

ensure_node_dependencies() {
  local installer
  if dependencies_ready; then
    PPTXGEN_VERSION=$(read_pptxgen_version)
    PPTXGEN_STATUS="AVAILABLE / REQUIRED"
    return 0
  fi

  if [ "$MODE" = "check" ]; then
    PPTXGEN_STATUS="MISSING OR INVALID / REQUIRED"
    blocker "declared Node dependencies are not installed or do not resolve cleanly"
    return 1
  fi

  [ "$NODE_STATUS" = "AVAILABLE / REQUIRED" ] || return 1
  [ "$NPM_STATUS" = "AVAILABLE / REQUIRED" ] || return 1

  if [ -f "$SKILL_DIR/package-lock.json" ] && grep -q '"lockfileVersion"[[:space:]]*:' "$SKILL_DIR/package-lock.json"; then
    installer="ci"
  else
    installer="install"
  fi
  printf 'Installing declared Node dependencies with npm %s...\n' "$installer"
  if ! (cd "$SKILL_DIR" && npm "$installer"); then
    PPTXGEN_STATUS="INSTALL FAILED / REQUIRED"
    blocker "npm $installer failed; no runtime symlink was changed"
    return 1
  fi
  if ! dependencies_ready; then
    PPTXGEN_STATUS="INVALID / REQUIRED"
    blocker "Node dependencies remain invalid after npm $installer"
    return 1
  fi
  PPTXGEN_VERSION=$(read_pptxgen_version)
  PPTXGEN_STATUS="AVAILABLE / REQUIRED"
}

detect_python() {
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version 2>&1 | sed 's/^Python[[:space:]]*//')
    PYTHON_STATUS="AVAILABLE / OPTIONAL"
    PYTHON_ENVIRONMENT="SYSTEM (no skill venv required)"
    if PYTHONDONTWRITEBYTECODE=1 python3 -c 'import yaml' >/dev/null 2>&1; then
      PYYAML_STATUS="AVAILABLE / OPTIONAL"
    else
      PYYAML_STATUS="MISSING / OPTIONAL"
      warning "PyYAML is unavailable, but no Python validator is used by this skill; external quick_validate.py users may create a local .venv"
    fi
  else
    warning "python3 is unavailable; it is optional because this skill has no Python runtime or validator"
  fi
}

find_first_executable() {
  local candidate
  for candidate in "$@"; do
    [ -n "$candidate" ] || continue
    if [ -x "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

detect_rendering_tools() {
  local found command_path
  command_path=$(command -v soffice 2>/dev/null || true)
  found=$(find_first_executable "$command_path" "$APPLICATIONS_DIR/LibreOffice.app/Contents/MacOS/soffice" || true)
  if [ -n "$found" ]; then
    LIBREOFFICE_STATUS="AVAILABLE / OPTIONAL"
  else
    warning "LibreOffice is missing; PPTX-to-PDF/PNG rendering is unavailable, but generation still works"
  fi

  command_path=$(command -v swift 2>/dev/null || true)
  found=$(find_first_executable "$command_path" "$SYSTEM_BIN_DIR/swift" || true)
  if [ -n "$found" ]; then
    SWIFT_STATUS="AVAILABLE / OPTIONAL"
  else
    warning "Swift is missing; the built-in macOS PDF-to-PNG step is unavailable"
  fi

  command_path=$(command -v firefox 2>/dev/null || true)
  found=$(find_first_executable "$command_path" "$APPLICATIONS_DIR/Firefox.app/Contents/MacOS/firefox" || true)
  if [ -n "$found" ]; then
    FIREFOX_STATUS="AVAILABLE / OPTIONAL"
  fi

  command_path=$(command -v google-chrome 2>/dev/null || command -v chromium 2>/dev/null || true)
  found=$(find_first_executable "$command_path" "$APPLICATIONS_DIR/Google Chrome.app/Contents/MacOS/Google Chrome" "$APPLICATIONS_DIR/Chromium.app/Contents/MacOS/Chromium" || true)
  if [ -n "$found" ]; then
    CHROME_STATUS="AVAILABLE / OPTIONAL"
  fi

  if [ "$FIREFOX_STATUS" = "AVAILABLE / OPTIONAL" ] || [ "$CHROME_STATUS" = "AVAILABLE / OPTIONAL" ]; then
    WEB_RENDERER_STATUS="READY / REQUIRED PATH AVAILABLE"
  else
    blocker "no supported browser renderer was found; install Firefox or a Chromium-compatible browser for Web visual validation"
  fi
}

inspect_runtime() {
  local label="$1" link_path="$2"
  local real version
  if [ -L "$link_path" ]; then
    real=$(canonical_directory "$link_path" || true)
    version="UNKNOWN"
    [ -n "$real" ] && version=$(read_version "$real" || printf 'UNKNOWN')
    if [ "$label" = "Codex" ]; then
      CODEX_REAL=${real:-BROKEN_SYMLINK}
      CODEX_VERSION=${version:-UNKNOWN}
    else
      ANTIGRAVITY_REAL=${real:-BROKEN_SYMLINK}
      ANTIGRAVITY_VERSION=${version:-UNKNOWN}
    fi
    if [ "$real" = "$SKILL_DIR" ]; then
      printf '%s symlink       OK\n' "$label"
      [ "$label" = "Codex" ] && CODEX_STATUS="OK" || ANTIGRAVITY_STATUS="OK"
      return 0
    fi
    [ "$label" = "Codex" ] && CODEX_STATUS="WRONG SYMLINK" || ANTIGRAVITY_STATUS="WRONG SYMLINK"
    return 1
  fi

  if [ -e "$link_path" ]; then
    [ "$label" = "Codex" ] && CODEX_STATUS="CONFLICT (not a symlink)" || ANTIGRAVITY_STATUS="CONFLICT (not a symlink)"
    return 1
  fi
  [ "$label" = "Codex" ] && CODEX_STATUS="MISSING" || ANTIGRAVITY_STATUS="MISSING"
  return 1
}

configure_runtime() {
  local label="$1" link_path="$2"
  local current_target answer
  if inspect_runtime "$label" "$link_path"; then
    return 0
  fi

  if [ "$MODE" = "check" ]; then
    if [ -L "$link_path" ]; then
      current_target=$(readlink "$link_path" 2>/dev/null || printf 'BROKEN')
      blocker "$label uses a different symlink: $link_path -> $current_target; wanted $SKILL_DIR"
    elif [ -e "$link_path" ]; then
      blocker "$label path exists and is not a symlink: $link_path; move it manually, then rerun the installer"
    else
      blocker "$label symlink is missing: $link_path -> $SKILL_DIR"
    fi
    return 1
  fi

  if [ -L "$link_path" ]; then
    current_target=$(readlink "$link_path" 2>/dev/null || printf 'BROKEN')
    printf '\n%s has an incorrect symlink.\n' "$label"
    printf '  Existing path : %s\n' "$link_path"
    printf '  Current target: %s\n' "$current_target"
    printf '  Wanted target : %s\n' "$SKILL_DIR"
    if [ -t 0 ]; then
      printf 'Replace this symlink only? [y/N] '
      IFS= read -r answer
      case "$answer" in
        y|Y|yes|YES)
          if rm "$link_path" && ln -s "$SKILL_DIR" "$link_path"; then
            inspect_runtime "$label" "$link_path"
            return $?
          fi
          blocker "unable to replace the $label symlink"
          return 1
          ;;
        *) blocker "$label symlink replacement was declined"; return 1 ;;
      esac
    fi
    blocker "$label symlink was not replaced in non-interactive mode; rerun interactively to confirm replacement"
    return 1
  fi

  if [ -e "$link_path" ]; then
    printf '\n%s conflict:\n' "$label" >&2
    printf '  Existing path : %s\n' "$link_path" >&2
    printf '  Wanted target : %s\n' "$SKILL_DIR" >&2
    blocker "a real file or directory is never removed automatically; move it manually, then rerun"
    return 1
  fi

  if ! mkdir -p "$(dirname "$link_path")"; then
    blocker "unable to create parent directory for $link_path"
    return 1
  fi
  if ! ln -s "$SKILL_DIR" "$link_path"; then
    blocker "unable to create $label symlink: $link_path"
    return 1
  fi
  inspect_runtime "$label" "$link_path"
}

verify_runtime_versions() {
  local mismatch=0
  if [ "$INSTALL_CODEX" -eq 1 ]; then
    inspect_runtime "Codex" "$CODEX_LINK" >/dev/null 2>&1 || true
    if [ "$CODEX_VERSION" != "$SOURCE_VERSION" ]; then
      mismatch=1
      blocker "VERSION MISMATCH: source V$SOURCE_VERSION, Codex V$CODEX_VERSION ($CODEX_REAL)"
    fi
  else
    CODEX_STATUS="SKIPPED"
    CODEX_VERSION="SKIPPED"
    CODEX_REAL="SKIPPED"
  fi
  if [ "$INSTALL_ANTIGRAVITY" -eq 1 ]; then
    inspect_runtime "Antigravity" "$ANTIGRAVITY_LINK" >/dev/null 2>&1 || true
    if [ "$ANTIGRAVITY_VERSION" != "$SOURCE_VERSION" ]; then
      mismatch=1
      blocker "VERSION MISMATCH: source V$SOURCE_VERSION, Antigravity V$ANTIGRAVITY_VERSION ($ANTIGRAVITY_REAL)"
    fi
  else
    ANTIGRAVITY_STATUS="SKIPPED"
    ANTIGRAVITY_VERSION="SKIPPED"
    ANTIGRAVITY_REAL="SKIPPED"
  fi

  if [ "$INSTALL_CODEX" -eq 1 ] && [ "$INSTALL_ANTIGRAVITY" -eq 1 ]; then
    if [ "$CODEX_REAL" = "$SKILL_DIR" ] && [ "$ANTIGRAVITY_REAL" = "$SKILL_DIR" ]; then
      SAME_SOURCE="YES"
    else
      SAME_SOURCE="NO"
      [ "$mismatch" -eq 1 ] || blocker "Codex and Antigravity do not resolve to the unique source $SKILL_DIR"
    fi
  else
    SAME_SOURCE="N/A (single-runtime mode)"
  fi
}

display_version() {
  case "$1" in
    ''|UNKNOWN|SKIPPED|MISSING) printf '%s' "${1:-UNKNOWN}" ;;
    V*) printf '%s' "$1" ;;
    *) printf 'V%s' "$1" ;;
  esac
}

print_doctor() {
  local installation_status="READY"
  local source_display codex_display antigravity_display
  [ "$BLOCKERS" -eq 0 ] || installation_status="NOT READY"
  source_display=$(display_version "$SOURCE_VERSION")
  codex_display=$(display_version "$CODEX_VERSION")
  antigravity_display=$(display_version "$ANTIGRAVITY_VERSION")
  cat <<EOF

==========================================
PowerPoint Skill — Doctor
==========================================
Source
  Path          : $SKILL_DIR
  Version       : $source_display
  SKILL.md      : $SOURCE_STATUS

Runtimes
  Codex         : $CODEX_STATUS
  Codex path    : $CODEX_REAL
  Codex version : $codex_display
  Antigravity   : $ANTIGRAVITY_STATUS
  Antigrav path : $ANTIGRAVITY_REAL
  Antigrav ver. : $antigravity_display
  Same source   : $SAME_SOURCE

Node
  node          : $NODE_VERSION — $NODE_STATUS
  npm           : $NPM_VERSION — $NPM_STATUS
  PptxGenJS     : $PPTXGEN_VERSION — $PPTXGEN_STATUS

Python
  python3       : $PYTHON_VERSION — $PYTHON_STATUS
  environment   : $PYTHON_ENVIRONMENT
  PyYAML        : $PYYAML_STATUS
  validators    : $PYTHON_VALIDATORS

Rendering
  LibreOffice   : $LIBREOFFICE_STATUS
  Firefox       : $FIREFOX_STATUS
  Chrome        : $CHROME_STATUS
  Swift         : $SWIFT_STATUS

Web Engine
  offline       : $WEB_OFFLINE_STATUS
  renderer      : $WEB_RENDERER_STATUS

Warnings        : $WARNINGS
Blockers        : $BLOCKERS
------------------------------------------
Installation status : $installation_status
==========================================
EOF
}

printf 'PowerPoint Skill — Installer & Doctor\n'
printf 'Source: %s\n' "$SKILL_DIR"
printf 'Mode  : %s\n\n' "$MODE"

validate_source

# Never mutate anything when the source itself is invalid.
if [ "$SOURCE_STATUS" != "OK" ] && [ "$MODE" != "check" ]; then
  detect_node_tools
  detect_python
  detect_rendering_tools
  CODEX_STATUS="NOT TOUCHED"
  ANTIGRAVITY_STATUS="NOT TOUCHED"
  print_doctor
  exit 1
fi

detect_node_tools
detect_python
detect_rendering_tools
ensure_node_dependencies || true

# Do not create runtime links until required source/Node checks are valid.
if [ "$MODE" = "check" ] || { [ "$SOURCE_STATUS" = "OK" ] && [ "$NODE_STATUS" = "AVAILABLE / REQUIRED" ] && [ "$NPM_STATUS" = "AVAILABLE / REQUIRED" ] && [ "$PPTXGEN_STATUS" = "AVAILABLE / REQUIRED" ]; }; then
  if [ "$INSTALL_CODEX" -eq 1 ]; then
    configure_runtime "Codex" "$CODEX_LINK" || true
  else
    CODEX_STATUS="SKIPPED"
  fi
  if [ "$INSTALL_ANTIGRAVITY" -eq 1 ]; then
    configure_runtime "Antigravity" "$ANTIGRAVITY_LINK" || true
  else
    ANTIGRAVITY_STATUS="SKIPPED"
  fi
fi

verify_runtime_versions
print_doctor

[ "$BLOCKERS" -eq 0 ]
