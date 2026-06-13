"use client";

import Modal from "./Modal";
import Button from "./Button";

const FEATURES = [
  { icon: "terminal", label: "Terminal", desc: "Full shell access" },
  { icon: "cast", label: "Desktop", desc: "Screen sharing" },
  { icon: "folder_open", label: "Files", desc: "Browse & edit files" },
];

const BULLETS = [
  { icon: "qr_code_scanner", text: "Scan QR to connect instantly" },
  { icon: "wifi_off", text: "No port forwarding needed" },
  { icon: "devices", text: "Works on any device" },
];

const NINE_REMOTE_URL = "https://9remote.cc";

export default function NineRemotePromoModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="9Remote"
      size="sm"
      className="!max-w-sm"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary shadow-md">
            <span className="material-symbols-outlined text-white text-[30px]">terminal</span>
          </div>
          <p className="text-xs text-default-500 leading-5 max-w-[220px]">
            Access your terminal, desktop &amp; files from anywhere
          </p>
        </div>

        <div className="flex gap-2 w-full">
          {FEATURES.map(({ icon, label, desc }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-1.5 py-4 px-1 rounded-xl border border-divider bg-default-100/50"
            >
              <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-default-500 text-center leading-4">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full">
          {BULLETS.map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-2.5">
              <span className="material-symbols-outlined shrink-0 text-primary text-[16px]">{icon}</span>
              <span className="text-xs text-default-500">{text}</span>
            </div>
          ))}
        </div>

        <Button
          fullWidth
          icon="open_in_new"
          onClick={() => window.open(NINE_REMOTE_URL, "_blank")}
        >
          Get 9Remote
        </Button>
      </div>
    </Modal>
  );
}