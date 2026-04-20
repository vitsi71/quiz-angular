import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {TestService} from '../../../shared/services/test-service';
import {QuizListType} from '../../../../types/quiz-list.type';
import {Observable, Subject, Subscription} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {AuthService} from '../../../core/auth/auth-service';
import {UserInfoType} from '../../../../types/user-info.type';
import {TestResultType} from '../../../../types/test-result.type';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {Router} from '@angular/router';

@Component({
  selector: 'app-choice',
  imports: [
    // AsyncPipe // для обновления страницы с HTML (2 вариант)
  ],
  templateUrl: './choice.html',
  styleUrl: './choice.scss',
})
export class Choice implements OnInit, OnDestroy {

  quizzes: QuizListType[] = [];
  // refreshList$:Subject<boolean>=new Subject();    // для обновления страницы с HTML (2 вариант)

  constructor(private testService: TestService, private authService: AuthService,
              private router: Router, private cd: ChangeDetectorRef) {
  }

  public getTests: Subscription | null = null;
  public UserResults: Subscription | null = null;
  ngOnInit() {
    this.getTests = this.testService.getTests()
      .subscribe((result: QuizListType[]) => {
        this.quizzes = result;

        const userInfo: UserInfoType | null = this.authService.getUserInfo();
        if (userInfo) {
         this.UserResults= this.testService.getUserResults(userInfo.userId)
            .subscribe((result: TestResultType[] | DefaultResponseType) => {
              if (result) {
                // т.к. св-ва error нет в обоих типах, а проверить его надо, делаем утверждение, что (result имеет тип DefaultResponseType)
                if ((result as DefaultResponseType).error !== undefined) {
                  throw new Error((result as DefaultResponseType).message);
                }
                // так же делаем утверждение типа для выбранного результата
                const testResult = result as TestResultType[];
                if (testResult) {
                  this.quizzes = this.quizzes.map(quiz => {
                    const foundItem: TestResultType | undefined = testResult.find((item: TestResultType): boolean => item.testId === quiz.id)
                    if (foundItem) {
                      quiz.result = foundItem.score + '/' + foundItem.total;
                    }
                    return quiz;
                  })
                }
              }
              //обновление страницы после исполнения вложенного запроса - (2 вариант)
              // this.refreshList$.next(true);

              /////////////////////////////Принудительное обновление страницы///////////////////////
              this.cd.markForCheck();
            })
        }
      });

  }

  ngOnDestroy() {
    this.getTests?.unsubscribe();
    this.UserResults?.unsubscribe();
  }

  chooseQuiz(id:number):void {

      this.router.navigate(['test', id]) ;

  }

}
