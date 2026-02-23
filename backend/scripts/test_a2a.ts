import { A2AService } from '../src/a2a/a2a.service';
import { config } from '../src/config';

/**
 * Orchestrator A2A Demo Script
 * 
 * Verifies that the Orchestrator can instantiate its own UserSigner, 
 * communicate with a target agent (e.g., Content Machine),
 * and successfully receive a Bearer token by signing a nonce.
 */
async function testA2A() {
    console.log(`\n======================================`);
    console.log(`🤖 Orchestrator A2A Auth Integration`);
    console.log(`======================================\n`);

    const agentApiUrl = process.env.AGENT_URL || 'http://localhost:4000/api';
    console.log(`[Config] Target Agent API: ${agentApiUrl}`);

    const a2aClient = new A2AService();
    await a2aClient.initialize();

    console.log(`\n[Execution] 1. Requesting Nonce & Exchanging Signature for Bearer Token...`);
    try {
        const token = await a2aClient.getAuthToken(agentApiUrl);
        console.log(`   ✅ Success! Orchestrator retrieved Bearer token: ${token.substring(0, 32)}...`);

        console.log(`\n[Execution] 2. Testing Authenticated Request to Agent (/user/profile)...`);
        const profileRes = await a2aClient.authenticatedRequest(agentApiUrl, '/user/profile');
        const profileData = await profileRes.json();

        console.log(`   Agent Response Data:`);
        console.log(`   ${JSON.stringify(profileData, null, 2)}`);

        console.log(`\n🎉 The Orchestrator can now securely dispatch jobs to agents!`);
    } catch (error: any) {
        console.error(`\n❌ Failed A2A process:`, error.message);
        console.log(`\nFix: Make sure your target agent (e.g. Content Machine) is running on ${agentApiUrl}`);
    }
}

testA2A().catch(console.error);
