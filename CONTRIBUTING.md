# Contributing to AutomaEyes

Pull requests are the only way changes reach AutomaEyes — see
[LICENSE](LICENSE): the source is available to read and run, but not to fork
and modify outside a PR reviewed by the Mavyware team.

## Before you start

For anything beyond a small fix, open an Issue first describing what you want
to change and why. It saves you writing a PR that gets rejected for reasons
that had nothing to do with the code — scope, direction, or something already
in progress.

Security issues do not belong in an Issue or a PR description. See
[SECURITY.md](SECURITY.md) and report them privately instead.

## Setting up

```bash
cd app
npm install
npm start
```

Requires **Node.js LTS** and **Python 3.12+**. Full details, including
building the installer, are in [README.md](README.md#running-from-source).

## Making a change

- Keep PRs focused. A bug fix should not carry drive-by refactors — review is
  faster and safer when the diff matches the description.
- Match the existing style of the file you're editing rather than introducing
  a new one.
- If you're touching behaviour a test already covers, run that test before
  opening the PR. If you're fixing something that broke silently and a test
  would have caught it, add one — see [`app/tests/README.md`](app/tests/README.md)
  for what's covered and why, and follow its existing pattern rather than
  introducing a test framework.

```bash
npm test              # everything
npm run test:sec      # input guards
npm run test:cls      # classification training + evaluation
npm run test:runtime  # classification inference
npm run test:annot    # annotation workspace
npm run test:nav      # page navigation with unsaved changes
```

## Opening the PR

Describe what changed and why, not just what. Link the Issue it addresses, if
there is one. A reviewer from the Mavyware team will look at it — expect
questions on anything that touches IPC, the `automaeye://` protocol, token
storage, or the output/execution paths, since those are the parts covered by
[SECURITY.md](SECURITY.md).

## Preparing a release

A version number is a promise that the installer can be used, not just that
the source tree compiles. Before a desktop release, update `app/package.json`
and `app/package-lock.json`, build the Windows installer, and test a clean
install through launch and one representative inspection or training path.

Publish the installer as a GitHub Release asset, then update the server's
`app-version.json` with its version, download URL, and short release notes.
That is what lets installed copies discover the update at startup.

## Contributors

- [Code8Byte](https://github.com/Code8Byte) — CEO, Mavyware
- [CodeVouz](https://github.com/CodeVouz) — Founder, AutomaEyes
- [Claude](https://github.com/claude) — AI Development Team, code changes and PR fixes
- [ChatGPT](https://github.com/openai) — AI Development Team, code changes and PR fixes
- [Gemini](https://github.com/gemini) — AI Development Team, CodeQL security audits, tier-1 adaptive baseline & addons, and Git conflict resolution with real-time progress
- [Dependabot](https://github.com/dependabot[bot]) — automated dependency updates and PR review
