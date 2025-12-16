// Helper function to safely extract HTML content
export const getHtmlContent = (htmlBody: Record<string, any> | string, message: Record<string, any> | string): string => {
    // First try htmlBody
    if (typeof htmlBody === 'string' && htmlBody.trim()) {
        return htmlBody;
    }
    if (typeof htmlBody === 'object' && htmlBody) {
        // Check for rendered property first (most likely structure)
        if (htmlBody.rendered && typeof htmlBody.rendered === 'string') {
            return htmlBody.rendered;
        }
        // Fallback to other common properties
        if (htmlBody.content && typeof htmlBody.content === 'string') {
            return htmlBody.content;
        }
        if (htmlBody.html && typeof htmlBody.html === 'string') {
            return htmlBody.html;
        }
        if (htmlBody.body && typeof htmlBody.body === 'string') {
            return htmlBody.body;
        }
    }

    // Then try message as fallback
    if (typeof message === 'string' && message.trim()) {
        return message;
    }
    if (typeof message === 'object' && message) {
        // Check for rendered property first
        if (message.rendered && typeof message.rendered === 'string') {
            return message.rendered;
        }
        // Fallback to other common properties
        if (message.content && typeof message.content === 'string') {
            return message.content;
        }
        if (message.html && typeof message.html === 'string') {
            return message.html;
        }
        if (message.body && typeof message.body === 'string') {
            return message.body;
        }
    }

    // Last resort - stringify the object
    return '';
};