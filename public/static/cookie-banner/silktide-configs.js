/**
 * Cookie Consent Configuration
 *
 * This file contains all customization for the Silktide Cookie Consent Manager.
 * When updating the consent manager library (silktide-consent-manager.js):
 * - This config file should work without changes
 * - Just verify the config options are still compatible
 *
 * ============================================================================
 * CONFIGURATION STRUCTURE
 * ============================================================================
 * The config is organized into sections for easy maintenance:
 *
 * 1. VISUAL SETTINGS - Position and appearance
 * 2. COOKIE TYPES - Define cookie categories and behaviors
 * 3. TEXT CONTENT - All user-facing text (Vietnamese)
 * 4. INTEGRATIONS - Google Consent Mode V2 and analytics
 *
 * ============================================================================
 */

(function () {
  // ==========================================================================
  // 1. VISUAL SETTINGS
  // ==========================================================================
  const visualSettings = {
    cookieIcon: {
      position: 'bottomRight', // bottomLeft | bottomRight | topLeft | topRight
    },
    position: {
      banner: 'bottomRight', // bottomLeft | bottomRight | topLeft | topRight | center
    },
  };

  // ==========================================================================
  // 2. COOKIE TYPES & BEHAVIORS
  // ==========================================================================
  // Each cookie type can have:
  // - id: unique identifier (used in localStorage)
  // - name: display name shown to users
  // - description: explanation of what the cookie does
  // - required: if true, user cannot disable this cookie
  // - defaultValue: initial state (true = enabled by default)
  // - onAccept: function called when user accepts this cookie type
  // - onReject: function called when user rejects this cookie type
  // ==========================================================================

  const cookieTypes = [
    // Essential Cookies (always required)
    {
      id: 'essential',
      name: 'Cookie cần thiết',
      description: 'Những cookie này cần thiết để website hoạt động bình thường.',
      required: true,
      defaultValue: true,
    },

    // Analytics Cookies (Google Analytics)
    {
      id: 'analytics',
      name: 'Cookie phân tích',
      description: 'Giúp chúng tôi hiểu cách khách hàng sử dụng website để cải thiện dịch vụ.',
      defaultValue: true,

      onAccept: function () {
        // Update Google Consent Mode V2
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', {
            analytics_storage: 'granted',
          });

          // Push event to dataLayer for Google Tag Manager
          if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
              event: 'consent_accepted_analytics',
            });
          }
        }
      },

      onReject: function () {
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', {
            analytics_storage: 'denied',
          });
        }
      },
    },

    // Marketing Cookies (Google Ads)
    {
      id: 'marketing',
      name: 'Cookie quảng cáo',
      description: 'Được sử dụng để hiển thị quảng cáo phù hợp với sở thích của bạn.',
      defaultValue: false,

      onAccept: function () {
        // Update Google Consent Mode V2
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
          });

          // Push event to dataLayer for Google Tag Manager
          if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
              event: 'consent_accepted_marketing',
            });
          }
        }
      },

      onReject: function () {
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
          });
        }
      },
    },
  ];

  // ==========================================================================
  // 3. TEXT CONTENT (Vietnamese)
  // ==========================================================================
  // All text shown to users in the banner and preferences modal
  // Edit these to change wording or translate to another language
  // ==========================================================================

  const textContent = {
    banner: {
      description:
        `<p>Website <strong>${window.location.hostname}</strong> sử dụng cookie để cải thiện trải nghiệm của bạn. Chúng tôi tuân thủ Google Consent Mode V2.</p>`,
      acceptAllButtonText: 'Chấp nhận',
      rejectNonEssentialButtonText: 'Chấp nhận vừa đủ',
      preferencesButtonText: 'Tùy chỉnh',
      linkText: 'Chính sách cookie',
      linkHref: window.location.origin + '/chinh-sach-rieng-tu/',
    },
    preferences: {
      title: 'Tùy chỉnh cookie của bạn',
      description:
        `<p>Bạn có thể lựa chọn loại cookie muốn cho phép trên website <strong>${window.location.hostname}</strong>.</p>`,
      acceptAllButtonText: 'Chấp nhận tất cả',
      rejectNonEssentialButtonText: 'Từ chối không cần thiết',
      saveButtonText: 'Lưu tùy chọn',
      closeButtonText: 'Đóng',
    },
  };

  // ==========================================================================
  // ASSEMBLE CONFIGURATION
  // ==========================================================================
  // Combine all sections into the final config object
  // ==========================================================================

  const cookieConsentConfig = {
    ...visualSettings,
    cookieTypes: cookieTypes,
    text: textContent,
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  // Wait for the Silktide manager to load, then apply configuration
  // ==========================================================================

  function initializeConsentManager() {
    if (typeof silktideCookieBannerManager !== 'undefined') {
      silktideCookieBannerManager.updateCookieBannerConfig(cookieConsentConfig);
    } else {
      // Manager not loaded yet, retry in 100ms
      setTimeout(initializeConsentManager, 100);
    }
  }

  // Delay banner display by 15 seconds to avoid disrupting initial page experience
  function startWithDelay() {
    setTimeout(initializeConsentManager, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startWithDelay, { once: true });
  } else {
    startWithDelay();
  }
})();
