"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import Toggle from "./Toggle";

export default function RequestLogger() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs(false);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchLogs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/usage/request-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <label className="text-sm font-medium text-default-500 flex items-center gap-2 cursor-pointer">
          <span>Auto Refresh (3s)</span>
          <Toggle
            size="sm"
            checked={autoRefresh}
            onChange={setAutoRefresh}
            title={autoRefresh ? "Disable auto refresh" : "Enable auto refresh"}
          />
        </label>
      </div>

      <Card className="overflow-hidden bg-black/5 dark:bg-black/20">
        <div className="p-0 overflow-x-auto max-h-[600px] overflow-y-auto font-mono text-xs">
          {loading && logs.length === 0 ? (
            <div className="p-8 text-center text-default-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-default-500">No logs recorded yet.</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-default-100 border-b border-divider z-10">
                <tr>
                  <th className="px-3 py-2 border-r border-divider">DateTime</th>
                  <th className="px-3 py-2 border-r border-divider">Model</th>
                  <th className="px-3 py-2 border-r border-divider">Provider</th>
                  <th className="px-3 py-2 border-r border-divider">Account</th>
                  <th className="px-3 py-2 border-r border-divider">In</th>
                  <th className="px-3 py-2 border-r border-divider">Out</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/50">
                {logs.map((log, i) => {
                  const parts = log.split(" | ");
                  if (parts.length < 7) return null;

                  const status = parts[6];
                  const isPending = status.includes("PENDING");
                  const isFailed = status.includes("FAILED");
                  const isSuccess = status.includes("OK");

                  return (
                    <tr key={i} className={`hover:bg-primary/5 transition-colors ${isPending ? "bg-primary/5" : ""}`}>
                      <td className="px-3 py-1.5 border-r border-divider text-default-500">{parts[0]}</td>
                      <td className="px-3 py-1.5 border-r border-divider font-medium">{parts[1]}</td>
                      <td className="px-3 py-1.5 border-r border-divider">
                        <span className="px-1.5 py-0.5 rounded bg-default-100 border border-divider text-[10px] uppercase font-bold">
                          {parts[2]}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 border-r border-divider truncate max-w-[150px]" title={parts[3]}>{parts[3]}</td>
                      <td className="px-3 py-1.5 border-r border-divider text-right text-primary">{parts[4]}</td>
                      <td className="px-3 py-1.5 border-r border-divider text-right text-success">{parts[5]}</td>
                      <td
                        className={`px-3 py-1.5 font-bold ${
                          isSuccess ? "text-success" : isFailed ? "text-danger" : "text-primary animate-pulse"
                        }`}
                      >
                        {status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      <div className="text-[10px] text-default-500 italic">
        Logs are loaded from the request history database.
      </div>
    </div>
  );
}