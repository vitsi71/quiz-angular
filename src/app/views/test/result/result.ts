import { Component, OnInit, signal, WritableSignal} from '@angular/core';
import {TestService} from '../../../shared/services/test-service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../core/auth/auth-service';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {PassTestResponseType} from '../../../../types/pass-test-response.type';

@Component({
  selector: 'app-result',
  imports: [],
  templateUrl: './result.html',
  styleUrl: './result.scss',
})
export class Result implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
     private testService: TestService,private router:Router) {
  }

  result: string = '';
  testResult:WritableSignal<boolean>=signal<boolean>(false);
  testId:number|string = '';

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe(params => {
      const userInfo = this.authService.getUserInfo();
      if (userInfo) {
        if (params['id']) {
          this.testId=params['id'];
          this.testService.getResult(this.testId, userInfo.userId)
            .subscribe(result => {

              if (result) {
                // т.к. св-ва error нет в обоих типах, а проверить его надо, делаем утверждение, что (result имеет тип DefaultResponseType)
                if ((result as DefaultResponseType).error !== undefined) {
                  throw new Error((result as DefaultResponseType).message);
                }
                const score: number = (result as PassTestResponseType).score;
                const total: number = (result as PassTestResponseType).total;
                this.result = `${score}/${total}`;
                  this.testResult.set(score / total >= 0.8);
                }
              /////////////////////////////Принудительное обновление страницы///////////////////////
              // this.cd.markForCheck();
            })
        }
      }
    })
  }

  answers(){
    this.router.navigate(['answers',this.testId])
  }
}
