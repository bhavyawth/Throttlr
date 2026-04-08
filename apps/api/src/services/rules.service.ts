// =============================================================================
// Service: Rules
//
// What goes here:
//  - Business logic for managing rate limit rules
//  - createRule(input: RuleCreateInput): Promise<Rule>
//  - getRuleById(id: string, apiKeyId: string): Promise<Rule | null>
//  - getRulesByApiKey(apiKeyId: string): Promise<Rule[]>
//  - updateRule(id: string, data: Partial<RuleCreateInput>): Promise<Rule>
//  - deleteRule(id: string, apiKeyId: string): Promise<void>
//  - Invalidate Redis cache on create/update/delete
//  - Cache: store rule config in Redis for fast lookups during /check
//    Key format: "rule:{ruleId}" TTL: 300s
// =============================================================================

// TODO: Import PrismaClient
// TODO: Import RedisService for cache invalidation

export const rulesService = {
  createRule: async (): Promise<void> => {
    // TODO: Implement
  },
  getRuleById: async (_id: string): Promise<null> => {
    // TODO: Implement
    return null;
  },
};
