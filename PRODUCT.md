# Foxtrot frontend

This is an existing migration control-plane console, not a new brand. Operators register apps, review migration steps and approve transitions. The established React, shadcn, Geist and inset sidebar implementation is the visual authority.

## Security dashboard scope

The user requested a frontend-only implementation based on `SuperSon7/migration-security-dashboard-handoff` (main, `d8ae63a`). Preserve its single-page layout and rewrite vague or promotional copy. Use the platform's existing style. On-premises deployment uses Docker Compose and Ansible.

The dashboard should let an operator see which app-to-data connection loses a selected protection, inspect the source/target difference, review a proposed fix and understand the verification/approval sequence. Keep four resource types: app, database, Redis and object storage. This hackathon screen demonstrates a narrow Redis permission change, not comprehensive security management.

Current data, scans, configuration changes, verification and approvals are explicitly simulated. AI integration is deferred. Do not describe these examples as real findings, compliance certification, deployed configuration or an enforced migration gate.

The public page is `/security`, inside the authenticated console. This iteration uses one labelled example (`order-svc`); it does not select or inspect the user's real applications.
