/**
 * SMS Service for IKIMINA Platform
 * Handles sending SMS notifications using Rwanda telecom providers
 */
const axios = require('axios');
const { config, logger } = require('../../config/notificationConfig');

/**
 * Send SMS using the configured provider
 * @param {string} phoneNumber - Recipient's phone number (should start with +250)
 * @param {string} message - Message content
 * @param {string} [priority='normal'] - Message priority
 * @returns {Promise<object>} - Response from the provider
 */
const sendSMS = async (phoneNumber, message, priority = 'normal') => {
  try {
    // Validate phone number (Rwanda format: +250XXXXXXXXX)
    if (!phoneNumber.match(/^\+250\d{9}$/)) {
      // Try to normalize the number if possible
      if (phoneNumber.match(/^07\d{8}$/)) {
        phoneNumber = '+25' + phoneNumber;
      } else if (phoneNumber.match(/^7\d{8}$/)) {
        phoneNumber = '+250' + phoneNumber;
      } else {
        throw new Error('Invalid phone number format. Must be in Rwanda format (+250XXXXXXXXX)');
      }
    }

    // Select SMS provider based on configuration
    const provider = config.sms.provider.toLowerCase();
    
    let response;
    
    switch (provider) {
      case 'rwandatel':
        response = await sendViaRwandatel(phoneNumber, message);
        break;
      case 'africastalking':
        response = await sendViaAfricasTalking(phoneNumber, message);
        break;
      default:
        throw new Error(`Unsupported SMS provider: ${provider}`);
    }
    
    logger.info('SMS sent successfully', {
      phoneNumber,
      messageLength: message.length,
      priority,
      provider,
      success: true
    });
    
    return response;
  } catch (error) {
    logger.error('Failed to send SMS', {
      phoneNumber,
      messageLength: message ? message.length : 0,
      priority,
      provider: config.sms.provider,
      error: error.message,
      success: false
    });
    
    throw error;
  }
};

/**
 * Send SMS via Rwandatel API
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content
 * @returns {Promise<object>} - Response from Rwandatel
 */
const sendViaRwandatel = async (phoneNumber, message) => {
  const url = config.sms.baseUrl + '/api/v1/sms/send';
  
  const payload = {
    sender: config.sms.senderId,
    recipients: [phoneNumber],
    message: message,
    apiKey: config.sms.apiKey
  };
  
  const response = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.sms.apiKey}`
    }
  });
  
  return response.data;
};

/**
 * Send SMS via Africa's Talking API
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content
 * @returns {Promise<object>} - Response from Africa's Talking
 */
const sendViaAfricasTalking = async (phoneNumber, message) => {
  const url = 'https://api.africastalking.com/version1/messaging';
  
  const payload = new URLSearchParams();
  payload.append('username', config.sms.username);
  payload.append('to', phoneNumber);
  payload.append('message', message);
  payload.append('from', config.sms.senderId);
  
  const response = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apiKey': config.sms.apiKey
    }
  });
  
  return response.data;
};

/**
 * Format and send a notification using a template
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} templateName - Template name from notification config
 * @param {object} templateData - Data to populate in template
 * @returns {Promise<object>} - Response from the provider
 */
const sendTemplatedSMS = async (phoneNumber, templateName, templateData) => {
  try {
    // Get template
    const template = config.templates[templateName];
    if (!template || !template.smsTemplate) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    // Replace template variables with actual data
    let message = template.smsTemplate;
    for (const [key, value] of Object.entries(templateData)) {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    logger.error('Failed to send templated SMS', {
      phoneNumber,
      template: templateName,
      error: error.message
    });
    throw error;
  }
};

// Export the service
module.exports = {
  sendSMS,
  sendTemplatedSMS
}; 