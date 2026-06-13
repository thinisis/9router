"use client";

import { createContext, useContext } from "react";

export const I18nReadyContext = createContext(false);

export function useI18nReady() {
  return useContext(I18nReadyContext);
}