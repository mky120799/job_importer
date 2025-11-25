import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-black p-6">
        <main className="max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
