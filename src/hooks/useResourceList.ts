import { useState } from 'react';

export function useResourceList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const searchProps = {
    value: search,
    onChange: (v: string) => {
      setSearch(v);
      setPage(0);
    },
  };

  const isEmpty = <T>(items: T[], isLoading: boolean): boolean =>
    items.length === 0 && !isLoading;

  return {
    search,
    page,
    queryPage: page + 1,
    setPage,
    searchProps,
    isEmpty,
  };
}
