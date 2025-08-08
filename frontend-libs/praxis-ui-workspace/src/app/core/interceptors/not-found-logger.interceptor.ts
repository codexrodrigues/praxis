import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const notFoundLoggerInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    tap({
      error: (err) => {
        if (err.status === 404) {
          console.warn(`Request to ${req.url} returned 404`);
        }
      },
    }),
  );
