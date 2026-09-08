import './globals.css';

export const metadata = {
  title: 'Leaderboard | Tribe Rankings',
  description: 'September 2026 Event Leaderboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-900 text-white">{children}</body>
    </html>
  );
}
