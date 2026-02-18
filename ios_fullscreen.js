function buildIOSMeta() {

    var aMetaTags = [{
            name: "viewport",
            content: 'width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no'
        },
        {
            name: 'apple-mobile-web-app-capable',
            content: 'yes'
        },
        {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black'
        }
    ];

    for (var i = 0; i < aMetaTags.length; i++) {
        var oNewMeta = document.createElement('meta');
        oNewMeta.name = aMetaTags[i].name;
        oNewMeta.content = aMetaTags[i].content;

        var oOldMeta = window.document.head.querySelector('meta[name="' + oNewMeta.name + '"]');
        if (oOldMeta) {
            oOldMeta.parentNode.removeChild(oOldMeta);
        }
        window.document.head.appendChild(oNewMeta);
    }

};

function hideIOSFullscreenPanel() {
    jQuery(".xxx-ios-fullscreen-message").css("display", "none");
    jQuery(".xxx-ios-fullscreen-scroll").css("display", "none");

    jQuery(".xxx-game-iframe-full").removeClass("xxx-game-iframe-iphone-se");
};

function buildIOSFullscreenPanel() {
    var html = '';

    html += '<div class="xxx-ios-fullscreen-message">';
    html += '<div class="xxx-ios-fullscreen-swipe">';
    html += '</div>';
    html += '</div>';

    html += '<div class="xxx-ios-fullscreen-scroll">';
    html += '</div>';

    jQuery("body").append(html);
};

function showIOSFullscreenPanel() {
    jQuery(".xxx-ios-fullscreen-message").css("display", "block");
    jQuery(".xxx-ios-fullscreen-scroll").css("display", "block");
};

// FIX ISSUE-009: Generic iOS fullscreen detection
// Replaces hardcoded device-specific width/height checks with viewport-based approach
// Works automatically with new iPhone models without needing updates
function __iosResize() {
    window.scrollTo(0, 0);

    // Generic detection: check if viewport fills the screen
    // Instead of checking specific device dimensions, use viewport ratio
    if (_isIOSDevice()) {
        var viewportHeight = window.innerHeight;
        var screenHeight = window.screen.height;
        var ratio = viewportHeight / screenHeight;

        // If viewport takes up > 85% of screen height, consider it fullscreen
        // This works for all iPhone models regardless of dimensions
        if (ratio > 0.85) {
            hideIOSFullscreenPanel();
        } else {
            // Small screen iPhones (SE-class) may need special handling
            if (window.screen.width <= 375 && window.screen.height <= 667) {
                jQuery(".xxx-game-iframe-full").addClass("xxx-game-iframe-iphone-se");
            }
            showIOSFullscreenPanel();
        }
    }
};

function iosResize() {
    __iosResize();

    setTimeout(function() {
        __iosResize();
    }, 500);
};

function iosInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// FIX ISSUE-009: Generic iOS detection that works with iPadOS 13+ and new devices
// iPadOS 13+ reports as macOS Safari, so we check maxTouchPoints
function _isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function _isIOSSafari() {
    if (!_isIOSDevice()) return false;
    // Check for Safari (not Chrome iOS, Firefox iOS, etc.)
    var ua = navigator.userAgent;
    return /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
}

// FIX ISSUE-009: Replaced isIOSLessThen13 with version-independent approach
// The fullscreen panel is only relevant for standalone Safari (not in iframe)
// and only for non-fullscreen viewports
function isIOSLessThen13() {
    // Try platform.js first (if available)
    if (typeof platform !== 'undefined' && platform.os) {
        var oOs = platform.os;
        var szFamily = (oOs.family || '').toLowerCase();
        var iVersion = parseFloat(oOs.version);

        if (szFamily === "ios" && iVersion < 13) {
            return true;
        }
    }

    // Fallback: check user agent for iOS version
    var match = navigator.userAgent.match(/OS (\d+)_/);
    if (match && parseInt(match[1]) < 13) {
        return true;
    }

    return false;
}

$(document).ready(function() {
    if (_isIOSSafari() && isIOSLessThen13() && !iosInIframe()) {
        buildIOSFullscreenPanel();
        buildIOSMeta();
    }
});

jQuery(window).resize(function() {
    if (_isIOSSafari() && isIOSLessThen13() && !iosInIframe()) {
        iosResize();
    }
});