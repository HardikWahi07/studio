// This is the root layout that Next.js requires.
// It delegates all rendering to the [locale] layout.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
