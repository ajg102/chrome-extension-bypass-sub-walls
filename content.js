(function () {
  const attributePatterns = [
    /modal/i,
    /overlay/i,
    /paywall/i,
    /subscribe/i,
    /subscription/i,
    /signup/i,
    /sign[-_\s]?up/i,
    /dialog/i,
    /popup/i,
    /backdrop/i,
    /blocker/i
  ];

  const textPatterns = [
    /subscribe/i,
    /sign\s*up/i,
    /paywall/i,
    /membership/i,
    /premium/i,
    /start trial/i,
    /log in to continue/i
  ];

  const classRemovalPatterns = [
    /no[-_]?scroll/i,
    /overflow[-_]?hidden/i,
    /lock[-_]?scroll/i,
    /modal[-_]?open/i,
    /disable[-_]?scroll/i,
    /page[-_]?locked/i
  ];

  const candidateSelectors = [
    'dialog',
    '[role="dialog"]',
    '[aria-modal="true"]',
    '[class*="modal"], [id*="modal"]',
    '[class*="overlay"], [id*="overlay"]',
    '[class*="paywall"], [id*="paywall"]',
    '[class*="subscribe"], [id*="subscribe"]',
    '[class*="subscription"], [id*="subscription"]',
    '[class*="popup"], [id*="popup"]',
    '[class*="dialog"], [id*="dialog"]',
    '[class*="backdrop"], [id*="backdrop"]'
  ].join(', ');

  function hasBlockingText(element) {
    const textContent = `${element.getAttribute('aria-label') || ''} ${element.innerText || ''}`;
    return textPatterns.some((pattern) => pattern.test(textContent));
  }

  function matchesAttributePatterns(element) {
    const attributeString = `${element.className || ''} ${element.id || ''}`;
    return attributePatterns.some((pattern) => pattern.test(attributeString));
  }

  function coversViewport(rect) {
    return (
      rect.width >= window.innerWidth * 0.25 ||
      rect.height >= window.innerHeight * 0.25 ||
      (rect.width >= window.innerWidth * 0.7 && rect.height >= 200)
    );
  }

  function shouldRemoveElement(element) {
    if (!(element instanceof HTMLElement)) return false;
    if (['HTML', 'BODY', 'HEAD', 'SCRIPT', 'STYLE', 'LINK'].includes(element.tagName)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const isFixed = ['fixed', 'sticky'].includes(styles.position);
    const isCovering = coversViewport(rect);
    const hasHighZIndex = parseInt(styles.zIndex, 10) >= 100 || styles.position === 'fixed';

    const isLikelyOverlay = matchesAttributePatterns(element) || element.matches?.('dialog,[role="dialog"],[aria-modal="true"]') || hasBlockingText(element);

    return isLikelyOverlay && (isFixed || isCovering || hasHighZIndex);
  }

  function removeBlockingElements(root = document) {
    const candidates = root.querySelectorAll(candidateSelectors);
    candidates.forEach((element) => {
      if (shouldRemoveElement(element)) {
        element.remove();
      }
    });
  }

  function unlockScrolling() {
    [document.documentElement, document.body].forEach((element) => {
      if (!element) return;

      const styles = window.getComputedStyle(element);
      if (styles.overflow === 'hidden' || styles.overflowY === 'hidden' || styles.overflowX === 'hidden') {
        element.style.setProperty('overflow', 'auto', 'important');
        element.style.setProperty('overflow-y', 'auto', 'important');
        element.style.setProperty('overflow-x', 'auto', 'important');
      }

      classRemovalPatterns.forEach((pattern) => {
        element.classList.forEach((className) => {
          if (pattern.test(className)) {
            element.classList.remove(className);
          }
        });
      });
    });
  }

  function cleanPage(root = document) {
    removeBlockingElements(root);
    unlockScrolling();
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          cleanPage(node);
        }
      });

      if (mutation.type === 'attributes' && mutation.target) {
        cleanPage(mutation.target);       
      }
    });
  });

  function start() {
    cleanPage();

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'aria-label', 'role']
    });

    window.addEventListener('load', cleanPage, { once: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
