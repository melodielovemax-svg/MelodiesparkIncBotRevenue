"""Policy tests for the Python frontend.

These mirror ``apps/melodie-cli/test/policy.test.mjs``. Both suites exist
because both frontends are shipped, and a security boundary that only one of
them enforces is not enforced.

The critical assertion is the same in both: a credential is PERMANENTLY denied,
not merely gated behind a flag. If that distinction ever regresses, someone will
eventually pass the flag and ship a live key.
"""

from __future__ import annotations

import contextlib
import io
import os
import tempfile
import unittest
from pathlib import Path

from melodiespark_cli.catalog import load_catalog
from melodiespark_cli.classifier import Classifier
from melodiespark_cli.content_guard import scan_content
from melodiespark_cli.contract import load_rules
from melodiespark_cli.output import bytes_human
from melodiespark_cli.paths import resolve_paths
from melodiespark_cli.templates import TEMPLATE_SUFFIX

PATHS = resolve_paths()
RULES = load_rules(PATHS.rules_path)
CLASSIFIER = Classifier(RULES)
ROOT = Path(r"C:\melodie\Melodiespark_Source")


def verdict(rel: str):
    return CLASSIFIER.classify(ROOT / rel, ROOT)


class TestHardDeny(unittest.TestCase):
    """Credential material must be permanently denied."""

    def test_known_credentials_are_permanently_denied(self) -> None:
        cases = [
            "MelodieCLI/.env.enc",
            "MelodieCLI/.env.production",
            "MelodieCLI/CREDENTIALS_QUICK_REFERENCE.txt",
            "MelodieCLI/config/APIKeys.json",
            # A copy in a directory nobody enumerated when the rules were written.
            "MelodieCLI/migration-backup/whatever/BotRevenue-Ultimate/config/APIKeys.json",
            "some/deep/nested/apikeys.json",
            "anything/credentials.txt",
            "x/id_rsa",
            "x/server.pem",
        ]
        for rel in cases:
            with self.subTest(rel=rel):
                v = verdict(rel)
                self.assertEqual(v.category, "SECRET")
                self.assertTrue(v.permanently_denied, f"{rel} must be permanently denied")
                self.assertFalse(v.extractable, f"{rel} must not be extractable")
                self.assertFalse(
                    v.authorization_required,
                    f"{rel} must not be merely authorization-gated",
                )

    def test_example_env_files_remain_copyable(self) -> None:
        for rel in ["pkg/.env.example", "pkg/.env.sample", "pkg/.env.example.full", "pkg/config.yaml"]:
            with self.subTest(rel=rel):
                v = verdict(rel)
                self.assertNotEqual(v.category, "SECRET")
                self.assertTrue(v.extractable, f"{rel} should be extractable")


class TestExcludedCategories(unittest.TestCase):
    """Non-copyable categories must stay non-copyable."""

    def test_vcs_archives_binaries_and_dumps_are_excluded(self) -> None:
        cases = [
            ("MelodieCLI/.git/config", "VCS"),
            ("MelodieCLI/bundle.zip", "ARCHIVE"),
            ("MelodieCLI/phoenix.exe", "BINARY"),
            ("MelodieCLI/query_engine.dll.node", "BINARY"),
            ("MelodieCLI/MelodieCLI_FILES.csv", "GENERATED"),
            ("MelodieCLI/MELODIECLI-TREE.txt", "GENERATED"),
            ("MelodieCLI/MELODIECLI-FILE-INVENTORY.txt", "GENERATED"),
            ("MelodieCLI/CODE-MAP.txt", "GENERATED"),
        ]
        for rel, expected in cases:
            with self.subTest(rel=rel):
                v = verdict(rel)
                self.assertEqual(v.category, expected)
                self.assertFalse(v.extractable, f"{rel} must not be extractable")

    def test_ordinary_code_is_extractable(self) -> None:
        for rel in ["pkg/src/index.ts", "pkg/tests/test_x.py", "pkg/README.md", "pkg/app/main.go"]:
            with self.subTest(rel=rel):
                v = verdict(rel)
                self.assertTrue(v.extractable, f"{rel} should be extractable (got {v.category})")
                self.assertFalse(v.permanently_denied)

    def test_flags_are_unique(self) -> None:
        v = verdict("MelodieCLI/.env.enc")
        self.assertEqual(len(v.flags), len(set(v.flags)), f"duplicate flags: {v.flags}")
        self.assertIn("permanently_denied", v.flags)
        self.assertIn("hard_deny_pattern", v.flags)


class TestContentGuard(unittest.TestCase):
    """A credential in an ordinary file must still be caught."""

    # SYNTHETIC FIXTURE. Not a real credential. It matches the shape the guard
    # looks for, so the guard test stays valid, while the "SYNTHETIC" marker
    # means a secret scanner reading this repository does not have to guess
    # whether it found a leak. Never put a real key here.
    SYNTHETIC_LIVE_KEY = "sk_live_SYNTHETICfixture0000000000000000000000"

    def test_live_key_in_markdown_is_detected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "notes.md"
            path.write_text(
                f"# Notes\n\nSet STRIPE_API_KEY_SECRET={self.SYNTHETIC_LIVE_KEY}\n",
                encoding="utf-8",
            )
            findings = scan_content(path, RULES)
            self.assertTrue(findings, "expected at least one content finding")
            self.assertTrue(any(f.id == "CS001_STRIPE_LIVE_SECRET" for f in findings))
            self.assertTrue(all(f.line >= 1 for f in findings))

    def test_clean_prose_and_binaries_do_not_fire(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            clean = Path(tmp) / "clean.md"
            clean.write_text("# Title\n\nNothing sensitive here.\n", encoding="utf-8")
            self.assertEqual(scan_content(clean, RULES), [])

            binary = Path(tmp) / "blob.bin"
            binary.write_bytes(bytes([0, 1, 2, 0, 255]))
            self.assertEqual(scan_content(binary, RULES), [])


class TestParityHelpers(unittest.TestCase):
    """Behaviour that must match the TypeScript frontend exactly."""

    def test_bytes_human_units_are_not_shifted(self) -> None:
        # 657.4 MB must not render as 657.4 GB. An off-by-one here silently
        # broke Node/Python parity once already.
        self.assertEqual(bytes_human(0), "0 B")
        self.assertEqual(bytes_human(1023), "1023 B")
        self.assertEqual(bytes_human(1024), "1.0 KB")
        self.assertEqual(bytes_human(1536), "1.5 KB")
        self.assertEqual(bytes_human(1024 * 1024), "1.0 MB")
        self.assertEqual(bytes_human(int(689_000_000)), "657.1 MB")
        self.assertEqual(bytes_human(1024**3), "1.0 GB")

    def test_template_suffix_constant_matches_typescript(self) -> None:
        self.assertEqual(TEMPLATE_SUFFIX, ".tmpl")


class TestTemplateDispatch(unittest.TestCase):
    """`template show <name>` must not be read as a template named "show".

    The TypeScript frontend had this exact bug: the documented
    ``template show <name>`` form failed with "Template not found: show"
    because the subcommand word arrived as the first positional. These tests
    pin the Python frontend to the corrected behaviour, and the Node suite pins
    the TypeScript side, so the two cannot drift apart on argument shape.
    """

    def _run(self, *argv: str) -> str:
        from melodiespark_cli.cli import main

        buffer = io.StringIO()
        with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(buffer):
            code = main(["template", *argv])
        self.assertEqual(code, 0, f"`template {' '.join(argv)}` exited {code}")
        return buffer.getvalue()

    def test_bare_and_list_both_list(self) -> None:
        for argv in ((), ("list",)):
            with self.subTest(argv=argv):
                self.assertIn("Templates (", self._run(*argv))

    def test_show_prefix_describes_the_named_template(self) -> None:
        self.assertIn("Template web3", self._run("show", "web3"))
        self.assertIn("Template web3", self._run("web3"))

    def test_show_with_files_lists_files(self) -> None:
        self.assertIn("Files in template web3", self._run("show", "web3", "--files"))

    def test_show_without_a_name_lists(self) -> None:
        self.assertIn("Templates (", self._run("show"))

    def test_unknown_template_exits_non_zero(self) -> None:
        from melodiespark_cli.cli import main

        buffer = io.StringIO()
        with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(buffer):
            code = main(["template", "show", "definitely-not-a-template"])
        self.assertEqual(code, 1)


@unittest.skipUnless(PATHS.catalog_path.is_file(), "no catalog built yet")
class TestCatalogContract(unittest.TestCase):

    @classmethod
    def setUpClass(cls) -> None:
        cls.catalog = load_catalog(PATHS.catalog_path)

    def test_every_entry_has_a_valid_sha256(self) -> None:
        for entry in self.catalog.files:
            with self.subTest(path=entry.path):
                self.assertRegex(entry.sha256, r"^[a-f0-9]{64}$")

    def test_no_secret_entry_is_marked_extractable(self) -> None:
        for entry in self.catalog.by_category("SECRET"):
            with self.subTest(path=entry.path):
                self.assertFalse(entry.extractable)
                self.assertTrue(entry.permanently_denied)

    def test_summary_counts_match_the_file_list(self) -> None:
        self.assertEqual(self.catalog.summary["file_count"], len(self.catalog.files))
        self.assertEqual(
            self.catalog.summary["excluded_count"],
            sum(1 for f in self.catalog.files if not f.extractable),
        )
        self.assertEqual(
            self.catalog.summary["secret_count"],
            sum(1 for f in self.catalog.files if f.category == "SECRET"),
        )

    def test_search_matches_expectations(self) -> None:
        self.assertTrue(self.catalog.search("CREDENTIALS_QUICK_REFERENCE"))
        self.assertTrue(self.catalog.search("does-not-exist-anywhere") == [])


if __name__ == "__main__":  # pragma: no cover
    unittest.main()
