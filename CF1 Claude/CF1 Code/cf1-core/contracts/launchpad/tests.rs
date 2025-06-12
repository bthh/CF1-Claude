#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_json, Addr, Uint128};
    use cw_multi_test::{App, AppBuilder, Contract, ContractWrapper, Executor};

    use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
    use crate::state::{AssetDetails, FinancialTerms, Document, ComplianceInfo};

    // Test contract wrapper
    fn contract_launchpad() -> Box<dyn Contract<cosmwasm_std::Empty>> {
        let contract = ContractWrapper::new(
            crate::execute,
            crate::instantiate,
            crate::query,
        ).with_reply(crate::reply);
        Box::new(contract)
    }

    // Test helper functions
    fn mock_app() -> App {
        AppBuilder::new().build(|router, _, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &Addr::unchecked("user"),
                    coins(1_000_000_000, "untrn"),
                )
                .unwrap();
            router
                .bank
                .init_balance(
                    storage,
                    &Addr::unchecked("creator"),
                    coins(1_000_000_000, "untrn"),
                )
                .unwrap();
        })
    }

    fn proper_instantiate() -> (App, u64) {
        let mut app = mock_app();
        let cw20_id = app.store_code(contract_launchpad());
        let launchpad_id = app.store_code(contract_launchpad());

        let msg = InstantiateMsg {
            admin: None,
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
                None,
            )
            .unwrap();

        (app, launchpad_id)
    }

    fn create_test_proposal() -> (AssetDetails, FinancialTerms, Vec<Document>, ComplianceInfo) {
        let asset_details = AssetDetails {
            name: "Test Real Estate".to_string(),
            asset_type: "Commercial Real Estate".to_string(),
            category: "Real Estate".to_string(),
            location: "Seattle, WA".to_string(),
            description: "Premium office building".to_string(),
            full_description: "A premium office building in downtown Seattle with excellent rental yield potential.".to_string(),
            risk_factors: vec!["Market volatility".to_string(), "Interest rate changes".to_string()],
            highlights: vec!["Prime location".to_string(), "Stable tenants".to_string()],
        };

        let current_time = 1640995200u64; // Mock timestamp
        let financial_terms = FinancialTerms {
            target_amount: Uint128::from(1_000_000_000_000u128), // $1M in micro units
            token_price: Uint128::from(100_000_000u128), // $100 in micro units
            total_shares: 10_000u64,
            minimum_investment: Uint128::from(500_000_000u128), // $500 in micro units
            expected_apy: "8.5%".to_string(),
            funding_deadline: current_time + (30 * 24 * 60 * 60), // 30 days from now
        };

        let documents = vec![
            Document {
                name: "Business Plan".to_string(),
                doc_type: "PDF".to_string(),
                size: "2.5MB".to_string(),
                hash: Some("QmTest123".to_string()),
            },
        ];

        let compliance = ComplianceInfo {
            kyc_required: true,
            accredited_only: false,
            max_investors: Some(500),
            compliance_notes: vec!["SEC Regulation CF compliant".to_string()],
        };

        (asset_details, financial_terms, documents, compliance)
    }

    #[test]
    fn test_instantiate() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info("admin", &[]);

        let msg = InstantiateMsg {
            admin: None,
            platform_fee_bps: Some(250),
        };

        let res = instantiate(deps.as_mut(), env, info, msg).unwrap();
        assert_eq!(res.attributes.len(), 2);
        assert_eq!(res.attributes[0].key, "method");
        assert_eq!(res.attributes[0].value, "instantiate");
    }

    #[test]
    fn test_create_proposal() {
        let (mut app, launchpad_id) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();

        let msg = ExecuteMsg::CreateProposal {
            asset_details,
            financial_terms,
            documents,
            compliance,
        };

        let res = app
            .execute_contract(
                Addr::unchecked("creator"),
                launchpad_addr.clone(),
                &msg,
                &[],
            )
            .unwrap();

        assert!(res.events.iter().any(|e| e.attributes.iter().any(|a| a.key == "method" && a.value == "create_proposal")));
        assert!(res.events.iter().any(|e| e.attributes.iter().any(|a| a.key == "proposal_id" && a.value == "proposal_1")));
    }

    #[test]
    fn test_query_proposal() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create a proposal first
        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();
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

        // Query the proposal
        let query_msg = QueryMsg::Proposal {
            proposal_id: "proposal_1".to_string(),
        };

        let res: crate::msg::ProposalResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &query_msg)
            .unwrap();

        assert_eq!(res.proposal.id, "proposal_1");
        assert_eq!(res.proposal.asset_details.name, "Test Real Estate");
        assert_eq!(res.proposal.creator, Addr::unchecked("creator"));
    }

    #[test]
    fn test_invest_in_proposal() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create a proposal first
        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();
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

        // Invest in the proposal
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        let investment_amount = coins(1_000_000_000, "untrn"); // $1000 investment

        let res = app
            .execute_contract(
                Addr::unchecked("user"),
                launchpad_addr.clone(),
                &invest_msg,
                &investment_amount,
            )
            .unwrap();

        assert!(res.events.iter().any(|e| e.attributes.iter().any(|a| a.key == "method" && a.value == "invest")));
        assert!(res.events.iter().any(|e| e.attributes.iter().any(|a| a.key == "amount" && a.value == "1000000000")));
    }

    #[test]
    fn test_funding_completion() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create a proposal
        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();
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

        // Invest the full target amount
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        let full_investment = coins(1_000_000_000_000, "untrn"); // Full $1M target

        let res = app
            .execute_contract(
                Addr::unchecked("user"),
                launchpad_addr.clone(),
                &invest_msg,
                &full_investment,
            )
            .unwrap();

        // Check that funding was completed
        assert!(res.events.iter().any(|e| e.attributes.iter().any(|a| a.key == "funding_completed" && a.value == "true")));
    }

    #[test]
    fn test_investment_below_minimum() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create a proposal
        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();
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

        // Try to invest below minimum
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        let low_investment = coins(100_000_000, "untrn"); // $100, below $500 minimum

        let err = app
            .execute_contract(
                Addr::unchecked("user"),
                launchpad_addr.clone(),
                &invest_msg,
                &low_investment,
            )
            .unwrap_err();

        assert!(err.to_string().contains("Investment amount below minimum"));
    }

    #[test]
    fn test_invalid_funding_period() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        let (mut asset_details, mut financial_terms, documents, compliance) = create_test_proposal();
        
        // Set funding deadline too short (less than 7 days)
        financial_terms.funding_deadline = 1640995200u64 + (5 * 24 * 60 * 60); // 5 days

        let create_msg = ExecuteMsg::CreateProposal {
            asset_details,
            financial_terms,
            documents,
            compliance,
        };

        let err = app
            .execute_contract(
                Addr::unchecked("creator"),
                launchpad_addr.clone(),
                &create_msg,
                &[],
            )
            .unwrap_err();

        assert!(err.to_string().contains("Funding period too short"));
    }

    #[test]
    fn test_update_proposal() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create a proposal first
        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();
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

        // Update the proposal
        let mut updated_asset_details = asset_details.clone();
        updated_asset_details.description = "Updated description".to_string();

        let update_msg = ExecuteMsg::UpdateProposal {
            proposal_id: "proposal_1".to_string(),
            asset_details: Some(updated_asset_details),
            documents: None,
        };

        let res = app
            .execute_contract(
                Addr::unchecked("creator"),
                launchpad_addr.clone(),
                &update_msg,
                &[],
            )
            .unwrap();

        assert!(res.events.iter().any(|e| e.attributes.iter().any(|a| a.key == "method" && a.value == "update_proposal")));

        // Verify the update
        let query_msg = QueryMsg::Proposal {
            proposal_id: "proposal_1".to_string(),
        };

        let res: crate::msg::ProposalResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &query_msg)
            .unwrap();

        assert_eq!(res.proposal.asset_details.description, "Updated description");
    }

    #[test]
    fn test_unauthorized_update() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create a proposal first
        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();
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

        // Try to update as non-creator
        let update_msg = ExecuteMsg::UpdateProposal {
            proposal_id: "proposal_1".to_string(),
            asset_details: None,
            documents: None,
        };

        let err = app
            .execute_contract(
                Addr::unchecked("user"),
                launchpad_addr.clone(),
                &update_msg,
                &[],
            )
            .unwrap_err();

        assert!(err.to_string().contains("Unauthorized"));
    }

    #[test]
    fn test_query_proposals_by_creator() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create multiple proposals
        for i in 0..3 {
            let (mut asset_details, financial_terms, documents, compliance) = create_test_proposal();
            asset_details.name = format!("Test Proposal {}", i);

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

        // Query proposals by creator
        let query_msg = QueryMsg::ProposalsByCreator {
            creator: "creator".to_string(),
            start_after: None,
            limit: None,
        };

        let res: crate::msg::ProposalsResponse = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &query_msg)
            .unwrap();

        assert_eq!(res.proposals.len(), 3);
        assert_eq!(res.total_count, 3);
    }

    #[test]
    fn test_platform_stats() {
        let (mut app, _) = proper_instantiate();
        let launchpad_addr = Addr::unchecked("contract0");

        // Create and fund a proposal
        let (asset_details, financial_terms, documents, compliance) = create_test_proposal();
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

        // Invest in the proposal
        let invest_msg = ExecuteMsg::Invest {
            proposal_id: "proposal_1".to_string(),
        };

        app.execute_contract(
            Addr::unchecked("user"),
            launchpad_addr.clone(),
            &invest_msg,
            &coins(500_000_000_000, "untrn"),
        ).unwrap();

        // Query platform stats
        let query_msg = QueryMsg::PlatformStats {};

        let res: crate::msg::PlatformStats = app
            .wrap()
            .query_wasm_smart(launchpad_addr, &query_msg)
            .unwrap();

        assert_eq!(res.total_proposals, 1);
        assert_eq!(res.active_proposals, 1);
        assert_eq!(res.total_raised, Uint128::from(500_000_000_000u128));
        assert_eq!(res.total_investors, 1);
    }
}