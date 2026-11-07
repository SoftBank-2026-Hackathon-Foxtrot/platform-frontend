# Foxtrot frontend

This is an existing migration control-plane console. Operators register apps, review migration steps and approve transitions. React, shadcn, Geist and the inset sidebar define the visual style.

## Security dashboard scope

Preserve the handoff’s single-page composition: summary, app-to-data map, resource detail and review history. The current demo compares AWS and GCP object access for one server-configured application. It checks a selected AWS inline policy, required GCP app-bucket access and an extra grant on a separate empty demo bucket. DB and Redis remain visible as app context and are explicitly outside this check.

Use actual control-plane queries and commands. Only explicit local fixtures display example data; API failures never fall back to a success fixture. The sequence is scan, review change, apply, verify settings and app readiness, then enable this page’s migration link. Existing workflow execution and cutover authorization are unchanged. AI integration is deferred.

The page is `/security` inside the authenticated console. Do not claim complete IAM equivalence, compliance certification, data-access tests or server-enforced migration gates. Show the account, affected bucket, removed grant, retained app access and server history clearly.
