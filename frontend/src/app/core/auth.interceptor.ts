import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'educa.token.v1';

/** Anexa o token emitido pela API Django em todas as requisições autenticadas. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (typeof localStorage === 'undefined') {
    return next(request);
  }

  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Token ${token}` },
    }),
  );
};

export { TOKEN_KEY };
