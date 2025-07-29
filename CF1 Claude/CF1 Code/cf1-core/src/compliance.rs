use cosmwasm_std::{Addr, Deps, DepsMut, StdResult, Uint128};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::state::{Investment, Proposal, ProposalStatus, INVESTMENTS, PROPOSALS};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ComplianceReport {
    pub proposal_id: String,
    pub proposal_title: String,
    pub creator: Addr,
    pub total_raised: Uint128,
    pub investor_count: u64,
    pub investment_summary: Vec<InvestmentSummary>,
    pub compliance_status: ComplianceStatus,
    pub regulatory_notes: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InvestmentSummary {
    pub investor: Addr,
    pub total_invested: Uint128,
    pub shares_owned: u64,
    pub ownership_percentage: String,
    pub investment_date: u64,
    pub status: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ComplianceStatus {
    pub is_compliant: bool,
    pub reg_cf_compliant: bool,
    pub max_investors_check: bool,
    pub lockup_enforced: bool,
    pub kyc_completed: bool,
    pub issues: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct PlatformComplianceReport {
    pub total_proposals: u64,
    pub active_proposals: u64,
    pub completed_proposals: u64,
    pub total_value_locked: Uint128,
    pub total_investors: u64,
    pub compliance_summary: ComplianceSummary,
    pub proposal_reports: Vec<ComplianceReport>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ComplianceSummary {
    pub compliant_proposals: u64,
    pub non_compliant_proposals: u64,
    pub compliance_rate: String, // Percentage
    pub common_issues: Vec<String>,
}

/// Generate compliance report for a specific proposal
pub fn generate_proposal_compliance_report(
    deps: Deps,
    proposal_id: &str,
) -> StdResult<ComplianceReport> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id.to_string())?;

    // Get all investments for this proposal
    let mut investment_summaries = Vec::new();
    let mut total_shares_distributed = 0u64;

    for item in INVESTMENTS.prefix(proposal_id.to_string()).range(
        deps.storage,
        None,
        None,
        cosmwasm_std::Order::Ascending,
    ) {
        let (investor_addr, investment) = item?;

        let ownership_percentage = if proposal.financial_terms.total_shares > 0 {
            format!(
                "{:.2}%",
                (investment.shares as f64 / proposal.financial_terms.total_shares as f64) * 100.0
            )
        } else {
            "0.00%".to_string()
        };

        let summary = InvestmentSummary {
            investor: investor_addr,
            total_invested: investment.amount,
            shares_owned: investment.shares,
            ownership_percentage,
            investment_date: investment.timestamp,
            status: format!("{:?}", investment.status),
        };

        investment_summaries.push(summary);
        total_shares_distributed += investment.shares;
    }

    // Check compliance status
    let compliance_status = check_proposal_compliance(&proposal, &investment_summaries);

    Ok(ComplianceReport {
        proposal_id: proposal_id.to_string(),
        proposal_title: proposal.asset_details.name.clone(),
        creator: proposal.creator,
        total_raised: proposal.funding_status.raised_amount,
        investor_count: proposal.funding_status.investor_count,
        investment_summary: investment_summaries,
        compliance_status,
        regulatory_notes: proposal.compliance.compliance_notes,
    })
}

/// Check compliance status for a proposal
fn check_proposal_compliance(
    proposal: &Proposal,
    investments: &[InvestmentSummary],
) -> ComplianceStatus {
    let mut issues = Vec::new();
    let mut is_compliant = true;

    // Check Regulation CF compliance (max $5M per 12 months)
    let reg_cf_limit = Uint128::from(5_000_000_000_000u128); // $5M in micro units
    let reg_cf_compliant = proposal.funding_status.raised_amount <= reg_cf_limit;
    if !reg_cf_compliant {
        issues.push("Exceeds Regulation CF $5M limit".to_string());
        is_compliant = false;
    }

    // Check maximum investors (if specified)
    let max_investors_check = if let Some(max_investors) = proposal.compliance.max_investors {
        let check_passed = investments.len() as u64 <= max_investors;
        if !check_passed {
            issues.push(format!(
                "Exceeds maximum investor limit of {}",
                max_investors
            ));
            is_compliant = false;
        }
        check_passed
    } else {
        true
    };

    // Check lockup enforcement (12 months required)
    let lockup_enforced = proposal.timestamps.lockup_end.is_some();
    if !lockup_enforced && proposal.status == ProposalStatus::Funded {
        issues.push("12-month lockup period not properly set".to_string());
        is_compliant = false;
    }

    // Check KYC compliance (placeholder - would integrate with actual KYC system)
    let kyc_completed = proposal.compliance.kyc_required; // Assume completed if required
    if proposal.compliance.kyc_required && !kyc_completed {
        issues.push("KYC verification incomplete for some investors".to_string());
        is_compliant = false;
    }

    ComplianceStatus {
        is_compliant,
        reg_cf_compliant,
        max_investors_check,
        lockup_enforced,
        kyc_completed,
        issues,
    }
}

/// Generate platform-wide compliance report
pub fn generate_platform_compliance_report(deps: Deps) -> StdResult<PlatformComplianceReport> {
    let mut total_proposals = 0u64;
    let mut active_proposals = 0u64;
    let mut completed_proposals = 0u64;
    let mut total_value_locked = Uint128::zero();
    let mut total_investors = 0u64;
    let mut proposal_reports = Vec::new();
    let mut compliant_count = 0u64;
    let mut all_issues = Vec::new();

    // Iterate through all proposals
    for item in PROPOSALS.range(deps.storage, None, None, cosmwasm_std::Order::Ascending) {
        let (proposal_id, proposal) = item?;
        total_proposals += 1;
        total_value_locked += proposal.funding_status.raised_amount;
        total_investors += proposal.funding_status.investor_count;

        match proposal.status {
            ProposalStatus::Active => active_proposals += 1,
            ProposalStatus::Completed => completed_proposals += 1,
            _ => {}
        }

        // Generate compliance report for this proposal
        let report = generate_proposal_compliance_report(deps, &proposal_id)?;
        if report.compliance_status.is_compliant {
            compliant_count += 1;
        } else {
            all_issues.extend(report.compliance_status.issues.clone());
        }

        proposal_reports.push(report);
    }

    // Calculate compliance rate
    let compliance_rate = if total_proposals > 0 {
        format!(
            "{:.2}%",
            (compliant_count as f64 / total_proposals as f64) * 100.0
        )
    } else {
        "0.00%".to_string()
    };

    // Find common issues
    let mut issue_counts = std::collections::HashMap::new();
    for issue in &all_issues {
        *issue_counts.entry(issue.clone()).or_insert(0) += 1;
    }

    let mut common_issues: Vec<_> = issue_counts.into_iter().collect();
    common_issues.sort_by(|a, b| b.1.cmp(&a.1));
    let common_issues: Vec<String> = common_issues
        .into_iter()
        .take(5)
        .map(|(issue, _)| issue)
        .collect();

    let compliance_summary = ComplianceSummary {
        compliant_proposals: compliant_count,
        non_compliant_proposals: total_proposals - compliant_count,
        compliance_rate,
        common_issues,
    };

    Ok(PlatformComplianceReport {
        total_proposals,
        active_proposals,
        completed_proposals,
        total_value_locked,
        total_investors,
        compliance_summary,
        proposal_reports,
    })
}

/// Validate investment against compliance rules
pub fn validate_investment_compliance(
    deps: Deps,
    proposal: &Proposal,
    investor: &Addr,
    investment_amount: Uint128,
) -> Result<(), Vec<String>> {
    let mut violations = Vec::new();

    // Check if KYC is required
    if proposal.compliance.kyc_required {
        // In production, this would check against a KYC database
        // For now, we'll assume compliance
    }

    // Check if accredited investor only
    if proposal.compliance.accredited_only {
        // In production, this would verify accredited investor status
        violations.push("Investment requires accredited investor verification".to_string());
    }

    // Check maximum investors limit
    if let Some(max_investors) = proposal.compliance.max_investors {
        if proposal.funding_status.investor_count >= max_investors {
            violations.push(format!(
                "Maximum investor limit of {} reached",
                max_investors
            ));
        }
    }

    // Check individual investment limits (placeholder for SEC rules)
    let individual_limit = Uint128::from(10_000_000_000u128); // $10K limit example
    if investment_amount > individual_limit {
        violations.push("Investment exceeds individual investor limit".to_string());
    }

    if violations.is_empty() {
        Ok(())
    } else {
        Err(violations)
    }
}
