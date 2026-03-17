/**
 * Parses a cURL command string into an object compatible with Load Nexus configuration.
 * 
 * @param {string} curlString - The raw cURL command from the user.
 * @returns {object} - A configuration object with url, method, headers, etc.
 */
export const parseCurlCommand = (curlString) => {
    if (!curlString || !curlString.trim()) return null;

    const result = {
        url: '',
        method: 'GET',
        authType: 'none',
        bearerToken: '',
        basicUser: '',
        basicPass: '',
        bodyType: 'none',
        bodyData: '',
        customHeaders: ''
    };

    // Clean up the curl string (remove line breaks and backslashes)
    const cleanCurl = curlString.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Extract URL (usually the first thing that looks like a URL or the last argument)
    // Matches http:// or https://
    const urlMatches = cleanCurl.match(/(?:https?:\/\/[^\s'"]+)/g);
    if (urlMatches && urlMatches.length > 0) {
        result.url = urlMatches[0].replace(/['"]/g, '');
    }

    // Extract Method
    const methodMatch = cleanCurl.match(/(?:-X|--request)\s+([A-Z]+)/);
    if (methodMatch) {
        result.method = methodMatch[1];
    } else if (cleanCurl.includes('-d ') || cleanCurl.includes('--data ') || cleanCurl.includes('--data-raw ') || cleanCurl.includes('--data-binary ')) {
        result.method = 'POST';
    }

    // Extract Headers
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
    let headerMatch;
    const headers = [];
    while ((headerMatch = headerRegex.exec(cleanCurl)) !== null) {
        const headerStr = headerMatch[1];
        if (headerStr.toLowerCase().startsWith('authorization: bearer ')) {
            result.authType = 'bearer';
            result.bearerToken = headerStr.substring(22).trim();
        } else if (headerStr.toLowerCase().startsWith('authorization: basic ')) {
            result.authType = 'basic';
            try {
                const base64 = headerStr.substring(21).trim();
                const decoded = atob(base64);
                const [user, pass] = decoded.split(':');
                result.basicUser = user || '';
                result.basicPass = pass || '';
            } catch (e) {
                console.warn('Failed to decode Basic Auth header', e);
            }
        } else {
            headers.push(headerStr);
        }
    }
    
    // Also handle headers without quotes if any
    const headerNoQuoteRegex = /(?:-H|--header)\s+([^\s"'][^\s]*)/g;
    while ((headerMatch = headerNoQuoteRegex.exec(cleanCurl)) !== null) {
        const headerStr = headerMatch[1];
        if (headerStr && !headers.includes(headerStr) && !headerStr.toLowerCase().startsWith('authorization:')) {
            headers.push(headerStr);
        }
    }

    result.customHeaders = headers.join('\n');

    // Extract Body
    const bodyRegex = /(?:-d|--data|--data-raw|--data-binary)\s+["']({[\s\S]*?})["']|(-d|--data|--data-raw|--data-binary)\s+["']([\s\S]*?)["']|(-d|--data|--data-raw|--data-binary)\s+([^\s"']+)/g;
    const bodyMatch = bodyRegex.exec(cleanCurl);
    if (bodyMatch) {
        // Try to find the content in various capture groups
        const bodyContent = bodyMatch[1] || bodyMatch[3] || bodyMatch[5];
        if (bodyContent) {
            result.bodyData = bodyContent;
            result.bodyType = 'json'; // Default to JSON if it looks like it, otherwise maybe formdata
            
            // Check if it's actually JSON
            try {
                JSON.parse(bodyContent);
                result.bodyType = 'json';
            } catch (e) {
                result.bodyType = 'formdata';
            }
        }
    }

    // Extract Manual Basic Auth (-u, --user)
    const userMatch = cleanCurl.match(/(?:-u|--user)\s+["']?([^"'\s]+)["']?/);
    if (userMatch) {
        const parts = userMatch[1].split(':');
        result.authType = 'basic';
        result.basicUser = parts[0] || '';
        result.basicPass = parts[1] || '';
    }

    return result;
};
