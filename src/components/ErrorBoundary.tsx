import { Component, type ErrorInfo, type ReactNode } from 'react';
import { STORAGE_KEY } from '../constants/anatomy';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Menangkap error render agar aplikasi tidak menampilkan layar putih kosong.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = (): void => {
    localStorage.removeItem(STORAGE_KEY); // data tersimpan yang korup sering jadi penyebab
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="bg-panel max-w-md rounded-lg border border-red-800 p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-red-400">Terjadi kesalahan</h1>
          <p className="mb-4 text-sm text-gray-400">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            Reset data &amp; muat ulang
          </button>
        </div>
      </div>
    );
  }
}
