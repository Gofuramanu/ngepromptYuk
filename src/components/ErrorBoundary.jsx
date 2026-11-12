import { Component } from 'react';
import { STORAGE_KEY } from '../constants/anatomy';

// Menangkap error render agar aplikasi tidak menampilkan layar putih kosong.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    localStorage.removeItem(STORAGE_KEY); // data tersimpan yang korup sering jadi penyebab
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center bg-panel border border-red-800 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-400 mb-2">Terjadi kesalahan</h1>
          <p className="text-gray-400 text-sm mb-4">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
          >
            Reset data &amp; muat ulang
          </button>
        </div>
      </div>
    );
  }
}

