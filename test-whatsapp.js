// Test script to check WhatsApp configuration and API connectivity
require('dotenv').config();

async function testWhatsApp() {
  console.log('=== WhatsApp Configuration Test ===\n');
  
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'fr';
  const timezone = process.env.WHATSAPP_TIMEZONE || 'Africa/Casablanca';
  
  // Check if configured
  if (!phoneNumberId || !accessToken) {
    console.log('❌ WhatsApp is not configured. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN');
    console.log('Phone Number ID:', phoneNumberId ? '✅ Set' : '❌ Missing');
    console.log('Access Token:', accessToken ? '✅ Set' : '❌ Missing');
    return;
  }
  
  console.log('✅ WhatsApp credentials are present\n');
  
  console.log('Configuration:');
  console.log('- Phone Number ID:', phoneNumberId);
  console.log('- API Version:', apiVersion);
  console.log('- Template Name:', templateName || 'Not set');
  console.log('- Template Language:', templateLang);
  console.log('- Timezone:', timezone);
  
  // Test API connectivity
  console.log('\n=== Testing API Connectivity ===\n');
  
  try {
    console.log(`Testing endpoint: https://graph.facebook.com/${apiVersion}/${phoneNumberId}`);
    
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API authentication successful');
      console.log('Phone Number Info:', JSON.stringify(data, null, 2));
      
      // Check if the phone number is verified
      if (data.verified_status) {
        console.log('Verification Status:', data.verified_status);
      }
    } else {
      const error = await response.text();
      console.log('❌ API authentication failed');
      console.log('Status:', response.status);
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('❌ API test failed with error:', error.message);
  }
  
  // Test sending a simple message (commented out to avoid accidental sends)
  console.log('\n=== Message Sending Test ===\n');
  console.log('To test actual message sending, you would need to:');
  console.log('1. Have a verified phone number to send to');
  console.log('2. Ensure the recipient has messaged your business number first (for plain text)');
  console.log('3. Or use an approved template (for business-initiated messages)');
  console.log('\nCurrent template configuration:', templateName || 'None (will use plain text within 24h window)');
}

testWhatsApp().catch(console.error);