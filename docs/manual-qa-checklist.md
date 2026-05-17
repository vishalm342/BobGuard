# Manual QA Test Matrix

Use this checklist before every deployment or recording. The same steps should be run in order so login, scan, summary, failure, and detail rendering are covered consistently.

## Test Data

- Valid sign-in email and password for the current environment
- A public vulnerable repository such as PyGoat
- A low-risk public repository such as `octocat/Hello-World`
- A local vulnerable folder path prepared on the tester machine
- An invalid repository URL such as `not-a-valid-url`
- An invalid local path such as `C:\does\not\exist`
- A slow-scan candidate such as a large repo or a throttled network session

## Checklist

| # | Flow | Steps | Expected result | Status |
| --- | --- | --- | --- | --- |
| 1 | Login success | Open Sign In, enter a valid email and password, then submit. | The form accepts the credentials, shows the loading state, and completes the sign-in flow without validation errors. | [ ] |
| 2 | Login validation failure | Submit an invalid email or leave the password empty. | Inline validation appears, the form does not proceed, and no authenticated state is shown. | [ ] |
| 3 | Remote happy path | From the dashboard, submit the PyGoat repository through the remote scan flow. | The scan runs through `/scan`, findings render, and the dashboard updates with the returned results. | [ ] |
| 4 | Local happy path | From the dashboard, submit a local vulnerable folder through the local scan flow. | The scan runs through `/scan-local`, findings render, and the dashboard updates with the returned results. | [ ] |
| 5 | Findings summary | After either happy-path scan, verify the summary cards and sidebar counts. | Total findings, severity groups, OWASP mappings, critical count, and notifications/report counts match the returned payload. | [ ] |
| 6 | Severity rendering | Inspect the returned findings list after a scan. | Each finding shows the expected severity badge and the severity group count reflects the unique severities present. | [ ] |
| 7 | OWASP mapping | Inspect the same findings list and summary cards. | Each finding shows the expected OWASP category and the OWASP mapping count reflects the unique categories present. | [ ] |
| 8 | Selected detail rendering | Click a finding in the vulnerabilities list. | The selected row is highlighted and the detail panel shows the same title, severity, file, line, OWASP context, and fix guidance. | [ ] |
| 9 | Slow scan behavior | Run a scan against a slow candidate or throttle the network while the request is in flight. | The UI stays responsive, loading feedback remains visible, and the final results replace the loading state when the scan completes. | [ ] |
| 10 | Error behavior | Submit an invalid repository URL or invalid local path. | The scan fails cleanly, an error state or retry action appears, and stale results are not overwritten by the failed request. | [ ] |
| 11 | Empty findings | Scan the low-risk repository. | The UI shows the empty state, total findings is zero, and no detail panel is forced open. | [ ] |
| 12 | Malformed input | Paste malformed repo/path input into either scan field and submit. | The app rejects the input or surfaces a clean failure without crashing or rendering broken state. | [ ] |

## Pass Criteria

- Login works for a valid email and password path, and invalid credentials are rejected cleanly.
- `/scan` and `/scan-local` both complete end to end against known test inputs.
- Findings count, severity groups, and OWASP mappings render consistently with the payload.
- Slow, error, empty, and malformed-input cases do not break the dashboard.
- Clicking any finding opens the matching detail content for review.

## Recording Notes

- Record the repository or folder used for each run.
- Note the returned finding count and the highest severity seen.
- Capture any mismatch between the list, the summary cards, and the selected detail panel.
- Re-run the same checklist before deployment after any scan payload or dashboard rendering change.