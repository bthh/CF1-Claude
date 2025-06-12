#[cfg(test)]
mod integration_tests {
    use super::*;
    use cosmwasm_std::{coins, Addr, Uint128};
    use cw_multi_test::{App, AppBuilder, Contract, ContractWrapper, Executor};

    use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
    use crate::state::{AssetDetails, FinancialTerms, Document, ComplianceInfo, ProposalStatus};

    fn contract_launchpad() -> Box<dyn Contract<cosmwasm_std::Empty>> {
        let contract = ContractWrapper::new(
            crate::execute,
            crate::instantiate,
            crate::query,
        ).with_reply(crate::reply);
        Box::new(contract)
    }

    fn mock_app() -> App {
        AppBuilder::new().build(|router, _, storage| {
            // Fund multiple users for testing
            router.bank.init_balance(storage, &Addr::unchecked("creator"), coins(10_000_000_000_000, "untrn")).unwrap();
            router.bank.init_balance(storage, &Addr::unchecked("investor1"), coins(10_000_000_000_000, "untrn")).unwrap();
            router.bank.init_balance(storage, &Addr::unchecked("investor2"), coins(10_000_000_000_000, "untrn")).unwrap();
            router.bank.init_balance(storage, &Addr::unchecked("investor3"), coins(10_000_000_000_000, "untrn")).unwrap();
            router.bank.init_balance(storage, &Addr::unchecked("admin"), coins(10_000_000_000_000, "untrn")).unwrap();
        })
    }

    fn setup_contract() -> (App, Addr) {
        let mut app = mock_app();
        let cw20_id = app.store_code(contract_launchpad()); // Using same for simplicity in tests
        let launchpad_id = app.store_code(contract_launchpad());

        let msg = InstantiateMsg {
            admin: Some("admin".to_string()),
            platform_fee_bps: Some(250), // 2.5%
            cw20_code_id: cw20_id,
        };

        let launchpad_addr = app
            .instantiate_contract(
                launchpad_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "CF1-Launchpad",
                Some("admin".to_string()),
            )
            .unwrap();

        (app, launchpad_addr)
    }

    fn create_sample_proposal() -> (AssetDetails, FinancialTerms, Vec<Document>, ComplianceInfo) {
        let asset_details = AssetDetails {
            name: "Downtown Seattle Office".to_string(),
            asset_type: "Commercial Real Estate".to_string(),
            category: "Real Estate".to_string(),
            location: "Seattle, WA".to_string(),
            description: "Premium Class A office building".to_string(),
            full_description: "A premium Class A office building located in the heart of downtown Seattle's business district.".to_string(),
            risk_factors: vec![
                "Market volatility".to_string(),
                "Interest rate changes".to_string(),
                "Tenant vacancy risk".to_string(),
            ],
            highlights: vec![
                "Prime downtown location".to_string(),
                "Long-term tenants".to_string(),
                "Recent renovations".to_string(),
            ],
        };

        let current_time = 1640995200u64;
        let financial_terms = FinancialTerms {
            target_amount: Uint128::from(5_000_000_000_000u128), // $5M target
            token_price: Uint128::from(1_000_000_000u128), // $1000 per token
            total_shares: 5_000u64,
            minimum_investment: Uint128::from(1_000_000_000u128), // $1000 minimum
            expected_apy: "12.5%".to_string(),
            funding_deadline: current_time + (60 * 24 * 60 * 60), // 60 days
        };

        let documents = vec![
            Document {
                name: "Business Plan".to_string(),
                doc_type: "PDF".to_string(),
                size: "3.2MB".to_string(),
                hash: Some("QmBusinessPlan123".to_string()),
            },
            Document {
                name: "Financial Projections".to_string(),
                doc_type: "Excel".to_string(),
                size: "1.1MB".to_string(),
                hash: Some("QmFinancials456".to_string()),
            },
            Document {
                name: "Property Appraisal".to_string(),
                doc_type: "PDF".to_string(),
                size: "5.8MB".to_string(),
                hash: Some("QmAppraisal789".to_string()),
            },
        ];

        let compliance = ComplianceInfo {
            kyc_required: true,
            accredited_only: false,
            max_investors: Some(2000),
            compliance_notes: vec![
                "SEC Regulation CF compliant".to_string(),
                "State securities law compliant".to_string(),
            ],
        };

        (asset_details, financial_terms, documents, compliance)
    }

    #[test]
    fn test_complete_investment_lifecycle() {
        let (mut app, launchpad_addr) = setup_contract();

        // Step 1: Creator creates a proposal
        let (asset_details, financial_terms, documents, compliance) = create_sample_proposal();
        let create_msg = ExecuteMsg::CreateProposal {
            asset_details,
            financial_terms,
            documents,
            compliance,
        };

        let create_res = app
            .execute_contract(
                Addr::unchecked("creator"),
                launchpad_addr.clone(),
                &create_msg,
                &[],
            )
            .unwrap();

        // Verify proposal creation
        assert!(create_res.events.iter().any(|e| 
            e.attributes.iter().any(|a| a.key == "proposal_id" && a.value == "proposal_1")
        ));

        // Step 2: Multiple investors invest
        let investments = vec![
            ("investor1", 1_000_000_000_000u128), // $1000
            ("investor2", 2_000_000_000_000u128), // $2000  
            ("investor3", 1_500_000_000_000u128), // $1500
        ];

        for (investor, amount) in investments {
            let invest_msg = ExecuteMsg::Invest {
                proposal_id: "proposal_1".to_string(),
            };

            let invest_res = app
                .execute_contract(
                    Addr::unchecked(investor),
                    launchpad_addr.clone(),
                    &invest_msg,
                    &coins(amount, "untrn"),
                )
                .unwrap();

            assert!(invest_res.events.iter().any(|e| 
                e.attributes.iter().any(|a| a.key == "method" && a.value == "invest")
            ));
        }

        // Step 3: Check proposal status (should still be active, not fully funded)
        let query_msg = QueryMsg::Proposal {
            proposal_id: "proposal_1".to_string(),
        };

        let proposal_res: crate::msg::ProposalResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr.clone(), &query_msg)
            .unwrap();

        assert_eq!(proposal_res.proposal.status, ProposalStatus::Active);
        assert_eq!(proposal_res.proposal.funding_status.raised_amount, Uint128::from(4_500_000_000_000u128));
        assert_eq!(proposal_res.proposal.funding_status.investor_count, 3);
        assert!(!proposal_res.proposal.funding_status.is_funded);

        // Step 4: Complete funding with final investor
        let final_investment = 500_000_000_000u128; // $500 to reach $5M target
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        let final_invest_res = app
            .execute_contract(
                Addr::unchecked("investor1"), // investor1 invests again
                launchpad_addr.clone(),
                &invest_msg,
                &coins(final_investment, "untrn"),
            )
            .unwrap();

        // Verify funding completion
        assert!(final_invest_res.events.iter().any(|e| 
            e.attributes.iter().any(|a| a.key == "funding_completed" && a.value == "true")
        ));

        // Step 5: Check final proposal status
        let final_proposal_res: crate::msg::ProposalResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr.clone(), &query_msg)
            .unwrap();

        assert_eq!(final_proposal_res.proposal.status, ProposalStatus::Funded);
        assert!(final_proposal_res.proposal.funding_status.is_funded);
        assert_eq!(final_proposal_res.proposal.funding_status.raised_amount, Uint128::from(5_000_000_000_000u128));
        assert!(final_proposal_res.proposal.timestamps.lockup_end.is_some());

        // Step 6: Query user investments
        let user_investment_query = QueryMsg::InvestmentsByUser {
            user: "investor1".to_string(),
            start_after: None,
            limit: None,
        };

        let user_investments: crate::msg::InvestmentsResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr.clone(), &user_investment_query)
            .unwrap();

        assert_eq!(user_investments.investments.len(), 1);
        assert_eq!(user_investments.total_invested, Uint128::from(1_500_000_000_000u128)); // $1000 + $500

        // Step 7: Test platform statistics
        let platform_stats_query = QueryMsg::PlatformStats {};
        let platform_stats: crate::msg::PlatformStats = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &platform_stats_query)
            .unwrap();

        assert_eq!(platform_stats.total_proposals, 1);
        assert_eq!(platform_stats.active_proposals, 0); // Now funded, not active
        assert_eq!(platform_stats.total_raised, Uint128::from(5_000_000_000_000u128));
        assert_eq!(platform_stats.total_investors, 3); // Unique investors
        assert_eq!(platform_stats.successful_proposals, 0); // Not completed yet, just funded
    }

    #[test]
    fn test_proposal_failure_and_refunds() {
        let (mut app, launchpad_addr) = setup_contract();

        // Create a proposal with short deadline
        let (asset_details, mut financial_terms, documents, compliance) = create_sample_proposal();
        financial_terms.funding_deadline = 1640995200u64 + (10 * 24 * 60 * 60); // 10 days
        
        let create_msg = ExecuteMsg::CreateProposal {
            asset_details,
            financial_terms,
            documents,
            compliance,
        };

        app.execute_contract(
            Addr::unchecked("creator"),
            launchpad_addr.clone(),
            &create_msg,
            &[],
        ).unwrap();

        // Partial investments (not reaching goal)
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &invest_msg,
            &coins(1_000_000_000_000, "untrn"), // Only $1000 of $5M target
        ).unwrap();

        app.execute_contract(
            Addr::unchecked("investor2"),
            launchpad_addr.clone(),
            &invest_msg,
            &coins(500_000_000_000, "untrn"), // $500 more
        ).unwrap();

        // Simulate time passing beyond deadline by processing expired proposals
        let process_expired_msg = ExecuteMsg::ProcessExpiredProposals {};
        
        app.execute_contract(
            Addr::unchecked("admin"),
            launchpad_addr.clone(),
            &process_expired_msg,
            &[],
        ).unwrap();

        // Manually trigger refunds
        let refund_msg = ExecuteMsg::RefundInvestors {
            proposal_id: "proposal_1".to_string(),
        };

        let refund_res = app.execute_contract(
            Addr::unchecked("admin"),
            launchpad_addr.clone(),
            &refund_msg,
            &[],
        ).unwrap();

        // Verify refund attributes
        assert!(refund_res.events.iter().any(|e| 
            e.attributes.iter().any(|a| a.key == "method" && a.value == "refund_investors")
        ));
        assert!(refund_res.events.iter().any(|e| 
            e.attributes.iter().any(|a| a.key == "total_refunded" && a.value == "1500000000000")
        ));

        // Check proposal status
        let query_msg = QueryMsg::Proposal {
            proposal_id: "proposal_1".to_string(),
        };

        let proposal_res: crate::msg::ProposalResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &query_msg)
            .unwrap();

        assert_eq!(proposal_res.proposal.status, ProposalStatus::Failed);
        assert_eq!(proposal_res.proposal.funding_status.raised_amount, Uint128::zero());
    }

    #[test]
    fn test_proposal_updates_and_permissions() {
        let (mut app, launchpad_addr) = setup_contract();

        // Create initial proposal
        let (asset_details, financial_terms, documents, compliance) = create_sample_proposal();
        let create_msg = ExecuteMsg::CreateProposal {
            asset_details,
            financial_terms,
            documents,
            compliance,
        };

        app.execute_contract(
            Addr::unchecked("creator"),
            launchpad_addr.clone(),
            &create_msg,
            &[],
        ).unwrap();

        // Test successful update by creator
        let mut updated_asset_details = create_sample_proposal().0;
        updated_asset_details.description = "Updated premium office building".to_string();
        updated_asset_details.highlights.push("New HVAC system".to_string());

        let update_msg = ExecuteMsg::UpdateProposal {
            proposal_id: "proposal_1".to_string(),
            asset_details: Some(updated_asset_details.clone()),
            documents: None,
        };

        let update_res = app.execute_contract(
            Addr::unchecked("creator"),
            launchpad_addr.clone(),
            &update_msg,
            &[],
        ).unwrap();

        assert!(update_res.events.iter().any(|e| 
            e.attributes.iter().any(|a| a.key == "method" && a.value == "update_proposal")
        ));

        // Verify update was applied
        let query_msg = QueryMsg::Proposal {
            proposal_id: "proposal_1".to_string(),
        };

        let updated_proposal: crate::msg::ProposalResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr.clone(), &query_msg)
            .unwrap();

        assert_eq!(updated_proposal.proposal.asset_details.description, "Updated premium office building");
        assert_eq!(updated_proposal.proposal.asset_details.highlights.len(), 4); // 3 original + 1 new

        // Test unauthorized update attempt
        let unauthorized_update = ExecuteMsg::UpdateProposal {
            proposal_id: "proposal_1".to_string(),
            asset_details: Some(updated_asset_details),
            documents: None,
        };

        let unauthorized_err = app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &unauthorized_update,
            &[],
        ).unwrap_err();

        assert!(unauthorized_err.to_string().contains("Unauthorized"));

        // Test proposal cancellation by creator
        let cancel_msg = ExecuteMsg::CancelProposal {
            proposal_id: "proposal_1".to_string(),
        };

        let cancel_res = app.execute_contract(
            Addr::unchecked("creator"),
            launchpad_addr.clone(),
            &cancel_msg,
            &[],
        ).unwrap();

        assert!(cancel_res.events.iter().any(|e| 
            e.attributes.iter().any(|a| a.key == "method" && a.value == "cancel_proposal")
        ));

        // Verify cancellation
        let cancelled_proposal: crate::msg::ProposalResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &query_msg)
            .unwrap();

        assert_eq!(cancelled_proposal.proposal.status, ProposalStatus::Cancelled);
    }

    #[test]
    fn test_creator_stats_and_portfolio() {
        let (mut app, launchpad_addr) = setup_contract();

        // Create multiple proposals by same creator
        for i in 0..3 {
            let (mut asset_details, financial_terms, documents, compliance) = create_sample_proposal();
            asset_details.name = format!("Property {}", i + 1);

            let create_msg = ExecuteMsg::CreateProposal {
                asset_details,
                financial_terms,
                documents,
                compliance,
            };

            app.execute_contract(
                Addr::unchecked("creator"),
                launchpad_addr.clone(),
                &create_msg,
                &[],
            ).unwrap();
        }

        // Fund one proposal completely
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &invest_msg,
            &coins(5_000_000_000_000, "untrn"), // Full $5M
        ).unwrap();

        // Query creator stats
        let creator_query = QueryMsg::Creator {
            creator: "creator".to_string(),
        };

        let creator_res: crate::msg::CreatorResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr.clone(), &creator_query)
            .unwrap();

        assert_eq!(creator_res.creator.total_proposals, 3);
        assert_eq!(creator_res.creator.successful_proposals, 1);
        assert_eq!(creator_res.creator.total_raised, Uint128::from(5_000_000_000_000u128));

        // Query proposals by creator
        let creator_proposals_query = QueryMsg::ProposalsByCreator {
            creator: "creator".to_string(),
            start_after: None,
            limit: None,
        };

        let creator_proposals: crate::msg::ProposalsResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &creator_proposals_query)
            .unwrap();

        assert_eq!(creator_proposals.proposals.len(), 3);
        assert_eq!(creator_proposals.total_count, 3);

        // Check that one is funded and two are active
        let funded_count = creator_proposals.proposals.iter()
            .filter(|p| p.proposal.status == ProposalStatus::Funded)
            .count();
        let active_count = creator_proposals.proposals.iter()
            .filter(|p| p.proposal.status == ProposalStatus::Active)
            .count();

        assert_eq!(funded_count, 1);
        assert_eq!(active_count, 2);
    }

    #[test]
    fn test_investment_edge_cases() {
        let (mut app, launchpad_addr) = setup_contract();

        let (asset_details, financial_terms, documents, compliance) = create_sample_proposal();
        let create_msg = ExecuteMsg::CreateProposal {
            asset_details,
            financial_terms,
            documents,
            compliance,
        };

        app.execute_contract(
            Addr::unchecked("creator"),
            launchpad_addr.clone(),
            &create_msg,
            &[],
        ).unwrap();

        // Test investment with no funds
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        let no_funds_err = app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &invest_msg,
            &[], // No funds
        ).unwrap_err();

        assert!(no_funds_err.to_string().contains("Insufficient funds"));

        // Test investment below minimum
        let below_min_err = app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &invest_msg,
            &coins(500_000_000, "untrn"), // $500, below $1000 minimum
        ).unwrap_err();

        assert!(below_min_err.to_string().contains("Investment amount below minimum"));

        // Test multiple investments by same user (should accumulate)
        app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &invest_msg,
            &coins(1_000_000_000_000, "untrn"), // $1000
        ).unwrap();

        app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &invest_msg,
            &coins(2_000_000_000_000, "untrn"), // Another $2000
        ).unwrap();

        // Check accumulated investment
        let investment_query = QueryMsg::Investment {
            proposal_id: "proposal_1".to_string(),
            investor: "investor1".to_string(),
        };

        let investment_res: crate::msg::InvestmentResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr.clone(), &investment_query)
            .unwrap();

        assert_eq!(investment_res.investment.amount, Uint128::from(3_000_000_000_000u128));
        assert_eq!(investment_res.investment.shares, 3); // $3000 / $1000 per share

        // Test investment in non-existent proposal
        let invalid_proposal_err = app.execute_contract(
            Addr::unchecked("investor1"),
            launchpad_addr.clone(),
            &ExecuteMsg::Invest {
                proposal_id: "proposal_999".to_string(),
            },
            &coins(1_000_000_000_000, "untrn"),
        ).unwrap_err();

        assert!(invalid_proposal_err.to_string().contains("not found"));
    }
}