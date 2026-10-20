'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Code2,
  Share2,
  Download,
  MessageCircle,
  Globe,
  Radio
} from 'lucide-react';
import { Form } from '@/types';
import { getPublicFormUrl, FORMS_DOMAIN } from '@/lib/urls';

interface ShareModalProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ form, isOpen, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'embed'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [useLocalOrigin, setUseLocalOrigin] = useState(false);

  const publicUrl = getPublicFormUrl(form, { useCurrentOrigin: useLocalOrigin });
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="750" frameborder="0" style="border:0;border-radius:12px;overflow:hidden;"></iframe>`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0e1013',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, publicUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${form.hash || 'form'}-qr-code.png`;
    a.click();
  };

  const shareViaWhatsApp = () => {
    const text = `Hey! Please fill out the "${form.title}" here:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-hairline-light bg-studio-950 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              <Globe className="h-3 w-3" />
              <span>CUSTOM DOMAIN DISTRIBUTION</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Share Form & Public Embed
            </h3>
            <p className="text-xs text-studio-400">
              Form hash: <span className="font-mono text-amber-300 font-bold">{form.hash}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-studio-400 hover:text-white hover:bg-studio-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-0.5 bg-studio-900 border border-hairline rounded-lg">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'link' ? 'bg-studio-800 text-white' : 'text-studio-400 hover:text-white'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'qr' ? 'bg-studio-800 text-white' : 'text-studio-400 hover:text-white'
            }`}
          >
            <QrCode className="h-3 w-3" />
            <span>QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'embed' ? 'bg-studio-800 text-white' : 'text-studio-400 hover:text-white'
            }`}
          >
            <Code2 className="h-3 w-3" />
            <span>Embed HTML</span>
          </button>
        </div>

        {/* Domain Target Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded bg-studio-900 border border-hairline text-xs font-mono">
          <span className="text-studio-400">TARGET DOMAIN:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseLocalOrigin(false)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                !useLocalOrigin
                  ? 'bg-amber-400 text-studio-950'
                  : 'bg-studio-800 text-studio-400 hover:text-white'
              }`}
            >
              {FORMS_DOMAIN}
            </button>
            <button
              onClick={() => setUseLocalOrigin(true)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                useLocalOrigin
                  ? 'bg-amber-400 text-studio-950'
                  : 'bg-studio-800 text-studio-400 hover:text-white'
              }`}
            >
              Current Host (Dev)
            </button>
          </div>
        </div>

        {/* TAB 1: DIRECT LINK */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-studio-400 font-bold block">
                Public Form URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-studio-950 border border-studio-800 rounded text-amber-300 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 text-xs font-bold rounded bg-amber-400 hover:bg-amber-300 text-studio-950 transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={shareViaWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Share via WhatsApp</span>
              </button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-studio-800 hover:bg-studio-700 text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test Link</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-white rounded-xl inline-block shadow-lg mx-auto">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Form QR Code"
                  className="w-48 h-48 mx-auto"
                />
              )}
            </div>

            <p className="text-xs text-studio-400 font-mono">
              Scan to open <span className="text-amber-400">{publicUrl}</span>
            </p>

            <button
              onClick={downloadQr}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-amber-400 hover:bg-amber-300 text-studio-950 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download High-Res QR PNG</span>
            </button>
          </div>
        )}

        {/* TAB 3: EMBED HTML */}
        {activeTab === 'embed' && (
          <div className="space-y-3">
            <p className="text-xs text-studio-400">
              Paste this iframe code on your website, Webflow, WordPress, or portfolio page to embed the form directly:
            </p>

            <textarea
              readOnly
              rows={3}
              value={embedCode}
              className="w-full p-2.5 text-xs font-mono bg-studio-950 border border-studio-800 rounded text-studio-300 select-all"
            />

            <button
              onClick={handleCopyEmbed}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded bg-amber-400 hover:bg-amber-300 text-studio-950 transition-colors"
            >
              {copiedEmbed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
