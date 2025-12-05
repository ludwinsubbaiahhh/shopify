import './globals.css';

export const metadata = {
  title: 'Shopify Insights Dashboard',
  description: 'Multi-tenant Shopify Data Ingestion & Insights Service',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

