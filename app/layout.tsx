import type { Metadata } from "next";
import "./globals.css";
import { CustomCursor } from "./components/CustomCursor";

export const metadata: Metadata = {
  title: "UIUX × Vibe Coding 實戰課程",
  description: "提出好問題，永遠比給出答案更有強度。先學會思考，再善用工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
