# API Layer Patterns

## Axios Instance (`src/api/axios.ts`)
Single shared instance with baseURL = `NEXT_PUBLIC_API_BASE_URL` and JSON
content-type. Two interceptors:
1. **Request**: attaches `Authorization: Bearer <accessToken>` from localStorage.
2. **Response (401)**: subscriber-queue refresh. While a refresh is in flight,
   subsequent 401s queue and replay with the new token. Single retry per request.

Helpers exported from `axios.ts`:
- `getAccessToken()`, `getRefreshToken()`
- `setTokens(access, refresh)`
- `clearTokens()`

> Components/hooks must use these helpers — never touch `localStorage` directly.

## Resource Modules (`src/api/<resource>.ts`)
Pattern:
```ts
import api from './axios';
import type { Foo, FooListResponse } from '../types';

export async function listFoos(): Promise<FooListResponse> {
  const res = await api.get<FooListResponse>('/foos');
  return res.data;
}

export async function getFoo(id: string): Promise<Foo> {
  const res = await api.get<Foo>(`/foos/${id}`);
  return res.data;
}

export async function createFoo(input: CreateFooInput): Promise<Foo> {
  const res = await api.post<Foo>('/foos', input);
  return res.data;
}
```

One file per resource. Functions return the `data` payload, not the AxiosResponse.

## TanStack Query Hooks (`src/hooks/use<Resource>.ts`)
Wrap each API function in a hook:
```ts
export function useFoos() {
  return useQuery({
    queryKey: ['foos'],
    queryFn: listFoos,
  });
}

export function useCreateFoo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFoo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foos'] }),
  });
}
```

UI components import the hook, never the raw API function.

## SSE / Streaming
Use `src/api/sse.ts` and the existing `useChatStream` pattern for streaming
chat responses. Don't open `EventSource` directly in components.

## Error Handling
- 401 handled automatically in the interceptor.
- Other errors: surface at the call site via `sonner` toast.
- Don't bury errors in the interceptor — keep it focused on token refresh.
