"use client";

import { Component, type ReactNode } from "react";

/** Renders `fallback` instead of crashing the page when a child throws (e.g. a 3D model fails to load). */
export class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError?: (error: unknown) => void },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
