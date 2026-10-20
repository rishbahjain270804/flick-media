import { Form } from '@/types';

export const FORMS_DOMAIN = process.env.NEXT_PUBLIC_FORMS_DOMAIN || 'forms.buildwithrex.me';
export const PANEL_DOMAIN = process.env.NEXT_PUBLIC_PANEL_DOMAIN || 'panel.buildwithrex.me';

/**
 * Returns the public submission URL for a given form.
 * Default format: https://forms.buildwithrex.me/{hash}
 */
export function getPublicFormUrl(form: Form, options?: { useCurrentOrigin?: boolean }): string {
  const hash = form.hash || form.slug || form.id;
  
  if (options?.useCurrentOrigin && typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If already on forms.buildwithrex.me or forms.localhost
    if (window.location.host.startsWith('forms.')) {
      return `${origin}/${hash}`;
    }
    return `${origin}/f/${hash}`;
  }

  // Official custom production domain
  return `https://${FORMS_DOMAIN}/${hash}`;
}

export function getPanelUrl(path = ''): string {
  if (typeof window !== 'undefined' && !window.location.host.includes('buildwithrex.me')) {
    return `${window.location.origin}${path}`;
  }
  return `https://${PANEL_DOMAIN}${path}`;
}
