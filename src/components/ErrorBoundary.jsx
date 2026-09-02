import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            padding: 40,
            maxWidth: 720,
            margin: "0 auto",
            fontFamily: "monospace",
          }}>
          <h1 style={{ fontSize: 22, marginBottom: 12 }}>
            ⚠️ Terjadi error saat render:
          </h1>
          <pre
            style={{ whiteSpace: "pre-wrap", color: "#B3402A", fontSize: 13 }}>
            {String(this.state.err?.stack || this.state.err)}
          </pre>
          <button
            onClick={() => location.assign("/")}
            style={{ marginTop: 16, padding: "8px 16px" }}>
            ← Ke Beranda
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
