# MELODIESPARK — PACKAGING & PUBLISHING REFERENCE

This document details how all components of Melodiespark are built, tested, packaged, and published across all major package ecosystems: **npm**, **pnpm**, **npx**, **pip**, **pipx**, and **Godot Engine**.

---

## 1. Node.js Ecosystem: npm, pnpm, npx

### Package Location
`C:\melodie\MelodiesparkCommandCenter` (`melodiespark@0.1.0`)

### Verification & Testing
```powershell
cd C:\melodie\MelodiesparkCommandCenter
npm test
```

### Packaging for npm Registry
```powershell
# Produces melodiespark-0.1.0.tgz
npm pack
```

### Packaging with pnpm
```powershell
pnpm pack
```

### Direct Execution with npx & pnpm dlx
The package defines `"bin": { "melodiespark": "./bin/melodiespark.mjs" }`.

```powershell
# From local package or published registry:
npx melodiespark status
npx melodiespark cycle 3
npx melodiespark guardians --tier arc_angel

# Via pnpm:
pnpm dlx melodiespark status
```

### Registry Publication
```powershell
# When publishing to npm registry:
npm publish --access public
```

---

## 2. Python Ecosystem: pip & pipx

### Package Location
`C:\melodie\melodiespark-py` (`melodiespark==0.1.0`)

### Building Wheel & Sdist
```powershell
cd C:\melodie\melodiespark-py
python -m build
```
Outputs in `dist/`:
- `melodiespark-0.1.0-py3-none-any.whl`
- `melodiespark-0.1.0.tar.gz`

### Local Installation via pip
```powershell
pip install -e C:\melodie\melodiespark-py
# OR install built wheel directly:
pip install C:\melodie\melodiespark-py\dist\melodiespark-0.1.0-py3-none-any.whl
```

### Installation via pipx (Isolated CLI Application)
```powershell
# Install wheel as global application:
python -m pipx install --force C:\melodie\melodiespark-py\dist\melodiespark-0.1.0-py3-none-any.whl

# Run directly:
melodiespark --help
melodiespark status
melodiespark telemetry --boss "The Cinder Warden" --damage 15000
```

### Temporary Isolated Run with pipx run
```powershell
python -m pipx run --spec C:\melodie\melodiespark-py\dist\melodiespark-0.1.0-py3-none-any.whl melodiespark status
```

### Publishing to PyPI
```powershell
python -m pip install twine
twine check dist/*
twine upload dist/*
```

---

## 3. Game Engine: Godot 4.x Headless Validation

### Projects:
- `C:\melodie\MelodiesparkCommandCenter\game`
- `C:\melodie\PathOfMelodie_15Act_ARPG`

### Headless Syntax & Class Cache Check:
```powershell
godot --headless --editor --quit --path C:\melodie\MelodiesparkCommandCenter\game
godot --headless --editor --quit --path C:\melodie\PathOfMelodie_15Act_ARPG
```

### Launch Playable Vertical Slice:
```powershell
godot --path C:\melodie\MelodiesparkCommandCenter\game
```
