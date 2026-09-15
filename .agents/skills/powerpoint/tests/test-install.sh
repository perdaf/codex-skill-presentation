#!/usr/bin/env bash

set -u

TEST_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)
SKILL_DIR=$(cd -P "$TEST_DIR/.." && pwd)
INSTALLER="$SKILL_DIR/install.sh"
TEST_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/powerpoint-installer-tests.XXXXXX")
PASS_COUNT=0

cleanup() {
  rm -rf "$TEST_ROOT"
}
trap cleanup EXIT HUP INT TERM

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf 'PASS: %s\n' "$1"
}

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

assert_contains() {
  local value="$1" expected="$2" label="$3"
  printf '%s' "$value" | grep -F -- "$expected" >/dev/null || fail "$label (missing: $expected)"
  pass "$label"
}

assert_symlink_to_source() {
  local link_path="$1" label="$2"
  [ -L "$link_path" ] || fail "$label is not a symlink"
  [ "$(cd -P "$link_path" && pwd)" = "$SKILL_DIR" ] || fail "$label points to the wrong source"
  pass "$label"
}

run_with_home() {
  local test_home="$1"
  shift
  HOME="$test_home" "$INSTALLER" "$@" 2>&1
}

# --help and unknown options.
output=$($INSTALLER --help 2>&1) || fail "--help exits non-zero"
assert_contains "$output" "--antigravity-only" "--help"
if $INSTALLER --unknown-option >/dev/null 2>&1; then fail "unknown option should fail"; fi
pass "unknown option"

# --check must be read-only, including when required runtime links are absent.
home_readonly="$TEST_ROOT/home-readonly"
mkdir -p "$home_readonly"
before=$(find "$home_readonly" -mindepth 1 -print | sort)
run_with_home "$home_readonly" --check >/dev/null 2>&1 && fail "empty read-only doctor should not be READY"
after=$(find "$home_readonly" -mindepth 1 -print | sort)
[ "$before" = "$after" ] || fail "--check modified HOME"
pass "--check is read-only"

# Clean full install, same-source coherence, and idempotence.
home_full="$TEST_ROOT/home-full"
mkdir -p "$home_full"
output=$(run_with_home "$home_full") || fail "clean full install"
assert_contains "$output" "Installation status : READY" "clean full install status"
assert_symlink_to_source "$home_full/.codex/skills/powerpoint" "Codex clean symlink"
assert_symlink_to_source "$home_full/.gemini/config/skills/powerpoint" "Antigravity clean symlink"
codex_inode_before=$(ls -di "$home_full/.codex/skills/powerpoint" | awk '{print $1}')
output=$(run_with_home "$home_full") || fail "second full install"
codex_inode_after=$(ls -di "$home_full/.codex/skills/powerpoint" | awk '{print $1}')
[ "$codex_inode_before" = "$codex_inode_after" ] || fail "idempotence replaced a correct symlink"
assert_contains "$output" "Same source   : YES" "same source coherence"
pass "idempotent second install"

# Codex-only and Antigravity-only modes.
home_codex="$TEST_ROOT/home-codex"
mkdir -p "$home_codex"
run_with_home "$home_codex" --codex-only >/dev/null || fail "Codex-only install"
[ -L "$home_codex/.codex/skills/powerpoint" ] || fail "Codex-only missing Codex link"
[ ! -e "$home_codex/.gemini/config/skills/powerpoint" ] || fail "Codex-only touched Antigravity"
pass "Codex-only"

home_antigravity="$TEST_ROOT/home-antigravity"
mkdir -p "$home_antigravity"
run_with_home "$home_antigravity" --antigravity-only >/dev/null || fail "Antigravity-only install"
[ -L "$home_antigravity/.gemini/config/skills/powerpoint" ] || fail "Antigravity-only missing link"
[ ! -e "$home_antigravity/.codex/skills/powerpoint" ] || fail "Antigravity-only touched Codex"
pass "Antigravity-only"

# Incorrect symlink: non-interactive execution must refuse replacement.
home_wrong="$TEST_ROOT/home-wrong"
wrong_target="$TEST_ROOT/wrong-target"
mkdir -p "$home_wrong/.codex/skills" "$wrong_target"
ln -s "$wrong_target" "$home_wrong/.codex/skills/powerpoint"
if run_with_home "$home_wrong" --codex-only >/dev/null 2>&1; then fail "wrong symlink should block"; fi
[ "$(readlink "$home_wrong/.codex/skills/powerpoint")" = "$wrong_target" ] || fail "wrong symlink was silently replaced"
pass "incorrect symlink preserved"

# Real directory conflict must never be removed.
home_directory="$TEST_ROOT/home-directory"
mkdir -p "$home_directory/.codex/skills/powerpoint"
printf 'preserve\n' > "$home_directory/.codex/skills/powerpoint/marker"
if run_with_home "$home_directory" --codex-only >/dev/null 2>&1; then fail "real directory conflict should block"; fi
[ -f "$home_directory/.codex/skills/powerpoint/marker" ] || fail "real directory conflict was modified"
pass "real directory preserved"

# Copy source into a path containing spaces for source-path portability tests.
space_parent="$TEST_ROOT/repository with spaces/.agents/skills"
mkdir -p "$space_parent"
cp -R "$SKILL_DIR" "$space_parent/powerpoint"
space_skill="$space_parent/powerpoint"
home_space="$TEST_ROOT/home-space"
mkdir -p "$home_space"
HOME="$home_space" "$space_skill/install.sh" >/dev/null || fail "path containing spaces"
[ "$(cd -P "$home_space/.codex/skills/powerpoint" && pwd)" = "$(cd -P "$space_skill" && pwd)" ] || fail "space path resolved incorrectly"
pass "path containing spaces"

# Invalid frontmatter must block before any runtime link is created.
bad_skill="$TEST_ROOT/bad-frontmatter/powerpoint"
mkdir -p "$(dirname "$bad_skill")"
cp -R "$SKILL_DIR" "$bad_skill"
sed '1d' "$bad_skill/SKILL.md" > "$bad_skill/SKILL.md.invalid"
mv "$bad_skill/SKILL.md.invalid" "$bad_skill/SKILL.md"
home_bad="$TEST_ROOT/home-bad-frontmatter"
mkdir -p "$home_bad"
if HOME="$home_bad" "$bad_skill/install.sh" --codex-only >/dev/null 2>&1; then fail "missing frontmatter should block"; fi
[ ! -e "$home_bad/.codex/skills/powerpoint" ] || fail "invalid source created a runtime link"
pass "frontmatter missing"

# Version mismatch and different physical sources.
alternate="$TEST_ROOT/alternate-source"
mkdir -p "$alternate"
cp "$SKILL_DIR/package.json" "$alternate/package.json"
sed 's/"version": "4.6.0"/"version": "4.5.1"/' "$alternate/package.json" > "$alternate/package.json.tmp"
mv "$alternate/package.json.tmp" "$alternate/package.json"
home_mismatch="$TEST_ROOT/home-mismatch"
mkdir -p "$home_mismatch/.codex/skills" "$home_mismatch/.gemini/config/skills"
ln -s "$SKILL_DIR" "$home_mismatch/.codex/skills/powerpoint"
ln -s "$alternate" "$home_mismatch/.gemini/config/skills/powerpoint"
output=$(run_with_home "$home_mismatch" --check 2>&1 || true)
assert_contains "$output" "VERSION MISMATCH" "version mismatch diagnostic"
assert_contains "$output" "Same source   : NO" "different source diagnostic"

# Simulate a mandatory dependency missing by hiding Node/npm while retaining shell utilities.
minimal_bin="$TEST_ROOT/minimal-bin"
mkdir -p "$minimal_bin"
for utility in cat dirname basename readlink sed awk grep find sort; do
  utility_path=$(command -v "$utility" 2>/dev/null || true)
  [ -n "$utility_path" ] && ln -s "$utility_path" "$minimal_bin/$utility"
done
home_no_node="$TEST_ROOT/home-no-node"
mkdir -p "$home_no_node/.codex/skills" "$home_no_node/.gemini/config/skills"
ln -s "$SKILL_DIR" "$home_no_node/.codex/skills/powerpoint"
ln -s "$SKILL_DIR" "$home_no_node/.gemini/config/skills/powerpoint"
output=$(HOME="$home_no_node" PATH="$minimal_bin" POWERPOINT_APPLICATIONS_DIR="$TEST_ROOT/no-apps" POWERPOINT_SYSTEM_BIN_DIR="$TEST_ROOT/no-system-bin" /bin/bash "$INSTALLER" --check 2>&1 || true)
assert_contains "$output" "node is missing" "mandatory dependency missing"
assert_contains "$output" "Installation status : NOT READY" "mandatory dependency blocks READY"

# Simulate optional tools missing while Node/npm and both links remain valid.
tool_bin="$TEST_ROOT/tool-bin"
mkdir -p "$tool_bin"
for utility in cat node npm dirname basename readlink sed awk grep find sort; do
  utility_path=$(command -v "$utility" 2>/dev/null || true)
  [ -n "$utility_path" ] && ln -s "$utility_path" "$tool_bin/$utility"
done
home_optional="$TEST_ROOT/home-optional"
mkdir -p "$home_optional/.codex/skills" "$home_optional/.gemini/config/skills"
ln -s "$SKILL_DIR" "$home_optional/.codex/skills/powerpoint"
ln -s "$SKILL_DIR" "$home_optional/.gemini/config/skills/powerpoint"
output=$(HOME="$home_optional" PATH="$tool_bin" POWERPOINT_APPLICATIONS_DIR="$TEST_ROOT/no-apps" POWERPOINT_SYSTEM_BIN_DIR="$TEST_ROOT/no-system-bin" /bin/bash "$INSTALLER" --check 2>&1 || true)
assert_contains "$output" "LibreOffice   : MISSING / OPTIONAL" "optional LibreOffice missing"
assert_contains "$output" "Chrome        : MISSING / OPTIONAL" "optional Chrome missing"
assert_contains "$output" "no supported browser renderer" "required browser path missing"

printf 'Installer assertions passed (%s)\n' "$PASS_COUNT"
