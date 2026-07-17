"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/shared/components/Card";
import Button from "@/shared/components/Button";
import Pagination from "@/shared/components/Pagination";
import { cn } from "@/shared/utils/cn";
import { AI_PROVIDERS, getProviderByAlias } from "@/shared/constants/providers";
import RequestDetailDrawer from "./request-detail/RequestDetailDrawer";
import { getInputTokens } from "./request-detail/utils";

let providerNameCache = null;
let providerNodesCache = null;

async function fetchProviderNames() {
  if (providerNameCache && providerNodesCache) {
    return { providerNameCache, providerNodesCache };
  }

  const nodesRes = await fetch("/api/provider-nodes");
  const nodesData = await nodesRes.json();
  const nodes = nodesData.nodes || [];
  providerNodesCache = {};

  for (const node of nodes) {
    providerNodesCache[node.id] = node.name;
  }

  providerNameCache = {
    ...AI_PROVIDERS,
    ...providerNodesCache,
  };

  return { providerNameCache, providerNodesCache };
}

function getProviderName(providerId, cache) {
  if (!providerId) return providerId;
  if (!cache) return providerId;

  const cached = cache[providerId];

  if (typeof cached === "string") {
    return cached;
  }

  if (cached?.name) {
    return cached.name;
  }

  const providerConfig = getProviderByAlias(providerId) || AI_PROVIDERS[providerId];
  return providerConfig?.name || providerId;
}

export default function RequestDetailsTab() {
  const [details, setDetails] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [providerNameCache, setProviderNameCache] = useState(null);
  const [filters, setFilters] = useState({
    provider: "",
    startDate: "",
    endDate: "",
  });

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/usage/providers");
      const data = await res.json();
      setProviders(data.providers || []);

      const cache = await fetchProviderNames();
      setProviderNameCache(cache.providerNameCache);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    }
  }, []);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });
      if (filters.provider) params.append("provider", filters.provider);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await fetch(`/api/usage/request-details?${params}`);
      const data = await res.json();

      setDetails(data.details || []);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error("Failed to fetch request details:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleViewDetail = (detail) => {
    setSelectedDetail(detail);
    setIsDrawerOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ provider: "", startDate: "", endDate: "" });
  };

  const hasFilters = filters.provider || filters.startDate || filters.endDate;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card padding="md" className="glass-panel-subtle">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="provider-filter" className="text-sm font-medium text-text-main">
              Provider
            </label>
            <select
              id="provider-filter"
              value={filters.provider}
              onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
              className="glass-input w-full min-w-0 h-9 px-3 text-sm cursor-pointer"
            >
              <option value="">All Providers</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="start-date-filter" className="text-sm font-medium text-text-main">
              Start Date
            </label>
            <input
              id="start-date-filter"
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="glass-input w-full min-w-0 h-9 px-3 text-sm"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="end-date-filter" className="text-sm font-medium text-text-main">
              End Date
            </label>
            <input
              id="end-date-filter"
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="glass-input w-full min-w-0 h-9 px-3 text-sm"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <span className="hidden text-sm font-medium opacity-0 lg:block" aria-hidden="true">
              Clear
            </span>
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              disabled={!hasFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="request-details-table w-full min-w-[920px]">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Model</th>
                <th>Provider</th>
                <th className="text-right">Input</th>
                <th className="text-right">Output</th>
                <th>Latency</th>
                <th className="text-center w-16"> </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-text-muted">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : details.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-text-muted">
                    No request details found
                  </td>
                </tr>
              ) : (
                details.map((detail, index) => {
                  const isSuccess = detail.status === "success";
                  return (
                    <tr
                      key={`${detail.id}-${index}`}
                      className="request-details-row"
                      onClick={() => handleViewDetail(detail)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleViewDetail(detail);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <td className="whitespace-nowrap tabular-nums">
                        {new Date(detail.timestamp).toLocaleString()}
                      </td>
                      <td className="max-w-[240px]">
                        <span className="block truncate font-mono text-xs sm:text-sm">
                          {detail.model}
                        </span>
                      </td>
                      <td className="max-w-[160px]">
                        <span className="block truncate font-medium">
                          {getProviderName(detail.provider, providerNameCache)}
                        </span>
                      </td>
                      <td className="text-right font-mono tabular-nums">
                        {getInputTokens(detail.tokens).toLocaleString()}
                      </td>
                      <td className="text-right font-mono tabular-nums">
                        {detail.tokens?.completion_tokens?.toLocaleString() || 0}
                      </td>
                      <td>
                        <div className="flex flex-col gap-0.5 text-xs text-text-muted">
                          <span>
                            TTFT{" "}
                            <span className="font-mono text-text-main">
                              {detail.latency?.ttft || 0}ms
                            </span>
                          </span>
                          <span>
                            Total{" "}
                            <span className="font-mono text-text-main">
                              {detail.latency?.total || 0}ms
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={cn(
                            "request-details-view-btn",
                            isSuccess
                              ? "request-details-view-btn--ok"
                              : "request-details-view-btn--err"
                          )}
                          onClick={() => handleViewDetail(detail)}
                          title="View details"
                          aria-label="View request details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && details.length > 0 && (
          <div className="border-t border-divider">
            <Pagination
              currentPage={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </Card>

      <RequestDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        detail={selectedDetail}
        providerName={
          selectedDetail
            ? getProviderName(selectedDetail.provider, providerNameCache)
            : ""
        }
      />
    </div>
  );
}