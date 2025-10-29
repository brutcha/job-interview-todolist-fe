export interface URLHelpers {
  getCurrentUrl: () => string;
  setSearchParam: (key: string, value: string) => URL;
  replaceState: (url: URL) => void;
  getSearchParam: (key: string) => string | null;
}

export const createURLHelpers = (): URLHelpers => ({
  getCurrentUrl: () => window.location.href,
  setSearchParam: (key: string, value: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(key, value);
    return newUrl;
  },
  replaceState: (url: URL) => {
    window.history.replaceState(null, "", url);
  },
  getSearchParam: (key: string) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },
});

export const defaultURLHelpers = createURLHelpers();
