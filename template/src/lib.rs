use scrypto::prelude::*;

#[derive(ScryptoSbor)]
pub struct PendingTip {
    pub tipper: ComponentAddress,
    pub creator: ComponentAddress,
    pub amount: Decimal,
    pub token: ResourceAddress,
}

#[blueprint]
mod tip_aggregator {
    struct TipAggregator {
        /// Pending tips waiting for batch execution
        pending_tips: Vec<PendingTip>,

        /// Collected tips grouped by token and creator
        tip_pools: HashMap<(ResourceAddress, ComponentAddress), Vault>,

        /// Minimum tips needed to execute batch
        min_batch_size: u32,
    }

    impl TipAggregator {
        /// Create new tip aggregator
        pub fn new(min_batch_size: u32) -> Global<TipAggregator> {
            Self {
                pending_tips: Vec::new(),
                tip_pools: HashMap::new(),
                min_batch_size,
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        /// Viewers/watchers send tips to a creator
        pub fn tip_creator(&mut self, tip_payment: Bucket, creator: ComponentAddress) {
            let tipper = Runtime::global_address();
            let token = tip_payment.resource_address();
            let amount = tip_payment.amount();

            // Store the tip in the pool grouped by creator and token
            let key = (token, creator);
            self.tip_pools
                .entry(key)
                .or_insert_with(|| Vault::new(token))
                .put(tip_payment);

            // Track the individual tip
            self.pending_tips.push(PendingTip {
                tipper,
                creator,
                amount,
                token,
            });

            info!(
                "Tip received: {:?} {:?} from {:?} to creator {:?}",
                amount, token, tipper, creator
            );

            // Auto-execute if we have enough tips
            if self.pending_tips.len() >= self.min_batch_size as usize {
                self.send_batched_tips();
            }
        }

        /// Send all batched tips to creators (almost gasless for creators)
        pub fn send_batched_tips(&mut self) {
            if self.pending_tips.is_empty() {
                return;
            }

            info!(
                "Sending batched tips to creators - {} total tips",
                self.pending_tips.len()
            );

            // Send all pooled tips to creators in batches
            for ((token, creator), mut vault) in self.tip_pools.drain() {
                let total_amount = vault.amount();
                if total_amount > Decimal::ZERO {
                    info!(
                        "Sending {:?} {:?} to creator {:?}",
                        total_amount, token, creator
                    );

                    // Take all tokens from vault and send to creator
                    let creator_payment = vault.take_all();

                    // Send the batched tips directly to the creator's account
                    let mut creator_account: Global<Account> = creator.into();
                    creator_account.deposit(creator_payment);

                    info!(
                        "Successfully sent {:?} {:?} to creator {:?}",
                        total_amount, token, creator
                    );
                }
            }

            // Clear pending tips
            self.pending_tips.clear();

            info!("Batch transfer to creators completed");
        }

        /// Get number of pending tips
        pub fn get_pending_count(&self) -> u32 {
            self.pending_tips.len() as u32
        }

        /// Get total amount pending for a specific creator
        pub fn get_pending_amount_for_creator(
            &self,
            creator: ComponentAddress,
            token: ResourceAddress,
        ) -> Decimal {
            self.tip_pools
                .get(&(token, creator))
                .map(|vault| vault.amount())
                .unwrap_or(Decimal::ZERO)
        }

        /// Manual batch execution (anyone can call to help creators get their tips)
        pub fn force_send_tips(&mut self) {
            self.send_batched_tips();
        }

        /// Get list of creators with pending tips
        pub fn get_creators_with_pending_tips(
            &self,
        ) -> Vec<(ComponentAddress, ResourceAddress, Decimal)> {
            self.tip_pools
                .iter()
                .map(|((token, creator), vault)| (*creator, *token, vault.amount()))
                .collect()
        }
    }
}
