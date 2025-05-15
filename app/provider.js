"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import axios from "axios";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
    >
      <SWRConfig
        value={{
          fetcher: (url) => axios.get(url).then((res) => res.data),
          revalidateOnFocus: false,
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
}
