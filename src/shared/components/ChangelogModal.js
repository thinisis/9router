"use client";

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { marked } from "marked";
import { Spinner } from "@heroui/react";
import { GITHUB_CONFIG } from "@/shared/constants/config";
import Modal from "./Modal";

marked.setOptions({ gfm: true, breaks: true });

export default function ChangelogModal({ isOpen, onClose }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || html) return;
    setLoading(true);
    setError("");
    fetch(GITHUB_CONFIG.changelogUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((md) => setHtml(marked.parse(md)))
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [isOpen, html]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Log"
      size="lg"
      className="!max-w-3xl"
    >
      {loading && (
        <div className="flex items-center justify-center py-10 text-default-500">
          <Spinner size="sm" color="accent" />
          <span className="ml-2">Loading...</span>
        </div>
      )}
      {error && (
        <div className="text-danger py-4">Failed to load changelog: {error}</div>
      )}
      {!loading && !error && html && (
        <div
          className="changelog-body text-foreground"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </Modal>
  );
}

ChangelogModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};