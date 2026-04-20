import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';
import {catchError, Observable, switchMap, throwError} from 'rxjs';
import {RefreshResponseType} from '../../../types/refresh-response.type';
import {Router} from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // в запросы в заголовок подставляем accessToken
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  const tokens: { accessToken: string | null, refreshToken: string | null } = authService.getTokens();
  if (tokens.accessToken) {
    const authReq = req.clone({
      headers: req.headers.set('x-access-token', tokens.accessToken)
    })
    // получаем ответ
    return next(authReq)
      // обрабатываем ответ на предмет получения ошибки 401
      .pipe(
        catchError((err: HttpErrorResponse) => {
          //ошибка не в запросе login(ошибка может быть в логине-пароле) и refresh(чтобы не зациклить)
          if (err.status === 401 && !authReq.url.includes('login') && !authReq.url.includes('refresh')) {
            return hendle401Error(authReq,next,authService,router);
          }
          return throwError((): HttpErrorResponse => err)
        })
      );
  }
  return next(req);
};


// token просрочен
const hendle401Error = (req: HttpRequest<any>, next: HttpHandlerFn,authService:AuthService,router: Router): Observable<HttpEvent<any>> => {
//запрашиваем новые через refresh
  return authService.refresh()
    .pipe(
      // полученный результат преобразуем в новый Observable объект
      switchMap((result: RefreshResponseType): Observable<HttpEvent<any>> => {
        if (result && !result.error && result.accessToken && result.refreshToken) {
          // обновляем токены в localStorage
          authService.setTokens(result.accessToken, result.refreshToken);
          // на основании входящих данных и нового accessToken меняем просроченные данные в заголовке
          const authReq = req.clone({
            headers: req.headers.set('x-access-token', result.accessToken)
          });
          // возвращаем преобразованный запрос
          return next(authReq);
        } else {
          return throwError(() => new Error('error'));
        }
      }),
      catchError(err => {
        authService.removeTokens();
        authService.removeUserInfo();
        authService.removeEmail();
        router.navigate(['']);
        return throwError(() => err);
      })
    );
}
