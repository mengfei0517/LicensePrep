/**
 * Chrome AI Diagnostic Script
 * Run this in browser console to diagnose Gemini Nano issues
 */

async function diagnoseChromeAI() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 CHROME AI DIAGNOSTIC REPORT');
    console.log('='.repeat(60) + '\n');
    
    // Check 1: Basic availability
    console.log('📋 CHECK 1: Basic API Availability');
    console.log('   window.ai:', window.ai ? '✅ EXISTS' : '❌ UNDEFINED');
    
    if (!window.ai) {
        console.log('\n❌ CRITICAL: window.ai is undefined');
        console.log('\n🔧 SOLUTION:');
        console.log('   1. Confirm you are using Chrome Dev/Canary (not stable)');
        console.log('   2. Enable: chrome://flags/#prompt-api-for-gemini-nano');
        console.log('   3. Enable: chrome://flags/#optimization-guide-on-device-model');
        console.log('   4. Set to: Enabled BypassPerfRequirement');
        console.log('   5. Restart Chrome COMPLETELY (close all windows)');
        console.log('   6. Wait 2 minutes after restart');
        return;
    }
    
    console.log('   window.ai.languageModel:', window.ai.languageModel ? '✅ EXISTS' : '❌ UNDEFINED');
    
    if (!window.ai.languageModel) {
        console.log('\n⚠️ window.ai exists but languageModel is missing');
        console.log('   This might be a version issue or flag not fully enabled');
        return;
    }
    
    // Check 2: Capabilities
    console.log('\n📋 CHECK 2: API Capabilities');
    try {
        const capabilities = await window.ai.languageModel.capabilities();
        console.log('   Capabilities:', capabilities);
        console.log('   Available:', capabilities.available);
    } catch (e) {
        console.log('   ⚠️ Cannot check capabilities:', e.message);
    }
    
    // Check 3: Try to create session
    console.log('\n📋 CHECK 3: Session Creation Test');
    try {
        console.log('   🔄 Creating session...');
        const session = await window.ai.languageModel.create({
            temperature: 0.3,
            topK: 3
        });
        console.log('   ✅ Session created successfully!');
        
        // Check 4: Try a simple prompt
        console.log('\n📋 CHECK 4: Prompt Test');
        console.log('   🔄 Sending test prompt...');
        const response = await session.prompt('Say "Hello from Gemini Nano"');
        console.log('   ✅ Response:', response);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SUCCESS! Chrome Prompt API is FULLY FUNCTIONAL');
        console.log('='.repeat(60) + '\n');
        
        return {
            status: 'success',
            message: 'Chrome Prompt API is ready to use'
        };
        
    } catch (error) {
        console.log('   ❌ Session creation failed:', error.message);
        
        if (error.message.includes('not yet available')) {
            console.log('\n⏳ MODEL IS DOWNLOADING');
            console.log('\n💡 WHAT TO DO:');
            console.log('   1. Model is being downloaded in the background');
            console.log('   2. This usually takes 2-5 minutes');
            console.log('   3. Check download status: chrome://components/');
            console.log('   4. Look for "Optimization Guide On Device Model"');
            console.log('   5. Run this diagnostic again in 2 minutes');
            
            // Try to trigger download
            console.log('\n🔄 Attempting to trigger download...');
            setTimeout(async () => {
                try {
                    await window.ai.languageModel.create();
                    console.log('✅ Download triggered successfully');
                } catch (e) {
                    console.log('⏳ Still downloading...');
                }
            }, 5000);
            
        } else {
            console.log('\n❌ UNEXPECTED ERROR');
            console.log('   Error:', error.message);
            console.log('\n🔧 TROUBLESHOOTING:');
            console.log('   1. Restart Chrome completely');
            console.log('   2. Check chrome://components/ for model status');
            console.log('   3. Try with: Enabled BypassPerfRequirement flag');
            console.log('   4. Ensure sufficient disk space (need ~2GB)');
        }
        
        return {
            status: 'error',
            message: error.message
        };
    }
}

// Auto-run and provide instructions
console.log('🚀 Running Chrome AI diagnostics...\n');
diagnoseChromeAI().then(result => {
    if (result) {
        console.log('\n📊 Diagnostic Result:', result);
    }
    console.log('\n💡 To run again, type: diagnoseChrome AI()');
});



