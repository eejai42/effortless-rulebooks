#!/usr/bin/env python3
"""Job-minimum access profiles: what each role needs, and nothing else.

One entry per principal. Each table lists ONLY the fields that role needs to
do the job named in Roles.Responsibility. The test for including a field is
"would this role's work stall without it", not "might they find it mildly
interesting".

Where a role is NAMED on a table in the seed data (Steps.AssignedRole,
Exceptions.ApprovalRole, ...) that is direct evidence they work with it, and
those tables are always included. The reverse also holds: close-automation
appears nowhere except Steps, and its profile reflects that.

Deliberately excluded from every non-steward profile: the witness/diagnostic
columns (unwarranted_boundary_count, stale_binding_count,
undeclared_control_version_key, has_been_approached_by_software, ...). Those
exist so the process-steward can audit model health. A CFO approving a close
has no use for them, and their presence is what made all twelve roles look
identical.

`ALL` means every field on that table -- used only for small tables where the
whole row is the point (Exceptions has 11 fields and a CFO approving one wants
all of them).
"""

ALL = "*"

# Common shapes, so profiles stay readable and the intent is visible.
STEP_MINIMAL = ["StepId", "StepNumber", "Title", "StepKind", "Instruction",
                "AssignedRole", "AssignedRoleLabel", "ProcedureVersion", "Name"]
STEP_WITH_GATE = STEP_MINIMAL + ["IsApprovalStep", "RequiresHumanConfirmation",
                                 "ExpectedDurationMinutes"]
EXEC_MINIMAL = ["StepExecutionId", "Step", "ExecutionStatus", "StartedAt",
                "EndedAt", "VerificationResult", "Name"]
PROC_MINIMAL = ["ProcedureId", "Title", "Purpose", "Name"]
PV_MINIMAL = ["ProcedureVersionId", "VersionNumber", "Title", "Status",
              "IsCurrent", "Procedure", "Name"]

PROFILES = {

    # ---- Finance close ----------------------------------------------------
    "finance-analyst": {
        "why": "Preparer of reconciliations and variance evidence. Needs the "
               "steps assigned to them, what they recorded, and the "
               "requirements they must satisfy. Not governance, not comms.",
        "tables": {
            "Steps": STEP_WITH_GATE,
            "StepExecutions": EXEC_MINIMAL + ["Deviation", "ActualDurationMinutes",
                                              "IsLate"],
            "ProcedureExecutions": ["ProcedureExecutionId", "ExecutionStatus",
                                    "StartedAt", "EndedAt", "ProcedureVersion",
                                    "Name"],
            "Requirements": ["RequirementId", "Label", "RequirementType",
                             "Statement", "IsBlocking", "Name"],
            "RequirementSatisfactions": ["RequirementSatisfactionId", "Requirement",
                                         "SatisfactionLevel", "Evidence",
                                         "EvaluatedAt", "Name"],
            "Procedures": PROC_MINIMAL,
            "ProcedureVersions": PV_MINIMAL,
        },
    },

    "controller": {
        "why": "Owner of close controls and first approval authority. Needs "
               "the approval surface -- exceptions they approve, change "
               "requests they decide, the knowledge they own -- plus enough "
               "execution state to approve against.",
        "tables": {
            "Steps": STEP_WITH_GATE + ["ControlKind"],
            "StepExecutions": EXEC_MINIMAL + ["Deviation"],
            "ProcedureExecutions": ["ProcedureExecutionId", "ExecutionStatus",
                                    "StartedAt", "EndedAt", "ProcedureVersion",
                                    "Name"],
            "Exceptions": ALL,
            "ChangeRequests": ["ChangeRequestId", "Title", "ChangeKind", "Status",
                               "RequestedAt", "DecidedAt", "ImpactAssessment",
                               "AuthorityRole", "IsOpen", "Name"],
            "KnowledgeFragments": ["KnowledgeFragmentId", "Statement",
                                   "KnowledgeForm", "Status", "Confidence",
                                   "OwnerRole", "LastReviewedAt", "Name"],
            "Requirements": ["RequirementId", "Label", "Statement", "IsBlocking",
                             "AccountableRole", "Name"],
            "ProcedureVersions": PV_MINIMAL,
        },
    },

    "cfo": {
        "why": "Final authority for the financial close. Sees the decision "
               "surface only: what awaits approval, the boundaries on that "
               "authority, and the close's headline state. No preparation "
               "detail, no stewardship diagnostics.",
        "tables": {
            "ProcedureExecutions": ["ProcedureExecutionId", "ExecutionStatus",
                                    "StartedAt", "EndedAt", "ProcedureVersion",
                                    "Name"],
            "Exceptions": ALL,
            "ChangeRequests": ["ChangeRequestId", "Title", "ChangeKind", "Status",
                               "RequestedAt", "DecidedAt", "ImpactAssessment",
                               "IsOpen", "Name"],
            "AuthorityBoundaries": ["AuthorityBoundaryId", "ForbiddenAgentKind",
                                    "ForbiddenDecisionKind", "Status",
                                    "AuthorityRole", "Step", "Name"],
            "Procedures": PROC_MINIMAL,
        },
    },

    # ---- Automation / AI --------------------------------------------------
    "close-automation": {
        "why": "Deterministic extraction, posting and archival operator. A "
               "pipeline. It reads the steps it is assigned and writes what it "
               "did. It has no view of people, policy, or governance at all.",
        "tables": {
            "Steps": STEP_MINIMAL + ["ExpectedDurationMinutes"],
            "StepExecutions": EXEC_MINIMAL,
            "Errors": ALL,
        },
    },

    "variance-review-agent": {
        "why": "AI assistant that classifies and prioritises variances. Reads "
               "execution outcomes and the requirements that define a "
               "variance. No identities, no approvals.",
        "tables": {
            "Steps": STEP_MINIMAL,
            "StepExecutions": EXEC_MINIMAL + ["Deviation", "IsLate"],
            "Requirements": ["RequirementId", "Label", "RequirementType",
                             "Statement", "IsBlocking", "Name"],
            "RequirementSatisfactions": ["RequirementSatisfactionId", "Requirement",
                                         "SatisfactionLevel", "Evidence", "Name"],
            "Errors": ALL,
        },
    },

    "policy-drafting-agent": {
        "why": "AI assistant that drafts policy and channel variants. Reads "
               "the templates and policies it drafts against. It never sees "
               "recipients -- drafting does not require knowing who is "
               "addressed, and consent data is not its business.",
        "tables": {
            "MessageTemplates": ["MessageTemplateId", "SubjectTemplate",
                                 "BodyTemplate", "Locale", "Status", "Name"],
            "CommunicationPolicies": ["CommunicationPolicyId", "Channel",
                                      "AudienceRule", "MaxMessageLength",
                                      "MaxSegments", "RequiredContent",
                                      "AuthorityStatement", "Status", "Name"],
            "KnowledgeFragments": ["KnowledgeFragmentId", "Statement",
                                   "KnowledgeForm", "Status", "Name"],
            "Steps": STEP_MINIMAL,
        },
    },

    # ---- People / policy --------------------------------------------------
    "hr-policy-owner": {
        "why": "Accountable owner for employment policy content. Owns policy "
               "knowledge and the change requests that alter it. Sees the "
               "steps they are assigned, and the exceptions they approve.",
        "tables": {
            "Steps": STEP_WITH_GATE,
            "KnowledgeFragments": ["KnowledgeFragmentId", "Statement",
                                   "KnowledgeForm", "Status", "Confidence",
                                   "OwnerRole", "ValidFrom", "ValidTo",
                                   "LastReviewedAt", "Name"],
            "KnowledgeGaps": ["KnowledgeGapId", "Statement", "Severity",
                              "Status", "OwnerRole", "ResolutionPlan",
                              "IsOpen", "Name"],
            "ChangeRequests": ["ChangeRequestId", "Title", "ChangeKind", "Status",
                               "RequestedAt", "DecidedAt", "ImpactAssessment",
                               "AuthorityRole", "IsOpen", "Name"],
            "Exceptions": ALL,
            "MessageTemplates": ["MessageTemplateId", "SubjectTemplate",
                                 "BodyTemplate", "Status", "Name"],
        },
    },

    "employment-counsel": {
        "why": "Legal reviewer for workforce policy changes. Reads what is "
               "proposed and the boundaries that constrain it. Does not need "
               "execution telemetry or delivery data.",
        "tables": {
            "ChangeRequests": ["ChangeRequestId", "Title", "ChangeKind", "Status",
                               "RequestedAt", "DecidedAt", "ImpactAssessment",
                               "IsOpen", "Name"],
            "KnowledgeFragments": ["KnowledgeFragmentId", "Statement",
                                   "KnowledgeForm", "Status", "OwnerRole",
                                   "ValidFrom", "ValidTo", "Name"],
            "AuthorityBoundaries": ["AuthorityBoundaryId", "ForbiddenAgentKind",
                                    "ForbiddenDecisionKind", "Status",
                                    "AuthorityRole", "Name"],
            "CommunicationPolicies": ["CommunicationPolicyId", "Channel",
                                      "ConsentRequired", "RequiredContent",
                                      "AuthorityStatement", "RetentionDays",
                                      "Status", "Name"],
            "Steps": STEP_MINIMAL,
        },
    },

    # ---- Communications ---------------------------------------------------
    "communications-manager": {
        "why": "Human owner of employee communications. Approves what goes "
               "out and to whom, so this is the one non-admin role that sees "
               "recipients -- including consent state, which is the whole "
               "point of the approval.",
        "tables": {
            "CommunicationPolicies": ALL,
            "MessageTemplates": ["MessageTemplateId", "SubjectTemplate",
                                 "BodyTemplate", "Locale", "Status",
                                 "LastValidApproval", "Name"],
            "SendIntents": ["SendIntentId", "ProposedBody",
                            "ProposedSendAtLocalHour", "EvaluatedAt",
                            "MessageTemplate", "Recipient", "Name"],
            "MessageDeliveries": ["MessageDeliveryId", "RenderedBody", "SentAt",
                                  "DeliveryStatus", "SuppressionReason",
                                  "AcknowledgedAt", "Recipient", "Name"],
            "Recipients": ["RecipientId", "DisplayName", "EmailAddress",
                           "SmsConsentStatus", "SmsConsentAt", "Name"],
            "KnowledgeGaps": ["KnowledgeGapId", "Statement", "Severity",
                              "Status", "OwnerRole", "IsOpen", "Name"],
        },
    },

    "notification-publisher": {
        "why": "Pipeline that applies channel rules and sends approved "
               "messages. Needs the rules and the send queue. Sees a "
               "recipient's ADDRESS but not their consent history or display "
               "name -- it delivers, it does not decide.",
        "tables": {
            "CommunicationPolicies": ["CommunicationPolicyId", "Channel",
                                      "QuietHoursStartHour", "QuietHoursEndHour",
                                      "MaxMessageLength", "MaxSegments",
                                      "ConsentRequired", "Status", "Name"],
            "SendIntents": ["SendIntentId", "ProposedBody",
                            "ProposedSendAtLocalHour", "Recipient",
                            "MessageTemplate", "Name"],
            "MessageDeliveries": ["MessageDeliveryId", "RenderedBody", "SentAt",
                                  "DeliveryStatus", "SuppressionReason",
                                  "Recipient", "Name"],
            "Recipients": ["RecipientId", "EmailAddress", "MobileNumber",
                           "SmsConsentStatus", "Name"],
            "Steps": STEP_MINIMAL,
        },
    },

    # ---- Administrators ---------------------------------------------------
    # Full read is the job, not a shortcut. The diagnostics that were noise for
    # everyone else are the working surface here.
    "process-steward": {
        "why": "Maintains procedural knowledge health and review cadence. The "
               "stewardship diagnostics excluded everywhere else ARE this "
               "role's instrument panel, so it reads everything.",
        "admin": True,
    },

    "knowledge-authority": {
        "why": "Approves semantic changes that alter commitments or controls. "
               "Must be able to see anything a change could touch.",
        "admin": True,
    },
}
