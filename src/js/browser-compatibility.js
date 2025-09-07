/**
 * Browser compatibility checker for Cairo prover
 */

export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform.toLowerCase();
  
  // Detect browser
  let browser = 'unknown';
  let version = 'unknown';
  let versionNumber = 0;
  
  if (userAgent.includes('Firefox')) {
    browser = 'firefox';
    // Match Firefox version like Firefox/142.0 or Firefox/142.0.1
    const match = userAgent.match(/Firefox\/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    if (match) {
      version = match[1] + (match[2] ? '.' + match[2] : '.0');
      versionNumber = parseInt(match[1]);
    }
  } else if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
    browser = 'chrome';
    const match = userAgent.match(/Chrome\/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      version = match[1] + '.' + match[2] + '.' + match[3] + '.' + match[4];
      versionNumber = parseInt(match[1]);
    }
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'safari';
    const match = userAgent.match(/Version\/(\d+)\.(\d+)/);
    if (match) {
      version = match[1] + '.' + match[2];
      versionNumber = parseInt(match[1]);
    }
  }
  
  // Detect OS and architecture
  let os = 'unknown';
  let arch = 'unknown';
  
  if (platform.includes('mac')) {
    os = 'macos';
    // Better ARM detection for macOS
    // Check multiple indicators for Apple Silicon
    if (userAgent.includes('Intel')) {
      arch = 'x64';
    } else if (platform.includes('arm') || 
               navigator.userAgent.includes('arm64') ||
               navigator.userAgent.includes('ARM64') ||
               // Fallback: assume ARM if not Intel and on Mac
               !userAgent.includes('Intel')) {
      arch = 'arm64';
    }
  } else if (platform.includes('win')) {
    os = 'windows';
    arch = 'x64'; // Assume x64 for Windows
  } else if (platform.includes('linux')) {
    os = 'linux';
    arch = 'x64'; // Assume x64 for Linux
  }
  
  return { browser, version, versionNumber, os, arch, userAgent, platform };
}

export function checkCairoProverCompatibility() {
  const { browser, version, versionNumber, os, arch } = getBrowserInfo();
  
  // macOS (both ARM and Intel): Firefox 142.x.x supported
  if (os === 'macos') {
    return {
      isSupported: browser === 'firefox' && versionNumber >= 142,
      reason: browser === 'firefox' 
        ? versionNumber >= 142 
          ? 'Supported' 
          : `Firefox ${version} detected. Firefox 142.x.x or higher required`
        : 'Only Firefox 142.x.x is supported on macOS',
      recommendation: browser === 'firefox' 
        ? versionNumber >= 142 
          ? null 
          : 'Please update Firefox to version 142 or higher'
        : 'Please use Firefox 142 or higher',
      browserInfo: { browser, version, os, arch }
    };
  }
  
  // Windows and Linux x86: Firefox 142.x.x or Chrome 140.x.x.x supported
  if ((os === 'windows' || os === 'linux') && arch === 'x64') {
    const firefoxSupported = browser === 'firefox' && versionNumber >= 142;
    const chromeSupported = browser === 'chrome' && versionNumber >= 140;
    
    return {
      isSupported: firefoxSupported || chromeSupported,
      reason: firefoxSupported 
        ? 'Supported' 
        : chromeSupported 
          ? 'Supported'
          : browser === 'firefox'
            ? `Firefox ${version} detected. Firefox 142.x.x or higher required`
            : browser === 'chrome'
              ? `Chrome ${version} detected. Chrome 140.x.x.x or higher required`
              : 'Only Firefox 142.x.x or Chrome 140.x.x.x are supported',
      recommendation: !firefoxSupported && !chromeSupported
        ? browser === 'firefox'
          ? 'Please update Firefox to version 142 or higher'
          : browser === 'chrome'
            ? 'Please update Chrome to version 140 or higher'
            : 'Please use Firefox 142+ or Chrome 140+'
        : null,
      browserInfo: { browser, version, os, arch }
    };
  }
  
  // Unsupported platform
  return {
    isSupported: false,
    reason: `Unsupported platform: ${os} ${arch}`,
    recommendation: 'Cairo prover is only supported on macOS ARM (Firefox 142+) and Windows/Linux x64 (Firefox 142+ or Chrome 140+)',
    browserInfo: { browser, version, os, arch }
  };
}

export function getCairoCompatibilityMessage() {
  const compat = checkCairoProverCompatibility();
  const browserInfo = getBrowserInfo();
  
  if (compat.isSupported) {
    return {
      type: 'success',
      message: '✓ Your browser supports Cairo prover',
      details: null,
      debugInfo: browserInfo // Add debug info
    };
  } else {
    return {
      type: 'warning',
      message: '⚠️ Browser compatibility issue detected',
      details: {
        reason: compat.reason,
        recommendation: compat.recommendation,
        browserInfo: compat.browserInfo
      },
      debugInfo: browserInfo // Add debug info
    };
  }
}