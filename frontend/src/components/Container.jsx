export default function Container({ children }) {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
      {children}
    </main>
  );
}
