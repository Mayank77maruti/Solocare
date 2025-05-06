import Navbar from "@/components/PagesUi/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Navbar role="patient"/>
          <main className="container mx-auto p-4">
          {children}
          </main>
          </>
  );
}
